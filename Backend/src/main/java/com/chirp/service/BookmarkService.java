package com.chirp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chirp.dto.PostResponse;
import com.chirp.model.Bookmark;
import com.chirp.model.Post;
import com.chirp.model.User;
import com.chirp.repository.BookmarkRepo;
import com.chirp.repository.PostRepo;
import com.chirp.repository.UserRepo;

@Service
public class BookmarkService {

    private final BookmarkRepo bookmarkRepo;
    private final UserRepo userRepo;
    private final PostRepo postRepo;

    public BookmarkService(BookmarkRepo bookmarkRepo, UserRepo userRepo, PostRepo postRepo) {
        this.bookmarkRepo = bookmarkRepo;
        this.userRepo = userRepo;
        this.postRepo = postRepo;
    }

    @Transactional
    public void addBookmark(Long userId, Long postId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!bookmarkRepo.existsByUserIdAndPostId(userId, postId)) {
            Bookmark bookmark = new Bookmark(user, post);
            bookmarkRepo.save(bookmark);
        }
    }

    @Transactional
    public void removeBookmark(Long userId, Long postId) {
        bookmarkRepo.deleteByUserIdAndPostId(userId, postId);
    }

    public List<PostResponse> getBookmarkedPosts(Long userId) {
        List<Bookmark> bookmarks = bookmarkRepo.findByUserId(userId);
        return bookmarks.stream()
            .map(bookmark -> {
                Post post = bookmark.getPost();
                PostResponse response = new PostResponse();
                response.setId(post.getId());
                response.setContent(post.getContent());
                response.setAuthorId(post.getAuthor().getId());
                response.setAuthorUsername(post.getAuthor().getUsername());
                response.setCreatedAt(post.getCreatedAt());
                return response;
            })
            .collect(Collectors.toList());
    }

    public boolean isBookmarked(Long userId, Long postId) {
        return bookmarkRepo.existsByUserIdAndPostId(userId, postId);
    }
}
