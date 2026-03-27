package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.SellerOrder;
import com.ecommerce.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SellerOrderRepository extends JpaRepository<SellerOrder, Long> {
    List<SellerOrder> findBySeller(User seller);
    List<SellerOrder> findBySellerId(Long sellerId);
    List<SellerOrder> findByOrderId(Long orderId);
    void deleteByOrderId(Long orderId);

    @Query("SELECT SUM(so.subtotal) FROM SellerOrder so WHERE so.seller = :seller AND so.status = 'PAYOUT_RELEASED'")
    BigDecimal sumSubtotalBySeller(@Param("seller") User seller);

    @Query("SELECT COUNT(so) FROM SellerOrder so WHERE so.seller = :seller")
    Long countBySeller(@Param("seller") User seller);
}
