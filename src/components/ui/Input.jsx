import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon,
  leftIcon,
  className = '',
  id,
  type = 'text',
  disabled = false,
  required = false,
  ...props
}) {
  const Icon = icon || leftIcon;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-[#0F172A]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl border bg-white px-3.5 py-2 text-xs sm:text-sm text-[#0F172A] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-[#DC2626] focus:ring-red-400'
              : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] font-medium text-[#DC2626]">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#64748B]">{helperText}</p>}
    </div>
  );
}
