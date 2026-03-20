import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiTrendingUp, HiTrendingDown, HiCurrencyDollar, HiSparkles,
  HiPlus, HiArrowUp, HiArrowDown, HiRefresh, HiLightningBolt,
  HiChartBar, HiCog,
} from 'react-icons/hi';
import { analyticsAPI, transactionsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, categoryColors } from '../utils/format';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import InsightCard from '../components/ui/InsightCard';
import TrendLineChart from '../components/charts/TrendLineChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import AddTransactionModal from '../components/ui/AddTransactionModal';

const Shimmer = ({ className }) => <div className={`shimmer rounded-xl ${className}`} />;

/* ── Stat card ── */
const StatCard = ({ label, value, icon: Icon, gradient, glowColor, change, currency = 'INR', sub, loading, delay = 0 }) => (
  <motion.div className="relative rounded-2xl p-5 overflow-hidden cursor-default"
    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -3, borderColor: 'rgba(255,255,255,0.1)', transition: { duration: 0.2 } }}>
    {/* Top accent */}
    <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg,transparent,${glowColor},transparent)` }} />
    {/* Corner glow */}
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 70%)`, filter: 'blur(20px)' }} />
    {loading ? (
      <div className="space-y-3"><Shimmer className="h-8 w-8" /><Shimmer className="h-3 w-24" /><Shimmer className="h-7 w-32" /></div>
    ) : (
      <>
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: gradient, boxShadow: `0 4px 16px ${glowColor}` }}>
            <Icon size={16} className="text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${Number(change) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {Number(change) >= 0 ? <HiArrowUp size={10} /> : <HiArrowDown size={10} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-white text-2xl font-bold tracking-tight">
          <AnimatedCounter value={value} currency={currency} />
        </p>
        {sub && <p className="text-white/25 text-xs mt-1">{sub}</p>}
      </>
    )}
  </motion.div>
);

/* ── Quick action button ── */
const QuickAction = ({ icon: Icon, label, color, onClick, delay }) => (
  <motion.button onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 relative overflow-hidden"
    style={{
      background: `${color}10`,
      border: `1px solid ${color}30`,
      boxShadow: `0 0 18px ${color}18`,
    }}
    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{
      y: -4,
      background: `${color}1e`,
      borderColor: `${color}60`,
      boxShadow: `0 0 32px ${color}40, 0 0 8px ${color}25`,
      transition: { duration: 0.18 },
    }}
    whileTap={{ scale: 0.95 }}>
    {/* Top accent line */}
    <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg,transparent,${color}80,transparent)` }} />
    {/* Ambient glow blob */}
    <div className="absolute inset-0 pointer-events-none rounded-2xl"
      style={{ background: `radial-gradient(circle at 50% 0%, ${color}18 0%, transparent 70%)` }} />
    <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center"
      style={{
        background: `${color}20`,
        border: `1px solid ${color}40`,
        boxShadow: `0 0 14px ${color}30`,
      }}>
      <Icon size={18} style={{ color, filter: `drop-shadow(0 0 4px ${color}90)` }} />
    </div>
    <span className="relative z-10 text-xs font-semibold" style={{ color, textShadow: `0 0 10px ${color}80` }}>
      {label}
    </span>
  </motion.button>
);

const Dashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [summary, setSummary]       = useState(null);
  const [trends, setTrends]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [insights, setInsights]     = useState([]);
  const [health, setHealth]         = useState(null);
  const [mom, setMom]               = useState(null);
  const [recentTx, setRecentTx]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd]       = useState(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [s, t, c, i, h, m, tx] = await Promise.all([
        analyticsAPI.getSummary(), analyticsAPI.getMonthly({ months: 6 }),
        analyticsAPI.getCategories({ months: 1 }), analyticsAPI.getInsights(),
        analyticsAPI.getHealth(), analyticsAPI.getMoM(),
        transactionsAPI.getAll({ limit: 6 }),
      ]);
      setSummary(s.data.data); setTrends(t.data.data); setCategories(c.data.data);
      setInsights(i.data.data); setHealth(h.data.data); setMom(m.data.data);
      setRecentTx(tx.data.transactions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const healthColor = health?.score >= 80 ? '#10b981' : health?.score >= 60 ? '#f59e0b' : '#ef4444';
  const cur = user?.currency || 'INR';

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <motion.div className="flex items-start justify-between"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <p className="text-white/25 text-xs uppercase tracking-widest font-medium">{greeting} 👋</p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-white">{user?.name?.split(' ')[0]}'s </span>
            <span style={{ background: 'linear-gradient(135deg,#a78bfa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Overview
            </span>
          </h1>
          <p className="text-white/20 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button onClick={() => fetchAll(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
            whileTap={{ scale: 0.9 }}
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}>
            <HiRefresh size={16} />
          </motion.button>
          <motion.button onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <HiPlus size={16} /> Add Transaction
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Net Balance"   value={summary?.balance || 0}  icon={HiCurrencyDollar}
          gradient="linear-gradient(135deg,#7c3aed,#6366f1)" glowColor="rgba(124,58,237,0.3)"
          change={mom?.changes?.income} currency={cur} sub="All time" loading={loading} delay={0} />
        <StatCard label="Total Income"  value={summary?.income || 0}   icon={HiTrendingUp}
          gradient="linear-gradient(135deg,#10b981,#06b6d4)" glowColor="rgba(16,185,129,0.3)"
          change={mom?.changes?.income} currency={cur} sub={`${summary?.incomeCount || 0} transactions`} loading={loading} delay={0.06} />
        <StatCard label="Total Expense" value={summary?.expense || 0}  icon={HiTrendingDown}
          gradient="linear-gradient(135deg,#ef4444,#f97316)" glowColor="rgba(239,68,68,0.3)"
          change={mom?.changes?.expense} currency={cur} sub={`${summary?.expenseCount || 0} transactions`} loading={loading} delay={0.12} />
        {/* Health score */}
        <motion.div className="relative rounded-2xl p-5 overflow-hidden cursor-default"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle at top right, ${healthColor}40 0%, transparent 70%)`, filter: 'blur(20px)' }} />
          {loading ? <div className="space-y-3"><Shimmer className="h-8 w-8" /><Shimmer className="h-3 w-24" /><Shimmer className="h-7 w-20" /></div> : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${healthColor}20`, border: `1px solid ${healthColor}30` }}>
                  <HiSparkles size={16} style={{ color: healthColor }} />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ background: `${healthColor}15`, color: healthColor }}>{health?.grade}</span>
              </div>
              <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-1">Health Score</p>
              <p className="text-2xl font-bold" style={{ color: healthColor }}>
                <AnimatedCounter value={health?.score || 0} suffix="/100" />
              </p>
              <p className="text-white/25 text-xs mt-1">Savings: {health?.savingsRate}%</p>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div className="lg:col-span-2 rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)' }} />
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Cash Flow Trend</h3>
              <p className="text-white/25 text-xs mt-0.5">Net balance over 6 months</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}>
              6 months
            </span>
          </div>
          {loading ? <Shimmer className="h-52 w-full" /> : <TrendLineChart data={trends} />}
        </motion.div>

        <motion.div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(6,182,212,0.4),transparent)' }} />
          <div className="mb-5">
            <h3 className="text-white font-semibold">Spending Breakdown</h3>
            <p className="text-white/25 text-xs mt-0.5">This month by category</p>
          </div>
          {loading ? <Shimmer className="h-52 w-full" /> : <CategoryPieChart data={categories} />}
        </motion.div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* AI Insights */}
        <motion.div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent)' }} />
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <HiSparkles size={13} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">AI Insights</h3>
              <p className="text-white/25 text-xs">Personalized recommendations</p>
            </div>
            <motion.div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(167,139,250,0.6)' }}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Live
            </motion.div>
          </div>
          {loading ? (
            <div className="space-y-2.5">{[1,2,3].map(i => <Shimmer key={i} className="h-14 w-full" />)}</div>
          ) : (
            <div className="space-y-2.5">
              {insights.map((insight, i) => <InsightCard key={i} insight={insight} index={i} />)}
            </div>
          )}
        </motion.div>

        {/* Recent transactions */}
        <motion.div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(16,185,129,0.4),transparent)' }} />
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold text-sm">Recent Transactions</h3>
              <p className="text-white/25 text-xs mt-0.5">Latest activity</p>
            </div>
            <button onClick={() => onNavigate('transactions')}
              className="text-xs transition-colors" style={{ color: 'rgba(167,139,250,0.6)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(167,139,250,0.6)'}>
              View all →
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5"><Shimmer className="h-3 w-3/4" /><Shimmer className="h-2 w-1/2" /></div>
                <Shimmer className="h-4 w-16" />
              </div>
            ))}</div>
          ) : recentTx.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2 opacity-20">◈</div>
              <p className="text-white/20 text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTx.map((tx, i) => (
                <motion.div key={tx._id}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all cursor-default"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: tx.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      color: tx.type === 'income' ? '#10b981' : '#ef4444',
                      border: `1px solid ${tx.type === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                    {tx.category.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/65 text-xs font-medium truncate">{tx.description || tx.category}</p>
                    <p className="text-white/25 text-xs">{tx.category} · {formatDate(tx.date)}</p>
                  </div>
                  <p className={`text-xs font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, cur)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Quick actions ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
        <p className="text-white/20 text-xs uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={HiPlus}         label="Add"        color="#a78bfa" onClick={() => setShowAdd(true)}              delay={0.46} />
          <QuickAction icon={HiChartBar}     label="Analytics"  color="#06b6d4" onClick={() => onNavigate('analytics')}       delay={0.5} />
          <QuickAction icon={HiLightningBolt} label="Insights"  color="#10b981" onClick={() => onNavigate('analytics')}       delay={0.54} />
          <QuickAction icon={HiCog}          label="Settings"   color="#94a3b8" onClick={() => onNavigate('settings')}        delay={0.58} />
        </div>
      </motion.div>

      <AddTransactionModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => fetchAll(true)} />
    </div>
  );
};

export default Dashboard;
