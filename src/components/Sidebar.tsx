import { Home, CreditCard, Receipt, BarChart3, Settings, ArrowRightLeft, LogOut, User, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { logout, isAdmin } = useAuth();
  
  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: Receipt },
    { id: 'reports', label: 'Usage Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Admin Metrics', icon: BarChart3 },
    { id: 'users', label: 'User Directory', icon: User },
    { id: 'revenue', label: 'Revenue Analysis', icon: DollarSign },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="w-56 bg-[#0a0a0f] flex flex-col h-screen border-r border-white/5 text-slate-400">
      <div className="p-6 flex items-center gap-3 text-white font-black uppercase tracking-[0.2em] mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl shadow-violet-900/40 border border-white/10">
          <CreditCard className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-none tracking-tighter">SaaS</span>
          <span className="text-[10px] text-emerald-500/60 font-medium tracking-[0.2em] font-mono">BILLING</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-[11px] font-black uppercase tracking-widest",
              activeTab === item.id 
                ? "bg-violet-600 text-white shadow-xl shadow-violet-900/30" 
                : "hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4",
              activeTab === item.id ? "text-emerald-400" : "text-slate-500 group-hover:text-violet-400"
            )} />
            {item.id === 'payments' ? 'Ledger' : item.label}
          </button>
        ))}
        
        <div className="pt-8 opacity-40">
           <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-[11px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-emerald-400"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          Terminate
        </button>
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60 italic">Node Status: Secure</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-end gap-1.5 h-12">
            {[30, 50, 80, 40, 60, 90, 20, 55].map((h, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex-1 rounded-t-lg transition-all duration-700",
                  i % 3 === 0 ? "bg-violet-600 shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "bg-white/5 group-hover:bg-violet-950"
                )} 
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-1">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Authorization</p>
              <p className="text-[10px] text-emerald-400 font-mono font-black italic">LINK_ESTABLISHED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
