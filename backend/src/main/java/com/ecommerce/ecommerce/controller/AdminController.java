package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.repository.EscrowRepository;
import com.ecommerce.ecommerce.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final DiscountService discountService;
    private final EmailService emailService;
    private final SellerProfileService sellerService;
    private final EscrowService escrowService;
    private final EscrowRepository escrowRepository;
    private final ShippingService shippingService;
    private final ProductService productService;

    public AdminController(UserService userService,
                           OrderService orderService,
                           PaymentService paymentService,
                           DiscountService discountService,
                           EmailService emailService,
                           SellerProfileService sellerService,
                           EscrowService escrowService,
                           EscrowRepository escrowRepository,
                           ShippingService shippingService,
                           ProductService productService) {
        this.userService = userService;
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.discountService = discountService;
        this.emailService = emailService;
        this.sellerService = sellerService;
        this.escrowService = escrowService;
        this.escrowRepository = escrowRepository;
        this.shippingService = shippingService;
        this.productService = productService;
    }

    @GetMapping("/orders")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Map<String, Object>> result = orderService.getAllOrders().stream().map(o -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", o.getId());
                m.put("orderNumber", o.getOrderNumber());
                m.put("status", o.getStatus() != null ? o.getStatus().name() : null);
                m.put("finalAmount", o.getFinalAmount());
                m.put("orderDate", o.getOrderDate());
                m.put("paymentStatus", o.getPaymentStatus() != null ? o.getPaymentStatus().name() : null);
                if (o.getUser() != null) {
                    Map<String, Object> u = new LinkedHashMap<>();
                    u.put("id", o.getUser().getId());
                    u.put("firstName", o.getUser().getFirstName());
                    u.put("lastName", o.getUser().getLastName());
                    u.put("email", o.getUser().getEmail());
                    m.put("user", u);
                }
                if (o.getOrderItems() != null) {
                    List<Map<String, Object>> items = o.getOrderItems().stream().map(item -> {
                        Map<String, Object> im = new LinkedHashMap<>();
                        im.put("id", item.getId());
                        im.put("quantity", item.getQuantity());
                        im.put("unitPrice", item.getUnitPrice());
                        if (item.getProduct() != null) {
                            Map<String, Object> pm = new LinkedHashMap<>();
                            pm.put("id", item.getProduct().getId());
                            pm.put("name", item.getProduct().getName());
                            im.put("product", pm);
                        }
                        return im;
                    }).collect(Collectors.toList());
                    m.put("orderItems", items);
                }
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "All orders retrieved", result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok(new ApiResponse(true, "Order deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/sellers")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllSellers() {
        try {
            List<Map<String, Object>> result = sellerService.getAllProfiles().stream().map(s -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", s.getId());
                m.put("shopName", s.getShopName());
                m.put("description", s.getDescription());
                m.put("logoUrl", s.getLogoUrl());
                m.put("verified", s.getVerified());
                if (s.getUser() != null) {
                    Map<String, Object> u = new LinkedHashMap<>();
                    u.put("id", s.getUser().getId());
                    u.put("email", s.getUser().getEmail());
                    u.put("firstName", s.getUser().getFirstName());
                    u.put("lastName", s.getUser().getLastName());
                    m.put("user", u);
                }
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "All sellers retrieved", result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    // ---------------- Dashboard ----------------
    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getDashboardStats() {
        try {
            var allOrders = orderService.getAllOrders();
            var allUsers = userService.getAllUsers();
            var allSellers = sellerService.getAllProfiles();
            var allEscrow = escrowRepository.findAll();

            long totalOrders = allOrders.size();
            long totalUsers = allUsers.stream().filter(u -> u.getRole().name().equals("CUSTOMER")).count();
            long totalSellers = allSellers.size();
            long pendingOrders = allOrders.stream().filter(o -> o.getStatus().name().equals("PENDING")).count();
            long deliveredOrders = allOrders.stream().filter(o -> o.getStatus().name().equals("DELIVERED")).count();

            java.math.BigDecimal escrowHeld = allEscrow.stream()
                .filter(e -> e.getStatus().name().equals("HELD"))
                .map(e -> e.getTotalAmount())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            java.math.BigDecimal escrowReleased = allEscrow.stream()
                .filter(e -> e.getStatus().name().equals("RELEASED"))
                .map(e -> e.getTotalAmount())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            java.math.BigDecimal platformEarnings = allEscrow.stream()
                .filter(e -> e.getStatus().name().equals("RELEASED"))
                .map(e -> e.getPlatformFee())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            java.math.BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getFinalAmount() != null)
                .map(o -> o.getFinalAmount())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalOrders", totalOrders);
            stats.put("totalUsers", totalUsers);
            stats.put("totalSellers", totalSellers);
            stats.put("pendingOrders", pendingOrders);
            stats.put("deliveredOrders", deliveredOrders);
            stats.put("escrowHeld", escrowHeld);
            stats.put("escrowReleased", escrowReleased);
            stats.put("platformEarnings", platformEarnings);
            stats.put("totalRevenue", totalRevenue);

            // Orders by status breakdown
            Map<String, Long> ordersByStatus = new HashMap<>();
            for (Order order : allOrders) {
                String s = order.getStatus().name();
                ordersByStatus.put(s, ordersByStatus.getOrDefault(s, 0L) + 1);
            }
            stats.put("ordersByStatus", ordersByStatus);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);
            response.put("lastUpdated", LocalDateTime.now());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/escrow")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllEscrow() {
        try {
            List<Map<String, Object>> result = escrowRepository.findAll().stream().map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", e.getId());
                m.put("status", e.getStatus() != null ? e.getStatus().name() : null);
                m.put("totalAmount", e.getTotalAmount());
                m.put("platformFee", e.getPlatformFee());
                m.put("sellerAmount", e.getSellerAmount());
                m.put("createdAt", e.getCreatedAt());
                m.put("releasedAt", e.getReleasedAt());
                if (e.getOrder() != null) {
                    Map<String, Object> o = new LinkedHashMap<>();
                    o.put("id", e.getOrder().getId());
                    o.put("orderNumber", e.getOrder().getOrderNumber());
                    m.put("order", o);
                }
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "Escrow records", result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @DeleteMapping("/escrow/{id}")
    public ResponseEntity<?> deleteEscrow(@PathVariable Long id) {
        try {
            escrowService.deleteEscrow(id);
            return ResponseEntity.ok(new ApiResponse(true, "Escrow record deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/escrow/{orderId}/release")
    public ResponseEntity<?> releaseEscrow(@PathVariable Long orderId) {
        try {
            escrowService.releaseEscrow(orderId);
            return ResponseEntity.ok(new ApiResponse(true, "Escrow released"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/escrow/{orderId}/refund")
    public ResponseEntity<?> refundEscrow(@PathVariable Long orderId) {
        try {
            escrowService.refundEscrow(orderId);
            return ResponseEntity.ok(new ApiResponse(true, "Escrow refunded"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/users")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllUsers() {
        try {
            List<Map<String, Object>> result = userService.getAllUsers().stream().map(u -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("firstName", u.getFirstName());
                m.put("lastName", u.getLastName());
                m.put("email", u.getEmail());
                m.put("role", u.getRole() != null ? u.getRole().name() : null);
                m.put("enabled", u.isEnabled());
                m.put("createdAt", u.getCreatedAt());
                return m;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "All users", result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @PostMapping("/sellers/{profileId}/verify")
    public ResponseEntity<?> verifySeller(@PathVariable Long profileId, @RequestBody Map<String, Boolean> body) {
        try {
            boolean verified = body.getOrDefault("verified", false);
            var profile = sellerService.verifyProfile(profileId, verified);
            return ResponseEntity.ok(new ApiResponse(true, verified ? "Seller verified" : "Seller unverified", profile));
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
                    couponRequest.getName(),
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

    // ---------------- DB Sync (Temporary fix for check constraints) ----------------
    @PostMapping("/db-sync")
    @Transactional
    public ResponseEntity<?> syncDatabase() {
        try {
            shippingService.syncDatabase();
            return ResponseEntity.ok(new ApiResponse(true, "Database check constraints synced successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            user.setEnabled(!user.isEnabled());
            userService.updateUser(user);
            return ResponseEntity.ok(new ApiResponse(true, "User status updated", user.isEnabled()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // ---------------- Products ----------------
    @GetMapping("/products")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllProducts() {
        try {
            return ResponseEntity.ok(new ApiResponse(true, "All products", productService.getAllProducts()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
