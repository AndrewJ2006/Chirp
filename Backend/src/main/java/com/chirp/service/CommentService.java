package com.chirp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.chirp.dto.CommentResponse;
import com.chirp.model.Comment;
import com.chirp.model.Post;
import com.chirp.model.User;
import com.chirp.repository.CommentRepo;
import com.chirp.repository.PostRepo;

@Service
public class CommentService {

	private final CommentRepo commentRepo;
	private final PostRepo postRepo;
	private final NotifService notifService;

	public CommentService(CommentRepo commentRepo, PostRepo postRepo, NotifService notifService) {
		this.commentRepo = commentRepo;
		this.postRepo = postRepo;
		this.notifService = notifService;
	}

	public CommentResponse addComment(User author, Long postId, String content) {
		Post post = postRepo.findById(postId)
			.orElseThrow(() -> new IllegalArgumentException("Post does not exist"));

		Comment comment = new Comment(author, post, content);
		commentRepo.save(comment);

		// Create notification for post owner
		if (!post.getAuthor().getId().equals(author.getId())) {
			notifService.createNotification(
				post.getAuthor(),
				author,
				post,
				"COMMENT",
				author.getUsername() + " commented on your post"
			);
		}

		return toResponse(comment);
	}

	public List<CommentResponse> getCommentsByPost(Long postId) {
		Post post = postRepo.findById(postId)
			.orElseThrow(() -> new IllegalArgumentException("Post does not exist"));

		return commentRepo.findAllByPostOrderByCreatedAtDesc(post)
			.stream()
			.map(this::toResponse)
			.toList();
	}

	public CommentResponse updateComment(User author, Long commentId, String newContent) {
		Comment comment = commentRepo.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("Comment does not exist"));

		if (!comment.getAuthor().getId().equals(author.getId())) {
			throw new IllegalArgumentException("Comment does not belong to author");
		}

		comment.setContent(newContent);
		commentRepo.save(comment);

		return toResponse(comment);
	}

	public String deleteComment(User author, Long commentId) {
		Comment comment = commentRepo.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("Comment does not exist"));

		if (!comment.getAuthor().getId().equals(author.getId())) {
			throw new IllegalArgumentException("Comment does not belong to author");
		}

		commentRepo.delete(comment);
		return "Comment deleted";
	}

	public List<CommentResponse> getCommentsByUser(User author) {
		return commentRepo.findAllByAuthor(author)
			.stream()
			.map(this::toResponse)
			.toList();
	}

	private CommentResponse toResponse(Comment comment) {
		return new CommentResponse(
			comment.getId(),
			comment.getPost().getId(),
			comment.getAuthor().getId(),
			comment.getAuthor().getUsername(),
			comment.getContent(),
			comment.getCreatedAt(),
			comment.getUpdatedAt()
		);
	}
}
