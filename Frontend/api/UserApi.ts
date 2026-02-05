import { apiGet, apiPost, apiDelete } from "./httpClient";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
}

export interface Follower {
  id: number;
  username: string;
}

export interface Following {
  id: number;
  username: string;
}

export const getUserProfile = (userId: number) =>
  apiGet<UserProfile>(`/users/profile/${userId}`);

export const getCurrentUser = () =>
  apiGet<UserProfile>(`/users/me`);

export const getFollowers = (userId: number) =>
  apiGet<Follower[]>(`/relationships/followers/${userId}`);

export const getFollowing = (userId: number) =>
  apiGet<Following[]>(`/relationships/following/${userId}`);

export const isFollowing = (followingId: number) =>
  apiGet<boolean>(`/relationships/is-following?followingId=${followingId}`);

export const followUser = (followingId: number) =>
  apiPost<Follower>(`/relationships/follow?followingId=${followingId}`);

export const unfollowUser = (followingId: number) =>
  apiDelete<void>(`/relationships/unfollow?followingId=${followingId}`);

export const searchUsers = (query: string) =>
  apiGet<UserProfile[]>(`/users/search?query=${query}`);
