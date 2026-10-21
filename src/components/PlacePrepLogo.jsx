import React from 'react';

export default function PlacePrepLogo({ className = "w-8 h-8", showText = true, subtitle = "Campus Recruitment Platform" }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Brand Icon Mark */}
      <div className={`shrink-0 flex items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs ${className}`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5"
        >
          {/* Graduation Cap */}
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>

      {/* Typography: "PlacePrep" */}
      {showText && (
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-slate-900 font-sans">
              Place<span className="text-indigo-600">Prep</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 rounded">
              v2.4
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 leading-tight hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
