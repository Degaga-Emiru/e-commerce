package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.entity.Notification;
import com.ecommerce.ecommerce.service.NotificationService;
import com.ecommerce.ecommerce.service.UserService;
import com.ecommerce.ecommerce.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnread() {
        Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = userService.getUserIdByEmail(SecurityUtils.getCurrentUserEmail());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
