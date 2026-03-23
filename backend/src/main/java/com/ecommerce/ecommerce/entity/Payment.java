package com.ecommerce.ecommerce.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status; // PENDING, SUCCESS, FAILED, ESCROW_HELD, RELEASED

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod; // e.g. "BANK_TRANSFER", "CARD", "PLATFORM_WALLET"

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "bank_reference")
    private String bankReference; // Transaction ref from bank/escrow system

    @Column(name = "escrow_held")
    private Boolean escrowHeld = false;

    @Column(name = "escrow_released")
    private Boolean escrowReleased = false;

    @Column(name = "refunded_amount", precision = 15, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    @Column(name = "customer_account_number")
    private String customerAccountNumber; // Source account (payer)

    @Column(name = "seller_account_number")
    private String sellerAccountNumber; // Destination account (receiver)

    @Column(name = "platform_routing_number")
    private String platformRoutingNumber = "999888777"; // Internal routing number

    @Column(name = "commission_amount", precision = 15, scale = 2)
    private BigDecimal commissionAmount = BigDecimal.ZERO;

    @Column(name = "net_amount_to_seller", precision = 15, scale = 2)
    private BigDecimal netAmountToSeller = BigDecimal.ZERO;

    @Column(name = "escrow_account_number")
    private String escrowAccountNumber = "0001112222"; // Platform escrow account

    @Column(name = "delivery_confirmed")
    private Boolean deliveryConfirmed = false;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    // ======== Lifecycle Methods ========

    @PrePersist
    protected void onCreate() {
        this.paymentDate = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        if (this.transactionId == null) {
            this.transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        if (this.status == null) {
            this.status = PaymentStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    // ======== Constructors ========

    public Payment() {}

    public Payment(Order order, BigDecimal amount, PaymentStatus status, String paymentMethod) {
        this.order = order;
        this.amount = amount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentDate = LocalDateTime.now();
    }

    // ======== Getters and Setters ========

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }

    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Order getOrder() { return order; }

    public void setOrder(Order order) { this.order = order; }

    public BigDecimal getAmount() { return amount; }

    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public PaymentStatus getStatus() { return status; }

    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }

    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getPaymentDate() { return paymentDate; }

    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public String getBankReference() { return bankReference; }

    public void setBankReference(String bankReference) { this.bankReference = bankReference; }

    public Boolean getEscrowHeld() { return escrowHeld; }

    public void setEscrowHeld(Boolean escrowHeld) { this.escrowHeld = escrowHeld; }

    public Boolean getEscrowReleased() { return escrowReleased; }

    public void setEscrowReleased(Boolean escrowReleased) { this.escrowReleased = escrowReleased; }

    public BigDecimal getRefundedAmount() { return refundedAmount; }

    public void setRefundedAmount(BigDecimal refundedAmount) { this.refundedAmount = refundedAmount; }

    public String getCustomerAccountNumber() { return customerAccountNumber; }

    public void setCustomerAccountNumber(String customerAccountNumber) { this.customerAccountNumber = customerAccountNumber; }

    public String getSellerAccountNumber() { return sellerAccountNumber; }

    public void setSellerAccountNumber(String sellerAccountNumber) { this.sellerAccountNumber = sellerAccountNumber; }

    public String getPlatformRoutingNumber() { return platformRoutingNumber; }

    public void setPlatformRoutingNumber(String platformRoutingNumber) { this.platformRoutingNumber = platformRoutingNumber; }

    public BigDecimal getCommissionAmount() { return commissionAmount; }

    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }

    public BigDecimal getNetAmountToSeller() { return netAmountToSeller; }

    public void setNetAmountToSeller(BigDecimal netAmountToSeller) { this.netAmountToSeller = netAmountToSeller; }

    public String getEscrowAccountNumber() { return escrowAccountNumber; }

    public void setEscrowAccountNumber(String escrowAccountNumber) { this.escrowAccountNumber = escrowAccountNumber; }

    public Boolean getDeliveryConfirmed() { return deliveryConfirmed; }

    public void setDeliveryConfirmed(Boolean deliveryConfirmed) { this.deliveryConfirmed = deliveryConfirmed; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }

    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
