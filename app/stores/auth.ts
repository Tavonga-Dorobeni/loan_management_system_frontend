import type { AuthResponse, LoginPayload, RegisterPayload } from '~/shared/types/auth';

import { mockUser } from '~/app/utils/mockData';
import { storage } from '~/app/utils/storage';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<AuthResponse['user'] | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value));

  const hydrate = () => {
    token.value = storage.getToken();
    user.value = storage.getCurrentUser();
  };

  const login = async (payload: LoginPayload) => {
    loading.value = true;

    try {
      // TODO: Replace local auth placeholder with a backend-backed session flow.
      const response: AuthResponse = {
        accessToken: `mock-token:${payload.email}`,
        user: {
          ...mockUser,
          email: payload.email
        }
      };

      token.value = response.accessToken;
      user.value = response.user;
      storage.setToken(response.accessToken);
      storage.setCurrentUser(response.user);

      return response;
    } finally {
      loading.value = false;
    }
  };

  const register = async (payload: RegisterPayload) => {
    loading.value = true;

    try {
      // TODO: Replace placeholder registration with API-backed persistence.
      const response: AuthResponse = {
        accessToken: `mock-token:${payload.email}`,
        user: {
          ...mockUser,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email
        }
      };

      token.value = response.accessToken;
      user.value = response.user;
      storage.setToken(response.accessToken);
      storage.setCurrentUser(response.user);

      return response;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    token.value = null;
    user.value = null;
    storage.clearSession();
  };

  return {
    token,
    user,
    loading,
    isAuthenticated,
    hydrate,
    login,
    register,
    logout
  };
});
