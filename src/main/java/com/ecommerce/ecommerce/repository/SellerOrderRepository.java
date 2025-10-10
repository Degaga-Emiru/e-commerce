package com.ecommerce.ecommerce.repository;
import com.ecommerce.ecommerce.entity.SellerOrder;
import com.ecommerce.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SellerOrderRepository extends JpaRepository<SellerOrder, Long> {
    List<SellerOrder> findBySeller(User seller);
    List<SellerOrder> findByOrderId(Long orderId);
}
