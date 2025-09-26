package com.ecommerce.ecommerce.dto;

import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Collection<String> authorities;

    public AuthResponse() {}

    public AuthResponse(String token, UserDetails userDetails) {
        this.token = token;
        if (userDetails != null) {
            this.email = userDetails.getUsername();
            this.authorities = userDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .toList();
        }
    }

    public AuthResponse(String token, Long id, String email, String firstName, String lastName, String role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Collection<String> getAuthorities() { return authorities; }
    public void setAuthorities(Collection<String> authorities) { this.authorities = authorities; }
}
