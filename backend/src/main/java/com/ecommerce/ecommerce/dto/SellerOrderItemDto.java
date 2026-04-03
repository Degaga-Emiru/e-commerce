package com.ecommerce.ecommerce.dto;

import java.math.BigDecimal;
import java.util.Map;

public class SellerOrderItemDto {
    private Long id;
    private Map<String, Object> product;
    private Integer quantity;
    private BigDecimal price; // Maps to unitPrice
    private BigDecimal totalPrice;

    public SellerOrderItemDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Map<String, Object> getProduct() { return product; }
    public void setProduct(Map<String, Object> product) { this.product = product; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
