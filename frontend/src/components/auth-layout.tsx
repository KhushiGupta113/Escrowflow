"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <>
      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
            <p className="text-slate-400">{subtitle}</p>
          </div>
          
          <div className="glass-card p-8">
            {children}
          </div>
          
          <p className="text-center text-xs text-slate-500 mt-8">
            &copy; {new Date().getFullYear()} EscrowFlow. All rights reserved.
          </p>
        </motion.div>
      </div>
    </>
  );
}
