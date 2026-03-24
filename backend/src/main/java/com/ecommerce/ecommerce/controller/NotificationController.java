package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.ApiResponse;
import com.ecommerce.ecommerce.entity.Notification;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.service.NotificationService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Notification> result = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications retrieved", result));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElseThrow();
        Map<String, Long> result = Map.of("count", notificationService.getUnreadCount(user.getId()));
        return ResponseEntity.ok(new ApiResponse<>(true, "Unread count", result));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read"));
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElseThrow();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "All notifications marked as read"));
    }
}
