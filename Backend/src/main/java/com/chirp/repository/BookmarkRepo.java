package com.chirp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chirp.model.Bookmark;

public interface BookmarkRepo extends JpaRepository<Bookmark, Long> {

    @Query("SELECT b FROM Bookmark b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Bookmark> findByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Bookmark b WHERE b.user.id = :userId AND b.post.id = :postId")
    Optional<Bookmark> findByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);

    @Query("SELECT COUNT(b) > 0 FROM Bookmark b WHERE b.user.id = :userId AND b.post.id = :postId")
    boolean existsByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);

    void deleteByUserIdAndPostId(Long userId, Long postId);
}
