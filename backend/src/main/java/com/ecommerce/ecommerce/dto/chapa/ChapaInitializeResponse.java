package com.ecommerce.ecommerce.dto.chapa;

import lombok.Data;

@Data
public class ChapaInitializeResponse {
    private String message;
    private String status;
    private Data data;

    @lombok.Data
    public static class Data {
        private String checkout_url;
    }
}
