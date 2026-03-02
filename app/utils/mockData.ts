import type { AppNotification } from '~/shared/types/app';
import type { CatalogueItem } from '~/shared/types/catalogue';
import type { AppUser } from '~/shared/types/user';

export const mockUser: AppUser = {
  id: 'user-001',
  firstName: 'Avery',
  lastName: 'Jordan',
  email: 'avery.jordan@example.com',
  role: 'loan_officer',
  onboardingComplete: false
};

export const mockNotifications: AppNotification[] = [
  {
    id: 'notice-1',
    title: 'Placeholder workflow review pending',
    tone: 'info'
  },
  {
    id: 'notice-2',
    title: 'Draft invoice queue prepared for implementation',
    tone: 'warning'
  }
];

export const mockCatalogueItems: CatalogueItem[] = [
  {
    id: 'catalogue-1',
    title: 'Starter Product Configuration',
    category: 'Templates',
    status: 'active',
    summary: 'Placeholder catalogue entry for later business setup.'
  },
  {
    id: 'catalogue-2',
    title: 'Operations Playbook',
    category: 'Resources',
    status: 'draft',
    summary: 'Scaffold item used to validate listing and detail pages.'
  }
];
