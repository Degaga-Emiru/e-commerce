// ProductMapper.java
package com.ecommerce.ecommerce.mapper;
import com.ecommerce.ecommerce.dto.ProductDto;
import com.ecommerce.ecommerce.dto.ProductVariantDto;
import com.ecommerce.ecommerce.dto.ProductAttributeValueDto;
import com.ecommerce.ecommerce.entity.ProductAttributeValue;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring") // This tells MapStruct to generate a Spring bean
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerName", expression = "java(product.getSeller() != null ? product.getSeller().getFirstName() + \" \" + product.getSeller().getLastName() : \"Unknown Seller\")")
    @Mapping(target = "status", source = "status")
    ProductDto toDto(Product product);

    ProductVariantDto toVariantDto(ProductVariant variant);
    ProductVariant toVariantEntity(ProductVariantDto variantDto);

    @Mapping(target = "attributeId", source = "attribute.id")
    @Mapping(target = "attributeName", source = "attribute.name")
    ProductAttributeValueDto toAttributeValueDto(ProductAttributeValue value);

    @Mapping(target = "attribute", ignore = true)
    @Mapping(target = "product", ignore = true)
    ProductAttributeValue toAttributeValueEntity(ProductAttributeValueDto dto);

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