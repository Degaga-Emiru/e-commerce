package com.ecommerce.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    private String transactionId;
    private String status;
    private String message;
    private BigDecimal amount;
    private BigDecimal commission;
    private LocalDateTime paymentDate;
    private String bankReference;
    private BigDecimal refundedAmount;
    private boolean escrowHeld;
    private boolean escrowReleased;

    // Getters and Setters
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getCommission() { return commission; }
    public void setCommission(BigDecimal commission) { this.commission = commission; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public String getBankReference() { return bankReference; }
    public void setBankReference(String bankReference) { this.bankReference = bankReference; }

    public boolean isEscrowHeld() { return escrowHeld; }
    public void setEscrowHeld(boolean escrowHeld) { this.escrowHeld = escrowHeld; }

    public boolean isEscrowReleased() { return escrowReleased; }
    public void setEscrowReleased(boolean escrowReleased) { this.escrowReleased = escrowReleased; }

    public BigDecimal getRefundedAmount() { return refundedAmount; }
    public void setRefundedAmount(BigDecimal refundedAmount) { this.refundedAmount = refundedAmount; }
}
