package com.chirp.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chirp.config.UserDetailsImpl;
import com.chirp.dto.MessageRequest;
import com.chirp.dto.MessageResponse;
import com.chirp.model.User;
import com.chirp.service.MessageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/messages")
@Tag(name = "Messages", description = "Direct messages between users")
@SecurityRequirement(name = "bearerAuth")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/recent")
    @Operation(summary = "Get list of users you've recently messaged")
    public List<User> getRecentConversations(@AuthenticationPrincipal UserDetails userDetails) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return messageService.getRecentConversations(userDetailsImpl.getUser());
    }

    @GetMapping("/with/{userId}")
    @Operation(summary = "Get conversation with a user")
    public List<MessageResponse> getConversation(@AuthenticationPrincipal UserDetails userDetails,
                                                 @PathVariable Long userId) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return messageService.getConversation(userDetailsImpl.getUser(), userId);
    }

    @PostMapping("/with/{userId}")
    @Operation(summary = "Send a message to a user")
    public MessageResponse sendMessage(@AuthenticationPrincipal UserDetails userDetails,
                                       @PathVariable Long userId,
                                       @RequestBody MessageRequest request) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return messageService.sendMessage(userDetailsImpl.getUser(), userId, request.getContent());
    }
}
