package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.Shipping;
import com.ecommerce.ecommerce.entity.ShippingHistory;
import com.ecommerce.ecommerce.entity.ShippingStatus;
import com.ecommerce.ecommerce.repository.ShippingHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShippingHistoryService {

    private final ShippingHistoryRepository shippingHistoryRepository;

    public ShippingHistoryService(ShippingHistoryRepository shippingHistoryRepository) {
        this.shippingHistoryRepository = shippingHistoryRepository;
    }

    @Transactional
    public void logHistory(Shipping shipping, ShippingStatus status, String updatedBy, String note) {
        ShippingHistory history = new ShippingHistory(shipping, status, updatedBy, note);
        shippingHistoryRepository.save(history);
    }

    public List<ShippingHistory> getTrackingHistory(Long shippingId) {
        return shippingHistoryRepository.findByShippingIdOrderByTimestampDesc(shippingId);
    }
}
