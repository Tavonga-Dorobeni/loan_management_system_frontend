<script setup lang="ts">
import type { CatalogueItem } from '~/shared/types/catalogue';

defineProps<{
  item: CatalogueItem | null;
}>();
</script>

<template>
  <UiCard>
    <template v-if="item">
      <p class="eyebrow">Catalogue Detail</p>
      <h2 class="mt-3 text-2xl font-extrabold">{{ item.title }}</h2>
      <p class="mt-3 text-sm text-slate-600">{{ item.summary }}</p>
      <div class="mt-5 flex gap-3">
        <UiBadge tone="neutral">{{ item.category }}</UiBadge>
        <UiBadge :tone="item.status === 'active' ? 'success' : item.status === 'draft' ? 'warning' : 'neutral'">
          {{ item.status }}
        </UiBadge>
      </div>
      <div class="mt-6 rounded-[1rem] bg-slate-50 p-4 text-sm text-slate-600">
        TODO: Add specifications, history, and actions when real catalogue workflows are introduced.
      </div>
    </template>
    <template v-else>
      <p class="text-sm text-slate-600">No item selected.</p>
    </template>
  </UiCard>
</template>
