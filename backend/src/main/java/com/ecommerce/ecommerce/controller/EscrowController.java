package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.entity.Escrow;
import com.ecommerce.ecommerce.service.EscrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/escrow")
@CrossOrigin(origins = "*")
public class EscrowController {

    private final EscrowService escrowService;

    public EscrowController(EscrowService escrowService) {
        this.escrowService = escrowService;
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Escrow> getEscrow(@PathVariable Long orderId) {
        return escrowService.getEscrowByOrder(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/release/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> releaseEscrow(@PathVariable Long orderId) {
        escrowService.releaseEscrow(orderId);
        return ResponseEntity.ok("Escrow released successfully.");
    }
}
