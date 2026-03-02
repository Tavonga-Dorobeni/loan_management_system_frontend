export const useAppShell = () => {
  const appStore = useAppStore();

  return {
    sidebarOpen: computed(() => appStore.sidebarOpen),
    pageLoading: computed(() => appStore.pageLoading),
    notifications: computed(() => appStore.notifications),
    toggleSidebar: appStore.toggleSidebar,
    setPageLoading: appStore.setPageLoading
  };
};
