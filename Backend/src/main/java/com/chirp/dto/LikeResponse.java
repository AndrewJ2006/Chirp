package com.chirp.dto;

public class LikeResponse {

    private Long postId;
    private Long userId;
    private String username;
    private int likeCount;
    private boolean likedByCurrentUser;

    public LikeResponse(Long postId, Long userId, String username, int likeCount, boolean likedByCurrentUser) {
        this.postId = postId;
        this.userId = userId;
        this.username = username;
        this.likeCount = likeCount;
        this.likedByCurrentUser = likedByCurrentUser;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public boolean isLikedByCurrentUser() {
        return likedByCurrentUser;
    }

 
}

