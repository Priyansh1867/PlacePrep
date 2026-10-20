import React from 'react';

export default function PlacePrepLogo({ className = "w-10 h-10", showText = true, subtitle = "Next-Gen Placement Suite" }) {
  return (
    <div className="flex items-center gap-2.5 group">
      {/* Brand Icon Mark with Radiant Cyber Glow */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-2 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/40 group-hover:ring-cyan-400/40 ${className}`}>
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white filter drop-shadow"
        >
          {/* Graduation Cap Top Diamond */}
          <path 
            d="M24 6L42 16L24 26L6 16L24 6Z" 
            fill="url(#cap-grad)" 
            stroke="#FFFFFF" 
            strokeWidth="2.2" 
            strokeLinejoin="round"
          />
          {/* Graduation Cap Base */}
          <path 
            d="M14 21.5V30.5C14 34.5 18.5 37.5 24 37.5C29.5 37.5 34 34.5 34 30.5V21.5" 
            stroke="#FFFFFF" 
            strokeWidth="2.2" 
            strokeLinecap="round"
          />
          {/* Tassel & Ribbon */}
          <path 
            d="M38 18.5V31C38 32.5 39.5 33.5 41 33.5" 
            stroke="#38BDF8" 
            strokeWidth="2.2" 
            strokeLinecap="round"
          />
          {/* Upward Career Growth Arrow */}
          <path 
            d="M24 33L24 17M24 17L20 21M24 17L28 21" 
            stroke="#FFFFFF" 
            strokeWidth="2.4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Placement Sparkle Star */}
          <circle cx="24" cy="11" r="2.2" fill="#38BDF8" />

          <defs>
            <linearGradient id="cap-grad" x1="6" y1="6" x2="42" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="0.6" stopColor="#6366F1" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography: "PlacePrep" */}
      {showText && (
        <div className="text-left">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Place<span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Prep</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse"></span>
          </div>
          {subtitle && (
            <p className="text-[10px] font-mono tracking-wider uppercase text-slate-400 -mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
