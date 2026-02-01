package com.chirp.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chirp.dto.PostRequest;
import com.chirp.dto.PostResponse;
import com.chirp.model.User;
import com.chirp.service.PostService;
import com.chirp.service.UserService;

@RestController
@RequestMapping("/posts")
public class PostController {
    
    private final PostService postService;
    private final UserService userService;

    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    @PostMapping
    public PostResponse createPost(@AuthenticationPrincipal User author, @RequestBody PostRequest request) {
        return postService.createPost(author, request.getContent());
    }

    @PutMapping("/{postId}")
    public PostResponse updatePost(@AuthenticationPrincipal User author, @PathVariable Long postId, @RequestBody PostRequest request) {
        return postService.updatePost(author, postId, request.getContent());
    }

    @DeleteMapping("/{postId}")
    public String deletePost(@AuthenticationPrincipal User author, @PathVariable Long postId) {
        return postService.deletePost(author, postId);
    }

    @GetMapping("/{postId}")
    public PostResponse getPost(@PathVariable Long postId) {
        return postService.getPost(postId);
    }

    @GetMapping("/users/{userId}/posts")
    public List<PostResponse> getPostsByUser(@PathVariable Long userId) {
        User user = userService.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User does not exist"));
        return postService.getPostsByUser(user);
    }

    @GetMapping("/feed")
    public List<PostResponse> getFeed(
        @AuthenticationPrincipal User currentUser,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        return postService.getFeed(currentUser, page, size);
    }

}
