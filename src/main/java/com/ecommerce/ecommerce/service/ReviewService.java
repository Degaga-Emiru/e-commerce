package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.Review;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.Order;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.ReviewRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.repository.ProductRepository;
import com.ecommerce.ecommerce.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository,
                         ProductRepository productRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public Review createReview(Long userId, Long productId, Integer rating, String comment, Long orderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Check if user has already reviewed this product
        if (reviewRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(rating);
        review.setComment(comment);
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        // Mark as verified purchase if order ID is provided and valid
        if (orderId != null) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

            if (order.getUser().getId().equals(userId) &&
                    order.getStatus() == com.ecommerce.entity.OrderStatus.DELIVERED) {
                review.setOrder(order);
                review.setVerifiedPurchase(true);
            }
        }

        return reviewRepository.save(review);
    }

    public Review updateReview(Long reviewId, Integer rating, String comment) {
        Review review = getReviewById(reviewId);

        if (rating != null) {
            if (rating < 1 || rating > 5) {
                throw new RuntimeException("Rating must be between 1 and 5");
            }
            review.setRating(rating);
        }

        if (comment != null) {
            review.setComment(comment);
        }

        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    public void deleteReview(Long reviewId) {
        Review review = getReviewById(reviewId);
        reviewRepository.delete(review);
    }

    public Review getReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
    }

    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Double getAverageRatingForProduct(Long productId) {
        Double averageRating = reviewRepository.findAverageRatingByProductId(productId);
        return averageRating != null ? averageRating : 0.0;
    }

    public Long getReviewCountForProduct(Long productId) {
        return reviewRepository.countByProductId(productId);
    }

    public List<Review> getTopRatedReviewsForProduct(Long productId) {
        return reviewRepository.findTopRatedReviewsByProduct(productId);
    }

    public List<Review> getVerifiedReviewsForProduct(Long productId) {
        return reviewRepository.findVerifiedReviewsByProduct(productId);
    }

    public boolean hasUserReviewedProduct(Long userId, Long productId) {
        return reviewRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }
}
