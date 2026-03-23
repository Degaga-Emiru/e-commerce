package com.ecommerce.ecommerce.config;
import com.ecommerce.ecommerce.entity.BankAccount;
import com.ecommerce.ecommerce.repository.BankAccountRepository;
import com.ecommerce.ecommerce.service.DemoBankService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class EscrowAccountInitializer {

    private final DemoBankService demoBankService;

    public EscrowAccountInitializer(DemoBankService demoBankService) {
        this.demoBankService = demoBankService;
    }

    @PostConstruct
    public void init() {
        // Check if escrow account already exists
        try {
            demoBankService.getBankAccountByAccountNumber("ESCROW0001");
        } catch (RuntimeException e) {
            // Account does not exist, create it
            demoBankService.createEscrowAccount("Platform Escrow", BigDecimal.ZERO);
            System.out.println("Escrow account initialized successfully.");
        }
    }
}