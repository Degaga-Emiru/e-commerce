package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.entity.Shipping;
import com.ecommerce.ecommerce.entity.ShippingStatus;
import com.ecommerce.ecommerce.service.ShippingService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/shipping")
@CrossOrigin(origins = "*")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Shipping> getShipping(@PathVariable Long orderId) {
        return ResponseEntity.ok(shippingService.getShippingByOrderId(orderId));
    }

    @PutMapping("/order/{orderId}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Shipping> updateStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        ShippingStatus status = ShippingStatus.valueOf(body.get("status"));
        String carrier = body.get("carrier");
        String trackingNumber = body.get("trackingNumber");
        String note = body.get("note");
        String updatedBy = SecurityUtils.getCurrentUserRole(); // Simplified for now
        
        return ResponseEntity.ok(shippingService.updateShippingStatus(orderId, status, carrier, trackingNumber, note, updatedBy));
    }

    @GetMapping("/order/{orderId}/history")
    public ResponseEntity<?> getHistory(@PathVariable Long orderId) {
        Shipping shipping = shippingService.getShippingByOrderId(orderId);
        return ResponseEntity.ok(shippingService.getShippingHistory(shipping.getId()));
    }
}
