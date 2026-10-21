import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { landingConfig } from '../../config/landingConfig';

export default function CTASection() {
  const { ctaSection, brand } = landingConfig;

  return (
    <section className="relative py-28 sm:py-36 overflow-hidden text-center border-b border-white/[0.08]">
      
      {/* Background ambient radial glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-[140px] pointer-events-none -z-10 opacity-30"
        style={{ background: `radial-gradient(circle, ${brand.accentColor} 0%, transparent 70%)` }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Monospace Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-[10px] font-mono tracking-widest text-white/60 uppercase mb-8">
          <Zap className="w-3 h-3 text-indigo-400" />
          <span>ZERO SETUP TIME • INSTANT ACCESS</span>
        </div>

        {/* Big Heading */}
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-light text-white tracking-tight leading-[0.95] mb-6 font-display">
          {ctaSection.heading}
        </h2>

        {/* Subtext */}
        <p className="text-base sm:text-xl text-white/60 font-light max-w-xl mx-auto mb-10 leading-relaxed">
          {ctaSection.subheading}
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-200 text-black font-mono font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_35px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2.5 group"
          >
            <span>{ctaSection.buttonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
}
