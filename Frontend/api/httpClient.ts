export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiError extends Error {
	status?: number;
	details?: unknown;
}

const DEFAULT_BASE_URL = "http://localhost:8080";

const getBaseUrl = () => {
	return (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
		DEFAULT_BASE_URL;
};

export const TOKEN_STORAGE_KEY = "chirp_token";

export const setAuthToken = (token: string | null) => {
	if (token) {
		localStorage.setItem(TOKEN_STORAGE_KEY, token);
	} else {
		localStorage.removeItem(TOKEN_STORAGE_KEY);
	}
};

export const getAuthToken = () => {
	return localStorage.getItem(TOKEN_STORAGE_KEY);
};

const buildHeaders = (withAuth: boolean, extra?: HeadersInit): HeadersInit => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (withAuth) {
		const token = getAuthToken();
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
	}

	return {
		...headers,
		...extra,
	};
};

export async function request<T>(
	path: string,
	options: {
		method?: HttpMethod;
		body?: unknown;
		withAuth?: boolean;
		headers?: HeadersInit;
	} = {}
): Promise<T> {
	const { method = "GET", body, withAuth = true, headers } = options;
	const response = await fetch(`${getBaseUrl()}${path}`, {
		method,
		headers: buildHeaders(withAuth, headers),
		body: body ? JSON.stringify(body) : undefined,
	});

	const contentType = response.headers.get("content-type") || "";
	const isJson = contentType.includes("application/json");
	const payload = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		const error: ApiError = new Error(
			typeof payload === "string" && payload.length > 0
				? payload
				: (payload as { message?: string })?.message || "Request failed"
		);
		error.status = response.status;
		error.details = payload;
		throw error;
	}

	return payload as T;
}

export const apiGet = <T>(path: string, withAuth = true) =>
	request<T>(path, { method: "GET", withAuth });

export const apiPost = <T>(path: string, body?: unknown, withAuth = true) =>
	request<T>(path, { method: "POST", body, withAuth });

export const apiPut = <T>(path: string, body?: unknown, withAuth = true) =>
	request<T>(path, { method: "PUT", body, withAuth });

export const apiDelete = <T>(path: string, withAuth = true) =>
	request<T>(path, { method: "DELETE", withAuth });
