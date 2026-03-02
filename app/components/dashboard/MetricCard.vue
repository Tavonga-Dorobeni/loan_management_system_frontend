<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  note: string;
}>();
</script>

<template>
  <UiCard>
    <p class="text-sm font-semibold text-slate-500">{{ label }}</p>
    <p class="mt-3 text-3xl font-extrabold text-slate-900">{{ value }}</p>
    <p class="mt-2 text-sm text-slate-500">{{ note }}</p>
  </UiCard>
</template>
