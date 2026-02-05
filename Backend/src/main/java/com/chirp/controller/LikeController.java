package com.chirp.controller;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chirp.config.UserDetailsImpl;
import com.chirp.dto.LikeResponse;
import com.chirp.service.LikeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/likes")
@Tag(name = "Likes", description = "Like and unlike posts")
@SecurityRequirement(name = "bearerAuth")
public class LikeController {
    
    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping("/{postId}")
    @Operation(summary = "Like a post")
    public LikeResponse addLike(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long postId) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return likeService.addLike(userDetailsImpl.getUser(), postId);
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "Remove a like")
    public String removeLike(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long postId) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return likeService.removeLike(userDetailsImpl.getUser(), postId);
    }

    @GetMapping("/post/{postId}")
    @Operation(summary = "Get likes for a post")
    public List<LikeResponse> getLikesForPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return likeService.getLikesForPost(postId, pageable);
    }

    @GetMapping("/post/{postId}/count")
    @Operation(summary = "Get like count for a post")
    public Long getLikeCount(@PathVariable Long postId) {
        return likeService.getLikeCountForPost(postId);
    }

    @GetMapping("/post/{postId}/status")
    @Operation(summary = "Get like status for current user")
    public LikeResponse getLikeStatus(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long postId) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return likeService.getLikeStatus(userDetailsImpl.getUser(), postId);
    }
}
