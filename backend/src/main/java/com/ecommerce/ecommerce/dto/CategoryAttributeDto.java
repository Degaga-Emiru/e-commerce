package com.ecommerce.ecommerce.dto;

import com.ecommerce.ecommerce.entity.AttributeType;

public class CategoryAttributeDto {
    private Long id;
    private String name;
    private AttributeType type;
    private boolean required;
    private String options;

    public CategoryAttributeDto() {}

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
}
