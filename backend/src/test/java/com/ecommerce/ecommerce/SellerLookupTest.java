package com.ecommerce.ecommerce;

import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.UserRole;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class SellerLookupTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void listSellers() {
        List<User> sellers = userRepository.findByRole(UserRole.SELLER);
        System.out.println("=== SELLER LIST ===");
        for (User seller : sellers) {
            System.out.println("Email: " + seller.getEmail() + " | Name: " + seller.getFirstName());
        }
        System.out.println("===================");
    }
}
