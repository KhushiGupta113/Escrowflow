"use client";

import { AIDrafter } from "@/components/ui/AIDrafter";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateProjectPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="p-0 hover:bg-transparent h-auto text-[var(--text-secondary)] hover:text-white flex items-center gap-2 text-sm font-medium transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create New Project</h1>
          <p className="text-[var(--text-secondary)] mt-2">Initialize your contract by drafting a brief or using AI suggestions.</p>
        </div>
      </div>

      <AIDrafter />

      <GlassCard className="p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-4 hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer group">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
        </div>
        <div>
          <h3 className="font-bold text-white">Manual Creation</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">Want to set everything up yourself? Click here to start from scratch.</p>
        </div>
      </GlassCard>
    </div>
  );
}

