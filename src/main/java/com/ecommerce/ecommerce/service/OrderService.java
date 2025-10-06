package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.*;
import com.ecommerce.ecommerce.dto.ShippingAddressDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final DiscountCouponRepository couponRepository;
    private final EmailService emailService;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;


    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        UserRepository userRepository, ProductRepository productRepository,
                        DiscountCouponRepository couponRepository, EmailService emailService, CartRepository cartRepository, CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.emailService = emailService;
        this.cartRepository = cartRepository;
        this.cartItemRepository=cartItemRepository;
    }
    @Transactional
    public Order createOrder(Long userId, List<OrderItem> orderItems,
                             ShippingAddressDto shippingAddressDto, String couponCode) {

        // ✅ 1. Fetch the user and their cart
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user"));

        // ✅ 2. Create base order
        Order order = new Order();
        order.setUser(user);

        // ✅ Assign the seller (based on the first product in the order)
        if (!orderItems.isEmpty()) {
            Product firstProduct = productRepository.findById(orderItems.get(0).getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            order.setSeller(firstProduct.getSeller());
        }

        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setDeliveredDate(LocalDate.now().plusDays(5).atStartOfDay());

        Address shippingAddress = new Address(
                shippingAddressDto.getStreet(),
                shippingAddressDto.getCity(),
                shippingAddressDto.getState(),
                shippingAddressDto.getZipCode(),
                shippingAddressDto.getCountry()
        );
        order.setShippingAddress(shippingAddress);
        order.setShippingPhoneNumber(shippingAddressDto.getPhoneNumber());

        // ✅ 3. Validate and calculate totals
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItem item : orderItems) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // ✅ Check if product exists in user's cart
            Optional<CartItem> cartItemOpt =
                    cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

            if (cartItemOpt.isEmpty()) {
                throw new RuntimeException("Product " + product.getName() +
                        " must be added to your cart before ordering.");
            }

            CartItem cartItem = cartItemOpt.get();

            // ✅ Ensure requested quantity <= quantity in cart
            if (item.getQuantity() > cartItem.getQuantity()) {
                throw new RuntimeException("You only have " + cartItem.getQuantity() +
                        " units of " + product.getName() + " in your cart.");
            }

            // ✅ Ensure enough stock
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // ✅ Set order item details
            item.setUnitPrice(product.getPrice());
            item.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            item.setOrder(order);
            totalAmount = totalAmount.add(item.getTotalPrice());
        }

        order.setTotalAmount(totalAmount);
        order.setShippingAmount(calculateShipping(totalAmount));

        // ✅ 4. Apply discount if available
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

        // ✅ 5. Compute final amount
        BigDecimal finalAmount = totalAmount.add(order.getShippingAmount()).subtract(discountAmount);
        order.setFinalAmount(finalAmount);

        // ✅ 6. Save order and items
        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);

            // ✅ Update stock quantity after order
            updateProductStock(item.getProduct().getId(), item.getQuantity());
        }

        // ✅ 7. Remove ordered items from cart
        for (OrderItem item : orderItems) {
            cartItemRepository.deleteByCartIdAndProductId(cart.getId(), item.getProduct().getId());
        }

        // ✅ Recalculate cart totals after clearing items
        List<CartItem> remainingItems = cartItemRepository.findByCartId(cart.getId());
        BigDecimal newTotal = remainingItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalPrice(newTotal);
        cart.setItemCount(remainingItems.stream().mapToInt(CartItem::getQuantity).sum());
        cartRepository.save(cart);

        // ✅ 8. Send order confirmation email
        emailService.sendOrderConfirmation(
                user.getEmail(),
                user.getFirstName(),
                savedOrder.getOrderNumber(),
                finalAmount.doubleValue(),
                null
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

        // ✅ Check payment status before allowing SHIPPED
        if (newStatus == OrderStatus.SHIPPED) {
            if (order.getPaymentStatus() != PaymentStatus.COMPLETED) {
                throw new RuntimeException(
                        "Order cannot be marked as SHIPPED until payment is COMPLETED."
                );
            }
            order.setShippedDate(LocalDateTime.now());

            // send shipped email
            emailService.sendShippingUpdate(
                    order.getUser().getEmail(),
                    order.getUser().getFirstName(),
                    order.getOrderNumber(),
                    order.getStatus().name(),
                    "https://tracking.example.com/" + order.getId(),
                    "3-5 business days"
            );
        }
        else if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredDate(LocalDateTime.now());
            releaseEscrowPayment(orderId);

            // notify admin
            emailService.sendAdminNotification(
                    "admin@store.com",
                    "Order Delivered",
                    "Order " + order.getOrderNumber() + " has been delivered successfully."
            );
        }

        order.setStatus(newStatus);
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
