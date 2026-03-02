import type { AppUser } from '~/shared/types/user';

const TOKEN_KEY = 'frontend_skeleton_token';
const USER_KEY = 'frontend_skeleton_user';

export const storage = {
  getToken(): string | null {
    if (!import.meta.client) {
      return null;
    }

    return window.localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    if (import.meta.client) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  },
  clearToken(): void {
    if (import.meta.client) {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  },
  getCurrentUser(): AppUser | null {
    if (!import.meta.client) {
      return null;
    }

    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  },
  setCurrentUser(user: AppUser): void {
    if (import.meta.client) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  clearSession(): void {
    if (!import.meta.client) {
      return;
    }

    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
};
