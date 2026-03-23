package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.UserRole;
import com.ecommerce.ecommerce.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setFirstName(firstName != null ? firstName : "Google");
            user.setLastName(lastName != null ? lastName : "User");
            user.setRole(UserRole.CUSTOMER);
            user.setEnabled(true);
            user.setPassword(java.util.UUID.randomUUID().toString()); // Satisfy non-null constraint
            userRepository.save(user);
        }

        return oAuth2User;
    }
}
