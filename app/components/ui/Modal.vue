<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
    <div class="surface-card w-full max-w-xl rounded-[1.5rem] p-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">{{ title }}</h3>
        <UiButton variant="ghost" @click="$emit('close')">Close</UiButton>
      </div>
      <div class="mt-4">
        <slot />
      </div>
    </div>
  </div>
</template>
