export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}
