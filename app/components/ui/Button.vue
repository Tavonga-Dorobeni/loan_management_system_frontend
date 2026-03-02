<script setup lang="ts">
import { cn } from '~/app/lib/utils';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost';
    type?: 'button' | 'submit' | 'reset';
    block?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    type: 'button',
    block: false,
    disabled: false
  }
);
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="
      cn(
        'inline-flex items-center justify-center gap-2 rounded-[0.9rem] px-4 py-3 text-sm font-semibold transition duration-200',
        props.block && 'w-full',
        props.variant === 'primary' && 'bg-teal-700 text-white shadow-lg shadow-teal-900/15 hover:bg-teal-800',
        props.variant === 'secondary' && 'bg-orange-100 text-orange-900 hover:bg-orange-200',
        props.variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100',
        props.disabled && 'cursor-not-allowed opacity-50'
      )
    "
  >
    <slot />
  </button>
</template>
