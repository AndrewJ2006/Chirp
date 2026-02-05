package com.chirp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.chirp.dto.MessageResponse;
import com.chirp.model.Message;
import com.chirp.model.User;
import com.chirp.repository.MessageRepo;
import com.chirp.repository.UserRepo;

@Service
public class MessageService {
    private final MessageRepo messageRepo;
    private final UserRepo userRepo;

    public MessageService(MessageRepo messageRepo, UserRepo userRepo) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
    }

    public List<MessageResponse> getConversation(User currentUser, Long otherUserId) {
        User other = userRepo.findById(otherUserId)
            .orElseThrow(() -> new IllegalArgumentException("User does not exist"));

        return messageRepo.findConversation(currentUser.getId(), other.getId())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public List<User> getRecentConversations(User currentUser) {
        List<Long> userIds = messageRepo.findRecentConversationUserIds(currentUser.getId());
        return userIds.stream()
            .map(userId -> userRepo.findById(userId).orElse(null))
            .filter(user -> user != null)
            .toList();
    }

    public MessageResponse sendMessage(User sender, Long recipientId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        User recipient = userRepo.findById(recipientId)
            .orElseThrow(() -> new IllegalArgumentException("User does not exist"));

        Message message = new Message(sender, recipient, content.trim());
        Message saved = messageRepo.save(message);

        return toResponse(saved);
    }

    private MessageResponse toResponse(Message message) {
        return new MessageResponse(
            message.getId(),
            message.getSender().getId(),
            message.getSender().getUsername(),
            message.getRecipient().getId(),
            message.getRecipient().getUsername(),
            message.getContent(),
            message.getCreatedAt()
        );
    }
}
