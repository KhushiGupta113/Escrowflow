"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-transparent">
      <Sidebar />

      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 relative z-10 w-full overflow-y-auto custom-scrollbar">
        <header className="mb-4 flex items-center justify-end max-w-7xl mx-auto w-full">
          <NotificationBell />
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
