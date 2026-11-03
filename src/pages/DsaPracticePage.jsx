// PlacePrep AI - Student-Only DSA and Coding Practice Studio
// Restricts access exclusively to Student users.
// Provides DSA Question Explorer, Multi-Language Coding Workspace,
// student-isolated progress tracking, and honest execution environment reporting.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Code2,
  Sparkles,
  RotateCcw,
  Bot,
  School,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { QuestionApi } from '../services/api.js';
import {
  getCurrentUser,
  getInterviewQuestions
} from '../services/storage.js';
import {
  isUserAuthorizedStudent,
  normalizeDsaQuestion,
  getStudentPracticedList,
  toggleStudentPracticed,
  getStudentRevisionList,
  toggleStudentRevision,
  getRecentlyAttemptedQuestions,
  computeDsaProgressMetrics
} from '../services/dsaService.js';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import DsaQuestionExplorer from '../components/dsa/DsaQuestionExplorer';
import DsaCodingWorkspace from '../components/dsa/DsaCodingWorkspace';

export default function DsaPracticePage({ onNavigate, onSelectGlobalQuestion }) {
  const currentUser = getCurrentUser();
  const isAuthorized = isUserAuthorizedStudent(currentUser);
  const studentId = currentUser?.id || currentUser?.email || 'default_student';

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Studio Navigation State
  const [activeQuestion, setActiveQuestion] = useState(null);

  // Filter States for Question Explorer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');

  // Student-specific Progress States
  const [practicedIds, setPracticedIds] = useState(() => getStudentPracticedList(studentId));
  const [revisionIds, setRevisionIds] = useState(() => getStudentRevisionList(studentId));
  const [recentIds, setRecentIds] = useState(() => getRecentlyAttemptedQuestions(studentId));

  // Load and normalize questions from backend API or local dataset
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await QuestionApi.getAll({ round: 'technical' }).catch(() => []);
      const pool = data && data.length > 0 ? data : getInterviewQuestions();

      // Filter and normalize technical/coding problems
      const normalized = (pool || []).map((q, idx) => normalizeDsaQuestion(q, idx));

      // Filter for technical & algorithmic problems
      const dsaQuestions = normalized.filter(q => {
        const cat = (q.category || '').toLowerCase();
        const round = (q.round || '').toLowerCase();
        const title = (q.title || '').toLowerCase();
        return round === 'technical' ||
               cat.includes('dsa') ||
               cat.includes('algorithm') ||
               cat.includes('data structure') ||
               title.includes('array') ||
               title.includes('list') ||
               title.includes('tree') ||
               title.includes('graph') ||
               title.includes('dp') ||
               title.includes('sql') ||
               title.includes('stack') ||
               title.includes('queue') ||
               title.includes('recursion');
      });

      setQuestions(dsaQuestions.length > 0 ? dsaQuestions : normalized);
    } catch (err) {
      console.error('Failed to load DSA problems:', err);
      setError('Failed to load DSA question repository. Using fallback offline dataset.');
      const fallback = (getInterviewQuestions() || []).map((q, idx) => normalizeDsaQuestion(q, idx));
      setQuestions(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Sync student lists on student change
  useEffect(() => {
    setPracticedIds(getStudentPracticedList(studentId));
    setRevisionIds(getStudentRevisionList(studentId));
    setRecentIds(getRecentlyAttemptedQuestions(studentId));
  }, [studentId]);

  // Handle Practice Toggle
  const handleTogglePracticed = (questionId) => {
    toggleStudentPracticed(studentId, questionId);
    setPracticedIds(getStudentPracticedList(studentId));
  };

  // Handle Revision Toggle
  const handleToggleRevision = (questionId) => {
    toggleStudentRevision(studentId, questionId);
    setRevisionIds(getStudentRevisionList(studentId));
  };

  // Select question for coding workspace
  const handleSelectQuestion = (q) => {
    setActiveQuestion(q);
    setRecentIds(getRecentlyAttemptedQuestions(studentId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active question index in current questions pool
  const currentQuestionIndex = useMemo(() => {
    if (!activeQuestion) return 0;
    const idx = questions.findIndex(q => q.id === activeQuestion.id);
    return idx >= 0 ? idx : 0;
  }, [activeQuestion, questions]);

  // Calculate Progress Metrics
  const metrics = useMemo(() => {
    return computeDsaProgressMetrics(questions, practicedIds);
  }, [questions, practicedIds]);

  // STRICT ACCESS CONTROL GATE: Restrict non-students
  if (!isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Student Access Required</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The <strong>DSA & Coding Practice Studio</strong> is strictly restricted to enrolled Student candidates. Your current profile role (<strong className="text-slate-900 uppercase">{currentUser?.role || 'Guest'}</strong>) is not authorized for student coding workspace activities.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate && onNavigate('institute-portal')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Return to Institute Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Studio Header (Only shown on Question Explorer view) */}
      {!activeQuestion && (
        <PageHeader
          badge="Student-Only DSA Studio"
          badgeIcon={Code2}
          title="DSA & Coding Practice Studio"
          description="Master canonical data structures, algorithmic patterns, and practice code problems asked in campus technical screening rounds."
          actions={
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedStatus(selectedStatus === 'REVISION' ? 'ALL' : 'REVISION')}
              >
                Revision Queue ({revisionIds.length})
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={School}
                onClick={() => onNavigate && onNavigate('institute-portal')}
              >
                Institute Portal
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Bot}
                onClick={() => onNavigate && onNavigate('mock-interview')}
              >
                AI Coding Mock
              </Button>
            </div>
          }
        />
      )}

      {/* VIEW SWITCHER: QUESTION EXPLORER vs CODING WORKSPACE */}
      {activeQuestion ? (
        <DsaCodingWorkspace
          question={activeQuestion}
          allQuestions={questions}
          currentIndex={currentQuestionIndex}
          currentUser={currentUser}
          isPracticed={practicedIds.includes(activeQuestion.id) || (activeQuestion.questionId && practicedIds.includes(activeQuestion.questionId))}
          isRevision={revisionIds.includes(activeQuestion.id) || (activeQuestion.questionId && revisionIds.includes(activeQuestion.questionId))}
          onTogglePracticed={handleTogglePracticed}
          onToggleRevision={handleToggleRevision}
          onBackToExplorer={() => setActiveQuestion(null)}
          onSelectQuestion={handleSelectQuestion}
        />
      ) : (
        <DsaQuestionExplorer
          questions={questions}
          loading={loading}
          error={error}
          onRetry={loadQuestions}
          metrics={metrics}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          practicedIds={practicedIds}
          revisionIds={revisionIds}
          recentIds={recentIds}
          onTogglePracticed={handleTogglePracticed}
          onToggleRevision={handleToggleRevision}
          onSelectQuestion={handleSelectQuestion}
          onOpenRevision={() => setSelectedStatus('REVISION')}
        />
      )}

    </div>
  );
}
