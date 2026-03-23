package com.ecommerce.ecommerce.dto.chapa;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ChapaInitializeRequest {
    private BigDecimal amount;
    private String currency;
    private String email;
    private String first_name;
    private String last_name;
    private String tx_ref;
    private String callback_url;
    private String return_url;
    private String customization_title;
    private String customization_description;
}
