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

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

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
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @GetMapping("/verify/{orderNumber}")
    public ResponseEntity<?> verifyPayment(@PathVariable String orderNumber) {
        ChapaVerifyResponse verifyResponse = chapaService.verifyTransaction(orderNumber);

        if ("success".equalsIgnoreCase(verifyResponse.getStatus())) {
            Order order = orderRepository.findByOrderNumber(orderNumber)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Payment payment = paymentRepository.findByOrderId(order.getId())
                    .orElseThrow(() -> new RuntimeException("Payment record not found"));

            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setBankReference(verifyResponse.getData().getReference());
            paymentRepository.save(payment);

            order.setPaymentStatus(PaymentStatus.COMPLETED);
            order.setStatus(OrderStatus.PROCESSING); // Move to processing after payment
            orderRepository.save(order);

            return ResponseEntity.ok(verifyResponse);
        } else {
            return ResponseEntity.badRequest().body(verifyResponse);
        }
    }
}
