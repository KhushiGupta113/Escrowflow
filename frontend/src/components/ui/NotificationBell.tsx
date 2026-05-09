"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, unreadCount } = useNotifications();

  return (
    <>
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors z-40"
      >
        <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--accent-primary)] rounded-full"
          />
        )}
      </motion.button>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[400px] bg-[#0c121e] border-l border-white/[0.05] shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-[#4f8ef7]" />
                  <h3 className="font-bold text-white text-lg">Notifications</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-6">
                      <Bell size={28} className="text-[var(--text-muted)]" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">You're all caught up!</h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Check back later for updates on your escrow transactions.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (!n.read) markAsRead(n._id);
                        }}
                        className={`p-4 rounded-xl text-sm cursor-pointer transition-colors hover:bg-white/[0.04] ${
                          !n.read ? "bg-white/[0.02] border-l-2 border-[#4f8ef7]" : "border border-white/[0.02]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-bold ${!n.read ? "text-white" : "text-[var(--text-secondary)]"}`}>
                            {n.title || "Notification"}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] whitespace-nowrap ml-3">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
