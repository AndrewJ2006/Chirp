package com.chirp.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProfileRequest {

    private String username;
    private String email;
    private Long id;
    private LocalDateTime createdAt;


    public ProfileRequest() {
    }

    public ProfileRequest(String username, String email, Long id) {
        this.username = username;
        this.email = email;
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

     public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

}
