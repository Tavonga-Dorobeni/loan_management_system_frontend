import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard — Loan Management",
};

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Portfolio health at a glance. Metrics refresh as new loans, repayments, and imports land.
        </p>
      </div>
      <DashboardClient />
    </div>
  );
}
