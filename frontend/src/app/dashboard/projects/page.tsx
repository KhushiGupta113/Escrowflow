"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Wallet,
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Project = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  createdAt: string;
  milestoneStats?: {
    total: number;
    completed: number;
  };
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get<{ data: Project[] }>("/api/projects");
        // Check if data is nested or direct
        const projectsData = (res as any).data || res;
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else {
          console.error("Unexpected response format:", res);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter(p => p.status === "in_progress").length;
    const completed = projects.filter(p => p.status === "completed").length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    
    return [
      { label: "Total Projects", value: total, icon: Briefcase, color: "blue", glow: "blue" },
      { label: "In Progress", value: inProgress, icon: Clock, color: "indigo", glow: "none" },
      { label: "Completed", value: completed, icon: CheckCircle2, color: "emerald", glow: "none" },
      { label: "Total Value", value: `₹${totalBudget.toLocaleString("en-IN")}`, icon: Wallet, color: "violet", glow: "violet" },
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Just now";
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  const calculateProgress = (project: Project) => {
    if (project.status === "completed") return 100;
    if (!project.milestoneStats || project.milestoneStats.total === 0) return 0;
    return Math.round((project.milestoneStats.completed / project.milestoneStats.total) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pt-4">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold tracking-tight text-white mb-2"
          >
            Projects
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--text-secondary)] font-medium"
          >
            Manage your active and completed escrow projects
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={() => router.push("/dashboard/client")} 
            variant="primary"
            className="rounded-xl h-12 px-8 flex items-center gap-2 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold">New Project</span>
          </Button>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
          >
            <GlassCard glow={stat.glow as any} className="p-5 flex items-center gap-4 border-white/5 h-full">
              <div className={`p-3 rounded-xl bg-white/5 text-white/80 group-hover:bg-white/10 transition-colors`}>
                <stat.icon className="w-6 h-6" style={{ color: `var(--accent-${stat.color === 'blue' ? 'primary' : stat.color === 'emerald' ? 'success' : stat.color === 'indigo' ? 'primary' : 'secondary'})` }} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{stat.label}</p>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors pointer-events-none" />
          <Input 
            placeholder="Search projects..." 
            className="pl-12 h-12 bg-white/5 border-white/10 focus:bg-white/[0.08] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-48 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors pointer-events-none" />
            <select 
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#0d1526] border border-white/[0.08] text-white appearance-none focus:outline-none focus:border-[var(--accent-primary)] focus:bg-white/[0.05] transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <AnimatePresence mode="popLayout">
        {error ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <GlassCard className="p-12 text-center border-rose-500/20 bg-rose-500/5">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <p className="text-rose-400 font-medium text-lg mb-6">{error}</p>
              <Button onClick={() => window.location.reload()} variant="primary" className="px-8 h-12">
                Retry Connection
              </Button>
            </GlassCard>
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <GlassCard className="p-20 text-center flex flex-col items-center justify-center border-dashed border-white/10 bg-white/[0.01]">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
                <Briefcase className="w-12 h-12 text-[var(--text-muted)] opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchQuery || statusFilter !== "all" ? "No results found" : "No projects yet"}
              </h3>
              <p className="text-[var(--text-secondary)] mb-10 max-w-md mx-auto leading-relaxed">
                {searchQuery || statusFilter !== "all" 
                  ? "We couldn't find any projects matching your current filters. Try searching for something else or clearing filters." 
                  : "Start your first escrow project to experience secure and transparent transactions with EscrowFlow."}
              </p>
              <Button onClick={() => router.push("/dashboard/client")} className="h-12 px-10 rounded-xl font-bold">
                {searchQuery || statusFilter !== "all" ? "Clear Filters" : "Create First Project"}
              </Button>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.map((project, index) => {
              const progress = calculateProgress(project);
              return (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <GlassCard 
                    hover 
                    className="group h-full flex flex-col overflow-hidden border-white/[0.06] hover:border-[var(--accent-primary)]/40 transition-all duration-500 cursor-pointer" 
                    onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex justify-between items-center mb-6">
                        <Badge 
                          variant={project.status === "in_progress" ? "info" : project.status === "completed" ? "success" : "default"}
                          pulse={project.status === "in_progress"}
                          className="px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest font-black"
                        >
                          {project.status.replace("_", " ")}
                        </Badge>
                        <div className="flex items-center gap-2 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">{formatDate(project.createdAt)}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-extrabold text-white mb-3 line-clamp-1 group-hover:text-[var(--accent-primary)] transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-6 group-hover:text-[var(--text-primary)]/80 transition-colors">
                        {project.description}
                      </p>
                    </div>

                    {/* Dynamic Progress Indicator */}
                    <div className="px-6 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                          {project.milestoneStats?.total 
                            ? `${project.milestoneStats.completed}/${project.milestoneStats.total} Milestones` 
                            : 'No Milestones'}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--accent-primary)]">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            progress === 100 ? 'bg-[var(--accent-success)] shadow-[0_0_10px_var(--accent-success)]/40' : 
                            'bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]/40'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-auto p-6 pt-5 border-t border-white/5 bg-white/[0.03] flex items-center justify-between group-hover:bg-white/[0.06] transition-all">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mb-1">Budget</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[var(--accent-success)]" />
                          <span className="text-xl font-black text-white">₹{project.budget.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent-primary)] group-hover:gap-3 transition-all duration-300">
                        <span>View details</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
