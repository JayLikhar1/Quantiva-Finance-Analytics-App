import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';

const typeConfig = {
  warning: {
    border: 'rgba(245,158,11,0.2)',
    bg: 'rgba(245,158,11,0.04)',
    dot: '#f59e0b',
    glow: 'rgba(245,158,11,0.1)',
  },
  success: {
    border: 'rgba(16,185,129,0.2)',
    bg: 'rgba(16,185,129,0.04)',
    dot: '#10b981',
    glow: 'rgba(16,185,129,0.1)',
  },
  info: {
    border: 'rgba(139,92,246,0.2)',
    bg: 'rgba(139,92,246,0.04)',
    dot: '#a78bfa',
    glow: 'rgba(139,92,246,0.1)',
  },
};

const InsightCard = ({ insight, index }) => {
  const cfg = typeConfig[insight.type] || typeConfig.info;

  return (
    <motion.div
      className="rounded-xl p-3.5 relative overflow-hidden"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glow corner */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: cfg.glow, filter: 'blur(16px)', transform: 'translate(30%, -30%)' }} />

      <div className="flex items-start gap-3">
        <div className="flex items-center gap-1.5 mt-0.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
          <span className="text-base">{insight.icon}</span>
        </div>
        <p className="text-white/65 text-xs leading-relaxed">
          <TypewriterText text={insight.text} speed={20} />
        </p>
      </div>
    </motion.div>
  );
};

export default InsightCard;
