<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
  title: 'Login'
});

const { login } = useAuth();
const { goToDashboard } = useNavigation();
const appStore = useAppStore();

const handleSubmit = async (values: { email: string; password: string }) => {
  await login(values);
  appStore.pushNotification({
    id: `login-${Date.now()}`,
    title: 'Placeholder sign-in completed',
    tone: 'success'
  });
  await goToDashboard();
};
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="eyebrow">Authentication</p>
      <h1 class="page-title">Sign in to the workspace</h1>
      <p class="page-copy">This uses local placeholder state only. Replace it later with real session flows.</p>
    </div>
    <AuthLoginForm @submitted="handleSubmit" />
    <div class="flex items-center justify-between text-sm text-slate-500">
      <NuxtLink to="/auth/forgot-password" class="font-semibold text-teal-700">Forgot password?</NuxtLink>
      <NuxtLink to="/auth/register" class="font-semibold text-slate-700">Create account</NuxtLink>
    </div>
  </div>
</template>
