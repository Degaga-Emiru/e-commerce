package com.ecommerce.ecommerce.dto;

import java.time.LocalDateTime;

public class WishlistItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private java.math.BigDecimal productPrice;
    private String productImageUrl;
    private LocalDateTime addedAt;

    public WishlistItemDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public java.math.BigDecimal getProductPrice() { return productPrice; }
    public void setProductPrice(java.math.BigDecimal productPrice) { this.productPrice = productPrice; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
