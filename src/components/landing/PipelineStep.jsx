import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PipelineStep({ step, title, description, index, total }) {
  return (
    <div className="relative group p-6 sm:p-7 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Monospace Step Indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
          {step}
        </span>
        <span className="text-[10px] font-mono text-white/30">
          0{index + 1} / 0{total}
        </span>
      </div>

      <div>
        {/* Title */}
        <h4 className="text-lg sm:text-xl font-light text-white tracking-tight mb-2">
          {title}
        </h4>

        {/* Description */}
        <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
          {description}
        </p>
      </div>

      {/* Decorative hairline progress indicator */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/40">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          VERIFIED STAGE
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
      </div>

    </div>
  );
}
