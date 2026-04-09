package com.ecommerce.ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category_attributes")
public class CategoryAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttributeType type;

    private boolean required;

    @Column(columnDefinition = "TEXT")
    private String options; // For DROPDOWN type, comma-separated values

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnore
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    @JsonIgnore
    private User createdBy;

    // Constructors
    public CategoryAttribute() {}

    public CategoryAttribute(String name, AttributeType type, boolean required, String options, Category category) {
        this.name = name;
        this.type = type;
        this.required = required;
        this.options = options;
        this.category = category;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public AttributeType getType() { return type; }
    public void setType(AttributeType type) { this.type = type; }

    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }

    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
}
