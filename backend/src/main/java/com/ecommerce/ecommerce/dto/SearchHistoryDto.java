package com.ecommerce.ecommerce.dto;

import java.time.LocalDateTime;

public class SearchHistoryDto {
    private Long id;
    private String query;
    private LocalDateTime searchedAt;

    public SearchHistoryDto() {}

    public SearchHistoryDto(Long id, String query, LocalDateTime searchedAt) {
        this.id = id;
        this.query = query;
        this.searchedAt = searchedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public LocalDateTime getSearchedAt() { return searchedAt; }
    public void setSearchedAt(LocalDateTime searchedAt) { this.searchedAt = searchedAt; }
}
