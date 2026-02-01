package com.chirp.model;

import java.time.Instant;
import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @Column(nullable = false)
    private String type; 

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Notification() {}

    public Notification(User recipient, User actor, Post post, String type, String message) {
        this.recipient = recipient;
        this.actor = actor;
        this.post = post;
        this.type = type;
        this.message = message;
    }

    public Long getId() { return id; }
    public User getRecipient() { return recipient; }
    public User getActor() { return actor; }
    public Post getPost() { return post; }
    public String getType() { return type; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public Instant getCreatedAt() { return createdAt; }

    public void markAsRead() { this.read = true; }
}
