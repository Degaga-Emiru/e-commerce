package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.BankAccount;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.repository.BankAccountRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Transactional
public class DemoBankService {
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    public DemoBankService(BankAccountRepository bankAccountRepository, UserRepository userRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.userRepository = userRepository;
    }

    public BankAccount createBankAccount(Long userId, BigDecimal initialBalance) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has a bank account
        Optional<BankAccount> existingAccount = bankAccountRepository.findByUserId(userId);
        if (existingAccount.isPresent()) {
            throw new RuntimeException("User already has a bank account");
        }

        BankAccount bankAccount = new BankAccount();
        bankAccount.setAccountHolderName(user.getFirstName() + " " + user.getLastName());
        bankAccount.setBalance(initialBalance);
        bankAccount.setUser(user);

        return bankAccountRepository.save(bankAccount);
    }

    public BankAccount getBankAccountByUserId(Long userId) {
        return bankAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Bank account not found for user"));
    }

    public BankAccount getBankAccountByEmail(String email) {
        return bankAccountRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Bank account not found for email: " + email));
    }

    public boolean processPayment(String accountNumber, String routingNumber, BigDecimal amount, String description) {
        try {
            BankAccount account = bankAccountRepository
                    .findByAccountNumberAndRoutingNumber(accountNumber, routingNumber)
                    .orElseThrow(() -> new RuntimeException("Bank account not found"));

            if (!account.getActive()) {
                throw new RuntimeException("Bank account is not active");
            }

            if (account.getBalance().compareTo(amount) < 0) {
                throw new RuntimeException("Insufficient funds");
            }

            // Deduct amount from account
            account.setBalance(account.getBalance().subtract(amount));
            bankAccountRepository.save(account);

            // Log the transaction
            System.out.println("Payment processed: " + description);
            System.out.println("Account: " + accountNumber + ", Amount: $" + amount);
            System.out.println("New Balance: $" + account.getBalance());

            return true;
        } catch (Exception e) {
            System.err.println("Payment failed: " + e.getMessage());
            return false;
        }
    }

    public boolean processRefund(String accountNumber, String routingNumber, BigDecimal amount, String description) {
        try {
            BankAccount account = bankAccountRepository
                    .findByAccountNumberAndRoutingNumber(accountNumber, routingNumber)
                    .orElseThrow(() -> new RuntimeException("Bank account not found"));

            if (!account.getActive()) {
                throw new RuntimeException("Bank account is not active");
            }

            // Add amount back to account
            account.setBalance(account.getBalance().add(amount));
            bankAccountRepository.save(account);

            // Log the transaction
            System.out.println("Refund processed: " + description);
            System.out.println("Account: " + accountNumber + ", Amount: $" + amount);
            System.out.println("New Balance: $" + account.getBalance());

            return true;
        } catch (Exception e) {
            System.err.println("Refund failed: " + e.getMessage());
            return false;
        }
    }

    public BigDecimal getAccountBalance(Long userId) {
        BankAccount account = getBankAccountByUserId(userId);
        return account.getBalance();
    }

    public boolean transferFunds(String fromAccount, String toAccount, BigDecimal amount, String description) {
        try {
            // Withdraw from source account
            boolean withdrawalSuccess = processPayment(fromAccount, "123456789", amount,
                    "Transfer to " + toAccount + " - " + description);

            if (!withdrawalSuccess) {
                return false;
            }

            // Deposit to target account (simplified - in real system, this would be separate)
            BankAccount targetAccount = bankAccountRepository.findByAccountNumber(toAccount)
                    .orElseThrow(() -> new RuntimeException("Target account not found"));

            targetAccount.setBalance(targetAccount.getBalance().add(amount));
            bankAccountRepository.save(targetAccount);

            System.out.println("Transfer completed: $" + amount + " from " + fromAccount + " to " + toAccount);
            return true;
        } catch (Exception e) {
            System.err.println("Transfer failed: " + e.getMessage());
            // Rollback logic would go here in a real system
            return false;
        }
    }

    public BankAccount updateAccountBalance(Long userId, BigDecimal newBalance) {
        BankAccount account = getBankAccountByUserId(userId);
        account.setBalance(newBalance);
        return bankAccountRepository.save(account);
    }
}