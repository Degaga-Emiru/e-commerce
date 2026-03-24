package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ShippingRepository extends JpaRepository<Shipping, Long> {
    Optional<Shipping> findByOrderId(Long orderId);
    void deleteByOrderId(Long orderId);
}
