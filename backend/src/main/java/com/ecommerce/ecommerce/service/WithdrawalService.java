package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
            throw new RuntimeException("Insufficient wallet balance for withdrawal.");
        }

        BankAccount bankAccount = bankAccountRepository.findByUserId(sellerId)
                .orElseThrow(() -> new RuntimeException("No bank account found. Please add a bank account in settings first."));

        if (!bankAccount.getActive()) {
            throw new RuntimeException("Bank account is inactive");
        }

        // Deduct balance immediately
        profile.setAvailableBalance(profile.getAvailableBalance().subtract(amount));
        sellerProfileRepository.save(profile);

        // Create Request as PENDING
        WithdrawalRequest request = new WithdrawalRequest();
        request.setSeller(profile.getUser());
        request.setAmount(amount);
        request.setStatus(WithdrawalStatus.PENDING);
        
        // Snapshot bank info
        String snapshot = String.format("Bank: %s, Holder: %s, Account: %s", 
                bankAccount.getBankName(), bankAccount.getAccountHolderName(), bankAccount.getAccountNumber());
        request.setBankAccountSnapshot(snapshot);

        return withdrawalRepository.save(request);
    }

    @Transactional
    public void approveWithdrawal(Long requestId) {
        WithdrawalRequest request = withdrawalRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found"));

        if (request.getStatus() != WithdrawalStatus.PENDING) {
            throw new RuntimeException("Request is already " + request.getStatus());
        }

        // Funds were already deducted upon request, so we just mark as COMPLETED
        request.setStatus(WithdrawalStatus.COMPLETED);
        request.setProcessedAt(LocalDateTime.now());
        withdrawalRepository.save(request);
    }

    @Transactional
    public void rejectWithdrawal(Long requestId) {
        WithdrawalRequest request = withdrawalRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found"));

        if (request.getStatus() != WithdrawalStatus.PENDING) {
            throw new RuntimeException("Request is already " + request.getStatus());
        }

        // Refund the amount back to the seller's wallet
        SellerProfile profile = sellerProfileRepository.findByUserId(request.getSeller().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        profile.setAvailableBalance(profile.getAvailableBalance().add(request.getAmount()));
        sellerProfileRepository.save(profile);

        request.setStatus(WithdrawalStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());
        withdrawalRepository.save(request);
    }

    public List<WithdrawalRequest> getAllWithdrawals() {
        return withdrawalRepository.findAllByOrderByCreatedAtDesc();
    }
}
