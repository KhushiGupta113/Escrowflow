import { PageShell } from "@/components/page-shell";

export default function MilestonesPage() {
  return (
    <PageShell title="Milestone Management" subtitle="Move milestones through funded → submitted → approved → released.">
      <p className="text-slate-700">Strict status chips and safe release path are backed by Redis release locking in backend.</p>
    </PageShell>
  );
}
