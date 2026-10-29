// PlacePrep AI - DSA Question Explorer Component
// Displays searchable, filterable problem catalog with metrics,
// topic breakdown, difficulty filters, completion status, and recently attempted problems.

import React, { useMemo } from 'react';
import {
  Search,
  Filter,
  Code2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Clock,
  Building2,
  Check
} from 'lucide-react';
import { DSA_CANONICAL_TOPICS } from '../../services/dsaService.js';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import SearchBar from '../ui/SearchBar';
import ProgressBar from '../ui/ProgressBar';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';

export default function DsaQuestionExplorer({
  questions = [],
  loading = false,
  error = null,
  onRetry,
  metrics,
  searchQuery,
  setSearchQuery,
  selectedTopic,
  setSelectedTopic,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedStatus,
  setSelectedStatus,
  selectedCompany,
  setSelectedCompany,
  practicedIds = [],
  revisionIds = [],
  recentIds = [],
  onTogglePracticed,
  onToggleRevision,
  onSelectQuestion,
  onOpenRevision
}) {
  // Extract unique companies from question bank for filter
  const companyOptions = useMemo(() => {
    const set = new Set();
    questions.forEach(q => {
      if (q.companyName) set.add(q.companyName);
      else if (q.companyId) set.add(q.companyId.toUpperCase());
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [questions]);

  // Filter questions based on all active criteria
  const filteredQuestions = useMemo(() => {
    const qLower = (searchQuery || '').toLowerCase().trim();

    return questions.filter(q => {
      const title = (q.title || '').toLowerCase();
      const topic = (q.topic || '').toLowerCase();
      const company = (q.companyName || q.companyId || '').toLowerCase();
      const skillsStr = (Array.isArray(q.skills) ? q.skills.join(' ') : '').toLowerCase();

      const matchesSearch = !qLower ||
        title.includes(qLower) ||
        topic.includes(qLower) ||
        company.includes(qLower) ||
        skillsStr.includes(qLower);

      const matchesTopic = selectedTopic === 'All Topics' ? true :
        topic.toLowerCase() === selectedTopic.toLowerCase() ||
        topic.includes(selectedTopic.toLowerCase().split(' ')[0]);

      const matchesDiff = selectedDifficulty === 'ALL' ? true :
        (q.difficulty || '').toUpperCase() === selectedDifficulty.toUpperCase();

      const isPracticed = practicedIds.includes(q.id) || (q.questionId && practicedIds.includes(q.questionId));
      const isRevision = revisionIds.includes(q.id) || (q.questionId && revisionIds.includes(q.questionId));

      let matchesStatus = true;
      if (selectedStatus === 'SOLVED') matchesStatus = isPracticed;
      else if (selectedStatus === 'UNSOLVED') matchesStatus = !isPracticed;
      else if (selectedStatus === 'REVISION') matchesStatus = isRevision;

      const matchesCompany = selectedCompany === 'ALL' ? true :
        (q.companyName || '').toUpperCase() === selectedCompany.toUpperCase() ||
        (q.companyId || '').toUpperCase() === selectedCompany.toUpperCase();

      return matchesSearch && matchesTopic && matchesDiff && matchesStatus && matchesCompany;
    });
  }, [questions, searchQuery, selectedTopic, selectedDifficulty, selectedStatus, selectedCompany, practicedIds, revisionIds]);

  // Map recently attempted questions for quick resume
  const recentQuestions = useMemo(() => {
    if (!recentIds || recentIds.length === 0) return [];
    return recentIds
      .map(id => questions.find(q => q.id === id || q.questionId === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [recentIds, questions]);

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Student Solved
            </span>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
              {metrics.overallPercentage}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {metrics.solved} <span className="text-sm font-semibold text-slate-400">/ {metrics.total}</span>
          </div>
          <ProgressBar progress={metrics.overallPercentage} color="indigo" size="sm" className="mt-3" />
        </Card>

        <Card className="p-5 border-emerald-100 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Easy</span>
            <Badge variant="emerald" size="sm">{metrics.easy.solved}/{metrics.easy.total}</Badge>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-950">
            {metrics.easy.percentage}%
          </div>
          <ProgressBar progress={metrics.easy.percentage} color="emerald" size="sm" className="mt-3" />
        </Card>

        <Card className="p-5 border-amber-100 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Medium</span>
            <Badge variant="amber" size="sm">{metrics.medium.solved}/{metrics.medium.total}</Badge>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-950">
            {metrics.medium.percentage}%
          </div>
          <ProgressBar progress={metrics.medium.percentage} color="amber" size="sm" className="mt-3" />
        </Card>

        <Card className="p-5 border-rose-100 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Hard</span>
            <Badge variant="rose" size="sm">{metrics.hard.solved}/{metrics.hard.total}</Badge>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-950">
            {metrics.hard.percentage}%
          </div>
          <ProgressBar progress={metrics.hard.percentage} color="rose" size="sm" className="mt-3" />
        </Card>
      </div>

      {/* Recently Attempted Resume Strip (If Available) */}
      {recentQuestions.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Continue Your Practice • Recently Opened</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {recentQuestions.map((rq) => (
              <button
                key={rq.id}
                onClick={() => onSelectQuestion(rq)}
                className="text-left p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-200 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="font-bold text-indigo-700">{rq.companyName}</span>
                  <span className="text-slate-400 capitalize">{rq.difficulty}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mt-1 group-hover:text-indigo-600 transition-colors">
                  {rq.title}
                </h4>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-slate-200 shadow-xs space-y-4">
        
        {/* Top Filter Row: Search, Company, Difficulty, Status */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="flex-1 min-w-[280px]">
            <Input
              type="text"
              placeholder="Search by problem name, keyword, or algorithm pattern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Company Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {companyOptions.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Companies' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'SOLVED', label: 'Solved' },
                { id: 'UNSOLVED', label: 'Unsolved' },
                { id: 'REVISION', label: 'Revision' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] cursor-pointer ${
                    selectedStatus === st.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Filter Row: 13 Canonical DSA Topics Scrollable Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 text-xs scrollbar-none pb-1">
          <span className="text-slate-400 font-semibold shrink-0 mr-1">Topic:</span>
          {DSA_CANONICAL_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic;
            const count = topic === 'All Topics'
              ? questions.length
              : (metrics.topicBreakdown[topic]?.total || 0);

            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
                }`}
              >
                <span>{topic}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </Card>

      {/* Questions List */}
      {error && questions.length === 0 ? (
        <ErrorState
          title="Unable to Load DSA Question Bank"
          message={error}
          onRetry={onRetry}
        />
      ) : loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No coding problems match your filters"
          description="Try broadening your search keyword, switching topic, or resetting completion status."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTopic('All Topics');
                setSelectedDifficulty('ALL');
                setSelectedStatus('ALL');
                setSelectedCompany('ALL');
                setSearchQuery('');
              }}
            >
              Reset All Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const isPracticed = practicedIds.includes(q.id) || (q.questionId && practicedIds.includes(q.questionId));
            const isRevision = revisionIds.includes(q.id) || (q.questionId && revisionIds.includes(q.questionId));

            const diffLower = (q.difficulty || 'medium').toLowerCase();
            const badgeVariant = diffLower === 'easy' ? 'emerald' : diffLower === 'hard' ? 'rose' : 'amber';

            return (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  {/* Solved Checkbox */}
                  <button
                    onClick={() => onTogglePracticed(q.id)}
                    className={`p-2 rounded-xl border mt-0.5 transition-colors shrink-0 cursor-pointer ${
                      isPracticed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-400'
                    }`}
                    title={isPracticed ? 'Marked as solved (Click to toggle)' : 'Mark as solved'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={badgeVariant} size="sm">
                        {q.difficulty}
                      </Badge>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {q.companyName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {q.topic}
                      </span>
                      {q.frequencyScore && (
                        <span className="text-[11px] font-bold text-amber-600">
                          ★ {q.frequencyScore}%
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectQuestion(q)}
                      className="font-extrabold text-slate-900 text-sm sm:text-base mt-1.5 group-hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {q.title}
                    </h3>

                    {/* Approach / Snippet */}
                    {(q.approach || q.suggestedAnswer) && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-sans">
                        {q.approach ? q.approach.slice(0, 140) : q.suggestedAnswer.slice(0, 140)}...
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Tools */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onToggleRevision(q.id)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      isRevision
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                    }`}
                    title={isRevision ? 'In revision queue' : 'Flag for revision'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    onClick={() => onSelectQuestion(q)}
                  >
                    Solve in Studio
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
