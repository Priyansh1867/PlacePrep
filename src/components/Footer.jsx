import React from 'react';
import { Sparkles, ShieldCheck, Heart, ExternalLink, HelpCircle, GraduationCap, Terminal, Activity } from 'lucide-react';
import PlacePrepLogo from './PlacePrepLogo';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#030712] text-slate-400 border-t border-slate-800/80 mt-24 relative overflow-hidden">
      {/* Decorative top border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <PlacePrepLogo className="w-8 h-8" subtitle={null} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Next-generation campus placement intelligence platform. Empowering engineering students to crack top recruitment drives with verified company analytics and round telemetry.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 inline-flex font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>TELEMETRY ONLINE • VERIFIED DRIVES</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Placement Core</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('drives')} className="hover:text-white transition-colors text-slate-400">
                  Upcoming Placement Drives
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('workflow')} className="hover:text-white transition-colors text-slate-400">
                  Selection Workflow Radar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('companies')} className="hover:text-white transition-colors text-slate-400">
                  Company Directory & Hubs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('prep')} className="hover:text-white transition-colors text-slate-400">
                  Interview Question Bank
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mock-interview')} className="hover:text-white transition-colors flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <span>AI Mock Interviewer</span>
                  <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded text-[9px] font-mono">v2.5</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Recruiters */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Hiring Tracks</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              {[
                { name: 'HCLTech Specialist Track', tag: '8.5 LPA' },
                { name: 'TCS Prime & Digital', tag: '9.0 LPA' },
                { name: 'Infosys HackWithInfy Track', tag: '9.5 LPA' },
                { name: 'Accenture ASE / FSE', tag: '6.5 LPA' },
                { name: 'Deloitte USI Consulting', tag: '11.5 LPA' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button onClick={() => onNavigate('companies')} className="hover:text-white transition-colors flex items-center justify-between w-full text-slate-400 group">
                    <span className="group-hover:text-slate-200">{item.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{item.tag}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Integrity & Telemetry */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>System & Data Integrity</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All question frequencies, interview patterns, and round telemetry are statistically synthesized from historical candidate submissions and real-world placement drives.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>API Status</span>
                <span className="text-emerald-400 font-semibold">Healthy</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Conflict Engine</span>
                <span className="text-indigo-400 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} PlacePrep Platform. Built for engineering & computer science campus placement aspirants.</p>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400">
              Next-Gen Dark Tech Edition
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
