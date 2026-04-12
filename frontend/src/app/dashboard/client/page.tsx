import { PageShell } from "@/components/page-shell";

export default function ClientDashboardPage() {
  return (
    <PageShell title="Client Dashboard" subtitle="Track active projects, approvals, and escrow utilization.">
      <p className="text-slate-700">Premium KPI cards, sortable tables, and real-time activity are available on the landing dashboard.</p>
    </PageShell>
  );
}
