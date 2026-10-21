import React from 'react';
import { Briefcase, TrendingUp, Trophy, Video, Users, CheckCircle } from 'lucide-react';

export default function Placement3DAnimation() {
  return (
    <div className="relative w-full h-16 sm:h-20 my-0.5 flex items-center justify-center overflow-hidden pointer-events-none select-none">
      
      {/* 3D Perspective Scene */}
      <div 
        className="relative w-40 h-40 flex items-center justify-center scale-[0.65] sm:scale-[0.72]"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        
        {/* Ambient Radial Core Glow */}
        <div className="absolute w-32 h-32 rounded-full bg-emerald-500/25 blur-xl animate-pulse" />

        {/* 3D Rotating Outer Ring (Emerald) */}
        <div 
          className="absolute w-40 h-40 rounded-full border border-emerald-400/40 border-dashed animate-spin-slow"
          style={{ transform: 'rotateX(65deg) rotateZ(0deg)', transformStyle: 'preserve-3d' }}
        />

        {/* 3D Counter-Rotating Inner Ring (Teal) */}
        <div 
          className="absolute w-28 h-28 rounded-full border-2 border-teal-400/50 animate-reverse-spin"
          style={{ transform: 'rotateX(-60deg) rotateY(25deg)', transformStyle: 'preserve-3d' }}
        />

        {/* Floating Central 3D Corporate Trophy Core */}
        <div 
          className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 p-0.5 shadow-[0_0_25px_rgba(16,185,129,0.6)] animate-float-3d"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="w-full h-full rounded-2xl bg-[#06241f]/90 backdrop-blur-md flex flex-col items-center justify-center text-white border border-emerald-300/30">
            <Trophy className="w-7 h-7 text-amber-300 drop-shadow-[0_2px_8px_rgba(252,211,77,0.8)]" />
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8px] font-mono font-bold tracking-wider text-emerald-200">CAREERS</span>
            </div>
          </div>
        </div>

        {/* Floating Holographic Satellite 1: Top Offer CTC */}
        <div 
          className="absolute -top-1 -right-2 px-2 py-0.5 rounded-lg bg-[#061e1a]/90 border border-emerald-400/40 text-emerald-200 text-[9px] font-mono font-bold shadow-lg flex items-center gap-1 animate-orbit-1"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
          <span>32 LPA</span>
        </div>

        {/* Floating Holographic Satellite 2: Live PPT */}
        <div 
          className="absolute -bottom-1 -left-2 px-2 py-0.5 rounded-lg bg-[#061e1a]/90 border border-teal-400/40 text-teal-200 text-[9px] font-mono font-bold shadow-lg flex items-center gap-1 animate-orbit-2"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Video className="w-2.5 h-2.5 text-teal-400" />
          <span>LIVE PPT</span>
        </div>

        {/* Floating Holographic Satellite 3: Shortlist Funnel */}
        <div 
          className="absolute top-1/2 -left-6 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-[8px] font-mono text-emerald-300 flex items-center gap-1 shadow-md"
        >
          <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
          <span>142 PLACED</span>
        </div>

      </div>

    </div>
  );
}
