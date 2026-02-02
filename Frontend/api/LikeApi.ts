import { apiDelete, apiGet, apiPost } from "./httpClient";

export interface LikeResponse {
	postId: number;
	userId: number;
	username: string;
	likeCount: number;
	likedByCurrentUser: boolean;
}

export const addLike = (postId: number) =>
	apiPost<LikeResponse>(`/likes/${postId}`);

export const removeLike = (postId: number) =>
	apiDelete<string>(`/likes/${postId}`);

export const getLikesForPost = (postId: number, page = 0, size = 10) =>
	apiGet<LikeResponse[]>(`/likes/post/${postId}?page=${page}&size=${size}`);

export const getLikeCount = (postId: number) =>
	apiGet<number>(`/likes/post/${postId}/count`);

export const getLikeStatus = (postId: number) =>
	apiGet<LikeResponse>(`/likes/post/${postId}/status`);
