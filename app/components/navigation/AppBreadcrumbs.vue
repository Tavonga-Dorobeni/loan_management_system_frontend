<script setup lang="ts">
import { formatLabel } from '~/app/lib/utils';

const route = useRoute();

const crumbs = computed(() =>
  route.path
    .split('/')
    .filter(Boolean)
    .map((segment, index, segments) => ({
      label: formatLabel(segment),
      to: `/${segments.slice(0, index + 1).join('/')}`
    }))
);
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 text-sm text-slate-500">
    <NuxtLink to="/dashboard" class="font-semibold text-slate-700">Home</NuxtLink>
    <template v-for="crumb in crumbs" :key="crumb.to">
      <span>/</span>
      <NuxtLink :to="crumb.to" class="hover:text-slate-700">{{ crumb.label }}</NuxtLink>
    </template>
  </div>
</template>
