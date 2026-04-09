package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.dto.ProductDto;
import com.ecommerce.ecommerce.dto.ProductVariantDto;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.ProductVariant;
import com.ecommerce.ecommerce.entity.ProductStatus;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.Category;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.mapper.ProductMapper;
import com.ecommerce.ecommerce.repository.ProductRepository;
import com.ecommerce.ecommerce.repository.CategoryRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.repository.ProductSpecification;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
    private final EmailService emailService;

    public ProductService(ProductRepository productRepository,EmailService emailService, CategoryRepository categoryRepository,
                          UserRepository userRepository, FileStorageService fileStorageService,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.productMapper = productMapper;
        this.emailService = emailService;

    }

    // ✅ GET METHODS - Return ProductDto
    public List<ProductDto> getAllProducts() {
        List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return productMapper.toDtoList(products);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toDto(product);
    }

    public List<ProductDto> getProductsByCategory(Long categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        return productMapper.toDtoList(products);
    }

    public List<ProductDto> getProductsBySeller(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return productMapper.toDtoList(products);
    }

    public List<ProductDto> searchProducts(String query) {
        List<Product> products = productRepository.searchProducts(query);
        return productMapper.toDtoList(products);
    }

    public List<ProductDto> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products = productRepository.findByPriceRange(minPrice, maxPrice);
        return productMapper.toDtoList(products);
    }

    public List<ProductDto> getAvailableProducts() {
        List<Product> products = productRepository.findAvailableProducts();
        return productMapper.toDtoList(products);
    }

    public List<ProductDto> getFeaturedProducts() {
        List<Product> products = productRepository.findAvailableProducts().stream()
                .limit(10)
                .collect(Collectors.toList());
        return productMapper.toDtoList(products);
    }

    public List<ProductDto> getProductsWithFilters(String query, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String brand, Double minRating, String sortBy) {
        Specification<Product> spec = ProductSpecification.filterProducts(query, categoryId, minPrice, maxPrice, brand, minRating, ProductStatus.ACTIVE);

        Sort sort = Sort.unsorted();
        if ("price_asc".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("newest".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        } else if ("best_selling".equals(sortBy)) {
            // Placeholder: Sort by popularity or sales count if we have that field
            sort = Sort.by(Sort.Direction.DESC, "createdAt"); 
        }

        List<Product> products = productRepository.findAll(spec, sort);
        return productMapper.toDtoList(products);
    }

    // ✅ NEW: Create product using ProductDto with authentication
    public ProductDto createProduct(ProductDto productDto, Long sellerId, MultipartFile imageFile) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        // Verify user has SELLER or ADMIN role
        if (!seller.getRole().equals(com.ecommerce.ecommerce.entity.UserRole.SELLER) &&
                !seller.getRole().equals(com.ecommerce.ecommerce.entity.UserRole.ADMIN)) {
            throw new RuntimeException("User is not authorized to create products");
        }

        // Convert ProductDto to Product entity
        Product product = productMapper.toEntity(productDto);
        product.setSeller(seller);
        product.setStatus(ProductStatus.ACTIVE);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        // Handle category
        if (productDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDto.getCategoryId()));
            product.setCategory(category);
        }

        // Handle image upload when the admin or seller added the new product
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile);
            product.setImageUrl(imageUrl);
        }

        // Handle Variants
        if (productDto.getVariants() != null && !productDto.getVariants().isEmpty()) {
            List<ProductVariant> variants = productDto.getVariants().stream()
                    .map(vDto -> {
                        ProductVariant v = productMapper.toVariantEntity(vDto);
                        v.setProduct(product);
                        return v;
                    })
                    .collect(Collectors.toList());
            product.setVariants(variants);
            
            // Auto-calculate total stock from variants
            int totalStock = variants.stream().mapToInt(ProductVariant::getStockQuantity).sum();
            product.setStockQuantity(totalStock);
        }

        Product savedProduct = productRepository.save(product);
        try { emailService.sendNewProductNotification(savedProduct); } catch (Exception ignored) {}

        return productMapper.toDto(savedProduct);
    }

    // ✅ NEW: Update product using ProductDto with authorization check that retrive the information  of the custmer from the jwt
    public ProductDto updateProduct(ProductDto productDto, Long sellerId, MultipartFile imageFile) {
        Product existingProduct = getProductEntityById(productDto.getId());

        // Verify the seller owns this product or is admin
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!existingProduct.getSeller().getId().equals(sellerId) &&
                !seller.getRole().equals(com.ecommerce.ecommerce.entity.UserRole.ADMIN)) {
            throw new RuntimeException("You can only update your own products");
        }

        // Update product fields
        existingProduct.setName(productDto.getName());
        existingProduct.setDescription(productDto.getDescription());
        existingProduct.setPrice(productDto.getPrice());
        existingProduct.setStockQuantity(productDto.getStockQuantity());
        // Fix: Update imageUrl from DTO if provided (for manual URL entry)
        if (productDto.getImageUrl() != null && !productDto.getImageUrl().isBlank()) {
            existingProduct.setImageUrl(productDto.getImageUrl());
        }
        existingProduct.setUpdatedAt(LocalDateTime.now());

        // Update category if provided
        if (productDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDto.getCategoryId()));
            existingProduct.setCategory(category);
        }

        // Handle image update
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile);
            existingProduct.setImageUrl(imageUrl);
        }

        // Handle Variants Update
        if (productDto.getVariants() != null) {
            List<ProductVariant> currentVariants = existingProduct.getVariants();
            List<ProductVariantDto> newVariantDtos = productDto.getVariants();
            
            // 1. Remove variants not in the new list
            List<Long> newVariantIds = newVariantDtos.stream()
                    .map(ProductVariantDto::getId)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
            
            currentVariants.removeIf(v -> !newVariantIds.contains(v.getId()));
            
            // 2. Update or Add variants
            for (ProductVariantDto vDto : newVariantDtos) {
                if (vDto.getId() != null) {
                    // Update existing
                    currentVariants.stream()
                            .filter(v -> v.getId().equals(vDto.getId()))
                            .findFirst()
                            .ifPresent(v -> {
                                v.setSize(vDto.getSize());
                                v.setColor(vDto.getColor());
                                v.setSku(vDto.getSku());
                                v.setStockQuantity(vDto.getStockQuantity());
                                v.setPrice(vDto.getPrice());
                                v.setImageUrl(vDto.getImageUrl());
                            });
                } else {
                    // Add new
                    ProductVariant v = productMapper.toVariantEntity(vDto);
                    v.setProduct(existingProduct);
                    currentVariants.add(v);
                }
            }
            
            // Auto-calculate total stock from variants
            int totalStock = currentVariants.stream().mapToInt(ProductVariant::getStockQuantity).sum();
            existingProduct.setStockQuantity(totalStock);
        }

        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDto(updatedProduct);
    }

    // ✅ NEW: Delete product with authorization check
    public void deleteProduct(Long productId, Long sellerId) {
        Product product = getProductEntityById(productId);

        // Verify the seller owns this product or is admin
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!product.getSeller().getId().equals(sellerId) &&
                !seller.getRole().equals(com.ecommerce.ecommerce.entity.UserRole.ADMIN)) {
            throw new RuntimeException("You can only delete your own products");
        }

        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    // ✅ NEW: Helper method to get user ID by email
    public Long getUserIdByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return user.getId();
    }

    // ❌ KEEP AS-IS: These methods need to return Product entities for internal operations
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

    // ❌ KEEP AS-IS: These methods need to return Product entities for internal operations
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

    // ❌ KEEP AS-IS: These methods need to return Product entities for internal operations
    public void deleteProduct(Long productId) {
        Product product = getProductEntityById(productId);
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    // ❌ KEEP AS-IS: These methods need to return Product entities for internal operations
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

    // ❌ KEEP AS-IS: These methods need to return Product entities for internal operations
    public Long getProductCountBySeller(Long sellerId) {
        return productRepository.countBySellerId(sellerId);
    }

    // ✅ Helper method to get Product entity (for internal use)
    private Product getProductEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
}
