import React from 'react';

export default function Select({
  label,
  error,
  helperText,
  options = [],
  value,
  onChange,
  className = '',
  id,
  disabled = false,
  required = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-[#0F172A]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full rounded-xl border bg-white px-3.5 py-2 text-xs sm:text-sm text-[#0F172A] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:cursor-not-allowed ${
          error
            ? 'border-[#DC2626] focus:ring-red-400'
            : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {labelText}
            </option>
          );
        })}
      </select>
      {error && <p className="text-[11px] font-medium text-[#DC2626]">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#64748B]">{helperText}</p>}
    </div>
  );
}
