"use client";

import { PageShell } from "@/components/page-shell";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    bio: "",
    avatar: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api<UserProfile>("/api/users/profile");
      setProfile({
        name: data.name || "",
        email: data.email || "",
        bio: data.bio || "",
        avatar: data.avatar || ""
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          avatar: profile.avatar
        })
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";
  };

  if (isLoading) {
    return (
      <PageShell title="Account Settings" subtitle="Loading your profile...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Account Settings" subtitle="Manage profile, preferences, and security">
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="font-semibold">Settings updated successfully!</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <section>
          <div className="glass-card p-8 min-h-[500px]">
            <h2 className="text-xl font-bold text-white mb-6">Profile Details</h2>
            
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center border-4 border-[#030014] overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{getInitials(profile.name)}</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Profile Picture</h3>
                <p className="text-sm text-slate-400 mb-3">Upload a new avatar. Larger image will be resized automatically.</p>
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                <button onClick={handleUploadImage} className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-white transition">
                  Upload Image
                </button>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSave}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                <input 
                  className="input-glass rounded-xl p-3" 
                  value={profile.name} 
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="flex flex-col gap-1.5 opacity-60 cursor-not-allowed">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                <input 
                  className="input-glass rounded-xl p-3" 
                  value={profile.email} 
                  disabled
                  type="email" 
                />
                <p className="text-[10px] text-slate-500 ml-1">Email cannot be changed manually for security reasons.</p>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Bio</label>
                <textarea 
                  className="input-glass rounded-xl p-3 h-24 resize-none" 
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                <button type="submit" disabled={isSaving} className="btn-primary rounded-xl px-6 py-2.5 font-bold text-white transition flex items-center gap-2">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
