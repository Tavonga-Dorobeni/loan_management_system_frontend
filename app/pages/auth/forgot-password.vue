<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
  title: 'Forgot Password'
});

const email = ref('');
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="eyebrow">Recovery</p>
      <h1 class="page-title">Password reset placeholder</h1>
      <p class="page-copy">No reset workflow is implemented yet. This page exists to scaffold the flow and route structure.</p>
    </div>
    <form class="space-y-4">
      <UiInput v-model="email" name="recoveryEmail" label="Email" type="email" placeholder="you@example.com" />
      <UiButton block>Request reset link</UiButton>
    </form>
    <p class="text-sm text-slate-500">TODO: Connect this page to a real password recovery process.</p>
  </div>
</template>
