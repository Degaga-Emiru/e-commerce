package com.ecommerce.ecommerce.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardSummaryDto {
    private Map<String, Object> stats;

    public DashboardSummaryDto() {}

    public DashboardSummaryDto(Map<String, Object> stats) {
        this.stats = stats;
    }

    public Map<String, Object> getStats() {
        return stats;
    }

    public void setStats(Map<String, Object> stats) {
        this.stats = stats;
    }
}
