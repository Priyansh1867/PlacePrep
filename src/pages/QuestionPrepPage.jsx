import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Code2, 
  HelpCircle, 
  Flame, 
  Lightbulb, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Share2, 
  Copy, 
  Layers,
  Search,
  Filter,
  Star,
  CheckCircle,
  XCircle,
  ArrowRight,
  Database,
  Terminal,
  Calculator,
  RefreshCw,
  BookOpen,
  Award
} from 'lucide-react';
import { 
  getPracticedQuestions, 
  togglePracticedQuestion, 
  getSavedQuestions, 
  toggleSavedQuestion, 
  getRevisionList, 
  toggleRevisionQuestion,
  getCompanies,
  getCurrentUser
} from '../services/storage';
import { UserApi } from '../services/api';
import {
  QUESTION_SUBJECTS,
  QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
  loadQuestionBankPool,
  getStudentQuestionAttempts,
  recordStudentQuestionAttempt,
  resetStudentQuestionAttempt,
  computeStudentQuestionStats
} from '../services/questionBankService';

export default function QuestionPrepPage({ 
  initialQuestion, 
  roundType, 
  companyId, 
  onBack,
  onNavigateToMock
}) {
  const currentUser = getCurrentUser();
  const studentId = currentUser?.id || currentUser?.email || 'default_student';
  const companiesList = getCompanies();

  // View state: 'DASHBOARD' | 'PRACTICE'
  const [viewMode, setViewMode] = useState(initialQuestion ? 'PRACTICE' : 'DASHBOARD');

  // Loading & Questions Pool
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState(companyId || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'ATTEMPTED' | 'UNATTEMPTED' | 'SOLVED' | 'STARRED'

  // Practice state
  const [activeQuestionId, setActiveQuestionId] = useState(initialQuestion?.id || null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Student Attempt Input in Practice mode
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [practiceAnswerText, setPracticeAnswerText] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(null);

  // Student progress cache
  const [attemptsMap, setAttemptsMap] = useState(() => getStudentQuestionAttempts(studentId));
  const [practicedIds, setPracticedIds] = useState(() => getPracticedQuestions());
  const [savedIds, setSavedIds] = useState(() => getSavedQuestions());
  const [revisionIds, setRevisionIds] = useState(() => getRevisionList());

  // Load questions
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const pool = await loadQuestionBankPool();
      setQuestions(pool);
      if (initialQuestion && !activeQuestionId) {
        setActiveQuestionId(initialQuestion.id);
      }
    } catch (err) {
      console.warn('Failed to load questions pool:', err);
    } finally {
      setLoading(false);
    }
  }, [initialQuestion, activeQuestionId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Sync state if initialQuestion changes
  useEffect(() => {
    if (initialQuestion) {
      setActiveQuestionId(initialQuestion.id);
      setViewMode('PRACTICE');
    }
  }, [initialQuestion]);

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.toLowerCase().trim();

    return questions.filter(q => {
      // 1. Keyword search
      if (qLower) {
        const title = (q.question || '').toLowerCase();
        const topic = (q.topic || '').toLowerCase();
        const approach = (q.approach || '').toLowerCase();
        const skillsStr = (Array.isArray(q.skills) ? q.skills.join(' ') : '').toLowerCase();
        const compStr = (q.companyName || q.companyId || '').toLowerCase();

        const match = title.includes(qLower) ||
          topic.includes(qLower) ||
          approach.includes(qLower) ||
          skillsStr.includes(qLower) ||
          compStr.includes(qLower);

        if (!match) return false;
      }

      // 2. Subject filter
      if (selectedSubject !== 'ALL') {
        if (q.subject !== selectedSubject) return false;
      }

      // 3. Question Type filter
      if (selectedType !== 'ALL') {
        if (q.type !== selectedType) return false;
      }

      // 4. Difficulty filter
      if (selectedDifficulty !== 'ALL') {
        if ((q.difficulty || '').toUpperCase() !== selectedDifficulty.toUpperCase()) return false;
      }

      // 5. Company filter
      if (selectedCompany !== 'ALL') {
        const cId = (q.companyId || '').toLowerCase();
        if (cId !== selectedCompany.toLowerCase()) return false;
      }

      // 6. Status filter
      const isAttempted = Boolean(attemptsMap[q.id]);
      const isPracticed = practicedIds.includes(q.id);
      const isSaved = savedIds.includes(q.id);

      if (selectedStatus === 'ATTEMPTED' && !isAttempted) return false;
      if (selectedStatus === 'UNATTEMPTED' && isAttempted) return false;
      if (selectedStatus === 'SOLVED' && !isPracticed) return false;
      if (selectedStatus === 'STARRED' && !isSaved) return false;

      return true;
    });
  }, [questions, searchQuery, selectedSubject, selectedType, selectedDifficulty, selectedCompany, selectedStatus, attemptsMap, practicedIds, savedIds]);

  // Active question in Practice Mode
  const activeQuestionIndex = useMemo(() => {
    if (!activeQuestionId) return 0;
    const idx = filteredQuestions.findIndex(q => q.id === activeQuestionId);
    return idx >= 0 ? idx : 0;
  }, [filteredQuestions, activeQuestionId]);

  const currentQ = filteredQuestions[activeQuestionIndex] || filteredQuestions[0] || questions[0] || null;

  // Sync practice input when active question changes
  useEffect(() => {
    if (currentQ) {
      const existingAttempt = attemptsMap[currentQ.id];
      if (existingAttempt) {
        setSelectedMcqOption(existingAttempt.selectedOption ?? null);
        setPracticeAnswerText(existingAttempt.studentAnswer || '');
        setSubmittedFeedback(existingAttempt);
      } else {
        setSelectedMcqOption(null);
        setPracticeAnswerText('');
        setSubmittedFeedback(null);
      }
      setShowAnswer(false);
      setCopiedCode(false);
    }
  }, [currentQ, attemptsMap]);

  // Performance metrics
  const stats = useMemo(() => {
    return computeStudentQuestionStats(studentId, questions);
  }, [studentId, questions, attemptsMap, practicedIds, savedIds, revisionIds]);

  // -------------------------------------------------------------
  // ACTIONS: TOGGLE PRACTICED, SAVED, REVISION
  // -------------------------------------------------------------
  const handleTogglePractice = (qId = currentQ?.id) => {
    if (!qId) return;
    const res = togglePracticedQuestion(qId);
    setPracticedIds(getPracticedQuestions());
    if (currentUser) {
      UserApi.togglePracticedQuestion(qId).catch(() => {});
    }
  };

  const handleToggleSave = (qId = currentQ?.id) => {
    if (!qId) return;
    const res = toggleSavedQuestion(qId);
    setSavedIds(getSavedQuestions());
    if (currentUser) {
      UserApi.toggleSavedQuestion(qId).catch(() => {});
    }
  };

  const handleToggleRevision = (qId = currentQ?.id) => {
    if (!qId) return;
    const res = toggleRevisionQuestion(qId);
    setRevisionIds(getRevisionList());
    if (currentUser) {
      UserApi.toggleRevisionQuestion(qId).catch(() => {});
    }
  };

  // -------------------------------------------------------------
  // SUBMIT QUESTION ATTEMPT
  // -------------------------------------------------------------
  const handleSubmitAttempt = () => {
    if (!currentQ) return;

    if (currentQ.type === 'MCQ' || currentQ.type === 'APTITUDE') {
      if (selectedMcqOption === null) return;
      const isCorrect = currentQ.correctOption !== null ? (selectedMcqOption === currentQ.correctOption) : true;
      const attemptData = {
        selectedOption: selectedMcqOption,
        isCorrect,
        status: isCorrect ? 'SOLVED' : 'INCORRECT'
      };
      const updated = recordStudentQuestionAttempt(studentId, currentQ.id, attemptData);
      setAttemptsMap(updated);
      setSubmittedFeedback(attemptData);
      setShowAnswer(true);
      setPracticedIds(getPracticedQuestions());
    } else {
      if (!practiceAnswerText.trim()) return;
      const attemptData = {
        studentAnswer: practiceAnswerText.trim(),
        isCorrect: true,
        status: 'SOLVED'
      };
      const updated = recordStudentQuestionAttempt(studentId, currentQ.id, attemptData);
      setAttemptsMap(updated);
      setSubmittedFeedback(attemptData);
      setShowAnswer(true);
      setPracticedIds(getPracticedQuestions());
    }
  };

  const handleResetAttempt = () => {
    if (!currentQ) return;
    const updated = resetStudentQuestionAttempt(studentId, currentQ.id);
    setAttemptsMap(updated);
    setSelectedMcqOption(null);
    setPracticeAnswerText('');
    setSubmittedFeedback(null);
    setShowAnswer(false);
  };

  const handleCopyAnswer = () => {
    if (!currentQ) return;
    const textToCopy = currentQ.sampleCode || currentQ.suggestedAnswer || currentQ.explanation || '';
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Navigation handlers
  const handleNextQuestion = () => {
    if (activeQuestionIndex < filteredQuestions.length - 1) {
      setActiveQuestionId(filteredQuestions[activeQuestionIndex + 1].id);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionId(filteredQuestions[activeQuestionIndex - 1].id);
    }
  };

  const openPracticeQuestion = (question) => {
    setActiveQuestionId(question.id);
    setViewMode('PRACTICE');
  };

  // Helper for Type Badges
  const getTypeBadge = (type) => {
    switch (type) {
      case 'MCQ':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">MCQ</span>;
      case 'CODING':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px] uppercase">Coding</span>;
      case 'SQL':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">SQL Query</span>;
      case 'APTITUDE':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">Aptitude</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px] uppercase">Technical</span>;
    }
  };

  // Helper for Difficulty Badges
  const getDifficultyBadge = (difficulty) => {
    const diff = (difficulty || 'Medium').toLowerCase();
    if (diff === 'easy') {
      return <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Easy</span>;
    }
    if (diff === 'hard') {
      return <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Hard</span>;
    }
    return <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">Medium</span>;
  };

  // -------------------------------------------------------------
  // RENDER: 1. QUESTION BANK DASHBOARD (CATALOG VIEW)
  // -------------------------------------------------------------
  if (viewMode === 'DASHBOARD') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
        
        {/* Dashboard Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-indigo-900/40 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>PlacePrep Question Bank & Practice Hub</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Technical, Aptitude & Company Question Bank
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-2xl leading-relaxed">
                Vetted company interview questions across Data Structures, Algorithms, DBMS, Operating Systems, Quantitative Aptitude, and SQL. Practice MCQs, test your code, and track personal accuracy.
              </p>
            </div>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 shrink-0 self-start lg:self-auto cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Return to Hub</span>
              </button>
            )}
          </div>
        </div>

        {/* Student Progress & Performance KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Questions</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{stats.totalQuestions}</span>
            <span className="text-[10px] text-indigo-600 font-semibold">{filteredQuestions.length} shown</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attempted</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{stats.attemptedCount}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{stats.unattemptedCount} remaining</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
            <span className="text-xl font-black text-emerald-600 mt-0.5 block">{stats.accuracyPct}%</span>
            <span className="text-[10px] text-emerald-700 font-medium">{stats.correctCount} correct</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Practiced</span>
            <span className="text-xl font-black text-indigo-600 mt-0.5 block">{stats.practicedCount}</span>
            <span className="text-[10px] text-indigo-700 font-medium">Checked off ✓</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Starred / Saved</span>
            <span className="text-xl font-black text-amber-600 mt-0.5 block">{stats.savedCount}</span>
            <span className="text-[10px] text-amber-700 font-medium">Bookmarks ★</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revision Queue</span>
            <span className="text-xl font-black text-purple-600 mt-0.5 block">{stats.revisionCount}</span>
            <span className="text-[10px] text-purple-700 font-medium">Active recall</span>
          </div>
        </div>

        {/* Filter Bar & Controls */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          
          {/* Top Row: Search & Dropdown Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions by title, topic, skill, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 bg-white cursor-pointer"
            >
              {QUESTION_DIFFICULTIES.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 bg-white cursor-pointer"
            >
              {QUESTION_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 bg-white cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNATTEMPTED">Unattempted Only</option>
              <option value="ATTEMPTED">Attempted</option>
              <option value="SOLVED">Solved / Practiced</option>
              <option value="STARRED">Starred / Bookmarked</option>
            </select>

            {/* Company Filter */}
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 bg-white cursor-pointer"
            >
              <option value="ALL">All Hiring Partners</option>
              {companiesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Subject:</span>
            {QUESTION_SUBJECTS.map(subj => {
              const isSelected = selectedSubject === subj.id;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubject(subj.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {subj.short || subj.label}
                </button>
              );
            })}

            {(searchQuery || selectedSubject !== 'ALL' || selectedType !== 'ALL' || selectedDifficulty !== 'ALL' || selectedCompany !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('ALL');
                  setSelectedType('ALL');
                  setSelectedDifficulty('ALL');
                  setSelectedCompany('ALL');
                  setSelectedStatus('ALL');
                }}
                className="ml-auto text-[11px] font-bold text-rose-600 hover:text-rose-700 shrink-0 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Questions Catalog List */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-900 text-base">No Questions Match Your Criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try relaxing your search terms or resetting the subject and difficulty filters to explore the full question repository.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('ALL');
                setSelectedType('ALL');
                setSelectedDifficulty('ALL');
                setSelectedCompany('ALL');
                setSelectedStatus('ALL');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map((q, idx) => {
              const attempt = attemptsMap[q.id];
              const isPracticed = practicedIds.includes(q.id);
              const isSaved = savedIds.includes(q.id);
              const isRevision = revisionIds.includes(q.id);

              return (
                <div
                  key={q.id || idx}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Badges Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getTypeBadge(q.type)}
                        {getDifficultyBadge(q.difficulty)}
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {q.topic || q.category}
                        </span>
                      </div>

                      {/* Attempt Status Badge */}
                      {attempt ? (
                        attempt.isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Solved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Attempted</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Unattempted</span>
                      )}
                    </div>

                    {/* Question Title */}
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-indigo-950 transition line-clamp-3 leading-snug">
                      {q.question}
                    </h3>

                    {/* Skills / Company tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      {q.companyName && (
                        <span className="font-semibold text-slate-700 mr-1">
                          {q.companyName}
                        </span>
                      )}
                      {q.frequencyScore && (
                        <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {q.frequencyScore}% Recurrence
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Quick Actions & Launch Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {/* Star / Bookmark */}
                      <button
                        type="button"
                        onClick={() => handleToggleSave(q.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isSaved ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Star / Bookmark"
                      >
                        <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                      </button>

                      {/* Revision */}
                      <button
                        type="button"
                        onClick={() => handleToggleRevision(q.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isRevision ? 'bg-purple-50 border-purple-300 text-purple-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Add to Active Recall Revision"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Practiced check-off */}
                      <button
                        type="button"
                        onClick={() => handleTogglePractice(q.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isPracticed ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Mark as Practiced"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => openPracticeQuestion(q)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 group-hover:bg-indigo-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: 2. QUESTION PRACTICE WORKSPACE (INDIVIDUAL QUESTION)
  // -------------------------------------------------------------
  if (!currentQ) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-3">
        <p className="text-slate-600">Question not found.</p>
        <button
          type="button"
          onClick={() => setViewMode('DASHBOARD')}
          className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
        >
          Return to Question Bank Dashboard
        </button>
      </div>
    );
  }

  const isCurrentPracticed = practicedIds.includes(currentQ.id);
  const isCurrentSaved = savedIds.includes(currentQ.id);
  const isCurrentRevision = revisionIds.includes(currentQ.id);
  const isMcq = currentQ.type === 'MCQ' || currentQ.type === 'APTITUDE';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header: Back & Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setViewMode('DASHBOARD')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Question Bank Dashboard</span>
        </button>

        {/* Question Counter & Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-semibold text-slate-500">
            Question <span className="text-slate-900 font-bold">{activeQuestionIndex + 1}</span> of <span className="font-bold">{filteredQuestions.length}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevQuestion}
              disabled={activeQuestionIndex === 0}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Previous Question"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={activeQuestionIndex === filteredQuestions.length - 1}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Next Question"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Question Practice Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        
        {/* Card Header & Badges */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {getTypeBadge(currentQ.type)}
              {getDifficultyBadge(currentQ.difficulty)}
              <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold">
                {currentQ.subject} • {currentQ.topic}
              </span>
              {currentQ.companyName && (
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-semibold">
                  {currentQ.companyName}
                </span>
              )}
            </div>

            {currentQ.frequencyScore && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{currentQ.frequencyScore}% Campus Drive Recurrence</span>
              </span>
            )}
          </div>

          {/* Question Text */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {currentQ.question}
          </h1>

          {/* Skills / Tags */}
          {currentQ.skills && currentQ.skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Skills Tested:</span>
              {currentQ.skills.map((sk, ski) => (
                <span
                  key={ski}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[11px] font-medium"
                >
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Workspace Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* 1. MCQ Practice Mode */}
          {isMcq && currentQ.options && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Your Answer Option:
              </label>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedMcqOption === optIdx;
                  const isCorrectAnswer = currentQ.correctOption === optIdx;
                  const hasSubmitted = submittedFeedback !== null;

                  let borderStyle = 'border-slate-200 hover:border-indigo-300 bg-white';
                  if (isSelected && !hasSubmitted) {
                    borderStyle = 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20';
                  } else if (hasSubmitted) {
                    if (isCorrectAnswer) {
                      borderStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-2 ring-emerald-500/20';
                    } else if (isSelected && !isCorrectAnswer) {
                      borderStyle = 'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-500/20';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={hasSubmitted}
                      onClick={() => setSelectedMcqOption(optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${borderStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        hasSubmitted && isCorrectAnswer ? 'bg-emerald-600 text-white border-emerald-600' :
                        hasSubmitted && isSelected && !isCorrectAnswer ? 'bg-rose-600 text-white border-rose-600' :
                        isSelected ? 'bg-indigo-600 text-white border-indigo-600' :
                        'border-slate-300 text-slate-600 bg-slate-50'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* MCQ Submission & Feedback */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {submittedFeedback && (
                    submittedFeedback.isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Correct! Outstanding reasoning.</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect option selected. Review explanation below.</span>
                      </span>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {submittedFeedback ? (
                    <button
                      type="button"
                      onClick={handleResetAttempt}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
                    >
                      Retry Question
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={selectedMcqOption === null}
                      onClick={handleSubmitAttempt}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. Coding, SQL & Technical Practice Mode */}
          {!isMcq && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                {currentQ.type === 'SQL' ? 'Write SQL Query / Solution:' :
                 currentQ.type === 'CODING' ? 'Write Code Implementation / Algorithm Logic:' :
                 'Draft Your Technical Approach & Explanation:'}
              </label>

              <textarea
                rows={6}
                placeholder={
                  currentQ.type === 'SQL' ? "SELECT ... FROM ... WHERE ... ;" :
                  currentQ.type === 'CODING' ? "// Implement optimal solution with O(N) complexity target..." :
                  "Explain core mechanics, trade-offs, and examples here..."
                }
                value={practiceAnswerText}
                onChange={(e) => setPracticeAnswerText(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {submittedFeedback && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Answer Recorded & Practiced ✓</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {submittedFeedback ? (
                    <button
                      type="button"
                      onClick={handleResetAttempt}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
                    >
                      Clear & Rewrite
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!practiceAnswerText.trim()}
                      onClick={handleSubmitAttempt}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      Save Attempt & Verify Solution
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Approach & Framework Guidance Callout */}
          {currentQ.approach && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
              <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Recommended Answering Framework</span>
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
                {currentQ.approach}
              </p>
            </div>
          )}

          {/* Show / Hide Solution Button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showAnswer ? 'Hide Solution & Explanation' : 'View Verified Model Solution & Explanation'}</span>
            </button>
          </div>

          {/* Detailed Solution / Code Block */}
          {showAnswer && (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Model Solution & In-Depth Explanation</span>
                </h3>

                <button
                  type="button"
                  onClick={handleCopyAnswer}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Solution'}</span>
                </button>
              </div>

              {/* Explanation Text */}
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                {currentQ.explanation || currentQ.suggestedAnswer}
              </div>

              {/* Sample Code for Technical / Coding / SQL */}
              {currentQ.sampleCode && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Implementation Code:</span>
                  </span>
                  <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
                    <code>{currentQ.sampleCode}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Interactive Action Footer Bar */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Mark as Practiced Check */}
            <button
              type="button"
              onClick={() => handleTogglePractice(currentQ.id)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isCurrentPracticed
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCurrentPracticed ? 'Practiced ✓' : 'Mark Practiced'}</span>
            </button>

            {/* Star / Bookmark */}
            <button
              type="button"
              onClick={() => handleToggleSave(currentQ.id)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                isCurrentSaved
                  ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
              }`}
            >
              <Star className={`w-4 h-4 ${isCurrentSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>{isCurrentSaved ? 'Starred ★' : 'Star / Save'}</span>
            </button>

            {/* Revision Queue */}
            <button
              type="button"
              onClick={() => handleToggleRevision(currentQ.id)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                isCurrentRevision
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isCurrentRevision ? 'In Revision Queue ✓' : 'Add to Revision'}</span>
            </button>
          </div>

          {/* Jump to AI Mock Coach if applicable */}
          {onNavigateToMock && (
            <button
              type="button"
              onClick={() => onNavigateToMock(null, currentQ.type === 'HR' ? 'hr' : 'technical')}
              className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Test in AI Mock Interview</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
