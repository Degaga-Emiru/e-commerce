package com.ecommerce.ecommerce.service;


import com.ecommerce.ecommerce.dto.RegisterRequest;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.UserRole;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.otp.expiration-minutes:15}")
    private int otpExpirationMinutes;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setRole(UserRole.CUSTOMER);
        user.setEnabled(false);

        String otpCode = generateOtpCode();
        user.setVerificationCode(otpCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(otpExpirationMinutes));

        User savedUser = userRepository.save(user);

        emailService.sendOtpVerificationEmail(savedUser.getEmail(), otpCode, savedUser.getFirstName());

        return savedUser;
    }

    public User verifyOtp(String email, String otpCode) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        User user = userOptional.get();

        if (user.isEnabled()) {
            throw new RuntimeException("User is already verified");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(otpCode)) {
            throw new RuntimeException("Invalid OTP code");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP code has expired");
        }

        user.setEnabled(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);

        User verifiedUser = userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(verifiedUser.getEmail(), verifiedUser.getFirstName());

        return verifiedUser;
    }

    public String resendOtp(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        User user = userOptional.get();

        if (user.isEnabled()) {
            throw new RuntimeException("User is already verified");
        }

        String newOtp = generateOtpCode();
        user.setVerificationCode(newOtp);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(otpExpirationMinutes));

        userRepository.save(user);

        emailService.sendOtpVerificationEmail(user.getEmail(), newOtp, user.getFirstName());

        return newOtp;
    }

    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(Long userId, UserRole newRole) {
        User user = getUserById(userId);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public User updateUserProfile(Long userId, String firstName, String lastName, String phoneNumber) {
        User user = getUserById(userId);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        return userRepository.save(user);
    }

    public boolean isUserVerified(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        return userOptional.map(User::isEnabled).orElse(false);
    }

    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }

    public Long getUserCountByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                query, query, query);
    }
    // new class
    public String initiatePasswordReset(String email) {
        User user = getUserByEmail(email);

        if (!user.isEnabled()) {
            throw new RuntimeException("User account is not verified");
        }

        // Generate OTP
        String otpCode = generateOtpCode();
        user.setVerificationCode(otpCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));

        userRepository.save(user);

        // Send OTP email
        emailService.sendPasswordResetEmail(user.getEmail(), otpCode, user.getFirstName());

        return otpCode;
    }

    public void verifyResetOtp(String email, String otpCode) {
        User user = getUserByEmail(email);

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(otpCode)) {
            throw new RuntimeException("Invalid OTP code");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP code has expired");
        }

        // OTP is valid, but don't clear it yet - wait for actual password reset
    }

    public void resetPassword(String email, String newPassword) {
        User user = getUserByEmail(email);

        // Verify OTP was previously validated
        if (user.getVerificationCode() == null) {
            throw new RuntimeException("OTP verification required before password reset");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationCode(null); // Clear the OTP after successful reset
        user.setVerificationCodeExpiry(null);

        userRepository.save(user);

        // Send confirmation email
        emailService.sendSimpleEmail(user.getEmail(), "Password Reset Successful",
                "Your password has been reset successfully. If you did not initiate this change, please contact support immediately.");
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Check if new password is different
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Send security notification
        emailService.sendSimpleEmail(user.getEmail(), "Password Changed",
                "Your account password has been changed successfully.");
    }
}