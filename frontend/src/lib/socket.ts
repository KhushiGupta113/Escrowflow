import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
  if (typeof window === "undefined") return null;
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    socket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};
