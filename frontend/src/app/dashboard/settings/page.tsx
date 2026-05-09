"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Bell, CreditCard, Wallet, Link as LinkIcon, Camera, ShieldCheck, Mail, Briefcase, Code, Globe, IndianRupee, Building, Landmark, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ 
    name: "", email: "", bio: "", avatar: "", role: "client", 
    company: "", taxId: "", hourlyRate: "", github: "", linkedin: "" 
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    api.get<any>("/api/users/profile").then((res: any) => {
      if (res) {
        setProfile(prev => ({
          ...prev,
          name: res.name || "",
          email: res.email || "",
          bio: res.bio || "",
          avatar: res.avatar || "",
          role: res.role || "client",
          company: res.company || "",
          taxId: res.taxId || "",
          hourlyRate: res.hourlyRate || "",
          github: res.github || "",
          linkedin: res.linkedin || ""
        }));
      }
    }).catch(console.error).finally(() => setInitialLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.patch("/api/users/profile", profile);
      toast.success("Settings saved successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Profile", icon: User },
    ...(profile.role === "freelancer" ? [
      { id: "professional", label: "Professional Info", icon: Briefcase },
      { id: "payouts", label: "Wallet & Payouts", icon: Wallet }
    ] : [
      { id: "billing", label: "Billing & Company", icon: Building }
    ]),
    { id: "security", label: "Security & Auth", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell }
  ];

  if (initialLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full pt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Account Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your preferences, security, and profile details.</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="flex flex-col gap-2 sticky top-24">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-medium ${
                  isActive 
                    ? "text-white bg-white/10" 
                    : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/20 to-transparent border-l-2 border-[var(--accent-primary)] rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon size={18} className={`relative z-10 ${isActive ? "text-[var(--accent-primary)]" : ""}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "general" && (
                <GlassCard className="p-8">
                  <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/[0.05]">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1d283a] to-[#0a0f1a] border border-white/10 flex items-center justify-center overflow-hidden">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} className="text-white/20" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Camera size={20} className="text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#10b981] rounded-full border-4 border-[#04060a] flex items-center justify-center">
                        <ShieldCheck size={14} className="text-[#04060a]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Profile Picture</h3>
                      <p className="text-sm text-[var(--text-muted)] mt-1 mb-3">Upload a new avatar. Max size 2MB.</p>
                      <button className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors">
                        Upload Image
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Full Name</label>
                      <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} icon={<User size={18} />} placeholder="John Doe" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Email Address</label>
                      <Input value={profile.email} disabled icon={<Mail size={18} />} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-8">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Bio</label>
                    <textarea 
                      value={profile.bio} 
                      onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:bg-white/[0.04] transition-all min-h-[120px] resize-y"
                    />
                  </div>

                  <div className="flex justify-end pt-6 border-t border-white/[0.05]">
                    <Button onClick={handleSave} isLoading={loading} className="px-8">Save General Info</Button>
                  </div>
                </GlassCard>
              )}

              {activeTab === "professional" && profile.role === "freelancer" && (
                <GlassCard className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Professional Profile</h2>
                  
                  <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Hourly Rate (INR)</label>
                      <Input value={profile.hourlyRate} onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})} icon={<IndianRupee size={18} />} placeholder="100" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">GitHub Profile</label>
                      <Input value={profile.github} onChange={(e) => setProfile({...profile, github: e.target.value})} icon={<Code size={18} />} placeholder="https://github.com/username" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">LinkedIn Profile</label>
                      <Input value={profile.linkedin} onChange={(e) => setProfile({...profile, linkedin: e.target.value})} icon={<Globe size={18} />} placeholder="https://linkedin.com/in/username" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-white/[0.05]">
                    <Button onClick={handleSave} isLoading={loading} className="px-8">Save Professional Info</Button>
                  </div>
                </GlassCard>
              )}

              {activeTab === "billing" && profile.role === "client" && (
                <GlassCard className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Company & Billing Details</h2>
                  
                  <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Company Name</label>
                      <Input value={profile.company} onChange={(e) => setProfile({...profile, company: e.target.value})} icon={<Building size={18} />} placeholder="Acme Corp" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Tax ID / VAT Number</label>
                      <Input value={profile.taxId} onChange={(e) => setProfile({...profile, taxId: e.target.value})} icon={<CreditCard size={18} />} placeholder="US-123456789" />
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-start gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
                      <CreditCard size={20} className="text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">Payment Methods</h4>
                      <p className="text-sm text-[var(--text-muted)] mb-3">Add a credit card to seamlessly fund milestones and release payments.</p>
                      <button className="text-sm font-semibold text-[var(--accent-primary)] hover:text-white transition-colors">
                        + Add Payment Method
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-white/[0.05]">
                    <Button onClick={handleSave} isLoading={loading} className="px-8">Save Billing Info</Button>
                  </div>
                </GlassCard>
              )}

              {activeTab === "payouts" && profile.role === "freelancer" && (
                <GlassCard className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Wallet & Payout Settings</h2>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-[#1d283a] to-[#0a0f1a] border border-white/10 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#4f8ef7]/20 flex items-center justify-center">
                          <Wallet size={24} className="text-[#4f8ef7]" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Available Balance</p>
                          <h3 className="text-3xl font-bold text-white">$0.00</h3>
                        </div>
                      </div>
                      <button className="px-5 py-2.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors">
                        Withdraw Funds
                      </button>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">Connect your Paytm, UPI, or Bank Account to receive automatic milestone payouts once verified.</p>
                  </div>

                  <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#00baf2]/20 flex items-center justify-center"><Smartphone size={18} className="text-[#00baf2]" /></div>
                        <div>
                          <p className="font-bold text-white text-sm">Paytm / UPI Connect</p>
                          <p className="text-xs text-[var(--text-muted)]">Instant zero-fee payouts</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold px-4 py-2 rounded-lg bg-[#00baf2] text-black hover:bg-[#00baf2]/80 transition-colors">Setup</button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Landmark size={18} /></div>
                        <div>
                          <p className="font-bold text-white text-sm">Bank Transfer (IMPS/NEFT)</p>
                          <p className="text-xs text-[var(--text-muted)]">Direct to your bank account</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Connect</button>
                    </div>
                  </div>
                </GlassCard>
              )}

              {activeTab === "security" && (
                <GlassCard className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Security & Authentication</h2>
                  
                  <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">Current Password</label>
                      <Input type="password" placeholder="••••••••" icon={<Lock size={18} />} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider ml-1">New Password</label>
                      <Input type="password" placeholder="••••••••" icon={<Lock size={18} />} />
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} className="text-[#10b981]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">Two-Factor Authentication</h4>
                        <p className="text-xs text-[var(--text-muted)]">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#10b981] text-black text-xs font-bold hover:bg-[#10b981]/80 transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-white/[0.05]">
                    <Button className="px-8">Update Password</Button>
                  </div>
                </GlassCard>
              )}

              {activeTab === "notifications" && (
                <GlassCard className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                  <div className="flex flex-col gap-6">
                    {[
                      { title: "Milestone Updates", desc: "Get notified when a milestone is submitted or approved." },
                      { title: "Messages", desc: "Receive an email when you get a new message." },
                      { title: "Payment Alerts", desc: "Alerts for funds deposited or released from escrow." },
                      { title: "Marketing & Newsletter", desc: "Occasional updates on new EscrowFlow features." }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between pb-6 border-b border-white/[0.05] last:border-0 last:pb-0">
                        <div className="pr-8">
                          <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 rounded-full bg-[var(--accent-primary)] cursor-pointer">
                          <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white transition-all shadow-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
