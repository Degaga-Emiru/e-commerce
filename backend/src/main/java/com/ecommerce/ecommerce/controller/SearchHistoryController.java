package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.dto.SearchHistoryDto;
import com.ecommerce.ecommerce.entity.SearchHistory;
import com.ecommerce.ecommerce.service.SearchHistoryService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search-history")
@CrossOrigin(origins = "*")
public class SearchHistoryController {
    private final SearchHistoryService searchHistoryService;
    private final com.ecommerce.ecommerce.service.UserService userService;

    public SearchHistoryController(SearchHistoryService searchHistoryService, com.ecommerce.ecommerce.service.UserService userService) {
        this.searchHistoryService = searchHistoryService;
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<SearchHistoryDto>>> getMyHistory() {
        try {
            Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
            List<SearchHistory> history = searchHistoryService.getSearchHistory(userId);
            List<SearchHistoryDto> dtos = history.stream()
                    .map(h -> new SearchHistoryDto(h.getId(), h.getQuery(), h.getSearchedAt()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "Search history retrieved", dtos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> clearMyHistory() {
        try {
            Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
            searchHistoryService.clearHistory(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Search history cleared"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }
}
