package com.chirp.dto;

import java.time.LocalDateTime;

public class PostResponse {
    private Long id;
    private String content;
    private String mediaUrl;
    private Long authorId;
    private String authorUsername;
    private String authorProfilePictureUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PostResponse() {}

    public PostResponse(Long id, String content, String mediaUrl, Long authorId, String authorUsername, String authorProfilePictureUrl, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.authorProfilePictureUrl = authorProfilePictureUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public String getContent() { return content; }
    public String getMediaUrl() { return mediaUrl; }
    public Long getAuthorId() { return authorId; }
    public String getAuthorUsername() { return authorUsername; }
    public String getAuthorProfilePictureUrl() { return authorProfilePictureUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setContent(String content) { this.content = content; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public void setAuthorProfilePictureUrl(String authorProfilePictureUrl) { this.authorProfilePictureUrl = authorProfilePictureUrl; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
