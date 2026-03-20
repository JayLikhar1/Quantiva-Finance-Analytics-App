import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronRight, HiChevronLeft, HiCheck, HiCurrencyDollar } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { authAPI, analyticsAPI } from '../api';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

const BUDGET_CATEGORIES = [
  { id: 'Food',          color: '#f97316', icon: '🍔' },
  { id: 'Transport',     color: '#3b82f6', icon: '🚗' },
  { id: 'Housing',       color: '#8b5cf6', icon: '🏠' },
  { id: 'Entertainment', color: '#ec4899', icon: '🎬' },
  { id: 'Healthcare',    color: '#10b981', icon: '💊' },
  { id: 'Shopping',      color: '#f59e0b', icon: '🛍️' },
  { id: 'Education',     color: '#06b6d4', icon: '📚' },
  { id: 'Utilities',     color: '#6366f1', icon: '⚡' },
  { id: 'Travel',        color: '#14b8a6', icon: '✈️' },
  { id: 'Subscriptions', color: '#a855f7', icon: '📱' },
];

const SECTIONS = [
  { id: 'appearance',    label: 'Appearance',        icon: '🎨', desc: 'Theme & display',      color: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
  { id: 'budgets',       label: 'Budget Limits',      icon: '💰', desc: 'Monthly spending caps', color: '#10b981', glow: 'rgba(16,185,129,0.15)' },
  { id: 'notifications', label: 'Notifications',      icon: '🔔', desc: 'Alerts & reports',      color: '#06b6d4', glow: 'rgba(6,182,212,0.15)' },
  { id: 'privacy',       label: 'Privacy & Security', icon: '🔒', desc: 'Security settings',     color: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  { id: 'data',          label: 'Data & Storage',     icon: '💾', desc: 'Export & backup',       color: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
];

const TOGGLE_SECTIONS = {
  appearance: [
    { id: 'animations', label: 'Animations',   desc: 'Enable UI motion effects',    value: true  },
    { id: 'compact',    label: 'Compact Mode', desc: 'Reduce spacing and padding',  value: false },
    { id: 'blur',       label: 'Blur Effects', desc: 'Glassmorphism backgrounds',   value: true  },
  ],
  notifications: [
    { id: 'budget',   label: 'Budget Alerts',  desc: 'Alert when near budget limit', value: true  },
    { id: 'weekly',   label: 'Weekly Summary', desc: 'Weekly spending digest',       value: true  },
    { id: 'insights', label: 'AI Insights',    desc: 'Smart financial tips',         value: true  },
    { id: 'anomaly',  label: 'Anomaly Alerts', desc: 'Unusual spending detected',    value: false },
  ],
  privacy: [
    { id: 'biometric', label: 'Biometric Lock',  desc: 'Fingerprint / Face ID',    value: false },
    { id: 'analytics', label: 'Usage Analytics', desc: 'Help improve the app',     value: true  },
    { id: 'session',   label: 'Auto Logout',     desc: 'Logout after 30 days',     value: true  },
  ],
  data: [
    { id: 'backup', label: 'Auto Backup',     type: 'toggle', desc: 'Backup data automatically', value: true  },
    { id: 'export', label: 'Export All Data', type: 'action', desc: 'Download your data as CSV'  },
    { id: 'clear',  label: 'Clear Cache',     type: 'action', desc: 'Free up local storage'      },
  ],
};

/* Toggle */
const Toggle = ({ value, onChange, color = '#7c3aed' }) => (
  <motion.button onClick={() => onChange(!value)} className="relative flex-shrink-0"
    style={{ width: 44, height: 24 }} whileTap={{ scale: 0.92 }}>
    {/* Use style + CSS transition — no gradient animation */}
    <div className="absolute inset-0 rounded-full transition-all duration-300"
      style={{
        background: value ? color : 'rgba(255,255,255,0.08)',
        boxShadow: value ? `0 0 14px ${color}70` : 'none',
      }} />
    <motion.div className="absolute top-1 w-4 h-4 bg-white rounded-full"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
      animate={{ left: value ? 26 : 4 }}
      transition={{ type: 'spring', stiffness: 600, damping: 35 }} />
  </motion.button>
);

/* Section card */
const SectionCard = ({ section, index, onClick }) => (
  <motion.button onClick={onClick}
    className="w-full relative rounded-2xl p-4 text-left overflow-hidden group"
    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -2, borderColor: `${section.color}30` }} whileTap={{ scale: 0.98 }}>
    <motion.div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: `radial-gradient(ellipse at top left, ${section.glow} 0%, transparent 60%)` }} />
    <motion.div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: `linear-gradient(90deg,transparent,${section.color}60,transparent)` }} />
    <div className="flex items-center gap-4 relative z-10">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${section.color}12`, border: `1px solid ${section.color}20` }}>
        {section.icon}
      </div>
      <div className="flex-1">
        <p className="text-white/80 font-semibold text-sm">{section.label}</p>
        <p className="text-white/25 text-xs mt-0.5">{section.desc}</p>
      </div>
      <HiChevronRight size={16} className="text-white/15 group-hover:text-white/40 transition-colors" />
    </div>
  </motion.button>
);

/* Budget row */
const BudgetRow = ({ cat, budget, spent, currency, onChange, index }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(budget || '');
  const pct   = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const over  = spent > budget && budget > 0;
  const color = over ? '#ef4444' : pct > 75 ? '#f59e0b' : cat.color;

  const commit = () => {
    setEditing(false);
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) onChange(n);
  };

  return (
    <motion.div className="px-4 py-3.5 rounded-xl group"
      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ background: 'rgba(255,255,255,0)' }}
      whileHover={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-base">{cat.icon}</span>
        <span className="text-white/70 text-sm font-medium flex-1">{cat.id}</span>
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input autoFocus type="number" value={val}
              onChange={e => setVal(e.target.value)}
              onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()}
              className="w-24 rounded-lg px-2 py-1 text-xs text-white text-right"
              style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${cat.color}40`, outline: 'none' }} />
          </div>
        ) : (
          <button onClick={() => setEditing(true)}
            className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all"
            style={{ background: budget ? `${cat.color}12` : 'rgba(255,255,255,0.05)', color: budget ? cat.color : 'rgba(255,255,255,0.3)', border: `1px solid ${budget ? cat.color + '25' : 'rgba(255,255,255,0.08)'}` }}>
            {budget ? formatCurrency(budget, currency) : '+ Set limit'}
          </button>
        )}
      </div>
      {budget > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
          </div>
          <div className="flex justify-between">
            <span className="text-white/25 text-xs">{formatCurrency(spent, currency)} spent</span>
            <span className="text-xs font-medium" style={{ color }}>
              {over ? `${formatCurrency(spent - budget, currency)} over` : `${formatCurrency(budget - spent, currency)} left`}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const Settings = () => {
  const { user, logout } = useAuth();
  const cur = user?.currency || 'INR';

  const [activeSection, setActiveSection] = useState(null);
  const [settings, setSettings] = useState(() => {
    const init = {};
    Object.values(TOGGLE_SECTIONS).flat().forEach(item => { if (item.value !== undefined) init[item.id] = item.value; });
    return init;
  });
  const [changed, setChanged] = useState({});

  // Budgets
  const [budgets, setBudgets]   = useState({});
  const [spends, setSpends]     = useState({});
  const [budgetLoading, setBudgetLoading] = useState(false);

  const section = SECTIONS.find(s => s.id === activeSection);

  const loadBudgets = useCallback(async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        authAPI.getBudgets(),
        analyticsAPI.getCategorySpend({ months: 1, type: 'expense' }),
      ]);
      setBudgets(bRes.data.budgets || {});
      const spendMap = {};
      (cRes.data.data || []).forEach(c => { spendMap[c.category] = c.total; });
      setSpends(spendMap);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (activeSection === 'budgets') loadBudgets();
  }, [activeSection, loadBudgets]);

  const handleBudgetChange = async (catId, value) => {
    const updated = { ...budgets, [catId]: value };
    setBudgets(updated);
    setBudgetLoading(true);
    try {
      await authAPI.saveBudgets(updated);
      toast.success(`${catId} budget saved`);
    } catch { toast.error('Failed to save budget'); }
    finally { setBudgetLoading(false); }
  };

  const handleToggle = (id, v) => {
    setSettings(prev => ({ ...prev, [id]: v }));
    setChanged(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setChanged(prev => ({ ...prev, [id]: false })), 1500);
    const label = Object.values(TOGGLE_SECTIONS).flat().find(i => i.id === id)?.label || id;
    toast.success(`${label} ${v ? 'enabled' : 'disabled'}`);
  };

  const handleAction = (id) => {
    if (id === 'export') toast.success('Export started');
    if (id === 'clear')  toast.success('Cache cleared');
  };

  const renderSection = () => {
    if (activeSection === 'budgets') {
      const totalBudget = BUDGET_CATEGORIES.reduce((s, c) => s + (budgets[c.id] || 0), 0);
      const totalSpent  = BUDGET_CATEGORIES.reduce((s, c) => s + (spends[c.id] || 0), 0);
      const overallPct  = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

      return (
        <motion.div key="budgets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="space-y-3">

          {/* Summary bar */}
          {totalBudget > 0 && (
            <motion.div className="relative rounded-2xl p-4 overflow-hidden"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/50 text-xs uppercase tracking-wider">Monthly Total</span>
                <span className="text-xs font-medium" style={{ color: overallPct > 90 ? '#ef4444' : '#10b981' }}>
                  {overallPct.toFixed(0)}% used
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-semibold">{formatCurrency(totalSpent, cur)}</span>
                <span className="text-white/30">of {formatCurrency(totalBudget, cur)}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: overallPct > 90 ? '#ef4444' : 'linear-gradient(90deg,#10b981,#06b6d4)' }}
                  initial={{ width: 0 }} animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} />
              </div>
            </motion.div>
          )}

          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(16,185,129,0.5),transparent)' }} />
            <div className="absolute top-0 left-0 w-full h-20 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
            <div className="p-2 relative z-10">
              {BUDGET_CATEGORIES.map((cat, i) => (
                <BudgetRow key={cat.id} cat={cat} budget={budgets[cat.id] || 0}
                  spent={spends[cat.id] || 0} currency={cur}
                  onChange={(v) => handleBudgetChange(cat.id, v)} index={i} />
              ))}
            </div>
          </div>
          {budgetLoading && (
            <p className="text-center text-white/20 text-xs">Saving...</p>
          )}
        </motion.div>
      );
    }

    const items = TOGGLE_SECTIONS[activeSection] || [];
    return (
      <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
        <div className="relative rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg,transparent,${section.color}60,transparent)` }} />
          <div className="absolute top-0 left-0 w-full h-24 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at top, ${section.glow} 0%, transparent 70%)` }} />
          <div className="p-2 relative z-10">
            {items.map((item, i) => (
              <motion.div key={item.id}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{ background: 'rgba(255,255,255,0)' }}
                whileHover={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex-1 mr-4">
                  <p className="text-white/75 text-sm font-medium">{item.label}</p>
                  <p className="text-white/25 text-xs mt-0.5">{item.desc}</p>
                </div>
                {(!item.type || item.type === 'toggle') && (
                  <Toggle value={settings[item.id] ?? false}
                    onChange={(v) => handleToggle(item.id, v)} color={section.color} />
                )}
                {item.type === 'action' && (
                  <motion.button onClick={() => handleAction(item.id)}
                    className="text-xs font-medium px-3.5 py-1.5 rounded-lg"
                    style={{ background: `${section.color}15`, color: section.color, border: `1px solid ${section.color}25` }}
                    whileHover={{ background: `${section.color}25` }} whileTap={{ scale: 0.95 }}>
                    Run
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {Object.values(changed).some(Boolean) && (
            <motion.div className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <HiCheck size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Changes saved automatically</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center gap-3"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <AnimatePresence>
          {activeSection && (
            <motion.button onClick={() => setActiveSection(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
              initial={{ opacity: 0, x: -12, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.8 }}
              whileHover={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} whileTap={{ scale: 0.9 }}>
              <HiChevronLeft size={16} />
            </motion.button>
          )}
        </AnimatePresence>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-slate-400"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <p className="text-white/25 text-xs uppercase tracking-widest font-medium">{activeSection ? section?.desc : 'Preferences'}</p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeSection ? (
              <motion.span key={activeSection} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ color: section?.color }}>{section?.label}</motion.span>
            ) : (
              <>
                <span className="text-white">App </span>
                <span style={{ background: 'linear-gradient(135deg,#a78bfa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Settings
                </span>
              </>
            )}
          </h1>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!activeSection ? (
          <motion.div key="main" className="space-y-2.5"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {SECTIONS.map((s, i) => (
              <SectionCard key={s.id} section={s} index={i} onClick={() => setActiveSection(s.id)} />
            ))}
            {/* Danger zone */}
            <motion.div className="relative rounded-2xl p-4 overflow-hidden mt-2"
              style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)' }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(239,68,68,0.3),transparent)' }} />
              <p className="text-white/20 text-xs uppercase tracking-widest mb-3">Danger Zone</p>
              <motion.button
                onClick={() => { if (window.confirm('Sign out of Quantiva?')) logout(); }}
                className="w-full py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.06)', color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.12)' }}
                whileHover={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', boxShadow: '0 0 20px rgba(239,68,68,0.15)' }}
                whileTap={{ scale: 0.98 }}>
                Sign Out
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          renderSection()
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
