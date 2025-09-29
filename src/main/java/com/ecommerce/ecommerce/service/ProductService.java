package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.dto.ProductDto;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.ProductStatus;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.mapper.ProductMapper;
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
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
                          UserRepository userRepository, FileStorageService fileStorageService,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.productMapper = productMapper;
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return productMapper.toDtoList(products);
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toDto(product);
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public List<ProductDto> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return productMapper.toDtoList(products);
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public List<ProductDto> getProductsBySeller(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return productMapper.toDtoList(products);
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public List<ProductDto> searchProducts(String query) {
        List<Product> products = productRepository.searchProducts(query);
        return productMapper.toDtoList(products);
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public List<ProductDto> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products = productRepository.findByPriceRange(minPrice, maxPrice);
        return productMapper.toDtoList(products);
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public List<ProductDto> getAvailableProducts() {
        List<Product> products = productRepository.findAvailableProducts();
        return productMapper.toDtoList(products);
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public List<ProductDto> getFeaturedProducts() {
        List<Product> products = productRepository.findAvailableProducts().stream()
                .limit(10)
                .collect(Collectors.toList());
        return productMapper.toDtoList(products);
    }

    // ✅ UPDATED: Return ProductDto instead of Product
    public List<ProductDto> getProductsWithFilters(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String sortBy) {
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

        return productMapper.toDtoList(products);
    }

    // ❌ KEEP AS-IS: These methods need to return Product entities for database operations
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

    // ❌ KEEP AS-IS: These methods need to return Product entities for database operations
    public Product updateProduct(Long productId, Product productDetails, MultipartFile imageFile) {
        Product product = getProductEntityById(productId);

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

    // ❌ KEEP AS-IS: These methods need to return Product entities for database operations
    public void deleteProduct(Long productId) {
        Product product = getProductEntityById(productId);
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    // ❌ KEEP AS-IS: These methods need to return Product entities for database operations
    public void updateProductStock(Long productId, Integer quantity) {
        Product product = getProductEntityById(productId);
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

    // ❌ KEEP AS-IS: These methods need to return Product entities for database operations
    public Long getProductCountBySeller(Long sellerId) {
        return productRepository.countBySellerId(sellerId);
    }

    // ✅ ADD THIS: Helper method to get Product entity (for internal use)
    private Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
}