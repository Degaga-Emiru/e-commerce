package com.ecommerce.ecommerce.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
public class PaymentRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private String paymentMethod;

    @NotNull
    private String accountNumber;

    @NotNull
    private String routingNumber;

    private String cardHolderName;
    private String expiryDate;
    private String cvv;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal amount;

    private String currency = "USD";

    // Optional: for multi-seller orders
    private Map<Long, BigDecimal> sellerAmounts; // key = sellerId, value = subtotal for that seller

    // Getters and Setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getRoutingNumber() { return routingNumber; }
    public void setRoutingNumber(String routingNumber) { this.routingNumber = routingNumber; }

    public String getCardHolderName() { return cardHolderName; }
    public void setCardHolderName(String cardHolderName) { this.cardHolderName = cardHolderName; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getCvv() { return cvv; }
    public void setCvv(String cvv) { this.cvv = cvv; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Map<Long, BigDecimal> getSellerAmounts() { return sellerAmounts; }
    public void setSellerAmounts(Map<Long, BigDecimal> sellerAmounts) { this.sellerAmounts = sellerAmounts; }
}
