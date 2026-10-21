import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple' | 'cyan'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  className = ''
}) {
  const baseStyles = 'inline-flex items-center font-bold tracking-tight rounded-full transition-colors select-none';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  const variantStyles = {
    primary: 'bg-indigo-50 text-[#4F46E5] border border-indigo-200/80',
    success: 'bg-emerald-50 text-[#16A34A] border border-emerald-200/80',
    warning: 'bg-amber-50 text-[#D97706] border border-amber-200/80',
    danger: 'bg-red-50 text-[#DC2626] border border-red-200/80',
    neutral: 'bg-slate-100 text-[#64748B] border border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200/80'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
