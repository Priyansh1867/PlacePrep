import React from 'react';

export default function ProgressBar({
  value = 0, // 0 - 100
  max = 100,
  showLabel = false,
  label,
  color = 'primary', // 'primary' | 'success' | 'warning' | 'purple'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = ''
}) {
  const percent = Math.min(100, Math.max(0, Math.round((Number.isFinite(value) && max > 0 ? value / max : 0) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };

  const colorStyles = {
    primary: 'bg-[#4F46E5]',
    success: 'bg-[#16A34A]',
    warning: 'bg-[#D97706]',
    purple: 'bg-purple-600'
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs font-semibold text-[#0F172A]">
          <span>{label || 'Progress'}</span>
          <span className="text-[#64748B] font-mono">{percent}%</span>
        </div>
      )}
      <div role="progressbar" aria-label={label || "Progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className={`pp-progress w-full bg-slate-100 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorStyles[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
