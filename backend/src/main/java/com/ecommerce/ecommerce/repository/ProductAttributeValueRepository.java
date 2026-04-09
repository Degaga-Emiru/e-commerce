package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
    List<ProductAttributeValue> findByProductId(Long productId);
    void deleteByProductId(Long productId);
}
