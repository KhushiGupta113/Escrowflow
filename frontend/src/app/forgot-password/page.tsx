"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
      await api.post("/api/auth/otp/send", { email, type: "forgot_password" });
      setOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Email not found");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/api/auth/forgot-password", { email, otp, newPassword });
      toast.success("Password reset successful! Please login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <GlassCard className="p-8" glow="blue">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-[var(--text-secondary)]">Enter your email to receive a password reset OTP</p>
          </div>

          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Email address</label>
              <div className="flex gap-2">
                <Input 
                  className="flex-1" 
                  placeholder="name@company.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="px-4 text-xs whitespace-nowrap disabled:opacity-50"
                  variant="outline"
                >
                  {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                </Button>
              </div>
            </div>

            {otpSent && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">OTP Code</label>
                  <Input 
                    placeholder="6-digit code" 
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">New Password</label>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    minLength={8}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  isLoading={loading}
                  className="w-full mt-2"
                >
                  Update Password
                </Button>
              </div>
            )}
            
            <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
              Remembered your password?{" "}
              <a href="/login" className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:underline transition-colors">
                Back to login
              </a>
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
