<template>
  <div class="app-shell">
    <div class="app-container py-5">
      <NavigationAppHeader />
      <div class="mt-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <NavigationAppSidebar />
        <main class="space-y-5">
          <NavigationAppBreadcrumbs />
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
