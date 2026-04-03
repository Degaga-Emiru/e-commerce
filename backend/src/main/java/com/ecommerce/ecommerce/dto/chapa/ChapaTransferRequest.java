package com.ecommerce.ecommerce.dto.chapa;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ChapaTransferRequest {
    private String account_name;
    private String account_number;
    private BigDecimal amount;
    private String currency;
    private String reference;
    private String bank_code;
}
