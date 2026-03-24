package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.entity.Shipping;
import com.ecommerce.ecommerce.entity.ShippingStatus;
import com.ecommerce.ecommerce.service.ShippingService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shipping")
@CrossOrigin(origins = "*")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getShipping(@PathVariable Long orderId) {
        try {
            Shipping s = shippingService.getShippingByOrderId(orderId);
            return ResponseEntity.ok(mapShipping(s));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/order/{orderId}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        try {
            ShippingStatus status = ShippingStatus.valueOf(body.get("status"));
            String carrier = body.get("carrier");
            String trackingNumber = body.get("trackingNumber");
            String note = body.get("note");
            String updatedBy = SecurityUtils.getCurrentUserRole();

            Shipping s = shippingService.updateShippingStatus(orderId, status, carrier, trackingNumber, note, updatedBy);
            return ResponseEntity.ok(mapShipping(s));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private Map<String, Object> mapShipping(Shipping s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("status", s.getStatus() != null ? s.getStatus().name() : null);
        m.put("carrier", s.getCarrier());
        m.put("trackingNumber", s.getTrackingNumber());
        m.put("estimatedDelivery", s.getEstimatedDelivery());
        m.put("updatedAt", s.getUpdatedAt());
        if (s.getOrder() != null) {
            Map<String, Object> o = new LinkedHashMap<>();
            o.put("id", s.getOrder().getId());
            o.put("orderNumber", s.getOrder().getOrderNumber());
            m.put("order", o);
        }
        return m;
    }

    @GetMapping("/order/{orderId}/history")
    public ResponseEntity<?> getHistory(@PathVariable Long orderId) {
        Shipping shipping = shippingService.getShippingByOrderId(orderId);
        return ResponseEntity.ok(shippingService.getShippingHistory(shipping.getId()));
    }
}
