"use client";

import { PageShell } from "@/components/page-shell";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

type NotificationRow = {
  _id: string;
  type: string;
  title?: string;
  message: string;
  read: boolean;
  createdAt?: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<NotificationRow[]>("/api/notifications");
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) {
          toast.error("Sign in to see notifications.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell
      title="Notifications"
      subtitle="Milestone submissions, releases, and escrow updates appear here when you’re logged in."
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200/20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white/80 p-8 text-center text-slate-600">
          <p className="font-medium text-slate-800">No notifications yet</p>
          <p className="mt-2 text-sm">
            When a freelancer submits work, you’ll see an entry here. Open a project to review and release payment.
          </p>
          <Link href="/projects" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
            Go to projects
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n._id}
              className={`rounded-xl border p-4 ${
                n.read ? "border-slate-200 bg-white/60" : "border-indigo-200 bg-indigo-50/80"
              }`}
            >
              {n.title && <p className="font-semibold text-slate-900">{n.title}</p>}
              <p className="mt-1 text-sm text-slate-700">{n.message}</p>
              <p className="mt-2 text-xs text-slate-500">
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
