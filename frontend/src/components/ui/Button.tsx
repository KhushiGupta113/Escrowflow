"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  isLoading?: boolean;
}

export function Button({ children, variant = "primary", isLoading, className = "", ...props }: ButtonProps) {
  let bgClass = "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white";
  let hoverClass = "hover:shadow-[var(--glow-blue)]";
  
  if (variant === "secondary") {
    bgClass = "bg-[var(--bg-elevated)] text-[var(--text-primary)]";
    hoverClass = "hover:bg-white/[0.05]";
  } else if (variant === "outline") {
    bgClass = "bg-transparent border border-[var(--border-subtle)] text-[var(--text-primary)]";
    hoverClass = "hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10";
  } else if (variant === "danger") {
    bgClass = "bg-[var(--accent-danger)]/20 border border-[var(--accent-danger)]/30 text-[var(--accent-danger)]";
    hoverClass = "hover:bg-[var(--accent-danger)]/30";
  } else if (variant === "ghost") {
    bgClass = "bg-transparent text-[var(--text-primary)]";
    hoverClass = "hover:bg-white/[0.05]";
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${bgClass} ${hoverClass} disabled:opacity-50 disabled:pointer-events-none overflow-hidden ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          whileHover={{ translateX: ["-100%", "200%"] }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      )}
      
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        children
      )}
    </motion.button>
  );
}
