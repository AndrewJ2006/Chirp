import { apiGet, apiPost } from "./httpClient";

export interface NotifResponse {
	id: number;
	recipientId: number;
	actorId: number | null;
	postId: number | null;
	type: string;
	message: string;
	read: boolean;
	createdAt: string;
}

export const getNotifications = () =>
	apiGet<NotifResponse[]>("/notifications");

export const getUnreadNotifications = () =>
	apiGet<NotifResponse[]>("/notifications/unread");

export const getUnreadCount = () =>
	apiGet<number>("/notifications/unread/count");

export const markAsRead = (id: number) =>
	apiPost<NotifResponse>(`/notifications/${id}/read`);

export const markAllAsRead = () =>
	apiPost<string>("/notifications/read-all");
