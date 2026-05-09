"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BriefcaseBusiness, Wallet, Settings, LogOut, Users, FileText, Activity } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LogoLock from "../three/LogoLock";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string>("client");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const navItems = role === "admin" 
    ? [
        { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/admin/users", label: "Users", icon: Users },
        { href: "/dashboard/admin/disputes", label: "Disputes", icon: FileText },
        { href: "/dashboard/admin/transactions", label: "Transactions", icon: Activity }
      ]
    : [
        { href: `/dashboard/${role}`, label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/projects", label: "Projects", icon: BriefcaseBusiness },
        { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
        { href: "/dashboard/settings", label: "Settings", icon: Settings }
      ];

  return (
    <aside className="w-64 flex-col hidden lg:flex bg-[var(--bg-surface)]/80 backdrop-blur-xl border-r border-white/[0.06] relative z-10">
      <div className="p-6 flex items-center gap-3 border-b border-white/[0.06]">
        <LogoLock />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">EscrowFlow</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                isActive 
                  ? "bg-[var(--bg-elevated)] text-[var(--accent-primary)] shadow-[var(--glow-blue)]" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--accent-primary)] rounded-r-full shadow-[0_0_10px_var(--accent-primary)]" />
              )}
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/[0.06]">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[var(--accent-danger)] hover:bg-[var(--accent-danger)]/10 transition">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
