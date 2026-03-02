<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  title: 'Profile'
});

const userStore = useUserStore();
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="eyebrow">Profile</p>
      <h1 class="page-title mt-2">Workspace profile placeholder</h1>
      <p class="page-copy mt-3">This page reads from the scaffolded Pinia store and local persistence helpers.</p>
    </div>
    <UiCard>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Name</p>
          <p class="mt-2 text-lg font-semibold">{{ userStore.profile.firstName }} {{ userStore.profile.lastName }}</p>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Role</p>
          <p class="mt-2 text-lg font-semibold">{{ userStore.profile.role }}</p>
        </div>
      </div>
    </UiCard>
  </div>
</template>
