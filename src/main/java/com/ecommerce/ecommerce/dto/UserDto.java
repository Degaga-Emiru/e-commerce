package com.ecommerce.ecommerce.dto;
import com.ecommerce.ecommerce.entity.UserRole;
import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UserRole role;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ShippingAddressDto address;
    private Integer totalOrders;
    private Double totalSpent;
    private LocalDateTime lastLogin;

    // Constructors
    public UserDto() {}

    public UserDto(Long id, String email, String firstName, String lastName, UserRole role) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public ShippingAddressDto getAddress() { return address; }
    public void setAddress(ShippingAddressDto address) { this.address = address; }

    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }

    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    // Utility methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isSeller() {
        return role == UserRole.SELLER || role == UserRole.ADMIN;
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    public String getRoleDisplayName() {
        switch (role) {
            case ADMIN: return "Administrator";
            case SELLER: return "Seller";
            case CUSTOMER: return "Customer";
            case SUPPORT_STAFF: return "Support Staff";
            case DELIVERY_STAFF: return "Delivery Staff";
            default: return "User";
        }
    }

    @Override
    public String toString() {
        return "UserDto{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", role=" + role +
                ", enabled=" + enabled +
                '}';
    }
}
