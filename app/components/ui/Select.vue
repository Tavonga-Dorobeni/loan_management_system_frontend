<script setup lang="ts">
defineProps<{
  label: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  modelValue?: string;
  error?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <label class="block space-y-2">
    <span class="text-sm font-semibold text-slate-700">{{ label }}</span>
    <select
      :name="name"
      :value="modelValue"
      class="w-full rounded-[0.9rem] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Select an option</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" class="text-xs font-medium text-rose-600">{{ error }}</span>
  </label>
</template>
