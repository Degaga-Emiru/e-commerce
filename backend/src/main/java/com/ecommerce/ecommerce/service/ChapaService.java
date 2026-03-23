package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.dto.chapa.ChapaInitializeRequest;
import com.ecommerce.ecommerce.dto.chapa.ChapaInitializeResponse;
import com.ecommerce.ecommerce.dto.chapa.ChapaVerifyResponse;
import com.ecommerce.ecommerce.entity.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ChapaService {

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
            return restTemplate.postForObject(url, entity, ChapaInitializeResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Chapa transaction: " + e.getMessage());
        }
    }

    public ChapaVerifyResponse verifyTransaction(String txRef) {
        String url = baseUrl + "/transaction/verify/" + txRef;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(secretKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            return restTemplate.exchange(url, HttpMethod.GET, entity, ChapaVerifyResponse.class).getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Chapa transaction: " + e.getMessage());
        }
    }
}
