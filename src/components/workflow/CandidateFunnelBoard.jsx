import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Award,
  Sparkles,
  ClipboardCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  Briefcase
} from 'lucide-react';
import EvaluatorScorecardModal from './EvaluatorScorecardModal';

const ROUND_COLUMNS = [
  { id: 'applied', label: 'Applied Candidates', badge: 'Stage 0: Registered', color: 'slate' },
  { id: 'aptitude', label: 'Round 1: Aptitude', badge: 'Stage 1: Screening', color: 'blue' },
  { id: 'technical', label: 'Round 2: Technical', badge: 'Stage 2: Core Tech', color: 'indigo' },
  { id: 'selected', label: 'Final Selects', badge: 'Stage 3: Offer Released', color: 'emerald' }
];

export default function CandidateFunnelBoard({
  candidates = [],
  onUpdateCandidateStatus,
  onSaveEvaluation,
  companies = []
}) {
  const [boardView, setBoardView] = useState('kanban'); // 'kanban' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [activeBulkRound, setActiveBulkRound] = useState('aptitude');
  const [cutoffThreshold, setCutoffThreshold] = useState(75);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [evalModalCandidate, setEvalModalCandidate] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Funnel stage candidate grouping
  const stageCandidates = useMemo(() => {
    const map = {
      applied: [],
      aptitude: [],
      technical: [],
      selected: []
    };

    candidates.forEach(cand => {
      // Check company filter
      if (selectedCompanyFilter !== 'ALL' && cand.companyName !== selectedCompanyFilter) {
        return;
      }
      // Check search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = cand.name.toLowerCase().includes(q) ||
          cand.branch.toLowerCase().includes(q) ||
          cand.companyName.toLowerCase().includes(q) ||
          (cand.college && cand.college.toLowerCase().includes(q));
        if (!matches) return;
      }

      if (cand.status === 'Selected') {
        map.selected.push(cand);
      } else if (cand.currentRound === 'technical' || cand.currentRound === 'managerial') {
        map.technical.push(cand);
      } else if (cand.currentRound === 'aptitude') {
        map.aptitude.push(cand);
      } else {
        map.applied.push(cand);
      }
    });

    return map;
  }, [candidates, selectedCompanyFilter, searchQuery]);

  // Bulk action: Select all candidates with score >= cutoff in active round
  const handleSelectAboveCutoff = () => {
    const list = stageCandidates[activeBulkRound] || [];
    const passing = list.filter(cand => {
      // Find relevant score: aptitude or technical
      const score = activeBulkRound === 'aptitude'
        ? (cand.scores?.aptitude ?? 0)
        : (cand.scores?.technical ?? 0);
      return score >= cutoffThreshold;
    });

    const passingIds = passing.map(c => c.id || c.candidateId);
    setSelectedCandidateIds(passingIds);
    showNotification(`Selected ${passingIds.length} candidate(s) with score >= ${cutoffThreshold}% in ${activeBulkRound.toUpperCase()} round.`);
  };

  // Bulk action: Advance selected candidates to next round
  const handleBulkAdvance = () => {
    if (selectedCandidateIds.length === 0) {
      showNotification('Please select candidates to advance.');
      return;
    }

    let nextRound = 'technical';
    let newStatus = 'Advanced';
    if (activeBulkRound === 'applied') {
      nextRound = 'aptitude';
    } else if (activeBulkRound === 'aptitude') {
      nextRound = 'technical';
    } else if (activeBulkRound === 'technical') {
      nextRound = 'selected';
      newStatus = 'Selected';
    }

    selectedCandidateIds.forEach(id => {
      onUpdateCandidateStatus(id, newStatus, nextRound);
    });

    showNotification(`Advanced ${selectedCandidateIds.length} candidate(s) to ${nextRound.toUpperCase()} round!`);
    setSelectedCandidateIds([]);
  };

  // Bulk action: Eliminate remaining unselected candidates in active round
  const handleBulkEliminateRemaining = () => {
    const list = stageCandidates[activeBulkRound] || [];
    const remaining = list.filter(c => !selectedCandidateIds.includes(c.id || c.candidateId));

    if (remaining.length === 0) {
      showNotification('No remaining candidates to eliminate in this round.');
      return;
    }

    remaining.forEach(c => {
      onUpdateCandidateStatus(c.id || c.candidateId, 'Eliminated', null, 'REJECTED: Below round cutoff threshold');
    });

    showNotification(`Updated ${remaining.length} remaining candidate(s) status to REJECTED.`);
    setSelectedCandidateIds([]);
  };

  // Toggle individual candidate selection
  const toggleSelectCandidate = (id) => {
    setSelectedCandidateIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Unique companies
  const uniqueCompanies = useMemo(() => {
    const set = new Set();
    candidates.forEach(c => {
      if (c.companyName) set.add(c.companyName);
    });
    return Array.from(set);
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. VISUAL CANDIDATE RECRUITMENT FUNNEL BAR */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-1">
              <Layers className="w-3.5 h-3.5" />
              Round-Wise Candidate Funnel
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Campus Recruitment Funnel & Shortlisting Roster
            </h3>
            <p className="text-xs text-slate-500">
              Progression pipeline: Applied (500) → Round 1 Aptitude (120) → Round 2 Tech (40) → Final Selects (12).
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setBoardView('kanban')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                boardView === 'kanban' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Funnel Board
            </button>
            <button
              onClick={() => setBoardView('table')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                boardView === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shortlisting Table View
            </button>
          </div>
        </div>

        {/* Funnel Stage Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1. Applied / Screened
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-800">
                {stageCandidates.applied.length + stageCandidates.aptitude.length + stageCandidates.technical.length + stageCandidates.selected.length}
              </span>
              <span className="text-[11px] font-bold text-slate-500">Candidates</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">100% Total Applicant Pool</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 relative overflow-hidden">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              2. Round 1: Aptitude
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-blue-900">
                {stageCandidates.aptitude.length}
              </span>
              <span className="text-[11px] font-bold text-blue-600">Active Pool</span>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold block mt-1">Screening & Code Test</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 relative overflow-hidden">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              3. Round 2: Tech Panel
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-900">
                {stageCandidates.technical.length}
              </span>
              <span className="text-[11px] font-bold text-indigo-600">Shortlisted</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-semibold block mt-1">Live Coding & Architecture</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 relative overflow-hidden">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              4. Final Selects
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-900">
                {stageCandidates.selected.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">Offers Released</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Offer Acceptance Phase</span>
          </div>
        </div>

        {/* 2. BULK ACTIONS TOOLBAR */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-200">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Bulk Actions on Round:</span>
            </div>

            <select
              value={activeBulkRound}
              onChange={e => {
                setActiveBulkRound(e.target.value);
                setSelectedCandidateIds([]);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs cursor-pointer"
            >
              <option value="aptitude" className="text-slate-900">Round 1: Aptitude</option>
              <option value="technical" className="text-slate-900">Round 2: Technical</option>
              <option value="applied" className="text-slate-900">Applied Pool</option>
            </select>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs font-bold">
              <span>Score Cutoff:</span>
              <input
                type="number"
                min="40"
                max="100"
                value={cutoffThreshold}
                onChange={e => setCutoffThreshold(Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 rounded-lg bg-white text-slate-900 font-black text-center"
              />
              <span>%</span>
            </div>

            <button
              type="button"
              onClick={handleSelectAboveCutoff}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs transition shadow-sm cursor-pointer"
            >
              Select All with Score ≥ {cutoffThreshold}%
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBulkAdvance}
              disabled={selectedCandidateIds.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Advance to Next Round ({selectedCandidateIds.length})</span>
            </button>

            <button
              type="button"
              onClick={handleBulkEliminateRemaining}
              className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Eliminate Remaining</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidate, branch, roll number..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Recruiter:</span>
            <select
              value={selectedCompanyFilter}
              onChange={e => setSelectedCompanyFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs"
            >
              <option value="ALL">All Companies</option>
              {uniqueCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. KANBAN BOARD VIEW */}
      {boardView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ROUND_COLUMNS.map(col => {
            const list = stageCandidates[col.id] || [];

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200/80 flex flex-col min-h-[580px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{col.label}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">{col.badge}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-indigo-700 text-xs font-black border border-slate-200 shadow-2xs">
                    {list.length}
                  </span>
                </div>

                {/* Candidate Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {list.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 italic">
                      No candidates currently in this round
                    </div>
                  ) : (
                    list.map(cand => {
                      const isSelected = selectedCandidateIds.includes(cand.id || cand.candidateId);
                      const initials = cand.name.split(' ').map(n => n[0]).slice(0, 2).join('');
                      const relevantScore = col.id === 'aptitude'
                        ? cand.scores?.aptitude
                        : col.id === 'technical'
                        ? cand.scores?.technical
                        : cand.scores?.technical || cand.scores?.aptitude;

                      return (
                        <div
                          key={cand.id || cand.candidateId}
                          className={`p-4 rounded-2xl bg-white border transition shadow-2xs hover:shadow-md space-y-3 ${
                            isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-indigo-200'
                          }`}
                        >
                          {/* Card Top: Checkbox, Name, Status */}
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleSelectCandidate(cand.id || cand.candidateId)}
                              className="mt-0.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="font-black text-xs text-slate-900 truncate">{cand.name}</h5>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  cand.status === 'Selected'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : cand.status === 'Eliminated'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}>
                                  {cand.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                                {cand.branch} • {cand.companyName}
                              </p>
                            </div>
                          </div>

                          {/* Round Scores Bar */}
                          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block font-bold">Aptitude</span>
                              <span className="font-black text-slate-800">{cand.scores?.aptitude || '—'}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">Tech</span>
                              <span className="font-black text-slate-800">{cand.scores?.technical || '—'}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">HR</span>
                              <span className="font-black text-slate-800">{cand.scores?.hr || '—'}%</span>
                            </div>
                          </div>

                          {/* Evaluator Notes Snippet */}
                          {cand.notes && (
                            <p className="text-[10px] text-slate-500 italic bg-indigo-50/40 p-2 rounded-xl border border-indigo-100/50 line-clamp-2">
                              "{cand.notes}"
                            </p>
                          )}

                          {/* Quick Actions */}
                          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-xs">
                            <button
                              type="button"
                              onClick={() => setEvalModalCandidate(cand)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              <span>Scorecard</span>
                            </button>

                            {col.id !== 'selected' && cand.status !== 'Eliminated' && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = col.id === 'applied' ? 'aptitude' : col.id === 'aptitude' ? 'technical' : 'selected';
                                    onUpdateCandidateStatus(cand.id || cand.candidateId, next === 'selected' ? 'Selected' : 'Advanced', next);
                                    showNotification(`${cand.name} advanced to ${next.toUpperCase()}!`);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 transition cursor-pointer"
                                  title="Advance to next round"
                                >
                                  Advance
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateCandidateStatus(cand.id || cand.candidateId, 'Eliminated', null, 'Rejected in round assessment');
                                    showNotification(`${cand.name} marked as REJECTED.`);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 transition cursor-pointer"
                                  title="Eliminate candidate"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. TABLE SHORTLISTING VIEW */}
      {boardView === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = candidates.map(c => c.id || c.candidateId);
                        setSelectedCandidateIds(selectedCandidateIds.length === allIds.length ? [] : allIds);
                      }}
                      className="cursor-pointer"
                    >
                      {selectedCandidateIds.length > 0 && selectedCandidateIds.length === candidates.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Candidate Details</th>
                  <th className="p-4">Recruiter / Company</th>
                  <th className="p-4">Current Round</th>
                  <th className="p-4 text-center">Aptitude Score</th>
                  <th className="p-4 text-center">Tech Score</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {candidates.map(cand => {
                  const isSelected = selectedCandidateIds.includes(cand.id || cand.candidateId);
                  return (
                    <tr
                      key={cand.id || cand.candidateId}
                      className={`hover:bg-slate-50 transition ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => toggleSelectCandidate(cand.id || cand.candidateId)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-slate-900 block">{cand.name}</span>
                        <span className="text-[11px] text-slate-500">{cand.branch} • {cand.batch}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{cand.companyName}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200">
                          {cand.currentRound?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800">
                        {cand.scores?.aptitude ? `${cand.scores.aptitude}%` : '—'}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800">
                        {cand.scores?.technical ? `${cand.scores.technical}%` : '—'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          cand.status === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cand.status === 'Eliminated'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {cand.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEvalModalCandidate(cand)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition"
                        >
                          Scorecard
                        </button>
                        {cand.status !== 'Selected' && cand.status !== 'Eliminated' && (
                          <button
                            type="button"
                            onClick={() => onUpdateCandidateStatus(cand.id || cand.candidateId, 'Advanced', 'technical')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition"
                          >
                            Advance
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evaluator Scorecard Modal */}
      {evalModalCandidate && (
        <EvaluatorScorecardModal
          isOpen={true}
          onClose={() => setEvalModalCandidate(null)}
          candidate={evalModalCandidate}
          roundName={evalModalCandidate.currentRound === 'aptitude' ? 'Round 1: Aptitude Assessment' : 'Round 2: Technical Interview'}
          onSaveEvaluation={(evalData) => {
            if (onSaveEvaluation) {
              onSaveEvaluation(evalData);
            }
            if (evalData.decision === 'RECOMMEND') {
              onUpdateCandidateStatus(evalData.candidateId, 'Advanced', 'technical');
              showNotification(`Candidate ${evalData.candidateName} evaluated and recommended for advancement!`);
            } else if (evalData.decision === 'REJECT') {
              onUpdateCandidateStatus(evalData.candidateId, 'Eliminated', null, 'REJECTED: Evaluator Scorecard Decision');
              showNotification(`Candidate ${evalData.candidateName} marked as REJECTED.`);
            } else {
              showNotification(`Candidate ${evalData.candidateName} put on HOLD for panel review.`);
            }
          }}
        />
      )}
    </div>
  );
}
