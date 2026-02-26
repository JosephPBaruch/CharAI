import {
  type RegisterRequest,
  type LoginRequest,
  type AuthResponse,
  type UserResponse,
  type LogoutResponse,
} from "../types/auth";

const AUTH_URL = getApiUrl() + "/auth";
const TOKEN_KEY = "authToken";

function getApiUrl() {
  const env = import.meta.env;

  if (env.VITE_BACKEND_URL) {
    return `${env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;
  }

  return "/api";
}

function storeToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn("Unable to store auth token", e);
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function handleResponse(response: Response) {
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw data || { detail: response.statusText };
  }

  return data;
}

export const register = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await handleResponse(response);

  if (result && result.token) {
    storeToken(result.token);
  }

  return result as AuthResponse;
};

export const login = async (
  credentials: LoginRequest,
): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const result = await handleResponse(response);

  if (result && result.token) {
    storeToken(result.token);
  }

  return result as AuthResponse;
};

export const getUser = async (): Promise<UserResponse> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch(`${AUTH_URL}/user/`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const result = await handleResponse(response);
  return result as UserResponse;
};

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    const response = await fetch(`${AUTH_URL}/logout/`, {
      method: "POST",
      headers,
      credentials: "include",
    });

    const result = await handleResponse(response);
    return result as LogoutResponse;
  } finally {
    clearToken();
  }
};

export const getAuthToken = getToken;
export const removeAuthToken = clearToken;
export const getApiUrlForApi = getApiUrl;
