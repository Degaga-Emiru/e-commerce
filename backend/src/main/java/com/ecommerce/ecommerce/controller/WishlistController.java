package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.dto.WishlistDto;
import com.ecommerce.ecommerce.service.WishlistService;
import com.ecommerce.ecommerce.service.UserService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {
    private final WishlistService wishlistService;
    private final UserService userService;

    public WishlistController(WishlistService wishlistService, UserService userService) {
        this.wishlistService = wishlistService;
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WishlistDto>> getWishlist() {
        try {
            Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
            WishlistDto wishlist = wishlistService.getWishlist(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Wishlist retrieved", wishlist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @PostMapping("/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(@PathVariable Long productId) {
        try {
            Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
            wishlistService.addToWishlist(userId, productId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Added to wishlist"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(@PathVariable Long productId) {
        try {
            Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
            wishlistService.removeFromWishlist(userId, productId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Removed from wishlist"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }
}
