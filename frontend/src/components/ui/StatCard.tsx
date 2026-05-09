"use client";

import { useMotionValue, useTransform, animate, motion } from "framer-motion";
import { useEffect } from "react";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  glow?: "blue" | "violet" | "none";
}

export function StatCard({ label, value, prefix = "", suffix = "", glow = "none" }: StatCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v).toLocaleString("en-IN")}${suffix}`);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return (
    <GlassCard glow={glow} className="p-6 flex flex-col justify-center">
      <p className="text-sm text-[var(--text-secondary)] mb-1">{label}</p>
      <motion.p className="text-3xl font-bold text-[var(--text-primary)]">{rounded}</motion.p>
    </GlassCard>
  );
}
