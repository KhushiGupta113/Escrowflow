"use client";
// Force re-trigger Vercel build v2


import { PageShell } from "@/components/page-shell";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type Milestone = {
  _id: string;
  title: string;
  amount: number;
  status: string;
  dueDate?: string;
  updatedAt?: string;
};

type Project = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  createdAt: string;
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", amount: "" });
  const [isCreating, setIsCreating] = useState(false);

  const [submitModal, setSubmitModal] = useState<{isOpen: boolean, milestoneId: string}>({ isOpen: false, milestoneId: "" });
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  const fetchDetails = async () => {
    try {
      const data = await api<{ project: Project, milestones: Milestone[] }>(`/api/projects/${id}`);
      if (data) {
        setProject(data.project);
        setMilestones(data.milestones);
      }
    } catch {
      toast.error("Failed to load project escrow details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleFundEscrow = async (milestoneId: string) => {
    try {
      toast.info("Connecting to secure vault gateway...", { id: "escrow_funding" });
      
      const res = await api<{ order: any }>(`/api/escrow/fund/${milestoneId}`, { method: "POST" });
      
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const options: any = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_key",
          amount: res.order.amount,
          currency: "INR",
          name: "EscrowFlow Trust",
          description: "Secure Milestone Vault",
          handler: async function (response: any) {
            try {
              toast.loading("Verifying block transaction...", { id: "escrow_funding" });
              await api("/api/escrow/verify", {
                method: "POST",
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id || res.order.id,
                  razorpayPaymentId: response.razorpay_payment_id || `mock_payment_${Date.now()}`,
                })
              });
              toast.success("Milestone vault successfully funded and locked!", { id: "escrow_funding" });
              fetchDetails();
            } catch (e: any) {
              toast.error(e.message || "Cryptographic verification failed.", { id: "escrow_funding" });
            }
          },
          theme: { color: "#10b981" }
        };
        
        // Only attach order_id if it's a real razorpay order (doesn't start with mock_order)
        if (!res.order.id.startsWith("mock_order")) {
          options.order_id = res.order.id;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function () {
          toast.dismiss("escrow_funding");
          toast.error("Banking transfer failed or cancelled.");
        });
        rzp.open();
        toast.dismiss("escrow_funding");
      };
      document.body.appendChild(script);
    } catch (e: any) {
      toast.error(e.message || "Failed to initialize vault protocol.", { id: "escrow_funding" });
    }
  };

  const submitMilestone = async () => {
    if (!newMilestone.title.trim() || !newMilestone.amount) {
      return toast.error("Please provide a valid title and amount.");
    }

    setIsCreating(true);
    try {
      await api("/api/milestones", {
        method: "POST",
        body: JSON.stringify({
          projectId: id,
          title: newMilestone.title,
          amount: Number(newMilestone.amount)
        })
      });
      toast.success("Milestone constructed successfully!");
      setShowMilestoneForm(false);
      setNewMilestone({ title: "", amount: "" });
      fetchDetails(); // Refetch Data organically
    } catch (e: any) {
      toast.error(e.message || "Failed to add milestone");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!submissionUrl) return toast.error("Please provide a valid work URL (e.g. GitHub, Figma).");
    setIsSubmittingWork(true);
    try {
      await api(`/api/milestones/${submitModal.milestoneId}/submit`, {
        method: "POST",
        body: JSON.stringify({ submissionUrl })
      });
      toast.success("Work securely submitted to the client for review!");
      setSubmitModal({ isOpen: false, milestoneId: "" });
      setSubmissionUrl("");
      fetchDetails();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit work. Only the assigned Freelancer can do this.");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  if (loading) {
    return (
      <PageShell title="Project Escrow Hub" subtitle="Loading secure vault data...">
        <div className="flex items-center justify-center p-32 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
        </div>
      </PageShell>
    );
  }

  if (!project) {
    return (
      <PageShell title="Project Not Found" subtitle="Could not locate this secure contract.">
        <div className="glass-card p-12 text-center">
          <button onClick={() => router.push('/projects')} className="btn-primary rounded-xl px-6 py-3 font-semibold text-white">Return to Projects</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={project.title} subtitle="Manage milestones, escrow funding, and workflow progression.">
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Main Details Panel */}
        <section className="lg:col-span-2 glass-card p-8 flex flex-col relative overflow-hidden">
          <div className="flex items-start justify-between mb-6 border-b border-white/5 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase">
                  {project.status || 'Active Escrow'}
                </span>
                <span className="text-xs text-slate-400 border-l border-white/10 pl-3">
                  Created {new Date(project.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Project Scope & Contract</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Bonded Budget</p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                ₹{project.budget.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          
          <div className="flex-1 mt-2 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f140 transparent' }}>
            {project.description.replace(/\*/g, '').split(/(?=## )/).filter(Boolean).map((section, idx) => {
              const lines = section.split('\n');
              let title = "";
              if (lines[0].startsWith('## ')) {
                title = lines[0].replace('## ', '').trim();
                lines.shift();
              }
              
              return (
                <div key={idx} className="mb-6 bg-slate-900/40 p-6 rounded-xl border border-white/5 hover:border-indigo-500/20 transition-colors">
                  {title && <h3 className="text-lg font-bold text-indigo-300 mb-4">{title}</h3>}
                  
                  {title.toLowerCase().includes("milestone") ? (
                    <div className="space-y-4">
                      {(() => {
                        const mstones: { header: string | null; bullets?: string[]; text?: string }[] = [];
                        let curr: { header: string | null; bullets: string[] } | null = null;
                        lines.forEach(line => {
                          const t = line.trim();
                          if (!t) return;
                          if (t.toLowerCase().startsWith('milestone ') || t.match(/\(\d+%\)$/)) {
                            if (curr) mstones.push(curr);
                            curr = { header: t, bullets: [] };
                          } else if (curr) {
                            curr.bullets.push(t.replace(/^- /, ''));
                          } else {
                            mstones.push({ header: null, text: t });
                          }
                        });
                        if (curr) mstones.push(curr);

                        return mstones.map((m, i) => {
                          if (!m.header) return <p key={i} className="text-slate-300 text-sm">{m.text}</p>;
                          
                          const percMatch = m.header.match(/\((.*?)\)/);
                          const perc = percMatch ? percMatch[1] : "Est.";
                          const cleanHeader = m.header.replace(/\(.*?\)/, '').replace(/Milestone \d+:/i, '').replace(/^- /, '').trim();
                          const indexNum = mstones.filter(curr => curr.header).indexOf(m) + 1;

                          return (
                            <div key={i} className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition shadow-inner">
                              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20 shadow-sm text-sm">
                                    0{indexNum}
                                  </div>
                                  <h4 className="text-white font-bold tracking-wide">{cleanHeader || "Project Stage"}</h4>
                                </div>
                                <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 sm:px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
                                  {perc} Alloc.
                                </span>
                              </div>
                              <div className="space-y-2.5 pl-14">
                                {m.bullets.map((b: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0"></div>
                                    <p className="text-sm text-slate-400 leading-relaxed">{b}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lines.join('\n').trim().split('\n').map((line, i) => {
                        const t = line.trim();
                        if (!t) return null;
                        if (t.startsWith('-')) {
                          return (
                            <div key={i} className="flex items-start gap-3 text-slate-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-2 flex-shrink-0"></div>
                              <p className="text-sm leading-relaxed">{t.replace(/^- /, '')}</p>
                            </div>
                          );
                        }
                        return <p key={i} className="text-slate-300 text-sm leading-relaxed">{t}</p>;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Escrow Health Widget */}
        <section className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden group self-start lg:sticky lg:top-6">
          {(() => {
            const escrowBalance = milestones
              .filter(m => ['funded', 'submitted', 'approved', 'disputed'].includes(m.status))
              .reduce((sum, m) => sum + m.amount, 0);
            
            const isFunded = escrowBalance > 0;

            return (
              <>
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600/10 ${isFunded ? 'to-emerald-600/10' : 'to-amber-600/10'} blur-xl transition-colors duration-500`}></div>
                
                <div className={`w-28 h-28 rounded-full border-4 ${isFunded ? 'border-emerald-500/20' : 'border-amber-500/20'} flex flex-col items-center justify-center relative mb-6 transition-colors duration-500`}>
                  {isFunded ? (
                    <svg className="w-8 h-8 text-emerald-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-amber-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`text-[10px] uppercase font-bold ${isFunded ? 'text-emerald-500' : 'text-amber-500'} tracking-wider`}>
                    {isFunded ? 'Secured' : 'Awaiting'}
                  </span>
                  {isFunded && <div className="absolute inset-0 rounded-full border-emerald-400/50 animate-ping" style={{ animationDuration: '3s' }}></div>}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Live Escrow Balance</h3>
                <p className="text-3xl font-bold text-white mb-3">₹{escrowBalance.toLocaleString("en-IN")}</p>
                <p className="text-center text-xs text-slate-400 leading-relaxed px-2">
                  {isFunded 
                    ? "This exact amount is currently secured in a neutral third-party trust, ready for release upon approval." 
                    : "Your vault is currently empty. Fund a milestone payload below to securely bond it."}
                </p>
              </>
            );
          })()}
        </section>
      </div>

      {/* Milestones Pipeline */}
      <section className="glass-card p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-xl font-bold text-white">Milestone Pipeline</h2>
          <button onClick={() => setShowMilestoneForm(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition flex items-center justify-center gap-2 bg-indigo-500/10 px-5 py-2.5 rounded-lg border border-indigo-500/20 w-full sm:w-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Milestone
          </button>
        </div>

        {/* Milestone Creation Modal */}
        {showMilestoneForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-indigo-500/20 transform animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Construct Milestone</h3>
                <button onClick={() => setShowMilestoneForm(false)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block tracking-wider">Milestone Description</label>
                  <input 
                    type="text" 
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                    className="input-glass w-full rounded-xl p-3.5 text-sm border-indigo-500/20 bg-indigo-500/5 text-white placeholder-slate-500" 
                    placeholder="e.g. Design & UI Wireframes" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block tracking-wider">Fractional Value (INR)</label>
                  <input 
                    type="number" 
                    value={newMilestone.amount}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, amount: e.target.value }))}
                    className="input-glass w-full rounded-xl p-3.5 text-sm border-indigo-500/20 bg-indigo-500/5 text-white placeholder-slate-500" 
                    placeholder="e.g. 5000" 
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setShowMilestoneForm(false)} className="px-5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 transition font-medium text-sm">Cancel</button>
                <button onClick={submitMilestone} disabled={isCreating} className="btn-primary px-5 py-2.5 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] text-sm disabled:opacity-50">
                  {isCreating ? "Constructing..." : "Add Milestone"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Work Submission Modal */}
        {submitModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-indigo-500/20 transform animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Submit Work</h3>
                <button onClick={() => setSubmitModal({ isOpen: false, milestoneId: "" })} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block tracking-wider">Proof of Work (URL)</label>
                  <input 
                    type="text" 
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="input-glass w-full rounded-xl p-3.5 text-sm border-indigo-500/20 bg-indigo-500/5 text-white placeholder-slate-500" 
                    placeholder="e.g. GitHub PR, Figma Link, Google Drive" 
                  />
                  <p className="text-xs text-slate-500 mt-2">The client will review this link before releasing the escrowed funds.</p>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setSubmitModal({ isOpen: false, milestoneId: "" })} className="px-5 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 transition font-medium text-sm">Cancel</button>
                <button onClick={handleSubmitWork} disabled={isSubmittingWork} className="btn-primary px-5 py-2.5 rounded-xl font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] text-sm disabled:opacity-50">
                  {isSubmittingWork ? "Submitting..." : "Submit for Review"}
                </button>
              </div>
            </div>
          </div>
        )}

        {milestones.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl bg-slate-900/50">
            <svg className="w-12 h-12 text-slate-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-slate-400 font-medium">No milestones constructed yet.</p>
            <p className="text-sm text-slate-500 mt-1">Break this project down to secure fractional payments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((ms, index) => (
              <div key={ms._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20 text-sm">
                    0{index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{ms.title}</h4>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{ms.status || 'Draft'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 self-stretch md:self-auto border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 pl-0 md:pl-6 w-full md:w-auto mt-4 md:mt-0 justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Release Value</p>
                    <p className="text-white font-bold whitespace-nowrap">₹{ms.amount.toLocaleString("en-IN")}</p>
                  </div>
                  
                  {ms.status === 'draft' ? (
                    <button onClick={() => handleFundEscrow(ms._id)} className="btn-primary px-5 py-2.5 rounded-xl font-bold text-white text-sm whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.2)]">Fund into Escrow</button>
                  ) : ms.status === 'funded' ? (
                    <div className="flex gap-2 items-center">
                      <span className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 whitespace-nowrap h-10">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Secure
                      </span>
                      <button onClick={() => setSubmitModal({ isOpen: true, milestoneId: ms._id })} className="btn-primary px-5 py-2.5 rounded-xl font-bold text-white text-sm whitespace-nowrap h-10 flex items-center">Submit Work</button>
                    </div>
                  ) : ms.status === 'submitted' ? (
                    <span className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-bold whitespace-nowrap flex items-center justify-center">In Review</span>
                  ) : ms.status === 'cleared' || ms.status === 'released' || ms.status === 'approved' ? (
                    <div className="text-right flex flex-col items-end">
                      <span className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-slate-300 mb-1">Cleared</span>
                      <p className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(ms.updatedAt || Date.now()).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ) : (
                    <button className="px-5 py-2.5 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all text-sm whitespace-nowrap">View Activity</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
