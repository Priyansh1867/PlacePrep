import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Building2, 
  BookOpen, 
  Briefcase, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { getCompanies, getInterviewQuestions, getUpcomingDrives, getInterviewExperiences } from '../services/storage';
import { getAllStudents } from '../services/academicRecordsService';

export default function GlobalSearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'companies', 'questions', 'drives', 'experiences', 'students'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
import { 
  getCompanies, 
  getInterviewQuestions, 
  getUpcomingDrives, 
  getInterviewExperiences 
} from '../services/storage';

export default function GlobalSearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'companies', 'questions', 'drives', 'experiences'
  const inputRef = useRef(null);

  const companies = getCompanies();
  const questions = getInterviewQuestions();
  const drives = getUpcomingDrives();
  const experiences = getInterviewExperiences();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter results
  const q = query.trim().toLowerCase();

  const matchingCompanies = q ? companies.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.tier.toLowerCase().includes(q) ||
    c.roles?.some(r => r.toLowerCase().includes(q))
  ) : [];

    // Search Student Academic Records
    if (activeFilter === 'all' || activeFilter === 'students') {
      try {
        const students = getAllStudents();
        students.forEach(s => {
          if (
            s.fullName?.toLowerCase().includes(q) ||
            s.rollNumber?.toLowerCase().includes(q) ||
            s.registrationNumber?.toLowerCase().includes(q) ||
            s.branch?.toLowerCase().includes(q)
          ) {
            found.push({
              type: 'academic-record',
              id: s.id,
              title: `${s.fullName} (${s.rollNumber})`,
              subtitle: `${s.branch} • Sem ${s.currentSemester} • CGPA: ${s.cgpa || 'N/A'}`,
              badge: 'Academic Record',
              badgeColor: 'bg-indigo-100 text-indigo-700',
              data: s
            });
          }
        });
      } catch (err) {
        console.warn('Academic records search failed:', err);
      }
    }

    return found;
  }, [query, activeFilter, companies, questions, drives, experiences]);
  const matchingQuestions = q ? questions.filter(item => 
    item.title.toLowerCase().includes(q) || 
    item.tags?.some(t => t.toLowerCase().includes(q)) ||
    item.topic?.toLowerCase().includes(q)
  ) : [];

  const matchingDrives = q ? drives.filter(d => 
    d.companyName.toLowerCase().includes(q) || 
    d.role.toLowerCase().includes(q) ||
    d.venue?.toLowerCase().includes(q)
  ) : [];

  const matchingExperiences = q ? experiences.filter(e => 
    e.companyName.toLowerCase().includes(q) || 
    e.role.toLowerCase().includes(q)
  ) : [];

  const totalResults = matchingCompanies.length + matchingQuestions.length + matchingDrives.length + matchingExperiences.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a company, question topic, role, or drive..."
            className="w-full text-base text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Category Tabs */}
        {q && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-medium mr-1">Filter:</span>
            {[
              { id: 'all', label: `All (${totalResults})` },
              { id: 'companies', label: `Companies (${matchingCompanies.length})` },
              { id: 'questions', label: `Questions (${matchingQuestions.length})` },
              { id: 'drives', label: `Drives (${matchingDrives.length})` },
              { id: 'experiences', label: `Experiences (${matchingExperiences.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeCategory === tab.id
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
          
          {/* Empty state when no search entered */}
          {!q && (
            <div className="p-8 text-center text-slate-500">
              <Command className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">Quick Global Search</p>
              <p className="text-xs text-slate-500 mt-1">
                Search recruiters like <span className="font-semibold text-slate-700">HCLTech</span>, 
                topics like <span className="font-semibold text-slate-700">Binary Tree</span>, 
                or interview passes.
              </p>
            </div>
          )}

          {/* No match state */}
          {q && totalResults === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching companies, questions, or drives found for "{query}".
            </div>
          )}

          {/* Companies */}
          {(activeCategory === 'all' || activeCategory === 'companies') && matchingCompanies.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Recruiters & Companies
              </div>
              {matchingCompanies.map(c => (
                <div
                  key={c.id}
                  onClick={() => { onSelectResult({ type: 'company', data: c }); onClose(); }}
                  className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-slate-500 text-[11px]">{c.tier} • {c.ctc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Placement Drives */}
          {(activeCategory === 'all' || activeCategory === 'drives') && matchingDrives.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Confirmed Placement Drives
              </div>
              {matchingDrives.map(d => (
                <div
                  key={d.id}
                  onClick={() => { onSelectResult({ type: 'drive', data: d }); onClose(); }}
                  className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900">{d.companyName} — {d.role}</div>
                      <div className="text-slate-500 text-[11px]">Drive Date: {d.driveDate} • Venue: {d.venue}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {d.ctc}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Questions */}
          {(activeCategory === 'all' || activeCategory === 'questions') && matchingQuestions.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Interview Questions
              </div>
              {matchingQuestions.map(item => (
                <div
                  key={item.id}
                  onClick={() => { onSelectResult({ type: 'question', data: item }); onClose(); }}
                  className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-slate-500 text-[11px]">{item.topic} • {item.difficulty}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Navigate with mouse or click ESC to close</span>
          <span className="text-[11px]">PlacePrep Unified Search</span>
        </div>

      </div>
    </div>
  );
}
