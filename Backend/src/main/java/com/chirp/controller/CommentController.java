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
import org.springframework.web.bind.annotation.RestController;

import com.chirp.config.UserDetailsImpl;
import com.chirp.dto.CommentRequest;
import com.chirp.dto.CommentResponse;
import com.chirp.model.User;
import com.chirp.service.CommentService;
import com.chirp.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Comments", description = "Create and manage comments")
@SecurityRequirement(name = "bearerAuth")
public class CommentController {

	private final CommentService commentService;
	private final UserService userService;

	public CommentController(CommentService commentService, UserService userService) {
		this.commentService = commentService;
		this.userService = userService;
	}

	@PostMapping("/comments/{postId}")
	@Operation(summary = "Add a comment to a post")
	public CommentResponse addComment(@AuthenticationPrincipal UserDetails userDetails,
									  @PathVariable Long postId,
									  @RequestBody CommentRequest request) {
		UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
		return commentService.addComment(userDetailsImpl.getUser(), postId, request.getContent());
	}

	@GetMapping("/posts/{postId}/comments")
	@Operation(summary = "Get comments for a post")
	public List<CommentResponse> getCommentsByPost(@PathVariable Long postId) {
		return commentService.getCommentsByPost(postId);
	}

	@PutMapping("/comments/{commentId}")
	@Operation(summary = "Update a comment")
	public CommentResponse updateComment(@AuthenticationPrincipal UserDetails userDetails,
										 @PathVariable Long commentId,
										 @RequestBody CommentRequest request) {
		UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
		return commentService.updateComment(userDetailsImpl.getUser(), commentId, request.getContent());
	}

	@DeleteMapping("/comments/{commentId}")
	@Operation(summary = "Delete a comment")
	public String deleteComment(@AuthenticationPrincipal UserDetailsImpl userDetails,
									@PathVariable Long commentId) {
		return commentService.deleteComment(userDetails.getUser(), commentId);	}
	@GetMapping("/users/{userId}/comments")
	@Operation(summary = "Get comments by user")
	public List<CommentResponse> getCommentsByUser(@PathVariable Long userId) {
		User user = userService.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("User does not exist"));
		return commentService.getCommentsByUser(user);
	}
}
