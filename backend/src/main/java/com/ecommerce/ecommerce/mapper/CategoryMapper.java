package com.ecommerce.ecommerce.mapper;

import com.ecommerce.ecommerce.dto.CategoryDto;
import com.ecommerce.ecommerce.entity.Category;
import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryDto toDto(Category category) {
        if (category == null) return null;
        
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setImageUrl(category.getImageUrl());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setProductCount(category.getProducts() != null ? category.getProducts().size() : 0);
        
        if (category.getParentCategory() != null) {
            dto.setParentId(category.getParentCategory().getId());
        }
        
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            dto.setSubCategories(category.getSubCategories().stream()
                    .map(CategoryMapper::toDto)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }
}

