package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.ShippingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingHistoryRepository extends JpaRepository<ShippingHistory, Long> {
    List<ShippingHistory> findByShippingIdOrderByTimestampDesc(Long shippingId);
}
