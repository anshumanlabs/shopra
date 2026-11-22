import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authService } from "../services/authService";

import type {
  AuthContextType,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "shopora_access_token";
const USER_KEY = "shopora_user";

const SESSION_TOKEN_KEY = "shopora_session_token";
const SESSION_USER_KEY = "shopora_session_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(SESSION_TOKEN_KEY);

    const savedUser =
      localStorage.getItem(USER_KEY) ||
      sessionStorage.getItem(SESSION_USER_KEY);

    if (token && savedUser) {
      try {
        setAccessToken(token);
        setUser(JSON.parse(savedUser) as AuthUser);
      } catch {
        clearSession();
      }
    }

    setLoading(false);
  }, []);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);

    setAccessToken(null);
    setUser(null);
  };

  const saveSession = (
    token: string,
    authenticatedUser: AuthUser,
    rememberMe: boolean
  ) => {
    clearSession();

    const storage = rememberMe ? localStorage : sessionStorage;

    const tokenKey = rememberMe ? TOKEN_KEY : SESSION_TOKEN_KEY;
    const userKey = rememberMe ? USER_KEY : SESSION_USER_KEY;

    storage.setItem(tokenKey, token);
    storage.setItem(userKey, JSON.stringify(authenticatedUser));

    setAccessToken(token);
    setUser(authenticatedUser);
  };

  const login = async (request: LoginRequest) => {
    const response = await authService.login(request);

    if (!response.accessToken || !response.user) {
      throw new Error("Invalid login response from server.");
    }

    saveSession(
      response.accessToken,
      response.user,
      request.rememberMe
    );
  };

  const signup = async (request: RegisterRequest) => {
    const response = await authService.register(request);

    if (!response.accessToken || !response.user) {
      throw new Error(
        "Registration succeeded, but the server did not return an authentication token and user."
      );
    }

    saveSession(response.accessToken, response.user, true);
  };

  const logout = () => {
    // Backend logout/revocation API is not implemented yet.
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: Boolean(accessToken && user),
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}