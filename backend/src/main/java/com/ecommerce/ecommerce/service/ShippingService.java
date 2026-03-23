package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ShippingService {

    private final ShippingRepository shippingRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public ShippingService(ShippingRepository shippingRepository, OrderRepository orderRepository,
                           NotificationService notificationService) {
        this.shippingRepository = shippingRepository;
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
    }

    public Shipping createShipping(Order order) {
        Shipping shipping = new Shipping(order);
        return shippingRepository.save(shipping);
    }

    public Shipping getShippingByOrderId(Long orderId) {
        return shippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipping record not found for order: " + orderId));
    }

    public Shipping updateShippingStatus(Long orderId, ShippingStatus newStatus, String carrier, String trackingNumber) {
        Shipping shipping = shippingRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Order order = orderRepository.findById(orderId)
                            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
                    return new Shipping(order);
                });

        shipping.setStatus(newStatus);
        if (carrier != null) shipping.setCarrier(carrier);
        if (trackingNumber != null) shipping.setTrackingNumber(trackingNumber);

        Shipping saved = shippingRepository.save(shipping);

        // Update order status and notify user
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        String notifTitle, notifMessage;
        switch (newStatus) {
            case SHIPPED:
                order.setStatus(OrderStatus.SHIPPED);
                notifTitle = "Your order has shipped!";
                notifMessage = "Order #" + order.getOrderNumber() + " is on its way." +
                        (trackingNumber != null ? " Tracking: " + trackingNumber : "");
                break;
            case OUT_FOR_DELIVERY:
                notifTitle = "Out for delivery!";
                notifMessage = "Order #" + order.getOrderNumber() + " is out for delivery today.";
                break;
            case DELIVERED:
                order.setStatus(OrderStatus.DELIVERED);
                notifTitle = "Order Delivered!";
                notifMessage = "Order #" + order.getOrderNumber() + " has been delivered. Please confirm receipt and leave a review.";
                break;
            default:
                notifTitle = "Order Update";
                notifMessage = "Your order #" + order.getOrderNumber() + " status: " + newStatus;
        }

        orderRepository.save(order);
        notificationService.sendNotification(order.getUser().getId(), notifTitle, notifMessage, "SHIPPING", orderId);

        return saved;
    }
}
