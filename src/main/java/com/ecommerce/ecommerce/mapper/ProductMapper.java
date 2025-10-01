// ProductMapper.java
package com.ecommerce.ecommerce.mapper;

import com.ecommerce.ecommerce.dto.ProductDto;
import com.ecommerce.ecommerce.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring") // This tells MapStruct to generate a Spring bean
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerName", expression = "java(product.getSeller().getFirstName() + \" \" + product.getSeller().getLastName())")
    @Mapping(target = "status", source = "status")
    ProductDto toDto(Product product);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    Product toEntity(ProductDto productDto);

    List<ProductDto> toDtoList(List<Product> products);
}