<script setup lang="ts">
definePageMeta({
  layout: 'onboarding',
  middleware: ['auth'],
  title: 'Onboarding Interests'
});

const onboardingStore = useOnboardingStore();
onboardingStore.setStep(3);
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="eyebrow">Interests</p>
      <h2 class="page-title mt-2">Select placeholder areas of focus</h2>
      <p class="page-copy mt-3">These controls exist only to demonstrate page structure and future feature grouping.</p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <UiCard>Risk review tools placeholder</UiCard>
      <UiCard>Collections workflow placeholder</UiCard>
      <UiCard>Portfolio monitoring placeholder</UiCard>
      <UiCard>Reporting and invoicing placeholder</UiCard>
    </div>
    <UiButton @click="navigateTo('/onboarding/profile')">Continue to profile</UiButton>
  </div>
</template>
