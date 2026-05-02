import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInAnonymously,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType, firebaseAppConfig } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const playSecurityBuzzer = () => {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    const duration = 0.8;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise for the 'fhaaa' texture
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Filter to shape the noise into a "fhaaa" sound
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + duration);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noise.start();
  } catch (e) {
    console.warn("Security buzzer suppressed by browser policies:", e);
  }
};

const speakSecurityMessage = (message: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.95;
    utterance.pitch = 0.85;
    utterance.volume = 1.0;
    
    // Pick a English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    
    window.speechSynthesis.speak(utterance);
  }
};

interface AuthContextType {
  user: FirebaseUser | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  login: (asAdmin: boolean) => Promise<void>;
  loginGuest: () => Promise<void>;
  setupRecaptcha: (containerId: string) => void;
  loginPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  loginPhoneNoOtp: (phoneNumber: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  renewLicense: () => Promise<void>;
  invoices: any[];
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const getOrCreateProfile = async (firebaseUser: FirebaseUser, forceAdmin: boolean = false) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    let userSnap;
    try {
      userSnap = await getDoc(userRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, `users/${firebaseUser.uid}`);
    }
    
    if (userSnap?.exists()) {
      const data = userSnap.data();
      
      // Migration: Ensure role exists for older profiles
      if (!data.role) {
        data.role = 'user';
        try {
          await setDoc(userRef, { role: 'user' }, { merge: true });
        } catch (e) {
          console.warn("Failed to migrate user role:", e);
        }
      }

      if (forceAdmin && data.role !== 'admin') {
        try {
          await setDoc(userRef, { role: 'admin' }, { merge: true });
          data.role = 'admin';
          setProfile(data);
          setIsAdmin(true);
          return data;
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
      }
      setProfile(data);
      setIsAdmin(data.role === 'admin');
      return data;
    } else {
      const newProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous User',
        email: firebaseUser.email,
        plan: 'Basic',
        status: 'Paid',
        startDate: new Date().toISOString().split('T')[0],
        nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        role: forceAdmin ? 'admin' : 'user'
      };
      try {
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
        setIsAdmin(forceAdmin);
        return newProfile;
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${firebaseUser.uid}`);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        await getOrCreateProfile(u);
        setUser(u);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (asAdmin: boolean, credentials?: { email: string; pass: string }) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    
    // Support for credentials-based login for demo/dev purposes
    if (credentials) {
      const isAdminUser = asAdmin;
      
      // Enforce specific admin credentials as requested by user
      if (isAdminUser) {
        if (credentials.email !== 'rohith@gmail.com') {
          playSecurityBuzzer();
          speakSecurityMessage("Your identity is wrong");
          alert("🛑 IDENTITY ERROR: The provided administrator identity handles do not match system records.");
          setIsLoggingIn(false);
          return;
        }
        
        if (credentials.pass !== 'rohi123') {
          playSecurityBuzzer();
          speakSecurityMessage("Your password is wrong");
          alert("🛑 SECURITY WARNING: UNAUTHORIZED ACCESS ATTEMPT DETECTED.\n\nIncorrect password for administrative terminal.");
          setIsLoggingIn(false);
          return;
        }
      }

      const mockU = { 
        uid: isAdminUser ? `admin-${credentials.email.split('@')[0]}` : `user-${credentials.email.split('@')[0]}`, 
        email: credentials.email, 
        displayName: credentials.email.split('@')[0].charAt(0).toUpperCase() + credentials.email.split('@')[0].slice(1)
      };
      
      const newProfile = {
        name: mockU.displayName,
        plan: isAdminUser ? 'Enterprise' : 'Basic',
        status: 'Paid',
        role: isAdminUser ? 'admin' : 'user',
        nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      // Register session on server for demo visibility - only for normal users
      if (!isAdminUser) {
        try {
          await fetch('/api/admin/register-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: mockU.uid,
              name: newProfile.name,
              email: mockU.email,
              plan: newProfile.plan,
              status: newProfile.status
            })
          });
        } catch (e) {
          console.warn("Failed to register session on server:", e);
        }
      }
      
      setProfile(newProfile);
      setIsAdmin(isAdminUser);
      setUser(mockU as any);
      setIsLoggingIn(false);
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Enforce admin email check for Google login as well
      if (asAdmin && result.user.email !== 'rohith@gmail.com') {
        await signOut(auth);
        playSecurityBuzzer();
        speakSecurityMessage("Your identity is wrong");
        alert("🛑 SECURITY VIOLATION: Your Google account does not have administrative clearance for this terminal.\n\nAccess Denied.");
        setIsLoggingIn(false);
        return;
      }

      await getOrCreateProfile(result.user, asAdmin);
      setUser(result.user);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log("Login popup cancelled by user");
      } else {
        console.error("Login failed:", error);
        alert(`Login error: ${error.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setUser(null);
    setIsAdmin(false);
  };
  
  const updateProfile = async (updates: any, serverInvoice?: any) => {
    // Determine if we should record an invoice
    let finalInvoice: any = serverInvoice || null;
    
    // Auto-generate client-side invoice only if no server invoice is provided and plan is changing
    if (!finalInvoice && updates.plan) {
      finalInvoice = {
        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: updates.price || 49.00,
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        plan: updates.plan
      };
    }

    if (user && user.uid && !user.uid.startsWith('admin-') && !user.uid.startsWith('user-')) {
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, updates, { merge: true });
        if (finalInvoice) {
           const invRef = doc(db, 'users', user.uid, 'payments', finalInvoice.id);
           await setDoc(invRef, finalInvoice);
           setInvoices(prev => [finalInvoice, ...prev]);
        }
        setProfile((prev: any) => ({ ...prev, ...updates }));
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }
    } else {
      // Direct Access Mode / Mock Users: Update local state only
      if (finalInvoice) {
        setInvoices(prev => [finalInvoice, ...prev]);
      }
      setProfile((prev: any) => {
        const current = prev || {
          name: user?.displayName || 'User',
          plan: 'Basic',
          status: 'Paid',
          role: isAdmin ? 'admin' : 'user',
          nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        return { ...current, ...updates };
      });
    }
  };

  const renewLicense = async () => {
    try {
      const response = await fetch('/api/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: profile?.plan || 'Basic', price: profile?.price || 49 })
      });
      
      const result = await response.json();
      if (result.success) {
        // Pass the server invoice to updateProfile to ensure it's recorded correctly
        await updateProfile({ 
          nextRenewal: result.nextRenewal, 
          status: 'Paid' 
        }, result.newInvoice);
      }
    } catch (error) {
      console.error("Renewal API failed:", error);
      // Fallback to local logic if server fails
      const nextRenewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await updateProfile({ nextRenewal, status: 'Paid' });
    }
  };

  const loginGuest = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const result = await signInAnonymously(auth);
      await getOrCreateProfile(result.user, false);
      setUser(result.user);
    } catch (error: any) {
      console.error("Guest login failed:", error);
      const projectId = firebaseAppConfig.projectId;
      const consoleLink = `https://console.firebase.google.com/project/${projectId}/authentication/providers`;
      
      if (error.code === 'auth/admin-restricted-operation' || error.code === 'auth/operation-not-allowed') {
        alert(`CRITICAL SETUP REQUIRED:\n\nAnonymous authentication is currently DISABLED in your Firebase project.\n\nTo fix this:\n1. Open: ${consoleLink}\n2. Find "Anonymous" in the list\n3. Click "Enable" and "Save"\n4. Refresh this app.`);
      } else if (error.code === 'auth/network-request-failed') {
        alert("NETWORK ERROR: Firebase domains are being blocked or you are offline. Check your console (F12) for more details.");
      } else {
        alert(`Guest login failed [${error.code}]: ${error.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const setupRecaptcha = (containerId: string) => {
    if (recaptchaVerifier) return;
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`reCAPTCHA container #${containerId} not found in DOM yet.`);
        return;
      }
      
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        'callback': () => {
          console.log("reCAPTCHA solved manually");
        },
        'expired-callback': () => {
          console.warn("reCAPTCHA session expired");
        }
      });

      verifier.render().then(() => {
        console.log("reCAPTCHA rendered successfully");
        setRecaptchaVerifier(verifier);
      }).catch(e => {
        console.error("reCAPTCHA render error:", e);
      });
    } catch (e) {
      console.error("reCAPTCHA initialization exception:", e);
    }
  };

  const loginPhone = async (phoneNumber: string) => {
    try {
      let verifier = recaptchaVerifier;
      if (!verifier) {
        // Fallback: try to find it again
        const container = document.getElementById('recaptcha-container');
        if (!container) throw new Error("Verification engine container missing from DOM. Try refreshing.");
        verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      return await signInWithPhoneNumber(auth, phoneNumber, verifier);
    } catch (error: any) {
      const projectId = firebaseAppConfig.projectId;
      const consoleLink = `https://console.firebase.google.com/project/${projectId}/authentication/providers`;
      
      if (error.code === 'auth/operation-not-allowed') {
        alert(`CRITICAL SETUP REQUIRED:\n\nPhone authentication is currently DISABLED.\n\nTo fix this:\n1. Open: ${consoleLink}\n2. Enable "Phone"\n3. Click "Save"\n4. Refresh this app.`);
      } else if (error.code === 'auth/network-request-failed') {
        alert("NETWORK ERROR: Failed to reach Firebase servers. Check for ad-blockers or firewall rules blocking *.firebaseapp.com");
      }
      throw error;
    }
  };

  const loginEmail = async (email: string, pass: string, isNew: boolean) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      let result;
      if (isNew) {
        result = await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        result = await signInWithEmailAndPassword(auth, email, pass);
      }
      await getOrCreateProfile(result.user, false);
      setUser(result.user);
    } catch (error: any) {
      const projectId = firebaseAppConfig.projectId;
      const consoleLink = `https://console.firebase.google.com/project/${projectId}/authentication/providers`;
      
      if (error.code === 'auth/operation-not-allowed') {
        alert(`CRITICAL SETUP REQUIRED:\n\nEmail/Password authentication is currently DISABLED.\n\nTo fix this:\n1. Open: ${consoleLink}\n2. Enable "Email/Password"\n3. Click "Save"\n4. Refresh this app.`);
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        alert("INVALID CREDENTIALS: The email or password provided is incorrect.");
      } else if (error.code === 'auth/email-already-in-use') {
        alert("ACCOUNT EXISTS: This email is already registered. Try signing in instead.");
      } else {
        alert(`Authentication Error [${error.code}]: ${error.message}`);
      }
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginPhoneNoOtp = async (phoneNumber: string) => {
    if (isLoggingIn || !phoneNumber) return;
    setIsLoggingIn(true);
    
    // Create a virtual email/password account using the phone number
    const safePhone = phoneNumber.replace(/\D/g, '');
    if (safePhone.length < 5) {
      alert("Invalid phone number format.");
      setIsLoggingIn(false);
      return;
    }
    
    const virtualEmail = `phone_${safePhone}@app.internal`;
    const staticPass = `Pass_${safePhone}_Sec`; // In a real app, this should be more complex
    
    try {
      let result;
      try {
        // Try to sign in first
        result = await signInWithEmailAndPassword(auth, virtualEmail, staticPass);
      } catch (err: any) {
        // If user doesn't exist, create them
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          result = await createUserWithEmailAndPassword(auth, virtualEmail, staticPass);
        } else {
          throw err;
        }
      }
      
      if (result) {
        await getOrCreateProfile(result.user, false);
        setUser(result.user);
      }
    } catch (error: any) {
      const projectId = firebaseAppConfig.projectId;
      const consoleLink = `https://console.firebase.google.com/project/${projectId}/authentication/providers`;
      
      if (error.code === 'auth/operation-not-allowed') {
        alert(`CRITICAL SETUP REQUIRED:\n\nEmail/Password authentication is currently DISABLED.\n\nTo fix this:\n1. Open: ${consoleLink}\n2. Enable "Email/Password"\n3. Click "Save"\n4. Refresh this app.`);
      } else {
        alert(`Quick Phone Login failed: ${error.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, login, loginGuest, setupRecaptcha, loginPhone, loginPhoneNoOtp, loginEmail, updateProfile, renewLicense, invoices, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
