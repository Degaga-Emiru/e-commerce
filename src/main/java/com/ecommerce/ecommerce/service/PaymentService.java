package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.dto.PaymentRequest;
import com.ecommerce.ecommerce.dto.PaymentResponse;
import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.PaymentRepository;
import com.ecommerce.ecommerce.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final DemoBankService demoBankService;
    private final EmailService emailService;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository,
                          DemoBankService demoBankService, EmailService emailService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.demoBankService = demoBankService;
        this.emailService = emailService;
    }

    public PaymentResponse processPayment(PaymentRequest paymentRequest) {
        Order order = orderRepository.findById(paymentRequest.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + paymentRequest.getOrderId()));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order is not in a payable state");
        }
        //added the payment logic for multi seller and single seller
        // Process payment through demo bank system
        boolean paymentSuccess = demoBankService.processPayment(
                paymentRequest.getAccountNumber(),
                paymentRequest.getRoutingNumber(),
                paymentRequest.getAmount(),
                "Payment for order #" + order.getOrderNumber()
        );

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(paymentRequest.getAmount());
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId(generateTransactionId());

        if (paymentSuccess) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setBankReference("BANK_REF_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            payment.setEscrowHeld(true); // Hold payment in escrow until delivery

            // Update order status
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            order.setStatus(OrderStatus.CONFIRMED);
            order.setTransactionId(payment.getTransactionId());
            orderRepository.save(order);

            // Send payment confirmation email
            emailService.sendOrderConfirmation(
                    order.getUser().getEmail(),
                    order.getUser().getFirstName(),
                    order.getOrderNumber(),
                    order.getFinalAmount().doubleValue(),
                    null
            );
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setBankReference("FAILED_" + System.currentTimeMillis());
        }

        paymentRepository.save(payment);

        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(payment.getTransactionId());
        response.setStatus(payment.getStatus().name());
        response.setAmount(payment.getAmount());
        response.setPaymentDate(payment.getPaymentDate());
        response.setBankReference(payment.getBankReference());
        response.setEscrowHeld(payment.getEscrowHeld());
        response.setMessage(paymentSuccess ? "Payment processed successfully" : "Payment processing failed");

        return response;
    }

    public void releaseEscrow(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Escrow can only be released for delivered orders");
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));

        if (!payment.getEscrowHeld() || payment.getEscrowReleased()) {
            throw new RuntimeException("Escrow is not held or already released");
        }

        payment.setEscrowReleased(true);
        paymentRepository.save(payment);

        // In a real system, this would transfer funds to seller's account
        System.out.println("Escrow released for order: " + order.getOrderNumber());
        System.out.println("Amount: $" + payment.getAmount() + " released to seller");
    }

    public void processRefund(Long orderId, BigDecimal refundAmount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));

        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new RuntimeException("Refund amount cannot exceed payment amount");
        }

        // Process refund through demo bank system
        boolean refundSuccess = demoBankService.processRefund(
                payment.getOrder().getTransactionId(), // Using original transaction details
                "123456789", // Demo routing number
                refundAmount,
                "Refund for order #" + order.getOrderNumber()
        );

        if (refundSuccess) {
            if (refundAmount.compareTo(payment.getAmount()) == 0) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else {
                payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            }
            payment.setRefundedAmount(refundAmount);
            paymentRepository.save(payment);

            order.setStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);

            // Send refund confirmation email
            emailService.sendSimpleEmail(
                    order.getUser().getEmail(),
                    "Refund Processed - Order #" + order.getOrderNumber(),
                    "Your refund of $" + refundAmount + " has been processed for order #" + order.getOrderNumber()
            );
        } else {
            throw new RuntimeException("Refund processing failed");
        }
    }

    public Payment getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with transaction ID: " + transactionId));
    }

    private String generateTransactionId() {
        return "TXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    public BigDecimal getTotalRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        // Sum up all completed payments within the given date range
        return paymentRepository.findAll().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.COMPLETED)
                .filter(payment -> !payment.getPaymentDate().isBefore(startDate) &&
                        !payment.getPaymentDate().isAfter(endDate))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}