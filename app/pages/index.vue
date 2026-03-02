<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Redirecting'
});

const authStore = useAuthStore();
authStore.hydrate();

await navigateTo(authStore.isAuthenticated ? '/dashboard' : '/auth/login');
</script>

<template>
  <div class="app-container flex min-h-[60vh] items-center justify-center">
    <UiCard>
      <p class="text-sm text-slate-600">Redirecting to the correct application area...</p>
    </UiCard>
  </div>
</template>
