<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  title: 'Catalogue Detail'
});

const route = useRoute();
const catalogueStore = useCatalogueStore();
await catalogueStore.fetchItem(String(route.params.id));
</script>

<template>
  <div class="space-y-5">
    <div>
      <p class="eyebrow">Catalogue Detail</p>
      <h1 class="page-title mt-2">Item detail placeholder</h1>
      <p class="page-copy mt-3">A representative detail page for future item management and action panels.</p>
    </div>
    <CatalogueItemDetailPanel :item="catalogueStore.selectedItem" />
  </div>
</template>
