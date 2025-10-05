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
        createSellerUser();
        createDeliveryStaffUser();
        createSupportStaffUser();
    }

    private void createAdminUser() {
        String adminEmail = "admin@ecommerce.com";
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

    private void createSellerUser() {
        String sellerEmail = "degagaemiru7@gmail.com";
        if (userRepository.findByEmail(sellerEmail).isEmpty()) {
            User sellerUser = new User();
            sellerUser.setEmail(sellerEmail);
            sellerUser.setPassword(passwordEncoder.encode("seller123"));
            sellerUser.setFirstName("Deguant");
            sellerUser.setLastName("Seller");
            sellerUser.setRole(UserRole.SELLER);
            sellerUser.setEnabled(true);
            sellerUser.setPhoneNumber("+1234567891");
            sellerUser.setCreatedAt(LocalDateTime.now());
            sellerUser.setUpdatedAt(LocalDateTime.now());

            User savedSeller = userRepository.save(sellerUser);
            System.out.println("✅ Seller user created successfully with ID: " + savedSeller.getId());
        } else {
            System.out.println("ℹ️ Seller user already exists");
        }
    }

    private void createDeliveryStaffUser() {
        String deliveryEmail = "delivery@ecommerce.com";
        if (userRepository.findByEmail(deliveryEmail).isEmpty()) {
            User deliveryUser = new User();
            deliveryUser.setEmail(deliveryEmail);
            deliveryUser.setPassword(passwordEncoder.encode("delivery123"));
            deliveryUser.setFirstName("Mike");
            deliveryUser.setLastName("Delivery");
            deliveryUser.setRole(UserRole.DELIVERY_STAFF);
            deliveryUser.setEnabled(true);
            deliveryUser.setPhoneNumber("+1234567892");
            deliveryUser.setCreatedAt(LocalDateTime.now());
            deliveryUser.setUpdatedAt(LocalDateTime.now());

            User savedDelivery = userRepository.save(deliveryUser);
            System.out.println("✅ Delivery Staff user created successfully with ID: " + savedDelivery.getId());
        } else {
            System.out.println("ℹ️ Delivery Staff user already exists");
        }
    }

    private void createSupportStaffUser() {
        String supportEmail = "support@ecommerce.com";
        if (userRepository.findByEmail(supportEmail).isEmpty()) {
            User supportUser = new User();
            supportUser.setEmail(supportEmail);
            supportUser.setPassword(passwordEncoder.encode("support123"));
            supportUser.setFirstName("Sarah");
            supportUser.setLastName("Support");
            supportUser.setRole(UserRole.SUPPORT_STAFF);
            supportUser.setEnabled(true);
            supportUser.setPhoneNumber("+1234567893");
            supportUser.setCreatedAt(LocalDateTime.now());
            supportUser.setUpdatedAt(LocalDateTime.now());

            User savedSupport = userRepository.save(supportUser);
            System.out.println("✅ Support Staff user created successfully with ID: " + savedSupport.getId());
        } else {
            System.out.println("ℹ️ Support Staff user already exists");
        }
    }
}