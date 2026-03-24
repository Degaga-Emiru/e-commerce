package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.Escrow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EscrowRepository extends JpaRepository<Escrow, Long> {
    Optional<Escrow> findByOrderId(Long orderId);
    void deleteByOrderId(Long orderId);
}
