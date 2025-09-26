package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.dto.ProductDto;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.ProductStatus;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.ProductRepository;
import com.ecommerce.ecommerce.repository.CategoryRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
                          UserRepository userRepository, FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    public List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice);
    }

    public Product createProduct(Product product, Long sellerId, MultipartFile imageFile) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        if (!seller.getRole().equals(com.ecommerce.ecommerce.entity.UserRole.SELLER) &&
                !seller.getRole().equals(com.ecommerce.ecommerce.entity.UserRole.ADMIN)) {
            throw new RuntimeException("User is not authorized to create products");
        }

        product.setSeller(seller);
        product.setStatus(ProductStatus.ACTIVE);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile);
            product.setImageUrl(imageUrl);
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long productId, Product productDetails, MultipartFile imageFile) {
        Product product = getProductById(productId);

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setCategory(productDetails.getCategory());
        product.setStatus(productDetails.getStatus());
        product.setUpdatedAt(LocalDateTime.now());

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile);
            product.setImageUrl(imageUrl);
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long productId) {
        Product product = getProductById(productId);
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    public List<Product> getAvailableProducts() {
        return productRepository.findAvailableProducts();
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findAvailableProducts().stream()
                .limit(10)
                .collect(Collectors.toList());
    }

    public void updateProductStock(Long productId, Integer quantity) {
        Product product = getProductById(productId);
        int newStock = product.getStockQuantity() - quantity;
        if (newStock < 0) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }
        product.setStockQuantity(newStock);
        if (newStock == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }
        productRepository.save(product);
    }

    public Long getProductCountBySeller(Long sellerId) {
        return productRepository.countBySellerId(sellerId);
    }

    public List<Product> getProductsWithFilters(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String sortBy) {
        List<Product> products;

        if (categoryId != null && minPrice != null && maxPrice != null) {
            products = productRepository.findByCategoryAndPriceRange(categoryId, minPrice, maxPrice);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else if (minPrice != null && maxPrice != null) {
            products = productRepository.findByPriceRange(minPrice, maxPrice);
        } else {
            products = productRepository.findAvailableProducts();
        }

        // Sort products
        if ("price_asc".equals(sortBy)) {
            products.sort((p1, p2) -> p1.getPrice().compareTo(p2.getPrice()));
        } else if ("price_desc".equals(sortBy)) {
            products.sort((p1, p2) -> p2.getPrice().compareTo(p1.getPrice()));
        } else if ("name".equals(sortBy)) {
            products.sort((p1, p2) -> p1.getName().compareToIgnoreCase(p2.getName()));
        } else if ("newest".equals(sortBy)) {
            products.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
        }

        return products;
    }
}
