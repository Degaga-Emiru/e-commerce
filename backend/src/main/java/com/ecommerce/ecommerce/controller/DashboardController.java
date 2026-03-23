package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.DashboardSummaryDto;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.UserRole;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.service.DashboardService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == UserRole.ADMIN) {
            return ResponseEntity.ok(dashboardService.getAdminSummary());
        } else if (user.getRole() == UserRole.SELLER) {
            return ResponseEntity.ok(dashboardService.getSellerSummary(user));
        } else {
            return ResponseEntity.ok(dashboardService.getCustomerSummary(user.getId()));
        }
    }
}
