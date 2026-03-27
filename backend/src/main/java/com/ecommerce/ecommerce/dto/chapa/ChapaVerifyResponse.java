package com.ecommerce.ecommerce.dto.chapa;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChapaVerifyResponse {
    private String message;
    private String status;
    private VerifyData data;

    // Explicit Getters for reliability if Lombok fails
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public VerifyData getData() { return data; }
    public void setData(VerifyData data) { this.data = data; }

    @lombok.Data
    public static class VerifyData {
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

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReference() { return reference; }
        public void setReference(String reference) { this.reference = reference; }
    }
}
