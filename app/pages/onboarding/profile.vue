<script setup lang="ts">
import { useForm } from 'vee-validate';

import { onboardingProfileSchema, userRoles } from '~/app/utils/validation';

definePageMeta({
  layout: 'onboarding',
  middleware: ['auth'],
  title: 'Onboarding Profile'
});

const onboardingStore = useOnboardingStore();
const userStore = useUserStore();
const authStore = useAuthStore();

onboardingStore.setStep(4);

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: onboardingProfileSchema,
  initialValues: {
    firstName: userStore.profile.firstName,
    lastName: userStore.profile.lastName,
    role: userStore.profile.role
  }
});

const [firstName] = defineField('firstName');
const [lastName] = defineField('lastName');
const [role] = defineField('role');

const roleOptions = userRoles.map((item) => ({
  label: item.replace(/_/g, ' '),
  value: item
}));

const onSubmit = handleSubmit(async (values) => {
  await userStore.updateProfile(values);
  onboardingStore.completeStep(4);

  if (authStore.user) {
    authStore.user.onboardingComplete = true;
  }

  await navigateTo('/dashboard');
});
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div>
      <p class="eyebrow">Profile</p>
      <h2 class="page-title mt-2">Finish the placeholder setup</h2>
      <p class="page-copy mt-3">This step stores mock-safe profile data locally so navigation flows can be exercised.</p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <UiInput v-model="firstName" name="firstName" label="First name" :error="errors.firstName" />
      <UiInput v-model="lastName" name="lastName" label="Last name" :error="errors.lastName" />
    </div>
    <UiSelect v-model="role" name="role" label="Role" :options="roleOptions" :error="errors.role" />
    <UiButton type="submit">Enter dashboard</UiButton>
  </form>
</template>
