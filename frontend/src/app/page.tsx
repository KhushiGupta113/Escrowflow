"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Bell, BriefcaseBusiness, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";

const projectSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  budget: z.number().positive("Budget must be positive"),
  description: z.string().min(20, "Please add more project details")
});

type ProjectForm = z.infer<typeof projectSchema>;



const chartData = [
  { month: "Jan", released: 80000 },
  { month: "Feb", released: 116000 },
  { month: "Mar", released: 92000 },
  { month: "Apr", released: 178000 },
  { month: "May", released: 138000 }
];

const milestones = [
  { title: "Wireframes + UX flow", status: "Submitted", amount: "₹20,000" },
  { title: "Backend escrow APIs", status: "In Progress", amount: "₹55,000" },
  { title: "QA and release", status: "Funded", amount: "₹30,000" },
  { title: "Payment dispute handling", status: "Disputed", amount: "₹18,000" }
];

export default function Home() {
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<{ activeProjects: number, escrowBalance: number, pendingApprovals: number } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProjectForm>({ resolver: zodResolver(projectSchema) });

  const fetchProjects = async () => {
    try {
      const data = await api<any[]>("/api/projects");
      if (data) setActiveProjects(data);
    } catch {
      // ignore
    }
  };

  const fetchSummary = async () => {
    try {
      const resp = await api<any>("/api/dashboard/summary");
      if (resp) {
        setSummaryData({
          activeProjects: resp.activeProjects || 0,
          escrowBalance: resp.escrowBalance || 0,
          pendingApprovals: resp.pendingApprovals || 0
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchSummary();
  }, []);

  const statusClass = useMemo(
    () => (status: string) => {
      const base = "status-chip";
      if (status === "Submitted") return `${base} bg-indigo-500/20 text-indigo-300 border border-indigo-500/30`;
      if (status === "In Progress") return `${base} bg-amber-500/20 text-amber-300 border border-amber-500/30`;
      if (status === "Funded") return `${base} bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`;
      if (status === "Disputed") return `${base} bg-rose-500/20 text-rose-300 border border-rose-500/30`;
      return `${base} bg-slate-500/20 text-slate-300 border border-slate-500/30`;
    },
    []
  );

  const onSubmit = async (values: ProjectForm) => {
    try {
      await api("/api/projects", { method: "POST", body: JSON.stringify(values) });
      toast.success("Project created successfully!", { 
        style: { background: "#10b981", color: "#fff", border: "none" }
      });
      reset();
      fetchProjects();
    } catch (e: any) {
      toast.error(e.message || "Failed to create project", {
        style: { background: "#ef4444", color: "#fff", border: "none" }
      });
    }
  };

  return (
    <PageShell title="Overview" subtitle="Real-time escrow operations for your workflows.">
      <section className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <motion.article
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-t border-t-indigo-500/20"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Active Projects</p>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20"><BriefcaseBusiness className="h-5 w-5 text-indigo-400" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{summaryData?.activeProjects ?? "0"}</p>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 border-t border-t-indigo-500/20"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Escrow Balance</p>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20"><Wallet className="h-5 w-5 text-indigo-400" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">₹{summaryData?.escrowBalance?.toLocaleString("en-IN") ?? "0"}</p>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 border-t border-t-indigo-500/20"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Pending Approvals</p>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20"><Bell className="h-5 w-5 text-indigo-400" /></div>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{summaryData?.pendingApprovals ?? "0"}</p>
        </motion.article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="glass-card col-span-2 p-6 flex flex-col">
          <h2 className="mb-6 text-lg font-bold">Released Payments Trend</h2>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="released" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorReleased)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-card p-6 flex flex-col">
          <h2 className="mb-4 text-lg font-bold text-white">Quick Draft Project</h2>
          <form className="space-y-4 flex-1 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input {...register("title")} className="input-glass w-full rounded-xl p-3 text-sm" placeholder="Project title" />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <input type="number" {...register("budget", { valueAsNumber: true })} className="input-glass w-full rounded-xl p-3 text-sm" placeholder="Budget (INR)" />
              {errors.budget && <p className="text-xs text-rose-400 mt-1">{errors.budget.message}</p>}
            </div>
            <div className="flex-1 flex flex-col min-h-[120px]">
              <textarea {...register("description")} className="input-glass flex-1 w-full rounded-xl p-3 text-sm resize-none" placeholder="Describe milestones..." />
              {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>}
            </div>
            <button className="btn-primary w-full rounded-xl px-4 py-3 text-sm font-bold mt-auto hover:text-white text-white">
              Create Project
            </button>
          </form>
        </article>
      </section>

      {activeProjects.length > 0 && (
        <section className="glass-card mt-6 p-6">
          <h2 className="text-lg font-bold mb-4">Your Recent Projects</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeProjects.slice(0, 4).map((p) => (
              <div key={p._id} className="rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition">
                <p className="font-semibold text-white text-lg">{p.title}</p>
                <p className="text-sm text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                <div className="mt-3 flex gap-2">
                  <span className="status-chip bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Budget: ₹{p.budget}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="glass-card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Active Milestones Needs Review</h2>
        </div>
        <div className="space-y-3">
          {milestones.map((ms) => (
            <div key={ms.title} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition">
              <div>
                <p className="font-semibold text-white">{ms.title}</p>
                <p className="text-sm text-slate-400">{ms.amount}</p>
              </div>
              <span className={statusClass(ms.status)}>{ms.status}</span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
