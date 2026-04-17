"use client";

import { PageShell } from "@/components/page-shell";
import { useState } from "react";

export default function WalletPage() {
  const [balance, setBalance] = useState(432000);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  
  // Validation states for linking account
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [linkError, setLinkError] = useState("");
  
  const handleAddFunds = async () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    
    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_key",
        amount: "500000",
        currency: "INR",
        name: "EscrowFlow",
        description: "Add funds to wallet",
        handler: function (response: any) {
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
          setBalance((prev) => prev + 5000);
        },
        prefill: {
          name: "Test User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: { color: "#6366f1" }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };

    document.body.appendChild(script);
  };

  const executeWithdrawal = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setShowWithdrawModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      if (balance >= 5000) {
        setBalance((prev) => prev - 5000);
      }
    }, 2000);
  };

  const executeLinkAccount = () => {
    // Validation
    if (!accountNumber.trim() || !ifscCode.trim()) {
      setLinkError("Both Account Number and IFSC Code are required.");
      return;
    }
    if (accountNumber.trim().length < 8) {
      setLinkError("Please enter a valid Account Number.");
      return;
    }
    
    setLinkError("");
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      setShowLinkAccountModal(false);
      setAccountNumber("");
      setIfscCode("");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }, 2000);
  };

  return (
    <PageShell title="Escrow Wallet" subtitle="Manage your funds and transactions securely">
      {/* Success Toast */}
      {showSuccessMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="font-semibold">Action completed successfully!</span>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-indigo-500/20 transform animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <svg className="w-6 h-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                <p className="text-sm text-slate-400">to HDFC Bank ending in 4209</p>
              </div>
            </div>
            
            <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Withdrawal Amount</span>
                <span className="text-white font-semibold">₹5,000</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Processing Fee</span>
                <span className="text-emerald-400">Free</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowWithdrawModal(false)} disabled={isWithdrawing} className="flex-1 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 py-3 font-medium text-white transition disabled:opacity-50">Cancel</button>
              <button onClick={executeWithdrawal} disabled={isWithdrawing} className="flex-1 btn-primary rounded-xl py-3 font-semibold text-white transition flex items-center justify-center gap-2 disabled:opacity-80">
                {isWithdrawing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Account Modal */}
      {showLinkAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-indigo-500/20 transform animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-white mb-2">Link Bank Account</h3>
            <p className="text-sm text-slate-400 mb-6">Securely link your bank account to start receiving funds directly.</p>
            
            {linkError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {linkError}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Account Number <span className="text-red-400">*</span></label>
                <input 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={`input-glass rounded-xl p-3 text-sm placeholder:text-slate-500 ${linkError && !accountNumber ? "border-red-500/50" : ""}`} 
                  placeholder="0000 0000 0000 0000" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">IFSC Code <span className="text-red-400">*</span></label>
                <input 
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className={`input-glass rounded-xl p-3 text-sm placeholder:text-slate-500 ${linkError && !ifscCode ? "border-red-500/50" : ""}`} 
                  placeholder="HDFC0001234" 
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowLinkAccountModal(false);
                  setLinkError("");
                  setAccountNumber("");
                  setIfscCode("");
                }} 
                disabled={isLinking} 
                className="flex-1 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 py-3 font-medium text-white transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button onClick={executeLinkAccount} disabled={isLinking} className="flex-1 btn-primary rounded-xl py-3 font-semibold text-white transition flex items-center justify-center gap-2 disabled:opacity-80">
                {isLinking ? "Verifying..." : "Link Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="glass-card col-span-2 p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
            <div>
              <p className="text-slate-400 font-medium mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold text-white tracking-tight">₹{balance.toLocaleString('en-IN')}</h2>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowWithdrawModal(true)} className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-2.5 font-medium text-white transition">Withdraw</button>
              <button onClick={handleAddFunds} className="btn-primary rounded-xl px-5 py-2.5 font-semibold text-white transition">Add Funds</button>
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
          <button onClick={() => setShowLinkAccountModal(true)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 border-dashed bg-white/5 hover:bg-white/10 p-4 text-slate-300 font-medium transition mt-auto">
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
