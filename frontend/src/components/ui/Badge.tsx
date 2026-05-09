"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  className?: string;
  pulse?: boolean;
}

export function Badge({ children, variant = "default", className = "", pulse = false }: BadgeProps) {
  let colorClass = "bg-white/10 text-white";
  let dotColor = "bg-gray-400";
  
  switch (variant) {
    case "success":
      colorClass = "bg-[var(--accent-success)]/10 text-[var(--accent-success)] border border-[var(--accent-success)]/20";
      dotColor = "var(--accent-success)";
      break;
    case "warning":
      colorClass = "bg-[var(--accent-warning)]/10 text-[var(--accent-warning)] border border-[var(--accent-warning)]/20";
      dotColor = "var(--accent-warning)";
      break;
    case "danger":
      colorClass = "bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] border border-[var(--accent-danger)]/20";
      dotColor = "var(--accent-danger)";
      break;
    case "info":
      colorClass = "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20";
      dotColor = "var(--accent-primary)";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: dotColor }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: dotColor }} />
        </span>
      )}
      {children}
    </span>
  );
}
