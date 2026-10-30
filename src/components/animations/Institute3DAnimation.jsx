import React from 'react';
import { GraduationCap, Award, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Institute3DAnimation() {
  return (
    <div className="relative w-full h-16 sm:h-20 my-0.5 flex items-center justify-center overflow-hidden pointer-events-none select-none">
      
      {/* 3D Perspective Scene */}
      <div 
        className="relative w-40 h-40 flex items-center justify-center scale-[0.65] sm:scale-[0.72]"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        
        {/* Ambient Radial Core Glow */}
        <div className="absolute w-32 h-32 rounded-full bg-indigo-500/25 blur-xl animate-pulse" />

        {/* 3D Rotating Outer Ring */}
        <div 
          className="absolute w-40 h-40 rounded-full border border-indigo-400/40 border-dashed animate-spin-slow"
          style={{ transform: 'rotateX(65deg) rotateZ(0deg)', transformStyle: 'preserve-3d' }}
        />

        {/* 3D Counter-Rotating Inner Ring */}
        <div 
          className="absolute w-28 h-28 rounded-full border-2 border-violet-400/50 animate-reverse-spin"
          style={{ transform: 'rotateX(-60deg) rotateY(25deg)', transformStyle: 'preserve-3d' }}
        />

        {/* Floating Central 3D Knowledge Core */}
        <div 
          className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 p-0.5 shadow-[0_0_25px_rgba(99,102,241,0.6)] animate-float-3d"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="w-full h-full rounded-2xl bg-[#0f1738]/90 backdrop-blur-md flex flex-col items-center justify-center text-white border border-indigo-300/30">
            <GraduationCap className="w-7 h-7 text-indigo-300 drop-shadow-[0_2px_8px_rgba(165,180,252,0.8)]" />
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8px] font-mono font-bold tracking-wider text-indigo-200">CAMPUS</span>
            </div>
          </div>
        </div>

        {/* Floating Holographic Satellite 1: CRT Attendance Gate */}
        <div 
          className="absolute -top-1 -right-2 px-2 py-0.5 rounded-lg bg-[#0b1026]/90 border border-indigo-400/40 text-indigo-200 text-[9px] font-mono font-bold shadow-lg flex items-center gap-1 animate-orbit-1"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          <span>CRT ≥75%</span>
        </div>

        {/* Floating Holographic Satellite 2: ATS Scanner */}
        <div 
          className="absolute -bottom-1 -left-2 px-2 py-0.5 rounded-lg bg-[#0b1026]/90 border border-violet-400/40 text-violet-200 text-[9px] font-mono font-bold shadow-lg flex items-center gap-1 animate-orbit-2"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Sparkles className="w-2.5 h-2.5 text-violet-400" />
          <span>RESUME</span>
        </div>

        {/* Floating Holographic Satellite 3: Class Marksheets */}
        <div 
          className="absolute top-1/2 -left-6 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-[8px] font-mono text-indigo-300 flex items-center gap-1 shadow-md"
        >
          <BookOpen className="w-2.5 h-2.5 text-indigo-400" />
          <span>ACADEMICS</span>
        </div>

      </div>

    </div>
  );
}
