"use client";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl bg-[#0d1526] border border-white/[0.08]
             text-[var(--text-primary)] placeholder-[var(--text-muted)]
             focus:outline-none focus:border-[var(--accent-primary)]
             focus:shadow-[0_0_0_3px_rgba(79,142,247,0.15)]
             transition-all duration-200 ${props.className || ""}`}
    />
  );
}
