"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BriefcaseBusiness, Wallet, Settings, LogOut, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifs = async () => {
    try {
      const data = await api<any[]>("/api/notifications");
      setNotifications(data || []);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully", { style: { background: "#10b981", color: "#fff", border: "none" } });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-[#030014] text-white">
      {/* Background orbs */}
      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      {/* Futuristic Sidebar */}
      <aside className="w-64 flex-col hidden lg:flex border-r border-white/10 glass-card m-4 mr-0 rounded-2xl relative z-10">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">EscrowFlow</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === "/" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/projects" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === "/projects" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <BriefcaseBusiness className="w-5 h-5" />
            <span className="font-medium">Projects</span>
          </Link>
          <Link href="/wallet" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === "/wallet" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <Wallet className="w-5 h-5" />
            <span className="font-medium">Wallet</span>
          </Link>
          <Link href="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === "/settings" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 relative z-10 w-full overflow-y-auto">
        <header className="mb-8 flex items-center justify-between glass-card px-6 py-4 rounded-2xl relative">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-slate-400 text-sm">{subtitle}</p>
          </div>
          
          <button 
            onClick={() => { setShowNotifs(true); fetchNotifs(); }}
            className="relative rounded-xl p-2.5 transition border text-slate-300 hover:text-white hover:bg-white/10 border-white/5 bg-white/5"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          </button>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Notification Slide Panel */}
      <AnimatePresence>
        {showNotifs && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowNotifs(false)}
              className="fixed inset-0 bg-[#030014]/80 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0f172a] shadow-2xl border-l border-white/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-400" /> Notifications
                </h3>
                <button 
                  onClick={() => setShowNotifs(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-300 font-medium text-lg">You're all caught up!</p>
                    <p className="text-slate-400 text-sm mt-1">Check back later for updates on your escrow transactions.</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    {notifications.map((n, idx) => (
                      <div key={idx} className="p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition block group cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-white group-hover:text-indigo-300 transition">{n.title || "New Activity"}</p>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-4">Just now</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{n.message || "Something happened in your workspace."}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
