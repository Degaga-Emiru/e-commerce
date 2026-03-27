package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.dto.MerchantAnalyticsResponse;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.repository.OrderItemRepository;
import com.ecommerce.ecommerce.repository.SellerOrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final SellerOrderRepository sellerOrderRepository;
    private final OrderItemRepository orderItemRepository;

    public AnalyticsService(SellerOrderRepository sellerOrderRepository, OrderItemRepository orderItemRepository) {
        this.sellerOrderRepository = sellerOrderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public MerchantAnalyticsResponse getMerchantAnalytics(User seller) {
        BigDecimal totalRevenue = sellerOrderRepository.sumSubtotalBySeller(seller);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        Long totalOrders = sellerOrderRepository.countBySeller(seller);

        List<Object[]> topProductsRaw = orderItemRepository.findTopSellingProductsBySeller(seller.getId(), PageRequest.of(0, 5));
        
        List<MerchantAnalyticsResponse.ProductSalesData> topProducts = topProductsRaw.stream()
                .map(row -> {
                    Product product = (Product) row[0];
                    Long quantitySold = ((Number) row[1]).longValue();
                    BigDecimal revenue = (BigDecimal) row[2];
                    return MerchantAnalyticsResponse.ProductSalesData.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .quantitySold(quantitySold)
                            .revenueGenerated(revenue)
                            .build();
                })
                .collect(Collectors.toList());

        return MerchantAnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .topProducts(topProducts)
                .build();
    }
}
