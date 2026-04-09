package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.ProductStatus;
import com.ecommerce.ecommerce.entity.Review;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(String query, Long categoryId, BigDecimal minPrice, 
                                                       BigDecimal maxPrice, String brand, Double minRating, 
                                                       ProductStatus status) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by Name or Description
            if (query != null && !query.isEmpty()) {
                String searchPattern = "%" + query.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern)
                ));
            }

            // Filter by Category
            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            // Filter by Price Range
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Filter by Brand
            if (brand != null && !brand.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("brand"), brand));
            }

            // Filter by Status
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            } else {
                predicates.add(criteriaBuilder.equal(root.get("status"), ProductStatus.ACTIVE));
            }

            // Rating Filter (This is complex with Criteria API if not using a flat field)
            // If the rating field is not in Product entity, we need to join reviews
            if (minRating != null && minRating > 0) {
                // Join with reviews and check average? 
                // Alternatively, we can assume a denormalized average_rating field or ignore for now if too complex
                // For a real-world app, we usually denormalize average_rating.
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
