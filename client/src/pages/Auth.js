import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Cursor glow ─── */
const CursorGlow = () => {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 70, damping: 18 });
  const sy = useSpring(y, { stiffness: 70, damping: 18 });
  useEffect(() => {
    const move = (e) => { x.set(e.clientX - 220); y.set(e.clientY - 220); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);
  return (
    <motion.div className="fixed pointer-events-none z-0 rounded-full"
      style={{ width: 440, height: 440, left: sx, top: sy,
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        filter: 'blur(30px)' }} />
  );
};

/* ─── Particles ─── */
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 2.8 + 0.4,
  dur: Math.random() * 20 + 12, delay: Math.random() * 14,
  color: ['rgba(167,139,250,', 'rgba(6,182,212,', 'rgba(236,72,153,', 'rgba(255,255,255,'][i % 4],
}));

const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {PARTICLES.map((p) => (
      <motion.div key={p.id} className="absolute rounded-full"
        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
          background: `${p.color}0.65)`, boxShadow: `0 0 ${p.size * 3}px ${p.color}0.4)` }}
        animate={{ y: [0, -90, 0], x: [0, (Math.random() - 0.5) * 50, 0], opacity: [0, 0.9, 0], scale: [0, 1, 0] }}
        transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
    ))}
  </div>
);

/* ─── Animated grid ─── */
const Grid = () => (
  <motion.div className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),
                        linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px)`,
      backgroundSize: '64px 64px',
    }}
    animate={{ opacity: [0.4, 0.9, 0.4] }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
);

/* ─── Orbit rings ─── */
const OrbitRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
    {[280, 480, 680, 880].map((size, i) => (
      <motion.div key={size} className="absolute rounded-full"
        style={{ width: size, height: size, border: `1px solid rgba(139,92,246,${0.07 - i * 0.012})` }}
        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
        transition={{ duration: 28 + i * 14, repeat: Infinity, ease: 'linear' }} />
    ))}
  </div>
);

/* ─── Floating label input ─── */
const FloatingInput = ({ label, type, value, onChange, required, icon, showToggle, onToggle, show }) => {
  const [focused, setFocused] = useState(false);
  const hasVal = value.length > 0;
  return (
    <div className="relative group">
      <motion.label className="absolute left-11 pointer-events-none text-sm z-10"
        animate={{
          top: focused || hasVal ? '7px' : '50%',
          y: focused || hasVal ? '0%' : '-50%',
          fontSize: focused || hasVal ? '10px' : '13px',
          color: focused ? 'rgba(167,139,250,1)' : 'rgba(255,255,255,0.22)',
        }}
        transition={{ duration: 0.16, ease: 'easeOut' }}>
        {label}
      </motion.label>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-200"
        style={{ color: focused ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.18)' }}>
        {icon}
      </div>
      <input type={showToggle ? (show ? 'text' : 'password') : type}
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        required={required}
        className="w-full rounded-2xl pl-11 pr-10 pb-3 pt-6 text-white text-sm focus:outline-none transition-all duration-200"
        style={{
          background: focused ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${focused ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.1), 0 0 28px rgba(139,92,246,0.1)' : 'none',
        }} />
      {showToggle && (
        <button type="button" onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200"
          style={{ color: 'rgba(255,255,255,0.2)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(167,139,250,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
          {show
            ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          }
        </button>
      )}
      <motion.div className="absolute bottom-0 left-4 right-4 h-px rounded-full"
        style={{ background: 'linear-gradient(90deg,transparent,#a78bfa,#06b6d4,transparent)' }}
        animate={{ opacity: focused ? 1 : 0, scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.2 }} />
    </div>
  );
};

/* ─── Magnetic button ─── */
const MagneticButton = ({ children, onClick, disabled, type = 'button', style = {}, onMouseEnter, onMouseLeave }) => {
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  const handleMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.22);
    y.set((e.clientY - r.top - r.height / 2) * 0.22);
  };
  const handleLeave = (e) => { x.set(0); y.set(0); onMouseLeave?.(e); };
  return (
    <motion.button ref={ref} type={type} onClick={onClick} disabled={disabled}
      onMouseMove={handleMove} onMouseLeave={handleLeave} onMouseEnter={onMouseEnter}
      style={{ x: sx, y: sy, ...style }} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
};

/* ─── Typewriter ─── */
const TypingText = ({ texts, speed = 55 }) => {
  const [ti, setTi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = texts[ti];
    const t = setTimeout(() => {
      if (!del) {
        if (ci < cur.length) setCi(c => c + 1);
        else setTimeout(() => setDel(true), 1800);
      } else {
        if (ci > 0) setCi(c => c - 1);
        else { setDel(false); setTi(i => (i + 1) % texts.length); }
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [ci, del, ti, texts, speed]);
  return (
    <span className="font-mono">
      {texts[ti].slice(0, ci)}
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.75, repeat: Infinity }}>▌</motion.span>
    </span>
  );
};

/* ─── Stat pill ─── */
const StatPill = ({ value, label, color, delay }) => (
  <motion.div className="flex flex-col items-center px-4 py-2.5 rounded-2xl"
    style={{ background: `${color}0d`, border: `1px solid ${color}20` }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -2, boxShadow: `0 6px 20px ${color}20` }}>
    <span className="text-lg font-black" style={{ color }}>{value}</span>
    <span className="text-white/25 text-xs mt-0.5 whitespace-nowrap">{label}</span>
  </motion.div>
);

/* ══════════════════════════════════════════
   MAIN AUTH COMPONENT
══════════════════════════════════════════ */
const Auth = () => {
  const [mode, setMode]     = useState('login');
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        setSuccess(true);
        await new Promise(r => setTimeout(r, 500));
        await login(form.email, form.password);
        toast.success('Welcome back');
      } else {
        await signup(form.name, form.email, form.password);
        toast.success('Account created — please sign in');
        setMode('login');
        setForm({ name: '', email: form.email, password: '' });
      }
    } catch (err) {
      setSuccess(false);
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const fillDemo = () => {
    setMode('login');
    setForm({ name: '', email: 'demo@quantiva.app', password: 'demo1234' });
    toast('Demo credentials filled ✦', { icon: null });
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative select-none" style={{ background: '#050508' }}>
      <CursorGlow />
      <Grid />
      <ParticleField />
      <OrbitRings />

      {/* Ambient blobs */}
      {[
        { w: 800, h: 800, top: '-30%', left: '-25%', bg: 'rgba(124,58,237,0.14)', dur: 10 },
        { w: 600, h: 600, bottom: '-25%', right: '-18%', bg: 'rgba(6,182,212,0.09)', dur: 13 },
        { w: 400, h: 400, top: '40%', left: '30%', bg: 'rgba(236,72,153,0.05)', dur: 8 },
      ].map((o, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width: o.w, height: o.h, top: o.top, left: o.left, bottom: o.bottom, right: o.right,
            background: `radial-gradient(circle, ${o.bg} 0%, transparent 70%)`, filter: 'blur(70px)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: o.dur, delay: i * 2, repeat: Infinity, ease: 'easeInOut' }} />
      ))}

      {/* ══ LEFT PANEL ══ */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-14 relative z-10">

        {/* Logo */}
        <motion.div className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
          <div className="relative">
            <motion.div className="absolute -inset-1 rounded-xl"
              style={{ background: 'conic-gradient(from 0deg,#7c3aed,#06b6d4,#ec4899,#7c3aed)' }}
              animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
              <motion.div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.2) 50%,transparent 60%)' }}
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <span className="text-white font-bold text-lg relative z-10">◈</span>
            </div>
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-tight">Quantiva</p>
            <div className="flex items-center gap-1.5">
              <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-white/25 text-xs">Live · Analytics Suite</span>
            </div>
          </div>
        </motion.div>

        {/* Hero */}
        <div className="space-y-7">
          {/* Badge */}
          <motion.div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.22)', color: '#a78bfa' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <motion.span className="w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ scale: [1, 1.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            AI-Powered Financial Intelligence
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
              <span className="text-white">Your money,</span><br />
              <span style={{ background: 'linear-gradient(135deg,#a78bfa 0%,#06b6d4 50%,#10b981 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                intelligently
              </span><br />
              <span className="text-white">managed.</span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p className="text-white/32 text-[15px] leading-relaxed max-w-sm"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            Quantiva is a full-stack analytics platform that helps you understand where your money goes,
            predict where it's heading, and make smarter decisions — all in one place.
          </motion.p>

          {/* Stats row */}
          <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <StatPill value="6+" label="Analytics Layers" color="#a78bfa" delay={0.52} />
            <StatPill value="AI" label="Insight Engine"   color="#06b6d4" delay={0.58} />
            <StatPill value="100%" label="Secure JWT"     color="#10b981" delay={0.64} />
          </motion.div>

          {/* Typing status */}
          <motion.div className="flex items-center gap-2.5 text-white/18 text-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: 'rgba(167,139,250,0.5)' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity }} />
            <TypingText texts={[
              'Analyzing spending patterns...',
              'Forecasting next month expenses...',
              'Detecting behavioral anomalies...',
              'Generating personalized insights...',
              'Calculating financial health score...',
            ]} speed={50} />
          </motion.div>


        </div>

        {/* Developer tagline */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-px h-10" style={{ background: 'linear-gradient(180deg,transparent,rgba(167,139,250,0.5),transparent)' }} />
            <div>
              <p className="text-white/18 text-xs uppercase tracking-widest font-medium">Built by</p>
              <p className="text-white/55 text-sm font-bold tracking-tight">Jay Likhar</p>
            </div>
          </div>
          <p className="text-white/14 text-xs italic leading-relaxed max-w-xs pl-4">
            "Building Intelligent Experiences Where Data Meets Design."
          </p>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px self-stretch my-12 flex-shrink-0"
        style={{ background: 'linear-gradient(180deg,transparent 0%,rgba(139,92,246,0.3) 25%,rgba(6,182,212,0.2) 75%,transparent 100%)' }} />

      {/* ══ RIGHT PANEL ══ */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div className="w-full max-w-[420px]"
          initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
              <span className="text-white font-bold">◈</span>
            </div>
            <p className="text-white font-black text-xl">Quantiva</p>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div key={mode}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.22 }}>
                <div className="flex items-center gap-2 mb-1">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }} />
                  <span className="text-white/25 text-xs uppercase tracking-widest font-medium">
                    {mode === 'login' ? 'Authentication' : 'Registration'}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-white/28 text-sm mt-1.5 leading-relaxed">
                  {mode === 'login'
                    ? 'Sign in to your intelligent financial dashboard'
                    : 'Join and start managing your finances smarter'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card */}
          <motion.div className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.022)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 0 0 1px rgba(139,92,246,0.07), 0 32px 80px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(28px)',
            }}
            whileHover={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.15), 0 32px 80px rgba(0,0,0,0.55)' }}
            transition={{ duration: 0.3 }}>

            {/* Animated top border */}
            <motion.div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.8),rgba(6,182,212,0.6),rgba(236,72,153,0.4),transparent)' }}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />

            {/* Corner glows */}
            <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
              style={{ background: 'radial-gradient(circle at top right,rgba(124,58,237,0.12) 0%,transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
              style={{ background: 'radial-gradient(circle at bottom left,rgba(6,182,212,0.07) 0%,transparent 70%)' }} />

            {/* Shimmer sweep */}
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.025) 50%,transparent 65%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} />

            <div className="p-7">
              {/* Tab toggle */}
              <div className="flex rounded-2xl p-1 mb-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {[{ id: 'login', label: 'Sign In' }, { id: 'signup', label: 'Sign Up' }].map((tab) => (
                  <button key={tab.id} onClick={() => setMode(tab.id)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 relative"
                    style={{ color: mode === tab.id ? '#fff' : 'rgba(255,255,255,0.28)' }}>
                    {mode === tab.id && (
                      <motion.div layoutId="auth-pill" className="absolute inset-0 rounded-xl"
                        style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.6),rgba(99,102,241,0.45))',
                          boxShadow: '0 2px 20px rgba(124,58,237,0.35)', border: '1px solid rgba(139,92,246,0.3)' }}
                        transition={{ type: 'spring', damping: 22, stiffness: 280 }} />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                      <FloatingInput label="Full name" type="text" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} required
                        icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <FloatingInput label="Email address" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} />

                <FloatingInput label="Password" type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  showToggle onToggle={() => setShowPw(v => !v)} show={showPw}
                  icon={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} />

                {/* Submit */}
                <MagneticButton type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '14px',
                    background: success
                      ? 'linear-gradient(135deg,#10b981,#06b6d4)'
                      : 'linear-gradient(135deg,#7c3aed,#6366f1)',
                    boxShadow: success
                      ? '0 6px 28px rgba(16,185,129,0.45)'
                      : '0 6px 28px rgba(124,58,237,0.45)',
                    color: '#fff', fontSize: '14px', fontWeight: 700,
                    opacity: loading ? 0.8 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.4s, box-shadow 0.4s',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  {/* Button shimmer */}
                  <motion.div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }} />
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span key="loading" className="flex items-center justify-center gap-2.5 relative z-10"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.span className="w-4 h-4 border-2 rounded-full"
                          style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' }}
                          animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                        {mode === 'login' ? 'Authenticating...' : 'Creating account...'}
                      </motion.span>
                    ) : success ? (
                      <motion.span key="success" className="flex items-center justify-center gap-2 relative z-10"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        ✓ Authenticated
                      </motion.span>
                    ) : (
                      <motion.span key="idle" className="flex items-center justify-center gap-2 relative z-10"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>→</motion.span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </MagneticButton>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-white/18 text-xs font-medium">or continue with</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Demo button */}
              <MagneticButton onClick={fillDemo}
                style={{
                  width: '100%', padding: '13px', borderRadius: '14px',
                  background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.14)',
                  color: 'rgba(6,182,212,0.6)', fontSize: '14px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; e.currentTarget.style.color = 'rgba(6,182,212,0.6)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.14)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <motion.span animate={{ rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>✦</motion.span>
                Try demo account
              </MagneticButton>
            </div>
          </motion.div>

          <motion.p className="text-center text-white/12 text-xs mt-5 leading-relaxed"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
            By continuing you agree to our Terms of Service<br />
            <span style={{ color: 'rgba(139,92,246,0.3)' }}>Secured with JWT · Data encrypted at rest</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
