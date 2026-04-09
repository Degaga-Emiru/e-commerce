package com.ecommerce.ecommerce.dto;

import java.util.List;
import java.util.ArrayList;

public class WishlistDto {
    private Long id;
    private Long userId;
    private List<WishlistItemDto> items = new ArrayList<>();

    public WishlistDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<WishlistItemDto> getItems() { return items; }
    public void setItems(List<WishlistItemDto> items) { this.items = items; }
}
