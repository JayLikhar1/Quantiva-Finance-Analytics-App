import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import Sidebar from './Sidebar';
import Dashboard from '../../pages/Dashboard';
import Analytics from '../../pages/Analytics';
import Transactions from '../../pages/Transactions';
import Profile from '../../pages/Profile';
import Settings from '../../pages/Settings';
import About from '../../pages/About';

const pages = { dashboard: Dashboard, analytics: Analytics, transactions: Transactions, profile: Profile, settings: Settings, about: About };

/* Shared ambient particles — visible on every page */
const AMBIENT = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.6,
  dur: Math.random() * 14 + 10,
  delay: Math.random() * 8,
  color: ['rgba(167,139,250,', 'rgba(6,182,212,', 'rgba(236,72,153,', 'rgba(16,185,129,'][i % 4],
}));

/* Cursor glow — follows mouse across all pages */
const CursorGlow = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 18 });
  const sy = useSpring(y, { stiffness: 60, damping: 18 });
  useEffect(() => {
    const move = (e) => { x.set(e.clientX - 180); y.set(e.clientY - 180); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);
  return (
    <motion.div className="fixed pointer-events-none z-0 rounded-full"
      style={{ width: 360, height: 360, left: sx, top: sy,
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        filter: 'blur(24px)' }} />
  );
};

const AppLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const PageComponent = pages[activePage] || Dashboard;

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#050508' }}>
      <CursorGlow />
      {/* Global ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,58,237,0.07) 0%, transparent 60%)' }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 50% 40% at 100% 100%, rgba(6,182,212,0.04) 0%, transparent 50%)' }} />
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(139,92,246,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.025) 1px,transparent 1px)',
          backgroundSize:'80px 80px',
        }} />
        {/* Floating particles */}
        {AMBIENT.map(p => (
          <motion.div key={p.id} className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: `${p.color}0.55)`,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}0.35)`,
            }}
            animate={{ y: [0, -28, 0], x: [0, 8, -8, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <Sidebar active={activePage} onNavigate={setActivePage} onCollapse={setSidebarCollapsed} />

      <motion.main
        className="flex-1 min-h-screen overflow-auto relative z-10"
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={activePage}
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(0px)', pointerEvents: 'none' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 max-w-6xl mx-auto">
            <PageComponent onNavigate={setActivePage} />
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default AppLayout;
