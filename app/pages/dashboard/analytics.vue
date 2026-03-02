<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  title: 'Analytics'
});
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="eyebrow">Analytics</p>
      <h1 class="page-title mt-2">Reporting and trend views placeholder</h1>
      <p class="page-copy mt-3">Charts and business-specific calculations are intentionally omitted from this scaffold.</p>
    </div>
    <div class="grid gap-5 lg:grid-cols-2">
      <UiCard>Trend chart region placeholder</UiCard>
      <UiCard>Comparative metrics region placeholder</UiCard>
      <UiCard>Segmentation panel placeholder</UiCard>
      <UiCard>Export controls placeholder</UiCard>
    </div>
  </div>
</template>
