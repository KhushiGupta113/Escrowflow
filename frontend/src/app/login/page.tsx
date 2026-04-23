"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !hasAlerted) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "session_expired") {
        toast.error("Your session has expired. Please sign in again.", { 
          id: "session-expired",
          style: { background: "#6366f1", color: "#fff", border: "none" }
        });
        setHasAlerted(true);
      }
    }
  }, [hasAlerted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api<{ accessToken: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("accessToken", res.accessToken);
      toast.success("Welcome back!", {
        style: { background: "#10b981", color: "#fff", border: "none" }
      });
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to login", {
        style: { background: "#ef4444", color: "#fff", border: "none" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Secure authentication into EscrowFlow">
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Email address</label>
          <input 
            className="input-glass rounded-xl p-3.5" 
            placeholder="name@company.com" 
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
          <input 
            className="input-glass rounded-xl p-3.5" 
            placeholder="••••••••" 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-[-8px]">
          <a href="/forgot-password" title="Reset your password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
            Forgot password?
          </a>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary mt-2 rounded-xl px-4 py-3.5 font-bold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
        
        <p className="text-center text-sm text-slate-400 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="font-semibold text-white hover:text-indigo-400 hover:underline transition-colors">
            Create an account
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
