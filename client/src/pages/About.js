import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  HiExternalLink, HiCode, HiLightningBolt, HiSparkles,
  HiChip, HiDatabase, HiColorSwatch, HiTerminal,
} from 'react-icons/hi';

/* ─── Data ─────────────────────────────────────────────────────────── */
const LINKS = [
  { label: 'Portfolio', url: 'https://jay-portfolio-21c8e.web.app/',                    icon: '🌐', color: '#a78bfa', glow: 'rgba(167,139,250,0.35)' },
  { label: 'GitHub',    url: 'https://github.com/JayLikhar1',                           icon: '🐙', color: '#e2e8f0', glow: 'rgba(226,232,240,0.25)' },
  { label: 'LinkedIn',  url: 'https://www.linkedin.com/in/jay-likhar-8820a6274/',       icon: '💼', color: '#38bdf8', glow: 'rgba(56,189,248,0.35)'  },
  { label: 'Instagram', url: 'https://www.instagram.com/jayylikhar/',                   icon: '📸', color: '#ec4899', glow: 'rgba(236,72,153,0.35)'  },
];

const STACK = [
  { group: 'Frontend',         icon: HiColorSwatch, color: '#61dafb', items: ['React 18', 'Tailwind CSS', 'Framer Motion', 'Radix UI'] },
  { group: 'Backend',          icon: HiTerminal,    color: '#68a063', items: ['Node.js', 'Express.js'] },
  { group: 'Database',         icon: HiDatabase,    color: '#47a248', items: ['MongoDB', 'Mongoose'] },
  { group: 'Data & Analytics', icon: HiChip,        color: '#f59e0b', items: ['Python', 'SQL', 'Power BI', 'Tableau'] },
  { group: 'Tools & Others',   icon: HiCode,        color: '#94a3b8', items: ['Git', 'GitHub', 'Firebase', 'REST APIs'] },
];

const FEATURES = [
  { icon: '🔐', title: 'Auth System',        desc: 'JWT-based signup/login with protected routes and persistent sessions', color: '#a78bfa' },
  { icon: '💳', title: 'Transaction Engine', desc: 'Full CRUD, pagination, search, filters, sort, bulk delete, CSV export', color: '#06b6d4' },
  { icon: '📊', title: 'Live Dashboard',     desc: 'Animated stat cards, cash flow chart, category breakdown, AI insights', color: '#10b981' },
  { icon: '📈', title: 'Analytics Engine',   desc: 'MoM comparison, 6-month forecast, behavioral patterns, spending heatmap', color: '#f59e0b' },
  { icon: '🧠', title: 'AI Insights',        desc: 'Rule-based intelligent tips, anomaly detection, health scoring', color: '#ec4899' },
  { icon: '⚙️', title: 'Budget System',      desc: 'Per-category monthly caps with live progress bars, auto-saved to server', color: '#ef4444' },
];

const BADGES = ['Full Stack Dev', 'Data Analytics', 'UI/UX Design', 'AI Insights'];

const TAGLINE_WORDS = ['Building', 'Intelligent', 'Experiences', 'Where', 'Data', 'Meets', 'Design.'];

/* ─── Particles ────────────────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.8,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 6,
  color: ['rgba(167,139,250,', 'rgba(6,182,212,', 'rgba(236,72,153,', 'rgba(16,185,129,'][i % 4],
}));

/* ─── Mouse-tracking spotlight card ────────────────────────────────── */
const SpotlightCard = ({ children, delay = 0, accentColor = 'rgba(124,58,237,0.5)', className = '' }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)' }}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ borderColor: accentColor.replace('0.5', '0.3') }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent,${accentColor},transparent)` }} />
      {/* Mouse spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(280px circle at ${pos.x}% ${pos.y}%, ${accentColor.replace('0.5', '0.07')}, transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

/* ─── Animated tagline ──────────────────────────────────────────────── */
const AnimatedTagline = () => (
  <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
    {TAGLINE_WORDS.map((word, i) => (
      <motion.span
        key={word}
        className="text-sm font-semibold"
        style={{ background: 'linear-gradient(135deg,#a78bfa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
      >
        {word}
      </motion.span>
    ))}
  </div>
);

/* ─── Skill pill with hover glow ────────────────────────────────────── */
const SkillPill = ({ item, color, delay }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.span
      className="text-xs px-3 py-1.5 rounded-xl font-medium cursor-default select-none transition-all duration-200"
      style={{
        background: hov ? `${color}22` : `${color}0d`,
        color,
        border: `1px solid ${hov ? color + '45' : color + '20'}`,
        boxShadow: hov ? `0 0 14px ${color}30` : 'none',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
    >
      {item}
    </motion.span>
  );
};

/* ─── Feature card ──────────────────────────────────────────────────── */
const FeatureCard = ({ f, delay }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      className="flex items-start gap-3 rounded-xl p-4 cursor-default transition-all duration-200"
      style={{
        background: hov ? `${f.color}12` : `${f.color}07`,
        border: `1px solid ${hov ? f.color + '35' : f.color + '18'}`,
        boxShadow: hov ? `0 4px 24px ${f.color}18` : 'none',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileHover={{ y: -2 }}
    >
      <motion.span
        className="text-xl flex-shrink-0"
        animate={hov ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        {f.icon}
      </motion.span>
      <div>
        <p className="text-xs font-bold tracking-wide" style={{ color: f.color }}>{f.title}</p>
        <p className="text-white/35 text-xs mt-1 leading-relaxed">{f.desc}</p>
      </div>
    </motion.div>
  );
};

/* ─── Main component ────────────────────────────────────────────────── */
const About = () => {
  const [activeTab, setActiveTab] = useState('stack');

  return (
    <div className="relative min-h-screen">

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: `${p.color}0.6)`,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}0.4)`,
            }}
            animate={{ y: [0, -30, 0], x: [0, 10, -10, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div className="absolute rounded-full"
          style={{ width: 500, height: 500, top: -150, right: -100, background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute rounded-full"
          style={{ width: 400, height: 400, bottom: -100, left: -80, background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-5 pb-8">

        {/* ── Page header ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2 mb-1">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-pink-400"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }} />
            <p className="text-white/25 text-xs uppercase tracking-widest font-medium">Developer Profile</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-white">About </span>
            <span className="text-gradient">Me</span>
          </h1>
        </motion.div>

        {/* ── Hero card ── */}
        <SpotlightCard delay={0.08} accentColor="rgba(139,92,246,0.6)">
          <div className="p-6">
            <div className="flex items-start gap-5">
              {/* Avatar with ring */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className="absolute -inset-1.5 rounded-2xl"
                  style={{ background: 'conic-gradient(from 0deg, #7c3aed, #06b6d4, #ec4899, #7c3aed)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <motion.div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.2),transparent)' }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }} />
                  <span className="relative z-10">JL</span>
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <motion.h2 className="text-white font-black text-2xl tracking-tight"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  Jay Likhar
                </motion.h2>
                <motion.div className="mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                  <AnimatedTagline />
                </motion.div>
                <motion.p className="text-white/35 text-xs mt-2.5 leading-relaxed"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  Full Stack Developer & Data Analytics Enthusiast specializing in intelligent,
                  data-driven web applications with modern UI/UX and AI-powered insights.
                </motion.p>
                <motion.div className="flex flex-wrap gap-1.5 mt-3"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                  {BADGES.map((b, i) => (
                    <motion.span key={b}
                      className="badge-purple text-xs"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.58 + i * 0.06 }}
                      whileHover={{ scale: 1.05 }}>
                      {b}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Social links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{
                    background: `${link.color}0d`,
                    color: link.color,
                    border: `1px solid ${link.color}25`,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  whileHover={{ y: -3, boxShadow: `0 8px 24px ${link.glow}` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                  <HiExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </div>
        </SpotlightCard>

        {/* ── Tabbed section: Stack / Project ── */}
        <div>
          {/* Tab bar */}
          <div className="flex gap-1 p-1 rounded-xl mb-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { id: 'stack',   label: 'Tech Stack',      icon: HiCode     },
              { id: 'project', label: 'About Project',   icon: HiSparkles },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.3)' }}
                >
                  {active && (
                    <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.25)' }}
                      transition={{ type: 'spring', damping: 22, stiffness: 300 }} />
                  )}
                  <Icon size={13} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 'stack' && (
              <motion.div key="stack"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <SpotlightCard accentColor="rgba(6,182,212,0.5)">
                  <div className="p-5 space-y-5">
                    {STACK.map((group, gi) => {
                      const Icon = group.icon;
                      return (
                        <motion.div key={group.group}
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: gi * 0.08, duration: 0.4 }}>
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center"
                              style={{ background: `${group.color}18`, border: `1px solid ${group.color}25` }}>
                              <Icon size={10} style={{ color: group.color }} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: group.color }}>{group.group}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.items.map((item, ii) => (
                              <SkillPill key={item} item={item} color={group.color} delay={gi * 0.08 + ii * 0.05} />
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </SpotlightCard>
              </motion.div>
            )}

            {activeTab === 'project' && (
              <motion.div key="project"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <SpotlightCard accentColor="rgba(167,139,250,0.5)">
                  <div className="p-5">
                    {/* Description */}
                    <motion.div className="rounded-xl p-4 mb-4"
                      style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                      <p className="text-white/55 text-sm leading-relaxed">
                        A <span className="text-purple-300 font-semibold">SaaS-level Finance Analytics Dashboard</span> combining
                        full-stack development with advanced data analytics — generating{' '}
                        <span className="text-cyan-300 font-semibold">intelligent insights</span>, behavioral spending patterns,
                        and predictive analytics. Features an{' '}
                        <span className="text-emerald-300 font-semibold">Apple-inspired UI</span> with smooth animations and
                        an AI-like interactive experience.
                      </p>
                    </motion.div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {FEATURES.map((f, i) => (
                        <FeatureCard key={f.title} f={f} delay={0.12 + i * 0.07} />
                      ))}
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Stats strip ── */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}>
          {[
            { label: 'Technologies', value: '15+', color: '#a78bfa' },
            { label: 'Project Features', value: '6',   color: '#06b6d4' },
            { label: 'Lines of Code',   value: '5k+',  color: '#10b981' },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              className="rounded-xl p-4 text-center cursor-default"
              style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}18` }}
              whileHover={{ y: -3, boxShadow: `0 8px 24px ${stat.color}20`, borderColor: `${stat.color}35` }}
              transition={{ type: 'spring', stiffness: 400 }}>
              <motion.p className="text-2xl font-black" style={{ color: stat.color }}
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 300 }}>
                {stat.value}
              </motion.p>
              <p className="text-white/30 text-xs mt-0.5 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Footer ── */}
        <motion.div className="flex items-center justify-between px-1 pt-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <p className="text-white/12 text-xs">© 2025 Jay Likhar · All rights reserved</p>
          <motion.div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(167,139,250,0.35)' }}
            animate={{ opacity: [0.35, 0.8, 0.35] }} transition={{ duration: 3, repeat: Infinity }}>
            <HiLightningBolt size={10} />
            <span>Built with passion</span>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default About;
