package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.dto.ReviewDto;
import com.ecommerce.ecommerce.entity.Review;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.Order;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.ReviewRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.repository.ProductRepository;
import com.ecommerce.ecommerce.repository.OrderRepository;
import com.ecommerce.ecommerce.mapper.ReviewMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewMapper reviewMapper;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository,
                         ProductRepository productRepository, OrderRepository orderRepository,
                         ReviewMapper reviewMapper) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.reviewMapper = reviewMapper;
    }

    public ReviewDto createReview(Long userId, Long productId, Integer rating, String comment, Long orderId, List<String> images) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow();

        // Check if user has already reviewed this product - REMOVED to allow multiple reviews
        /*
        if (reviewRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }
        */

        // 🛡️ MODERATION: Only allow reviews for purchased products
        if (!orderRepository.hasPurchasedProduct(userId, productId)) {
            throw new RuntimeException("You can only review products that you have purchased and received.");
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
        review.setVerifiedPurchase(true); // Hardcoded to true now since we check purchase
        if (images != null) {
            review.setImages(images);
        }

        // Optional: Link to a specific order if provided
        if (orderId != null) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
            if (order.getUser().getId().equals(userId)) {
                review.setOrder(order);
            }
        }

        Review savedReview = reviewRepository.save(review);
        recalculateProductRating(productId);
        return reviewMapper.toDto(savedReview);
    }

    public ReviewDto updateReview(Long reviewId, Integer rating, String comment) {
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

        Review updatedReview = reviewRepository.save(review);
        recalculateProductRating(review.getProduct().getId());
        return reviewMapper.toDto(updatedReview);
    }

    public void deleteReview(Long reviewId) {
        Review review = getReviewById(reviewId);
        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);
        recalculateProductRating(productId);
    }

    private void recalculateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);

        product.setAverageRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        product.setReviewCount(count.intValue());
        productRepository.save(product);
    }

    public ReviewDto getReviewDtoById(Long reviewId) {
        Review review = getReviewById(reviewId);
        return reviewMapper.toDto(review);
    }

    public Review getReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
    }

    public List<ReviewDto> getReviewsByProduct(Long productId) {
        return reviewMapper.toDtoList(reviewRepository.findByProductId(productId));
    }

    public List<ReviewDto> getReviewsByUser(Long userId) {
        return reviewMapper.toDtoList(reviewRepository.findByUserId(userId));
    }

    public Double getAverageRatingForProduct(Long productId) {
        Double averageRating = reviewRepository.findAverageRatingByProductId(productId);
        return averageRating != null ? averageRating : 0.0;
    }

    public Long getReviewCountForProduct(Long productId) {
        return reviewRepository.countByProductId(productId);
    }

    public List<ReviewDto> getTopRatedReviewsForProduct(Long productId) {
        return reviewMapper.toDtoList(reviewRepository.findTopRatedReviewsByProduct(productId));
    }

    public List<ReviewDto> getVerifiedReviewsForProduct(Long productId) {
        return reviewMapper.toDtoList(reviewRepository.findVerifiedReviewsByProduct(productId));
    }

    public boolean hasUserReviewedProduct(Long userId, Long productId) {
        return reviewRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }

    public boolean hasUserPurchasedProduct(Long userId, Long productId) {
        return orderRepository.hasPurchasedProduct(userId, productId);
    }
}
