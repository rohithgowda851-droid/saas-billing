import { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, CreditCard, Settings, Loader2, Maximize, Minimize, Users, DollarSign, TrendingUp, BarChart3, ChevronRight, X, History, Globe, Smartphone, ShieldCheck, MapPin, Calendar, Clock, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Sidebar from './Sidebar';
import RevenueChart from './RevenueChart';
import { useAuth } from '../lib/AuthContext';

export default function AdminPanel() {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminData, setAdminData] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const handleSuspend = async (user: any) => {
    if (!confirm(`Are you sure you want to sever node ${user.name}? This will terminate their active session.`)) return;
    
    setProcessingAction('suspend');
    try {
      const response = await fetch('/api/admin/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      if (response.ok) {
        const result = await response.json();
        // Update local state
        setAdminData((prev: any) => ({
          ...prev,
          users: prev.users.map((u: any) => u.uid === user.uid ? result.user : u)
        }));
        setSelectedUser(result.user);
        alert(`Node ${user.name} has been successfully severed from the core.`);
      }
    } catch (error) {
      console.error("Failed to suspend user:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReset = async (user: any) => {
    if (!confirm(`Initialize core reset for ${user.name}? All current credentials will be invalidated.`)) return;

    setProcessingAction('reset');
    try {
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      if (response.ok) {
        alert(`Core reset sequence initiated for ${user.name}. New synchronization keys dispatched.`);
      }
    } catch (error) {
      console.error("Failed to reset user:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const sendAlert = async (user: any) => {
    setSendingAlert(true);
    try {
      const response = await fetch('/api/admin/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          message: `URGENT: Your ${user.plan} plan has expired. Please renew to maintain access.`
        })
      });
      if (response.ok) {
        alert("Alert dispatched to user terminal.");
      }
    } catch (error) {
      console.error("Failed to send alert:", error);
    } finally {
      setSendingAlert(false);
    }
  };

  // Login history generator with fallback
  const getLoginHistory = (user: any) => {
    if (user.history && user.history.length > 0) return user.history;
    
    // Fallback mock history for existing static users
    return [
      { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), ip: '192.168.1.45', location: 'London, UK', device: 'Chrome / macOS', status: 'Success' },
      { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), ip: '192.168.1.45', location: 'London, UK', device: 'Safari / iPhone', status: 'Success' },
      { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), ip: '45.12.88.21', location: 'Paris, FR', device: 'Firefox / Windows', status: 'Suspicious' },
      { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), ip: '192.168.1.45', location: 'London, UK', device: 'Chrome / macOS', status: 'Success' },
      { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), ip: '192.168.1.12', location: 'Edinburgh, UK', device: 'Chrome / macOS', status: 'Success' },
    ];
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, adminRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/admin/stats')
        ]);
        const dashJson = await dashRes.json();
        const adminJson = await adminRes.json();
        setData(dashJson);
        setAdminData(adminJson);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !adminData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050508] text-slate-500">
        <Loader2 className="w-12 h-12 animate-spin mb-6 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
        <p className="text-[10px] font-black tracking-[0.4em] uppercase font-mono animate-pulse">Elevating Privileges...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050508] font-sans text-slate-400 overflow-hidden relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full" />
        </div>

        <header className="h-20 bg-[#0a0a0f]/80 backdrop-blur-3xl border-b border-white/5 px-8 flex items-center justify-between relative z-20 shadow-2xl">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white tracking-tighter italic font-display">SaaS Billing Control</h1>
            <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-[0.2em]">SaaS Revenue Orchestration Layer</p>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-3 bg-white/5 px-5 py-2 rounded-xl border border-white/10 ring-4 ring-emerald-500/5 shadow-inner">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">System Uplink: Synchronized</span>
            </div>
            <button onClick={toggleFullscreen} className="p-3 text-slate-500 hover:text-violet-400 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 active:scale-95">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-4 bg-white/5 p-1.5 pr-6 rounded-2xl border border-white/5 shadow-2xl">
               <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-white/10">
                 {profile.name.charAt(0)}
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-black text-white tracking-tight uppercase">{profile.name}</span>
                  <span className="text-[9px] font-black text-violet-400/60 uppercase tracking-widest italic">Core Admin</span>
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-8 overflow-y-auto relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-violet-500/30 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Live Operators</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">{adminData.activeLogins}</h3>
                      <div className="flex items-center gap-2 mt-4 text-emerald-400 text-[10px] font-black uppercase tracking-widest italic">
                        <TrendingUp className="w-3.5 h-3.5" /> +12% Delta
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-violet-500/30 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Neural Directory</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter group-hover:text-violet-400 transition-colors">{adminData.totalUsers}</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4 opacity-60">Verified UIDs</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-violet-500/30 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Gross Extraction</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">${adminData.totalRevenue.toLocaleString()}</h3>
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-4 italic">Optimized Q2</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl group hover:border-violet-500/30 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Mean Ticket</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter group-hover:text-violet-400 transition-colors">$64.20</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4 opacity-60">Per settlement</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600 blur-[80px] opacity-10" />
                       <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400/60 mb-8 font-mono italic">Revenue Efficiency Analysis</h2>
                       <RevenueChart data={data?.analytics || []} />
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
                       <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600 blur-[80px] opacity-10" />
                       <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/60 mb-10 font-mono italic">Tier Extraction Weights</h2>
                       <div className="space-y-8 flex-1 flex flex-col justify-center">
                          {Object.entries(adminData.planIncome).map(([plan, income]: [any, any]) => (
                            <div key={plan} className="space-y-3">
                              <div className="flex justify-between items-center group cursor-default">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest transition-colors group-hover:text-violet-400">{plan} Tier</span>
                                <span className="text-xs font-black text-emerald-400 tracking-tighter">${income.toLocaleString()}</span>
                              </div>
                              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${(income/adminData.totalRevenue)*100}%` }}
                                   className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                 />
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                  <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tighter italic">SaaS Node Directory</h2>
                      <p className="text-[10px] text-violet-400/60 font-black uppercase tracking-[0.2em]">Manage registered biological nodes and billing states</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative flex-1 md:w-80">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white outline-none focus:border-violet-500 focus:bg-white/10 transition-all placeholder:text-slate-700 tracking-widest" placeholder="LOCATE BY ID OR ALIAS..." />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#0a0a0f] text-slate-500 uppercase text-[9px] font-black tracking-[0.3em] border-b border-white/5">
                        <tr>
                          <th className="px-10 py-6">Unique Signature</th>
                          <th className="px-10 py-6">SaaS Billing Terminal</th>
                          <th className="px-10 py-6">Operational Tier</th>
                          <th className="px-10 py-6">State</th>
                          <th className="px-10 py-6 text-right">Access</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] divide-y divide-white/5 bg-white/2">
                        {adminData.users.map((u: any) => (
                          <tr 
                            key={u.uid} 
                            onClick={() => setSelectedUser(u)}
                            className="hover:bg-white/5 transition-all cursor-pointer group border-l-2 border-l-transparent hover:border-l-violet-600"
                          >
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-500 font-black text-lg shadow-xl group-hover:border-violet-500/50 group-hover:text-emerald-400 transition-all group-hover:scale-110">
                                   {u.name.charAt(0)}
                                 </div>
                                 <div>
                                   <div className="font-black text-white text-sm tracking-tight uppercase group-hover:text-violet-400 transition-colors">{u.name}</div>
                                   <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter opacity-60">ID: {u.uid}</div>
                                 </div>
                              </div>
                            </td>
                            <td className="px-10 py-8 font-black text-slate-400 tracking-tight italic">{u.email}</td>
                            <td className="px-10 py-8">
                              <span className="px-4 py-1.5 bg-violet-600/10 text-violet-400 border border-violet-600/20 rounded-full text-[9px] font-black tracking-[0.2em] uppercase italic">{u.plan}</span>
                            </td>
                            <td className="px-10 py-8">
                              <span className={cn(
                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.2em] border shadow-2xl",
                                u.status === 'Paid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                u.status === 'Suspended' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                "bg-red-500/10 text-red-500 border-red-500/20"
                              )}>
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full", 
                                  u.status === 'Paid' ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : 
                                  u.status === 'Suspended' ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" :
                                  "bg-red-500 ring-2 ring-red-500/30"
                                )} />
                                {u.status}
                              </span>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <button className="p-3 text-slate-500 group-hover:text-emerald-400 group-hover:bg-white/5 rounded-xl transition-all border border-transparent group-hover:border-white/10">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-mono italic">Global extraction Analytics</h2>
                          <div className="flex gap-4">
                            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest italic">Velocity: +18.4%</span>
                          </div>
                        </div>
                        <RevenueChart data={data?.analytics || []} />
                      </div>

                      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600 blur-[80px] opacity-10" />
                        <div className="p-6 bg-[#0a0a0f] border-b border-white/5 flex justify-between items-center">
                          <h3 className="text-[10px] font-black text-violet-400/60 uppercase tracking-[0.3em] italic">Real-time settlement activity</h3>
                          <button className="text-[10px] font-black text-slate-500 hover:text-emerald-400 transition-all uppercase tracking-widest">Full Ledger</button>
                        </div>
                        <div className="divide-y divide-white/5 bg-white/2">
                          {data?.invoices.slice(0, 5).map((inv: any) => (
                            <div key={inv.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                              <div className="flex items-center gap-5">
                                <div className="w-10 h-10 bg-white/5 text-slate-500 rounded-xl border border-white/10 flex items-center justify-center shadow-xl group-hover:border-violet-500/50 transition-all">
                                  <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white uppercase tracking-tighter group-hover:text-violet-400 transition-colors">{inv.id}</p>
                                  <p className="text-[10px] text-slate-500 font-mono italic uppercase tracking-tighter">{inv.date}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-emerald-400 tracking-tighter">${inv.amount.toFixed(2)}</p>
                                <p className="text-[9px] font-black text-violet-400/60 uppercase tracking-widest leading-none mt-1">{inv.plan} TIER</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6 italic relative z-10">Total ARPU Extraction</h3>
                        <div className="flex items-baseline gap-4 relative z-10">
                          <span className="text-5xl font-black tracking-tighter shadow-xl shadow-black/20">$142.12</span>
                          <span className="text-emerald-400 text-xs font-black leading-none bg-emerald-500/10 px-2 py-1 rounded-full border border-white/10">+4.2%</span>
                        </div>
                        <p className="text-xs text-violet-100/60 mt-4 font-bold leading-relaxed relative z-10">Mean revenue per entity across all neural tiers.</p>
                        
                        <div className="mt-10 space-y-4 relative z-10">
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                              <p className="text-[9px] font-black text-violet-200 uppercase tracking-widest mb-1 opacity-60 italic">Projected MRR (Q3)</p>
                              <p className="text-2xl font-black tracking-tighter">$42,500.00</p>
                           </div>
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                              <p className="text-[9px] font-black text-violet-200 uppercase tracking-widest mb-1 opacity-60 italic">Ecosystem Churn</p>
                              <p className="text-2xl font-black text-emerald-400 tracking-tighter">1.2%</p>
                           </div>
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-600 blur-[80px] opacity-10" />
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4 italic">Security Guardrails</h3>
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Billing Hub: ONLINE</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stripe Node: SYNCED</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tax Oracle: RECKONING</span>
                          </div>
                        </div>
                        <button className="w-full mt-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-emerald-400 transition-all active:scale-95">
                          Configure Gateway
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-12 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full" />
                   <div className="max-w-2xl relative z-10">
                     <h2 className="text-3xl font-black text-white mb-3 tracking-tighter italic italic">System Core Directive</h2>
                     <p className="text-sm text-slate-500 mb-12 font-medium">Override global operational parameters and security synchronization thresholds.</p>
                     
                     <div className="space-y-12">
                        <section className="space-y-6">
                           <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em] italic opacity-60">Identity Enforcement</h3>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                                 <div className="max-w-xs">
                                    <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-violet-400 transition-colors">Neural MFA Required</p>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">Force multi-factor authentication for all privileged neural accounts.</p>
                                 </div>
                                 <div className="w-12 h-6 bg-violet-600 rounded-full relative shadow-[0_0_15px_rgba(139,92,246,0.5)] cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                                 </div>
                              </div>
                              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                                 <div className="max-w-xs">
                                    <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">Session Hardening</p>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">Strict cold-IP matching for active orchestration sessions.</p>
                                 </div>
                                 <div className="w-12 h-6 bg-slate-800 rounded-full relative cursor-pointer group-hover:bg-slate-700 transition-colors">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full shadow-sm" />
                                 </div>
                              </div>
                           </div>
                        </section>

                        <section className="space-y-6">
                           <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] italic opacity-60">Billing Engine Parameters</h3>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Extraction Rate (%)</label>
                                 <input type="text" defaultValue="15.0" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white outline-none focus:border-violet-500 transition-all font-mono" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Grace Horizon (Days)</label>
                                 <input type="text" defaultValue="7" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white outline-none focus:border-violet-500 transition-all font-mono" />
                              </div>
                           </div>
                        </section>

                        <div className="pt-8 flex gap-4">
                           <button className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl active:scale-95">
                              Commit Directives
                           </button>
                           <button className="px-10 py-5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                              Factory Reset Core
                           </button>
                        </div>
                     </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* User Details Sidebar */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-[#050508]/80 backdrop-blur-md z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-[#0a0a0f] border-l border-white/5 shadow-[0_0_100px_rgba(139,92,246,0.2)] z-50 flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-violet-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/10">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight tracking-tighter italic">{selectedUser.name}</h2>
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] italic">{selectedUser.plan} Operative</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10 active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {/* Meta Information */}
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] flex items-center gap-3 italic opacity-60">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Synchronization
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-5 bg-white/2 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 opacity-60">Signature Hash</p>
                      <p className="text-xs font-mono text-white break-all leading-tight tracking-tighter">{selectedUser.uid}</p>
                    </div>
                    <div className="p-5 bg-white/2 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 opacity-60">Link Address</p>
                      <p className="text-xs font-black text-emerald-400 tracking-tight italic">{selectedUser.email}</p>
                    </div>
                    <div className="p-5 bg-white/2 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 opacity-60">Node Activation</p>
                      <p className="text-xs font-black text-white tracking-widest uppercase">{selectedUser.joined}</p>
                    </div>
                    <div className="p-5 bg-white/2 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 opacity-60">Visibility Status</p>
                      <p className="text-xs font-black text-violet-400 uppercase tracking-widest italic animate-pulse">Encoded Profile</p>
                    </div>
                  </div>
                </section>

                {/* Login History */}
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] flex items-center gap-3 italic opacity-60">
                    <History className="w-4 h-4 text-emerald-400" /> Authentication Timeline
                  </h3>
                  <div className="space-y-4">
                    {getLoginHistory(selectedUser).map((log: any) => (
                      <div key={log.id} className="p-5 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between group shadow-xl relative overflow-hidden">
                        {log.status === 'Suspicious' && <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 blur-[40px] opacity-20 transition-opacity group-hover:opacity-40" />}
                        <div className="flex items-center gap-5 relative z-10">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-2xl",
                            log.status === 'Suspicious' ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                          )}>
                            {log.device.includes('iPhone') ? <Smartphone className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="text-xs font-black text-white uppercase tracking-widest group-hover:text-violet-400 transition-colors">{log.device}</p>
                              {log.status === 'Suspicious' && (
                                <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase rounded-full tracking-[0.2em] shadow-[0_0_10px_rgba(220,38,38,0.5)]">Crit Alert</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-[9px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">
                              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {log.location}</span>
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(log.timestamp).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right relative z-10">
                          <p className="text-[10px] font-mono text-slate-400 tracking-tighter">{log.ip}</p>
                          <p className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em] mt-2 italic",
                            log.status === 'Suspicious' ? "text-red-500" : "text-emerald-400"
                          )}>{log.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-4 border border-white/5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:bg-white/5 hover:text-white transition-all shadow-2xl active:scale-[0.98]">
                    Retrieve Archive logs
                  </button>
                </section>

                <section className="pt-8 border-t border-white/5 space-y-5 relative">
                  {selectedUser.status === 'Expired' && (
                    <button 
                      onClick={() => sendAlert(selectedUser)}
                      disabled={sendingAlert}
                      className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:from-emerald-500 hover:to-teal-600 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                    >
                      <Bell className={cn("w-4 h-4", sendingAlert && "animate-bounce")} />
                      {sendingAlert ? "Transmitting..." : "Discharge Renewal Wave"}
                    </button>
                  )}
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleSuspend(selectedUser)}
                      disabled={processingAction !== null}
                      className="flex-1 py-4 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-600 hover:text-white border border-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {processingAction === 'suspend' ? 'Severing...' : 'Sever Node'}
                    </button>
                    <button 
                      onClick={() => handleReset(selectedUser)}
                      disabled={processingAction !== null}
                      className="flex-1 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {processingAction === 'reset' ? 'Resetting...' : 'Reset Core'}
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
