import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Auth from './pages/Auth';
import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="flex flex-col items-center gap-5">
      {/* Spinning rings */}
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full border border-purple-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-1 rounded-full border border-cyan-500/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-3 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
          <span className="text-white text-sm font-bold">◈</span>
        </div>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1 h-1 rounded-full bg-purple-400"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <AppLayout /> : <Auth />;
};

const App = () => (
  <AuthProvider>
    <AppContent />
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(10,8,20,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139,92,246,0.15)',
          color: '#e2e8f0',
          borderRadius: '14px',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#fff' },
          style: { borderColor: 'rgba(16,185,129,0.2)' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
          style: { borderColor: 'rgba(239,68,68,0.2)' },
        },
      }}
    />
  </AuthProvider>
);

export default App;
