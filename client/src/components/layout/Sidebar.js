import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiChartBar, HiCreditCard, HiUser, HiCog, HiLogout,
  HiSparkles, HiMenuAlt2, HiX, HiIdentification,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { id: 'dashboard',     label: 'Dashboard',    icon: HiHome,           color: '#a78bfa' },
  { id: 'analytics',    label: 'Analytics',    icon: HiChartBar,       color: '#06b6d4' },
  { id: 'transactions', label: 'Transactions', icon: HiCreditCard,     color: '#10b981' },
  { id: 'profile',      label: 'Profile',      icon: HiUser,           color: '#f59e0b' },
  { id: 'settings',     label: 'Settings',     icon: HiCog,            color: '#94a3b8' },
  { id: 'about',        label: 'About',        icon: HiIdentification, color: '#ec4899' },
];

const Sidebar = ({ active, onNavigate, onCollapse }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapse?.(next);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed left-0 top-0 h-full flex flex-col z-40 overflow-hidden"
      style={{
        background: 'rgba(5,5,8,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(40px)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-48 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
      <motion.div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }}
        animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 5, repeat: Infinity }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div className="flex items-center gap-2.5 overflow-hidden"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.2) 50%,transparent 60%)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
                <span className="text-white text-xs font-bold relative z-10">◈</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm tracking-tight leading-none">Quantiva</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <motion.span className="w-1 h-1 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <span className="text-white/25 text-xs">Live</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={toggleCollapse}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
          {collapsed ? <HiMenuAlt2 size={14} /> : <HiX size={14} />}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px mb-3 flex-shrink-0"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-hidden">
        {!collapsed && (
          <p className="text-white/20 text-xs font-medium px-3 mb-2 uppercase tracking-widest">Menu</p>
        )}
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <motion.button key={item.id} onClick={() => onNavigate(item.id)}
              className="w-full flex items-center rounded-xl transition-all duration-200 relative overflow-hidden"
              style={{
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? `${item.color}12` : 'transparent',
                border: isActive ? `1px solid ${item.color}20` : '1px solid transparent',
                color: isActive ? item.color : 'rgba(255,255,255,0.4)',
              }}
              whileHover={{ x: collapsed ? 0 : 2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {isActive && (
                <motion.div layoutId="nav-bg" className="absolute inset-0 rounded-xl"
                  style={{ background: `${item.color}08` }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
              )}
              <div className="relative z-10 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: isActive ? `${item.color}20` : 'rgba(255,255,255,0.05)' }}>
                <Icon size={14} style={{ color: isActive ? item.color : 'rgba(255,255,255,0.35)' }} />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span className="relative z-10 text-sm font-medium whitespace-nowrap"
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <motion.div layoutId="nav-dot" className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: item.color }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* AI status */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div className="mx-3 mb-3 rounded-xl p-3"
            style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}>
            <div className="flex items-center gap-2 mb-1">
              <HiSparkles size={11} className="text-purple-400" />
              <span className="text-purple-400 text-xs font-medium">AI Engine</span>
              <motion.span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </div>
            <p className="text-white/25 text-xs">Analyzing your patterns</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User + logout */}
      <div className="px-2 pb-4 flex-shrink-0">
        <div className="h-px mb-3 mx-2"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer transition-all"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          onClick={() => onNavigate('profile')}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div className="flex-1 min-w-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-white/60 text-xs font-medium truncate">{user?.name}</p>
                <p className="text-white/20 text-xs truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={logout}
          className="w-full flex items-center rounded-xl px-2 py-2 mt-1 text-xs transition-all duration-200"
          style={{ gap: collapsed ? 0 : 8, justifyContent: collapsed ? 'center' : 'flex-start', color: 'rgba(255,255,255,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}>
          <HiLogout size={14} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
