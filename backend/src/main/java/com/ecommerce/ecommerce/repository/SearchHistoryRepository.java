package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.SearchHistory;
import com.ecommerce.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserOrderBySearchedAtDesc(User user);
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(Long userId);
    void deleteByUser(User user);
}
