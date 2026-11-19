"use client";

import Link from "next/link";
import { ShieldCheck, Zap, Lock } from "lucide-react";
import LogoLock from "@/components/three/LogoLock";
import { VaultHero } from "@/components/three/VaultHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--color-login-bg)]">
      {/* Header - Fixed to top for visibility over video */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <LogoLock />
          <span className="text-2xl font-bold text-[var(--color-text)]">EscrowFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[var(--color-text)] font-medium opacity-80">
          <a href="#features" className="hover:opacity-100 transition">Features</a>
          <a href="#how-it-works" className="hover:opacity-100 transition">How it Works</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[var(--color-text)] hover:opacity-100 font-medium transition opacity-80">
            Sign In
          </Link>
          <Link href="/signup">
            <Button className="h-10 px-6 rounded-full bg-[var(--color-accent)] text-white hover:scale-105 transition-transform shadow-[0_4px_24px_rgba(115,66,226,0.28)]">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Full Screen 3D Experience */}
      <VaultHero />

      {/* Additional Sections below the fold */}
      <main className="relative z-20 bg-[var(--color-login-bg)] text-[var(--color-text)]">
        <div id="features" className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-3 gap-8">
          <GlassCard glow="blue" className="p-10 border-black/5 bg-white/50 shadow-sm backdrop-blur-md rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#7342E2]/10 flex items-center justify-center mb-8 border border-[#7342E2]/20">
              <Lock className="w-7 h-7 text-[#7342E2]" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-[var(--color-text)]">Smart Escrow Vault</h3>
            <p className="opacity-80 leading-relaxed text-base">
              Clients deposit funds upfront. Freelancers work with peace of mind knowing the money is secured and ready in our cryptographically bonded vault.
            </p>
          </GlassCard>
          
          <GlassCard glow="violet" className="p-10 border-black/5 bg-white/50 shadow-sm backdrop-blur-md rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#7342E2]/10 flex items-center justify-center mb-8 border border-[#7342E2]/20">
              <Zap className="w-7 h-7 text-[#7342E2]" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-[var(--color-text)]">Milestone Based</h3>
            <p className="opacity-80 leading-relaxed text-base">
              Break down large projects into manageable milestones. Review work and release payments incrementally with one-click approval.
            </p>
          </GlassCard>

          <GlassCard glow="none" className="p-10 border-black/5 bg-white/50 shadow-sm backdrop-blur-md rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#7342E2]/10 flex items-center justify-center mb-8 border border-[#7342E2]/20">
              <ShieldCheck className="w-7 h-7 text-[#7342E2]" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-[var(--color-text)]">Dispute Resolution</h3>
            <p className="opacity-80 leading-relaxed text-base">
              If things go wrong, our built-in dispute resolution system ensures fair mediation and algorithmic fund routing for total peace of mind.
            </p>
          </GlassCard>
        </div>

        <footer className="border-t border-black/10 py-12">
           <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-[var(--color-text)]/10 flex items-center justify-center">
                 <ShieldCheck className="w-4 h-4 text-[var(--color-text)]" />
               </div>
               <span className="font-bold text-[var(--color-text)]">EscrowFlow</span>
             </div>
             <p className="text-xs text-[var(--color-text)]">© 2026 EscrowFlow Secure Protocol. All rights reserved.</p>
             <div className="flex gap-6 text-xs text-[var(--color-text)]">
               <a href="#">Privacy</a>
               <a href="#">Terms</a>
               <a href="#">Github</a>
             </div>
           </div>
        </footer>
      </main>
    </div>
  );
}
