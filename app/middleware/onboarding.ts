export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();
  authStore.hydrate();

  if (authStore.isAuthenticated && authStore.user && !authStore.user.onboardingComplete) {
    // TODO: Replace this placeholder redirect with real onboarding progression rules.
    return navigateTo('/onboarding/welcome');
  }
});
