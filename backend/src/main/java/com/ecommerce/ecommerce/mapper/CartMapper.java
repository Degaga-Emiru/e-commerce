package com.ecommerce.ecommerce.mapper;
import com.ecommerce.ecommerce.dto.CartItemResponse;
import com.ecommerce.ecommerce.dto.CartResponse;
import com.ecommerce.ecommerce.entity.Cart;
import com.ecommerce.ecommerce.entity.CartItem;
import java.util.stream.Collectors;

public class CartMapper {
    public static CartItemResponse toCartItemResponse(CartItem item) {
        CartItemResponse dto = new CartItemResponse();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        return dto;
    }

    public static CartResponse toCartResponse(Cart cart) {
        CartResponse dto = new CartResponse();
        dto.setCartId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setItems(cart.getCartItems().stream()
                .map(CartMapper::toCartItemResponse)
                .collect(Collectors.toList()));
        dto.setTotalPrice(cart.getTotalPrice());
        dto.setItemCount(cart.getItemCount());
        return dto;
    }
}
