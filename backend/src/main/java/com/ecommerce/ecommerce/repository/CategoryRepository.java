package com.ecommerce.ecommerce.repository;
import com.ecommerce.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    List<Category> findByNameContainingIgnoreCase(String name);

    @Query("SELECT c FROM Category c WHERE c.id IN (SELECT p.category.id FROM Product p GROUP BY p.category.id HAVING COUNT(p) > 0)")
    List<Category> findCategoriesWithProducts();

    @Query("SELECT c, COUNT(p) FROM Category c LEFT JOIN Product p ON p.category = c GROUP BY c")
    List<Object[]> findCategoryProductCounts();
}