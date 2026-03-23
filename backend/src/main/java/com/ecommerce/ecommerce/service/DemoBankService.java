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

    private static final String PLATFORM_ESCROW_ACCOUNT_NUMBER = "ESCROW0001";
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;

    // Escrow account type
    private static final AccountType ESCROW_TYPE = AccountType.ESCROW;

    public DemoBankService(BankAccountRepository bankAccountRepository, UserRepository userRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.userRepository = userRepository;

        // Ensure a platform escrow account exists
        createPlatformEscrowAccount();
    }

    private void createPlatformEscrowAccount() {
        Optional<BankAccount> escrowAccount = bankAccountRepository
                .findByAccountNumberAndAccountType("ESCROW0001", ESCROW_TYPE);
        if (escrowAccount.isEmpty()) {
            BankAccount escrow = new BankAccount();
            escrow.setAccountNumber("ESCROW0001");
            escrow.setAccountHolderName("Platform Escrow Account");
            escrow.setBalance(BigDecimal.ZERO);
            escrow.setAccountType(ESCROW_TYPE);
            escrow.setActive(true);
            bankAccountRepository.save(escrow);
        }
    }

    // Create a bank account for a user
    public BankAccount createBankAccount(Long userId, BigDecimal initialBalance, AccountType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<BankAccount> existingAccount = bankAccountRepository.findByUserId(userId);
        if (existingAccount.isPresent()) {
            throw new RuntimeException("User already has a bank account");
        }

        BankAccount account = new BankAccount();
        account.setAccountHolderName(user.getFirstName() + " " + user.getLastName());
        account.setBalance(initialBalance);
        account.setUser(user);
        account.setAccountType(type);
        account.setAccountNumber(generate10DigitAccountNumber());

        return bankAccountRepository.save(account);
    }

    // Get account by user
    public BankAccount getBankAccountByUserId(Long userId) {
        return bankAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Bank account not found for user"));
    }

    // Get account by account number
    public BankAccount getBankAccountByAccountNumber(String accountNumber) {
        return bankAccountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Bank account not found"));
    }

    // Get balance
    public BigDecimal getAccountBalance(Long userId) {
        BankAccount account = getBankAccountByUserId(userId);
        return account.getBalance();
    }

    // Generate pseudo-random 10-digit account number
    private String generate10DigitAccountNumber() {
        long num = (long) (Math.random() * 9_000_000_000L) + 1_000_000_000L;
        return String.valueOf(num);
    }

    // ===== Payment: customer -> escrow =====
    public boolean processPaymentToEscrow(String customerAccountNumber, BigDecimal amount) {
        BankAccount customer = getBankAccountByAccountNumber(customerAccountNumber);
        BankAccount escrow = getBankAccountByAccountNumber("ESCROW0001");

        if (!customer.getActive()) throw new RuntimeException("Customer account inactive");
        if (!escrow.getActive()) throw new RuntimeException("Escrow account inactive");

        if (customer.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds in customer account");
        }

        // Deduct from customer
        customer.setBalance(customer.getBalance().subtract(amount));
        bankAccountRepository.save(customer);

        // Add to escrow
        escrow.setBalance(escrow.getBalance().add(amount));
        bankAccountRepository.save(escrow);

        return true;
    }

    // ===== Release funds to seller (10% commission) =====
    public boolean releaseFundsToSeller(String sellerAccountNumber, BigDecimal amount) {
        BankAccount seller = getBankAccountByAccountNumber(sellerAccountNumber);
        BankAccount escrow = getBankAccountByAccountNumber("ESCROW0001");

        if (!seller.getActive()) throw new RuntimeException("Seller account inactive");

        if (escrow.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Escrow has insufficient funds");
        }

        // Deduct from escrow
        escrow.setBalance(escrow.getBalance().subtract(amount));
        bankAccountRepository.save(escrow);

        // Deduct platform commission
        BigDecimal commission = amount.multiply(BigDecimal.valueOf(0.10));
        BigDecimal sellerAmount = amount.subtract(commission);

        // Add to seller
        seller.setBalance(seller.getBalance().add(sellerAmount));
        bankAccountRepository.save(seller);

        return true;
    }

    // ===== Refund customer =====
    public boolean refundToCustomer(String customerAccountNumber, BigDecimal amount) {
        BankAccount customer = getBankAccountByAccountNumber(customerAccountNumber);
        BankAccount escrow = getBankAccountByAccountNumber("ESCROW0001");

        if (escrow.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Escrow has insufficient funds for refund");
        }

        // Deduct from escrow
        escrow.setBalance(escrow.getBalance().subtract(amount));
        bankAccountRepository.save(escrow);

        // Add back to customer
        customer.setBalance(customer.getBalance().add(amount));
        bankAccountRepository.save(customer);

        return true;
    }
    public BankAccount createEscrowAccount(String holderName, BigDecimal initialBalance) {
        // Check if already exists
        try {
            return getBankAccountByAccountNumber(PLATFORM_ESCROW_ACCOUNT_NUMBER);
        } catch (RuntimeException e) {
            BankAccount escrow = new BankAccount();
            escrow.setAccountHolderName(holderName);
            escrow.setBalance(initialBalance);
            escrow.setAccountNumber(PLATFORM_ESCROW_ACCOUNT_NUMBER);
            escrow.setAccountType(AccountType.ESCROW);
            escrow.setActive(true);
            return bankAccountRepository.save(escrow);
        }
    }
}
