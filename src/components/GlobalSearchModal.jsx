import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  X, 
  Building2, 
  HelpCircle, 
  Briefcase, 
  MessageSquare, 
  Sparkles,
  ArrowRight,
  Filter,
  Terminal
} from 'lucide-react';
import { getCompanies, getInterviewQuestions, getUpcomingDrives, getInterviewExperiences } from '../services/storage';

export default function GlobalSearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

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

  const companies = getCompanies();
  const questions = getInterviewQuestions();
  const drives = getUpcomingDrives();
  const experiences = getInterviewExperiences();

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const found = [];

    // Search Companies
    if (activeFilter === 'all' || activeFilter === 'companies') {
      companies.forEach(c => {
        if (
          c.name.toLowerCase().includes(q) || 
          c.roles.some(r => r.toLowerCase().includes(q)) ||
          c.frequentTopics.some(t => t.toLowerCase().includes(q))
        ) {
          found.push({
            type: 'company',
            id: c.id,
            title: c.name,
            subtitle: `${c.tier} • ${c.roles.join(', ')}`,
            badge: 'Company',
            badgeColor: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
            data: c
          });
        }
      });
    }

    // Search Questions
    if (activeFilter === 'all' || activeFilter === 'questions') {
      questions.forEach(item => {
        if (
          item.question.toLowerCase().includes(q) || 
          item.category.toLowerCase().includes(q) ||
          (item.skills && item.skills.some(s => s.toLowerCase().includes(q)))
        ) {
          found.push({
            type: 'question',
            id: item.id,
            title: item.question,
            subtitle: `${item.companyId.toUpperCase()} • ${item.category} • ${item.difficulty}`,
            badge: `${item.round.toUpperCase()} Question`,
            badgeColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
            data: item
          });
        }
      });
    }

    // Search Placement Drives
    if (activeFilter === 'all' || activeFilter === 'drives') {
      drives.forEach(d => {
        if (
          d.companyName.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          d.eligibleBatches.some(b => b.includes(q))
        ) {
          found.push({
            type: 'drive',
            id: d.id,
            title: `${d.companyName} - ${d.role}`,
            subtitle: `CTC: ${d.ctc} • Drive Date: ${d.driveDate} • Batches: ${d.eligibleBatches.join(', ')}`,
            badge: 'Placement Drive',
            badgeColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
            data: d
          });
        }
      });
    }

    // Search Interview Experiences
    if (activeFilter === 'all' || activeFilter === 'experiences') {
      experiences.forEach(exp => {
        if (
          exp.companyName.toLowerCase().includes(q) ||
          exp.role.toLowerCase().includes(q) ||
          exp.tips.toLowerCase().includes(q)
        ) {
          found.push({
            type: 'experience',
            id: exp.id,
            title: `${exp.companyName} - ${exp.role} (${exp.batch} Batch)`,
            subtitle: `${exp.outcome} • ${exp.roundsFaced.join(' → ')}`,
            badge: 'Experience',
            badgeColor: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
            data: exp
          });
        }
      });
    }

    return found;
  }, [query, activeFilter, companies, questions, drives, experiences]);

  if (!isOpen) return null;

  const handleItemClick = (item) => {
    onSelectResult?.(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 sm:pt-20 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/80">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, SQL queries, DSA topics, drives, HR answers..."
            className="w-full bg-transparent text-white text-sm placeholder:text-slate-500 focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-semibold hover:bg-slate-700"
          >
            Esc
          </button>
        </div>

        {/* Filter Badges */}
        <div className="px-4 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs font-mono bg-slate-950/40">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Results' },
            { id: 'companies', label: 'Companies' },
            { id: 'questions', label: 'Questions' },
            { id: 'drives', label: 'Drives' },
            { id: 'experiences', label: 'Experiences' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap border ${
                activeFilter === f.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)] font-semibold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-800/60 font-mono">
          {query.trim() === '' ? (
            <div className="py-10 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white font-sans">Quick Placement Radar</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Search for companies like <b>HCLTech</b>, <b>TCS</b>, topics like <b>SQL</b>, <b>Linked Lists</b>, or interview stages.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {['HCLTech', 'Floyd Cycle', 'ACID Properties', 'Tell Me About Yourself', 'TCS Prime', 'Batch 2026'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-500/20 hover:text-indigo-300 text-slate-400 text-xs border border-slate-800 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-300">No matching records found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for generic terms like "Java", "SQL", "Managerial", or "HCLTech".</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleItemClick(item)}
                className="p-3 rounded-xl hover:bg-slate-900/90 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {item.type === 'company' && <Building2 className="w-4 h-4 text-indigo-400" />}
                    {item.type === 'question' && <HelpCircle className="w-4 h-4 text-emerald-400" />}
                    {item.type === 'drive' && <Briefcase className="w-4 h-4 text-amber-400" />}
                    {item.type === 'experience' && <MessageSquare className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          Showing {results.length} results • Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-400 rounded text-[10px]">Esc</kbd> to exit
        </div>
      </div>
    </div>
  );
}
