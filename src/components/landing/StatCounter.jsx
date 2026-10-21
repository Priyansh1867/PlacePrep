import React, { useState, useEffect } from 'react';

export default function StatCounter({ endVal, suffix = '', display, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setCount(endVal);
      return;
    }

    let start = 0;
    const duration = 1800; // 1.8 seconds
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = endVal / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= endVal) {
        setCount(endVal);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [endVal]);

  return (
    <div className="flex flex-col text-left">
      <div className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white font-mono">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-[11px] sm:text-xs text-white/50 font-mono tracking-widest uppercase mt-1">
        {label}
      </div>
    </div>
  );
}
