import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import * as authService from "../services/authService";
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if user is already authenticated
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = authService.getAuthToken();
      if (token) {
        const userData = await authService.getUser();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (err: any) {
      console.debug("No active session or token invalid");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.login(credentials);
      if (response && response.user) {
        setUser(response.user);
      }
    } catch (err: any) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.register(data);
      if (response && response.user) {
        setUser(response.user);
      }
    } catch (err: any) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      console.warn("Logout error:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
