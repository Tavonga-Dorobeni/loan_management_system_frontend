<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  title: 'Invoices'
});
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="eyebrow">Invoices</p>
      <h1 class="page-title mt-2">Invoice management placeholder</h1>
      <p class="page-copy mt-3">Real billing rules, line items, and payment flows are intentionally not implemented.</p>
    </div>
    <div class="grid gap-4 lg:grid-cols-3">
      <UiCard>Draft invoice list placeholder</UiCard>
      <UiCard>Invoice filters placeholder</UiCard>
      <UiCard>Summary totals placeholder</UiCard>
    </div>
  </div>
</template>
