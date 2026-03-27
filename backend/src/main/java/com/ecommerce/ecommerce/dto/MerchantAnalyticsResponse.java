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

    public MerchantAnalyticsResponse() {}
    public MerchantAnalyticsResponse(BigDecimal totalRevenue, Long totalOrders, List<ProductSalesData> topProducts) {
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.topProducts = topProducts;
    }

    // Explicit builder for fallback
    public static MerchantAnalyticsResponseBuilder builder() {
        return new MerchantAnalyticsResponseBuilder();
    }

    public static class MerchantAnalyticsResponseBuilder {
        private BigDecimal totalRevenue;
        private Long totalOrders;
        private List<ProductSalesData> topProducts;
        public MerchantAnalyticsResponseBuilder totalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; return this; }
        public MerchantAnalyticsResponseBuilder totalOrders(Long totalOrders) { this.totalOrders = totalOrders; return this; }
        public MerchantAnalyticsResponseBuilder topProducts(List<ProductSalesData> topProducts) { this.topProducts = topProducts; return this; }
        public MerchantAnalyticsResponse build() { return new MerchantAnalyticsResponse(totalRevenue, totalOrders, topProducts); }
    }

    @Data
    @Builder
    public static class ProductSalesData {
        private Long productId;
        private String productName;
        private Long quantitySold;
        private BigDecimal revenueGenerated;

        public ProductSalesData() {}
        public ProductSalesData(Long productId, String productName, Long quantitySold, BigDecimal revenueGenerated) {
            this.productId = productId;
            this.productName = productName;
            this.quantitySold = quantitySold;
            this.revenueGenerated = revenueGenerated;
        }

        public static ProductSalesDataBuilder builder() {
            return new ProductSalesDataBuilder();
        }

        public static class ProductSalesDataBuilder {
            private Long productId;
            private String productName;
            private Long quantitySold;
            private BigDecimal revenueGenerated;
            public ProductSalesDataBuilder productId(Long productId) { this.productId = productId; return this; }
            public ProductSalesDataBuilder productName(String productName) { this.productName = productName; return this; }
            public ProductSalesDataBuilder quantitySold(Long quantitySold) { this.quantitySold = quantitySold; return this; }
            public ProductSalesDataBuilder revenueGenerated(BigDecimal revenueGenerated) { this.revenueGenerated = revenueGenerated; return this; }
            public ProductSalesData build() { return new ProductSalesData(productId, productName, quantitySold, revenueGenerated); }
        }
    }
}
