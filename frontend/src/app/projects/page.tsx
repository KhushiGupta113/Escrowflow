import { PageShell } from "@/components/page-shell";

export default function ProjectsPage() {
  return (
    <PageShell title="Your Projects" subtitle="Manage your active and completed escrow projects">
      <div className="glass-card p-8 text-center flex flex-col items-center justify-center border-dashed border-white/20">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
          <svg className="w-8 h-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Projects Repository</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6">Create a project from the Dashboard Quick Draft to see it appear here, where you can manage its milestones and escrow funds.</p>
        <button className="btn-primary rounded-xl px-5 py-2.5 font-semibold text-sm">Explore Marketplace</button>
      </div>
    </PageShell>
  );
}
