"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    otp: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await api.post("/api/auth/otp/send", { email: formData.email, type: "signup" });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp) return;
    try {
      setLoading(true);
      await api.post("/api/auth/signup", formData);
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <GlassCard className="p-8" glow="violet">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-[var(--text-secondary)]">Join EscrowFlow today</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Full Name</label>
                <Input 
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Email address</label>
                <Input 
                  placeholder="name@company.com" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Password</label>
                <Input 
                  placeholder="••••••••" 
                  type="password" 
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">I am a...</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-[#0d1526] border border-white/[0.08] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_0_3px_rgba(79,142,247,0.15)] transition-all"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="client">Client (Hiring)</option>
                  <option value="freelancer">Freelancer (Working)</option>
                </select>
              </div>

              <Button type="submit" isLoading={loading} className="w-full">
                Continue
              </Button>

              <p className="text-center text-sm text-[var(--text-secondary)] mt-2">
                Already have an account?{" "}
                <a href="/login" className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:underline transition-colors">
                  Sign in
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifySignup} className="flex flex-col gap-4">
              <div className="text-center mb-4">
                <p className="text-sm text-[var(--text-secondary)]">We sent a 6-digit code to</p>
                <p className="font-medium">{formData.email}</p>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">Verification Code</label>
                <Input 
                  placeholder="123456" 
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value})}
                  required
                  className="text-center text-2xl tracking-[0.5em]"
                />
              </div>

              <Button type="submit" isLoading={loading} className="w-full mt-4">
                Create Account
              </Button>
              
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors mt-2"
              >
                Back
              </button>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
