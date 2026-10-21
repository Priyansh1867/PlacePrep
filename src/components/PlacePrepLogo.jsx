import React from 'react';
import logoTransparent from '../assets/images/placeprep_logo_transparent.png';
import logoNavy from '../assets/images/placeprep_logo_navy.png';
import logoIcon from '../assets/images/placeprep_icon.png';

/**
 * PlacePrep Official Brand Logo
 * 
 * Renders the official provided logo image featuring:
 * - Purple graduation-cap 3D icon
 * - "PlacePrep" primary wordmark
 * - "Campus career operating system" tagline
 * - Matches dark navy background (#0c152c) seamlessly across all pages and viewports.
 */
export default function PlacePrepLogo({ 
  className = "h-8 sm:h-9", 
  variant = "full", // "full" (icon + wordmark + tagline) | "icon" | "navy"
  theme = "dark",   // "dark" (transparent on dark bg) | "light" (dark navy badge on light bg)
  alt = "PlacePrep — Campus career operating system"
}) {
  // Always ensure width auto so the rectangular logo aspect ratio is preserved
  const normalizedClass = className
    ? className.replace(/\bw-\d+\b/g, '').trim()
    : "h-8 sm:h-9";

  if (variant === "icon") {
    return (
      <div className="inline-flex items-center justify-center select-none shrink-0">
        <img
          src={logoIcon}
          alt={alt}
          className={`h-8 w-auto object-contain transition-transform duration-200 hover:scale-105 ${normalizedClass}`}
        />
      </div>
    );
  }

  const isLight = theme === "light";
  const logoSrc = variant === "navy" ? logoNavy : logoTransparent;

  return (
    <div 
      className={`inline-flex items-center select-none shrink-0 group transition-all duration-200 ${
        isLight 
          ? 'bg-[#0c152c] px-3 py-1.5 rounded-xl shadow-xs border border-indigo-950/30' 
          : 'p-0.5'
      }`}
    >
      <img
        src={logoSrc}
        alt={alt}
        className={`h-8 sm:h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(99,102,241,0.28)] transition-transform duration-200 group-hover:scale-[1.02] ${normalizedClass}`}
      />
    </div>
  );
}
