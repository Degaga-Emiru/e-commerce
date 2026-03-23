package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.MerchantAnalyticsResponse;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.service.AnalyticsService;
import com.ecommerce.ecommerce.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/seller/analytics")
@PreAuthorize("hasRole('SELLER')")
public class MerchantAnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;

    public MerchantAnalyticsController(AnalyticsService analyticsService, UserService userService) {
        this.analyticsService = analyticsService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<MerchantAnalyticsResponse> getMyAnalytics(Principal principal) {
        User seller = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(analyticsService.getMerchantAnalytics(seller));
    }
}
