import type { ProfilePayload } from '~/shared/types/user';

import { mockUser } from '~/app/utils/mockData';
import { storage } from '~/app/utils/storage';

export const useUserStore = defineStore('user', () => {
  const profile = ref(storage.getCurrentUser() ?? mockUser);
  const loading = ref(false);

  const loadProfile = async () => {
    loading.value = true;

    try {
      // TODO: Replace placeholder profile fetch with API integration.
      profile.value = storage.getCurrentUser() ?? mockUser;
      return profile.value;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (payload: ProfilePayload) => {
    loading.value = true;

    try {
      // TODO: Replace placeholder profile mutation with persisted behavior.
      profile.value = {
        ...profile.value,
        ...payload
      };
      storage.setCurrentUser(profile.value);
      return profile.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    profile,
    loading,
    loadProfile,
    updateProfile
  };
});
