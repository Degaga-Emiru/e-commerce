package com.ecommerce.ecommerce.dto.chapa;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChapaVerifyResponse {
    private String message;
    private String status;
    private Data data;

    @lombok.Data
    public static class Data {
        private String first_name;
        private String last_name;
        private String email;
        private String currency;
        private BigDecimal amount;
        private BigDecimal charge;
        private String mode;
        private String method;
        private String type;
        private String status;
        private String reference;
        private String tx_ref;
    }
}
