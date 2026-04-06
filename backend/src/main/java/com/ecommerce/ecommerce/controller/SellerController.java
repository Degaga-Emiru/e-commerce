package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ProductDto;
import com.ecommerce.ecommerce.dto.SellerOrderDto;
import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.service.*;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
public class SellerController {

    private final SellerProfileService sellerProfileService;
    private final ProductService productService;
    private final UserService userService;
    private final OrderService orderService;
    private final ShippingService shippingService;

    public SellerController(SellerProfileService sellerProfileService, ProductService productService,
                            UserService userService, OrderService orderService, ShippingService shippingService) {
        this.sellerProfileService = sellerProfileService;
        this.productService = productService;
        this.userService = userService;
        this.orderService = orderService;
        this.shippingService = shippingService;
    }

    private Long getCurrentUserId() {
        return userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
    }

    // ── Shop Profile ──────────────────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Long userId = getCurrentUserId();
        if (!sellerProfileService.hasProfile(userId)) {
            return ResponseEntity.ok(Map.of("hasProfile", false));
        }
        return ResponseEntity.ok(sellerProfileService.getProfileByUserId(userId));
    }

    @PostMapping("/profile")
    public ResponseEntity<SellerProfile> createOrUpdateProfile(@RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(sellerProfileService.createOrUpdateProfile(
                userId,
                body.get("shopName"),
                body.get("description"),
                body.get("logoUrl")
        ));
    }

    // ── Products ─────────────────────────────────────────────────────────────
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getMyProducts() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(productService.getProductsBySeller(userId));
    }

    // ── Orders ───────────────────────────────────────────────────────────────
    @GetMapping("/orders")
    public ResponseEntity<List<SellerOrderDto>> getMyOrders() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(orderService.getOrdersBySeller(userId));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<SellerOrderDto> getOrderById(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(orderService.getSellerOrderById(id, userId));
    }

    @PutMapping("/orders/{orderId}/shipping")
    public ResponseEntity<Shipping> updateShipping(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        ShippingStatus status = ShippingStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(shippingService.updateShippingStatus(orderId, status,
                body.get("carrier"), body.get("trackingNumber"),
                body.getOrDefault("note", "Status updated by seller"), "SELLER"));
    }
}
