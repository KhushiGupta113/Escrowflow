import { PageShell } from "@/components/page-shell";

export default function WalletPage() {
  return (
    <PageShell title="Escrow Wallet" subtitle="Manage your funds and transactions securely">
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="glass-card col-span-2 p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
            <div>
              <p className="text-slate-400 font-medium mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold text-white tracking-tight">₹4,32,000</h2>
            </div>
            <div className="flex gap-3">
              <button className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-2.5 font-medium text-white transition">Withdraw</button>
              <button className="btn-primary rounded-xl px-5 py-2.5 font-semibold text-white transition">Add Funds</button>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <svg className="w-5 h-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Received from Project X</p>
                    <p className="text-xs text-slate-400">Today, 2:45 PM</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-400">+₹45,000</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Payment Methods</h3>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 relative overflow-hidden mb-4">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">Connected Bank</p>
            <p className="text-white font-bold text-xl mb-4">•••• •••• •••• 4209</p>
            <div className="flex justify-between items-center text-sm text-indigo-200">
              <span>HDFC Bank</span>
              <span className="px-2 py-1 bg-indigo-500/20 rounded text-xs">Primary</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 border-dashed bg-white/5 hover:bg-white/10 p-4 text-slate-300 font-medium transition mt-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Link another account
          </button>
        </article>
      </div>
    </PageShell>
  );
}
