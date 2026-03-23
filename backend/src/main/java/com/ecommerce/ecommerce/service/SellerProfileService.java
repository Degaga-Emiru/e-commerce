package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.*;
import com.ecommerce.ecommerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;

    public SellerProfileService(SellerProfileRepository sellerProfileRepository, UserRepository userRepository) {
        this.sellerProfileRepository = sellerProfileRepository;
        this.userRepository = userRepository;
    }

    public SellerProfile createOrUpdateProfile(Long userId, String shopName, String description, String logoUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        SellerProfile profile = sellerProfileRepository.findByUserId(userId)
                .orElse(new SellerProfile());

        profile.setUser(user);
        profile.setShopName(shopName);
        if (description != null) profile.setDescription(description);
        if (logoUrl != null) profile.setLogoUrl(logoUrl);

        return sellerProfileRepository.save(profile);
    }

    public SellerProfile getProfileByUserId(Long userId) {
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found for user: " + userId));
    }

    public List<SellerProfile> getAllProfiles() {
        return sellerProfileRepository.findAll();
    }

    public SellerProfile verifyProfile(Long profileId, boolean verified) {
        SellerProfile profile = sellerProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found: " + profileId));
        profile.setVerified(verified);
        return sellerProfileRepository.save(profile);
    }

    public boolean hasProfile(Long userId) {
        return sellerProfileRepository.existsByUserId(userId);
    }
}
