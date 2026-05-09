"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AIDrafter() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [budget, setBudget] = useState(50000);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const data = await api.post("/api/ai/generate-brief", { prompt });
      setResult(data);
      toast.success("Project brief generated!");
    } catch (e: any) {
      toast.error(e.message || "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  const parseSuggestedMilestones = (description: string) => {
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
    
    return suggested;
  };

  const handleCreateProject = async () => {
    if (!result) return;
    setCreating(true);
    try {
      // 1. Create the project
      const projData = await api.post<any>("/api/projects", {
        title: result.title,
        description: result.description,
        budget: budget
      });
      
      const projectId = projData._id || projData.project?._id || projData.data?._id;
      if (!projectId) throw new Error("Failed to retrieve new project ID");

      // 2. Parse AI response for milestones
      const milestones = parseSuggestedMilestones(result.description);
      
      // 3. If there are milestones, save them to the DB
      if (milestones.length > 0) {
        // Calculate dynamic amounts based on allocation percentage
        const milestonePromises = milestones.map((m) => {
          const amount = Math.round((budget * parseInt(m.allocation)) / 100);
          return api.post("/api/milestones", {
            projectId,
            title: m.title,
            amount: amount > 0 ? amount : 1000, // Fallback if parsing fails
            description: m.details.join('\n')
          });
        });

        await Promise.all(milestonePromises);
      }

      toast.success("Project and milestones created successfully!");
      router.push(`/dashboard/projects/${projectId}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <GlassCard className="p-6 mb-8 border-[var(--accent-primary)]/20" glow="blue">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
        <h2 className="text-lg font-bold text-white">AI Project Drafter</h2>
      </div>
      
      {!result ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-secondary)]">Describe your project idea, and our AI will draft a complete brief and milestones for you.</p>
          <div className="flex gap-2">
            <input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build a modern landing page for a SaaS product..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all text-white"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button onClick={handleGenerate} isLoading={loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h3 className="font-bold text-white mb-3 text-lg">{result.title}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-medium">
              {result.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
            <div className="flex items-center gap-3">
               <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Budget (₹)</label>
               <input 
                 type="number"
                 className="w-32 bg-[#0B101B] border border-[#1F2937] rounded-md px-3 py-1.5 text-sm focus:border-blue-500 outline-none text-white font-bold transition-all"
                 value={budget}
                 onChange={e => setBudget(Number(e.target.value))}
               />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setResult(null)} disabled={creating}>Reset</Button>
              <Button onClick={handleCreateProject} isLoading={creating} className="bg-[var(--accent-primary)] shadow-lg shadow-indigo-500/20 px-6 font-bold">
                Create Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
