"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Briefcase, Wallet, CreditCard, Download, ArrowRight, Calendar, Plus, CheckCircle2, Clock, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CustomStatCard = ({ icon: Icon, title, value, badgeText, badgeColor, iconColor, chartColor }: any) => (
  <GlassCard className="p-6 flex flex-col justify-between relative overflow-hidden group border border-white/[0.05] bg-[#0a0e17]/80">
    <div className="flex items-center gap-3 mb-6 relative z-10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${iconColor}15` }}>
         <Icon size={20} style={{ color: iconColor }} />
      </div>
      <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
    </div>
    
    <div className="flex items-end justify-between relative z-10">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{value}</h3>
        <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold w-fit" style={{ color: badgeColor }}>
          {badgeText}
        </div>
      </div>
      <svg className="w-24 h-12 opacity-80 mix-blend-screen" viewBox="0 0 100 40">
        <path d="M0,40 Q10,35 20,35 T40,25 T60,20 T80,10 T100,5" fill="none" stroke={chartColor} strokeWidth="2.5" />
        <circle cx="100" cy="5" r="3.5" fill={chartColor} className="drop-shadow-[0_0_8px_currentColor]" />
      </svg>
    </div>
    
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
      style={{ background: `radial-gradient(circle at 90% 90%, ${chartColor}15, transparent 60%)` }} 
    />
  </GlassCard>
);

export default function FreelancerDashboard() {
  const [marketplaceProjects, setMarketplaceProjects] = useState<any[]>([]);
  const [user, setUser] = useState({ name: "Freelancer" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any[]>("/api/marketplace").catch(() => []),
      api.get<any>("/api/users/profile").catch(() => null)
    ]).then(([market, profile]) => {
      setMarketplaceProjects(market || []);
      if (profile && profile.name) setUser({ name: profile.name });
      setLoading(false);
    });
  }, []);

  const handleApply = async (id: string) => {
    try {
      await api.post(`/api/projects/${id}/apply`);
      toast.success("Successfully applied for project!");
      setMarketplaceProjects(prev => prev.filter(p => p._id !== id));
    } catch (e: any) {
      toast.error(e.message || "Failed to apply");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pt-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <p className="text-[var(--text-secondary)] text-sm mb-1 font-medium">Welcome back, {user.name.split(' ')[0]} 👋</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Freelancer <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9d4edd] to-[#c77dff]">Hub</span>
          </h1>
          <p className="text-[var(--text-secondary)] mt-3">Find new opportunities and manage your ongoing work.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2">
            <Download size={18} className="text-[#9d4edd]" />
            Earnings Report
          </Button>
          <Button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7209b7] to-[#9d4edd] hover:from-[#560bad] hover:to-[#7209b7] text-white border-0 shadow-[0_0_20px_rgba(157,78,221,0.3)] flex items-center gap-2 font-bold text-md transition-all group">
            Find Projects
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <CustomStatCard 
          icon={Briefcase} 
          title="Active Contracts" 
          value="1" 
          badgeText="+0 this month" 
          badgeColor="#8a99a8" 
          iconColor="#4f8ef7" 
          chartColor="#4f8ef7" 
        />
        <CustomStatCard 
          icon={Wallet} 
          title="Earnings (This Month)" 
          value="₹45,000" 
          badgeText="↑ 18.4% this month" 
          badgeColor="#c77dff" 
          iconColor="#9d4edd" 
          chartColor="#c77dff" 
        />
        <CustomStatCard 
          icon={CreditCard} 
          title="Pending Payments" 
          value="₹12,000" 
          badgeText="2 payments" 
          badgeColor="#06b6d4" 
          iconColor="#06b6d4" 
          chartColor="#06b6d4" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Marketplace Projects */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-8 h-full bg-[#0a0e17]/60 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#9d4edd]/10 flex items-center justify-center border border-[#9d4edd]/20">
                  <Briefcase size={22} className="text-[#c77dff]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Marketplace Opportunities</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Available projects waiting for your expertise.</p>
                </div>
              </div>
              <Button variant="ghost" className="text-sm px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5">
                View All &gt;
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#9d4edd] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : marketplaceProjects.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center relative bg-[#04060a]/50 rounded-2xl border border-white/[0.02] overflow-hidden">
                {/* Background Grid & Glow */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-[#4f8ef7]/10 rounded-full blur-[60px]" />
                
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  {/* Glowing 3D Rings */}
                  <div className="absolute bottom-4 w-48 h-12 border border-[#4f8ef7]/40 rounded-[100%] shadow-[0_0_30px_rgba(79,142,247,0.3)_inset]" style={{ transform: 'rotateX(60deg)' }} />
                  <div className="absolute bottom-6 w-32 h-8 border border-[#4f8ef7]/60 rounded-[100%]" style={{ transform: 'rotateX(60deg)' }} />
                  
                  <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <Briefcase size={80} strokeWidth={1.5} className="text-[#4f8ef7] drop-shadow-[0_10px_30px_rgba(79,142,247,0.8)] fill-[#4f8ef7]/20" />
                  </motion.div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 relative z-10">No new projects available right now.</h3>
                <p className="text-sm text-[var(--text-secondary)] relative z-10">Check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {marketplaceProjects.map(p => (
                  <div key={p._id} className="p-6 rounded-2xl border border-white/[0.05] bg-[#0c121e] hover:border-[#9d4edd]/40 hover:bg-[#111726] transition-all group cursor-pointer shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white group-hover:text-[#c77dff] transition-colors line-clamp-1 text-base">{p.title}</h3>
                      <span className="text-[#c77dff] font-bold text-sm whitespace-nowrap ml-3">₹{p.budget?.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge className="bg-white/[0.03] text-[var(--text-muted)] border border-white/[0.05]">React.js</Badge>
                      <Badge className="bg-white/[0.03] text-[var(--text-muted)] border border-white/[0.05]">Node.js</Badge>
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] ml-auto">
                        <Clock size={12} />
                        <span>Est. 2-4 weeks</span>
                      </div>
                    </div>

                    <Button onClick={() => handleApply(p._id)} className="w-full text-sm py-3 font-semibold bg-white/5 border border-white/10 hover:bg-[#9d4edd] hover:text-white hover:border-[#9d4edd] transition-colors rounded-xl">
                      Apply Now
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Upcoming Milestones */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 h-full bg-[#0a0e17]/80 border border-white/[0.05]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center border border-[#06b6d4]/20 shrink-0">
                  <Calendar size={16} className="text-[#06b6d4]" />
                </div>
                <h2 className="text-lg font-bold text-white">Upcoming Milestones</h2>
              </div>
              <Button variant="ghost" className="text-xs px-3 h-8 border border-white/10 rounded-lg hover:bg-white/5">
                View All &gt;
              </Button>
            </div>
            
            <div className="p-6 rounded-2xl bg-[#111726]/80 border border-white/[0.05] shadow-xl relative overflow-hidden group">
              <div className="flex justify-between items-center mb-5 relative z-10">
                <h3 className="text-lg font-bold text-white">API Integration</h3>
                <Badge className="bg-[#4f8ef7]/20 text-[#4f8ef7] border-0 px-3 py-1 text-xs">In Progress</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6 relative z-10">
                <Calendar size={14} />
                <span>Due in 2 days</span>
              </div>
              
              <div className="flex flex-col gap-3 mb-6 relative z-10">
                <div className="flex items-center text-sm">
                  <span className="text-[var(--text-muted)] w-20">Project:</span>
                  <span className="text-white/90">SaaS Platform</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-[var(--text-muted)] w-20">Amount:</span>
                  <span className="text-white/90">₹12,000</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4f8ef7] w-[60%] rounded-full shadow-[0_0_10px_#4f8ef7]" />
                </div>
                <span className="text-xs font-medium text-white/90">60%</span>
              </div>
              
              <Button className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white py-2.5 flex justify-between px-4 rounded-xl transition-all relative z-10">
                <span className="text-sm font-medium">View Details</span>
                <span className="text-[var(--text-muted)]">&gt;</span>
              </Button>
            </div>

            <Button className="w-full mt-6 bg-transparent hover:bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#06b6d4] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
              <Plus size={18} />
              Submit Work
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
