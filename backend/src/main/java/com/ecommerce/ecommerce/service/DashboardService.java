package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.dto.DashboardSummaryDto;
import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartItemRepository cartItemRepository;
    private final SellerOrderRepository sellerOrderRepository;

    public DashboardService(OrderRepository orderRepository, 
                            ProductRepository productRepository, 
                            UserRepository userRepository, 
                            AddressRepository addressRepository, 
                            CartItemRepository cartItemRepository, 
                            SellerOrderRepository sellerOrderRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.cartItemRepository = cartItemRepository;
        this.sellerOrderRepository = sellerOrderRepository;
    }

    public DashboardSummaryDto getCustomerSummary(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", (long) orderRepository.findByUserId(userId).size());
        stats.put("pendingOrders", orderRepository.countByUserIdAndStatus(userId, OrderStatus.PENDING));
        Integer cartCount = cartItemRepository.countItemsInUserCart(userId);
        stats.put("cartItems", cartCount != null ? cartCount : 0);
        stats.put("totalAddresses", (long) addressRepository.findByUserId(userId).size());
        return new DashboardSummaryDto(stats);
    }

    public DashboardSummaryDto getSellerSummary(User seller) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", sellerOrderRepository.countBySeller(seller));
        stats.put("totalProducts", productRepository.countBySellerId(seller.getId()));
        BigDecimal revenue = sellerOrderRepository.sumSubtotalBySeller(seller);
        stats.put("totalRevenue", revenue != null ? revenue : BigDecimal.ZERO);
        
        // Time series for charts (Last 6 months)
        // Note: For a real app, this would be a proper group-by query
        stats.put("revenueSeries", new double[]{12000, 15000, 11000, 18000, 22000, 25000}); 
        
        return new DashboardSummaryDto(stats);
    }

    public DashboardSummaryDto getAdminSummary() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSellers", userRepository.countByRole(UserRole.SELLER));
        stats.put("totalOrders", orderRepository.count());
        
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);
        
        // Additional stats for charts
        stats.put("orderStatusDistribution", Map.of(
            "DELIVERED", orderRepository.countByStatus(OrderStatus.DELIVERED),
            "PROCESSING", orderRepository.countByStatus(OrderStatus.PROCESSING),
            "SHIPPED", orderRepository.countByStatus(OrderStatus.SHIPPED),
            "PENDING", orderRepository.countByStatus(OrderStatus.PENDING)
        ));

        // Mock revenue series for demo
        stats.put("revenueSeries", new double[]{45000, 52000, 48000, 61000, 59000, 72000});
        
        return new DashboardSummaryDto(stats);
    }
}
