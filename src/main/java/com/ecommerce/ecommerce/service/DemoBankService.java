package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.BankAccount;
import com.ecommerce.ecommerce.entity.AccountType;
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

    // Assume there is a single platform escrow account
    private final String PLATFORM_ESCROW_ACCOUNT_NUMBER = "ESCROW0001";

    public DemoBankService(BankAccountRepository bankAccountRepository, UserRepository userRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.userRepository = userRepository;
    }

    public BankAccount createBankAccount(Long userId, BigDecimal initialBalance, AccountType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<BankAccount> existingAccount = bankAccountRepository.findByUserId(userId);
        if (existingAccount.isPresent()) {
            throw new RuntimeException("User already has a bank account");
        }

        BankAccount bankAccount = new BankAccount();
        bankAccount.setAccountHolderName(user.getFirstName() + " " + user.getLastName());
        bankAccount.setBalance(initialBalance);
        bankAccount.setUser(user);
        bankAccount.setAccountType(type);

        return bankAccountRepository.save(bankAccount);
    }

    public BankAccount getBankAccountByUserId(Long userId) {
        return bankAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Bank account not found for user"));
    }

    public BankAccount getBankAccountByAccountNumber(String accountNumber) {
        return bankAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));
    }

    public BigDecimal getAccountBalance(Long userId) {
        BankAccount account = getBankAccountByUserId(userId);
        return account.getBalance();
    }

    // ====== Process payment (customer to escrow) ======
    public boolean processPaymentToEscrow(String customerAccountNumber, BigDecimal amount) {
        BankAccount customer = getBankAccountByAccountNumber(customerAccountNumber);
        BankAccount escrow = getBankAccountByAccountNumber(PLATFORM_ESCROW_ACCOUNT_NUMBER);

        if (!customer.getActive()) throw new RuntimeException("Customer account inactive");
        if (!escrow.getActive()) throw new RuntimeException("Escrow account inactive");

        if (customer.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds in customer account");
        }

        // Deduct from customer
        customer.setBalance(customer.getBalance().subtract(amount));
        bankAccountRepository.save(customer);

        // Deposit to escrow
        escrow.setBalance(escrow.getBalance().add(amount));
        bankAccountRepository.save(escrow);

        return true;
    }

    // ====== Release funds to seller (with commission) ======
    public boolean releaseFundsToSeller(String sellerAccountNumber, BigDecimal amount) {
        BankAccount seller = getBankAccountByAccountNumber(sellerAccountNumber);
        BankAccount escrow = getBankAccountByAccountNumber(PLATFORM_ESCROW_ACCOUNT_NUMBER);

        if (!seller.getActive()) throw new RuntimeException("Seller account inactive");

        // Deduct from escrow
        if (escrow.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Escrow account has insufficient funds");
        }
        escrow.setBalance(escrow.getBalance().subtract(amount));
        bankAccountRepository.save(escrow);

        // Calculate 10% commission
        BigDecimal commission = amount.multiply(BigDecimal.valueOf(0.10));
        BigDecimal sellerAmount = amount.subtract(commission);

        // Add to seller
        seller.setBalance(seller.getBalance().add(sellerAmount));
        bankAccountRepository.save(seller);

        return true;
    }

    // ====== Refund to customer ======
    public boolean refundToCustomer(String customerAccountNumber, BigDecimal amount) {
        BankAccount customer = getBankAccountByAccountNumber(customerAccountNumber);
        BankAccount escrow = getBankAccountByAccountNumber(PLATFORM_ESCROW_ACCOUNT_NUMBER);

        // Deduct from escrow
        if (escrow.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Escrow has insufficient funds for refund");
        }
        escrow.setBalance(escrow.getBalance().subtract(amount));
        bankAccountRepository.save(escrow);

        // Add back to customer
        customer.setBalance(customer.getBalance().add(amount));
        bankAccountRepository.save(customer);

        return true;
    }

}
