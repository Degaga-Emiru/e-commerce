package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.Escrow;
import com.ecommerce.ecommerce.entity.EscrowStatus;
import com.ecommerce.ecommerce.entity.TransactionType;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.Payment;
import com.ecommerce.ecommerce.entity.PaymentStatus;
import com.ecommerce.ecommerce.entity.Order;
import com.ecommerce.ecommerce.entity.SellerOrder;
import com.ecommerce.ecommerce.repository.EscrowRepository;
import com.ecommerce.ecommerce.repository.OrderRepository;
import com.ecommerce.ecommerce.repository.SellerOrderRepository;
import com.ecommerce.ecommerce.repository.PaymentRepository;
import com.ecommerce.ecommerce.repository.SellerProfileRepository;
import com.ecommerce.ecommerce.entity.SellerProfile;
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
    private final DemoBankService demoBankService;
    private final PaymentRepository paymentRepository;
    private final SellerProfileRepository sellerProfileRepository;

    public EscrowService(EscrowRepository escrowRepository, 
                         OrderRepository orderRepository,
                         SellerOrderRepository sellerOrderRepository,
                         NotificationService notificationService,
                         EmailService emailService,
                         DemoBankService demoBankService,
                         PaymentRepository paymentRepository,
                         SellerProfileRepository sellerProfileRepository) {
        this.escrowRepository = escrowRepository;
        this.orderRepository = orderRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.demoBankService = demoBankService;
        this.paymentRepository = paymentRepository;
        this.sellerProfileRepository = sellerProfileRepository;
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

        System.out.println("Processing actual bank transfers for order: " + orderId);

        // Fetch original payment to attach to payouts
        Payment customerPayment = paymentRepository.findByOrderIdAndTransactionType(orderId, TransactionType.CUSTOMER_PAYMENT).orElse(null);

        // Notify All Sellers involved in this order via SellerOrder records and RELEASE BANK FUNDS
        List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(orderId);
        if (sellerOrders.isEmpty()) {
            System.err.println("⚠️ Warning: No seller orders found for order #" + orderId + ". Skipping payouts.");
            return;
        }

        for (SellerOrder so : sellerOrders) {
            if (so.getSeller() == null) continue;
            
            // ACTUAL PAYOUT EXECUTION
            if (so.getStatus() != com.ecommerce.ecommerce.entity.SellerOrderStatus.PAYOUT_RELEASED) {
                try {
                    BigDecimal grossAmount = so.getSubtotal();
                    BigDecimal commission = grossAmount.multiply(new BigDecimal("0.10"));
                    BigDecimal netAmount = grossAmount.subtract(commission);
                    
                    if (so.getSeller().getBankAccount() == null) {
                        System.err.println("Seller " + so.getSeller().getEmail() + " has no bank account configured. Funds will stay in virtual balance.");
                    }
                    
                    // Update Seller's available balance instead of direct bank transfer
                    SellerProfile profile = sellerProfileRepository.findByUserId(so.getSeller().getId())
                            .orElseThrow(() -> new RuntimeException("Seller profile not found"));
                    profile.setAvailableBalance(profile.getAvailableBalance().add(netAmount));
                    sellerProfileRepository.save(profile);

                    // Record Payment history
                    if (customerPayment != null) {
                        // Record Seller Payout 
                        Payment sellerPayment = new Payment(so.getOrder(), grossAmount, PaymentStatus.COMPLETED, customerPayment.getPaymentMethod());
                        sellerPayment.setTransactionType(TransactionType.SELLER_PAYOUT);
                        sellerPayment.setSeller(so.getSeller());
                        sellerPayment.setCommissionAmount(commission);
                        sellerPayment.setNetAmountToSeller(netAmount);
                        if (so.getSeller().getBankAccount() != null) {
                            sellerPayment.setSellerAccountNumber(so.getSeller().getBankAccount().getAccountNumber());
                        }
                        paymentRepository.save(sellerPayment);

                        // Record Platform Commission
                        Payment commissionPayment = new Payment(so.getOrder(), commission, PaymentStatus.COMPLETED, customerPayment.getPaymentMethod());
                        commissionPayment.setTransactionType(TransactionType.PLATFORM_COMMISSION);
                        commissionPayment.setPlatformRoutingNumber(customerPayment.getPlatformRoutingNumber());
                        paymentRepository.save(commissionPayment);
                    }
                    
                    so.setStatus(com.ecommerce.ecommerce.entity.SellerOrderStatus.PAYOUT_RELEASED);
                    sellerOrderRepository.save(so);
                } catch (Exception e) {
                    System.err.println("Error processing payout for seller: " + e.getMessage());
                }
            }

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
        
        if (customerPayment != null) {
            customerPayment.setEscrowReleased(true);
            customerPayment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(customerPayment);
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
