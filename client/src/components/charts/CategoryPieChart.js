import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { categoryColors } from '../../utils/format';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs"
      style={{ background: 'rgba(10,8,20,0.95)', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p className="text-white font-medium">{d.category}</p>
      <p className="text-white/50 mt-0.5">${d.total?.toLocaleString()} · {d.percentage}%</p>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 8) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="rgba(255,255,255,0.7)" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={500}>
      {percentage}%
    </text>
  );
};

const CategoryPieChart = ({ data }) => {
  if (!data?.length) return (
    <div className="flex items-center justify-center h-48 text-white/20 text-sm">No data available</div>
  );

  const top5 = data.slice(0, 6);

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={top5}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            labelLine={false}
            label={renderLabel}
          >
            {top5.map((entry) => (
              <Cell
                key={entry.category}
                fill={categoryColors[entry.category] || '#6366f1'}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {top5.map((entry) => (
          <div key={entry.category} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: categoryColors[entry.category] || '#6366f1' }} />
            <span className="text-white/40 text-xs truncate">{entry.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPieChart;
