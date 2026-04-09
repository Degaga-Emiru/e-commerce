package com.ecommerce.ecommerce.mapper;

import com.ecommerce.ecommerce.dto.ReviewDto;
import com.ecommerce.ecommerce.entity.Review;
import com.ecommerce.ecommerce.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "user", source = "user", qualifiedByName = "toReviewUserDto")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "helpfulPercentage", expression = "java(review.getHelpfulPercentage())")
    @Mapping(target = "canEdit", expression = "java(review.canEditReview())")
    ReviewDto toDto(Review review);

    @Named("toReviewUserDto")
    default ReviewDto.ReviewUserDto toReviewUserDto(User user) {
        if (user == null) return null;
        ReviewDto.ReviewUserDto dto = new ReviewDto.ReviewUserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        return dto;
    }

    List<ReviewDto> toDtoList(List<Review> reviews);
}
