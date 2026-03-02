import type { AppNotification } from '~/shared/types/app';

import { mockNotifications } from '~/app/utils/mockData';

export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(true);
  const pageLoading = ref(false);
  const notifications = ref<AppNotification[]>([...mockNotifications]);

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const setPageLoading = (value: boolean) => {
    pageLoading.value = value;
  };

  const pushNotification = (notification: AppNotification) => {
    notifications.value = [notification, ...notifications.value];
  };

  const dismissNotification = (id: string) => {
    notifications.value = notifications.value.filter((item) => item.id !== id);
  };

  return {
    sidebarOpen,
    pageLoading,
    notifications,
    toggleSidebar,
    setPageLoading,
    pushNotification,
    dismissNotification
  };
});
