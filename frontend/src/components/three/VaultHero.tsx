"use client";

import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

// --- Main Hero Scene Component ---
export function VaultHero() {
  return (
    <section className="relative w-full min-h-screen flex items-center bg-transparent overflow-hidden pt-20 pb-10">
      
      {/* Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-auto bg-white">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_003132_8b7edcb6-c64d-4a52-a9ca-879942e122ad.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Foreground Content */}
      <div className="max-w-7xl relative z-20 mx-auto px-6 lg:px-8 pointer-events-none w-full">

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8 max-w-xl">
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/20 border border-white/40 w-fit backdrop-blur-md -ml-1"
             >
               <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
               <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-text)]">Autonomous Escrow Protocol</span>
             </motion.div>

             
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="text-5xl sm:text-6xl lg:text-7xl text-[var(--color-text)] leading-[1.05] tracking-tight"
               style={{ fontFamily: 'var(--font-heading)' }}
             >
               Funds released <br />
               <span className="text-[var(--color-accent)]">only when</span> <br />
               work is done.
             </motion.h1>

             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="text-lg sm:text-xl text-[var(--color-text)] leading-relaxed max-w-md opacity-80"
               style={{ fontFamily: 'var(--font-body)' }}
             >
               The smart escrow layer for the modern freelancer. Secure your budget, verify deliverables, and automate payouts in one seamless flow.
             </motion.p>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4 pt-2 pointer-events-auto"
             >
               <Link href="/signup?role=client" className="w-full sm:w-auto">
                 <button className="w-full sm:w-auto px-8 h-12 rounded-full bg-[var(--color-accent)] text-white font-semibold text-sm shadow-[0_4px_24px_rgba(115,66,226,0.28)] hover:scale-105 transition-all flex items-center justify-center gap-2 group">
                   Start as Client <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
               </Link>
               <Link href="/signup?role=freelancer" className="w-full sm:w-auto">
                 <button className="w-full sm:w-auto px-8 h-12 rounded-full bg-[var(--color-login-bg)] text-[var(--color-text)] font-semibold text-sm hover:brightness-95 transition-all flex items-center justify-center">
                   Join as Freelancer
                 </button>
               </Link>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.5 }}
               className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/[0.05]"
             >
                {[
                  { icon: Lock, label: "Non-Custodial", sub: "End-to-end security" },
                  { icon: Zap, label: "Hyper-Speed", sub: "Instant settlement" },
                  { icon: Shield, label: "Built-in Trust", sub: "Dispute mediation" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center sm:flex-col sm:items-start gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#4f8ef7] group-hover:bg-[#4f8ef7]/10 transition-colors">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white tracking-wide mb-0.5">{item.label}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">{item.sub}</p>
                    </div>
                  </div>
                ))}
             </motion.div>
          </div>
          
          {/* Empty column to force text to the left and allow 3D canvas to be visible on the right */}
          <div className="hidden lg:block pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
