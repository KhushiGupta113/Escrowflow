"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export function useRealtime(userId?: string, projectId?: string) {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";
    const socket = io(url, { transports: ["websocket"] });
    if (userId) socket.emit("join:user", userId);
    if (projectId) socket.emit("join:project", projectId);
    return () => {
      socket.disconnect();
    };
  }, [projectId, userId]);
}
