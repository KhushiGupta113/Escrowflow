"use client";

import { ReactNode } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative w-full group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors duration-200 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full ${icon ? "pl-12" : "px-4"} py-3 rounded-xl bg-[#0d1526] border border-white/[0.08]
               text-[var(--text-primary)] placeholder-[var(--text-muted)]
               focus:outline-none focus:border-[var(--accent-primary)]
               focus:shadow-[0_0_0_3px_rgba(79,142,247,0.15)]
               transition-all duration-200 ${className || ""}`}
      />
    </div>
  );
}

