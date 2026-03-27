package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SellerDashboardService {

    private final ProductRepository productRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final EscrowRepository escrowRepository;

    public SellerDashboardService(ProductRepository productRepository,
                                  SellerOrderRepository sellerOrderRepository,
                                  SellerProfileRepository sellerProfileRepository,
                                  EscrowRepository escrowRepository) {
        this.productRepository = productRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.escrowRepository = escrowRepository;
    }

    public Map<String, Object> getDashboardStats(Long sellerId) {
        Map<String, Object> stats = new HashMap<>();

        long totalProducts = productRepository.countBySellerId(sellerId);
        List<SellerOrder> orders = sellerOrderRepository.findBySellerId(sellerId);

        long totalOrders = orders.size();
        long pendingOrders = orders.stream()
                .filter(o -> o.getStatus() == SellerOrderStatus.PENDING)
                .count();

        BigDecimal revenue = orders.stream()
                .map(SellerOrder::getPayoutAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Available Balance from Profile
        SellerProfile profile = sellerProfileRepository.findByUserId(sellerId)
                .orElse(new SellerProfile());
        BigDecimal availableBalance = profile.getAvailableBalance() != null ? profile.getAvailableBalance() : BigDecimal.ZERO;

        // Escrow Balance (HELD)
        // Note: Currently Escrow is linked to Order. In a multi-seller order, 
        // we'd need to calculate the portion belonging to this seller.
        // For now, we'll sum the payoutAmount of SellerOrders that are NOT yet PAID/RELEASED.
        BigDecimal escrowBalance = orders.stream()
                .filter(o -> o.getStatus() != SellerOrderStatus.PAYOUT_RELEASED)
                .map(SellerOrder::getPayoutAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("revenue", revenue);
        stats.put("availableBalance", availableBalance);
        stats.put("escrowBalance", escrowBalance);

        return stats;
    }

    public List<Map<String, Object>> getSalesTrend(Long sellerId) {
        List<SellerOrder> orders = sellerOrderRepository.findBySellerId(sellerId);
        
        // Group by date (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        return orders.stream()
                .filter(o -> o.getCreatedAt().isAfter(thirtyDaysAgo))
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate()))
                .entrySet().stream()
                .map(entry -> {
                    Map<String, Object> dayData = new HashMap<>();
                    dayData.put("date", entry.getKey().toString());
                    dayData.put("sales", entry.getValue().stream()
                            .map(SellerOrder::getPayoutAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    return dayData;
                })
                .sorted(Comparator.comparing(m -> (String) m.get("date")))
                .collect(Collectors.toList());
    }
}
