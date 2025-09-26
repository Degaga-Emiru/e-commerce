package com.ecommerce.ecommerce.controller;
import com.ecommerce.ecommerce.entity.Review;
import com.ecommerce.ecommerce.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.ecommerce.dto.ApiResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> reviewRequest) {
        try {
            Long userId = Long.valueOf(reviewRequest.get("userId").toString());
            Long productId = Long.valueOf(reviewRequest.get("productId").toString());
            Integer rating = Integer.valueOf(reviewRequest.get("rating").toString());
            String comment = (String) reviewRequest.get("comment");
            Long orderId = reviewRequest.get("orderId") != null ?
                    Long.valueOf(reviewRequest.get("orderId").toString()) : null;

            Review review = reviewService.createReview(userId, productId, rating, comment, orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review created successfully");
            response.put("review", review);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProduct(@PathVariable Long productId) {
        try {
            List<Review> reviews = reviewService.getReviewsByProduct(productId);
            Double averageRating = reviewService.getAverageRatingForProduct(productId);
            Long reviewCount = reviewService.getReviewCountForProduct(productId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviews", reviews);
            response.put("averageRating", averageRating);
            response.put("reviewCount", reviewCount);
            response.put("productId", productId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getReviewsByUser(@PathVariable Long userId) {
        try {
            List<Review> reviews = reviewService.getReviewsByUser(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviews", reviews);
            response.put("userId", userId);
            response.put("count", reviews.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> updateReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> updateRequest) {
        try {
            Integer rating = updateRequest.get("rating") != null ?
                    Integer.valueOf(updateRequest.get("rating").toString()) : null;
            String comment = (String) updateRequest.get("comment");

            Review updatedReview = reviewService.updateReview(reviewId, rating, comment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review updated successfully");
            response.put("review", updatedReview);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try {
            reviewService.deleteReview(reviewId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<?> getProductReviewStats(@PathVariable Long productId) {
        try {
            Double averageRating = reviewService.getAverageRatingForProduct(productId);
            Long reviewCount = reviewService.getReviewCountForProduct(productId);
            List<Review> topReviews = reviewService.getTopRatedReviewsForProduct(productId);
            List<Review> verifiedReviews = reviewService.getVerifiedReviewsForProduct(productId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("productId", productId);
            response.put("averageRating", averageRating);
            response.put("reviewCount", reviewCount);
            response.put("topReviews", topReviews);
            response.put("verifiedReviews", verifiedReviews);
            response.put("verifiedReviewCount", verifiedReviews.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewById(@PathVariable Long reviewId) {
        try {
            Review review = reviewService.getReviewById(reviewId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("review", review);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}