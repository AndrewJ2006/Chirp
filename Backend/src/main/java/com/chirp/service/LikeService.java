package com.chirp.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chirp.dto.LikeResponse;
import com.chirp.model.Like;
import com.chirp.model.Post;
import com.chirp.model.User;
import com.chirp.repository.LikeRepo;
import com.chirp.repository.PostRepo;

@Service
public class LikeService {
   
    private final PostRepo postRepo;
    private final LikeRepo likeRepo;
    private final NotifService notifService;
    public LikeService(PostRepo postRepo, LikeRepo likeRepo, NotifService notifService) {
        this.postRepo = postRepo;
        this.likeRepo = likeRepo;
        this.notifService = notifService;
    }
    public LikeResponse addLike(User user, Long postId) {

      Post post = postRepo.findById(postId) 
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));
    

    if (likeRepo.findByUserAndPost(user, post).isPresent()) {
        throw new IllegalArgumentException("User already like post");
    }

    Like like = new Like(user, post);
    likeRepo.save(like);

    int likeCount = likeRepo.countByPost(like.getPost()); 
    boolean likedByCurrentUser = true; 

    // Create notification for post owner
    if (!post.getAuthor().getId().equals(user.getId())) {
        notifService.createNotification(
            post.getAuthor(),
            user,
            post,
            "LIKE",
            user.getUsername() + " liked your post"
        );
    }

    LikeResponse response = new LikeResponse(
    like.getPost().getId(),
    like.getUser().getId(),
    like.getUser().getUsername(),
    likeCount,
    likedByCurrentUser
    );

    return response;
}

@Transactional
public String removeLike(User user, Long postId) {
    Post post = postRepo.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));
    
    Like like = likeRepo.findByUserAndPost(user, post)
        .orElseThrow(() -> new IllegalArgumentException("Like does not exist"));
    
    likeRepo.delete(like);
    
    return "Like removed";
}

public List<LikeResponse> getLikesForPost(Long postId, Pageable pageable) {
    Post post = postRepo.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));
    
    Page<Like> likes = likeRepo.findAllByPost(post, pageable);
    int totalLikeCount = likeRepo.countByPost(post);
    
    return likes.stream()
        .map(like -> new LikeResponse(
            like.getPost().getId(),
            like.getUser().getId(),
            like.getUser().getUsername(),
            totalLikeCount,
            false 
        ))
        .toList();
}

public Long getLikeCountForPost(Long postId) {
    Post post = postRepo.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));
    
    return (long) likeRepo.countByPost(post);
}

public boolean hasUserLikedPost(User user, Long postId) {
    Post post = postRepo.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));
    
    return likeRepo.findByUserAndPost(user, post).isPresent();
}

public LikeResponse getLikeStatus(User user, Long postId) {
    Post post = postRepo.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));
    
    int likeCount = likeRepo.countByPost(post);
    boolean likedByCurrentUser = likeRepo.findByUserAndPost(user, post).isPresent();
    
    return new LikeResponse(
        post.getId(),
        user.getId(),
        user.getUsername(),
        likeCount,
        likedByCurrentUser
    );
}
}
