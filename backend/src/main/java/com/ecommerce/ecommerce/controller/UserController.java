package com.ecommerce.ecommerce.controller;
import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.dto.UserDto;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.entity.UserRole;
import com.ecommerce.ecommerce.service.UserService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> getProfile() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userService.getUserByEmail(email);
            return ResponseEntity.ok(new ApiResponse<>(true, "User profile retrieved successfully", convertToDto(user)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@RequestBody Map<String, String> profileData) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userService.getUserByEmail(email);
            
            String firstName = profileData.getOrDefault("firstName", user.getFirstName());
            String lastName = profileData.getOrDefault("lastName", user.getLastName());
            String phoneNumber = profileData.getOrDefault("phoneNumber", user.getPhoneNumber());

            User updatedUser = userService.updateUserProfile(user.getId(), firstName, lastName, phoneNumber);
            return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", convertToDto(updatedUser)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @PostMapping("/profile/picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> updateProfilePicture(@RequestParam("image") MultipartFile image) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userService.getUserByEmail(email);
            
            User updatedUser = userService.updateProfilePicture(user.getId(), image);
            return ResponseEntity.ok(new ApiResponse<>(true, "Profile picture updated successfully", convertToDto(updatedUser)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @DeleteMapping("/profile/picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> deleteProfilePicture() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userService.getUserByEmail(email);
            
            User updatedUser = userService.deleteProfilePicture(user.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Profile picture deleted successfully", convertToDto(updatedUser)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @DeleteMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteMyAccount() {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userService.getUserByEmail(email);
            userService.deleteUser(user.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody Map<String, String> request) {
        try {
            String email = SecurityUtils.getCurrentUserEmail();
            User user = userService.getUserByEmail(email);
            
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Current and new password are required"));
            }

            userService.changePassword(user.getId(), currentPassword, newPassword);
            return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            List<UserDto> userDtos = users.stream().map(this::convertToDto).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", userDtos);
            response.put("count", users.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByRole(@PathVariable UserRole role) {
        try {
            List<User> users = userService.getUsersByRole(role);
            List<UserDto> userDtos = users.stream().map(this::convertToDto).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", userDtos);
            response.put("role", role);
            response.put("count", users.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            UserRole newRole = UserRole.valueOf(request.get("role"));
            User updatedUser = userService.updateUserRole(userId, newRole);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User role updated successfully");
            response.put("user", convertToDto(updatedUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        return dto;
    }

}