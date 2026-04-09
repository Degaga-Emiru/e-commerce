package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.SearchHistory;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.repository.SearchHistoryRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SearchHistoryService {
    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;

    public SearchHistoryService(SearchHistoryRepository searchHistoryRepository, UserRepository userRepository) {
        this.searchHistoryRepository = searchHistoryRepository;
        this.userRepository = userRepository;
    }

    public void saveSearch(Long userId, String query) {
        if (query == null || query.isBlank()) return;
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        // Check if query already exists for user to avoid duplicates, or just add new
        // For simplicity, we just add new entries
        SearchHistory searchHistory = new SearchHistory(user, query.trim());
        searchHistoryRepository.save(searchHistory);
    }

    public List<SearchHistory> getSearchHistory(Long userId) {
        return searchHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId);
    }

    public void clearHistory(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            searchHistoryRepository.deleteByUser(user);
        }
    }
}
