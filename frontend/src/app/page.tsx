"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Lock } from "lucide-react";
import LogoLock from "@/components/three/LogoLock";
import { VaultHero } from "@/components/three/VaultHero";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#060b14]">
      {/* Header - Fixed to top for visibility over 3D scene */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 max-w-7xl w-full mx-auto backdrop-blur-md bg-black/5">
        <div className="flex items-center gap-3">
          <LogoLock />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">EscrowFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[var(--text-secondary)] font-medium">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[var(--text-secondary)] hover:text-white font-medium transition">
            Sign In
          </Link>
          <Link href="/signup">
            <Button className="h-10 px-6 rounded-xl">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Full Screen 3D Experience */}
      <VaultHero />

      {/* Additional Sections below the fold */}
      <main className="relative z-20 bg-[#060b14]">
        <div id="features" className="max-w-7xl mx-auto px-6 py-32 grid md:grid-cols-3 gap-8">
          <GlassCard glow="blue" className="p-10 border-white/[0.08]">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20">
              <Lock className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Smart Escrow Vault</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-base font-medium">
              Clients deposit funds upfront. Freelancers work with peace of mind knowing the money is secured and ready in our cryptographically bonded vault.
            </p>
          </GlassCard>
          
          <GlassCard glow="violet" className="p-10 border-white/[0.08]">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20">
              <Zap className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Milestone Based</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-base font-medium">
              Break down large projects into manageable milestones. Review work and release payments incrementally with one-click approval.
            </p>
          </GlassCard>

          <GlassCard glow="none" className="p-10 border-white/[0.08]">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Dispute Resolution</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed text-base font-medium">
              If things go wrong, our built-in dispute resolution system ensures fair mediation and algorithmic fund routing for total peace of mind.
            </p>
          </GlassCard>
        </div>

        <footer className="border-t border-white/5 py-12">
           <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 opacity-50">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-white/10" />
               <span className="font-bold text-white">EscrowFlow</span>
             </div>
             <p className="text-xs text-white">© 2026 EscrowFlow Secure Protocol. All rights reserved.</p>
             <div className="flex gap-6 text-xs text-white">
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
