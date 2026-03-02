<script setup lang="ts">
import { BookOpen, Gauge, LayoutList, ReceiptText, UserRound } from 'lucide-vue-next';

const appStore = useAppStore();

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: Gauge },
  { label: 'Analytics', to: '/dashboard/analytics', icon: LayoutList },
  { label: 'Resources', to: '/dashboard/resources', icon: BookOpen },
  { label: 'Catalogue', to: '/catalogue', icon: LayoutList },
  { label: 'Invoices', to: '/invoices', icon: ReceiptText },
  { label: 'Profile', to: '/dashboard/profile', icon: UserRound }
];
</script>

<template>
  <aside
    class="surface-dark rounded-[1.6rem] p-4 transition lg:block"
    :class="appStore.sidebarOpen ? 'block' : 'hidden lg:block'"
  >
    <div class="space-y-2">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        active-class="bg-white/12 text-white"
      >
        <component :is="item.icon" class="h-4 w-4" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </aside>
</template>
