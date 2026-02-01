package com.chirp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chirp.model.Comment;
import com.chirp.model.Post;
import com.chirp.model.User;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Long> {

    // Find all comments for a specific post, sorted by newest first
    List<Comment> findAllByPostOrderByCreatedAtDesc(Post post);

    // Optional: find all comments by a specific user
    List<Comment> findAllByAuthor(User author);
}

