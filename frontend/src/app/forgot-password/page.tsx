"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth-layout";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!email) return toast.error("Please enter your email");
    try {
      setSendingOtp(true);
      await api("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ email, type: "forgot_password" })
      });
      setOtpSent(true);
      toast.success("OTP sent to your email!", {
        style: { background: "#10b981", color: "#fff", border: "none" }
      });
    } catch (error: any) {
      toast.error(error.message || "Email not found", {
        style: { background: "#ef4444", color: "#fff", border: "none" }
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword })
      });
      toast.success("Password reset successful! Please login.", {
        style: { background: "#10b981", color: "#fff", border: "none" }
      });
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password", {
        style: { background: "#ef4444", color: "#fff", border: "none" }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive a password reset OTP">
      <form onSubmit={handleReset} className="flex flex-col gap-4">
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
              disabled={sendingOtp}
              className="btn-primary rounded-xl px-4 text-xs font-bold whitespace-nowrap disabled:opacity-50"
            >
              {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
            </button>
          </div>
        </div>

        {otpSent && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-indigo-300 ml-1">OTP Code</label>
              <input 
                className="input-glass rounded-xl p-3.5 border-indigo-500/40" 
                placeholder="6-digit code" 
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">New Password</label>
              <input 
                className="input-glass rounded-xl p-3.5" 
                placeholder="••••••••" 
                type="password" 
                minLength={8}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary mt-2 rounded-xl px-4 py-3.5 font-bold tracking-wide"
            >
              {loading ? "Resetting..." : "Update Password"}
            </button>
          </div>
        )}
        
        <p className="text-center text-sm text-slate-400 mt-2">
          Remembered your password?{" "}
          <a href="/login" className="font-semibold text-white hover:text-indigo-400 hover:underline transition-colors">
            Back to login
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
