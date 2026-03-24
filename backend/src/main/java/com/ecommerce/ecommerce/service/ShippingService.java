package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class ShippingService {

    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final EscrowService escrowService;
    private final ShippingHistoryService shippingHistoryService;

    @PersistenceContext
    private EntityManager entityManager;

    public ShippingService(ShippingRepository shippingRepository, 
                           OrderRepository orderRepository,
                           NotificationService notificationService,
                           EmailService emailService,
                           EscrowService escrowService,
                           ShippingHistoryService shippingHistoryService) {
        this.shippingRepository = shippingRepository;
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.escrowService = escrowService;
        this.shippingHistoryService = shippingHistoryService;
    }

    public Shipping createShipping(Order order) {
        Shipping shipping = new Shipping(order);
        shipping.setStatus(ShippingStatus.PENDING);
        Shipping saved = shippingRepository.save(shipping);
        
        // Log initial state
        shippingHistoryService.logHistory(saved, ShippingStatus.PENDING, "SYSTEM", "Shipping record created.");
        
        return saved;
    }

    public Shipping getShippingByOrderId(Long orderId) {
        return shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping record not found for order: " + orderId));
    }

    @Transactional
    public Shipping updateShippingStatus(Long orderId, ShippingStatus newStatus, String carrier, String trackingNumber, String note, String updatedBy) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Order order = orderRepository.findById(orderId)
                            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
                    return new Shipping(order);
                });

        ShippingStatus oldStatus = shipping.getStatus();
        if (oldStatus == newStatus) return shipping;

        shipping.setStatus(newStatus);
        if (carrier != null) shipping.setCarrier(carrier);
        if (trackingNumber != null) shipping.setTrackingNumber(trackingNumber);
        shipping.setUpdatedAt(LocalDateTime.now());

        Shipping saved = shippingRepository.save(shipping);

        // Log History
        shippingHistoryService.logHistory(saved, newStatus, updatedBy, note);

        // Update Order status
        Order order = shipping.getOrder();
        
        String notifType = "SHIPPING";
        String userName = order.getUser().getFirstName();
        String orderNo = order.getOrderNumber();
        String userEmail = order.getUser().getEmail();

        switch (newStatus) {
            case PROCESSING:
                order.setStatus(OrderStatus.PROCESSING);
                notificationService.createNotification(order.getUser(), "Processing Order 📦", "Your order #" + orderNo + " is being processed.", notifType);
                break;
            case SHIPPED:
                order.setStatus(OrderStatus.SHIPPED);
                order.setShippedDate(LocalDateTime.now());
                notificationService.createNotification(order.getUser(), "Order Shipped 🚚", "Your order #" + orderNo + " has been shipped!", notifType);
                emailService.sendShippingUpdate(userEmail, userName, orderNo, "SHIPPED", saved.getTrackingNumber(), "3-5 business days");
                break;
            case OUT_FOR_DELIVERY:
                notificationService.createNotification(order.getUser(), "Out for Delivery 🛵", "Your order #" + orderNo + " is out for delivery!", notifType);
                emailService.sendOutForDelivery(userEmail, userName, orderNo);
                break;
            case DELIVERED:
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveredDate(LocalDateTime.now());
                notificationService.createNotification(order.getUser(), "Order Delivered ✅", "Your order #" + orderNo + " has been delivered!", notifType);
                emailService.sendOrderDelivered(userEmail, userName, orderNo);
                
                // TRIGGER ESCROW RELEASE
                escrowService.releaseEscrow(orderId);
                break;
            case CANCELLED:
                order.setStatus(OrderStatus.CANCELLED);
                notificationService.createNotification(order.getUser(), "Order Cancelled ❌", "Your order #" + orderNo + " has been cancelled.", notifType);
                
                // TRIGGER ESCROW REFUND
                escrowService.refundEscrow(orderId);
                break;
            default:
                break;
        }

        orderRepository.save(order);
        return saved;
    }

    public Object getShippingHistory(Long shippingId) {
        return shippingHistoryService.getTrackingHistory(shippingId);
    }

    @Transactional
    public void syncDatabase() {
        try {
            // Drop the constraint if it exists to allow new Enum values added after DB was initialized
            // This is common when 'hbm2ddl.auto=update' is used but it doesn't update legacy constraints.
            entityManager.createNativeQuery("ALTER TABLE shipping DROP CONSTRAINT IF EXISTS shipping_status_check").executeUpdate();
            System.out.println("✅ Database Sync: Dropped shipping_status_check constraint.");
        } catch (Exception e) {
            System.err.println("❌ Database Sync Failed: " + e.getMessage());
        }
    }
}
