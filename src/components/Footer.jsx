import React from 'react';
import { 
  Building2, 
  Briefcase, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import PlacePrepLogo from './PlacePrepLogo';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <PlacePrepLogo subtitle="Campus Recruitment Suite" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardized campus recruitment preparation, automated eligibility audits, and schedule conflict prevention for university placement cells.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Placement Drive Season Active
              </span>
            </div>
          </div>

          {/* Placement Modules */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Recruitment Suite
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('drives')} className="hover:text-indigo-600 transition-colors">
                  Upcoming Placement Drives
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('drives')} className="hover:text-indigo-600 transition-colors">
                  Eligibility Engine & Verification
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('drives')} className="hover:text-indigo-600 transition-colors">
                  Drive Calendar & Venue Passes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('academic-records')} className="hover:text-white transition-colors">
                  Student Academic Records
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mock-interview')} className="hover:text-white transition-colors flex items-center gap-1 text-indigo-400 font-semibold">
                  <span>AI Mock Interviewer</span>
                  <span className="px-1 py-0.2 bg-indigo-500/30 text-indigo-300 rounded text-[9px]">LIVE</span>
                <button onClick={() => onNavigate('workflow')} className="hover:text-indigo-600 transition-colors">
                  Candidate Pipeline & Stages
                </button>
              </li>
            </ul>
          </div>

          {/* Student Preparation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Preparation Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('companies')} className="hover:text-indigo-600 transition-colors">
                  Company Profiles & Hubs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('prep')} className="hover:text-indigo-600 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mock-interview')} className="hover:text-indigo-600 transition-colors">
                  Simulated AI Mock Interview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('experiences')} className="hover:text-indigo-600 transition-colors">
                  Alumni Interview Debriefs
                </button>
              </li>
            </ul>
          </div>

          {/* College Administration & Support */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Training & Placement Cell
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-indigo-600 transition-colors">
                  TPO Admin Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-indigo-600 transition-colors">
                  Student Verification Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-insights')} className="hover:text-indigo-600 transition-colors">
                  Placement Trend Intelligence
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PlacePrep. Built for collegiate placement cells and career services.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Strictly Academic & Placement Use</span>
            <span className="text-slate-400">System v2.4.0</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
