package com.ecommerce.ecommerce.repository;
import com.ecommerce.ecommerce.entity.AccountType;
import com.ecommerce.ecommerce.entity.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    Optional<BankAccount> findByAccountNumber(String accountNumber);
    Optional<BankAccount> findByUserId(Long userId);
    Optional<BankAccount> findByAccountNumberAndRoutingNumber(String accountNumber, String routingNumber);
    Optional<BankAccount> findByAccountType(String accountType);

    Optional<BankAccount> findByAccountNumberAndAccountType(String accountNumber, AccountType type); // <-- ADD THIS

    @Query("SELECT ba FROM BankAccount ba WHERE ba.user.email = :email")
    Optional<BankAccount> findByUserEmail(@Param("email") String email);

    boolean existsByAccountNumber(String accountNumber);
}