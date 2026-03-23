package com.ecommerce.ecommerce.mapper;
import com.ecommerce.ecommerce.dto.OrderDto;
import com.ecommerce.ecommerce.dto.OrderItemDto;
import com.ecommerce.ecommerce.dto.ShippingAddressDto;
import com.ecommerce.ecommerce.entity.Order;
import com.ecommerce.ecommerce.entity.OrderItem;

import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUser().getId());
        dto.setUserEmail(order.getUser().getEmail());
        dto.setStatus(order.getStatus().name());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setShippingAmount(order.getShippingAmount());
        dto.setFinalAmount(order.getFinalAmount());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : null);
        dto.setOrderDate(order.getOrderDate());
        dto.setShippedDate(order.getShippedDate());
        dto.setDeliveredDate(order.getDeliveredDate());

        if (order.getDiscountCoupon() != null) {
            dto.setCouponId(order.getDiscountCoupon().getId());
            dto.setCouponCode(order.getDiscountCoupon().getCode());
        }

        // Shipping Address
        if (order.getShippingAddress() != null) {
            ShippingAddressDto addressDto = new ShippingAddressDto();
            addressDto.setRecipientName(null); // Address entity has no recipient name
            addressDto.setStreet(order.getShippingAddress().getStreet());
            addressDto.setCity(order.getShippingAddress().getCity());
            addressDto.setState(order.getShippingAddress().getState());
            addressDto.setZipCode(order.getShippingAddress().getZipCode());
            addressDto.setCountry(order.getShippingAddress().getCountry());
            addressDto.setPhoneNumber(order.getShippingPhoneNumber()); // phone from order entity
            dto.setShippingAddress(addressDto);
        }

        // Order Items
        List<OrderItemDto> itemDtos = order.getOrderItems().stream().map(OrderMapper::toOrderItemDto).collect(Collectors.toList());
        dto.setOrderItems(itemDtos);

        return dto;
    }

    private static OrderItemDto toOrderItemDto(OrderItem item) {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(item.getId());
        dto.setOrderId(item.getOrder().getId());
        dto.setOrderNumber(item.getOrder().getOrderNumber());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        dto.setProductDescription(item.getProduct().getDescription());
        dto.setProductCategory(item.getProduct().getCategory().getName());
        dto.setProductImage(item.getProduct().getImageUrl());
        return dto;
    }
}
