package com.chirp.service;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chirp.dto.NotifResponse;
import com.chirp.model.Notification;
import com.chirp.model.Post;
import com.chirp.model.User;
import com.chirp.repository.NotifRepo;

@Service
public class NotifService {

    private final NotifRepo notifRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public NotifService(NotifRepo notifRepo, SimpMessagingTemplate messagingTemplate) {
        this.notifRepo = notifRepo;
        this.messagingTemplate = messagingTemplate;
    }

   
    public NotifResponse createNotification(User recipient, User actor, Post post, String type, String message) {
        Notification notification = new Notification(recipient, actor, post, type, message);
        notifRepo.save(notification);
        
        NotifResponse response = toResponse(notification);
        
        // Send real-time notification via WebSocket to the recipient
        messagingTemplate.convertAndSend(
            "/topic/notifications/" + recipient.getId(),
            response
        );
        
        return response;
    }

    public List<NotifResponse> getNotifications(User recipient) {
        return notifRepo.findAllByRecipientOrderByCreatedAtDesc(recipient)
            .stream()
            .map(this::toResponse)
            .toList();
    }

   
    public List<NotifResponse> getUnreadNotifications(User recipient) {
        return notifRepo.findAllByRecipientAndReadFalseOrderByCreatedAtDesc(recipient)
            .stream()
            .map(this::toResponse)
            .toList();
    }

   
    @Transactional
    public NotifResponse markAsRead(Long notificationId) {
        Notification notification = notifRepo.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification does not exist"));
        
        notification.markAsRead();
        notifRepo.save(notification);
        return toResponse(notification);
    }

   
    @Transactional
    public String markAllAsRead(User recipient) {
        List<Notification> unreadNotifications = notifRepo.findAllByRecipientAndReadFalseOrderByCreatedAtDesc(recipient);
        
        unreadNotifications.forEach(Notification::markAsRead);
        notifRepo.saveAll(unreadNotifications);
        
        return "All notifications marked as read";
    }

   
    public long getUnreadCount(User recipient) {
        return notifRepo.findAllByRecipientAndReadFalseOrderByCreatedAtDesc(recipient).size();
    }

   
    private NotifResponse toResponse(Notification notification) {
        return new NotifResponse(
            notification.getId(),
            notification.getRecipient().getId(),
            notification.getActor() != null ? notification.getActor().getId() : null,
            notification.getPost() != null ? notification.getPost().getId() : null,
            notification.getType(),
            notification.getMessage(),
            notification.isRead(),
            notification.getCreatedAt()
        );
    }
}
