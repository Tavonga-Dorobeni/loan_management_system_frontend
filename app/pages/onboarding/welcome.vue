<script setup lang="ts">
definePageMeta({
  layout: 'onboarding',
  middleware: ['auth'],
  title: 'Onboarding Welcome'
});

const onboardingStore = useOnboardingStore();
onboardingStore.setStep(1);
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="eyebrow">Welcome</p>
      <h2 class="page-title mt-2">Prepare the workspace before feature implementation begins.</h2>
      <p class="page-copy mt-3 max-w-2xl">This section will later guide account setup, preferences, and requirements collection.</p>
    </div>
    <UiCard>
      <div class="space-y-4">
        <p class="text-sm text-slate-600">Placeholder onboarding overview and expectations panel.</p>
        <UiButton @click="navigateTo('/onboarding/assessment')">Continue to assessment</UiButton>
      </div>
    </UiCard>
  </div>
</template>
