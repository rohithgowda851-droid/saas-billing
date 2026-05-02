import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Save, Activity, Check, AlertCircle, Database, ArrowRight, Loader2 } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  trialDays: number;
}

export default function PlanConfigurator() {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPhase, setSyncPhase] = useState<'idle' | 'auth' | 'upload' | 'verified'>('idle');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'plans'), (snapshot) => {
      const plansList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
      setPlans(plansList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'plans');
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (plan: Plan) => {
    if (!isAdmin) return;
    setIsSyncing(true);
    
    // Visualization Sequence
    setSyncPhase('auth');
    await new Promise(r => setTimeout(r, 600));
    setSyncPhase('upload');
    await new Promise(r => setTimeout(r, 800));

    try {
      const planRef = doc(db, 'plans', plan.id);
      await setDoc(planRef, {
        ...plan,
        updatedAt: new Date().toISOString()
      });
      setSyncPhase('verified');
      await new Promise(r => setTimeout(r, 1000));
      setEditingPlan(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `plans/${plan.id}`);
    } finally {
      setIsSyncing(false);
      setSyncPhase('idle');
    }
  };

  const handleRemove = async (id: string) => {
    if (!isAdmin || !confirm('Permanently remove this plan definition?')) return;
    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `plans/${id}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-16 text-center bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-xl">
        <AlertCircle className="w-16 h-16 text-red-500/50 mx-auto mb-6 animate-pulse" />
        <h3 className="text-white font-black text-xl italic tracking-tighter">Panel Access Required</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Please elevate your access level to manage system plan definitions within the SaaS Billing Core.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tighter italic flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-violet-500" />
            Plan Model Configuration
          </h3>
          <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-[0.2em] mt-1 italic">Define tiers, custom features, and trial incentives</p>
        </div>
        <button 
          onClick={() => setEditingPlan({ id: `tier_${Date.now()}`, name: '', price: 0, features: [''], trialDays: 14 })}
          className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600 blur-[80px] opacity-10" />
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-[#0a0a0f]/50 border-b border-white/5 text-slate-500 uppercase font-black tracking-[0.3em]">
                <tr>
                  <th className="px-8 py-5">Tier Name</th>
                  <th className="px-8 py-5">Monthly Cost</th>
                  <th className="px-8 py-5">Incentive</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80 bg-white/2">
                {plans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 italic uppercase tracking-widest font-black opacity-60">No dynamic plans defined. Initializing fallback models...</td>
                  </tr>
                )}
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-white/5 transition-all group cursor-default">
                    <td className="px-8 py-6 font-black text-white text-sm tracking-tight group-hover:text-violet-400 transition-colors uppercase">{plan.name}</td>
                    <td className="px-8 py-6 font-mono text-emerald-400 italic">${plan.price}/mo</td>
                    <td className="px-8 py-6">
                       <span className="px-4 py-1.5 bg-violet-600/10 text-violet-400 border border-violet-600/20 rounded-full font-black text-[9px] uppercase tracking-widest italic shadow-xl">
                         {plan.trialDays} Day Trial
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => setEditingPlan(plan)}
                          className="p-3 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-violet-400 rounded-xl transition-all border border-transparent hover:border-white/10 shadow-xl"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemove(plan.id)}
                          className="p-3 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-white/10 shadow-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AnimatePresence>
            {isSyncing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0a0a0f] text-white p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center gap-8 overflow-hidden relative group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: syncPhase === 'verified' ? '100%' : syncPhase === 'upload' ? '60%' : '30%' }}
                    className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 shadow-[0_0_20px_rgba(139,92,246,0.8)]"
                  />
                </div>
                
                <div className="flex items-center gap-6">
                   <div className={cn(
                     "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl",
                     syncPhase === 'verified' ? "bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] border border-white/20" : "bg-violet-600 animate-pulse shadow-[0_0_40px_rgba(139,92,246,0.3)] border border-white/20"
                   )}>
                     {syncPhase === 'verified' ? <Check className="w-8 h-8" /> : <Database className="w-8 h-8" />}
                   </div>
                   <div>
                     <p className="text-sm font-black tracking-[0.2em] uppercase italic italic">
                       {syncPhase === 'auth' && 'Authenticating Session...'}
                       {syncPhase === 'upload' && 'Injecting Data Delta...'}
                       {syncPhase === 'verified' && 'Schema Sync Verified'}
                     </p>
                     <p className="text-[10px] text-slate-500 font-mono font-black mt-1 uppercase tracking-widest">
                        {syncPhase === 'auth' && 'SYS_EVENT: Handshake initiated'}
                        {syncPhase === 'upload' && 'SYS_MSG: Pushing Firestore Buffer'}
                        {syncPhase === 'verified' && 'SYS_STATUS: 200 OK'}
                     </p>
                   </div>
                </div>

                <div className="ml-auto flex items-center gap-10 pr-6">
                   <div className="flex items-center gap-3">
                     <span className="w-3 h-3 rounded-full bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                     <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-violet-500 transition-colors" />
                     <span className={cn(
                       "w-3 h-3 rounded-full transition-all duration-700",
                       syncPhase === 'verified' ? "bg-emerald-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]" : "bg-white/10"
                     )} />
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 h-fit sticky top-10 shadow-2xl relative overflow-hidden">
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600 blur-[80px] opacity-10" />
          {editingPlan ? (
             <div className="space-y-8 relative z-10">
               <div>
                  <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] italic mb-6 border-b border-white/5 pb-4">Structural parameters</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2 italic">Neural Tier Identifier</label>
                      <input 
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase text-white outline-none focus:border-violet-500 focus:bg-white/10 transition-all placeholder:text-slate-700 tracking-widest shadow-inner shadow-black/20"
                        placeholder="e.g. DARK_MATTER_LAYER"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Extraction Rate ($)</label>
                        <input 
                          type="number"
                          value={editingPlan.price}
                          onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) })}
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-emerald-400 outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-mono shadow-inner shadow-black/20"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Trial Horizon (Days)</label>
                        <input 
                          type="number"
                          value={editingPlan.trialDays}
                          onChange={(e) => setEditingPlan({ ...editingPlan, trialDays: parseInt(e.target.value) })}
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-mono shadow-inner shadow-black/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center justify-between italic">
                        Node Capabilities 
                        <button 
                          onClick={() => setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ''] })}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all shadow-xl"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </label>
                      <div className="space-y-3 custom-scrollbar max-h-60 overflow-y-auto pr-2">
                        {editingPlan.features.map((feature, i) => (
                          <div key={i} className="flex gap-3 group">
                            <input 
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...editingPlan.features];
                                newFeatures[i] = e.target.value;
                                setEditingPlan({ ...editingPlan, features: newFeatures });
                              }}
                              className="flex-1 px-5 py-3 bg-white/2 border border-white/5 rounded-xl text-[10px] font-bold text-white/70 outline-none focus:border-violet-500 transition-all shadow-inner shadow-black/10"
                              placeholder="Feature logic..."
                            />
                            <button 
                              onClick={() => {
                                const newFeatures = editingPlan.features.filter((_, idx) => idx !== i);
                                setEditingPlan({ ...editingPlan, features: newFeatures });
                              }}
                              className="p-2 text-slate-700 hover:text-red-500 hover:bg-white/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>

               <button 
                onClick={() => handleSave(editingPlan)}
                disabled={isSyncing || !editingPlan.name}
                className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:bg-emerald-400 disabled:opacity-50 transition-all mt-6 active:scale-95"
               >
                 {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 {isSyncing ? 'Synchronizing Cluster...' : 'Commit Model to Core'}
               </button>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center relative z-10">
              <div className="w-20 h-20 bg-white/2 rounded-[2rem] border border-white/5 flex items-center justify-center mb-6 shadow-2xl relative">
                 <div className="absolute inset-0 bg-violet-600/10 blur-[20px] rounded-full animate-pulse" />
                 <ArrowRight className="w-8 h-8 text-slate-700 relative z-10" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-[0.2em] italic">Configuration Ready</p>
              <p className="text-[10px] text-slate-500 mt-3 max-w-[180px] font-bold leading-relaxed">Select a neural tier from the directory to begin re-engineering.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
