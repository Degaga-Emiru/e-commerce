package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.WishlistItem;
import com.ecommerce.ecommerce.entity.Wishlist;
import com.ecommerce.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    Optional<WishlistItem> findByWishlistAndProduct(Wishlist wishlist, Product product);
    void deleteByWishlistAndProductId(Wishlist wishlist, Long productId);
}
