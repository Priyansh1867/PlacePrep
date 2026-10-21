import React from 'react';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';
import { landingConfig } from '../../config/landingConfig';
import StatCounter from './StatCounter';

export default function LandingHero() {
  const { brand, heroStats } = landingConfig;

  return (
    <section id="hero" className="relative pt-20 pb-24 overflow-hidden text-center">
      {/* Background Radial Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] rounded-full blur-[140px] pointer-events-none -z-10 opacity-30"
        style={{ background: `radial-gradient(circle, ${brand.accentColor} 0%, transparent 70%)` }}
      />
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Monospace Label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] backdrop-blur-md mb-8 text-[11px] font-mono tracking-widest uppercase text-white/70 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>AUTONOMOUS AGENTIC EXECUTION</span>
        </div>

        {/* Large Headline */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-tight leading-[0.95] mb-6">
          Meet {brand.shortName}.
        </h1>

        {/* Subline */}
        <p className="text-xl sm:text-2xl md:text-3xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto mb-10">
          {brand.tagline}
        </p>

        {/* Primary CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-200 text-black font-mono font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2.5 group"
          >
            <span>START FREE NOW</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#pipeline"
            className="w-full sm:w-auto px-7 py-4 rounded-full border border-white/[0.15] hover:border-white/[0.3] bg-white/[0.02] hover:bg-white/[0.05] text-white/80 hover:text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 text-white/60" />
            <span>SEE HOW IT EXECUTES</span>
          </a>
        </div>

        {/* Row of 3 Stat Counters with hairline dividers */}
        <div className="pt-10 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-center max-w-3xl mx-auto">
          {heroStats.map((stat, idx) => (
            <div key={stat.label} className="flex flex-col items-center">
              <StatCounter
                endVal={stat.endVal}
                suffix={stat.suffix}
                display={stat.display}
                label={stat.label}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
