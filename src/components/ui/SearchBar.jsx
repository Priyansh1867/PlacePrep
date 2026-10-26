import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable, modern, fully functional SearchBar component.
 * Features dynamic live filtering, clear button (X), focus states,
 * optional result count badge, and mobile responsiveness.
 */
export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  size = 'md',
  className = '',
  inputClassName = '',
  disabled = false,
  autoFocus = false,
  resultCount,
  totalCount,
  id,
  'aria-label': ariaLabel,
  ...props
}) {
  const inputRef = useRef(null);

  const handleClear = () => {
    if (onChange) {
      // Simulate input event or direct string depending on usage
      onChange({ target: { value: '' } });
    }
    if (onClear) {
      onClear();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && value) {
      e.stopPropagation();
      handleClear();
    }
  };

  const sizeClasses = {
    sm: {
      container: 'py-1.5 px-3 text-xs',
      icon: 'w-3.5 h-3.5',
      iconGap: 'pl-8',
      clearIcon: 'w-3.5 h-3.5',
      input: 'text-xs'
    },
    md: {
      container: 'py-2 px-3.5 text-xs sm:text-sm',
      icon: 'w-4 h-4',
      iconGap: 'pl-9',
      clearIcon: 'w-4 h-4',
      input: 'text-xs sm:text-sm'
    },
    lg: {
      container: 'py-2.5 px-4 text-sm sm:text-base',
      icon: 'w-5 h-5',
      iconGap: 'pl-11',
      clearIcon: 'w-4 h-4',
      input: 'text-sm sm:text-base'
    }
  };

  const activeSize = sizeClasses[size] || sizeClasses.md;
  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <div className={`relative flex items-center w-full group ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        <Search className={activeSize.icon} />
      </div>

      {/* Text Input */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel || placeholder}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder-slate-400 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium disabled:bg-slate-100 disabled:cursor-not-allowed ${
          activeSize.iconGap
        } ${hasValue ? 'pr-20' : 'pr-3'} ${activeSize.container} ${inputClassName}`}
        {...props}
      />

      {/* Right Action Area: Optional Result Counter & Clear Button */}
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
        {hasValue && typeof resultCount === 'number' && (
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700 tracking-tight">
            {resultCount}{typeof totalCount === 'number' ? `/${totalCount}` : ' found'}
          </span>
        )}

        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Clear search"
            title="Clear search (Esc)"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <X className={activeSize.clearIcon} />
          </button>
        )}
      </div>
    </div>
  );
}
