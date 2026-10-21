import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  Search,
  Filter,
  CheckCircle2,
  Bookmark,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { QuestionApi, UserApi } from '../services/api';
import {
  getPracticedQuestions,
  togglePracticedQuestion,
  getRevisionList,
  toggleRevisionQuestion,
  getCurrentUser,
  getInitialQuestions
} from '../services/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';

const DSA_TOPICS = [
  'All Topics',
  'Arrays & Hashing',
  'Two Pointers',
  'Linked Lists',
  'Trees & Graphs',
  'Dynamic Programming',
  'Stack & Queue',
  'Recursion'
];

export default function DsaPracticePage({ onSelectQuestion, onNavigate }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const [practicedIds, setPracticedIds] = useState(getPracticedQuestions());
  const [revisionIds, setRevisionIds] = useState(getRevisionList());

  const currentUser = getCurrentUser();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await QuestionApi.getAll({ round: 'technical' }).catch(() => []);
      const pool = data && data.length > 0 ? data : getInitialQuestions();
      // Filter for technical/coding problems
      const dsaQuestions = pool.filter(q => 
        q.round === 'technical' || 
        q.category === 'DSA' || 
        (q.topic && (q.topic.includes('Array') || q.topic.includes('Tree') || q.topic.includes('Graph') || q.topic.includes('DP') || q.topic.includes('Algorithms') || q.topic.includes('Pointers') || q.topic.includes('Linked List') || q.topic.includes('Recursion')))
      );
      setQuestions(dsaQuestions.length > 0 ? dsaQuestions : pool);
    } catch (err) {
      console.error('Failed to load DSA questions:', err);
      setQuestions(getInitialQuestions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePracticed = (id) => {
    togglePracticedQuestion(id);
    setPracticedIds(getPracticedQuestions());
    if (currentUser) {
      UserApi.togglePracticedQuestion(id).catch(() => {});
    }
  };

  const handleToggleRevision = (id) => {
    toggleRevisionQuestion(id);
    setRevisionIds(getRevisionList());
    if (currentUser) {
      UserApi.toggleRevisionQuestion(id).catch(() => {});
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (q.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (q.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTopic = selectedTopic === 'All Topics' ? true : 
        (q.topic && q.topic.toLowerCase().includes(selectedTopic.toLowerCase().split(' ')[0]));

      const matchesDiff = selectedDifficulty === 'ALL' ? true :
        (q.difficulty && q.difficulty.toUpperCase() === selectedDifficulty);

      return matchesSearch && matchesTopic && matchesDiff;
    });
  }, [questions, searchQuery, selectedTopic, selectedDifficulty]);

  // Statistics
  const totalCount = questions.length;
  const practicedCount = questions.filter(q => practicedIds.includes(q.id)).length;
  const progressPercent = totalCount > 0 ? Math.round((practicedCount / totalCount) * 100) : 0;

  const easyCount = questions.filter(q => q.difficulty?.toLowerCase() === 'easy');
  const easyPracticed = easyCount.filter(q => practicedIds.includes(q.id)).length;

  const medCount = questions.filter(q => q.difficulty?.toLowerCase() === 'medium');
  const medPracticed = medCount.filter(q => practicedIds.includes(q.id)).length;

  const hardCount = questions.filter(q => q.difficulty?.toLowerCase() === 'hard');
  const hardPracticed = hardCount.filter(q => practicedIds.includes(q.id)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        badge="Technical Screening"
        badgeIcon={Code2}
        title="DSA & Algorithmic Problem Solving"
        description="Master pattern-based coding problems frequently asked in technical rounds at HCLTech, TCS, Accenture, and product recruiters."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate('revision')}
            >
              Revision Queue ({revisionIds.length})
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate && onNavigate('mock-interview')}
            >
              AI Coding Mock
            </Button>
          </div>
        }
      />

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Solved</span>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
              {progressPercent}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {practicedCount} <span className="text-sm font-semibold text-slate-400">/ {totalCount}</span>
          </div>
          <ProgressBar progress={progressPercent} color="indigo" size="sm" className="mt-3" />
        </Card>

        <Card className="p-5 border-emerald-100 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Easy</span>
            <Badge variant="emerald" size="sm">{easyPracticed}/{easyCount.length}</Badge>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-950">
            {easyCount.length > 0 ? Math.round((easyPracticed / easyCount.length) * 100) : 0}%
          </div>
          <ProgressBar
            progress={easyCount.length > 0 ? Math.round((easyPracticed / easyCount.length) * 100) : 0}
            color="emerald"
            size="sm"
            className="mt-3"
          />
        </Card>

        <Card className="p-5 border-amber-100 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Medium</span>
            <Badge variant="amber" size="sm">{medPracticed}/{medCount.length}</Badge>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-950">
            {medCount.length > 0 ? Math.round((medPracticed / medCount.length) * 100) : 0}%
          </div>
          <ProgressBar
            progress={medCount.length > 0 ? Math.round((medPracticed / medCount.length) * 100) : 0}
            color="amber"
            size="sm"
            className="mt-3"
          />
        </Card>

        <Card className="p-5 border-rose-100 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Hard</span>
            <Badge variant="rose" size="sm">{hardPracticed}/{hardCount.length}</Badge>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-950">
            {hardCount.length > 0 ? Math.round((hardPracticed / hardCount.length) * 100) : 0}%
          </div>
          <ProgressBar
            progress={hardCount.length > 0 ? Math.round((hardPracticed / hardCount.length) * 100) : 0}
            color="rose"
            size="sm"
            className="mt-3"
          />
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-slate-200">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96">
              <Input
                type="text"
                placeholder="Search by algorithm, problem name, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={Search}
              />
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
              <span className="text-slate-400 font-semibold mr-1">Difficulty:</span>
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Topics Row */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold shrink-0">Topic:</span>
            {DSA_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedTopic === topic
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No problems found"
          description="Try adjusting your topic or difficulty filters to see more practice questions."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTopic('All Topics');
                setSelectedDifficulty('ALL');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3.5">
          {filteredQuestions.map((q) => {
            const isPracticed = practicedIds.includes(q.id);
            const isRevision = revisionIds.includes(q.id);

            return (
              <Card
                key={q.id}
                className="p-5 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleTogglePracticed(q.id)}
                      className={`p-2.5 rounded-xl border mt-0.5 transition-colors shrink-0 ${
                        isPracticed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                      title={isPracticed ? 'Mark as unpracticed' : 'Mark as solved'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {q.difficulty && (
                          <Badge
                            variant={
                              q.difficulty.toLowerCase() === 'easy'
                                ? 'emerald'
                                : q.difficulty.toLowerCase() === 'medium'
                                ? 'amber'
                                : 'rose'
                            }
                            size="sm"
                          >
                            {q.difficulty}
                          </Badge>
                        )}
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {q.companyName}
                        </span>
                        {q.topic && (
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {q.topic}
                          </span>
                        )}
                        {q.frequencyScore && (
                          <span className="text-xs text-amber-600 font-bold">
                            ★ {q.frequencyScore}% Frequency
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base mt-1.5 group-hover:text-indigo-600 transition-colors">
                        {q.title}
                      </h3>

                      {q.expectedAnswerSnippet && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-mono">
                          {q.expectedAnswerSnippet}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleToggleRevision(q.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isRevision
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                      title={isRevision ? 'Remove from revision' : 'Flag for revision'}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      onClick={() => onSelectQuestion && onSelectQuestion(q)}
                    >
                      Solve Problem
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
