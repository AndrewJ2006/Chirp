package com.chirp.dto;

import java.time.Instant;

public class NotifResponse {

    private Long id;
    private Long recipientId;
    private Long actorId;
    private Long postId;
    private String type;
    private String message;
    private boolean read;
    private Instant createdAt;

    public NotifResponse(Long id, Long recipientId, Long actorId, Long postId, String type, String message, boolean read, Instant createdAt) {
        this.id = id;
        this.recipientId = recipientId;
        this.actorId = actorId;
        this.postId = postId;
        this.type = type;
        this.message = message;
        this.read = read;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getRecipientId() { return recipientId; }
    public Long getActorId() { return actorId; }
    public Long getPostId() { return postId; }
    public String getType() { return type; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public Instant getCreatedAt() { return createdAt; }
}
