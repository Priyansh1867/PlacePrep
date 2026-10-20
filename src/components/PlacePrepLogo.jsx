import React from 'react';

export default function PlacePrepLogo({ className = "w-10 h-10", showText = true, subtitle = "Smart Placement Platform" }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Brand Icon Mark */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25 p-2 transition-transform group-hover:scale-105 ${className}`}>
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
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
            stroke="#FDE047" 
            strokeWidth="2.2" 
            strokeLinecap="round"
          />
          {/* Upward Career Growth Arrow inside */}
          <path 
            d="M24 33L24 17M24 17L20 21M24 17L28 21" 
            stroke="#FFFFFF" 
            strokeWidth="2.4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Placement Sparkle Star */}
          <circle cx="24" cy="11" r="2.2" fill="#FDE047" />

          <defs>
            <linearGradient id="cap-grad" x1="6" y1="6" x2="42" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography: "PlacePrep" (Without AI) */}
      {showText && (
        <div className="text-left">
          <div className="flex items-center">
            <span className="font-black text-xl tracking-tight text-slate-900 font-sans">
              Place<span className="text-indigo-600">Prep</span>
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] font-medium text-slate-500 -mt-0.5 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
