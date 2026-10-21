import React, { useState, useEffect } from 'react';
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
  Layers
} from 'lucide-react';
import { 
  getInterviewQuestions, 
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

export default function QuestionPrepPage({ 
  initialQuestion, 
  roundType, 
  companyId, 
  onBack,
  onNavigateToMock
}) {
  const allQuestions = getInterviewQuestions();
  
  // Filter questions by company and/or round if specified
  const pool = allQuestions.filter(q => {
    let matchComp = true;
    let matchRound = true;
    if (companyId) matchComp = q.companyId === companyId;
    if (roundType) matchRound = q.round === roundType;
    return matchComp && matchRound;
  });

  const activePool = pool.length > 0 ? pool : allQuestions;
  const initialIndex = initialQuestion ? Math.max(0, activePool.findIndex(q => q.id === initialQuestion.id)) : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const currentQ = activePool[currentIndex] || activePool[0];

  const [isPracticed, setIsPracticed] = useState(getPracticedQuestions().includes(currentQ?.id));
  const [isSaved, setIsSaved] = useState(getSavedQuestions().includes(currentQ?.id));
  const [isRevision, setIsRevision] = useState(getRevisionList().includes(currentQ?.id));

  useEffect(() => {
    if (currentQ) {
      setIsPracticed(getPracticedQuestions().includes(currentQ.id));
      setIsSaved(getSavedQuestions().includes(currentQ.id));
      setIsRevision(getRevisionList().includes(currentQ.id));
      setShowAnswer(false);
    }
  }, [currentIndex, currentQ]);

  const handleNext = () => {
    if (currentIndex < activePool.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTogglePractice = () => {
    const res = togglePracticedQuestion(currentQ.id);
    setIsPracticed(res);
    const user = getCurrentUser();
    if (user && currentQ?.id) {
      UserApi.togglePracticedQuestion(currentQ.id).catch(() => {});
    }
  };

  const handleToggleSave = () => {
    const res = toggleSavedQuestion(currentQ.id);
    setIsSaved(res);
    const user = getCurrentUser();
    if (user && currentQ?.id) {
      UserApi.toggleSavedQuestion(currentQ.id).catch(() => {});
    }
  };

  const handleToggleRevision = () => {
    const res = toggleRevisionQuestion(currentQ.id);
    setIsRevision(res);
    const user = getCurrentUser();
    if (user && currentQ?.id) {
      UserApi.toggleRevisionQuestion(currentQ.id).catch(() => {});
    }
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(currentQ.suggestedAnswer || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!currentQ) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p>No questions found for this selection.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const companies = getCompanies();
  const currentCompany = companies.find(c => c.id === currentQ.companyId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </button>

        {/* Question Counter & Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-semibold text-slate-500">
            Question <span className="text-slate-900 font-semibold">{currentIndex + 1}</span> of <span className="font-bold">{activePool.length}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Question"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === activePool.length - 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Question"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white surface-card overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-semibold uppercase tracking-wide">
                {currentCompany?.name || currentQ.companyId}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold uppercase">
                {currentQ.round} Round
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold">
                {currentQ.category}
              </span>
              <span className={`px-2.5 py-1 rounded-lg font-bold ${
                currentQ.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                currentQ.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {currentQ.difficulty} Difficulty
              </span>
            </div>

            {/* Historical Frequency */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {currentQ.frequencyScore}% Frequency Rate
              </span>
            </div>
          </div>

          {/* Question Text */}
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-snug">
            {currentQ.question}
          </h1>

          {/* Skills / Topics */}
          {currentQ.skills && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-semibold mr-1">Skills:</span>
              {currentQ.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Controls Bar */}
        <div className="px-6 sm:px-8 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Mark as Practiced */}
            <button
              onClick={handleTogglePractice}
              className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                isPracticed
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isPracticed ? 'Practiced ✓' : 'Mark as Practiced'}</span>
            </button>

            {/* Save Question */}
            <button
              onClick={handleToggleSave}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 border transition-all ${
                isSaved
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save Question'}</span>
            </button>

            {/* Add to Revision List */}
            <button
              onClick={handleToggleRevision}
              className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 border transition-all ${
                isRevision
                  ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isRevision ? 'In Revision List' : 'Add to Revision List'}</span>
            </button>
          </div>

          {/* Show / Hide Answer Button */}
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold flex items-center gap-1.5 hover:bg-indigo-700 shadow-xs transition-all ml-auto"
          >
            {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAnswer ? 'Hide Solution & Answer' : 'Show Suggested Answer'}</span>
          </button>
        </div>

        {/* Approach / Framework Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-4 sm:p-5 rounded-lg bg-amber-50/70 border border-amber-200">
            <h3 className="font-bold text-sm text-amber-900 mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Recommended Answering Approach ({currentQ.round === 'hr' || currentQ.round === 'managerial' ? 'STAR Framework' : 'Algorithmic / Architectural Structure'})
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
              {currentQ.approach}
            </p>
          </div>

          {/* Suggested Answer & Explanation */}
          {showAnswer ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Model Answer & Technical Explanation
                  </h3>
                  <button
                    onClick={handleCopyAnswer}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white text-xs flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-normal">
                  {currentQ.suggestedAnswer}
                </div>

                {/* Sample Code for technical questions */}
                {currentQ.sampleCode && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-600" /> Production Code Implementation:
                    </p>
                    <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                      <code>{currentQ.sampleCode}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Follow-up Questions */}
              {currentQ.followUps && currentQ.followUps.length > 0 && (
                <div className="p-5 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-2.5">
                  <h4 className="font-medium text-xs sm:text-sm text-indigo-950 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    Probable Panel Follow-Up Questions:
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {currentQ.followUps.map((f, i) => (
                      <li key={i} className="text-xs text-indigo-900 flex items-start gap-2 font-medium">
                        <span className="text-indigo-600 font-semibold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Historical Reference & Confidence */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 pt-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified question frequency: reported {currentQ.timesReported} times across recent campus drives.
                </span>
                <span>Last reported: {currentQ.lastReportedDate}</span>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Eye className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Answer Hidden for Active Recall</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try structuring your response mentally or out loud using the recommended approach above, then reveal the answer.
              </p>
              <button
                onClick={() => setShowAnswer(true)}
                className="mt-4 px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Reveal Answer & Code
              </button>
            </div>
          )}
        </div>

        {/* Card Footer Navigation */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Question</span>
          </button>

          <button
            onClick={() => onNavigateToMock?.(currentCompany, currentQ.round)}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-medium text-xs hover:bg-purple-100 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate in AI Mock</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === activePool.length - 1}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
