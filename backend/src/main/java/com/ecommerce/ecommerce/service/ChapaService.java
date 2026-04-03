package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.dto.chapa.ChapaInitializeRequest;
import com.ecommerce.ecommerce.dto.chapa.ChapaInitializeResponse;
import com.ecommerce.ecommerce.dto.chapa.ChapaVerifyResponse;
import com.ecommerce.ecommerce.dto.chapa.ChapaTransferRequest;
import com.ecommerce.ecommerce.dto.chapa.ChapaTransferResponse;
import com.ecommerce.ecommerce.entity.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ChapaService {

    private static final Logger logger = LoggerFactory.getLogger(ChapaService.class);

    @Value("${chapa.secret.key}")
    private String secretKey;

    @Value("${chapa.base.url}")
    private String baseUrl;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final RestTemplate restTemplate;

    public ChapaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ChapaInitializeResponse initializeTransaction(Order order) {
        String url = baseUrl + "/transaction/initialize";
        logger.info("Initializing Chapa transaction for order: {}", order.getOrderNumber());

        ChapaInitializeRequest request = ChapaInitializeRequest.builder()
                .amount(order.getFinalAmount())
                .currency("ETB")
                .email(order.getUser().getEmail())
                .first_name(order.getUser().getFirstName())
                .last_name(order.getUser().getLastName())
                .tx_ref(order.getOrderNumber())
                .callback_url(frontendUrl + "/payment-callback/" + order.getOrderNumber())
                .return_url(frontendUrl + "/order-success/" + order.getOrderNumber())
                .customization_title("Order #" + order.getOrderNumber())
                .customization_description("Payment for items in order #" + order.getOrderNumber())
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(secretKey);

        HttpEntity<ChapaInitializeRequest> entity = new HttpEntity<>(request, headers);

        try {
            ChapaInitializeResponse response = restTemplate.postForObject(url, entity, ChapaInitializeResponse.class);
            logger.debug("Chapa initialize response: {}", response);
            return response;
        } catch (Exception e) {
            logger.error("Failed to initialize Chapa transaction: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize Chapa transaction: " + e.getMessage());
        }
    }

    public ChapaVerifyResponse verifyTransaction(String txRef) {
        String url = baseUrl + "/transaction/verify/" + txRef;
        logger.info("Verifying Chapa transaction with reference: {}", txRef);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(secretKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ChapaVerifyResponse response = restTemplate.exchange(url, HttpMethod.GET, entity, ChapaVerifyResponse.class).getBody();
            logger.info("Chapa verify API call success. Status: {}", response != null ? response.getStatus() : "null");
            return response;
        } catch (Exception e) {
            logger.error("Chapa verify API call failed: {}", e.getMessage());
            throw new RuntimeException("Failed to verify Chapa transaction: " + e.getMessage());
        }
    }

    public ChapaTransferResponse transferFunds(String accountName, String accountNumber, java.math.BigDecimal amount, String bankName) {
        String url = baseUrl + "/transfers";
        logger.info("Initializing Chapa transfer for: {} to account: {}", amount, accountNumber);
        
        // Basic mapping for Ethiopian banks to their Chapa Numeric IDs
        String bankCode = "855"; // default to telebirr
        if (bankName != null) {
            String b = bankName.toLowerCase();
            if (b.contains("cbe") || b.contains("commercial")) bankCode = "128"; // CBEBirr
            else if (b.contains("awash")) bankCode = "805"; // Awash
            else if (b.contains("dashen")) bankCode = "6ee"; // Dashen
            else if (b.contains("telebirr")) bankCode = "855";
            else if (b.contains("abyssinia")) bankCode = "84s";
        }

        // Failsafe for numeric only
        bankCode = bankCode.replaceAll("[^0-9]", "");
        if (bankCode.isEmpty()) bankCode = "855";

        ChapaTransferRequest request = ChapaTransferRequest.builder()
                .account_name(accountName)
                .account_number(accountNumber)
                .amount(amount)
                .currency("ETB")
                .reference("WD-" + System.currentTimeMillis())
                .bank_code(bankCode)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(secretKey);

        HttpEntity<ChapaTransferRequest> entity = new HttpEntity<>(request, headers);

        try {
            ChapaTransferResponse response = restTemplate.postForObject(url, entity, ChapaTransferResponse.class);
            logger.info("Chapa transfer response: {}", response);
            if (response != null && "failed".equalsIgnoreCase(response.getStatus())) {
                throw new RuntimeException(response.getMessage());
            }
            return response;
        } catch (Exception e) {
            logger.error("Failed to execute Chapa transfer: {}", e.getMessage());
            throw new RuntimeException("Failed to execute Chapa transfer API: " + e.getMessage());
        }
    }
}
