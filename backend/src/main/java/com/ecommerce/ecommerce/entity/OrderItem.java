package com.ecommerce.ecommerce.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 The main customer order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // 🔹 The specific product purchased
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 🔹 The seller who owns this product
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "seller_id", nullable = false)
//    private User seller;

    // 🔹 NEW: the seller-specific sub-order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_order_id")
    private SellerOrder sellerOrder;

    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    // 🔹 Constructors
    public OrderItem() {}

    public OrderItem(Order order, Product product, User seller, SellerOrder sellerOrder, Integer quantity, BigDecimal unitPrice) {
        this.order = order;
        this.product = product;
       // this.seller = seller;
        this.sellerOrder = sellerOrder;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    // 🔹 Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    //public User getSeller() { return seller; }
    //public void setSeller(User seller) { this.seller = seller; }

    public SellerOrder getSellerOrder() { return sellerOrder; }
    public void setSellerOrder(SellerOrder sellerOrder) { this.sellerOrder = sellerOrder; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        if (this.unitPrice != null) {
            this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        if (this.quantity != null) {
            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(this.quantity));
        }
    }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
