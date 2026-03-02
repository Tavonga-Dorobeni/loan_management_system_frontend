<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  title: 'Catalogue'
});

const catalogueStore = useCatalogueStore();
await catalogueStore.fetchItems();
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="eyebrow">Catalogue</p>
      <h1 class="page-title mt-2">Reusable items and resource listings placeholder</h1>
      <p class="page-copy mt-3">This listing is mock-backed and safe for early UI implementation.</p>
    </div>
    <div class="grid gap-5 lg:grid-cols-2">
      <CatalogueItemCard v-for="item in catalogueStore.items" :key="item.id" :item="item" />
    </div>
  </div>
</template>
