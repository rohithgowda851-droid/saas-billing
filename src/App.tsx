import { Loader2 } from 'lucide-react';
import UserPanel from './components/UserPanel.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import Login from './components/Login.tsx';
import { AuthProvider, useAuth } from './lib/AuthContext.tsx';

function RootRouter() {
  const { profile, loading, isAdmin, user } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-slate-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
        <p className="text-sm font-mono tracking-widest uppercase">Initializing Core...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  // Route based on isAdmin flag from AuthContext
  if (isAdmin) {
    return <AdminPanel />;
  }

  return <UserPanel />;
}

export default function App() {
  return (
    <AuthProvider>
      <RootRouter />
    </AuthProvider>
  );
}
