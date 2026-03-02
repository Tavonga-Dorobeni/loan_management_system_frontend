<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
  title: 'Register'
});

const { register } = useAuth();
const { goToOnboarding } = useNavigation();

const handleSubmit = async (values: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  await register(values);
  await goToOnboarding();
};
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="eyebrow">New Access</p>
      <h1 class="page-title">Create a placeholder account</h1>
      <p class="page-copy">Use this scaffold to validate registration UX before wiring real backend behavior.</p>
    </div>
    <AuthRegistrationForm @submitted="handleSubmit" />
    <p class="text-sm text-slate-500">
      Already have access?
      <NuxtLink to="/auth/login" class="font-semibold text-teal-700">Sign in</NuxtLink>
    </p>
  </div>
</template>
