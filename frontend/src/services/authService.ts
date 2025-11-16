import { type RegisterRequest, type LoginRequest, type AuthResponse, type UserResponse, type LogoutResponse } from '../types/auth';

const DEFAULT_API = 'http://127.0.0.1:8000/api/auth';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, '');

const TOKEN_KEY = 'authToken';

function storeToken(token: string) {
	try {
		localStorage.setItem(TOKEN_KEY, token);
	} catch (e) {
		console.warn('Unable to store auth token', e);
	}
}

function getToken(): string | null {
	try {
		return localStorage.getItem(TOKEN_KEY);
	} catch (e) {
		return null;
	}
}

function clearToken() {
	try {
		localStorage.removeItem(TOKEN_KEY);
	} catch (e) {
		// ignore
	}
}

async function handleResponse(response: Response) {
	const text = await response.text();
	let data: any = null;
	if (text) {
		try {
			data = JSON.parse(text);
		} catch (e) {
			data = text;
		}
	}

	if (!response.ok) {
		throw data || { detail: response.statusText };
	}

	return data;
}

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
	// Prevent already-authenticated users from registering
	if (getToken()) {
		throw { detail: 'You are already logged in' };
	}

	const response = await fetch(`${API_URL}/register/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(data),
	});

	const result = await handleResponse(response);

	if (result && result.token) {
		storeToken(result.token);
	}

	return result as AuthResponse;
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
	// Prevent already-authenticated users from logging in
	if (getToken()) {
		throw { detail: 'You are already logged in' };
	}

	const response = await fetch(`${API_URL}/login/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});

	const result = await handleResponse(response);

	if (result && result.token) {
		storeToken(result.token);
	}

	return result as AuthResponse;
};

export const getUser = async (): Promise<UserResponse> => {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	const token = getToken();
	if (token) {
		headers['Authorization'] = `Token ${token}`;
	}

	const response = await fetch(`${API_URL}/user/`, {
		method: 'GET',
		headers,
		credentials: 'include',
	});

	const result = await handleResponse(response);
	return result as UserResponse;
};

export const logout = async (): Promise<LogoutResponse> => {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	const token = getToken();
	if (token) {
		headers['Authorization'] = `Token ${token}`;
	}

	const response = await fetch(`${API_URL}/logout/`, {
		method: 'POST',
		headers,
		credentials: 'include',
	});

	const result = await handleResponse(response);
	clearToken();
	return result as LogoutResponse;
};

export const getAuthToken = getToken;
export const removeAuthToken = clearToken;

// Notes:
// - Token-based authentication: Each user gets a unique token on register/login
// - Token stored in localStorage and included in Authorization header for API requests
// - Session cookies set by backend for session-based authentication (credentials: 'include')
// - Passwords hashed by Django using PBKDF2
// - Field-specific validation errors from Django are included in error responses
// - Ensure CORS is configured on backend to allow requests from frontend origin
// - CORS_ALLOW_CREDENTIALS = True allows credentials/cookies to be sent