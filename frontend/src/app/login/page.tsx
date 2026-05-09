"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
        toast.error("Your session has expired. Please sign in again.");
        setHasAlerted(true);
      }
    }
  }, [hasAlerted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post<any>("/api/auth/login", { email, password }) as any;
      const { accessToken, user } = res;
      localStorage.setItem("accessToken", accessToken);
      toast.success("Welcome back!");

      if (user.role === "client") {
        router.push("/dashboard/client");
      } else if (user.role === "freelancer") {
        router.push("/dashboard/freelancer");
      } else if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <GlassCard className="p-8" glow="blue">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-[var(--text-secondary)]">Secure authentication into EscrowFlow</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Email address</label>
              <Input 
                placeholder="name@company.com" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Password</label>
              <Input 
                placeholder="••••••••" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-[-8px]">
              <a href="/forgot-password" title="Reset your password" className="text-sm font-medium text-[var(--accent-primary)] hover:underline transition-colors">
                Forgot password?
              </a>
            </div>
            
            <Button type="submit" isLoading={loading} className="w-full mt-2">
              Sign In
            </Button>
            
            <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
              Don't have an account?{" "}
              <a href="/signup" className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:underline transition-colors">
                Create an account
              </a>
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
