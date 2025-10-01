package com.ecommerce.ecommerce.dto;

import java.util.List;

public class CreateOrderRequest {
    private Long userId;
    private List<OrderItemDto> items; // note: "items" matches your JSON
    private ShippingAddressDto shippingAddress;
    private String couponCode;

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }

    public ShippingAddressDto getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(ShippingAddressDto shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
}
