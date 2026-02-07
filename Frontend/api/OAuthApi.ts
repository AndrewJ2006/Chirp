import { apiPost } from "./httpClient";

export interface OAuthLoginRequest {
  idToken: string;
}

export const loginWithGoogle = (idToken: string) =>
  apiPost<{ message: string; token: string }>("/oauth/google", { idToken }, false);

export const loginWithApple = (idToken: string) =>
  apiPost<{ message: string; token: string }>("/oauth/apple", { idToken }, false);
