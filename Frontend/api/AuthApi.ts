import { apiGet, apiPost, setAuthToken } from "./httpClient";

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface LoginRequest {
	username: string;
	email?: string;
	password: string;
}

export interface AuthResponse {
	message: string;
	token?: string;
	userId?: number;
}

export interface ProfileResponse {
	id: number;
	username: string;
	email: string;
	createdAt?: string;
}

export const registerUser = (payload: RegisterRequest) =>
	apiPost<AuthResponse>("/users/register", payload, false);

export const loginUser = async (payload: LoginRequest) => {
	const response = await apiPost<AuthResponse>("/users/login", payload, false);
	if (response.token) {
		setAuthToken(response.token);
	}
	return response;
};

export const getUserProfile = (id: number) =>
	apiGet<ProfileResponse>(`/users/profile/${id}`);
