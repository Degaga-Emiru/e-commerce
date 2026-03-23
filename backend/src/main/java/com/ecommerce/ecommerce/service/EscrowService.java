package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.Escrow;
import com.ecommerce.ecommerce.entity.EscrowStatus;
import com.ecommerce.ecommerce.entity.Order;
import com.ecommerce.ecommerce.repository.EscrowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public EscrowService(EscrowRepository escrowRepository, 
                         NotificationService notificationService,
                         EmailService emailService) {
        this.escrowRepository = escrowRepository;
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
                .orElseThrow(() -> new RuntimeException("Escrow not found for order: " + orderId));

        if (escrow.getStatus() == EscrowStatus.RELEASED) {
            return; // Already released
        }

        escrow.setStatus(EscrowStatus.RELEASED);
        escrow.setReleasedAt(LocalDateTime.now());
        escrowRepository.save(escrow);

        // Notify Seller
        String sellerMsg = String.format("Payment for order #%s has been released. Amount: ETB %.2f (after 10%% fee).",
                escrow.getOrder().getOrderNumber(), escrow.getSellerAmount());
        
        notificationService.createNotification(
                escrow.getOrder().getSeller(),
                "Payment Released 💰",
                sellerMsg,
                "PAYMENT"
        );

        // Send Email to Seller
        emailService.sendEscrowReleased(
                escrow.getOrder().getSeller().getEmail(),
                escrow.getOrder().getSeller().getFirstName(),
                escrow.getOrder().getSeller().getOrderNumber(),
                escrow.getSellerAmount().doubleValue(),
                escrow.getPlatformFee().doubleValue()
        );
    }

    @Transactional
    public void refundEscrow(Long orderId) {
        Escrow escrow = escrowRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Escrow not found for order: " + orderId));

        if (escrow.getStatus() != EscrowStatus.HELD) {
            throw new RuntimeException("Escrow cannot be refunded in current status: " + escrow.getStatus());
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
}
