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
  const [user, setUser] = useState<{ id: string, role: string } | null>(null);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<{ activeProjects: number, escrowBalance: number, pendingApprovals: number } | null>(null);
  const [marketplaceProjects, setMarketplaceProjects] = useState<any[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<ProjectForm>({ resolver: zodResolver(projectSchema) });
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  const fetchMarketplace = async () => {
    try {
      const data = await api<any[]>("/api/marketplace");
      if (data) setMarketplaceProjects(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currRole = payload.role;
        setUser({ id: payload.sub, role: currRole });

        // Only fetch relative to role
        fetchSummary();
        if (currRole === "client") {
          fetchProjects();
        } else if (currRole === "freelancer") {
          fetchMarketplace();
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
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
      setShowForm(false);
      setAiPrompt("");
      fetchProjects();
    } catch (e: any) {
      toast.error(e.message || "Failed to create project", {
        style: { background: "#ef4444", color: "#fff", border: "none" }
      });
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return toast.error("Please describe your project first!");
    
    setIsGenerating(true);
    
    try {
      const response = await api<any>("/api/generate-brief", {
        method: "POST",
        body: JSON.stringify({ prompt: aiPrompt })
      });
      
      if (response) {
        setValue("title", response.title || "AI Generated Project");
        // We removed budget from AI generation so the user can define it themselves
        setValue("budget", undefined as any);
        setValue("description", response.description || "");
        
        setShowForm(true);
        toast.success("AI successfully structured your project blueprint!");
      }
    } catch (e: any) {
      toast.error(e.message || "AI Drafting failed. Please try again.");
    } finally {
      setIsGenerating(false);
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

      <section className="grid gap-6">
        {/* Conditionally show AI Project Drafter for Clients */}
        {user?.role === 'client' && (
          <article className="glass-card p-8 flex flex-col relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  AI Project Drafter
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white uppercase tracking-widest shadow-lg shadow-indigo-500/20">Beta</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">Describe your idea and our AI will structure it into a professional escrow contract.</p>
              </div>
            </div>

            {!showForm ? (
              <div className="flex-1 flex flex-col mt-2">
                <div className="flex-1 flex flex-col mb-6 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition duration-500 -z-10"></div>
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="input-glass flex-1 w-full min-h-[140px] rounded-2xl p-5 text-base resize-none focus:border-purple-500/50 transition-colors shadow-inner" 
                    placeholder="E.g., I need a mobile app for my restaurant with a menu catalog, user authentication, and Stripe payment integration. The design must be modern and fully responsive..." 
                  />
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Structuring Project via AI...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Professional Brief
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-300 mt-2" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 md:grid-cols-2 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block tracking-wider">Project Title</label>
                    <input {...register("title")} className="input-glass w-full rounded-xl p-3.5 text-sm border-indigo-500/20 bg-indigo-500/5 text-white" placeholder="Project title" />
                    {errors.title && <p className="text-xs text-rose-400 mt-1.5">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block tracking-wider">Estimated Budget (INR)</label>
                    <input type="number" {...register("budget", { valueAsNumber: true })} className="input-glass w-full rounded-xl p-3.5 text-sm border-indigo-500/20 bg-indigo-500/5 text-white" placeholder="Budget (INR)" />
                    {errors.budget && <p className="text-xs text-rose-400 mt-1.5">{errors.budget.message}</p>}
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-[160px] mb-6">
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block tracking-wider">Structured Milestones</label>
                  <textarea {...register("description")} className="input-glass flex-1 w-full rounded-xl p-4 text-sm resize-none border-indigo-500/20 bg-indigo-500/5 text-white leading-relaxed" placeholder="Describe milestones..." />
                  {errors.description && <p className="text-xs text-rose-400 mt-1.5">{errors.description.message}</p>}
                </div>
                
                <div className="flex justify-end gap-4 mt-auto pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition text-slate-300 text-sm font-medium">
                    Discard Draft
                  </button>
                  <button type="submit" className="btn-primary rounded-xl px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all">
                    Approve & Create Contract
                  </button>
                </div>
              </form>
            )}
          </article>
        )}

        {/* Show Marketplace for Freelancers */}
        {user?.role === 'freelancer' && (
          <article className="glass-card p-8 flex flex-col relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <BriefcaseBusiness className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  Marketplace: New Opportunities
                </h2>
                <p className="text-sm text-slate-400 mt-1">Browse open projects and apply to start earning securely through EscrowFlow.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {marketplaceProjects.length === 0 ? (
                <div className="col-span-2 p-12 text-center rounded-2xl border border-dashed border-white/10 flex flex-col items-center">
                  <p className="text-slate-500 mb-4">No active opportunities found at the moment...</p>
                </div>
              ) : (
                marketplaceProjects.map((p) => (
                  <div key={p._id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white group-hover:text-emerald-400 transition">{p.title}</h4>
                      <span className="text-emerald-400 font-bold text-sm">₹{p.budget?.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{p.description}</p>
                    <button 
                      onClick={async () => {
                        try {
                          await api(`/api/projects/${p._id}/apply`, { method: "POST" });
                          toast.success("Succesfully joined project! It's now in your workspace.");
                          fetchProjects();
                          // Remove from marketplace local state
                          setMarketplaceProjects(prev => prev.filter(x => x._id !== p._id));
                        } catch (e: any) {
                          toast.error(e.message || "Failed to join project");
                        }
                      }}
                      className="w-full py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Apply & Start Working
                    </button>
                  </div>
                ))
              )}
            </div>
          </article>
        )}

        {/* Full-width Released Payments Trend Chart */}
        <article className="glass-card p-6 flex flex-col">
          <h2 className="mb-6 text-lg font-bold text-white">Released Payments Trend</h2>
          <div className="min-h-[300px] h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(99,102,241,0.2)', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="released" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorReleased)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
