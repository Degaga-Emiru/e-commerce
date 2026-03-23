package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.BankAccountRequest;
import com.ecommerce.ecommerce.entity.AccountType;
import com.ecommerce.ecommerce.entity.BankAccount;
import com.ecommerce.ecommerce.service.DemoBankService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bank")
@CrossOrigin(origins = "*")
public class BankController {

    private final DemoBankService demoBankService;

    public BankController(DemoBankService demoBankService) {
        this.demoBankService = demoBankService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBankAccount(@RequestBody BankAccountRequest request) {
        try {
            var account = demoBankService.createBankAccount(
                    request.getUserId(),
                    request.getInitialBalance(),
                    request.getAccountType()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("account", account);
            response.put("message", "Bank account created successfully!");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ===== Get Bank Account By User ID =====
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getBankAccountByUser(@PathVariable Long userId) {
        BankAccount account = demoBankService.getBankAccountByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("account", account);

        return ResponseEntity.ok(response);
    }

    // ===== Get Account Balance =====
    @GetMapping("/balance/{userId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAccountBalance(@PathVariable Long userId) {
        BigDecimal balance = demoBankService.getAccountBalance(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("balance", balance);

        return ResponseEntity.ok(response);
    }

    // ===== Transfer Funds to Escrow =====
    @PostMapping("/escrow/deposit")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> depositToEscrow(@RequestParam String accountNumber,
                                             @RequestParam BigDecimal amount) {
        boolean success = demoBankService.processPaymentToEscrow(accountNumber, amount);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Funds deposited to escrow" : "Deposit failed");

        return ResponseEntity.ok(response);
    }

    // ===== Release Funds to Seller =====
    @PostMapping("/escrow/release")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> releaseFunds(@RequestParam String sellerAccountNumber,
                                          @RequestParam BigDecimal amount) {
        boolean success = demoBankService.releaseFundsToSeller(sellerAccountNumber, amount);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Funds released to seller" : "Release failed");

        return ResponseEntity.ok(response);
    }

    // ===== Refund Customer =====
    @PostMapping("/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refundCustomer(@RequestParam String customerAccountNumber,
                                            @RequestParam BigDecimal amount) {
        boolean success = demoBankService.refundToCustomer(customerAccountNumber, amount);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Refund successful" : "Refund failed");

        return ResponseEntity.ok(response);
    }
}
