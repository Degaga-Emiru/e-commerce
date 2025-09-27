package com.ecommerce.ecommerce.config;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.UserRole;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createAdminUser();
    }

    private void createAdminUser() {
        String adminEmail = "admin@ecommerce.com";

        // Check if admin user already exists
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User adminUser = new User();
            adminUser.setEmail(adminEmail);
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setFirstName("System");
            adminUser.setLastName("Administrator");
            adminUser.setRole(UserRole.ADMIN);
            adminUser.setEnabled(true);
            adminUser.setPhoneNumber("+1234567890");
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());

            User savedAdmin = userRepository.save(adminUser);
            System.out.println("✅ Admin user created successfully with ID: " + savedAdmin.getId());
        } else {
            System.out.println("ℹ️ Admin user already exists");
        }
    }
}