package com.ecommerce.ecommerce.controller;
import com.ecommerce.ecommerce.dto.PaymentRequest;
import com.ecommerce.ecommerce.dto.PaymentResponse;
import com.ecommerce.ecommerce.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.ecommerce.dto.ApiResponse;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        try {
            PaymentResponse response = paymentService.processPayment(request);
            return ResponseEntity.ok(Map.of("success", true, "payment", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/escrow/release")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> releaseEscrow(@RequestParam Long orderId) {
        try {
            PaymentResponse response = paymentService.releaseEscrow(orderId);
            return ResponseEntity.ok(Map.of("success", true, "payment", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> processRefund(@RequestParam Long orderId,
                                           @RequestParam(required = false) String amount) {
        try {
            PaymentResponse response = paymentService.processRefund(
                    orderId,
                    amount != null ? new java.math.BigDecimal(amount) : null
            );
            return ResponseEntity.ok(Map.of("success", true, "payment", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentByTransactionId(@PathVariable String transactionId) {
        try {
            PaymentResponse response = paymentService.getPaymentByTransactionId(transactionId);
            return ResponseEntity.ok(Map.of("success", true, "payment", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}

