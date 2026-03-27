package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.entity.BankAccount;
import com.ecommerce.ecommerce.entity.SellerProfile;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.repository.BankAccountRepository;
import com.ecommerce.ecommerce.repository.SellerProfileRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/seller/settings")
@CrossOrigin(origins = "*")
public class SellerSettingsController {

    private final UserRepository userRepository;
    private final SellerProfileRepository profileRepository;
    private final BankAccountRepository bankRepository;
    private final PasswordEncoder passwordEncoder;

    public SellerSettingsController(UserRepository userRepository,
                                    SellerProfileRepository profileRepository,
                                    BankAccountRepository bankRepository,
                                    PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.bankRepository = bankRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings(Authentication auth) {
        User user = getUser(auth);
        SellerProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new SellerProfile(user, "", ""));
        BankAccount bank = bankRepository.findByUserId(user.getId()).orElse(null);

        Map<String, Object> data = new HashMap<>();
        data.put("user", Map.of(
            "firstName", user.getFirstName(),
            "lastName", user.getLastName(),
            "email", user.getEmail(),
            "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : ""
        ));
        data.put("profile", profile);
        data.put("bankAccount", bank);

        return ResponseEntity.ok(new ApiResponse<>(true, "Settings retrieved", data));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<String>> updateProfile(@RequestBody Map<String, String> request, Authentication auth) {
        User user = getUser(auth);
        user.setFirstName(request.get("firstName"));
        user.setLastName(request.get("lastName"));
        user.setPhoneNumber(request.get("phoneNumber"));
        userRepository.save(user);

        SellerProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new SellerProfile(user, "", ""));
        profile.setShopName(request.get("shopName"));
        profile.setDescription(request.get("description"));
        profile.setBusinessAddress(request.get("businessAddress"));
        profile.setTaxId(request.get("taxId"));
        profile.setBusinessRegistrationNumber(request.get("businessRegistrationNumber"));
        profileRepository.save(profile);

        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", null));
    }

    @PostMapping("/bank")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<BankAccount>> updateBank(@RequestBody BankAccount request, Authentication auth) {
        User user = getUser(auth);
        BankAccount bank = bankRepository.findByUserId(user.getId())
                .orElse(new BankAccount());
        
        bank.setUser(user);
        bank.setBankName(request.getBankName());
        bank.setAccountHolderName(request.getAccountHolderName());
        bank.setAccountNumber(request.getAccountNumber());
        bank.setBranchName(request.getBranchName());
        bank.setSwiftCode(request.getSwiftCode());
        bank.setActive(true);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Bank account saved", bankRepository.save(bank)));
    }

    @PutMapping("/notifications")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<String>> updateNotifications(@RequestBody Map<String, Boolean> request, Authentication auth) {
        User user = getUser(auth);
        SellerProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        
        if (request.containsKey("emailNewOrder")) profile.setEmailNewOrder(request.get("emailNewOrder"));
        if (request.containsKey("emailShippingUpdate")) profile.setEmailShippingUpdate(request.get("emailShippingUpdate"));
        if (request.containsKey("emailEscrowRelease")) profile.setEmailEscrowRelease(request.get("emailEscrowRelease"));
        
        profileRepository.save(profile);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification settings updated", null));
    }

    @PutMapping("/password")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody Map<String, String> request, Authentication auth) {
        User user = getUser(auth);
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Incorrect current password", null));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully", null));
    }

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
