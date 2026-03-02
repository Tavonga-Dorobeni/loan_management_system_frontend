import type { CatalogueItem } from '~/shared/types/catalogue';

import { mockCatalogueItems } from '~/app/utils/mockData';

export const useCatalogueStore = defineStore('catalogue', () => {
  const items = ref<CatalogueItem[]>([]);
  const selectedItem = ref<CatalogueItem | null>(null);
  const loading = ref(false);

  const fetchItems = async () => {
    loading.value = true;

    try {
      // TODO: Replace placeholder item list with API data.
      items.value = [...mockCatalogueItems];
      return items.value;
    } finally {
      loading.value = false;
    }
  };

  const fetchItem = async (id: string) => {
    if (!items.value.length) {
      await fetchItems();
    }

    selectedItem.value = items.value.find((item) => item.id === id) ?? null;
    return selectedItem.value;
  };

  return {
    items,
    selectedItem,
    loading,
    fetchItems,
    fetchItem
  };
});
