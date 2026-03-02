export interface AppNotification {
  id: string;
  title: string;
  tone: 'info' | 'success' | 'warning';
}

export interface AppShellState {
  sidebarOpen: boolean;
  pageLoading: boolean;
  notifications: AppNotification[];
}

export interface NavigationItem {
  label: string;
  to: string;
  icon?: string;
}
