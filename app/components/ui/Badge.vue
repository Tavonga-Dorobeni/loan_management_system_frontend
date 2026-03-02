<script setup lang="ts">
import { cn } from '~/app/lib/utils';

const props = withDefaults(
  defineProps<{
    tone?: 'neutral' | 'success' | 'warning';
  }>(),
  {
    tone: 'neutral'
  }
);
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]',
        props.tone === 'neutral' && 'bg-slate-100 text-slate-700',
        props.tone === 'success' && 'bg-teal-100 text-teal-800',
        props.tone === 'warning' && 'bg-orange-100 text-orange-800'
      )
    "
  >
    <slot />
  </span>
</template>
