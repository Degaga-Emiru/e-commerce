package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.dto.PaymentRequest;
import com.ecommerce.ecommerce.dto.PaymentResponse;
import com.ecommerce.ecommerce.entity.Order;
import com.ecommerce.ecommerce.entity.Payment;
import com.ecommerce.ecommerce.entity.PaymentStatus;
import com.ecommerce.ecommerce.repository.OrderRepository;
import com.ecommerce.ecommerce.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final DemoBankService demoBankService;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          DemoBankService demoBankService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.demoBankService = demoBankService;
    }

    // Process payment: customer -> escrow
    public PaymentResponse processPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Move funds from customer to escrow
        demoBankService.processPaymentToEscrow(request.getAccountNumber(), request.getAmount());

        Payment payment = new Payment(order, request.getAmount(), PaymentStatus.PENDING, request.getPaymentMethod());
        payment.setEscrowHeld(true);
        paymentRepository.save(payment);

        return buildPaymentResponse(payment, "Payment processed to escrow");
    }

    // Release escrow: escrow -> seller(s)
    public PaymentResponse releaseEscrow(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        BigDecimal totalAmount = order.getTotalAmount();
        String sellerAccountNumber = order.getSeller().getBankAccount().getAccountNumber();

        demoBankService.releaseFundsToSeller(sellerAccountNumber, totalAmount);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order"));

        payment.setEscrowReleased(true);
        payment.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);

        return buildPaymentResponse(payment, "Funds released to seller after commission");
    }

    // Refund payment: escrow -> customer
    public PaymentResponse processRefund(Long orderId, BigDecimal refundAmount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        BigDecimal amountToRefund = refundAmount != null ? refundAmount : payment.getAmount();

        String customerAccountNumber = order.getCustomer().getBankAccount().getAccountNumber();
        demoBankService.refundToCustomer(customerAccountNumber, amountToRefund);

        payment.setRefundedAmount(amountToRefund);
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        return buildPaymentResponse(payment, "Refund processed to customer");
    }

    // Get Payment by Transaction ID (returns DTO)
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return buildPaymentResponse(payment, "Payment retrieved");
    }

    // Build PaymentResponse DTO
    private PaymentResponse buildPaymentResponse(Payment payment, String message) {
        PaymentResponse response = new PaymentResponse();
        response.setTransactionId(payment.getTransactionId());
        response.setStatus(payment.getStatus().name());
        response.setMessage(message);
        response.setAmount(payment.getAmount());
        response.setCommission(payment.getStatus() == PaymentStatus.SUCCESS
                ? payment.getAmount().multiply(new BigDecimal("0.10"))
                : BigDecimal.ZERO);
        response.setPaymentDate(payment.getPaymentDate());
        response.setBankReference(payment.getBankReference());
        response.setEscrowHeld(payment.getEscrowHeld());
        response.setEscrowReleased(payment.getEscrowReleased());
        response.setRefundedAmount(payment.getRefundedAmount());
        return response;
    }
}

