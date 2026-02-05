import { apiDelete, apiGet, apiPost, apiPut } from "./httpClient";

export interface CommentRequest {
	content: string;
}

export interface CommentResponse {
	id: number;
	postId: number;
	authorId: number;
	authorUsername: string;
	authorProfilePictureUrl?: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export const addComment = (postId: number, payload: CommentRequest) =>
	apiPost<CommentResponse>(`/comments/${postId}`, payload);

export const getCommentsByPost = (postId: number) =>
	apiGet<CommentResponse[]>(`/posts/${postId}/comments`);

export const updateComment = (commentId: number, payload: CommentRequest) =>
	apiPut<CommentResponse>(`/comments/${commentId}`, payload);

export const deleteComment = (commentId: number) =>
	apiDelete<string>(`/comments/${commentId}`);

export const getCommentsByUser = (userId: number) =>
	apiGet<CommentResponse[]>(`/users/${userId}/comments`);
