package com.ecommerce.ecommerce.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

public class OrderNumberGenerator {
    private static final AtomicInteger sequence = new AtomicInteger(1);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyMMdd");

    public static String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(formatter);
        int seq = sequence.getAndIncrement();
        if (seq > 9999) {
            sequence.set(1);
            seq = 1;
        }
        return String.format("ORD%s%04d", datePart, seq);
    }
}
