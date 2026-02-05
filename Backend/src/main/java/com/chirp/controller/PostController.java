package com.chirp.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chirp.config.UserDetailsImpl;
import com.chirp.dto.PostRequest;
import com.chirp.dto.PostResponse;
import com.chirp.model.User;
import com.chirp.service.PostService;
import com.chirp.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/posts")
@Tag(name = "Posts", description = "Create and retrieve posts")
@SecurityRequirement(name = "bearerAuth")
public class PostController {
    
    private final PostService postService;
    private final UserService userService;

    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    @PostMapping
    @Operation(summary = "Create a post")
    public PostResponse createPost(@AuthenticationPrincipal UserDetails userDetails, @RequestBody PostRequest request) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return postService.createPost(userDetailsImpl.getUser(), request.getContent(), request.getMediaUrl());
    }

    @PutMapping("/{postId}")
    @Operation(summary = "Update a post")
    public PostResponse updatePost(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long postId, @RequestBody PostRequest request) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return postService.updatePost(userDetailsImpl.getUser(), postId, request.getContent());
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "Delete a post")
    public String deletePost(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long postId) {
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return postService.deletePost(userDetailsImpl.getUser(), postId);
    }

    @GetMapping("/{postId}")
    @Operation(summary = "Get a post by id")
    public PostResponse getPost(@PathVariable Long postId) {
        return postService.getPost(postId);
    }

    @GetMapping("/users/{userId}/posts")
    @Operation(summary = "Get posts by user")
    public List<PostResponse> getPostsByUser(@PathVariable Long userId) {
        User user = userService.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User does not exist"));
        return postService.getPostsByUser(user);
    }

    @GetMapping("/feed")
    @Operation(summary = "Get feed of followed users")
    public List<PostResponse> getFeed(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        if (userDetails == null) {
            throw new IllegalArgumentException("User must be authenticated");
        }
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        return postService.getFeed(userDetailsImpl.getUser(), page, size);
    }

}
