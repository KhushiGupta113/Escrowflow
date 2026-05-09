"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Notification {
  _id: string;
  type: string;
  title?: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const socket = getSocket();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) return [];
      
      try {
        const res: any = await api.get("/api/notifications");
        return res.notifications || [];
      } catch (e) {
        return [];
      }
    },
    refetchInterval: 60000,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("accessToken")
  });

  const notifications: Notification[] = data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (notification: Notification) => {
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
        return [notification, ...old];
      });
    };

    socket.on("notification:new", handleNewNotification);
    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/notifications/read/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<Notification[]>(["notifications"]);
      if (previous) {
        queryClient.setQueryData(
          ["notifications"],
          previous.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    }
  });

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead: (id) => markAsReadMutation.mutate(id)
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
