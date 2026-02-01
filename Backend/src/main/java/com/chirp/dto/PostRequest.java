package com.chirp.dto;

public class PostRequest {
    private String content;

    public PostRequest() {}

    public PostRequest(String content) {
        this.content = content;
    }

    public String getContent() { return content; }
    
    public void setContent(String content) { this.content = content; }
}
