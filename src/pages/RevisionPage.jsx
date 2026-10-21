import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  BookmarkCheck,
  Search,
  Filter,
  ArrowRight,
  HelpCircle,
  Code2,
  Trash2,
  AlertCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { QuestionApi, UserApi } from '../services/api';
import { 
  getRevisionList, 
  toggleRevisionQuestion, 
  getPracticedQuestions,
  togglePracticedQuestion,
  getCurrentUser,
  getInitialQuestions
} from '../services/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import PageHeader from '../components/ui/PageHeader';

export default function RevisionPage({ onSelectQuestion, onNavigate }) {
  const [revisionIds, setRevisionIds] = useState(getRevisionList());
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [practicedIds, setPracticedIds] = useState(getPracticedQuestions());

  const currentUser = getCurrentUser();

  const loadData = async () => {
    setLoading(true);
    try {
      let ids = getRevisionList();
      if (currentUser) {
        try {
          const me = await UserApi.getMe();
          if (me && me.revisionQuestionIds) {
            ids = Array.from(new Set([...ids, ...me.revisionQuestionIds]));
          }
        } catch (e) {
          console.warn('Could not sync user profile revision list:', e);
        }
      }
      setRevisionIds(ids);

      const allQs = await QuestionApi.getAll().catch(() => []);
      const pool = allQs && allQs.length > 0 ? allQs : getInitialQuestions();
      const normalized = (pool || []).map((q, idx) => ({
        ...q,
        id: q.id || q.questionId || `q-${idx}`,
        title: q.title || q.question || q.questionText || `Question #${idx + 1}`,
        topic: q.topic || q.category || 'General',
        companyName: q.companyName || (q.companyId ? q.companyId.toUpperCase() : 'General'),
        difficulty: q.difficulty || 'Medium',
        round: q.round || 'Technical',
        answer: q.answer || q.suggestedAnswer || q.expectedAnswerSnippet || ''
      }));
      setQuestions(normalized);
    } catch (err) {
      console.error('Error loading revision questions:', err);
      const fallback = (getInitialQuestions() || []).map((q, idx) => ({
        ...q,
        id: q.id || q.questionId || `q-${idx}`,
        title: q.title || q.question || q.questionText || `Question #${idx + 1}`,
        topic: q.topic || q.category || 'General',
        companyName: q.companyName || (q.companyId ? q.companyId.toUpperCase() : 'General'),
        difficulty: q.difficulty || 'Medium',
        round: q.round || 'Technical',
        answer: q.answer || q.suggestedAnswer || q.expectedAnswerSnippet || ''
      }));
      setQuestions(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const revisionQuestions = questions.filter(q => revisionIds.includes(q.id));

  const filteredQuestions = revisionQuestions.filter(q => {
    const titleStr = (q.title || q.question || '').toLowerCase();
    const topicStr = (q.topic || '').toLowerCase();
    const compStr = (q.companyName || '').toLowerCase();
    const searchLower = (searchQuery || '').toLowerCase();
    const matchesSearch = titleStr.includes(searchLower) ||
                          topicStr.includes(searchLower) ||
                          compStr.includes(searchLower);
    const matchesCategory = activeCategory === 'ALL' || q.category === activeCategory || q.round === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRemoveFromRevision = (questionId) => {
    const updated = toggleRevisionQuestion(questionId);
    setRevisionIds(getRevisionList());
    if (currentUser) {
      UserApi.toggleRevisionQuestion(questionId).catch(() => {});
    }
  };

  const handleTogglePracticed = (questionId) => {
    togglePracticedQuestion(questionId);
    setPracticedIds(getPracticedQuestions());
    if (currentUser) {
      UserApi.togglePracticedQuestion(questionId).catch(() => {});
    }
  };

  const categories = ['ALL', 'technical', 'hr', 'managerial'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        badge="Active Recall"
        badgeIcon={RotateCcw}
        title="Revision Workspace"
        description="Review critical problems, marked edge-cases, and behavioral questions before your scheduled interview rounds."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate && onNavigate('prep')}
            >
              Browse Question Bank
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate && onNavigate('mock-interview')}
            >
              Start AI Mock Session
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-96">
            <Input
              type="text"
              placeholder="Search in revision queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs pb-1 md:pb-0">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Round:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap capitalize ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Questions' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Progress summary banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-600">
            <b>{revisionQuestions.length}</b> questions flagged for revision •{' '}
            <span className="text-emerald-700 font-bold">
              {revisionQuestions.filter(q => practicedIds.includes(q.id)).length} practiced
            </span>
          </span>
          {revisionQuestions.length > 0 && (
            <span className="text-indigo-600 font-semibold">
              Tip: Revisit questions 24-48 hours before your interview for optimal memory retention.
            </span>
          )}
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
          icon={RotateCcw}
          title={revisionQuestions.length === 0 ? "Revision list is empty" : "No matching questions"}
          description={
            revisionQuestions.length === 0
              ? "Flag questions from the Question Bank or Company Hubs by clicking 'Flag for Revision' to practice active recall before your interviews."
              : "No questions matched your search query. Try clearing filters."
          }
          action={
            <Button
              variant="primary"
              onClick={() => onNavigate && onNavigate('prep')}
            >
              Explore Question Bank
            </Button>
          }
        />
      ) : (
        <div className="space-y-3.5">
          {filteredQuestions.map((question) => {
            const isPracticed = practicedIds.includes(question.id);
            return (
              <Card
                key={question.id}
                className="p-5 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleTogglePracticed(question.id)}
                      className={`p-2.5 rounded-xl border mt-0.5 transition-colors shrink-0 ${
                        isPracticed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                      title={isPracticed ? 'Mark as unpracticed' : 'Mark as practiced'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                          {question.round}
                        </span>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {question.companyName}
                        </span>
                        {question.difficulty && (
                          <Badge
                            variant={
                              (question.difficulty || '').toLowerCase() === 'easy'
                                ? 'emerald'
                                : (question.difficulty || '').toLowerCase() === 'medium'
                                ? 'amber'
                                : 'rose'
                            }
                            size="sm"
                          >
                            {question.difficulty}
                          </Badge>
                        )}
                        {question.topic && (
                          <span className="text-xs text-slate-500 font-medium">
                            • {question.topic}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base mt-1.5 group-hover:text-indigo-600 transition-colors">
                        {question.title}
                      </h3>

                      {question.answer && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {question.answer}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectQuestion && onSelectQuestion(question)}
                    >
                      Open in Prep
                    </Button>

                    <button
                      onClick={() => handleRemoveFromRevision(question.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove from revision list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
