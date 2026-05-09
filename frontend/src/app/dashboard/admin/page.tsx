"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { ShieldAlert, Users, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeProjects: 0, openDisputes: 0, escrowVolume: 0 });
  const [disputes, setDisputes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [st, dsp, usr] = await Promise.all([
        api.get<any>("/api/admin/stats").catch(() => null),
        api.get<any[]>("/api/admin/disputes").catch(() => []),
        api.get<any[]>("/api/admin/users").catch(() => [])
      ]);
      if (st) setStats(st);
      if (dsp) setDisputes(dsp);
      if (usr) setUsers(usr);
    } catch (e) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (id: string, resolution: "client" | "freelancer") => {
    try {
      await api.post(`/api/admin/disputes/${id}/resolve`, { resolution, notes: "Admin resolution via dashboard" });
      toast.success("Dispute resolved successfully!");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to resolve dispute");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Admin Control Center</h1>
        <p className="text-[var(--text-secondary)]">Platform overview, dispute resolution, and user management.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={stats.totalUsers} glow="blue" />
        <StatCard label="Active Projects" value={stats.activeProjects} glow="violet" />
        <StatCard label="Open Disputes" value={stats.openDisputes} glow="none" />
        <StatCard label="Escrow Volume" value={stats.escrowVolume} prefix="₹" glow="none" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-danger)]/10 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[var(--accent-danger)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Active Disputes</h2>
                <p className="text-sm text-[var(--text-secondary)]">Requires admin intervention</p>
              </div>
            </div>

            {loading ? (
              <p className="text-[var(--text-muted)] text-sm">Loading disputes...</p>
            ) : disputes.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center border border-dashed border-white/[0.06] rounded-xl">
                <CheckCircle className="w-8 h-8 text-[var(--accent-success)] mb-3 opacity-50" />
                <p className="text-[var(--text-secondary)]">No active disputes.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {disputes.map(d => (
                  <div key={d._id} className="p-5 rounded-xl border border-[var(--accent-danger)]/20 bg-[var(--accent-danger)]/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white mb-1">Milestone: {d.milestoneId?.title || d.milestoneId}</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Reason: {d.reason}</p>
                      </div>
                      <Badge variant="danger">{d.status}</Badge>
                    </div>
                    {d.status === "open" && (
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                        <Button onClick={() => handleResolve(d._id, "client")} className="flex-1 text-xs py-2" variant="outline">
                          Resolve for Client
                        </Button>
                        <Button onClick={() => handleResolve(d._id, "freelancer")} className="flex-1 text-xs py-2" variant="outline">
                          Resolve for Freelancer
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Recent Users</h2>
                <p className="text-sm text-[var(--text-secondary)]">Platform members</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {loading ? (
                <p className="text-[var(--text-muted)] text-sm">Loading users...</p>
              ) : (
                users.slice(0, 8).map(u => (
                  <div key={u._id} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition">
                    <div>
                      <p className="font-medium text-sm text-white">{u.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{u.email}</p>
                    </div>
                    <Badge variant={u.role === "client" ? "info" : u.role === "admin" ? "warning" : "success"}>
                      {u.role}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
