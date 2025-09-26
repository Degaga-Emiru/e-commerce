package com.ecommerce.ecommerce.repository;
import com.ecommerce.entity.DiscountCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountCouponRepository extends JpaRepository<DiscountCoupon, Long> {
    Optional<DiscountCoupon> findByCode(String code);
    List<DiscountCoupon> findByActiveTrue();

    @Query("SELECT c FROM DiscountCoupon c WHERE c.active = true AND c.expiryDate > :currentDate")
    List<DiscountCoupon> findActiveCoupons(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT c FROM DiscountCoupon c WHERE c.forNewUsers = true AND c.active = true AND c.expiryDate > :currentDate")
    List<DiscountCoupon> findActiveNewUserCoupons(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT COUNT(c) FROM DiscountCoupon c WHERE c.active = true")
    Long countActiveCoupons();
}