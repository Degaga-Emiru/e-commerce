package com.ecommerce.ecommerce.dto;

public class ProductAttributeValueDto {
    private Long id;
    private Long attributeId;
    private String attributeName;
    private String value;

    public ProductAttributeValueDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAttributeId() { return attributeId; }
    public void setAttributeId(Long attributeId) { this.attributeId = attributeId; }

    public String getAttributeName() { return attributeName; }
    public void setAttributeName(String attributeName) { this.attributeName = attributeName; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
