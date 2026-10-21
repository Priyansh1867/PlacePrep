import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { landingConfig } from '../../config/landingConfig';

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const { brand } = landingConfig;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <a
        href="#pricing"
        className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Start Free Trial"
      >
        <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
          <Zap className="w-3 h-3 fill-white text-white" />
        </div>
        <span>Start Free</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
