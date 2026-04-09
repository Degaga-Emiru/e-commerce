package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.WishlistItem;
import com.ecommerce.ecommerce.entity.Wishlist;
import com.ecommerce.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    Optional<WishlistItem> findByWishlistAndProduct(Wishlist wishlist, Product product);

    @Modifying
    @Transactional
    @Query("DELETE FROM WishlistItem wi WHERE wi.wishlist = :wishlist AND wi.product.id = :productId")
    void deleteByWishlistAndProductId(@Param("wishlist") Wishlist wishlist, @Param("productId") Long productId);
}
