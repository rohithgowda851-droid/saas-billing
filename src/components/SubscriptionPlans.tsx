import { Check, ShieldCheck, Loader2, ArrowLeft, CreditCard, Wallet, Bitcoin, CircleDollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { doc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useState, useEffect } from 'react';
import PlanConfigurator from './PlanConfigurator.tsx';
import { motion, AnimatePresence } from 'motion/react';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  trialDays?: number;
}

const DEFAULT_PLANS: Plan[] = [
  { id: 'Basic', name: 'Basic', price: 19, features: ['1,000 API calls', 'Standard Support'], trialDays: 7 },
  { id: 'Pro', name: 'Professional', price: 49, features: ['50,000 API calls', 'Priority Support'], trialDays: 14 },
  { id: 'Enterprise', name: 'Enterprise', price: 199, features: ['Unlimited calls', 'Dedicated Manager'], trialDays: 30 },
];

export default function SubscriptionPlans() {
  const { profile, user, isAdmin, updateProfile } = useAuth();
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [fakeDetails, setFakeDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    email: '',
    walletAddress: ''
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);

  const paymentOptions = [
    { id: 'card', name: 'Credit Card', icon: CreditCard },
    { id: 'paypal', name: 'PayPal', icon: Wallet },
    { id: 'crypto', name: 'Crypto', icon: Bitcoin },
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'plans'), (snapshot) => {
      if (snapshot.empty) {
        setPlans(DEFAULT_PLANS);
      } else {
        const plansList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
        setPlans(plansList);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'plans');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isFormValid = () => {
    if (paymentMethod === 'card') return fakeDetails.cardNumber.length >= 16 && fakeDetails.expiry.length >= 5;
    if (paymentMethod === 'paypal') return fakeDetails.email.includes('@');
    if (paymentMethod === 'crypto') return fakeDetails.walletAddress.length >= 10;
    return false;
  };

  const handleUpgrade = async () => {
    if (!selectedPlanForPayment || !paymentMethod) return;

    const planId = selectedPlanForPayment.id;
    setUpgradingId(planId);
    
    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        const price = selectedPlanForPayment.price || 0;

        // Synchronize with server to generate invoice and get new renewal date
        const resp = await fetch('/api/renew', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planId, price, paymentMethod })
        });
        
        const serverData = await resp.json();

        if (serverData.success) {
          await updateProfile({
            plan: planId,
            price: price,
            status: 'Paid',
            nextRenewal: serverData.nextRenewal,
            updatedAt: new Date().toISOString()
          }, serverData.newInvoice);
          
          setPaymentSuccess(true);
          
          // Wait for success animation before closing
          setTimeout(() => {
            setSelectedPlanForPayment(null);
            setPaymentMethod(null);
            setShowPaymentDetails(false);
            setPaymentSuccess(false);
            setFakeDetails({ cardNumber: '', expiry: '', cvv: '', email: '', walletAddress: '' });
          }, 2500);
        } else {
          throw new Error("Server failed to process upgrade");
        }
      } catch (error) {
        console.error("Upgrade failed:", error);
        alert("Upgrade failed. Please check your connection and try again.");
      } finally {
        setUpgradingId(null);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-xl">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <p className="text-[10px] font-black text-violet-400/60 uppercase tracking-[0.3em] italic">Decompressing Access Tiers...</p>
      </div>
    );
  }

  if (showConfig && isAdmin) {
    return (
      <section className="bg-[#0a0a0f] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
           <button 
             onClick={() => setShowConfig(false)}
             className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-white active:scale-95"
           >
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
             <h2 className="text-xl font-black text-white tracking-tight">System Model Architect</h2>
             <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">Configure dynamic cloud resources</p>
           </div>
        </div>
        <PlanConfigurator />
      </section>
    );
  }

  return (
    <section className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400/60 font-mono italic">Available Clusters</h2>
        {isAdmin && (
          <button 
            onClick={() => setShowConfig(true)}
            className="text-[10px] text-emerald-400 font-black uppercase tracking-widest hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 transition-all"
          >
            Manage Core Models
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = profile?.plan === plan.id;
          const isUpgrading = upgradingId === plan.id;
          
          // Enhanced plan metadata
          const planMetaMap: Record<string, { desc: string, advantage: string, accent: string }> = {
            'Starter': { desc: 'Ideal for personal hobbyist nodes and low-latency testing.', advantage: 'Privacy-Focused', accent: 'border-slate-200' },
            'Pro': { desc: 'Engineered for growing teams requiring high-availability clusters.', advantage: '99.9% Uptime SLA', accent: 'border-blue-200' },
            'Enterprise': { desc: 'Mission-critical infrastructure with global edge redundancy.', advantage: 'Dedicated Resources', accent: 'border-purple-200' }
          };

          const meta = planMetaMap[plan.name] || planMetaMap['Starter'];

          return (
            <div 
              key={plan.id} 
              className={cn(
                "p-8 rounded-[2rem] border-2 transition-all relative flex flex-col group backdrop-blur-xl",
                isCurrent 
                  ? "border-violet-600 bg-white/5 shadow-[0_0_50px_-10px_rgba(139,92,246,0.5)] scale-[1.03] z-10" 
                  : `bg-white/5 hover:border-violet-400/50 border-white/5 shadow-sm`
              )}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-violet-600 text-[10px] text-white font-black rounded-full uppercase tracking-[0.3em] shadow-2xl border border-white/10 ring-4 ring-violet-600/20">
                  ONLINE_ENGINE
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isCurrent ? "text-emerald-400" : "text-slate-500")}>
                    {plan.name} Tier
                  </p>
                  {plan.trialDays && !isCurrent && (
                     <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                       {plan.trialDays}D SYNC
                     </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-400 leading-relaxed mb-6 min-h-[3rem] italic group-hover:text-slate-300 transition-colors">{meta.desc}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">${plan.price}</span>
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">/cycle</span>
                </div>
              </div>

              <div className="space-y-6 mb-10 flex-1">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-violet-600/10 transition-all">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Strategic Advantage</p>
                  <p className="text-[11px] font-black text-emerald-400 uppercase italic tracking-tight">⚡︎ {meta.advantage}</p>
                </div>
                
                <div className="space-y-4 pt-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-xl transition-all",
                        isCurrent ? "bg-violet-600 text-white shadow-violet-900/40" : "bg-white/5 text-slate-500"
                      )}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs text-slate-300 font-bold tracking-tight leading-tight group-hover:text-white transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
  
              <button 
                onClick={() => setSelectedPlanForPayment(plan)}
                disabled={isCurrent || upgradingId !== null}
                className={cn(
                  "mt-auto w-full py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl",
                  isCurrent 
                    ? "bg-white/5 text-slate-500 cursor-default shadow-none border border-white/5" 
                    : "bg-white text-black hover:bg-emerald-400 shadow-white/5 active:scale-[0.98]"
                )}
              >
                {isCurrent ? 'Current Config' : 'Initialize Link'}
              </button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedPlanForPayment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050508]/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 border-none"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(139,92,246,0.3)] w-full max-w-md overflow-hidden relative"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                 <div>
                   <h3 className="text-2xl font-black text-white tracking-tight">Payment Gateway</h3>
                   <p className="text-[10px] text-violet-400/60 font-black uppercase tracking-[0.3em] italic">Securing Link to {selectedPlanForPayment.name}</p>
                 </div>
                 <button 
                   onClick={() => {
                     if (showPaymentDetails) {
                       setShowPaymentDetails(false);
                     } else {
                       setSelectedPlanForPayment(null);
                       setPaymentMethod(null);
                     }
                   }}
                   className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-white"
                 >
                   <ArrowLeft className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-10 space-y-8 min-h-[450px]">
                <AnimatePresence mode="wait">
                  {paymentSuccess ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center py-16 space-y-6"
                    >
                      <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <Check className="w-12 h-12 stroke-[4]" />
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tight">Access Granted</h3>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">Your neural link to <span className="font-black text-emerald-400">{selectedPlanForPayment.name}</span> has been established successfully.</p>
                      <div className="pt-6 animate-pulse">
                        <p className="text-[9px] text-violet-400/60 font-black uppercase tracking-[0.4em] italic">Updating cloud directory...</p>
                      </div>
                    </motion.div>
                  ) : !showPaymentDetails ? (
                    <motion.div
                      key="selection"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-8"
                    >
                      <div className="flex justify-between items-end bg-violet-600/5 p-6 rounded-2xl border border-violet-600/10 ring-4 ring-violet-600/5">
                        <div className="space-y-2">
                          <p className="text-[10px] text-violet-400/60 font-black uppercase tracking-widest">Protocol total</p>
                          <p className="text-4xl font-black text-white tracking-tighter">${selectedPlanForPayment.price}<span className="text-sm font-bold text-slate-500 tracking-normal ml-1">/mo</span></p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Settle Today</p>
                          <p className="text-lg font-black text-emerald-400">${selectedPlanForPayment.price}.00</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic">Select Settle Protocol</p>
                        <div className="grid grid-cols-1 gap-4">
                          {paymentOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setPaymentMethod(opt.id);
                                setTimeout(() => setShowPaymentDetails(true), 400);
                              }}
                              className={cn(
                                "flex items-center gap-5 p-5 rounded-2xl border-2 transition-all text-left group",
                                paymentMethod === opt.id 
                                  ? "border-violet-600 bg-violet-600/10 shadow-[0_0_30px_rgba(139,92,246,0.2)]" 
                                  : "border-white/5 bg-white/2 hover:border-white/20"
                              )}
                            >
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl",
                                paymentMethod === opt.id ? "bg-violet-600 text-white" : "bg-white/5 text-slate-500 group-hover:text-slate-300"
                              )}>
                                <opt.icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-xs font-black text-white uppercase tracking-widest">{opt.name}</p>
                                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter italic">Secure Interface Node</p>
                              </div>
                              {paymentMethod === opt.id && (
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)] border border-white/20">
                                  <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="details"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600 blur-[50px] opacity-20" />
                         <div className="p-3 bg-violet-600 text-white rounded-xl shadow-xl shadow-violet-900/40 border border-white/10 relative z-10">
                            {paymentOptions.find(o => o.id === paymentMethod)?.icon && 
                              // @ts-ignore
                              <div className="w-6 h-6">{(() => { const Icon = paymentOptions.find(o => o.id === paymentMethod)!.icon; return <Icon className="w-full h-full" /> })()}</div>
                            }
                         </div>
                         <div className="relative z-10">
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] italic mb-0.5">Interface Activated</p>
                            <p className="text-xs font-black text-white uppercase tracking-widest leading-none">{paymentOptions.find(o => o.id === paymentMethod)?.name} PROTOCOL</p>
                         </div>
                      </div>

                      <div className="space-y-5">
                        {paymentMethod === 'card' && (
                          <>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic">Neural Card ID</label>
                              <input 
                                placeholder="4000 1234 5678 9012"
                                value={fakeDetails.cardNumber}
                                onChange={(e) => setFakeDetails({...fakeDetails, cardNumber: e.target.value.replace(/\D/g, '').substring(0, 16)})}
                                className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white focus:border-violet-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700 tracking-[0.2em]"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic">EXP</label>
                                <input 
                                  placeholder="MM/YY"
                                  value={fakeDetails.expiry}
                                  onChange={(e) => setFakeDetails({...fakeDetails, expiry: e.target.value.substring(0, 5)})}
                                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white focus:border-violet-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700 tracking-[0.2em]"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic">KEY</label>
                                <input 
                                  placeholder="***"
                                  value={fakeDetails.cvv}
                                  onChange={(e) => setFakeDetails({...fakeDetails, cvv: e.target.value.replace(/\D/g, '').substring(0, 3)})}
                                  className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white focus:border-violet-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700 tracking-[0.5em]"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {paymentMethod === 'paypal' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic">Neural Identity</label>
                            <input 
                              type="email"
                              placeholder="operator@nexus.cloud"
                              value={fakeDetails.email}
                              onChange={(e) => setFakeDetails({...fakeDetails, email: e.target.value})}
                              className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white focus:border-violet-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700"
                            />
                          </div>
                        )}

                        {paymentMethod === 'crypto' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic">Cold Bridge Hash</label>
                            <input 
                              placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                              value={fakeDetails.walletAddress}
                              onChange={(e) => setFakeDetails({...fakeDetails, walletAddress: e.target.value})}
                              className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white focus:border-violet-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-700 font-mono"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        disabled={!isFormValid() || upgradingId !== null}
                        onClick={handleUpgrade}
                        className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        {upgradingId ? <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                        {upgradingId ? "Synchronizing..." : "Finalize Authorization"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showPaymentDetails && !paymentSuccess && (
                  <p className="text-[9px] text-slate-600 text-center font-black uppercase tracking-widest leading-relaxed">
                    Simulation Protocol Active. No real financial assets required. Secure tunnel established by Nexus Core.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

