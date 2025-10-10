package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.*;
import com.ecommerce.ecommerce.dto.ShippingAddressDto;
import org.springframework.beans.factory.annotation.Autowired;
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
    @Autowired
    private SellerOrderRepository sellerOrderRepository;


    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        UserRepository userRepository, ProductRepository productRepository,
                        DiscountCouponRepository couponRepository, EmailService emailService,
                        CartRepository cartRepository, CartItemRepository cartItemRepository,SellerOrderRepository sellerOrderRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.emailService = emailService;
        this.cartRepository = cartRepository;
        this.cartItemRepository=cartItemRepository;
        this.sellerOrderRepository = sellerOrderRepository;
    }
    @Transactional
    public Order createOrder(Long userId, List<OrderItem> orderItems,
                             ShippingAddressDto shippingAddressDto, String couponCode) {

        // 1️⃣ Fetch user and cart
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user"));

        // 2️⃣ Create main order
        Order order = new Order();
        order.setUser(user);
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

        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<User, List<OrderItem>> sellerOrderMap = new HashMap<>();

        // 3️⃣ Validate & prepare order items
        List<OrderItem> preparedItems = new ArrayList<>();
        List<CartItem> purchasedCartItems = new ArrayList<>(); // ✅ track only purchased items

        for (OrderItem item : orderItems) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            Optional<CartItem> cartItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
            if (cartItemOpt.isEmpty()) {
                throw new RuntimeException("Product " + product.getName() + " is not in the cart.");
            }

            CartItem cartItem = cartItemOpt.get();
            if (item.getQuantity() > cartItem.getQuantity()) {
                throw new RuntimeException("You only have " + cartItem.getQuantity() +
                        " units of " + product.getName() + " in your cart.");
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // ✅ Build a fresh OrderItem (no direct link to CartItem)
            OrderItem newItem = new OrderItem();
            newItem.setProduct(product);
            newItem.setQuantity(item.getQuantity());
            newItem.setUnitPrice(product.getPrice());
            newItem.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            newItem.setOrder(order);

            totalAmount = totalAmount.add(newItem.getTotalPrice());

            // Group by seller
            sellerOrderMap.computeIfAbsent(product.getSeller(), s -> new ArrayList<>()).add(newItem);

            // Update stock
            updateProductStock(product.getId(), item.getQuantity());

            preparedItems.add(newItem);
            purchasedCartItems.add(cartItem); // ✅ track purchased cart items
        }

        // 4️⃣ Set order totals
        order.setTotalAmount(totalAmount);
        order.setShippingAmount(calculateShipping(totalAmount));
        order.setFinalAmount(totalAmount.add(order.getShippingAmount()));

        // Save main order
        Order savedOrder = orderRepository.save(order);

        // 5️⃣ Create SellerOrders per seller
        for (Map.Entry<User, List<OrderItem>> entry : sellerOrderMap.entrySet()) {
            User seller = entry.getKey();
            List<OrderItem> sellerItems = entry.getValue();

            SellerOrder sellerOrder = new SellerOrder();
            sellerOrder.setOrder(savedOrder);
            sellerOrder.setSeller(seller);
            sellerOrder.setStatus(SellerOrderStatus.PENDING);

            BigDecimal sellerTotal = sellerItems.stream()
                    .map(OrderItem::getTotalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            sellerOrder.setSubtotal(sellerTotal);

            SellerOrder savedSellerOrder = sellerOrderRepository.save(sellerOrder);

            // ✅ Link each OrderItem to its SellerOrder
            for (OrderItem sellerItem : sellerItems) {
                sellerItem.setSellerOrder(savedSellerOrder);
            }

            orderItemRepository.saveAll(sellerItems);
        }

        // 6️⃣ Delete only purchased items (safe deletion)
        for (CartItem purchasedItem : purchasedCartItems) {
            cartItemRepository.delete(purchasedItem);
        }

        // 7️⃣ Update cart totals after deletion
        List<CartItem> remainingItems = cartItemRepository.findByCartId(cart.getId());
        BigDecimal newTotal = remainingItems.stream()
                .map(ci -> ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setTotalPrice(newTotal);
        cart.setItemCount(remainingItems.size());
        cartRepository.save(cart);

        // 8️⃣ Send confirmation email
        emailService.sendOrderConfirmation(
                user.getEmail(),
                user.getFirstName(),
                savedOrder.getOrderNumber(),
                savedOrder.getFinalAmount().doubleValue(),
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
