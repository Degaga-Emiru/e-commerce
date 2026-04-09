package com.ecommerce.ecommerce.config;

import com.ecommerce.ecommerce.entity.AttributeType;
import com.ecommerce.ecommerce.entity.Category;
import com.ecommerce.ecommerce.entity.CategoryAttribute;
import com.ecommerce.ecommerce.repository.CategoryAttributeRepository;
import com.ecommerce.ecommerce.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Configuration
public class DataSeeder {

    @Bean
    @Transactional
    public CommandLineRunner seedData(CategoryRepository categoryRepository, CategoryAttributeRepository attributeRepository) {
        return args -> {
            // Upsert Logic: Check each category and sync attributes
            syncCategory(categoryRepository, attributeRepository, "Books", "Physical and digital books", new Object[][]{
                {"Title", AttributeType.TEXT, true, null},
                {"Author", AttributeType.TEXT, true, null},
                {"Pages", AttributeType.NUMBER, false, null},
                {"Language", AttributeType.TEXT, true, null},
                {"ISBN", AttributeType.TEXT, true, null},
                {"Front Cover Image URL", AttributeType.TEXT, false, null},
                {"Back Cover Image URL", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Electronics", "Gadgets and tech", new Object[][]{
                {"Brand", AttributeType.TEXT, true, null},
                {"Model", AttributeType.TEXT, true, null},
                {"Specifications", AttributeType.TEXT, false, null},
                {"Warranty", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Clothing", "Fashion and apparel", new Object[][]{
                {"Material", AttributeType.TEXT, true, null},
                {"Gender", AttributeType.DROPDOWN, true, "Men,Women,Unisex"},
                {"Collection", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Shoes", "Footwear for all", new Object[][]{
                {"Gender", AttributeType.DROPDOWN, true, "Men,Women,Unisex"},
                {"Material", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Sports", "Fitness and outdoor gear", new Object[][]{
                {"Type", AttributeType.TEXT, true, null},
                {"Brand", AttributeType.TEXT, true, null},
                {"Material", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Home & Kitchen", "Household items", new Object[][]{
                {"Material", AttributeType.TEXT, true, null},
                {"Dimensions", AttributeType.TEXT, false, null},
                {"Brand", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Beauty & Personal Care", "Skincare and makeup", new Object[][]{
                {"Brand", AttributeType.TEXT, true, null},
                {"Skin Type", AttributeType.TEXT, false, null},
                {"Expiry Date", AttributeType.TEXT, true, null},
                {"Ingredients", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Toys & Kids", "Fun for children", new Object[][]{
                {"Age Range", AttributeType.TEXT, true, null},
                {"Material", AttributeType.TEXT, false, null},
                {"Brand", AttributeType.TEXT, false, null},
                {"Safety Info", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Jewelry & Accessories", "Elegance and style", new Object[][]{
                {"Material", AttributeType.DROPDOWN, true, "Gold,Silver,Platinum,Other"},
                {"Size", AttributeType.TEXT, false, null},
                {"Gender", AttributeType.DROPDOWN, true, "Men,Women,Unisex"}
            });

            syncCategory(categoryRepository, attributeRepository, "Bags & Luggage", "Travel and storage", new Object[][]{
                {"Size", AttributeType.TEXT, true, null},
                {"Material", AttributeType.TEXT, true, null},
                {"Brand", AttributeType.TEXT, false, null},
                {"Color", AttributeType.TEXT, true, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Automotive", "Car parts and accessories", new Object[][]{
                {"Car Model Compatibility", AttributeType.TEXT, true, null},
                {"Brand", AttributeType.TEXT, true, null},
                {"Warranty", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Health & Medical", "Wellness and medical supplies", new Object[][]{
                {"Usage", AttributeType.TEXT, true, null},
                {"Expiry Date", AttributeType.TEXT, true, null},
                {"Instructions", AttributeType.TEXT, false, null},
                {"Brand", AttributeType.TEXT, false, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Office Supplies", "Stationery and tools", new Object[][]{
                {"Type", AttributeType.TEXT, true, null},
                {"Brand", AttributeType.TEXT, true, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Furniture", "Home and office decor", new Object[][]{
                {"Dimensions", AttributeType.TEXT, true, null},
                {"Material", AttributeType.TEXT, true, null},
                {"Weight", AttributeType.TEXT, false, null},
                {"Color", AttributeType.TEXT, true, null}
            });

            syncCategory(categoryRepository, attributeRepository, "Groceries", "Food and essentials", new Object[][]{
                {"Weight/Volume", AttributeType.TEXT, true, null},
                {"Expiry Date", AttributeType.TEXT, true, null},
                {"Brand", AttributeType.TEXT, false, null}
            });
        };
    }

    private void syncCategory(CategoryRepository repo, CategoryAttributeRepository attrRepo, String name, String desc, Object[][] attributes) {
        Optional<Category> opt = repo.findByName(name);
        Category cat;
        if (opt.isEmpty()) {
            cat = repo.save(new Category(name, desc));
        } else {
            cat = opt.get();
        }

        for (Object[] attrData : attributes) {
            String attrName = (String) attrData[0];
            AttributeType type = (AttributeType) attrData[1];
            boolean req = (Boolean) attrData[2];
            String opts = (String) attrData[3];

            if (attrRepo.findByCategoryId(cat.getId()).stream().noneMatch(a -> a.getName().equals(attrName))) {
                attrRepo.save(new CategoryAttribute(attrName, type, req, opts, cat));
            }
        }
    }
}
