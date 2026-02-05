package com.chirp.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="chirp_post")
public class Post {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    Long id;
    @Column(nullable = false, length = 280)
    String content;
    @Column(length = 10000000)
    String mediaUrl;
    @ManyToOne(optional = false)
    User author;

    // JPA takes care of timestamps
    @CreationTimestamp
    LocalDateTime createdAt;
    @UpdateTimestamp
    LocalDateTime updatedAt;  


    public Post(){

    }

    public Post(String content, User author) {
        this.content = content;
        this.author = author;
        
    }

    public Post(String content, String mediaUrl, User author) {
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.author = author;
    }


    public Long getId() { return id; }
    public String getContent() { return content; }
    public String getMediaUrl() { return mediaUrl; }
    public User getAuthor() { return author; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

  
    public void updateContent(String content) {
        this.content = content;
    }
}
