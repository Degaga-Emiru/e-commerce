package com.ecommerce.ecommerce.exception;
public class InsufficientStockException extends RuntimeException {
    private String productName;
    private Integer availableStock;
    private Integer requestedQuantity;

    public InsufficientStockException(String productName, Integer availableStock, Integer requestedQuantity) {
        super(String.format("Insufficient stock for %s. Available: %d, Requested: %d",
                productName, availableStock, requestedQuantity));
        this.productName = productName;
        this.availableStock = availableStock;
        this.requestedQuantity = requestedQuantity;
    }

    public String getProductName() { return productName; }
    public Integer getAvailableStock() { return availableStock; }
    public Integer getRequestedQuantity() { return requestedQuantity; }
}