package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.Category;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.CategoryRepository;
import com.ecommerce.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final com.ecommerce.ecommerce.repository.CategoryAttributeRepository attributeRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    public CategoryService(CategoryRepository categoryRepository, 
                           com.ecommerce.ecommerce.repository.CategoryAttributeRepository attributeRepository,
                           ProductRepository productRepository,
                           FileStorageService fileStorageService) {
        this.categoryRepository = categoryRepository;
        this.attributeRepository = attributeRepository;
        this.productRepository = productRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Category> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        // Initialize lazy collections within transaction
        categories.forEach(c -> {
            if (c.getAttributes() != null) c.getAttributes().size();
        });
        return categories;
    }

    public Category getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        if (category.getAttributes() != null) category.getAttributes().size();
        return category;
    }

    public Category createCategory(Category category, MultipartFile imageFile) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new RuntimeException("Category with name '" + category.getName() + "' already exists");
        }

        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile);
            category.setImageUrl(imageUrl);
        }

        return categoryRepository.save(category);
    }

    public Category updateCategory(Long categoryId, Category categoryDetails, MultipartFile imageFile) {
        Category category = getCategoryById(categoryId);

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setUpdatedAt(LocalDateTime.now());

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile);
            category.setImageUrl(imageUrl);
        }

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long categoryId) {
        Category category = getCategoryById(categoryId);

        // Check if category has products
        Long productCount = productRepository.countByCategoryId(categoryId);
        if (productCount > 0) {
            throw new RuntimeException("Cannot delete category with existing products");
        }

        categoryRepository.delete(category);
    }

    public List<Category> getCategoriesWithProducts() {
        return categoryRepository.findCategoriesWithProducts();
    }

    public List<Category> searchCategories(String query) {
        return categoryRepository.findByNameContainingIgnoreCase(query);
    }

    public Long getProductCountByCategory(Long categoryId) {
        return productRepository.countByCategoryId(categoryId);
    }

    // Dynamic Attribute Management
    public com.ecommerce.ecommerce.entity.CategoryAttribute addAttribute(Long categoryId, com.ecommerce.ecommerce.entity.CategoryAttribute attr) {
        Category category = getCategoryById(categoryId);
        attr.setCategory(category);
        return attributeRepository.save(attr);
    }

    public com.ecommerce.ecommerce.entity.CategoryAttribute updateAttribute(Long attrId, com.ecommerce.ecommerce.entity.CategoryAttribute details) {
        com.ecommerce.ecommerce.entity.CategoryAttribute attr = attributeRepository.findById(attrId)
                .orElseThrow(() -> new ResourceNotFoundException("Attribute not found"));
        attr.setName(details.getName());
        attr.setType(details.getType());
        attr.setRequired(details.isRequired());
        attr.setOptions(details.getOptions());
        return attributeRepository.save(attr);
    }

    public void deleteAttribute(Long attrId) {
        attributeRepository.deleteById(attrId);
    }
}
