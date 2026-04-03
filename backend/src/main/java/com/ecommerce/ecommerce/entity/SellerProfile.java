package com.ecommerce.ecommerce.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_profiles")
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(name = "shop_name", nullable = false)
    private String shopName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "business_address")
    private String businessAddress;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "business_registration_number")
    private String businessRegistrationNumber;

    // Notification Toggles
    @Column(name = "email_new_order")
    private boolean emailNewOrder = true;

    @Column(name = "email_shipping_update")
    private boolean emailShippingUpdate = true;

    @Column(name = "email_escrow_release")
    private boolean emailEscrowRelease = true;

    @Column(name = "available_balance", precision = 15, scale = 2)
    private BigDecimal availableBalance = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public SellerProfile() {}

    public SellerProfile(User user, String shopName, String description) {
        this.user = user;
        this.shopName = shopName;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    
    public String getBusinessAddress() { return businessAddress; }
    public void setBusinessAddress(String businessAddress) { this.businessAddress = businessAddress; }
    
    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
    
    public String getBusinessRegistrationNumber() { return businessRegistrationNumber; }
    public void setBusinessRegistrationNumber(String businessRegistrationNumber) { this.businessRegistrationNumber = businessRegistrationNumber; }
    
    public boolean isEmailNewOrder() { return emailNewOrder; }
    public void setEmailNewOrder(boolean emailNewOrder) { this.emailNewOrder = emailNewOrder; }
    
    public boolean isEmailShippingUpdate() { return emailShippingUpdate; }
    public void setEmailShippingUpdate(boolean emailShippingUpdate) { this.emailShippingUpdate = emailShippingUpdate; }
    
    public boolean isEmailEscrowRelease() { return emailEscrowRelease; }
    public void setEmailEscrowRelease(boolean emailEscrowRelease) { this.emailEscrowRelease = emailEscrowRelease; }

    public BigDecimal getAvailableBalance() { return availableBalance; }
    public void setAvailableBalance(BigDecimal availableBalance) { this.availableBalance = availableBalance; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
