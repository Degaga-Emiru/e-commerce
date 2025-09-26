package com.ecommerce.ecommerce.controller;

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

    @PostMapping("/accounts")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createBankAccount(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            BigDecimal initialBalance = new BigDecimal(request.get("initialBalance").toString());

            BankAccount account = demoBankService.createBankAccount(userId, initialBalance);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bank account created successfully");
            response.put("account", account);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/accounts/user/{userId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getBankAccountByUser(@PathVariable Long userId) {
        try {
            BankAccount account = demoBankService.getBankAccountByUserId(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("account", account);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/accounts/balance/{userId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getAccountBalance(@PathVariable Long userId) {
        try {
            BigDecimal balance = demoBankService.getAccountBalance(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("balance", balance);
            response.put("currency", "USD");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> transferFunds(@RequestBody Map<String, Object> transferRequest) {
        try {
            String fromAccount = (String) transferRequest.get("fromAccount");
            String toAccount = (String) transferRequest.get("toAccount");
            BigDecimal amount = new BigDecimal(transferRequest.get("amount").toString());
            String description = (String) transferRequest.get("description");

            boolean success = demoBankService.transferFunds(fromAccount, toAccount, amount, description);

            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            response.put("message", success ? "Transfer completed successfully" : "Transfer failed");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/accounts/{userId}/balance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAccountBalance(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            BigDecimal newBalance = new BigDecimal(request.get("balance").toString());

            BankAccount account = demoBankService.updateAccountBalance(userId, newBalance);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Account balance updated successfully");
            response.put("account", account);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateBankAccount(@RequestBody Map<String, Object> accountInfo) {
        try {
            String accountNumber = (String) accountInfo.get("accountNumber");
            String routingNumber = (String) accountInfo.get("routingNumber");

            // Simple validation - in real system, this would check with bank API
            boolean isValid = accountNumber != null && accountNumber.length() >= 8 &&
                    routingNumber != null && routingNumber.equals("123456789");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("valid", isValid);
            response.put("message", isValid ? "Bank account is valid" : "Invalid bank account details");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
