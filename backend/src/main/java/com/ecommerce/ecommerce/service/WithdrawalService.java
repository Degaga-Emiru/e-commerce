package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class WithdrawalService {

    private final WithdrawalRequestRepository withdrawalRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final DemoBankService demoBankService;
    private final BankAccountRepository bankAccountRepository;
    private final ChapaService chapaService;

    public WithdrawalService(WithdrawalRequestRepository withdrawalRepository,
                             SellerProfileRepository sellerProfileRepository,
                             DemoBankService demoBankService,
                             BankAccountRepository bankAccountRepository,
                             ChapaService chapaService) {
        this.withdrawalRepository = withdrawalRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.demoBankService = demoBankService;
        this.bankAccountRepository = bankAccountRepository;
        this.chapaService = chapaService;
    }

    @Transactional
    public WithdrawalRequest requestWithdrawal(Long sellerId, BigDecimal amount) {
        SellerProfile profile = sellerProfileRepository.findByUserId(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        if (profile.getAvailableBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance for withdrawal");
        }

        BankAccount bankAccount = bankAccountRepository.findByUserId(sellerId)
                .orElseThrow(() -> new RuntimeException("No bank account found. Please add a bank account in settings first."));

        if (!bankAccount.getActive()) {
            throw new RuntimeException("Bank account is inactive");
        }

        // Create Request immediately as APPROVED
        WithdrawalRequest request = new WithdrawalRequest();
        request.setSeller(profile.getUser());
        request.setAmount(amount);
        request.setStatus(WithdrawalStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());
        
        // Snapshot bank info
        String snapshot = String.format("Bank: %s, Holder: %s, Account: %s", 
                bankAccount.getBankName(), bankAccount.getAccountHolderName(), bankAccount.getAccountNumber());
        request.setBankAccountSnapshot(snapshot);

        // Deduct from available balance officially
        profile.setAvailableBalance(profile.getAvailableBalance().subtract(amount));
        sellerProfileRepository.save(profile);

        // LIVE CHAPA PAYOUT TRIGGER
        try {
            chapaService.transferFunds(bankAccount.getAccountHolderName(), bankAccount.getAccountNumber(), amount, bankAccount.getBankName());
            request.setStatus(WithdrawalStatus.APPROVED);
        } catch (Exception e) {
            // Restore funds if transfer API call fails entirely
            profile.setAvailableBalance(profile.getAvailableBalance().add(amount));
            sellerProfileRepository.save(profile);
            throw new RuntimeException("Chapa payout failed: " + e.getMessage());
        }

        return withdrawalRepository.save(request);
    }

    @Transactional
    public void approveWithdrawal(Long requestId) {
        WithdrawalRequest request = withdrawalRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found"));

        if (request.getStatus() != WithdrawalStatus.PENDING) {
            throw new RuntimeException("Request is already " + request.getStatus());
        }

        // Process actual bank transfer simulation
        BankAccount platformEscrow = bankAccountRepository.findByAccountNumber("ESCROW0001")
                .orElseThrow(() -> new RuntimeException("Platform escrow account not found"));
        
        BankAccount sellerBank = bankAccountRepository.findByUserId(request.getSeller().getId())
                .orElseThrow(() -> new RuntimeException("Seller bank account not found"));

        // Platform -> Seller transfer
        platformEscrow.setBalance(platformEscrow.getBalance().subtract(request.getAmount()));
        sellerBank.setBalance(sellerBank.getBalance().add(request.getAmount()));
        
        bankAccountRepository.save(platformEscrow);
        bankAccountRepository.save(sellerBank);

        request.setStatus(WithdrawalStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());
        withdrawalRepository.save(request);
    }
}
