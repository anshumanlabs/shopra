export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string | null;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  signup: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
}