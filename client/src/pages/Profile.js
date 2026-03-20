import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUser, HiMail, HiCurrencyDollar, HiShieldCheck,
  HiPencil, HiCheck, HiSparkles, HiLockClosed,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { code: 'INR', symbol: '₹',  label: 'Indian Rupee' },
  { code: 'USD', symbol: '$',  label: 'US Dollar' },
  { code: 'EUR', symbol: '€',  label: 'Euro' },
  { code: 'GBP', symbol: '£',  label: 'British Pound' },
  { code: 'JPY', symbol: '¥',  label: 'Japanese Yen' },
  { code: 'CAD', symbol: '$',  label: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$',  label: 'Australian Dollar' },
  { code: 'SGD', symbol: '$',  label: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

const STATS = [
  { label: 'Account Type', value: 'Premium', color: '#a78bfa', icon: '✦' },
  { label: 'Auth Method',  value: 'JWT / Email', color: '#06b6d4', icon: '⬡' },
  { label: 'Status',       value: 'Active', color: '#10b981', icon: '◉' },
];

/* Floating orb */
const Orb = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none animate-pulse-glow" style={style} />
);

/* Animated input field */
const Field = ({ label, icon: Icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
  >
    <label className="text-white/30 text-xs uppercase tracking-widest mb-2 block">{label}</label>
    <div className="relative group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
        style={{ color: 'rgba(255,255,255,0.2)' }}>
        <Icon size={14} />
      </div>
      {children}
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.4), 0 0 20px rgba(139,92,246,0.08)' }} />
    </div>
  </motion.div>
);

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm]     = useState({ name: user?.name || '', currency: user?.currency || 'INR' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]   = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const selectedCur = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0];

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      setSaved(true);
      toast.success('Profile updated');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-white/25 text-sm mb-0.5">Account</p>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-white">Your </span>
          <span style={{ background: 'linear-gradient(135deg,#a78bfa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Profile
          </span>
        </h1>
      </motion.div>

      {/* Avatar hero card */}
      <motion.div
        className="relative rounded-2xl overflow-hidden p-6"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ borderColor: 'rgba(139,92,246,0.2)' }}
      >
        {/* Background orbs */}
        <Orb style={{ width: 160, height: 160, top: -60, right: -40, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
        <Orb style={{ width: 100, height: 100, bottom: -30, left: 20, background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }} />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.5),rgba(6,182,212,0.3),transparent)' }} />

        <div className="flex items-center gap-5 relative z-10">
          {/* Avatar */}
          <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}>
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.15),transparent)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <span className="relative z-10">{initials}</span>
            </div>
            {/* Online dot */}
            <motion.div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#050508', border: '2px solid #050508' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 8px rgba(16,185,129,0.8)' }} />
            </motion.div>
          </motion.div>

          <div className="flex-1">
            <motion.p
              className="text-white font-bold text-xl"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            >
              {user?.name}
            </motion.p>
            <motion.p
              className="text-white/35 text-sm mt-0.5"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            >
              {user?.email}
            </motion.p>
            <motion.div
              className="flex items-center gap-2 mt-2.5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            >
              <span className="badge-purple flex items-center gap-1.5">
                <HiSparkles size={10} /> Premium Member
              </span>
              <span className="badge-green flex items-center gap-1.5">
                <HiShieldCheck size={10} /> Verified
              </span>
            </motion.div>
          </div>

          {/* Currency badge */}
          <motion.div
            className="flex-shrink-0 text-center"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
          >
            <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <span className="text-xl font-bold text-purple-300">{selectedCur.symbol}</span>
              <span className="text-white/30 text-xs mt-0.5">{selectedCur.code}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="rounded-2xl p-4 text-center relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
            whileHover={{ y: -2, borderColor: `${s.color}30` }}
          >
            <div className="absolute top-0 right-0 w-12 h-12 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`, filter: 'blur(10px)' }} />
            <p className="text-lg mb-1" style={{ color: s.color }}>{s.icon}</p>
            <p className="text-white/70 text-xs font-semibold">{s.value}</p>
            <p className="text-white/25 text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Edit form */}
      <motion.div
        className="relative rounded-2xl overflow-hidden p-5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5 }}
      >
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(6,182,212,0.4),transparent)' }} />

        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <HiPencil size={13} className="text-purple-400" />
          </div>
          <h3 className="text-white font-semibold">Edit Profile</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Full Name" icon={HiUser} delay={0.28}>
            <input type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field pl-9 text-sm" placeholder="Your name" />
          </Field>

          <Field label="Email Address" icon={HiMail} delay={0.32}>
            <input type="email" value={user?.email} disabled
              className="input-field pl-9 text-sm cursor-not-allowed"
              style={{ opacity: 0.35 }} />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <HiLockClosed size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
          </Field>

          <Field label="Currency" icon={HiCurrencyDollar} delay={0.36}>
            <select value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="input-field pl-9 text-sm appearance-none cursor-pointer"
              style={{ background: '#0f0e1a', color: '#e2e8f0' }}>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} style={{ background: '#0f0e1a' }}>
                  {c.symbol}  {c.code} — {c.label}
                </option>
              ))}
            </select>
          </Field>

          <motion.button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
            whileHover={{ boxShadow: '0 6px 30px rgba(124,58,237,0.5)', y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span key="loading" className="flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.span className="w-4 h-4 border-2 rounded-full"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }}
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  Saving...
                </motion.span>
              ) : saved ? (
                <motion.span key="saved" className="flex items-center justify-center gap-2 text-emerald-300"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <HiCheck size={16} /> Saved
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Save Changes
                </motion.span>
              )}
            </AnimatePresence>
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
            />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
