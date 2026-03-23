package com.ecommerce.ecommerce.controller;
import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.dto.AddCartItemRequest;
import com.ecommerce.ecommerce.dto.CartResponse;
import com.ecommerce.ecommerce.entity.Cart;
import com.ecommerce.ecommerce.entity.CartItem;
import com.ecommerce.ecommerce.mapper.CartMapper;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;

    }

    /**
     * Helper to get authenticated userId from JWT
     */
    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName(); // comes from JWT/UserDetails
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    // ✅ Add item to cart (Customer only)
    @PostMapping("/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartResponse>> addItemToCart(@RequestBody AddCartItemRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getCurrentUserId(auth);

        CartItem item = cartService.addItemToCart(userId, request.getProductId(), request.getQuantity());
        Cart cart = cartService.getOrCreateCart(userId);

        return ResponseEntity.ok(new ApiResponse<>(true, "Item added to cart", CartMapper.toCartResponse(cart)));
    }

    // ✅ Get current user's cart (Customer only)
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getCurrentUserId(auth);

        Cart cart = cartService.getOrCreateCart(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cart retrieved", CartMapper.toCartResponse(cart)));
    }

    // ✅ Update item quantity
    @PutMapping("/items/{productId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getCurrentUserId(auth);

        cartService.updateCartItemQuantity(userId, productId, quantity);
        Cart cart = cartService.getOrCreateCart(userId);

        return ResponseEntity.ok(new ApiResponse<>(true, "Cart updated", CartMapper.toCartResponse(cart)));
    }

    // ✅ Remove item from cart
    @DeleteMapping("/items/{productId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> removeCartItem(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getCurrentUserId(auth);

        cartService.removeItemFromCart(userId, productId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Item removed from cart", null));
    }

    // ✅ Clear cart
    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> clearCart() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getCurrentUserId(auth);

        cartService.clearCart(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cart cleared", null));
    }
    @GetMapping("/total")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCartTotal(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        BigDecimal total = cartService.getCartTotal(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Cart total retrieved", total));
    }
    @GetMapping("/count")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCartItemCount(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        Integer count = cartService.getCartItemCount(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Cart item count retrieved", count));
    }


}
