package com.ecommerce.ecommerce.dto;

import com.ecommerce.ecommerce.entity.AccountType;

import java.math.BigDecimal;

public class BankAccountRequest {
    private Long userId;
    private BigDecimal initialBalance;
    private AccountType accountType;

    // Getters and setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public BigDecimal getInitialBalance() { return initialBalance; }
    public void setInitialBalance(BigDecimal initialBalance) { this.initialBalance = initialBalance; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }
}
