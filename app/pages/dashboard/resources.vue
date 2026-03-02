<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  title: 'Resources'
});
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="eyebrow">Resources</p>
      <h1 class="page-title mt-2">Shared resources placeholder</h1>
      <p class="page-copy mt-3">Use this route for future guides, templates, policy documents, and knowledge base content.</p>
    </div>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UiCard>Policy template placeholder</UiCard>
      <UiCard>Checklist placeholder</UiCard>
      <UiCard>Knowledge article placeholder</UiCard>
    </div>
  </div>
</template>
