export default defineNuxtPlugin(() => {
  const route = useRoute();

  watch(
    () => route.fullPath,
    () => {
      const title = route.meta.title ? String(route.meta.title) : 'Operations Workspace';
      useHead({
        title
      });
    },
    {
      immediate: true
    }
  );
});
