"use client";

import { motion } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "blue" | "violet" | "emerald" | "none";
  hover?: boolean;
}

export function GlassCard({ children, className = "", glow = "none", hover = true, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`
        relative rounded-2xl border border-white/[0.06]
        bg-[var(--bg-glass)] backdrop-blur-xl
        ${glow === "blue" ? "shadow-[var(--glow-blue)]" : ""}
        ${glow === "violet" ? "shadow-[var(--glow-violet)]" : ""}
        ${glow === "emerald" ? "shadow-[var(--glow-emerald)]" : ""}
        ${className}
      `}
      {...props as any}
    >
      {/* Inner gradient highlight at top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
      {children}
    </motion.div>
  );
}
