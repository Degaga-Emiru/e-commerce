package com.ecommerce.ecommerce.dto;

import java.time.LocalDateTime;

public class WishlistItemDto {
    private Long id;
    private Long productId;
    private ProductDto product;
    private LocalDateTime addedAt;

    public WishlistItemDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public ProductDto getProduct() { return product; }
    public void setProduct(ProductDto product) { this.product = product; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
