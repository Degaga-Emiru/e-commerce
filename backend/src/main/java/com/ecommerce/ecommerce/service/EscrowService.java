package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.Escrow;
import com.ecommerce.ecommerce.entity.EscrowStatus;
import com.ecommerce.ecommerce.entity.Order;
import com.ecommerce.ecommerce.entity.SellerOrder;
import com.ecommerce.ecommerce.repository.EscrowRepository;
import com.ecommerce.ecommerce.repository.OrderRepository;
import com.ecommerce.ecommerce.repository.SellerOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final OrderRepository orderRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public EscrowService(EscrowRepository escrowRepository, 
                         OrderRepository orderRepository,
                         SellerOrderRepository sellerOrderRepository,
                         NotificationService notificationService,
                         EmailService emailService) {
        this.escrowRepository = escrowRepository;
        this.orderRepository = orderRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Transactional
    public Escrow createEscrow(Order order) {
        Escrow escrow = new Escrow(order, order.getFinalAmount());
        return escrowRepository.save(escrow);
    }

    public Optional<Escrow> getEscrowByOrder(Long orderId) {
        return escrowRepository.findByOrderId(orderId);
    }

    @Transactional
    public void releaseEscrow(Long orderId) {
        Escrow escrow = escrowRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Order order = orderRepository.findById(orderId).orElse(null);
                    if (order == null) return null;
                    return createEscrow(order);
                });

        if (escrow == null) {
            System.err.println("⚠️ Release skipped: No order found for ID " + orderId);
            return;
        }

        if (escrow.getStatus() == EscrowStatus.RELEASED) {
            return; // Already released
        }

        escrow.setStatus(EscrowStatus.RELEASED);
        escrow.setReleasedAt(LocalDateTime.now());
        escrowRepository.save(escrow);

        // Notify All Sellers involved in this order via SellerOrder records
        List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(orderId);
        if (sellerOrders.isEmpty()) {
            System.err.println("⚠️ Warning: No seller orders found for order #" + orderId + ". Skipping notifications.");
            return;
        }

        for (SellerOrder so : sellerOrders) {
            if (so.getSeller() == null) continue;

            String sellerMsg = String.format("Payment for order #%s has been released. Amount: ETB %.2f.",
                    so.getOrder().getOrderNumber(), so.getSubtotal());
            
            notificationService.createNotification(
                    so.getSeller(),
                    "Payment Released 💰",
                    sellerMsg,
                    "PAYMENT"
            );

            // Send Email to Seller
            try {
                emailService.sendEscrowReleased(
                        so.getSeller().getEmail(),
                        so.getSeller().getFirstName(),
                        so.getOrder().getOrderNumber(),
                        so.getSubtotal().doubleValue(),
                        so.getSubtotal().multiply(new BigDecimal("0.10")).doubleValue()
                );
            } catch (Exception ignored) {}
        }
    }

    @Transactional
    public void refundEscrow(Long orderId) {
        Escrow escrow = escrowRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Order order = orderRepository.findById(orderId).orElse(null);
                    if (order == null) return null;
                    return createEscrow(order);
                });

        if (escrow == null) {
            System.err.println("⚠️ Refund skipped: No order found for ID " + orderId);
            return;
        }

        if (escrow.getStatus() != EscrowStatus.HELD) {
            // If it's already RELEASED or REFUNDED, we don't refund again
            return;
        }

        escrow.setStatus(EscrowStatus.REFUNDED);
        escrowRepository.save(escrow);

        // Notify Customer
        notificationService.createNotification(
                escrow.getOrder().getUser(),
                "Refund Processed 💳",
                "Your payment for order #" + escrow.getOrder().getOrderNumber() + " has been refunded.",
                "PAYMENT"
        );
    }

    @Transactional
    public void deleteEscrow(Long escrowId) {
        escrowRepository.deleteById(escrowId);
    }
}
