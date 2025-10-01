package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.OrderRepository;
import com.ecommerce.ecommerce.repository.OrderItemRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.repository.ProductRepository;
import com.ecommerce.ecommerce.repository.DiscountCouponRepository;
import com.ecommerce.ecommerce.dto.ShippingAddressDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final DiscountCouponRepository couponRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        UserRepository userRepository, ProductRepository productRepository,
                        DiscountCouponRepository couponRepository, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.emailService = emailService;
    }

    public Order createOrder(Long userId, List<OrderItem> orderItems, ShippingAddressDto shippingAddressDto, String couponCode)
    {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        Address shippingAddress = new Address(
                shippingAddressDto.getStreet(),
                shippingAddressDto.getCity(),
                shippingAddressDto.getState(),
                shippingAddressDto.getZipCode(),
                shippingAddressDto.getCountry()
        );
        order.setShippingAddress(shippingAddress);
        order.setShippingPhoneNumber(shippingAddressDto.getPhoneNumber());
        order.setOrderDate(LocalDateTime.now());
        order.setDeliveredDate(LocalDate.now().plusDays(5).atStartOfDay());


        // Calculate totals
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItem item : orderItems) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            item.setUnitPrice(product.getPrice());
            item.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            item.setOrder(order);
            totalAmount = totalAmount.add(item.getTotalPrice());
        }

        order.setTotalAmount(totalAmount);
        order.setShippingAmount(calculateShipping(totalAmount));

        // Apply discount if coupon provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (couponCode != null && !couponCode.isEmpty()) {
            DiscountCoupon coupon = couponRepository.findByCode(couponCode)
                    .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

            if (!isCouponValid(coupon, user)) {
                throw new RuntimeException("Coupon is not valid for this order");
            }

            discountAmount = calculateDiscount(totalAmount, coupon);
            order.setDiscountAmount(discountAmount);
            order.setDiscountCoupon(coupon);
        }

        BigDecimal finalAmount = totalAmount.add(order.getShippingAmount()).subtract(discountAmount);
        order.setFinalAmount(finalAmount);

        Order savedOrder = orderRepository.save(order);

        // Save order items
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);

            // Update product stock
            updateProductStock(item.getProduct().getId(), item.getQuantity());
        }

        // Send order confirmation email
        // ✅ CORRECT:
        emailService.sendOrderConfirmation(
                user.getEmail(),           // to (email address)
                user.getFirstName(),       // userName
                savedOrder.getOrderNumber(), // orderNumber
                finalAmount.doubleValue(), // totalAmount
                null                       // trackingNumber (can be null)
        );

        return savedOrder;
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = getOrderById(orderId);
        order.setStatus(newStatus);

        if (newStatus == OrderStatus.SHIPPED) {
            order.setShippedDate(LocalDateTime.now());
            // send shipped email
            emailService.sendShippingUpdate(
                    order.getUser().getEmail(),              // to
                    order.getUser().getFirstName(),          // userName
                    order.getOrderNumber(),                  // orderNumber
                    order.getStatus().name(),                // status
                    "https://tracking.example.com/" + order.getId(),  // tracking link
                    "3-5 business days"            // estimated delivery date (String or LocalDate.toString())
            );
        } else if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredDate(LocalDateTime.now());
            releaseEscrowPayment(orderId);
            // notify admin
            emailService.sendAdminNotification(
                    "admin@store.com",
                    "Order Delivered",
                    "Order " + order.getOrderNumber() + " has been delivered successfully."
            );
        }

        return orderRepository.save(order);
    }


    public Order cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel order that has been shipped or delivered");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore product stock
        for (OrderItem item : order.getOrderItems()) {
            restoreProductStock(item.getProduct().getId(), item.getQuantity());
        }

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByOrderDateBetween(startDate, endDate);
    }

    public BigDecimal getRevenueBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal revenue = orderRepository.getRevenueBetweenDates(startDate, endDate);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    private String generateOrderNumber() {
        return "ORD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BigDecimal calculateShipping(BigDecimal totalAmount) {
        // Free shipping for orders over $50
        if (totalAmount.compareTo(new BigDecimal("50")) >= 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal("5.99"); // Standard shipping fee
    }

    private BigDecimal calculateDiscount(BigDecimal totalAmount, DiscountCoupon coupon) {
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            return totalAmount.multiply(coupon.getDiscountValue().divide(new BigDecimal(100)));
        } else {
            return coupon.getDiscountValue().min(totalAmount);
        }
    }

    private boolean isCouponValid(DiscountCoupon coupon, User user) {
        if (!coupon.isActive()) return false;
        if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) return false;
        if (coupon.isForNewUsers() && !isNewUser(user)) return false;
        return true;
    }

    private boolean isNewUser(User user) {
        Long orderCount = orderRepository.countByUserIdAndStatus(user.getId(), OrderStatus.DELIVERED);
        return orderCount == 0;
    }

    private void updateProductStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() - quantity);
        if (product.getStockQuantity() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }
        productRepository.save(product);
    }

    private void restoreProductStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() + quantity);
        if (product.getStockQuantity() > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        productRepository.save(product);
    }

    private void releaseEscrowPayment(Long orderId) {
        // Implementation for escrow release
        // This would interact with the PaymentService
    }
}
