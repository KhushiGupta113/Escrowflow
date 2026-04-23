"use client";

import { PageShell } from "@/components/page-shell";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  createdAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api<Project[]>("/api/projects");
        if (data) setProjects(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Just now";
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  return (
    <PageShell title="Your Projects" subtitle="Manage your active and completed escrow projects">

      {loading ? (
        <div className="flex items-center justify-center p-20 animate-pulse">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center border-rose-500/20">
          <p className="text-rose-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary rounded-xl px-4 py-2 text-sm">Retry</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-5 border border-indigo-500/20">
            <svg className="w-10 h-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Projects Repository Empty</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">You haven't initiated any escrow projects yet. Head back to the Dashboard and use the AI Project Drafter to create your first secure contract.</p>
          <a href="/" className="btn-primary rounded-xl px-6 py-3 font-bold text-sm text-white hover:text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project._id} className="glass-card p-6 flex flex-col hover:border-indigo-500/30 transition-all group cursor-pointer relative overflow-hidden" onClick={() => router.push(`/projects/${project._id}`)}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-4 relative">
                <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                  {project.status || 'Active'}
                </span>
                <span className="text-xs text-slate-500 font-medium">{formatDate(project.createdAt)}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1 relative">{project.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1 relative">{project.description}</p>
              
              <div className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between relative">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Budget</p>
                  <p className="text-lg font-bold text-white">₹{project.budget.toLocaleString("en-IN")}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-slate-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
