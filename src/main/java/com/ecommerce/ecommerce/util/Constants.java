package com.ecommerce.ecommerce.util;

import java.math.BigDecimal;

public class Constants {
    public static final int OTP_LENGTH = 6;
    public static final int OTP_EXPIRATION_MINUTES = 15;
    public static final int JWT_EXPIRATION_MS = 86400000; // 24 hours

    public static final String DEFAULT_CURRENCY = "USD";
    public static final BigDecimal STANDARD_SHIPPING_COST = new BigDecimal("5.99");
    public static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("50.00");

    public static final int PRODUCTS_PER_PAGE = 20;
    public static final int MAX_CART_QUANTITY = 10;

    public static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif"};
    public static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private Constants() {
        // Utility class
    }
}
