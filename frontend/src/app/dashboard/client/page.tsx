"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { ReleasedTrendChart } from "@/components/charts/ReleasedTrendChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShieldCheck } from "lucide-react";
import { AIDrafter } from "@/components/ui/AIDrafter";

export default function ClientDashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState({ activeProjects: 0, escrowBalance: 0, pendingApprovals: 0 });
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState({ name: "Client" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>("/api/dashboard/summary").catch(() => null),
      api.get<any[]>("/api/projects").catch(() => []),
      api.get<any>("/api/users/profile").catch(() => null)
    ]).then(([sum, proj, profile]) => {
      if (sum) setSummary({ activeProjects: sum.activeProjects || 0, escrowBalance: sum.escrowBalance || 0, pendingApprovals: sum.pendingApprovals || 0 });
      if (proj) setProjects(proj);
      if (profile && profile.name) setUser({ name: profile.name });
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[#7c3aed]">{user.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-[var(--text-secondary)]">Here is what's happening with your escrow projects today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="px-5">View Reports</Button>
          <Button className="px-5">+ New Escrow</Button>
        </div>
      </div>

      <AIDrafter />

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard label="Active Projects" value={summary.activeProjects} glow="blue" />
        <StatCard label="Total Escrow Balance" value={summary.escrowBalance} prefix="₹" glow="violet" />
        <StatCard label="Pending Approvals" value={summary.pendingApprovals} glow="none" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-white mb-6">Released Funds Trend</h2>
            <ReleasedTrendChart />
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Recent Projects</h2>
                <p className="text-xs text-[var(--text-muted)]">Track milestone progress and escrow releases.</p>
              </div>
              <Button variant="ghost" className="text-xs px-4">View All</Button>
            </div>
            
            {loading ? (
              <p className="text-[var(--text-muted)] text-sm">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm">No active projects.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {projects.slice(0, 3).map((p) => (
                    <div 
                      key={p._id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition cursor-pointer"
                      onClick={() => router.push(`/dashboard/projects/${p._id}`)}
                    >
                    <div>
                      <h3 className="font-semibold text-white mb-1">{p.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{p.description}</p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{p.budget?.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Budget</p>
                      </div>
                      <Badge variant={p.status === "in_progress" ? "info" : "default"}>{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex-1">
            <h2 className="text-lg font-bold mb-6">Action Required</h2>
            {summary.pendingApprovals > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)]/20">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="warning" pulse>Needs Review</Badge>
                  </div>
                  <p className="text-sm text-[var(--accent-warning)] font-medium">You have milestones waiting for your approval. Please review them to unblock your freelancers.</p>
                  <Button variant="secondary" className="w-full mt-4 text-xs">Review Milestones</Button>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center opacity-60">
                <ShieldCheck className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">All caught up!</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
