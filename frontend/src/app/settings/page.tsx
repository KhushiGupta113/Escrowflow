import { PageShell } from "@/components/page-shell";

export default function SettingsPage() {
  return (
    <PageShell title="Account Settings" subtitle="Manage profile, preferences, and security">
      <div className="grid gap-6 md:grid-cols-3">
        <aside className="glass-card p-4 h-fit">
          <nav className="flex flex-col gap-1">
            <button className="px-4 py-3 text-left rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium transition">
              Profile Details
            </button>
            <button className="px-4 py-3 text-left rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition">
              Security
            </button>
            <button className="px-4 py-3 text-left rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition">
              Notifications
            </button>
            <button className="px-4 py-3 text-left rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition">
              Billing & Tax
            </button>
          </nav>
        </aside>

        <section className="col-span-2">
          <div className="glass-card p-8">
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
                <button className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-white transition">Upload Image</button>
              </div>
            </div>

            <form className="space-y-5">
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
                <button type="button" className="btn-primary rounded-xl px-6 py-2.5 font-bold text-white transition">Save Changes</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
