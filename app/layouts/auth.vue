<template>
  <div class="app-shell flex items-center justify-center px-4 py-10">
    <div class="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section class="surface-dark hidden rounded-[2rem] p-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p class="eyebrow text-orange-200">Secure Access</p>
          <h1 class="mt-4 text-4xl font-extrabold tracking-tight">Business-ready account scaffolding for the application shell.</h1>
        </div>
        <div class="space-y-3 text-sm text-slate-200/80">
          <p>Structured auth pages, mock-safe validation, and reusable form primitives are already wired.</p>
          <p>TODO markers indicate where API integration and real policies should be layered in later.</p>
        </div>
      </section>
      <section class="surface-card rounded-[2rem] p-6 sm:p-8">
        <slot />
      </section>
    </div>
  </div>
</template>
