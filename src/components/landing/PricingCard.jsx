import React from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingCard({ plan }) {
  return (
    <div
      className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
        plan.popular
          ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-2 border-indigo-500/80 shadow-[0_0_50px_rgba(99,102,241,0.2)] scale-[1.02]'
          : 'bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      {/* Most Popular Floating Badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-mono font-bold text-[10px] uppercase tracking-widest shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          <span>MOST POPULAR</span>
        </div>
      )}

      <div>
        {/* Tier Name */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-mono font-semibold text-white uppercase tracking-wider">
            {plan.name}
          </h3>
        </div>

        {/* Tagline */}
        <p className="text-xs text-white/50 font-light leading-relaxed mb-6 min-h-[36px]">
          {plan.tagline}
        </p>

        {/* Price & Billing */}
        <div className="flex items-baseline gap-2 mb-8 pb-6 border-b border-white/[0.08]">
          <span className="text-4xl sm:text-5xl font-mono font-light text-white tracking-tight">
            {plan.price}
          </span>
          <span className="text-xs font-mono text-white/40 uppercase">
            / {plan.billing}
          </span>
        </div>

        {/* Feature Checkmarks */}
        <div className="space-y-3.5 mb-8">
          <div className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-3">
            INCLUDED CAPABILITIES:
          </div>
          {plan.features.map((feat, i) => (
            <div key={i} className="flex items-start gap-3 text-xs text-white/80 font-light">
              <div className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0 border border-emerald-500/20">
                <Check className="w-3 h-3" />
              </div>
              <span className="leading-snug">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <a
        href="#hero"
        className={`w-full py-3.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          plan.popular
            ? 'bg-white hover:bg-slate-200 text-black shadow-[0_0_25px_rgba(255,255,255,0.3)]'
            : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1]'
        }`}
      >
        <span>{plan.buttonText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
