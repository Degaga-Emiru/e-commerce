package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.dto.ReviewDto;
import com.ecommerce.ecommerce.entity.Review;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.service.FileStorageService;
import com.ecommerce.ecommerce.service.ReviewService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    
    public ReviewController(ReviewService reviewService, UserRepository userRepository, FileStorageService fileStorageService) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> reviewRequest) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Long userId = user.getId();
            
            Long productId = reviewRequest.get("productId") != null ? 
                    Long.valueOf(reviewRequest.get("productId").toString()) : null;
            Integer rating = reviewRequest.get("rating") != null ? 
                    Integer.valueOf(reviewRequest.get("rating").toString()) : null;
            
            if (productId == null || rating == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Product ID and rating are required"));
            }

            String comment = (String) reviewRequest.get("comment");
            Long orderId = reviewRequest.get("orderId") != null ?
                    Long.valueOf(reviewRequest.get("orderId").toString()) : null;
            
            @SuppressWarnings("unchecked")
            List<String> images = (List<String>) reviewRequest.get("images");

            ReviewDto reviewDto = reviewService.createReview(userId, productId, rating, comment, orderId, images);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review created successfully");
            response.put("review", reviewDto);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log for debug
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Submit failed: " + e.getMessage()));
        }
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            String imageUrl = fileStorageService.storeFile(image);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> checkReviewEligibility(@RequestParam Long productId) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean hasPurchased = reviewService.hasUserPurchasedProduct(user.getId(), productId);
            boolean hasReviewed = reviewService.hasUserReviewedProduct(user.getId(), productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("canReview", hasPurchased);
            response.put("hasPurchased", hasPurchased);
            response.put("hasReviewed", hasReviewed);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", true, "canReview", false));
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProduct(@PathVariable Long productId) {
        try {
            List<ReviewDto> reviews = reviewService.getReviewsByProduct(productId);
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
            List<ReviewDto> reviews = reviewService.getReviewsByUser(userId);

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

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyReviews() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<ReviewDto> reviews = reviewService.getReviewsByUser(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviews", reviews);
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

            ReviewDto updatedReview = reviewService.updateReview(reviewId, rating, comment);

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
            List<ReviewDto> topReviews = reviewService.getTopRatedReviewsForProduct(productId);
            List<ReviewDto> verifiedReviews = reviewService.getVerifiedReviewsForProduct(productId);

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
            ReviewDto review = reviewService.getReviewDtoById(reviewId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("review", review);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}