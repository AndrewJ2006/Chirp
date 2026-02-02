package com.chirp.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chirp.dto.NotifResponse;
import com.chirp.model.User;
import com.chirp.service.NotifService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications", description = "Notification inbox and status")
@SecurityRequirement(name = "bearerAuth")
public class NotifController {

    private final NotifService notifService;

    public NotifController(NotifService notifService) {
        this.notifService = notifService;
    }

   
    @GetMapping
    @Operation(summary = "Get all notifications")
    public List<NotifResponse> getNotifications(@AuthenticationPrincipal User currentUser) {
        return notifService.getNotifications(currentUser);
    }

   
    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications")
    public List<NotifResponse> getUnreadNotifications(@AuthenticationPrincipal User currentUser) {
        return notifService.getUnreadNotifications(currentUser);
    }

  
    @GetMapping("/unread/count")
    @Operation(summary = "Get unread notifications count")
    public long getUnreadCount(@AuthenticationPrincipal User currentUser) {
        return notifService.getUnreadCount(currentUser);
    }

  
    @PostMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public NotifResponse markAsRead(@PathVariable Long id) {
        return notifService.markAsRead(id);
    }

   
    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public String markAllAsRead(@AuthenticationPrincipal User currentUser) {
        return notifService.markAllAsRead(currentUser);
    }
}

