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

@RestController
@RequestMapping("/notifications")
public class NotifController {

    private final NotifService notifService;

    public NotifController(NotifService notifService) {
        this.notifService = notifService;
    }

   
    @GetMapping
    public List<NotifResponse> getNotifications(@AuthenticationPrincipal User currentUser) {
        return notifService.getNotifications(currentUser);
    }

   
    @GetMapping("/unread")
    public List<NotifResponse> getUnreadNotifications(@AuthenticationPrincipal User currentUser) {
        return notifService.getUnreadNotifications(currentUser);
    }

  
    @GetMapping("/unread/count")
    public long getUnreadCount(@AuthenticationPrincipal User currentUser) {
        return notifService.getUnreadCount(currentUser);
    }

  
    @PostMapping("/{id}/read")
    public NotifResponse markAsRead(@PathVariable Long id) {
        return notifService.markAsRead(id);
    }

   
    @PostMapping("/read-all")
    public String markAllAsRead(@AuthenticationPrincipal User currentUser) {
        return notifService.markAllAsRead(currentUser);
    }
}

