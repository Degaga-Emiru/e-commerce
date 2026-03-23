package com.ecommerce.ecommerce.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class MerchantAnalyticsResponse {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private List<ProductSalesData> topProducts;

    @Data
    @Builder
    public static class ProductSalesData {
        private Long productId;
        private String productName;
        private Long quantitySold;
        private BigDecimal revenueGenerated;
    }
}
