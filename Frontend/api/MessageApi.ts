import { apiGet, apiPost } from "./httpClient";

export interface MessageResponse {
  id: number;
  senderId: number;
  senderUsername: string;
  recipientId: number;
  recipientUsername: string;
  content: string;
  createdAt: string;
}

export interface MessageRequest {
  content: string;
}

export interface ConversationUser {
  id: number;
  username: string;
  email: string;
}

export const getRecentConversations = () =>
  apiGet<ConversationUser[]>(`/messages/recent`);

export const getConversation = (userId: number) =>
  apiGet<MessageResponse[]>(`/messages/with/${userId}`);

export const sendMessage = (userId: number, payload: MessageRequest) =>
  apiPost<MessageResponse>(`/messages/with/${userId}`, payload);
