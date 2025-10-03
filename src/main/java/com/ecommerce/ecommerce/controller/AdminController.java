package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.entity.DiscountCoupon;
import com.ecommerce.ecommerce.entity.DiscountType;
import com.ecommerce.ecommerce.service.DiscountService;
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
    private final DiscountService discountService;

    public AdminController(UserService userService,
                           OrderService orderService,
                           PaymentService paymentService,
                           DiscountService discountService) {
        this.userService = userService;
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.discountService = discountService;
    }

    // ---------------- Dashboard ----------------
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userService.getAllUsers().size());
            stats.put("newUsersToday", 5); // replace with real logic
            stats.put("totalOrders", 150);
            stats.put("pendingOrders", 12);
            stats.put("completedOrders", 125);

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

    // ---------------- Revenue Analytics ----------------
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueAnalytics(
            @RequestParam String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("period", period);
            response.put("revenueData", new HashMap<>());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // ---------------- System Notification ----------------
    @PostMapping("/notifications")
    public ResponseEntity<?> sendSystemNotification(@RequestBody Map<String, String> request) {
        try {
            String subject = request.get("subject");
            String message = request.get("message");
            String color = request.getOrDefault("color", "#FFA500");

            if (subject == null || message == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Subject and message are required"));
            }

            emailService.sendSystemNotificationToAllUsers(subject, message, color);

            return ResponseEntity.ok(new ApiResponse(true, "Notification sent successfully to all users"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // ---------------- Coupons ----------------
    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody DiscountCoupon couponRequest) {
        try {
            DiscountCoupon savedCoupon = discountService.createCoupon(
                    couponRequest.getCode(),
                    couponRequest.getName(),          // <-- add name here
                    couponRequest.getDiscountType(),
                    couponRequest.getDiscountValue(),
                    couponRequest.getExpiryDate(),
                    couponRequest.getUsageLimit(),
                    couponRequest.getForNewUsers()
            );
            return ResponseEntity.ok(savedCoupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }


    @PostMapping("/coupons/welcome")
    public ResponseEntity<?> createWelcomeCoupon() {
        try {
            DiscountCoupon savedCoupon = discountService.createNewUserWelcomeCoupon();
            return ResponseEntity.ok(savedCoupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/coupons")
    public ResponseEntity<?> getAllActiveCoupons() {
        try {
            return ResponseEntity.ok(discountService.getAllActiveCoupons());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody DiscountCoupon couponDetails) {
        try {
            return ResponseEntity.ok(discountService.updateCoupon(id, couponDetails));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deactivateCoupon(@PathVariable Long id) {
        try {
            discountService.deactivateCoupon(id);
            return ResponseEntity.ok(new ApiResponse(true, "Coupon deactivated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
