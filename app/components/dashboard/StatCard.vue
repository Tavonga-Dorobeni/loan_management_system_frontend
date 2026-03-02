<script setup lang="ts">
defineProps<{
  title: string;
  status: string;
}>();
</script>

<template>
  <div class="rounded-[1.2rem] border border-slate-200 bg-white p-4">
    <p class="text-sm font-semibold">{{ title }}</p>
    <p class="mt-2 text-sm text-slate-500">{{ status }}</p>
  </div>
</template>
