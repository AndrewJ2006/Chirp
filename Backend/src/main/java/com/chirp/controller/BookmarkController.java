package com.chirp.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.chirp.dto.PostResponse;
import com.chirp.model.User;
import com.chirp.service.BookmarkService;
import com.chirp.service.UserService;

@RestController
@RequestMapping("/bookmarks")
@Tag(name = "Bookmarks", description = "Bookmark posts")
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final UserService userService;

    public BookmarkController(BookmarkService bookmarkService, UserService userService) {
        this.bookmarkService = bookmarkService;
        this.userService = userService;
    }

    @PostMapping("/{postId}")
    @Operation(summary = "Add a bookmark")
    public void addBookmark(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        bookmarkService.addBookmark(user.getId(), postId);
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "Remove a bookmark")
    public void removeBookmark(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        bookmarkService.removeBookmark(user.getId(), postId);
    }

    @GetMapping
    @Operation(summary = "Get all bookmarked posts")
    public List<PostResponse> getBookmarks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return bookmarkService.getBookmarkedPosts(user.getId());
    }

    @GetMapping("/check/{postId}")
    @Operation(summary = "Check if post is bookmarked")
    public boolean isBookmarked(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        return bookmarkService.isBookmarked(user.getId(), postId);
    }
}
