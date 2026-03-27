package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.WithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
    List<WithdrawalRequest> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
}
