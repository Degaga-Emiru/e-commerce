package com.ecommerce.ecommerce.dto;

import java.util.List;

public class SearchSuggestionsDto {
    private List<ProductDto> products;
    private List<CategoryDto> categories;

    public SearchSuggestionsDto() {}

    public SearchSuggestionsDto(List<ProductDto> products, List<CategoryDto> categories) {
        this.products = products;
        this.categories = categories;
    }

    public List<ProductDto> getProducts() { return products; }
    public void setProducts(List<ProductDto> products) { this.products = products; }

    public List<CategoryDto> getCategories() { return categories; }
    public void setCategories(List<CategoryDto> categories) { this.categories = categories; }
}
