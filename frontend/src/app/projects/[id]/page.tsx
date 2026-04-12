import { PageShell } from "@/components/page-shell";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageShell title="Project Details" subtitle={`Inspect project #${id}, milestones, escrow and timeline.`}>
      <p className="text-slate-700">Hook this page to <code>GET /api/projects</code> + milestone/payment APIs for a full detail view.</p>
    </PageShell>
  );
}
