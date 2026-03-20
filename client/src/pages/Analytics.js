import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiChartBar, HiLightningBolt, HiTrendingUp, HiSparkles,
  HiArrowUp, HiArrowDown, HiRefresh,
} from 'react-icons/hi';
import { analyticsAPI } from '../api';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import SpendingHeatmap from '../components/charts/SpendingHeatmap';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const Sk = ({ className }) => <div className={`shimmer rounded-xl ${className}`} />;

const tabs = [
  { id: 'overview',   label: 'Overview',   icon: HiChartBar,      color: '#a78bfa' },
  { id: 'predictive', label: 'Predictive', icon: HiTrendingUp,    color: '#06b6d4' },
  { id: 'behavioral', label: 'Behavioral', icon: HiLightningBolt, color: '#f59e0b' },
];

/* Metric card */
const MetricCard = ({ label, value, change, color, bg, border, currency, suffix, decimals = 0, delay = 0 }) => (
  <motion.div className="rounded-2xl p-5 relative overflow-hidden"
    style={{ background: bg, border: `1px solid ${border}` }}
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}>
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle at top right, ${color}30 0%, transparent 70%)`, filter: 'blur(16px)' }} />
    <p className="text-white/30 text-xs uppercase tracking-wider mb-2">{label}</p>
    <p className="text-2xl font-bold" style={{ color }}>
      {currency
        ? <AnimatedCounter value={value} currency={currency} />
        : <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />}
    </p>
    {change !== undefined && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium`}
        style={{ color: Number(change) >= 0 ? '#10b981' : '#ef4444' }}>
        {Number(change) >= 0 ? <HiArrowUp size={10} /> : <HiArrowDown size={10} />}
        {Math.abs(change)}% vs last month
      </div>
    )}
  </motion.div>
);

/* Section wrapper */
const Section = ({ title, subtitle, children, delay = 0, accentColor = 'rgba(124,58,237,0.4)' }) => (
  <motion.div className="rounded-2xl p-5 relative overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.45 }}>
    <div className="absolute top-0 left-0 right-0 h-px"
      style={{ background: `linear-gradient(90deg,transparent,${accentColor},transparent)` }} />
    {(title || subtitle) && (
      <div className="mb-5">
        {title && <h3 className="text-white font-semibold">{title}</h3>}
        {subtitle && <p className="text-white/25 text-xs mt-0.5">{subtitle}</p>}
      </div>
    )}
    {children}
  </motion.div>
);

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData]       = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const cur = user?.currency || 'INR';

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [summary, monthly, cats, mom, forecast, behavioral, health, heatmap] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getMonthly({ months: 12 }),
        analyticsAPI.getCategories({ months: 3 }),
        analyticsAPI.getMoM(),
        analyticsAPI.getForecast(),
        analyticsAPI.getBehavioral(),
        analyticsAPI.getHealth(),
        analyticsAPI.getHeatmap(),
      ]);
      setData({
        summary: summary.data.data, monthly: monthly.data.data,
        categories: cats.data.data, mom: mom.data.data,
        forecast: forecast.data.data, behavioral: behavioral.data.data,
        health: health.data.data, heatmap: heatmap.data.data,
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const healthColor = data.health?.score >= 80 ? '#10b981' : data.health?.score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div className="flex items-start justify-between"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <p className="text-white/25 text-xs uppercase tracking-widest font-medium">Financial Intelligence</p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-white">Analytics </span>
            <span style={{ background: 'linear-gradient(135deg,#a78bfa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Engine
            </span>
          </h1>
          <p className="text-white/20 text-sm mt-1">Multi-layer financial intelligence</p>
        </div>
        <motion.button onClick={() => fetchAll(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
          whileTap={{ scale: 0.9 }}
          animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
          transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}>
          <HiRefresh size={16} />
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }}>
              {isActive && (
                <motion.div layoutId="analytics-tab" className="absolute inset-0 rounded-lg"
                  style={{ background: `linear-gradient(135deg,${tab.color}30,${tab.color}15)`, border: `1px solid ${tab.color}25` }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
              )}
              <Icon size={14} className="relative z-10" style={{ color: isActive ? tab.color : undefined }} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" className="space-y-4"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>

            {/* MoM metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {loading ? [1,2,3].map(i => <Sk key={i} className="h-28" />) : [
                { label: 'This Month Income',  value: data.mom?.thisMonth?.income  || 0, change: data.mom?.changes?.income,  color: '#10b981', bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.12)',  currency: cur },
                { label: 'This Month Expense', value: data.mom?.thisMonth?.expense || 0, change: data.mom?.changes?.expense, color: '#ef4444', bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.12)',   currency: cur },
                { label: 'Savings Rate',       value: data.summary?.savingsRate    || 0,                                     color: '#a78bfa', bg: 'rgba(167,139,250,0.05)', border: 'rgba(167,139,250,0.12)', suffix: '%', decimals: 1 },
              ].map((item, i) => <MetricCard key={item.label} {...item} delay={i * 0.07} />)}
            </div>

            {/* Monthly bar */}
            <Section title="Monthly Income vs Expenses" subtitle="12-month comparison" delay={0.18} accentColor="rgba(124,58,237,0.4)">
              {loading ? <Sk className="h-60" /> : <MonthlyBarChart data={data.monthly} />}
            </Section>

            {/* Trend + Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Section title="Net Cash Flow" subtitle="Monthly net balance trend" delay={0.22} accentColor="rgba(6,182,212,0.4)">
                {loading ? <Sk className="h-48" /> : <TrendLineChart data={data.monthly} currency={cur} />}
              </Section>
              <Section title="Expense Categories" subtitle="Last 3 months breakdown" delay={0.26} accentColor="rgba(167,139,250,0.4)">
                {loading ? <Sk className="h-48" /> : <CategoryPieChart data={data.categories} />}
              </Section>
            </div>

            {/* Heatmap */}
            <Section title="Daily Spending Heatmap" subtitle="Last 90 days of expense activity" delay={0.3} accentColor="rgba(245,158,11,0.4)">
              {loading ? <Sk className="h-20" /> : <SpendingHeatmap data={data.heatmap} />}
            </Section>
          </motion.div>
        )}

        {/* ── PREDICTIVE ── */}
        {activeTab === 'predictive' && (
          <motion.div key="predictive" className="space-y-4"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>

            {/* Forecast */}
            <Section title="Next Month Forecast" subtitle="Based on 6-month trend analysis" delay={0} accentColor="rgba(124,58,237,0.4)">
              <div className="flex items-center gap-2 mb-5 -mt-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <HiTrendingUp size={13} className="text-purple-400" />
                </div>
                {data.forecast && !loading && (
                  <span className={`badge ${data.forecast.confidence === 'high' ? 'badge-green' : data.forecast.confidence === 'medium' ? 'badge-amber' : 'badge-purple'}`}>
                    {data.forecast.confidence} confidence
                  </span>
                )}
              </div>
              {loading ? <Sk className="h-28" /> : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Forecast Income',  value: data.forecast?.forecastIncome  || 0, color: '#10b981', bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.15)' },
                    { label: 'Forecast Expense', value: data.forecast?.forecastExpense || 0, color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.15)' },
                    { label: 'Forecast Balance', value: data.forecast?.forecastBalance || 0, color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.15)' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-4"
                      style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                      <p className="text-white/35 text-xs mb-2 uppercase tracking-wider">{item.label}</p>
                      <p className="text-xl font-bold" style={{ color: item.color }}>
                        <AnimatedCounter value={item.value} currency={cur} />
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Health score */}
            <Section title="Financial Health Score" subtitle="Composite wellness indicator" delay={0.1} accentColor={`${healthColor}60`}>
              <div className="flex items-center gap-2 mb-5 -mt-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <HiSparkles size={13} className="text-purple-400" />
                </div>
              </div>
              {loading ? <Sk className="h-32" /> : (
                <div className="flex items-center gap-8">
                  {/* Circular score */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
                      <motion.circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={healthColor} strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 100' }}
                        animate={{ strokeDasharray: `${data.health?.score || 0} 100` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ filter: `drop-shadow(0 0 6px ${healthColor}80)` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white font-bold text-2xl">{data.health?.score}</span>
                      <span className="text-white/30 text-xs">/ 100</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-semibold text-lg">{data.health?.grade}</p>
                      <p className="text-white/30 text-sm">Overall financial health</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Savings Rate',  value: `${data.health?.savingsRate}%` },
                        { label: 'Expense Ratio', value: `${data.health?.expenseRatio}%` },
                      ].map((m) => (
                        <div key={m.label} className="flex items-center gap-3">
                          <span className="text-white/30 text-xs w-24">{m.label}</span>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <motion.div className="h-full rounded-full"
                              style={{ background: healthColor }}
                              initial={{ width: 0 }}
                              animate={{ width: m.value }}
                              transition={{ duration: 1, delay: 0.3 }} />
                          </div>
                          <span className="text-white/60 text-xs font-medium w-10 text-right">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Section>
          </motion.div>
        )}

        {/* ── BEHAVIORAL ── */}
        {activeTab === 'behavioral' && (
          <motion.div key="behavioral" className="space-y-4"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>

            <Section title="Spending Patterns" subtitle="Last 3 months behavioral analysis" delay={0} accentColor="rgba(245,158,11,0.4)">
              <div className="flex items-center gap-2 mb-5 -mt-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <HiLightningBolt size={13} className="text-amber-400" />
                </div>
              </div>
              {loading ? <Sk className="h-48" /> : (
                <div className="space-y-6">
                  {/* Weekend vs Weekday */}
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Weekend vs Weekday Spending</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Weekend', value: data.behavioral?.weekendSpend || 0, color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.15)' },
                        { label: 'Weekday', value: data.behavioral?.weekdaySpend || 0, color: '#06b6d4', bg: 'rgba(6,182,212,0.06)',   border: 'rgba(6,182,212,0.15)' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl p-4"
                          style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                          <p className="text-white/35 text-xs mb-1.5">{item.label} Spending</p>
                          <p className="text-lg font-bold" style={{ color: item.color }}>
                            {formatCurrency(item.value, cur)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top categories */}
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Most Frequent Categories</p>
                    <div className="space-y-2">
                      {(data.behavioral?.topCategories || []).map((cat, i) => {
                        const pct = (cat.count / (data.behavioral?.topCategories[0]?.count || 1)) * 100;
                        return (
                          <div key={cat.category} className="flex items-center gap-3">
                            <span className="text-white/20 text-xs w-4 text-right">{i + 1}</span>
                            <div className="flex-1 rounded-lg overflow-hidden h-7 relative"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <motion.div className="absolute inset-y-0 left-0 flex items-center px-3 rounded-lg"
                                style={{ background: 'linear-gradient(90deg,rgba(124,58,237,0.25),rgba(99,102,241,0.15))' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                                <span className="text-white/70 text-xs font-medium whitespace-nowrap">{cat.category}</span>
                              </motion.div>
                            </div>
                            <span className="text-white/30 text-xs w-8 text-right">{cat.count}×</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recurring */}
                  {data.behavioral?.recurring?.length > 0 && (
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Detected Recurring Transactions</p>
                      <div className="space-y-1.5">
                        {data.behavioral.recurring.map((r) => (
                          <div key={r.description} className="flex items-center justify-between rounded-xl px-4 py-2.5"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              <span className="text-white/60 text-sm capitalize">{r.description}</span>
                            </div>
                            <span className="badge-purple">{r.count}×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analytics;
