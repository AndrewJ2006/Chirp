package com.chirp.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chirp.model.Like;
import com.chirp.model.Post;
import com.chirp.model.User;

@Repository
public interface LikeRepo extends JpaRepository<Like, Long> {

    // Find if a user liked a post
    Optional<Like> findByUserAndPost(User user, Post post);


    // Paginated likes for a post- it lets you fetch likes from the database in smaller batches and updating the front end that way
    Page<Like> findAllByPost(Post post, Pageable pageable);

// Delete a like by user & post (for unliking)
    void deleteByUserAndPost(User user, Post post);

    int countByPost(Post post);
}
