import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  leftIcon,
  rightIcon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const Icon = icon || leftIcon || rightIcon;
  const resolvedIconPosition = rightIcon ? 'right' : iconPosition;
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[#4F46E5] text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-600/20 focus:ring-indigo-500 border border-transparent',
    secondary: 'bg-slate-100 text-[#0F172A] hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400 border border-slate-200/80',
    outline: 'bg-transparent text-[#0F172A] border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus:ring-indigo-500',
    ghost: 'bg-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400 border border-transparent',
    danger: 'bg-[#DC2626] text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20 focus:ring-red-500 border border-transparent',
    success: 'bg-[#16A34A] text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/20 focus:ring-emerald-500 border border-transparent'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {!loading && Icon && resolvedIconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && resolvedIconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
