import type { LoginPayload, RegisterPayload } from '~/shared/types/auth';

export const useAuth = () => {
  const authStore = useAuthStore();

  const login = async (payload: LoginPayload) => authStore.login(payload);
  const register = async (payload: RegisterPayload) => authStore.register(payload);
  const logout = async () => authStore.logout();
  const fetchCurrentUser = async () => authStore.user;

  return {
    authStore,
    login,
    register,
    logout,
    fetchCurrentUser
  };
};
