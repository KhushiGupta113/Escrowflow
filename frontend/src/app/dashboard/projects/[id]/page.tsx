"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Zap, Lock, Clock, Plus, X, Calendar, Wallet, ChevronRight, Activity, Edit2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [role, setRole] = useState("client");
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", amount: 0, description: "" });
  
  // Edit states
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState("");
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [tempMilestone, setTempMilestone] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        setRole(JSON.parse(atob(token.split('.')[1])).role);
      } catch (e) {}
    }

    const fetchProject = async () => {
      try {
        const data = await api.get<any>(`/api/projects/${params.id}`);
        setProject(data.project);
        setMilestones(data.milestones || []);
        setTempDesc(data.project.description);
      } catch (e: any) {
        toast.error(e.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProject();
  }, [params.id]);

  const parseSuggestedMilestones = (description: string) => {
    if (!description) return { overview: "", suggested: [] };
    
    let overview = "";
    const overviewMatch = description.match(/## Project Overview([\s\S]*?)(?=##|$)/i);
    if (overviewMatch) {
      overview = overviewMatch[1].replace(/[#*]/g, "").trim();
    } else {
      overview = description.split("##")[0].replace(/[#*]/g, "").trim();
    }

    const suggested: any[] = [];
    const milestoneRegex = /\*\*Milestone \d+:?\s*([^(]+?)\s*(?:\((\d+)%\))?\*\*/gi;
    let match;
    const milestoneIndices: number[] = [];
    
    while ((match = milestoneRegex.exec(description)) !== null) {
      milestoneIndices.push(match.index);
    }

    for (let i = 0; i < milestoneIndices.length; i++) {
      const startIndex = milestoneIndices[i];
      const endIndex = milestoneIndices[i+1] || description.length;
      const block = description.substring(startIndex, endIndex);
      
      const headerMatch = block.match(/^\*\*Milestone \d+:?\s*([^(]+?)\s*(?:\((\d+)%\))?\*\*/i);
      if (headerMatch) {
        const title = headerMatch[1].trim();
        const allocation = headerMatch[2] || "0";
        
        const details = block.split("\n")
          .map(line => line.trim())
          .filter(line => line.startsWith("*") || line.startsWith("-"))
          .map(line => line.replace(/^[*-\s]+/, "").replace(/[#*]/g, "").trim())
          .filter(line => line.length > 0 && !line.toLowerCase().includes("milestone"));
          
        suggested.push({ title, allocation, details });
      }
    }
    
    return { overview, suggested };
  };

  const handleUpdateProject = async () => {
    try {
      await api.patch(`/api/projects/${params.id}`, { description: tempDesc });
      setProject({ ...project, description: tempDesc });
      setIsEditingDesc(false);
      toast.success("Project details updated and freelancer notified");
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  const handleUpdateMilestone = async () => {
    if (!editingMilestoneId) return;
    try {
      await api.patch(`/api/milestones/${editingMilestoneId}`, {
        title: tempMilestone.title,
        amount: tempMilestone.amount,
        description: tempMilestone.description
      });
      toast.success("Milestone updated and freelancer notified");
      setEditingMilestoneId(null);
      const data = await api.get<any>(`/api/projects/${params.id}`);
      setMilestones(data.milestones || []);
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  const handleFund = async () => {
    try {
      setFunding(true);
      const res = await api.post(`/api/escrow/fund/${params.id}`) as any;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: res.amount,
        currency: "INR",
        name: "EscrowFlow",
        description: `Funding for ${project.title}`,
        order_id: res.orderId,
        handler: async function (response: any) {
          try {
            await api.post(`/api/escrow/verify/${params.id}`, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success("Project funded successfully!");
            window.location.reload();
          } catch (e) {
            toast.error("Verification failed");
          }
        },
        theme: { color: "#4f8ef7" }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || "Failed to initiate funding");
    } finally {
      setFunding(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title || newMilestone.amount <= 0) return;
    try {
      await api.post("/api/milestones", { ...newMilestone, projectId: params.id });
      toast.success("Milestone added");
      setShowAddMilestone(false);
      setNewMilestone({ title: "", amount: 0, description: "" });
      const data = await api.get<any>(`/api/projects/${params.id}`);
      setMilestones(data.milestones || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to add milestone");
    }
  };

  const handleMilestoneAction = async (milestoneId: string, action: string, data?: string) => {
    if (!milestoneId || milestoneId.startsWith('sugg-')) {
      toast.error("This is a suggested milestone. You must create it first.");
      return;
    }
    try {
      if (action === "submit") {
        await api.post(`/api/milestones/${milestoneId}/submit`, { submissionUrl: data, evidenceUrls: [] });
      } else if (action === "approve") {
        await api.post(`/api/milestones/${milestoneId}/approve`);
      } else if (action === "reject") {
        await api.post(`/api/milestones/${milestoneId}/reject`, { feedback: data });
      }
      toast.success(`Milestone ${action}ed`);
      const res = await api.get<any>(`/api/projects/${params.id}`);
      setProject(res.project);
      setMilestones(res.milestones || []);
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 h-[60vh]">
      <div className="w-10 h-10 rounded-full border-4 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] animate-spin"></div>
    </div>
  );

  if (!project) return <div className="p-20 text-center text-rose-400">Project not found</div>;

  const { overview, suggested } = parseSuggestedMilestones(project.description);
  const fundedAmount = milestones.reduce((sum, m) => m.status === "funded" || m.status === "submitted" || m.status === "approved" || m.status === "released" ? sum + m.amount : sum, 0);

  // Combine suggested and actual milestones
  const combinedMilestones = suggested.map((s, i) => {
    const actual = milestones[i];
    return {
      id: actual ? actual._id : `sugg-${i}`,
      title: actual ? actual.title : s.title,
      allocation: s.allocation,
      amount: actual ? actual.amount : (project.budget * parseInt(s.allocation) / 100),
      details: s.details,
      status: actual ? actual.status : "pending",
      isActual: !!actual
    };
  });
  
  if (milestones.length > suggested.length) {
    for (let i = suggested.length; i < milestones.length; i++) {
      const actual = milestones[i];
      combinedMilestones.push({
        id: actual._id,
        title: actual.title,
        allocation: ((actual.amount / project.budget) * 100).toFixed(0),
        amount: actual.amount,
        details: [actual.description || "No details provided"],
        status: actual.status,
        isActual: true
      });
    }
  }

  // Fallback if no suggested and no actual
  if (combinedMilestones.length === 0) {
     combinedMilestones.push({
        id: 'dummy-1',
        title: "Project Execution",
        allocation: "100",
        amount: project.budget,
        details: ["Complete all project requirements."],
        status: "pending",
        isActual: false
     });
  }

  const getStatusIcon = (status: string) => {
    if (["approved", "released", "completed"].includes(status)) {
      return <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[10px] uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> COMPLETED</div>;
    }
    if (["in_progress", "submitted", "funded"].includes(status)) {
      return <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[10px] uppercase tracking-widest"><div className="w-3.5 h-3.5 rounded-full border-[2px] border-blue-500" /> IN PROGRESS</div>;
    }
    return <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[10px] uppercase tracking-widest"><Clock className="w-4 h-4" /> PENDING</div>;
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 pt-4">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent h-auto text-[var(--text-secondary)] hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[var(--accent-primary)]" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Scope & Contract</h1>
          <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 ml-2">
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Total Bonded Budget</p>
          <p className="text-2xl font-bold text-[var(--accent-success)]">₹{project.budget.toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div className="px-2 text-xs text-[var(--text-secondary)] -mt-4 mb-2">
         Created on {new Date(project.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })} • Last updated 2 days ago
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Project Overview Card */}
          <GlassCard className="p-6 bg-[#0B101B] border-[#1C2333]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Project Overview
              </h2>
              <div className="flex items-center gap-4">
                {role === "client" && !isEditingDesc && (
                  <button onClick={() => setIsEditingDesc(true)} className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                    <Edit2 className="w-3 h-3" /> EDIT SCOPE
                  </button>
                )}
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">01 / Overview</span>
              </div>
            </div>
            <div className="p-5 rounded-lg bg-[#111827]/50 border border-[#1F2937]/50">
              {isEditingDesc ? (
                <div className="space-y-4">
                  <textarea 
                    className="w-full bg-[#0B101B] border border-[#1F2937] rounded-md p-3 text-sm text-white focus:border-blue-500 outline-none min-h-[150px] transition-all"
                    value={tempDesc}
                    onChange={(e) => setTempDesc(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => { setIsEditingDesc(false); setTempDesc(project.description); }} className="text-xs h-8 px-4 text-gray-400">Cancel</Button>
                    <Button onClick={handleUpdateProject} className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 flex items-center gap-2">
                      <Save className="w-3 h-3" /> Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-[#9CA3AF] text-sm leading-relaxed whitespace-pre-wrap">
                  {overview || project.description || "No description provided."}
                </p>
              )}
            </div>
          </GlassCard>

          {/* Milestones Card */}
          <GlassCard className="p-6 bg-[#0B101B] border-[#1C2333] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                Milestones
              </h2>
              {role === "client" && (
                <Button 
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 rounded-md font-medium transition-all duration-300"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Milestone
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showAddMilestone && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="p-5 rounded-lg border border-blue-500/20 bg-blue-500/5 overflow-hidden"
                >
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Title</label>
                      <input 
                        className="w-full bg-[#111827] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none text-white transition-all"
                        placeholder="e.g. Beta Launch"
                        value={newMilestone.title}
                        onChange={e => setNewMilestone({...newMilestone, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount (₹)</label>
                      <input 
                        type="number"
                        className="w-full bg-[#111827] border border-gray-800 rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none text-white transition-all"
                        placeholder="25000"
                        value={newMilestone.amount || ""}
                        onChange={e => setNewMilestone({...newMilestone, amount: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="px-6 h-8 rounded-md font-bold text-[11px] bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddMilestone}>Save Milestone</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="relative pl-10 space-y-6 pb-4">
              {/* Vertical Timeline Line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[#1F2937]" />

              {combinedMilestones.map((m, index) => (
                <div key={m.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-[#0B101B] border border-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-500 z-10">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="p-5 rounded-xl bg-[#111827]/40 border border-[#1F2937]/50 hover:bg-[#111827]/80 hover:border-[#1F2937] transition-all duration-300">
                    <div className="flex flex-col gap-4">
                      
                      {/* Header row */}
                      <div className="flex justify-between items-start">
                        {editingMilestoneId === m.id ? (
                          <input 
                            className="text-sm font-bold bg-[#0B101B] border border-[#1F2937] rounded px-2 py-1 text-white focus:border-blue-500 outline-none w-full mr-4"
                            value={tempMilestone.title}
                            onChange={(e) => setTempMilestone({ ...tempMilestone, title: e.target.value })}
                          />
                        ) : (
                          <h3 className="text-sm font-bold text-white">{m.title}</h3>
                        )}
                        <div className="flex items-center gap-3">
                          {role === "client" && m.isActual && editingMilestoneId !== m.id && (
                            <button 
                              onClick={() => { setEditingMilestoneId(m.id); setTempMilestone({ ...m }); }} 
                              className="text-[9px] font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <Edit2 className="w-2.5 h-2.5" /> EDIT
                            </button>
                          )}
                          <Badge variant="default" className="bg-[#1F2937] text-gray-300 border-none text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider rounded">
                            {m.allocation}% ALLOC.
                          </Badge>
                        </div>
                      </div>

                      {/* Details list */}
                      {editingMilestoneId === m.id ? (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Amount (₹)</label>
                            <input 
                              type="number"
                              className="w-full bg-[#0B101B] border border-[#1F2937] rounded px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                              value={tempMilestone.amount}
                              onChange={(e) => setTempMilestone({ ...tempMilestone, amount: Number(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Description</label>
                            <textarea 
                              className="w-full bg-[#0B101B] border border-[#1F2937] rounded px-3 py-2 text-xs text-white focus:border-blue-500 outline-none min-h-[80px]"
                              value={tempMilestone.description}
                              onChange={(e) => setTempMilestone({ ...tempMilestone, description: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setEditingMilestoneId(null)} className="text-[10px] h-7 px-3 text-gray-400">Cancel</Button>
                            <Button onClick={handleUpdateMilestone} className="text-[10px] h-7 px-3 bg-blue-600 text-white font-bold flex items-center gap-1">
                              <Save className="w-3 h-3" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {m.details && m.details.length > 0 && (
                            <ul className="space-y-2">
                              {m.details.map((detail: string, di: number) => (
                                <li key={di} className="text-xs text-[#9CA3AF] flex items-start gap-2 leading-relaxed">
                                  <div className="w-1 h-1 rounded-full bg-gray-500 mt-1.5 flex-shrink-0" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          )}
                          {m.isActual && m.description && !m.details?.length && (
                            <p className="text-xs text-[#9CA3AF] leading-relaxed whitespace-pre-wrap">{m.description}</p>
                          )}
                        </>
                      )}

                      <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                           
                           {/* Action Buttons & Inputs */}
                           <div className="flex flex-col gap-2 w-full sm:items-end">
                              {!m.isActual && role === "client" && (
                                 <Button 
                                   onClick={() => {
                                     setNewMilestone({ title: m.title, amount: m.amount, description: m.details.join('\n') });
                                     setShowAddMilestone(true);
                                   }} 
                                   variant="outline" 
                                   className="text-[10px] h-7 px-3 rounded border-[#1F2937] text-gray-400 hover:text-white self-end"
                                 >
                                   Create Real Milestone
                                 </Button>
                              )}

                              {m.isActual && role === "freelancer" && (m.status === "funded" || m.status === "rejected") && (
                                 <div className="flex flex-col gap-2 w-full sm:w-64">
                                   {m.status === "rejected" && m.feedback && (
                                     <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-[10px] text-red-400 mb-1">
                                       <strong className="block mb-0.5 uppercase tracking-wider">Client Feedback:</strong>
                                       {m.feedback}
                                     </div>
                                   )}
                                   <div className="flex gap-2">
                                     <input 
                                       className="flex-1 bg-[#0B101B] border border-[#1F2937] rounded px-2 py-1 text-[10px] text-white focus:border-blue-500 outline-none"
                                       placeholder="Link to work (e.g. GitHub, Figma)"
                                       id={`submit-input-${m.id}`}
                                     />
                                     <Button 
                                       onClick={() => {
                                         const input = document.getElementById(`submit-input-${m.id}`) as HTMLInputElement;
                                         if (input?.value) handleMilestoneAction(m.id, "submit", input.value);
                                         else toast.error("Please provide a link to your work.");
                                       }} 
                                       className="text-[10px] h-7 px-4 rounded bg-blue-600 text-white font-bold whitespace-nowrap"
                                     >
                                       {m.status === "rejected" ? "Resubmit" : "Submit Work"}
                                     </Button>
                                   </div>
                                 </div>
                              )}

                              {m.isActual && role === "client" && m.status === "submitted" && (
                                 <div className="flex flex-col gap-2 w-full sm:w-72">
                                   {m.submissionUrl && (
                                     <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded flex items-center justify-between mb-1">
                                       <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Freelancer Submission</span>
                                       <a href={m.submissionUrl.startsWith('http') ? m.submissionUrl : `https://${m.submissionUrl}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-300 hover:text-white underline">
                                         View Work ↗
                                       </a>
                                     </div>
                                   )}
                                   <div className="flex gap-2">
                                     <input 
                                       className="flex-1 bg-[#0B101B] border border-[#1F2937] rounded px-2 py-1 text-[10px] text-white focus:border-red-500 outline-none"
                                       placeholder="Reason for rejection..."
                                       id={`reject-input-${m.id}`}
                                     />
                                     <Button 
                                       variant="danger" 
                                       onClick={() => {
                                         const input = document.getElementById(`reject-input-${m.id}`) as HTMLInputElement;
                                         if (input?.value) handleMilestoneAction(m.id, "reject", input.value);
                                         else toast.error("Please provide a reason for rejection.");
                                       }} 
                                       className="text-[10px] h-7 px-3 rounded"
                                     >
                                       Reject
                                     </Button>
                                     <Button 
                                       variant="primary" 
                                       onClick={() => handleMilestoneAction(m.id, "approve")} 
                                       className="text-[10px] h-7 px-4 rounded bg-emerald-500 font-bold"
                                     >
                                       Approve
                                     </Button>
                                   </div>
                                 </div>
                              )}
                           </div>
                           
                           {/* Status Indicator */}
                           <div className="mt-2 flex justify-end">
                             {getStatusIcon(m.status)}
                           </div>
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Escrow Balance Card */}
          <GlassCard className="p-8 text-center flex flex-col items-center justify-center min-h-[280px] bg-[#0B101B] border-[#1C2333] relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
             <div className="relative mb-6">
               <div className="w-16 h-16 rounded-full border border-gray-800 flex items-center justify-center">
                 <Clock className="w-6 h-6 text-orange-400" />
               </div>
             </div>
            
            <h3 className="text-xs font-bold text-white mb-2">Escrow Balance</h3>
            <p className="text-3xl font-bold text-white mb-4 tracking-tight">₹{fundedAmount.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-[#9CA3AF] leading-relaxed max-w-[160px] mx-auto font-medium">
              Secured in cryptographically bonded smart contract vault.
            </p>
            <Button variant="ghost" className="mt-6 text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:bg-transparent p-0 flex items-center gap-1">
               View Vault Details <ArrowLeft className="w-3 h-3 rotate-180" />
            </Button>
          </GlassCard>

          {/* Security Protocols Card */}
          <GlassCard className="p-6 bg-[#0B101B] border-[#1C2333]">
            <h3 className="text-xs font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
              Security Protocols
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-1">Instant Settlement</p>
                  <p className="text-[10px] text-[#9CA3AF] leading-relaxed">Payouts triggered immediately upon approval.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-1">Non-Custodial Vault</p>
                  <p className="text-[10px] text-[#9CA3AF] leading-relaxed">Funds held in isolated multi-sig storage.</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" className="mt-6 text-[10px] font-bold text-blue-400 hover:text-blue-300 hover:bg-transparent p-0 flex items-center gap-1">
               Learn more about security <ArrowLeft className="w-3 h-3 rotate-180" />
            </Button>
          </GlassCard>

          {/* Project Details Card */}
          <GlassCard className="p-6 bg-[#0B101B] border-[#1C2333]">
             <h3 className="text-xs font-bold text-white mb-5">Project Details</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-[#9CA3AF]">Project ID</span>
                 <span className="text-[10px] text-white">PRJ-{params.id?.toString().substring(0, 8).toUpperCase()}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-[#9CA3AF]">Client</span>
                 <span className="text-[10px] text-white">fuwgri</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-[#9CA3AF]">Created On</span>
                 <span className="text-[10px] text-white">{new Date(project.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-[#9CA3AF]">Category</span>
                 <span className="text-[10px] text-white">{project.category || "Web Development"}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[10px] text-[#9CA3AF]">Status</span>
                 <Badge variant="info" className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 text-[9px] px-2 py-0.5 rounded">
                   {project.status.replace('_', ' ')}
                 </Badge>
               </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
