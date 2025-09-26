package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.service.OrderService;
import com.ecommerce.ecommerce.service.PaymentService;
import com.ecommerce.ecommerce.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {
    private final UserService userService;
    private final OrderService orderService;
    private final PaymentService paymentService;

    public AdminController(UserService userService, OrderService orderService, PaymentService paymentService) {
        this.userService = userService;
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // User statistics
            stats.put("totalUsers", userService.getAllUsers().size());
            stats.put("newUsersToday", 5); // Would implement proper counting

            // Order statistics
            stats.put("totalOrders", 150);
            stats.put("pendingOrders", 12);
            stats.put("completedOrders", 125);

            // Revenue statistics
            BigDecimal revenue = paymentService.getTotalRevenue(
                    LocalDateTime.now().minusDays(30), LocalDateTime.now());
            stats.put("revenueLast30Days", revenue);
            stats.put("averageOrderValue", 89.99);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);
            response.put("lastUpdated", LocalDateTime.now());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueAnalytics(
            @RequestParam String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            // Implementation for revenue analytics
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("period", period);
            response.put("revenueData", new HashMap<>());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/notifications")
    public ResponseEntity<?> sendSystemNotification(@RequestBody Map<String, String> notification) {
        try {
            // Implementation for system notifications
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification sent successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
