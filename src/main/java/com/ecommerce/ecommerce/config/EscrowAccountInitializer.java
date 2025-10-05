package com.ecommerce.ecommerce.config;
import com.ecommerce.ecommerce.entity.BankAccount;
import com.ecommerce.ecommerce.repository.BankAccountRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class EscrowAccountInitializer {

    private final BankAccountRepository bankRepo;

    public EscrowAccountInitializer(BankAccountRepository bankRepo) {
        this.bankRepo = bankRepo;
    }

    @PostConstruct
    public void init() {
        if (bankRepo.findByAccountNumber("PLATFORM-ESCROW-001").isEmpty()) {
            BankAccount escrow = new BankAccount();
            escrow.setAccountNumber("PLATFORM-ESCROW-001");
            escrow.setAccountHolderName("E-Commerce Platform Escrow");
            escrow.setBalance(new BigDecimal("100000.00"));
            escrow.setActive(true);
            bankRepo.save(escrow);
            System.out.println("✅ Escrow account initialized successfully.");
        }
    }
}
