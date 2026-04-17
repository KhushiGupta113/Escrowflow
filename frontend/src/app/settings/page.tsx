"use client";

import { PageShell } from "@/components/page-shell";
import { useState, useRef } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile Details");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = ["Profile Details"];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleUploadImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }, 1000);
    }
  };

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

      <div className="grid gap-6 md:grid-cols-3">
        <aside className="glass-card p-4 h-fit">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-left rounded-xl transition font-medium ${
                  activeTab === tab 
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>

        <section className="col-span-2">
          <div className="glass-card p-8 min-h-[500px]">
            <h2 className="text-xl font-bold text-white mb-6">Profile Details</h2>
            
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center border-4 border-[#030014]">
                  <span className="text-2xl font-bold text-white">JD</span>
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
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300 ml-1">First Name</label>
                  <input className="input-glass rounded-xl p-3" defaultValue="John" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300 ml-1">Last Name</label>
                  <input className="input-glass rounded-xl p-3" defaultValue="Doe" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                <input className="input-glass rounded-xl p-3" defaultValue="john@example.com" type="email" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Bio</label>
                <textarea className="input-glass rounded-xl p-3 h-24 resize-none" defaultValue="Product designer looking for high quality freelance work." />
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
