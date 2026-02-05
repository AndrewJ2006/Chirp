import { apiGet, apiPost, apiDelete } from "./httpClient";
import { PostResponse } from "./PostApi";

export const getBookmarks = () =>
  apiGet<PostResponse[]>("/bookmarks");

export const addBookmark = (postId: number) =>
  apiPost<void>(`/bookmarks/${postId}`);

export const removeBookmark = (postId: number) =>
  apiDelete<void>(`/bookmarks/${postId}`);

export const isBookmarked = (postId: number) =>
  apiGet<boolean>(`/bookmarks/check/${postId}`);
