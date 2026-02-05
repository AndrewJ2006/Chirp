import { apiDelete, apiGet, apiPost, apiPut } from "./httpClient";

export interface PostRequest {
	content: string;
	mediaUrl?: string;
}

export interface PostResponse {
	id: number;
	content: string;
	mediaUrl?: string;
	authorId: number;
	authorUsername: string;
	createdAt: string;
	updatedAt: string;
}

export const createPost = (payload: PostRequest) =>
	apiPost<PostResponse>("/posts", payload);

export const updatePost = (postId: number, payload: PostRequest) =>
	apiPut<PostResponse>(`/posts/${postId}`, payload);

export const deletePost = (postId: number) =>
	apiDelete<string>(`/posts/${postId}`);

export const getPost = (postId: number) =>
	apiGet<PostResponse>(`/posts/${postId}`);

export const getPostsByUser = (userId: number, page = 0, size = 20) =>
	apiGet<PostResponse[]>(`/posts/users/${userId}/posts?page=${page}&size=${size}`);

export const getFeed = (page = 0, size = 10) =>
	apiGet<PostResponse[]>(`/posts/feed?page=${page}&size=${size}`);
