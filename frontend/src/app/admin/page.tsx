import { PageShell } from "@/components/page-shell";

export default function AdminPage() {
  return (
    <PageShell title="Admin Panel" subtitle="Resolve disputes, review risk flags, and oversee platform operations.">
      <p className="text-slate-700">Admin API: <code>POST /api/admin/disputes/:id/resolve</code>.</p>
    </PageShell>
  );
}
