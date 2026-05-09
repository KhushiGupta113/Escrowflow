"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { NotificationsProvider } from "@/hooks/useNotifications";
import { initSocket } from "@/lib/socket";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  useEffect(() => {
    initSocket();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </QueryClientProvider>
  );
}
