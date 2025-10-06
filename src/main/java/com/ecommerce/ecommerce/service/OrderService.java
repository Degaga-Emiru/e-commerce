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


    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        UserRepository userRepository, ProductRepository productRepository,
                        DiscountCouponRepository couponRepository, EmailService emailService, CartRepository cartRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.emailService = emailService;
        this.cartRepository = cartRepository;
    }
    @Transactional
    public List<Order> createOrder(Long userId, List<OrderItem> orderItems,
                                   ShippingAddressDto shippingAddressDto, String couponCode) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user"));

        // ✅ Group order items by seller
        Map<User, List<OrderItem>> itemsBySeller = new HashMap<>();
        for (OrderItem item : orderItems) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // ✅ Validate that product exists in cart
            CartItem cartItem = cart.getCartItems().stream()
                    .filter(ci -> ci.getProduct().getId().equals(product.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException(
                            "Product " + product.getName() + " is not in the cart"
                    ));

            // ✅ Validate quantity
            if (item.getQuantity() > cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Requested quantity for product " + product.getName() +
                                " exceeds cart quantity (" + cartItem.getQuantity() + ")"
                );
            }

            item.setUnitPrice(product.getPrice());
            item.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            item.setProduct(product);

            // Group by seller
            itemsBySeller.computeIfAbsent(product.getSeller(), k -> new ArrayList<>()).add(item);
        }

        List<Order> createdOrders = new ArrayList<>();

        // ✅ Create one order per seller
        for (Map.Entry<User, List<OrderItem>> entry : itemsBySeller.entrySet()) {
            User seller = entry.getKey();
            List<OrderItem> sellerItems = entry.getValue();

            Order order = new Order();
            order.setUser(user); // buyer
            order.setSeller(seller);
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

            // 🧮 Calculate totals
            BigDecimal totalAmount = sellerItems.stream()
                    .map(OrderItem::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            order.setTotalAmount(totalAmount);
            order.setShippingAmount(calculateShipping(totalAmount));

            // Apply coupon if provided
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

            // Save order items and update stock
            for (OrderItem item : sellerItems) {
                item.setOrder(savedOrder);
                orderItemRepository.save(item);
                updateProductStock(item.getProduct().getId(), item.getQuantity());

                // ✅ Reduce quantity in cart
                CartItem cartItem = cart.getCartItems().stream()
                        .filter(ci -> ci.getProduct().getId().equals(item.getProduct().getId()))
                        .findFirst().get();

                cartItem.setQuantity(cartItem.getQuantity() - item.getQuantity());
                if (cartItem.getQuantity() <= 0) {
                    cart.getCartItems().remove(cartItem);
                }
            }

            createdOrders.add(savedOrder);

            // Send confirmation email per order
            emailService.sendOrderConfirmation(
                    user.getEmail(),
                    user.getFirstName(),
                    savedOrder.getOrderNumber(),
                    finalAmount.doubleValue(),
                    null
            );
        }

        cartRepository.save(cart);
        return createdOrders;
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
