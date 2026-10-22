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
  Filter
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

  const companies = getCompanies();
  const questions = getInterviewQuestions();
  const drives = getUpcomingDrives();
  const experiences = getInterviewExperiences();

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const found = [];

    // Quick Module Links: Coding Studio
    if ((activeFilter === 'all' || activeFilter === 'questions') &&
        ('coding studio dsa java compiler problem practice'.includes(q) || q.includes('cod') || q.includes('dsa') || q.includes('studio'))) {
      found.push({
        type: 'coding-studio',
        id: 'coding-studio-engine',
        title: 'DSA Coding Studio',
        subtitle: 'Practice DSA problems with isolated server-side Java evaluation',
        badge: 'Coding Studio',
        badgeColor: 'bg-indigo-100 text-indigo-700',
        data: { route: 'coding-studio' }
      });
    }
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
            badgeColor: 'bg-indigo-100 text-indigo-700',
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
            badgeColor: 'bg-emerald-100 text-emerald-800',
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
            badgeColor: 'bg-amber-100 text-amber-800',
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
            badge: 'Interview Experience',
            badgeColor: 'bg-purple-100 text-purple-800',
            data: exp
          });
        }
      });
    }

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

  if (!isOpen) return null;

  const handleItemClick = (item) => {
    onSelectResult?.(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 sm:pt-20 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, SQL queries, DSA topics, drives, HR answers..."
            className="w-full bg-transparent text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-300"
          >
            Esc
          </button>
        </div>

        {/* Filter Badges */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Results' },
            { id: 'companies', label: 'Companies' },
            { id: 'questions', label: 'Interview Questions' },
            { id: 'drives', label: 'Placement Drives' },
            { id: 'experiences', label: 'Experiences' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="py-10 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Quick Placement Search</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Search for any company like <b>HCLTech</b>, <b>TCS</b>, topics like <b>SQL</b>, <b>Linked Lists</b>, or interview rounds.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {['HCLTech', 'Floyd Cycle', 'ACID Properties', 'Tell Me About Yourself', 'TCS Prime', 'Batch 2028'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-medium border border-slate-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">No matching records found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for generic terms like "Java", "SQL", "Managerial", or "HCLTech".</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleItemClick(item)}
                className="p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {item.type === 'company' && <Building2 className="w-4 h-4 text-indigo-600" />}
                    {item.type === 'question' && <HelpCircle className="w-4 h-4 text-emerald-600" />}
                    {item.type === 'drive' && <Briefcase className="w-4 h-4 text-amber-600" />}
                    {item.type === 'experience' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Showing {results.length} results • Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">Esc</kbd> to exit
        </div>
      </div>
    </div>
  );
}
