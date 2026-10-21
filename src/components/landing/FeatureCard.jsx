import React from 'react';
import { 
  MessageSquareCode, 
  CheckSquare, 
  Mic, 
  Cpu, 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';

const iconMap = {
  MessageSquareCode: MessageSquareCode,
  CheckSquare: CheckSquare,
  Mic: Mic,
  Cpu: Cpu,
};

export default function FeatureCard({ card }) {
  const IconComponent = iconMap[card.icon] || Sparkles;

  return (
    <div 
      className="group relative rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-6 sm:p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(99,102,241,0.12)] flex flex-col justify-between overflow-hidden"
    >
      {/* Background Subtle Gradient */}
      <div 
        className={`absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-br ${card.gradient} blur-3xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity`} 
      />

      <div>
        {/* Mock UI/Screenshot Slot (Accessible visual placeholder) */}
        <div className="relative w-full h-40 sm:h-44 rounded-xl sm:rounded-2xl border border-white/[0.08] bg-black/60 overflow-hidden mb-6 flex flex-col justify-between p-3.5 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500/80" />
              <span className="w-2 h-2 rounded-full bg-amber-500/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase">
              {card.label}
            </span>
          </div>

          {/* Interactive visual simulation inside screenshot slot */}
          <div className="flex-1 flex flex-col justify-center items-center py-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/80 mb-2 group-hover:scale-110 transition-transform">
              <IconComponent className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs font-mono text-white/60">
              [VISUAL // {card.id.toUpperCase()}_PREVIEW]
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-mono text-white/30">
            <span>THREAD_ID // 0x8F9</span>
            <span className="text-emerald-400">STATUS: ACTIVE</span>
          </div>
        </div>

        {/* Small Uppercase Label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-medium tracking-widest text-indigo-400 uppercase">
            {card.label}
          </span>
          <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        {/* H3 Title */}
        <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight leading-snug mb-3">
          {card.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed mb-6">
          {card.description}
        </p>
      </div>

      {/* 2 Mini Stats */}
      <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-4">
        {card.stats.map((st, i) => (
          <div key={i} className="text-left">
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              {st.label}
            </div>
            <div className="text-xs sm:text-sm font-mono font-medium text-white/90 mt-0.5">
              {st.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
