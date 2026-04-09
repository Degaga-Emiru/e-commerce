package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.CategoryAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryAttributeRepository extends JpaRepository<CategoryAttribute, Long> {
    List<CategoryAttribute> findByCategoryId(Long categoryId);
}
