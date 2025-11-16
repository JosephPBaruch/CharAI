export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  password2: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthError {
  detail?: string;
  [key: string]: any; // Field-specific errors from Django
}
