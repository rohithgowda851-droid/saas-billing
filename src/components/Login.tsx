import { Shield, User, Lock, ArrowRight, Laptop, Phone, UserCircle, Loader2, ChevronLeft, Mail } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { ConfirmationResult } from 'firebase/auth';

export default function Login() {
  const { login, loginGuest, setupRecaptcha, loginPhone, loginEmail, loginPhoneNoOtp } = useAuth();
  const [loginStep, setLoginStep] = useState<'selection' | 'phone' | 'otp' | 'email' | 'phone_no_otp'>('selection');
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Hidden div for ReCaptcha if we are on phone step or otp step
    if (loginStep === 'phone' || loginStep === 'otp') {
      setupRecaptcha('recaptcha-container');
    }
  }, [loginStep, setupRecaptcha]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await loginEmail(email, password, isNewUser);
    } catch (error) {
      // Handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoading(true);
    try {
      const result = await loginPhone(phoneNumber);
      setConfirmationResult(result);
      setLoginStep('otp');
    } catch (error: any) {
      console.error("Phone sign-in failed:", error);
      if (error.code === 'auth/operation-not-allowed') {
        alert("Action Required: Please enable 'Phone' authentication in your Firebase Console (Build > Authentication > Sign-in method).");
      } else {
        alert(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsLoading(true);
    try {
      await loginPhoneNoOtp(phoneNumber);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      // Auth status will be picked up by AuthContext
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      alert("Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <div id="recaptcha-container"></div>
      
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/cyber-core/1920/1080?blur=5" 
          alt="Technical Infrastructure" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent" />
      </div>
      
      {/* Background decoration with animated elements */}
      <div className="absolute inset-0 overflow-hidden z-[1] pointer-events-none">
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #4c1d95 1px, transparent 1px), linear-gradient(to bottom, #4c1d95 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
        
        {/* Moving light beams */}
        <motion.div 
          animate={{ 
            x: ['-100%', '100%'],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-[30%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-30"
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.4
            }}
            animate={{ 
              y: ['0%', '100%'],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ 
              duration: 15 + Math.random() * 25, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
          />
        ))}

        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-violet-600/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-600/5 blur-[150px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl grid md:grid-cols-2 bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(139,92,246,0.3)] relative z-10"
      >
        {/* Left side: branding */}
        <div className="p-12 flex flex-col justify-between bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900 text-white relative overflow-hidden">
          {/* Animated decorative shapes */}
          <div className="absolute inset-0 z-0">
             <motion.div 
               animate={{ 
                 rotate: 360,
                 scale: [1, 1.15, 1]
               }}
               transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
               className="absolute -top-32 -right-32 w-80 h-80 border-[60px] border-emerald-400/5 rounded-full"
             />
             <motion.div 
               animate={{ 
                 rotate: -360,
                 scale: [1, 1.25, 1]
               }}
               transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
               className="absolute -bottom-40 -left-40 w-96 h-96 border-[70px] border-white/5 rounded-full"
             />
          </div>

          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center mb-10 shadow-2xl border border-white/20"
            >
              <Laptop className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-black tracking-tight mb-6 leading-[1]"
            >
              SaaS Billing <br/>Terminal
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-violet-100 font-medium opacity-80 leading-relaxed text-sm max-w-xs"
            >
              Enterprise-grade authentication layer for mission-critical cloud infrastructure and asset orchestration.
            </motion.p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 opacity-80">Link Active: Port 8080</span>
            </div>
            <div className="flex gap-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                    className="w-full h-full bg-emerald-400/50"
                  />
                </div>
              ))}
            </div>
            <p className="text-[9px] text-violet-300 font-black uppercase tracking-[0.2em] leading-none">
              © 2026 BILLING SYSTEMS <br/>Protocol: VIOLET-EMERALD
            </p>
          </div>
        </div>

        {/* Right side: Login forms */}
        <div className="p-12 bg-[#0a0a0f] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {loginStep === 'selection' && (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-6 text-center md:text-left">
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Identity Verification</h2>
                  <p className="text-violet-400/60 text-[10px] font-bold uppercase tracking-[0.2em]">Authorize current session via cloud gateway</p>
                </div>

                {/* Role Selector */}
                <div className="grid grid-cols-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setSelectedRole('user')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedRole === 'user' ? "bg-violet-600 text-white shadow-xl shadow-violet-900/40" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <User className="w-3 h-3" /> Standard
                  </button>
                  <button 
                    onClick={() => setSelectedRole('admin')}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      selectedRole === 'admin' ? "bg-emerald-600 text-white shadow-xl shadow-emerald-900/40" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <Shield className="w-3 h-3" /> System Admin
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-violet-400/60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                       <Mail className="w-3 h-3" /> Identity Access
                    </label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@billing.cloud"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-violet-400/60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                       <Lock className="w-3 h-3" /> Security Hash
                    </label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-mono"
                    />
                  </div>

                  <button 
                    onClick={() => login(selectedRole === 'admin', { email, pass: password })}
                    disabled={isLoading || !email || !password}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl",
                      selectedRole === 'admin' ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-900/40"
                    )}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {selectedRole === 'admin' ? 'Execute Admin Unlock' : 'Initialize Session'}
                  </button>

                  <div className="p-4 bg-violet-600/5 rounded-2xl border border-violet-500/10">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3 text-center">System Override Logins</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] font-bold text-violet-300 uppercase">Administrator</span>
                        <span className="text-[9px] font-mono text-slate-500">admin@billing.com / admin123</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                        <span className="text-[9px] font-bold text-violet-300 uppercase">Operator</span>
                        <span className="text-[9px] font-mono text-slate-500">user@billing.com / user123</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative py-2 mt-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[9px]"><span className="bg-[#0a0a0f] px-3 text-slate-600 font-black uppercase tracking-[0.3em]">Alternate Protocols</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setLoginStep('phone_no_otp')}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-400 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <Phone className="w-3 h-3" /> Voice
                    </button>
                    <button 
                      onClick={() => setLoginStep('email')}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-violet-400 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      <UserCircle className="w-3 h-3" /> Core
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {(loginStep === 'phone' || loginStep === 'otp') && (
              <motion.div 
                key="phone-entry"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => {
                      setLoginStep('selection');
                      setPhoneNumber('');
                      setOtp('');
                    }}
                    className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                    {loginStep === 'phone' ? 'Phone Sign-In' : 'Verify Code'}
                  </h2>
                </div>

                {loginStep === 'phone' ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-violet-400/60 uppercase mb-2 tracking-[0.2em] ml-2">Phone Number</label>
                      <input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 555 000 0000"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-mono"
                        required
                      />
                      <p className="text-[10px] text-slate-500 mt-3 italic uppercase tracking-widest ml-2 opacity-60">Include country code (e.g. +1 for USA)</p>
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading || !phoneNumber}
                      className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/40 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Code'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-violet-400/60 uppercase mb-2 tracking-[0.2em] ml-2">Verification Code</label>
                      <input 
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-5 text-white text-xl outline-none focus:border-violet-500 focus:bg-white/10 transition-all text-center tracking-[1em] font-black"
                        maxLength={6}
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="w-full py-5 bg-violet-600 hover:bg-violet-500 disabled:opacity-20 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-violet-900/40 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Identity'}
                    </button>
                    <p className="text-center text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">
                      Didn't receive a code? <button type="button" onClick={() => setLoginStep('phone')} className="text-emerald-400 hover:underline">Try again</button>
                    </p>
                  </form>
                )}
              </motion.div>
            )}

            {loginStep === 'email' && (
              <motion.div 
                key="email-entry"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => setLoginStep('selection')}
                    className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
                    {isNewUser ? 'Create Node' : 'Welcome Back'}
                  </h2>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-violet-400/60 uppercase mb-2 tracking-[0.2em] ml-2">Email Address</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-violet-400/60 uppercase mb-2 tracking-[0.2em] ml-2">Password</label>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-mono"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full py-5 bg-violet-600 hover:bg-violet-500 disabled:opacity-20 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-violet-900/40 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isNewUser ? 'Create Secure Account' : 'Authorize Session')}
                  </button>

                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setIsNewUser(!isNewUser)}
                      className="text-[10px] text-slate-500 hover:text-emerald-400 font-black uppercase tracking-[0.2em] transition-colors"
                    >
                      {isNewUser ? 'Already have an account? Sign In' : 'Need a new identity? Register'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            {loginStep === 'phone_no_otp' && (
              <motion.div 
                key="phone-no-otp-entry"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => {
                      setLoginStep('selection');
                      setPhoneNumber('');
                    }}
                    className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Instant Phone Login</h2>
                </div>

                <form onSubmit={handleQuickPhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-violet-400/60 uppercase mb-2 tracking-[0.2em] ml-2">Phone Number</label>
                    <input 
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-violet-500 focus:bg-white/10 transition-all font-mono"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-3 italic uppercase tracking-widest ml-2 opacity-60">Your phone number will act as your unique ID.</p>
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading || !phoneNumber}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/40 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In Instantly'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 p-5 bg-violet-600/5 border border-violet-500/10 rounded-2xl shadow-xl">
             <div className="flex items-start gap-4">
               <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
               <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                 Secure connection established via 256-bit encryption. Your session data is protected by Firebase Auth services and Billing Security Layer.
               </p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
