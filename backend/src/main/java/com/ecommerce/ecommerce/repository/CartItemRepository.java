package com.ecommerce.ecommerce.repository;
import com.ecommerce.ecommerce.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND " +
           "(:variantId IS NULL OR ci.variant.id = :variantId) AND " +
           "(ci.variant IS NULL OR ci.variant.id = :variantId)")
    Optional<CartItem> findByCartIdAndProductIdAndVariantId(@Param("cartId") Long cartId, @Param("productId") Long productId, @Param("variantId") Long variantId);
    
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId AND (:variantId IS NULL OR ci.variant.id = :variantId)")
    void deleteByCartIdAndProductIdAndVariantId(@Param("cartId") Long cartId, @Param("productId") Long productId, @Param("variantId") Long variantId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    void deleteByCartIdAndProductId(@Param("cartId") Long cartId, @Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteByCartId(@Param("cartId") Long cartId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.user.id = :userId")
    List<CartItem> findByUserId(@Param("userId") Long userId);
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.user.id = :userId")
    Integer countItemsInUserCart(@Param("userId") Long userId);

}