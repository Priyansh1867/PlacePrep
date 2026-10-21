import React from 'react';
import { ShieldCheck, Lock, Key, Server, Cpu, CheckCircle } from 'lucide-react';
import { landingConfig } from '../../config/landingConfig';

export default function SecurityVault() {
  const { security } = landingConfig;

  return (
    <section id="security" className="relative py-24 border-b border-white/[0.08] overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-[10px] font-mono tracking-widest text-indigo-400 uppercase mb-4">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>{security.label}</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white tracking-tight leading-tight mb-4">
            {security.heading}
          </h2>

          <p className="text-sm sm:text-base text-white/60 font-light max-w-xl mx-auto">
            {security.subheading}
          </p>

          {/* Two Key Stats */}
          <div className="mt-8 flex items-center justify-center gap-10 sm:gap-16">
            {security.stats.map((st) => (
              <div key={st.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-mono font-light text-white">
                  {st.value}
                </div>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest mt-1">
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Vault Graphic Card */}
        <div className="max-w-3xl mx-auto rounded-3xl border border-white/[0.12] bg-gradient-to-b from-white/[0.04] to-black/80 backdrop-blur-xl p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Orbiting Satellite App Badges */}
          <div className="relative z-10 flex flex-col items-center justify-center py-8">
            
            <div className="relative mb-8">
              {/* Central Vault Core */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-black border border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.3)] flex flex-col items-center justify-center text-white relative">
                <ShieldCheck className="w-10 h-10 text-indigo-400 mb-1" />
                <span className="text-[9px] font-mono font-bold tracking-wider text-indigo-300 uppercase">
                  VAULT CORE
                </span>
                
                {/* Ping Beacon */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              {/* Orbiting App Badge: Gmail */}
              <div className="absolute -top-4 -left-16 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-black/90 text-white font-mono text-[11px] flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>Gmail OAuth</span>
              </div>

              {/* Orbiting App Badge: Stripe */}
              <div className="absolute -bottom-4 -left-14 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-black/90 text-white font-mono text-[11px] flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Stripe API</span>
              </div>

              {/* Orbiting App Badge: Slack */}
              <div className="absolute -top-2 -right-16 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-black/90 text-white font-mono text-[11px] flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Slack Bot</span>
              </div>

              {/* Orbiting App Badge: GitHub */}
              <div className="absolute -bottom-4 -right-14 px-3 py-1.5 rounded-xl border border-white/[0.1] bg-black/90 text-white font-mono text-[11px] flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>GitHub App</span>
              </div>
            </div>

            {/* Central Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-mono text-xs tracking-wider uppercase mb-6">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>SECURE / AES-256 GCM ENCRYPTION</span>
            </div>

            {/* Monospace Ticker with Blinking Cursor */}
            <div className="w-full max-w-lg rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 flex items-center justify-between font-mono text-xs text-white/80">
              <div className="flex items-center gap-2 truncate">
                <span className="text-emerald-400 font-bold">$</span>
                <span className="text-white/70 truncate">{security.auditCode}</span>
                <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block" />
              </div>
              <span className="text-[10px] text-white/40 uppercase shrink-0">
                TLS 1.3
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
