package com.ecommerce.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "product_attribute_values")
public class ProductAttributeValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_id", nullable = false)
    private CategoryAttribute attribute;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String value;

    // Constructors
    public ProductAttributeValue() {}

    public ProductAttributeValue(Product product, CategoryAttribute attribute, String value) {
        this.product = product;
        this.attribute = attribute;
        this.value = value;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public CategoryAttribute getAttribute() { return attribute; }
    public void setAttribute(CategoryAttribute attribute) { this.attribute = attribute; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
