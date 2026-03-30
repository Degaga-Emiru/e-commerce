package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.*;
import com.ecommerce.ecommerce.dto.ShippingAddressDto;
import com.ecommerce.ecommerce.dto.SellerOrderDto;
import com.ecommerce.ecommerce.dto.UserDto;
import java.util.stream.Collectors;
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
    private final AddressRepository addressRepository;
    private final ProductVariantRepository variantRepository;


    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        UserRepository userRepository, ProductRepository productRepository,
                        DiscountCouponRepository couponRepository, EmailService emailService,
                        CartRepository cartRepository, CartItemRepository cartItemRepository,
                        SellerOrderRepository sellerOrderRepository, DemoBankService demoBankService,
                        PaymentRepository paymentRepository, ShippingService shippingService,
                        ShippingRepository shippingRepository,
                        EscrowService escrowService, EscrowRepository escrowRepository,
                        AddressRepository addressRepository,
                        ProductVariantRepository variantRepository) {
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
        this.addressRepository = addressRepository;
        this.variantRepository = variantRepository;
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

        if (shippingAddressDto.getAddressId() != null) {
            Address existingAddress = addressRepository.findById(shippingAddressDto.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shipping Address not found"));
            order.setShippingAddress(existingAddress);
        } else {
            Address newAddress = new Address(
                    shippingAddressDto.getStreet(),
                    shippingAddressDto.getCity(),
                    shippingAddressDto.getState(),
                    shippingAddressDto.getZipCode(),
                    shippingAddressDto.getCountry(),
                    shippingAddressDto.getPhoneNumber(),
                    user
            );
            newAddress = addressRepository.save(newAddress);
            order.setShippingAddress(newAddress);
        }

        // Snapshot address details directly in Order table
        order.setShippingRecipientName(shippingAddressDto.getRecipientName());
        order.setShippingStreet(shippingAddressDto.getStreet());
        order.setShippingCity(shippingAddressDto.getCity());
        order.setShippingState(shippingAddressDto.getState());
        order.setShippingZipCode(shippingAddressDto.getZipCode());
        order.setShippingCountry(shippingAddressDto.getCountry());
        order.setShippingPhoneNumber(shippingAddressDto.getPhoneNumber());

        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<Long, List<OrderItem>> sellerOrderMap = new HashMap<>();

        // 3️⃣ Validate & prepare order items
        List<OrderItem> preparedItems = new ArrayList<>();
        List<CartItem> purchasedCartItems = new ArrayList<>(); // ✅ track only purchased items

        for (OrderItem item : orderItems) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            Long variantId = item.getVariant() != null ? item.getVariant().getId() : null;
            ProductVariant variant = null;
            if (variantId != null) {
                variant = variantRepository.findById(variantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Variant not found with id: " + variantId));
            }

            Optional<CartItem> cartItemOpt = cartItemRepository.findByCartIdAndProductIdAndVariantId(cart.getId(), product.getId(), variantId);
            if (cartItemOpt.isEmpty()) {
                throw new RuntimeException("Product " + product.getName() + (variant != null ? " (" + variant.getSize() + "/" + variant.getColor() + ")" : "") + " is not in the cart.");
            }

            CartItem cartItem = cartItemOpt.get();
            if (item.getQuantity() > cartItem.getQuantity()) {
                throw new RuntimeException("You only have " + cartItem.getQuantity() +
                        " units of this item in your cart.");
            }

            int availableStock = (variant != null) ? variant.getStockQuantity() : product.getStockQuantity();
            if (availableStock < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }

            // ✅ Build a fresh OrderItem
            OrderItem newItem = new OrderItem();
            newItem.setProduct(product);
            newItem.setVariant(variant);
            newItem.setQuantity(item.getQuantity());
            BigDecimal unitPrice = (variant != null && variant.getPrice() != null) ? variant.getPrice() : product.getPrice();
            newItem.setUnitPrice(unitPrice);
            newItem.setTotalPrice(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
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
            updateProductStock(product.getId(), variantId, item.getQuantity());

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

            // Calculate commission (10%) and payout (90%)
            BigDecimal commission = sellerTotal.multiply(new BigDecimal("0.10"));
            BigDecimal payout = sellerTotal.subtract(commission);
            sellerOrder.setCommissionAmount(commission);
            sellerOrder.setPayoutAmount(payout);

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
            escrowService.releaseEscrow(orderId);

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
            restoreProductStock(item.getProduct().getId(), item.getVariant() != null ? item.getVariant().getId() : null, item.getQuantity());
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

    private void updateProductStock(Long productId, Long variantId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (variantId != null) {
            ProductVariant variant = variantRepository.findById(variantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
            variant.setStockQuantity(variant.getStockQuantity() - quantity);
            variantRepository.save(variant);
            
            // Also update total product stock
            product.setStockQuantity(product.getVariants().stream().mapToInt(ProductVariant::getStockQuantity).sum());
        } else {
            product.setStockQuantity(product.getStockQuantity() - quantity);
        }

        if (product.getStockQuantity() <= 0) {
            product.setStockQuantity(0);
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }

        productRepository.save(product);

        // Send alert if stock is low (e.g., < 5)
        if (product.getStockQuantity() < 5 && product.getSeller() != null) {
            emailService.sendLowStockAlert(
                product.getSeller().getEmail(),
                product.getSeller().getFirstName(),
                product.getName(),
                product.getStockQuantity()
            );
        }
    }

    private void restoreProductStock(Long productId, Long variantId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (variantId != null) {
            ProductVariant variant = variantRepository.findById(variantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
            variant.setStockQuantity(variant.getStockQuantity() + quantity);
            variantRepository.save(variant);
            product.setStockQuantity(product.getVariants().stream().mapToInt(ProductVariant::getStockQuantity).sum());
        } else {
            product.setStockQuantity(product.getStockQuantity() + quantity);
        }
        
        if (product.getStockQuantity() > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        productRepository.save(product);
    }
    public List<SellerOrderDto> getOrdersBySeller(Long sellerId) {
        List<SellerOrder> orders = sellerOrderRepository.findBySellerId(sellerId);
        return orders.stream().map(this::mapToSellerOrderDto).collect(Collectors.toList());
    }

    private SellerOrderDto mapToSellerOrderDto(SellerOrder so) {
        SellerOrderDto dto = new SellerOrderDto();
        dto.setId(so.getId());
        dto.setSubtotal(so.getSubtotal());
        dto.setCommissionAmount(so.getCommissionAmount());
        dto.setPayoutAmount(so.getPayoutAmount());
        dto.setStatus(so.getStatus().name());
        dto.setItems(so.getItems());

        if (so.getOrder() != null) {
            dto.setOrderNumber(so.getOrder().getOrderNumber());
            dto.setOrderDate(so.getOrder().getOrderDate());
            
            User customer = so.getOrder().getUser();
            if (customer != null) {
                UserDto userDto = new UserDto();
                userDto.setId(customer.getId());
                userDto.setFirstName(customer.getFirstName());
                userDto.setLastName(customer.getLastName());
                userDto.setEmail(customer.getEmail());
                userDto.setPhoneNumber(customer.getPhoneNumber());
                dto.setUser(userDto);
            }
        }
        return dto;
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
