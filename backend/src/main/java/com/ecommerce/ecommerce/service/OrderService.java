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
    private final DemoBankService demoBankService;
    private final PaymentRepository paymentRepository;
    private final ShippingService shippingService;
    private final ShippingRepository shippingRepository;
    private final EscrowService escrowService;
    private final EscrowRepository escrowRepository;


    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        UserRepository userRepository, ProductRepository productRepository,
                        DiscountCouponRepository couponRepository, EmailService emailService,
                        CartRepository cartRepository, CartItemRepository cartItemRepository,
                        SellerOrderRepository sellerOrderRepository, DemoBankService demoBankService,
                        PaymentRepository paymentRepository, ShippingService shippingService,
                        ShippingRepository shippingRepository,
                        EscrowService escrowService, EscrowRepository escrowRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.emailService = emailService;
        this.cartRepository = cartRepository;
        this.cartItemRepository=cartItemRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.demoBankService = demoBankService;
        this.paymentRepository = paymentRepository;
        this.shippingService = shippingService;
        this.shippingRepository = shippingRepository;
        this.escrowService = escrowService;
        this.escrowRepository = escrowRepository;
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
                shippingAddressDto.getCountry(),
                shippingAddressDto.getPhoneNumber(),
                user
        );
        order.setShippingAddress(shippingAddress);
        order.setShippingPhoneNumber(shippingAddressDto.getPhoneNumber());

        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<Long, List<OrderItem>> sellerOrderMap = new HashMap<>();

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
            User seller = product.getSeller();
            if (seller == null) {
                // 🛡️ Fallback: Assign first Admin if product is missing a seller
                seller = userRepository.findByRole(UserRole.ADMIN).stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("Product " + product.getName() + " has no seller and no Admin fallback found."));
                product.setSeller(seller);
                productRepository.save(product);
                System.out.println("⚠️ Warning: Product " + product.getId() + " was missing a seller. Assigned Admin as fallback.");
            }
            sellerOrderMap.computeIfAbsent(seller.getId(), s -> new ArrayList<>()).add(newItem);

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
        order.setOrderItems(preparedItems); // Ensure the list is set
        Order savedOrder = orderRepository.save(order);

        // 5️⃣ Create SellerOrders per seller
        for (Map.Entry<Long, List<OrderItem>> entry : sellerOrderMap.entrySet()) {
            Long sellerId = entry.getKey();
            User seller = userRepository.findById(sellerId).orElseThrow();
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
        
        // 9️⃣ Initialize Shipping and Escrow
        shippingService.createShipping(savedOrder);
        escrowService.createEscrow(savedOrder);

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
        return orderRepository.findUserOrdersByDateDesc(userId);
    }

    public List<Order> getUserOrdersByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return orderRepository.findUserOrdersByDateDesc(user.getId());
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
            try {
                emailService.sendAdminNotification(
                        "Order Delivered: #" + order.getOrderNumber(),
                        "Order " + order.getOrderNumber() + " has been delivered successfully.",
                        "#10b981"
                );
            } catch (Exception ignored) {}
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // Update Shipping Status accordingly
        ShippingStatus shippingStatus = mapOrderStatusToShippingStatus(newStatus);
        if (shippingStatus != null) {
            shippingService.updateShippingStatus(orderId, shippingStatus, null, null, "Order status updated to " + newStatus, "SYSTEM");
        }

        return savedOrder;
    }

    private ShippingStatus mapOrderStatusToShippingStatus(OrderStatus orderStatus) {
        return switch (orderStatus) {
            case PENDING -> ShippingStatus.PENDING;
            case PROCESSING -> ShippingStatus.PROCESSING;
            case SHIPPED -> ShippingStatus.SHIPPED;
            case DELIVERED -> ShippingStatus.DELIVERED;
            case CANCELLED -> ShippingStatus.CANCELLED;
            default -> null;
        };
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
        
        int newStock = product.getStockQuantity() - quantity;
        product.setStockQuantity(newStock);

        if (newStock <= 0) {
            product.setStockQuantity(0);
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }

        productRepository.save(product);

        // Send alert if stock is low (e.g., < 5)
        if (newStock < 5 && product.getSeller() != null) {
            emailService.sendLowStockAlert(
                product.getSeller().getEmail(),
                product.getSeller().getFirstName(),
                product.getName(),
                newStock
            );
        }
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
    public void releaseEscrowPayment(Long orderId) {
        // 1️⃣ Fetch the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // 2️⃣ Fetch the Payment associated with this order
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));

        if (payment.getEscrowReleased()) {
             System.out.println("Funds already released for order: " + order.getOrderNumber());
             return;
        }

        // 3️⃣ Get all SellerOrders for this order
        List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(orderId);
        if (sellerOrders.isEmpty()) {
            throw new IllegalStateException("No seller orders found for order: " + order.getOrderNumber());
        }

        // 4️⃣ Release funds to each seller
        for (SellerOrder sellerOrder : sellerOrders) {
            if (sellerOrder.getStatus() == SellerOrderStatus.PAYOUT_RELEASED) {
                continue;
            }

            User seller = sellerOrder.getSeller();
            BigDecimal amountToRelease = sellerOrder.getSubtotal();

            if (seller.getBankAccount() == null) {
                throw new IllegalStateException("Seller " + seller.getEmail() + " has no bank account configured");
            }

            String sellerAccountNumber = seller.getBankAccount().getAccountNumber();
            
            // Call DemoBankService to release funds (10% commission handled therein)
            demoBankService.releaseFundsToSeller(sellerAccountNumber, amountToRelease);

            // Update SellerOrder status
            sellerOrder.setStatus(SellerOrderStatus.PAYOUT_RELEASED);
            sellerOrderRepository.save(sellerOrder);

            System.out.println("Released " + amountToRelease + " to seller " + seller.getEmail());
        }

        // 5️⃣ Update main Payment status
        payment.setEscrowReleased(true);
        payment.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);
        
        // Update order payment status
        order.setPaymentStatus(PaymentStatus.COMPLETED);
        orderRepository.save(order);
    }

    public List<Order> getOrdersBySeller(Long sellerId) {
        return orderRepository.findOrdersBySellerId(sellerId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = getOrderById(orderId);
        
        // 1. Delete associated records
        shippingRepository.deleteByOrderId(orderId);
        escrowRepository.deleteByOrderId(orderId);
        paymentRepository.deleteByOrderId(orderId);
        sellerOrderRepository.deleteByOrderId(orderId);
        
        // 2. OrderItems are cascaded by Order entity, but we can be explicit
        orderItemRepository.deleteAll(order.getOrderItems());
        
        // 3. Delete the order
        orderRepository.delete(order);
    }
}
