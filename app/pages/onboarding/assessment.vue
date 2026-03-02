<script setup lang="ts">
definePageMeta({
  layout: 'onboarding',
  middleware: ['auth'],
  title: 'Onboarding Assessment'
});

const onboardingStore = useOnboardingStore();
onboardingStore.setStep(2);
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="eyebrow">Assessment</p>
      <h2 class="page-title mt-2">Capture placeholder setup inputs</h2>
      <p class="page-copy mt-3">This is a structural placeholder only. No domain rules are implemented.</p>
    </div>
    <OnboardingAssessmentForm />
    <UiButton @click="navigateTo('/onboarding/interests')">Continue to interests</UiButton>
  </div>
</template>
