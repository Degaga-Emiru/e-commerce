package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.entity.WithdrawalRequest;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.repository.WithdrawalRequestRepository;
import com.ecommerce.ecommerce.service.WithdrawalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller/withdrawals")
@CrossOrigin(origins = "*")
public class WithdrawalController {

    private final WithdrawalService withdrawalService;
    private final WithdrawalRequestRepository withdrawalRepository;
    private final UserRepository userRepository;

    public WithdrawalController(WithdrawalService withdrawalService,
                                WithdrawalRequestRepository withdrawalRepository,
                                UserRepository userRepository) {
        this.withdrawalService = withdrawalService;
        this.withdrawalRepository = withdrawalRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<WithdrawalRequest>> requestWithdrawal(@RequestBody Map<String, Object> request, Authentication auth) {
        Long sellerId = getUserId(auth);
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        WithdrawalRequest wr = withdrawalService.requestWithdrawal(sellerId, amount);
        return ResponseEntity.ok(new ApiResponse<>(true, "Withdrawal request submitted", wr));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<WithdrawalRequest>>> getHistory(Authentication auth) {
        Long sellerId = getUserId(auth);
        List<WithdrawalRequest> history = withdrawalRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Withdrawal history retrieved", history));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<WithdrawalRequest>>> getAllForAdmin() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All withdrawals retrieved", withdrawalService.getAllWithdrawals()));
    }

    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable Long id) {
        withdrawalService.approveWithdrawal(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Withdrawal approved and funds released", null));
    }

    @PostMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> reject(@PathVariable Long id) {
        withdrawalService.rejectWithdrawal(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Withdrawal rejected", null));
    }

    private Long getUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
