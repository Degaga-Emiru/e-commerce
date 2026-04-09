package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.entity.Wishlist;
import com.ecommerce.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUser(User user);
    Optional<Wishlist> findByUserId(Long userId);
}
