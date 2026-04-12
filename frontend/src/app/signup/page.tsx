"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!email) return toast.error("Please enter your email first");
    try {
      setSendingOtp(true);
      await api("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ email, type: "signup" })
      });
      setOtpSent(true);
      toast.success("OTP sent to your email!", {
        style: { background: "#10b981", color: "#fff", border: "none" }
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP", {
        style: { background: "#ef4444", color: "#fff", border: "none" }
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) return toast.error("Please send and verify OTP first");
    
    try {
      setLoading(true);
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role, otp })
      });
      toast.success("Account created! Please log in.", {
        style: { background: "#10b981", color: "#fff", border: "none" }
      });
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up", {
        style: { background: "#ef4444", color: "#fff", border: "none" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the premier freelance escrow marketplace">
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Full name</label>
          <input 
            className="input-glass rounded-xl p-3.5" 
            placeholder="John Doe" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Email address</label>
          <div className="flex gap-2">
            <input 
              className="input-glass flex-1 rounded-xl p-3.5" 
              placeholder="name@company.com" 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || otpSent}
              className="btn-primary rounded-xl px-4 text-xs font-bold whitespace-nowrap disabled:opacity-50"
            >
              {sendingOtp ? "Sending..." : otpSent ? "Resend?" : "Send OTP"}
            </button>
          </div>
        </div>

        {otpSent && (
          <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-medium text-indigo-300 ml-1">Verify OTP</label>
            <input 
              className="input-glass rounded-xl p-3.5 border-indigo-500/40" 
              placeholder="6-digit code" 
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
          <input 
            className="input-glass rounded-xl p-3.5" 
            placeholder="••••••••" 
            type="password" 
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">I want to join as a</label>
          <select 
            className="input-glass rounded-xl p-3.5 text-slate-100 [&>option]:text-slate-900 appearance-none cursor-pointer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="client">Client (Hire talent)</option>
            <option value="freelancer">Freelancer (Find work)</option>
            <option value="admin">Platform Admin</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !otpSent}
          className="btn-primary mt-4 rounded-xl px-4 py-3.5 font-bold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Complete Signup"}
        </button>
        
        <p className="text-center text-sm text-slate-400 mt-2">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-white hover:text-indigo-400 hover:underline transition-colors">
            Sign in here
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
