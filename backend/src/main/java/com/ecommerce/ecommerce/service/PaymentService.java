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
    private final OrderService orderService;
    private final ChapaService chapaService;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          DemoBankService demoBankService,
                          OrderService orderService,
                          ChapaService chapaService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.demoBankService = demoBankService;
        this.orderService = orderService;
        this.chapaService = chapaService;
    }

    // Process payment: customer -> escrow (using Chapa)
    public PaymentResponse processPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Initialize Chapa transaction
        com.ecommerce.ecommerce.dto.chapa.ChapaInitializeResponse chapaResponse = chapaService.initializeTransaction(order);

        Payment payment = new Payment(order, order.getFinalAmount(), PaymentStatus.PENDING, "CHAPA");
        payment.setEscrowHeld(true);
        payment.setTransactionId(order.getOrderNumber()); // Use order number as tx_ref
        paymentRepository.save(payment);

        PaymentResponse response = buildPaymentResponse(payment, "Chapa payment initialized");
        response.setCheckoutUrl(chapaResponse.getData().getCheckout_url());
        return response;
    }

    // Release escrow: escrow -> seller(s)
    public PaymentResponse releaseEscrow(Long orderId) {
        // Delegate to OrderService to handle multiple sellers
        orderService.releaseEscrowPayment(orderId);

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order"));

        return buildPaymentResponse(payment, "Funds released to sellers after commission");
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
        response.setCommission(payment.getStatus() == PaymentStatus.COMPLETED || payment.getStatus() == PaymentStatus.SUCCESS
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

