import { type RegisterRequest, type AuthResponse } from '../types/auth';

const DEFAULT_API = 'http://127.0.0.1:8000/api/auth';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API).replace(/\/$/, '');

const TOKEN_KEY = 'authToken';

function storeToken(token: string) {
	try {
		localStorage.setItem(TOKEN_KEY, token);
	} catch (e) {
		// localStorage may be unavailable in some environments
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
	// Try to parse JSON, otherwise return text
	let data: any = null;
	if (text) {
		try {
			data = JSON.parse(text);
		} catch (e) {
			data = text;
		}
	}

	if (!response.ok) {
		// Normalize error object
		throw data || { detail: response.statusText };
	}

	return data;
}

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
	const response = await fetch(`${API_URL}/register/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include', // ensure session cookie is set by the backend
		body: JSON.stringify(data),
	});

	const result = await handleResponse(response);

	if (result && result.token) {
		storeToken(result.token);
	}

	return result as AuthResponse;
};

export const login = async (username: string, password: string): Promise<AuthResponse> => {
	const response = await fetch(`${API_URL}/login/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include', // backend also creates a session cookie
		body: JSON.stringify({ username, password }),
	});

	const result = await handleResponse(response);

	if (result && result.token) {
		storeToken(result.token);
	}

	return result as AuthResponse;
};

export const getUser = async () => {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	const token = getToken();
	if (token) headers['Authorization'] = `Token ${token}`;

	const response = await fetch(`${API_URL}/user/`, {
		method: 'GET',
		headers,
		credentials: 'include', // allow session auth via cookies
	});

	const result = await handleResponse(response);
	return result;
};

export const logout = async () => {
	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	const token = getToken();
	if (token) headers['Authorization'] = `Token ${token}`;

	const response = await fetch(`${API_URL}/logout/`, {
		method: 'POST',
		headers,
		credentials: 'include', // include session cookie so server can logout
	});

	const result = await handleResponse(response);
	// Remove token locally regardless of server response
	clearToken();
	return result;
};

export const getAuthToken = getToken;
export const removeAuthToken = clearToken;

// Notes:
// - This file uses Token-based auth returned by your Django endpoints.
// - For requests to protected API endpoints, include the header: `Authorization: Token <token>`
// - If you prefer cookie / session auth instead, the backend must set session cookies
//   and you should use fetch(..., { credentials: 'include' }) and configure CSRF handling on Django.
// - Make sure CORS is configured on the backend to allow requests from the frontend origin
//   (and allow Authorization header). For example, using django-cors-headers:
//     CORS_ALLOWED_ORIGINS = [ 'http://localhost:5173' ]
//     CORS_ALLOW_HEADERS = list(default_headers) + ['Authorization']
// - Consider storing tokens in httpOnly cookies for better XSS protection if your backend supports it.
