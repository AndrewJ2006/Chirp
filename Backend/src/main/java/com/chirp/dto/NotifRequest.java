package com.chirp.dto;

public class NotifRequest {
    private Long recipientId;
    private Long actorId;
    private Long postId;
    private String type;
    private String message;

    public NotifRequest() {}

    public NotifRequest(Long recipientId, Long actorId, Long postId, String type, String message) {
        this.recipientId = recipientId;
        this.actorId = actorId;
        this.postId = postId;
        this.type = type;
        this.message = message;
    }

    public Long getRecipientId() { return recipientId; }
    public Long getActorId() { return actorId; }
    public Long getPostId() { return postId; }
    public String getType() { return type; }
    public String getMessage() { return message; }
}
