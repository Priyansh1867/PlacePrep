import React from 'react';
import { landingConfig } from '../../config/landingConfig';
import PlacePrepLogo from '../PlacePrepLogo';

export default function LandingFooter() {
  const { brand, footerColumns } = landingConfig;

  return (
    <footer className="relative bg-black text-white/70 pt-16 pb-12 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand + 4 Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-16">
          
          {/* Brand & Tagline (Col 1-2) */}
          <div className="md:col-span-2 space-y-4">
            <PlacePrepLogo className="h-9 sm:h-10 w-auto" theme="dark" />

            <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed max-w-sm">
              {brand.footerTagline}
            </p>

            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-[11px] font-mono text-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{brand.statusText}</span>
            </div>
          </div>

          {/* 4 Link Columns (Col 3-6) */}
          {footerColumns.map((col) => (
            <div key={col.title} className="space-y-3">
              <div className="text-[11px] font-mono font-semibold tracking-widest uppercase text-white">
                {col.title}
              </div>
              <ul className="space-y-2 text-xs font-light text-white/50">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Section: Copyright & Disclaimer */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
          <div>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
