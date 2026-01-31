    package com.chirp.model;

    import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

    @Entity
    @Table(name="chirp_user")
    public class User {
        @Id
        @GeneratedValue(strategy=GenerationType.IDENTITY)
        private Long id;
        @Column(name="username", length=50, nullable=false)
        private String username;
        @Column(name="email", length=255, nullable=false)
        private String email;
        @Column(name="password", length=255, nullable=false)  // increase length!
        private String password;
        @Column(name="created", nullable=false)
        private LocalDateTime createdAt;

        @Column(name = "is_private")
        private boolean isPrivate = false;


        public User() {
            //for springboot 
        }

        public User(String username, String email,  String password) {
            this.username = username;
            this.email = email;
            this.password = password;
            this.isPrivate = false;

        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
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

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public boolean isPrivate() {
            return isPrivate;
        }

        public void setPrivate(boolean isPrivate) {
            this.isPrivate = isPrivate;
        }

    }
