package com.ecommerce.ecommerce.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "verified_purchase")
    private Boolean verifiedPurchase = false;

    @Column(name = "helpful_votes")
    private Integer helpfulVotes = 0;

    @Column(name = "total_votes")
    private Integer totalVotes = 0;

    @Column(name = "is_approved")
    private Boolean isApproved = true; // For moderation

    @Column(name = "admin_notes")
    private String adminNotes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        // Auto-approve reviews with rating >= 3, others need moderation
        if (rating != null && rating >= 3) {
            isApproved = true;
        } else {
            isApproved = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Review() {}

    public Review(User user, Product product, Integer rating, String comment) {
        this.user = user;
        this.product = product;
        this.rating = rating;
        this.comment = comment;
        this.verifiedPurchase = false;
    }

    public Review(User user, Product product, Order order, Integer rating, String comment) {
        this.user = user;
        this.product = product;
        this.order = order;
        this.rating = rating;
        this.comment = comment;
        this.verifiedPurchase = (order != null);
    }

    // Business Methods
    public Double getHelpfulPercentage() {
        if (totalVotes == 0) return 0.0;
        return (helpfulVotes * 100.0) / totalVotes;
    }

    public void markHelpful() {
        this.helpfulVotes++;
        this.totalVotes++;
    }

    public void markNotHelpful() {
        this.totalVotes++;
    }

    public boolean isVerifiedPurchase() {
        return Boolean.TRUE.equals(verifiedPurchase);
    }

    public boolean isApproved() {
        return Boolean.TRUE.equals(isApproved);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
        // Auto-set verified purchase if order is provided
        if (order != null) {
            this.verifiedPurchase = true;
        }
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getVerifiedPurchase() {
        return verifiedPurchase;
    }

    public void setVerifiedPurchase(Boolean verifiedPurchase) {
        this.verifiedPurchase = verifiedPurchase;
    }

    public Integer getHelpfulVotes() {
        return helpfulVotes;
    }

    public void setHelpfulVotes(Integer helpfulVotes) {
        this.helpfulVotes = helpfulVotes != null ? helpfulVotes : 0;
    }

    public Integer getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Integer totalVotes) {
        this.totalVotes = totalVotes != null ? totalVotes : 0;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    // Utility methods
    public String getRatingStars() {
        if (rating == null) return "";
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    }

    public boolean canEditReview() {
        // Allow editing within 24 hours of creation
        return createdAt != null &&
                createdAt.isAfter(LocalDateTime.now().minusHours(24));
    }

    @Override
    public String toString() {
        return "Review{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : null) +
                ", productId=" + (product != null ? product.getId() : null) +
                ", rating=" + rating +
                ", verifiedPurchase=" + verifiedPurchase +
                ", createdAt=" + createdAt +
                '}';
    }
}