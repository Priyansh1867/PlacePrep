import React from 'react';
import { landingConfig } from '../../config/landingConfig';

export default function LogoMarquee() {
  const { marqueeRows } = landingConfig;

  return (
    <section className="relative py-16 overflow-hidden border-y border-white/[0.08] bg-black">
      
      {/* Edge Fade Masks for Smooth Infinite Look */}
      <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <span className="text-[11px] font-mono tracking-widest text-white/40 uppercase">
          INTEGRATES WITH 1,000+ WORKSPACE APPLICATIONS & CLOUD SERVICES
        </span>
      </div>

      <div className="flex flex-col gap-5">
        
        {/* ROW 1: Scroll Left */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...marqueeRows[0], ...marqueeRows[0], ...marqueeRows[0]].map((logo, idx) => (
            <div
              key={`r1-${idx}`}
              className="mx-3 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/[0.2] transition-all flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-6 h-6 rounded-md bg-white/[0.05] group-hover:bg-indigo-500/20 flex items-center justify-center text-xs font-mono font-bold text-white/50 group-hover:text-indigo-300 transition-colors">
                {logo[0]}
              </div>
              <span className="font-mono text-xs text-white/50 group-hover:text-white transition-colors">
                {logo}
              </span>
            </div>
          ))}
        </div>

        {/* ROW 2: Scroll Right */}
        <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...marqueeRows[1], ...marqueeRows[1], ...marqueeRows[1]].map((logo, idx) => (
            <div
              key={`r2-${idx}`}
              className="mx-3 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/[0.2] transition-all flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-6 h-6 rounded-md bg-white/[0.05] group-hover:bg-emerald-500/20 flex items-center justify-center text-xs font-mono font-bold text-white/50 group-hover:text-emerald-300 transition-colors">
                {logo[0]}
              </div>
              <span className="font-mono text-xs text-white/50 group-hover:text-white transition-colors">
                {logo}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
