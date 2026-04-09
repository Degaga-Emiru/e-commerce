package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ProductDto;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.ecommerce.ecommerce.dto.ApiResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;
    private final ObjectMapper objectMapper;
    private final com.ecommerce.ecommerce.service.SearchHistoryService searchHistoryService;

    public ProductController(ProductService productService, ObjectMapper objectMapper, com.ecommerce.ecommerce.service.SearchHistoryService searchHistoryService) {
        this.productService = productService;
        this.objectMapper = objectMapper;
        this.searchHistoryService = searchHistoryService;
    }
    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<ProductDto> products = productService.getAllProducts();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("count", products.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            ProductDto product = productService.getProductById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("product", product);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<?> getProductsFiltered(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String sortBy) {
        try {
            List<ProductDto> products = productService.getProductsWithFilters(
                query, categoryId, minPrice, maxPrice, brand, minRating, sortBy
            );

            // Log search history if query is provided and user is authenticated
            if (query != null && !query.isBlank()) {
                logSearchQuery(query);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("count", products.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String query) {
        try {
            List<ProductDto> products = productService.searchProducts(query);
            
            // Log search history if user is authenticated
            logSearchQuery(query);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("query", query);
            response.put("count", products.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable Long categoryId) {
        try {
            List<ProductDto> products = productService.getProductsByCategory(categoryId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("categoryId", categoryId);
            response.put("count", products.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedProducts() {
        try {
            List<ProductDto> products = productService.getFeaturedProducts();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("products", products);
            response.put("count", products.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // ❌ KEEP THESE METHODS AS-IS - They handle Product entities internally
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(
            @RequestPart("productData") String productDataJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            ProductDto productDto = objectMapper.readValue(productDataJson, ProductDto.class);
            Long sellerId = getAuthenticatedUserId();

            ProductDto createdProduct = productService.createProduct(productDto, sellerId, image);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product created successfully");
            response.put("product", createdProduct);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error creating product: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestPart("productData") String productDataJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            ProductDto productDto = objectMapper.readValue(productDataJson, ProductDto.class);
            productDto.setId(id);

            Long sellerId = getAuthenticatedUserId();
            ProductDto updatedProduct = productService.updateProduct(productDto, sellerId, image);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product updated successfully");
            response.put("product", updatedProduct);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error updating product: " + e.getMessage()));
        }
    }
    // ✅ CORRECTED: Helper method with proper Spring Security Authentication
    private Long getAuthenticatedUserId() {
        // ✅ Now using Spring Security's Authentication interface
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            return null;
        }

        // Get the email/username from authentication and look up user ID
        String email = authentication.getName(); // ✅ This will now work
        return productService.getUserIdByEmail(email);
    }

    private void logSearchQuery(String query) {
        try {
            Long userId = getAuthenticatedUserId();
            if (userId != null) {
                searchHistoryService.saveSearch(userId, query);
            }
        } catch (Exception ignored) {
            // Logging search should not fail the search request
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            // You might want to add authorization check here too
            Long sellerId = getAuthenticatedUserId();
            productService.deleteProduct(id, sellerId); // Use the version that takes sellerId

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}