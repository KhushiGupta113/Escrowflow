import { PageShell } from "@/components/page-shell";

export default function CreateProjectPage() {
  return (
    <PageShell title="Create Project" subtitle="Define milestones, due dates, and escrow allocation.">
      <p className="text-slate-700">Project creation endpoint: <code>POST /api/projects</code>.</p>
    </PageShell>
  );
}
