import React from 'react';
import { Sparkles, ShieldCheck, Heart, ExternalLink, HelpCircle, GraduationCap } from 'lucide-react';
import PlacePrepLogo from './PlacePrepLogo';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="mb-3">
              <PlacePrepLogo className="w-8 h-8" subtitle={null} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Empowering college engineering students to crack dream campus placement drives with company-specific interview intelligence and data-grounded insights.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 inline-flex">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded in verified historical drive records</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Placement Hub
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('drives')} className="hover:text-white transition-colors">
                  Upcoming Placement Drives
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('companies')} className="hover:text-white transition-colors">
                  Company Directory & Hubs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('prep')} className="hover:text-white transition-colors">
                  Interview Question Bank
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mock-interview')} className="hover:text-white transition-colors flex items-center gap-1 text-indigo-400 font-semibold">
                  <span>AI Mock Interviewer</span>
                  <span className="px-1 py-0.2 bg-indigo-500/30 text-indigo-300 rounded text-[9px]">LIVE</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Companies Focus */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Popular Recruiters
            </h4>
            <ul className="space-y-2 text-xs">
              {['HCLTech Placement Prep', 'TCS NQT & Prime', 'Infosys HackWithInfy', 'Accenture ASE Track', 'Deloitte USI Consulting'].map((item, idx) => (
                <li key={idx}>
                  <button onClick={() => onNavigate('companies')} className="hover:text-white transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Integrity & Disclaimers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Academic Integrity
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              All question frequencies and company patterns are statistically synthesized from historical candidate submissions and public placement reports.
            </p>
            <p className="text-[11px] text-slate-500">
              PlacePrep AI does not guarantee specific exam outcomes and encourages comprehensive conceptual learning.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PlacePrep AI Platform. Built for engineering & degree students.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for campus placement aspirants
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
