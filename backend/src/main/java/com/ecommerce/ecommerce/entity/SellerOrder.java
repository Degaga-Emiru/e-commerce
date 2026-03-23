package com.ecommerce.ecommerce.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "seller_orders")
public class SellerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The main order (one customer order may have multiple seller sub-orders)
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "order_id", nullable = false)
//    private Order parentOrder;

    // Link to the main customer order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // The seller responsible for these items
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SellerOrderStatus status = SellerOrderStatus.PENDING;
    private BigDecimal subtotal;
    private BigDecimal commissionAmount;
    private BigDecimal payoutAmount;
    //private String status;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "sellerOrder", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    // ✅ Default constructor (required by JPA)
    public SellerOrder() {
    }

    // ✅ Parameterized constructor for convenience
    public SellerOrder( Order order, User seller, BigDecimal subtotal,
                       BigDecimal commissionAmount, BigDecimal payoutAmount, SellerOrderStatus status,
                       List<OrderItem> items) {
        //this.parentOrder = parentOrder;
        this.order = order;
        this.seller = seller;
        this.subtotal = subtotal;
        this.commissionAmount = commissionAmount;
        this.payoutAmount = payoutAmount;
        this.status = status;
        this.items = items;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

//    public Order getParentOrder() { return parentOrder; }
//    public void setParentOrder(Order parentOrder) { this.parentOrder = parentOrder; }

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }

    public BigDecimal getPayoutAmount() { return payoutAmount; }
    public void setPayoutAmount(BigDecimal payoutAmount) { this.payoutAmount = payoutAmount; }

    public SellerOrderStatus getStatus() { return status; }
    public void setStatus(SellerOrderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
