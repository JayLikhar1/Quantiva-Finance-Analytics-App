import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../../utils/format';

const AnimatedCounter = ({ value, duration = 1000, currency, prefix = '', suffix = '', decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    // Guard against NaN / Infinity
    const end = isFinite(value) && !isNaN(value) ? value : 0;
    const start = prevRef.current;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    // Cancel on unmount or before next effect run
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  if (currency) {
    return <span>{formatCurrency(display, currency)}</span>;
  }

  return (
    <span>
      {prefix}{display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
    </span>
  );
};

export default AnimatedCounter;
