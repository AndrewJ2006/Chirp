package com.chirp.dto;

public class PostRequest {
    private String content;
    private String mediaUrl;

    public PostRequest() {}

    public PostRequest(String content) {
        this.content = content;
    }

    public PostRequest(String content, String mediaUrl) {
        this.content = content;
        this.mediaUrl = mediaUrl;
    }

    public String getContent() { return content; }
    public String getMediaUrl() { return mediaUrl; }
    
    public void setContent(String content) { this.content = content; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
}
