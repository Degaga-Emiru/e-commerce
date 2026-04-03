package com.ecommerce.ecommerce.dto;

import com.ecommerce.ecommerce.entity.OrderItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class SellerOrderDto {
    private Long id;
    private Long mainOrderId;
    private String orderNumber;
    private UserDto user; // Customer
    private String status;
    private BigDecimal subtotal;
    private BigDecimal commissionAmount;
    private BigDecimal payoutAmount;
    private LocalDateTime orderDate;
    private Map<String, Object> shipping;
    private List<SellerOrderItemDto> items;

    public SellerOrderDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMainOrderId() { return mainOrderId; }
    public void setMainOrderId(Long mainOrderId) { this.mainOrderId = mainOrderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }

    public BigDecimal getPayoutAmount() { return payoutAmount; }
    public void setPayoutAmount(BigDecimal payoutAmount) { this.payoutAmount = payoutAmount; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public Map<String, Object> getShipping() { return shipping; }
    public void setShipping(Map<String, Object> shipping) { this.shipping = shipping; }

    public List<SellerOrderItemDto> getItems() { return items; }
    public void setItems(List<SellerOrderItemDto> items) { this.items = items; }
}
