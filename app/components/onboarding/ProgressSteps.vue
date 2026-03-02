<script setup lang="ts">
const onboardingStore = useOnboardingStore();

const steps = [
  { index: 1, label: 'Welcome' },
  { index: 2, label: 'Assessment' },
  { index: 3, label: 'Interests' },
  { index: 4, label: 'Profile' }
];
</script>

<template>
  <div class="surface-card grid gap-3 rounded-[1.6rem] p-4 sm:grid-cols-4">
    <div
      v-for="step in steps"
      :key="step.index"
      class="rounded-[1rem] border px-4 py-3"
      :class="
        onboardingStore.currentStep === step.index
          ? 'border-teal-600 bg-teal-50'
          : onboardingStore.completedSteps.includes(step.index)
            ? 'border-orange-200 bg-orange-50'
            : 'border-slate-200 bg-white'
      "
    >
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Step {{ step.index }}</p>
      <p class="mt-2 text-sm font-semibold">{{ step.label }}</p>
    </div>
  </div>
</template>
