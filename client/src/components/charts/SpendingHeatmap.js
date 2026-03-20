import { useMemo } from 'react';
import { format, eachDayOfInterval, subDays } from 'date-fns';

const SpendingHeatmap = ({ data }) => {
  const dataMap = useMemo(() => {
    const map = {};
    (data || []).forEach((d) => { map[d._id] = d.total; });
    return map;
  }, [data]);

  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 89);
    return eachDayOfInterval({ start, end });
  }, []);

  const maxVal = useMemo(() => {
    const vals = Object.values(dataMap);
    return vals.length > 0 ? Math.max(...vals, 1) : 1;
  }, [dataMap]);

  const getColor = (val) => {
    if (!val) return 'rgba(255,255,255,0.04)';
    const intensity = val / maxVal;
    if (intensity > 0.75) return '#ef4444';
    if (intensity > 0.5) return '#f97316';
    if (intensity > 0.25) return '#f59e0b';
    return '#6366f1';
  };

  const weeks = [];
  let week = [];
  days.forEach((day, i) => {
    week.push(day);
    if (week.length === 7 || i === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const val = dataMap[key] || 0;
              return (
                <div
                  key={key}
                  className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125"
                  style={{ backgroundColor: getColor(val) }}
                  title={`${key}: $${val.toFixed(0)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-white/30">
        <span>Less</span>
        {['rgba(255,255,255,0.04)', '#6366f1', '#f59e0b', '#f97316', '#ef4444'].map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default SpendingHeatmap;
