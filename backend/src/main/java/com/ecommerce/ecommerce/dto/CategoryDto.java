package com.ecommerce.ecommerce.dto;
import java.time.LocalDateTime;
import java.util.List;

public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer productCount;
    private Long parentId;
    private List<CategoryDto> subCategories;
    private List<CategoryAttributeDto> attributes;

    public CategoryDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getProductCount() { return productCount; }
    public void setProductCount(Integer productCount) { this.productCount = productCount; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public List<CategoryDto> getSubCategories() { return subCategories; }
    public void setSubCategories(List<CategoryDto> subCategories) { this.subCategories = subCategories; }

    public List<CategoryAttributeDto> getAttributes() { return attributes; }
    public void setAttributes(List<CategoryAttributeDto> attributes) { this.attributes = attributes; }
}