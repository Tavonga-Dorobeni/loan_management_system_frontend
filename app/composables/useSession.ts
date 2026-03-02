import { storage } from '~/app/utils/storage';

export const useSession = () => {
  const authStore = useAuthStore();

  const restore = () => {
    authStore.hydrate();
  };

  const getToken = () => storage.getToken();

  const clear = () => {
    storage.clearSession();
    authStore.logout();
  };

  return {
    restore,
    getToken,
    clear
  };
};
