import { useState, useEffect, useMemo } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, CreditCard, Settings, Loader2, Maximize, Minimize, AlertTriangle, RefreshCw, CheckCircle2, Clock, BarChart3, Activity, FileText, Shield, Zap, Save, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Sidebar from './Sidebar';
import StatsGrid from './StatsGrid';
import SubscriptionPlans from './SubscriptionPlans';
import InvoiceTable from './InvoiceTable';
import { useAuth } from '../lib/AuthContext';

export default function UserPanel() {
  const { profile, isAdmin, renewLicense, invoices: realInvoices, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isExpired = profile?.nextRenewal && profile.nextRenewal !== 'Unlimited' && new Date(profile.nextRenewal) < new Date();
  const allInvoices = data ? [...realInvoices, ...data.invoices] : realInvoices;

  const daysRemaining = useMemo(() => {
    if (!profile?.nextRenewal || profile.nextRenewal === 'Unlimited') return null;
    const renewal = new Date(profile.nextRenewal);
    const now = new Date();
    const diffTime = renewal.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [profile?.nextRenewal]);

  const planFeatures = useMemo(() => {
    const plans: any = {
      'Basic': ['1,000 API calls', 'Standard Support', 'Standard VPC Access'],
      'Pro': ['50,000 API calls', 'Priority Support', 'Enhanced Data Isolation'],
      'Enterprise': ['Unlimited calls', 'Dedicated Manager', 'Custom Security Protocol']
    };
    return plans[profile?.plan] || plans['Basic'];
  }, [profile?.plan]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData({
          analytics: [
            { name: 'Jan', revenue: 18900, users: 680 },
            { name: 'Feb', revenue: 21500, users: 740 },
            { name: 'Mar', revenue: 23800, users: 812 },
            { name: 'Apr', revenue: 24560, users: 842 },
          ],
          invoices: []
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050508] text-violet-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-400" />
        <p className="text-sm font-black tracking-[0.3em] uppercase font-mono italic">Syncing Cloud Node...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050508] font-sans text-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden text-white">
        <header className="h-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between shadow-2xl flex-shrink-0 z-20">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black leading-tight tracking-tight font-display">
              SaaS <span className="text-emerald-400">Billing Command</span>
            </h1>
            <p className="text-[10px] text-violet-400/60 font-black uppercase tracking-[0.2em] italic">Personal Billing & Infrastructure Hub</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BILLING_LINK: SECURE</span>
            </div>
            <button 
              onClick={toggleFullscreen}
              className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-xl transition-all border border-white/5"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-4 pl-4 border-l border-white/5">
               <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black uppercase tracking-tight text-white">{profile.name}</span>
                  <span className="text-[9px] font-bold text-violet-400/60 uppercase tracking-widest">Operator</span>
               </div>
               <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl border border-white/20 shadow-xl flex items-center justify-center font-black text-white text-lg overflow-hidden ring-4 ring-white/5">
                 {profile.name.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {isExpired && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Node Cycle Terminated</h4>
                  <p className="text-xs text-emerald-400/80 font-medium">Your subscription has reached its threshold. Syncing halted.</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                   setIsRenewing(true);
                   await renewLicense();
                   setIsRenewing(false);
                }}
                disabled={isRenewing}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-emerald-900/40 active:scale-95"
              >
                {isRenewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Resume Sync
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <StatsGrid />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <section className="bg-[#0a0a0f] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
                        
                        <div className="flex justify-between items-center mb-8">
                           <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400/60 font-mono">Subscription Matrix</h2>
                           <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 flex items-center gap-1.5 backdrop-blur-md">
                             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                             ACTIVE_NODE
                           </div>
                        </div>
                        
                        <div className="space-y-8">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Protocol Tier</p>
                              <p className="text-4xl font-black text-white tracking-tighter">{profile.plan}</p>
                            </div>
                            <div className="text-right space-y-2">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">TTL Remaining</p>
                              <div className="flex items-center justify-end gap-2 text-violet-400 font-black">
                                <Clock className="w-4 h-4" />
                                <p className="text-2xl tracking-tighter">{daysRemaining !== null ? `${daysRemaining}D` : '∞'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="py-6 border-y border-white/5 space-y-4">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Validated Privileges</p>
                            <div className="grid grid-cols-1 gap-3">
                              {planFeatures.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                                  <div className="w-4 h-4 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center font-black">
                                    <CheckCircle2 className="w-3 h-3" />
                                  </div>
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                               <span className="text-slate-500">Node Sync Progress</span>
                               <span className="text-violet-400 italic">ETR: {profile.nextRenewal}</span>
                            </div>
                            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/10 ring-4 ring-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, Math.max(10, daysRemaining !== null ? (daysRemaining / 30) * 100 : 100))}%` }}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                              />
                            </div>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] text-center opacity-60">System state optimized for billing group 0x82</p>
                          </div>

                          <button 
                            onClick={() => setActiveTab('subscriptions')}
                            className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-2xl mt-4"
                          >
                            Advance Architecture
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                  <InvoiceTable invoices={allInvoices} />
                </div>
              )}

              {activeTab === 'subscriptions' && (
                <div className="py-2">
                  <div className="mb-10 text-slate-900">
                    <h1 className="text-3xl font-black tracking-tight">Access Tiers</h1>
                    <p className="text-slate-500 mt-1 text-lg">Choose the right plan for your business needs</p>
                  </div>
                  <SubscriptionPlans />
                </div>
              )}

              {activeTab === 'payments' && (
                 <div className="space-y-8 text-slate-900">
                   <div className="mb-10">
                      <h1 className="text-3xl font-black tracking-tight">Payment History</h1>
                      <p className="text-slate-500 mt-1">Manage and track all your transactions</p>
                   </div>
                   <InvoiceTable invoices={allInvoices} />
                 </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-8 text-slate-900">
                  <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight">Usage Analytics</h1>
                    <p className="text-slate-500 mt-1">Real-time resource utilization and API consumption</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Usage</p>
                          <h3 className="text-2xl font-black">42.8k / 50k</h3>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-[85.6%]" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-bold italic">85.6% consumed this month</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Nodes</p>
                          <h3 className="text-2xl font-black">12 Available</h3>
                        </div>
                      </div>
                      <div className="flex gap-1 h-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                          <div key={i} className="flex-1 bg-emerald-500 rounded-full" />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-bold italic">All VPC clusters healthy</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security State</p>
                          <h3 className="text-2xl font-black">Hardened</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full w-full" />
                        </div>
                        <span className="text-[10px] font-black text-purple-600 uppercase">Shielded</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-bold italic">Latest audit passed: Today</p>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Detailed Consumption Log
                      </h2>
                      <button 
                        onClick={() => {
                          const content = `USAGE REPORT - ${new Date().toLocaleDateString()}\n\nAPI Consumption: 42.8k / 50k\nActive Nodes: 12\nSecurity State: Hardened\n\nLog Details:\nBatch_001: 450 calls\nBatch_002: 120 calls\nBatch_003: 310 calls\n\nSystem Generated Analytics`;
                          const blob = new Blob([content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `usage-report-${new Date().getTime()}.txt`;
                          link.click();
                        }}
                        className="text-[10px] font-black px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
                      >
                        <Download className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                               <FileText className="w-4 h-4" />
                             </div>
                             <div>
                               <p className="text-xs font-black text-slate-900">System Request Batch_00{i}</p>
                               <p className="text-[10px] text-slate-400 font-mono italic">Trace ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-black text-blue-600">+{Math.floor(Math.random() * 500)} Calls</p>
                             <p className="text-[10px] text-slate-400 font-bold">2 mins ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8 text-slate-900 max-w-4xl">
                  <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight">Account Configuration</h1>
                    <p className="text-slate-500 mt-1">Manage your identity and synchronization parameters</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Personal Authentication</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Full Identity</label>
                            <input 
                              type="text" 
                              value={profile.name}
                              readOnly
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Primary Email</label>
                            <input 
                              type="email" 
                              value={profile.email || 'user@system.cloud'}
                              readOnly
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                             <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-blue-900">SSO Managed Profile</p>
                            <p className="text-[10px] text-blue-700 font-medium">Your account is synchronized via Google Auth. Authentication fields are managed by the identity provider.</p>
                          </div>
                        </div>
                      </section>

                      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4">Global Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <div>
                               <p className="text-xs font-black text-slate-900">Email Notifications</p>
                               <p className="text-[10px] text-slate-400 font-medium tracking-tight">Receive billing reports and security digests.</p>
                            </div>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
                          </div>
                          <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <div>
                               <p className="text-xs font-black text-slate-900">VPC Hardware Acceleration</p>
                               <p className="text-[10px] text-slate-400 font-medium tracking-tight">Optimize dashboard rendering using system GPU.</p>
                            </div>
                            <div className="w-10 h-5 bg-slate-300 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
                          </div>
                        </div>
                      </section>
                      
                      <div className="flex justify-end pt-4">
                         <button className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/10 active:scale-95">
                           <Save className="w-4 h-4" />
                           Synchronize Settings
                         </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <section className="bg-slate-900 p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6">Current Tier</h3>
                        <div className="mb-8">
                           <p className="text-3xl font-black tracking-tight">{profile.plan}</p>
                           <p className="text-blue-400 text-xs font-bold mt-1 uppercase tracking-widest leading-none">Active Subscription</p>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                              <span className="text-slate-400">Renewal On</span>
                              <span>{profile.nextRenewal}</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full w-[60%]" />
                           </div>
                        </div>
                        <button 
                          onClick={() => setActiveTab('subscriptions')}
                          className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
                        >
                          Change Plan
                        </button>
                      </section>

                      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Security Overview</h3>
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Two-Factor: INACTIVE</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Biometric: DISABLED</span>
                           </div>
                        </div>
                        <button className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-[10px] font-black text-slate-900 uppercase tracking-widest hover:bg-slate-50">
                           Harden Account
                        </button>
                      </section>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
