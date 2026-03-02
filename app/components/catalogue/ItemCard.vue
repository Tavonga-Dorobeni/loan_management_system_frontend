<script setup lang="ts">
import type { CatalogueItem } from '~/shared/types/catalogue';

defineProps<{
  item: CatalogueItem;
}>();
</script>

<template>
  <NuxtLink :to="`/catalogue/${item.id}`" class="block">
    <UiCard>
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-slate-500">{{ item.category }}</p>
          <h3 class="mt-2 text-lg font-bold">{{ item.title }}</h3>
          <p class="mt-2 text-sm text-slate-600">{{ item.summary }}</p>
        </div>
        <UiBadge :tone="item.status === 'active' ? 'success' : item.status === 'draft' ? 'warning' : 'neutral'">
          {{ item.status }}
        </UiBadge>
      </div>
    </UiCard>
  </NuxtLink>
</template>
