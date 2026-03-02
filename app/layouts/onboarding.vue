<template>
  <div class="app-shell">
    <div class="app-container py-10">
      <div class="mx-auto max-w-4xl space-y-6">
        <OnboardingStepHeader />
        <OnboardingProgressSteps />
        <div class="surface-card rounded-[2rem] p-6 sm:p-8">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
