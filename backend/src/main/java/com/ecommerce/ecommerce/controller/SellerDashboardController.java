package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.service.SellerDashboardService;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/seller/dashboard")
@CrossOrigin(origins = "*")
public class SellerDashboardController {

    private final SellerDashboardService dashboardService;
    private final UserRepository userRepository;

    public SellerDashboardController(SellerDashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(Authentication auth) {
        // In this app, User principal is the User entity or has the ID.
        // Assuming we look up by email for robustness.
        Long sellerId = getUserId(auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Summary retrieved", dashboardService.getDashboardStats(sellerId)));
    }

    @GetMapping("/trends")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTrends(Authentication auth) {
        Long sellerId = getUserId(auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Trends retrieved", dashboardService.getSalesTrend(sellerId)));
    }

    private Long getUserId(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
