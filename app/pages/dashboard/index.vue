<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  title: 'Dashboard'
});
</script>

<template>
  <div class="space-y-5">
    <section class="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <UiCard class="surface-dark rounded-[1.6rem] p-6">
        <p class="eyebrow text-orange-200">Overview</p>
        <h1 class="mt-3 text-3xl font-extrabold text-white">Operational dashboard scaffold</h1>
        <p class="mt-3 max-w-2xl text-sm text-white/70">
          This shell is ready for real KPIs, task queues, and workflow summaries once the business layer is defined.
        </p>
      </UiCard>
      <DashboardQuickActions />
    </section>
    <section class="grid gap-5 md:grid-cols-3">
      <DashboardMetricCard label="Pipeline items" value="128" note="Placeholder metric for layout validation." />
      <DashboardMetricCard label="Open reviews" value="17" note="Mock-safe state for future task queues." />
      <DashboardMetricCard label="Draft invoices" value="09" note="Prepared for finance-related modules later." />
    </section>
    <section class="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <DashboardActivityPanel />
      <UiCard>
        <h3 class="text-lg font-bold">Operational status</h3>
        <div class="mt-4 grid gap-3">
          <DashboardStatCard title="Approvals engine" status="Placeholder wiring only" />
          <DashboardStatCard title="Collections dashboard" status="Not implemented" />
          <DashboardStatCard title="Invoice orchestration" status="Route scaffolded" />
        </div>
      </UiCard>
    </section>
  </div>
</template>
