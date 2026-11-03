import React from 'react';

export function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick(event); } } : undefined}
      className={`pp-card bg-white rounded-2xl border border-slate-200/90 shadow-xs transition-all duration-200 ${
        hover ? 'pp-card--interactive hover:shadow-md hover:border-indigo-300 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-5 sm:p-6 pb-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-base sm:text-lg font-bold text-[#0F172A] tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-5 sm:p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`p-4 sm:p-6 pt-3 border-t border-slate-100 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export default Card;

