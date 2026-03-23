package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.PaymentRequest;
import com.ecommerce.ecommerce.dto.PaymentResponse;
import com.ecommerce.ecommerce.dto.chapa.ChapaVerifyResponse;
import com.ecommerce.ecommerce.entity.Order;
import com.ecommerce.ecommerce.entity.OrderStatus;
import com.ecommerce.ecommerce.entity.Payment;
import com.ecommerce.ecommerce.entity.PaymentStatus;
import com.ecommerce.ecommerce.repository.OrderRepository;
import com.ecommerce.ecommerce.repository.PaymentRepository;
import com.ecommerce.ecommerce.service.ChapaService;
import com.ecommerce.ecommerce.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;
    private final ChapaService chapaService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentService paymentService, 
                             ChapaService chapaService, 
                             OrderRepository orderRepository,
                             PaymentRepository paymentRepository) {
        this.paymentService = paymentService;
        this.chapaService = chapaService;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/initialize")
    public ResponseEntity<PaymentResponse> initializePayment(@RequestBody PaymentRequest request) {
        logger.info("Initializing payment for order: {}", request.getOrderId());
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @GetMapping("/verify/{orderNumber}")
    public ResponseEntity<?> verifyPayment(@PathVariable String orderNumber) {
        logger.info("Verifying payment for order number: {}", orderNumber);
        try {
            ChapaVerifyResponse verifyResponse = chapaService.verifyTransaction(orderNumber);
            logger.debug("Chapa verification response: {}", verifyResponse);

            if (verifyResponse != null && "success".equalsIgnoreCase(verifyResponse.getStatus())) {
                Order order = orderRepository.findByOrderNumber(orderNumber)
                        .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

                Payment payment = paymentRepository.findByOrderId(order.getId())
                        .orElseThrow(() -> new RuntimeException("Payment record not found for order ID: " + order.getId()));

                // Check nested data status if available
                String transactionStatus = verifyResponse.getData() != null ? verifyResponse.getData().getStatus() : null;
                logger.info("Transaction status for {}: {}", orderNumber, transactionStatus);

                if ("success".equalsIgnoreCase(transactionStatus) || transactionStatus == null) {
                    payment.setStatus(PaymentStatus.COMPLETED);
                    if (verifyResponse.getData() != null) {
                        payment.setBankReference(verifyResponse.getData().getReference());
                    }
                    paymentRepository.save(payment);

                    order.setPaymentStatus(PaymentStatus.COMPLETED);
                    order.setStatus(OrderStatus.PROCESSING);
                    orderRepository.save(order);
                    
                    logger.info("Payment verified and order updated for: {}", orderNumber);
                    return ResponseEntity.ok(verifyResponse);
                } else {
                    logger.warn("Transaction failed at Chapa for {}: {}", orderNumber, transactionStatus);
                    return ResponseEntity.badRequest().body(verifyResponse);
                }
            } else {
                logger.warn("Chapa API returned non-success status for {}: {}", orderNumber, verifyResponse != null ? verifyResponse.getStatus() : "null");
                return ResponseEntity.badRequest().body(verifyResponse);
            }
        } catch (Exception e) {
            logger.error("Error verifying payment for {}: {}", orderNumber, e.getMessage());
            return ResponseEntity.badRequest().body(new com.ecommerce.ecommerce.dto.ApiResponse(false, e.getMessage()));
        }
    }
}
