package com.chirp.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.chirp.dto.PostResponse;
import com.chirp.model.Post;
import com.chirp.model.User;
import com.chirp.repository.PostRepo;

@Service
public class PostService {
  
    
private final PostRepo postRepo;
private final RelService relService;


    public PostService(PostRepo postRepo, RelService relService) {
        this.postRepo = postRepo;
        this.relService = relService;
    }

public PostResponse createPost(User author, String content, String mediaUrl) {

    Post post = new Post(content, mediaUrl, author);
    postRepo.save(post);

    PostResponse response = new PostResponse(post.getId(), post.getContent(), post.getMediaUrl(), post.getAuthor().getId(), post.getAuthor().getUsername(), post.getCreatedAt(), post.getUpdatedAt());
    return response;
}


public PostResponse updatePost(User author, Long postId, String newContent) {

    Post post = postRepo.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));
        
    
    if (!post.getAuthor().getId().equals(author.getId())) {
        throw new IllegalArgumentException("Post does not belong to author");
    }

    post.updateContent(newContent);
    postRepo.save(post);

    return new PostResponse(
        post.getId(),
        post.getContent(),
        post.getMediaUrl(),
        post.getAuthor().getId(),
        post.getAuthor().getUsername(),
        post.getCreatedAt(),
        post.getUpdatedAt()
    );

}

public String deletePost(User author, Long postId) {

    
    Post post = postRepo.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));

     if (!post.getAuthor().getId().equals(author.getId())) {
        throw new IllegalArgumentException("Post does not belong to author");
    }

    postRepo.delete(post);

    return "Post deleted";

}

public PostResponse getPost(Long postId) {
   
    Post post = postRepo.findById(postId)
        .orElseThrow(() -> new IllegalArgumentException("Post does not exist"));


    return new PostResponse(
            post.getId(),
            post.getContent(),
            post.getMediaUrl(),
            post.getAuthor().getId(),
            post.getAuthor().getUsername(),
            post.getCreatedAt(),
            post.getUpdatedAt()
        );

}

public List<PostResponse> getPostsByUser(User author) {
    List<Post> posts = postRepo.findAllByAuthor(author);
    return posts.stream().map(post -> new PostResponse(
                                        post.getId(),
                                        post.getContent(),
                                        post.getMediaUrl(),
                                        post.getAuthor().getId(),
                                        post.getAuthor().getUsername(),
                                        post.getCreatedAt(),
                                        post.getUpdatedAt()
                                ))
                                .toList();
}


public List<PostResponse> getFeed(User currentUser) {
    List<User> following = relService.getFollowingUsers(currentUser.getId());
    List<Post> posts = postRepo.findAllByAuthorInOrderByCreatedAtDesc(following);
    
    return posts.stream().map(post -> new PostResponse(
                                        post.getId(),
                                        post.getContent(),
                                        post.getMediaUrl(),
                                        post.getAuthor().getId(),
                                        post.getAuthor().getUsername(),
                                        post.getCreatedAt(),
                                        post.getUpdatedAt()
                                ))
                                .toList();
    
}





public List<PostResponse> getFeed(User currentUser, int page, int size) {
    List<User> following = relService.getFollowingUsers(currentUser.getId());
    following.add(currentUser); // Include user's own posts in feed
    
    if (following.isEmpty()) {
        return List.of();
    }
    
    Pageable pageable = PageRequest.of(page, size);

    return postRepo.findAllByAuthorInOrderByCreatedAtDesc(following, pageable)
                   .stream()
                   .map(post -> new PostResponse(
                        post.getId(),
                        post.getContent(),
                        post.getMediaUrl(),
                        post.getAuthor().getId(),
                        post.getAuthor().getUsername(),
                        post.getCreatedAt(),
                        post.getUpdatedAt()
                   ))
                   .toList();
}


}
