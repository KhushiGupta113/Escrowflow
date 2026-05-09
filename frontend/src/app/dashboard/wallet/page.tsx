"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export default function WalletPage() {
  const [balance, setBalance] = useState({ available: 0, pending: 0, totalEscrow: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dummy fetch for wallet, we can hook it up later
    setTimeout(() => {
      setBalance({ available: 12000, pending: 45000, totalEscrow: 57000 });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-[var(--text-secondary)]">Manage your funds and withdraw earnings.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard className="p-6" glow="blue">
          <p className="text-sm text-[var(--text-secondary)] mb-1">Available to Withdraw</p>
          <p className="text-3xl font-bold text-white">₹{balance.available.toLocaleString("en-IN")}</p>
          <Button variant="secondary" className="w-full mt-4" disabled={balance.available === 0}>Withdraw</Button>
        </GlassCard>
        
        <GlassCard className="p-6" glow="violet">
          <p className="text-sm text-[var(--text-secondary)] mb-1">Pending Clearance</p>
          <p className="text-3xl font-bold text-white">₹{balance.pending.toLocaleString("en-IN")}</p>
        </GlassCard>
        
        <GlassCard className="p-6">
          <p className="text-sm text-[var(--text-secondary)] mb-1">Total in Escrow</p>
          <p className="text-3xl font-bold text-white">₹{balance.totalEscrow.toLocaleString("en-IN")}</p>
        </GlassCard>
      </div>
    </div>
  );
}
