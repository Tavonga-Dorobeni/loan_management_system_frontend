import type { AppUser } from './user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AppUser;
}
