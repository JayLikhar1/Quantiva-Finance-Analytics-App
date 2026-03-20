import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatMonth, formatCurrency } from '../../utils/format';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs"
      style={{ background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p className="text-white/40 mb-1">{label}</p>
      <p className="font-semibold" style={{ color: payload[0].value >= 0 ? '#10b981' : '#ef4444' }}>
        Net: {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  );
};

const TrendLineChart = ({ data, currency = 'INR' }) => {
  if (!data?.length) return (
    <div className="flex items-center justify-center h-48 text-white/20 text-sm">No data available</div>
  );

  const formatted = data.map((d) => ({ ...d, month: formatMonth(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.4} />
            <stop offset="60%"  stopColor="#6366f1" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
          axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={40}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: 'rgba(139,92,246,0.2)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="net"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#netGrad)"
          filter="url(#glow)"
          dot={false}
          activeDot={{ r: 4, fill: '#a78bfa', stroke: 'rgba(167,139,250,0.3)', strokeWidth: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrendLineChart;
