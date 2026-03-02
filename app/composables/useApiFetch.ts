import type { ApiSuccessResponse } from '~/shared/types/api';

import { AppClientError, parseApiError } from '~/app/utils/errors';

export const useApiFetch = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const apiFetch = async <T>(path: string, options: Parameters<typeof $fetch>[1] = {}) => {
    try {
      const response = await $fetch<ApiSuccessResponse<T>>(path, {
        baseURL: config.public.apiBaseUrl || 'http://localhost:3000',
        ...options,
        headers: {
          ...(options?.headers || {}),
          ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {})
        }
      });

      return response;
    } catch (error) {
      const parsed = parseApiError((error as { data?: unknown })?.data ?? error);
      throw new AppClientError(parsed.error, parsed.statusCode);
    }
  };

  return {
    apiFetch
  };
};
