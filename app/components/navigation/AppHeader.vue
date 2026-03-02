<script setup lang="ts">
import { Bell, PanelLeftClose, Search } from 'lucide-vue-next';

const appStore = useAppStore();
const authStore = useAuthStore();
</script>

<template>
  <header class="surface-card flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] px-5 py-4">
    <div class="flex items-center gap-3">
      <UiButton variant="ghost" @click="appStore.toggleSidebar()">
        <PanelLeftClose class="h-4 w-4" />
      </UiButton>
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Operations Workspace</p>
        <p class="text-sm text-slate-500">Scaffolded Nuxt application shell</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 md:flex">
        <Search class="h-4 w-4" />
        <span>Placeholder search</span>
      </div>
      <UiButton variant="ghost">
        <Bell class="h-4 w-4" />
      </UiButton>
      <div class="rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900">
        {{ authStore.user?.firstName || 'Guest' }}
      </div>
    </div>
  </header>
</template>
