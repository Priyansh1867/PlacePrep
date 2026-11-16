import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Building2, 
  Layers, 
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Code2,
  Database,
  Terminal,
  UserCheck,
  Binary,
  Clock,
  History,
  X,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { 
  getCompanies, 
  getCurrentUser
} from '../services/storage';
import { 
  INTERVIEW_CATEGORIES,
  INTERVIEW_DIFFICULTIES,
  SUGGESTED_SKILLS,
  generateAiInterviewQuestions,
  evaluateAiInterviewAnswer,
  getCuratedFallbackQuestions,
  saveCompletedInterviewSession,
  loadInterviewHistory
} from '../services/aiInterviewService';

export default function MockInterviewPage({ initialCompany, initialRound, onFinish, onNavigate }) {
  const companies = getCompanies();

  // Configuration state
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (initialRound === 'hr') return 'hr';
    if (initialRound === 'dsa') return 'dsa';
    return 'technical';
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompany?.id || 'all');
  const [questionCount, setQuestionCount] = useState(3);

  // Flow states: 'CONFIG' | 'SESSION' | 'RESULTS'
  const [flowState, setFlowState] = useState('CONFIG');

  // Loading & Error states
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);

  // Active Session state
  const [questionsList, setQuestionsList] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [questionEvaluations, setQuestionEvaluations] = useState({});
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  // Voice speech state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // History state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [selectedPastSession, setSelectedPastSession] = useState(null);

  useEffect(() => {
    loadInterviewHistory().then(sessions => {
      if (Array.isArray(sessions)) setPastSessions(sessions);
    });
  }, []);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  // -------------------------------------------------------------
  // 1. START INTERVIEW
  // -------------------------------------------------------------
  const handleStartInterview = async (forceFallback = false) => {
    setIsGeneratingQuestions(true);
    setGenerationError(null);
    setIsFallbackMode(false);

    try {
      if (forceFallback) {
        const fallbackQs = await getCuratedFallbackQuestions({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          count: questionCount
        });
        setQuestionsList(fallbackQs);
        setIsFallbackMode(true);
      } else {
        const generatedQs = await generateAiInterviewQuestions({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          technology: selectedSkill,
          companyName: selectedCompany?.name || '',
          count: questionCount
        });
        setQuestionsList(generatedQs);
      }

      setCurrentQIndex(0);
      setStudentAnswers({});
      setQuestionEvaluations({});
      setFlowState('SESSION');
    } catch (err) {
      console.warn('AI question generation error, automatically using verified question pool:', err);
      try {
        const fallbackQs = await getCuratedFallbackQuestions({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          count: questionCount
        });
        setQuestionsList(fallbackQs);
        setIsFallbackMode(true);
        setCurrentQIndex(0);
        setStudentAnswers({});
        setQuestionEvaluations({});
        setFlowState('SESSION');
      } catch (fallbackErr) {
        setGenerationError(err.message || 'Unable to generate interview questions via PlacePrep AI.');
      }
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // -------------------------------------------------------------
  // 2. SUBMIT ANSWER FOR EVALUATION
  // -------------------------------------------------------------
  const currentQuestion = questionsList[currentQIndex] || null;
  const currentAnswer = currentQuestion ? (studentAnswers[currentQuestion.id] || '') : '';
  const currentEvaluation = currentQuestion ? questionEvaluations[currentQuestion.id] : null;

  const handleAnswerChange = (val) => {
    if (!currentQuestion) return;
    setStudentAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }));
  };

  const handleEvaluateAnswer = async () => {
    if (!currentQuestion || !currentAnswer.trim()) return;

    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const evaluation = await evaluateAiInterviewAnswer({
        question: currentQuestion,
        studentAnswer: currentAnswer,
        category: selectedCategory,
        difficulty: selectedDifficulty
      });

      setQuestionEvaluations(prev => ({
        ...prev,
        [currentQuestion.id]: evaluation
      }));
    } catch (err) {
      console.warn('AI evaluation error:', err);
      setEvaluationError(err.message || 'Failed to evaluate answer with AI. Please retry.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // -------------------------------------------------------------
  // 3. NAVIGATION & SESSION COMPLETION
  // -------------------------------------------------------------
  const handleNext = () => {
    if (currentQIndex < questionsList.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setEvaluationError(null);
    } else {
      finishInterviewSession();
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
      setEvaluationError(null);
    }
  };

  const finishInterviewSession = async () => {
    // Calculate aggregate scores
    const evalValues = Object.values(questionEvaluations);
    const answeredCount = evalValues.length;

    const avgOverall = answeredCount > 0
      ? Math.round(evalValues.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / answeredCount)
      : 0;
    const avgCorrectness = answeredCount > 0
      ? Math.round(evalValues.reduce((acc, curr) => acc + (curr.correctnessScore || 0), 0) / answeredCount)
      : 0;
    const avgClarity = answeredCount > 0
      ? Math.round(evalValues.reduce((acc, curr) => acc + (curr.clarityScore || 0), 0) / answeredCount)
      : 0;
    const avgStructure = answeredCount > 0
      ? Math.round(evalValues.reduce((acc, curr) => acc + (curr.structureScore || 0), 0) / answeredCount)
      : 0;

    const catObj = INTERVIEW_CATEGORIES.find(c => c.id === selectedCategory);
    const roundTitle = catObj?.label || 'Technical Interview';

    const newSession = {
      id: `session-${Date.now()}`,
      sessionId: `mock-${Date.now()}`,
      companyId: selectedCompany?.id || 'GENERAL',
      companyName: selectedCompany?.name || 'General Tech Panel',
      round: roundTitle,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      technology: selectedSkill || 'General',
      date: new Date().toISOString().split('T')[0],
      score: avgOverall,
      correctness: avgCorrectness,
      clarity: avgClarity,
      structure: avgStructure,
      questionsAnswered: answeredCount,
      totalQuestions: questionsList.length,
      feedbackSummary: `Completed ${roundTitle} (${selectedDifficulty}) with ${avgOverall}% average score across ${answeredCount} answered question(s).`,
      evaluations: questionsList.map(q => ({
        question: q.question,
        category: q.category,
        answer: studentAnswers[q.id] || '(No response provided)',
        evaluation: questionEvaluations[q.id] || null
      }))
    };

    try {
      const updatedHistory = await saveCompletedInterviewSession(newSession);
      if (Array.isArray(updatedHistory)) setPastSessions(updatedHistory);
    } catch (err) {
      console.warn('Failed to save session:', err);
    }

    setFlowState('RESULTS');
    if (onFinish) onFinish(newSession);
  };

  // -------------------------------------------------------------
  // 4. SPEECH RECOGNITION (WEB SPEECH API)
  // -------------------------------------------------------------
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      if (currentQuestion) {
        setStudentAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || '') + transcript
        }));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Helper for Category Icons
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'UserCheck': return <UserCheck className="w-5 h-5" />;
      case 'Binary': return <Binary className="w-5 h-5" />;
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Database': return <Database className="w-5 h-5" />;
      default: return <Code2 className="w-5 h-5" />;
    }
  };

  // -------------------------------------------------------------
  // RENDER: 1. CONFIGURATION VIEW
  // -------------------------------------------------------------
  if (flowState === 'CONFIG') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-indigo-900/40 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Bot className="w-3.5 h-3.5" />
                <span>PlacePrep AI Mock Interview Coach</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Simulated AI Technical & HR Interviews
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-2xl leading-relaxed">
                Practice realistic company interview scenarios. Get real-time AI evaluation on technical depth, communication clarity, conceptual gaps, and structured benchmark answers.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <History className="w-4 h-4 text-indigo-300" />
                <span>Past Attempts ({pastSessions.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert if generation failed */}
        {generationError && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-rose-900">AI Interview Connection Issue</h4>
                <p>{generationError}</p>
                <p className="text-[11px] text-rose-600">
                  You can retry or continue with our verified Question Bank question pool to practice immediately.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleStartInterview(false)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry AI Generation</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartInterview(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 transition flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Use Question Bank Fallback</span>
              </button>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          
          {/* Step 1: Select Category */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Select Interview Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {INTERVIEW_CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <h3 className={`font-bold text-sm ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                        {cat.label}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      {cat.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Difficulty */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Select Difficulty Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {INTERVIEW_DIFFICULTIES.map(diff => {
                const isSelected = selectedDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold text-sm ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                        {diff.label}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        diff.id === 'Beginner' ? 'bg-emerald-100 text-emerald-800' :
                        diff.id === 'Intermediate' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {diff.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {diff.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Technology / Skill & Target Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Preferred Tech/Skill */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Focus Skill or Technology (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. React, Spring Boot, SQL, Python, System Design"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTED_SKILLS.slice(0, 8).map(sk => (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => setSelectedSkill(sk)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      selectedSkill === sk
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sk}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Company */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                4. Target Company Profile (Optional)
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="all">General Industry Benchmark Panel</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <span>Number of Questions:</span>
                <div className="flex items-center gap-1.5">
                  {[3, 4, 5].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        questionCount === cnt
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Session length: ~{questionCount * 3} minutes • AI Evaluation generated per question
            </span>
            <button
              type="button"
              disabled={isGeneratingQuestions}
              onClick={() => handleStartInterview(false)}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isGeneratingQuestions ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Questions with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch AI Interview Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">Past Mock Interview Sessions</h3>
                    <p className="text-xs text-slate-500">Review your past scores, feedback summaries, and improvements.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedPastSession(null);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3.5 flex-1 text-xs">
                {pastSessions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Bot className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">No mock interview attempts recorded yet.</p>
                    <p className="text-[11px]">Configure and launch your first AI interview above!</p>
                  </div>
                ) : (
                  pastSessions.map((sess, idx) => (
                    <div
                      key={sess.id || idx}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition space-y-2 bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{sess.round || sess.category || 'Interview'}</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold text-[10px] uppercase">
                            {sess.companyName || 'General'}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                          {sess.score || 0}% Score
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {sess.feedbackSummary || 'Mock session recorded successfully.'}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Date: {sess.date || 'Recent'}</span>
                        <span>Questions Answered: {sess.questionsAnswered || sess.totalQuestions || 3}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: 2. ACTIVE INTERVIEW SESSION
  // -------------------------------------------------------------
  if (flowState === 'SESSION') {
    const isLastQuestion = currentQIndex === questionsList.length - 1;
    const isAnswerEvaluated = Boolean(currentEvaluation);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
        
        {/* Top Session Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider">
              {selectedCategory.toUpperCase()} INTERVIEW
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {selectedDifficulty}
            </span>
            {isFallbackMode && (
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                Question Bank Fallback Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900">
                Question {currentQIndex + 1} of {questionsList.length}
              </span>
              <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / questionsList.length) * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to exit this interview session? Your answers will not be saved.')) {
                  setFlowState('CONFIG');
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-600 font-bold ml-2 transition"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Current Question Statement Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Interviewer Prompt #{currentQIndex + 1}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {currentQuestion?.question}
          </h2>

          {/* Expected concepts / skills tags */}
          {currentQuestion?.expectedConcepts && currentQuestion.expectedConcepts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Focus Areas:</span>
              {currentQuestion.expectedConcepts.map((c, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answer Submission Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span>Your Interview Response</span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({currentAnswer.trim().split(/\s+/).filter(Boolean).length} words • {currentAnswer.length} chars)
              </span>
            </label>

            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Dictate with voice"
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? 'Listening...' : 'Voice Dictation'}</span>
            </button>
          </div>

          <textarea
            rows={7}
            placeholder={
              selectedCategory === 'hr'
                ? "Describe your experience using the STAR method: Situation, Task, Action, and the quantifiable Result..."
                : "Articulate your technical approach, core concepts, complexity analysis, and edge cases here..."
            }
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={isEvaluating}
            className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans placeholder:text-slate-400"
          />

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleAnswerChange('')}
              disabled={isEvaluating || !currentAnswer}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold disabled:opacity-30"
            >
              Clear Response
            </button>

            <button
              type="button"
              disabled={isEvaluating || !currentAnswer.trim()}
              onClick={handleEvaluateAnswer}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PlacePrep AI is Evaluating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAnswerEvaluated ? 'Re-Evaluate Answer with AI' : 'Submit for AI Evaluation'}</span>
                </>
              )}
            </button>
          </div>

          {/* Evaluation Error */}
          {evaluationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{evaluationError}</span>
              </div>
              <button
                type="button"
                onClick={handleEvaluateAnswer}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs shrink-0"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* AI Evaluation Card */}
        {currentEvaluation && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900 text-white shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-black text-lg">
                  {currentEvaluation.overallScore}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base">PlacePrep AI Assessment</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                      {currentEvaluation.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    Evaluated against university campus benchmark standards
                  </p>
                </div>
              </div>

              {/* Score Badges */}
              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] text-indigo-300 block uppercase font-bold">
                    {selectedCategory === 'hr' ? 'Communication' : 'Correctness'}
                  </span>
                  <span className="font-black text-white">{currentEvaluation.correctnessScore}%</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] text-indigo-300 block uppercase font-bold">Clarity</span>
                  <span className="font-black text-white">{currentEvaluation.clarityScore}%</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] text-indigo-300 block uppercase font-bold">Structure</span>
                  <span className="font-black text-white">{currentEvaluation.structureScore}%</span>
                </div>
              </div>
            </div>

            {/* Technical Accuracy / Commentary */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Interviewer Critique & Accuracy</span>
              </h4>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal bg-white/5 p-4 rounded-2xl border border-white/10">
                {currentEvaluation.technicalAccuracy}
              </p>
            </div>

            {/* Strengths & Missing Concepts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h5 className="font-bold text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Strengths Identified</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-emerald-100">
                  {currentEvaluation.strengths?.map((st, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Concepts */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h5 className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Missing or Incomplete Concepts</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-amber-100">
                  {currentEvaluation.missingConcepts?.length > 0 ? (
                    currentEvaluation.missingConcepts.map((mc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{mc}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-amber-200">No major conceptual omissions observed.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Suggested Ideal Answer */}
            {currentEvaluation.suggestedIdealAnswer && (
              <div className="p-5 rounded-2xl bg-indigo-900/40 border border-indigo-700/50 space-y-2">
                <h5 className="font-bold text-xs text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Suggested Benchmark Answer</span>
                </h5>
                <p className="text-xs sm:text-sm text-indigo-100 whitespace-pre-line leading-relaxed">
                  {currentEvaluation.suggestedIdealAnswer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Step Navigation */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            disabled={currentQIndex === 0}
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Question</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isLastQuestion ? 'Complete & View Final Report' : 'Next Question'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: 3. RESULTS & PERFORMANCE REPORT
  // -------------------------------------------------------------
  const evaluationsList = questionsList.map(q => ({
    question: q,
    answer: studentAnswers[q.id] || '',
    evaluation: questionEvaluations[q.id] || null
  }));

  const totalQuestionsAnswered = Object.keys(questionEvaluations).length;
  const overallAverageScore = totalQuestionsAnswered > 0
    ? Math.round(
        Object.values(questionEvaluations).reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalQuestionsAnswered
      )
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900 text-white shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto text-amber-300">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
            Mock Interview Completed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Overall Readiness Score: {overallAverageScore}%
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-xl mx-auto">
            {overallAverageScore >= 80 ? '🎉 Excellent performance! You demonstrated exceptional technical competence and structured communication.' :
             overallAverageScore >= 60 ? '👍 Solid attempt. Review the missing concepts and benchmark solutions below to sharpen your edge.' :
             '📚 Practice required. Dive into the recommended ideal answers to reinforce core principles.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setFlowState('CONFIG')}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake New Interview</span>
          </button>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('prep')}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Practice in Question Bank</span>
            </button>
          )}
        </div>
      </div>

      {/* Question by Question Detailed Breakdown */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Question-by-Question Evaluation Breakdown</span>
        </h3>

        <div className="space-y-4">
          {evaluationsList.map(({ question, answer, evaluation }, idx) => (
            <div
              key={question.id || idx}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question #{idx + 1}
                </span>
                {evaluation ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                    Score: {evaluation.overallScore}% • {evaluation.verdict}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-xs">
                    Unanswered
                  </span>
                )}
              </div>

              <h4 className="font-extrabold text-slate-900 text-base">
                {question.question}
              </h4>

              {/* Student's Answer */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Your Answer:</span>
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line leading-relaxed">
                  {answer || '(No answer entered)'}
                </p>
              </div>

              {/* Evaluation Details */}
              {evaluation && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3 text-xs">
                  <div>
                    <strong className="text-indigo-950 block font-bold mb-1">AI Critique:</strong>
                    <p className="text-slate-700 leading-relaxed">{evaluation.technicalAccuracy}</p>
                  </div>

                  {evaluation.missingConcepts?.length > 0 && (
                    <div>
                      <strong className="text-amber-800 block font-bold mb-1">Missing Concepts:</strong>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {evaluation.missingConcepts.map((mc, mci) => (
                          <li key={mci}>{mc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.suggestedIdealAnswer && (
                    <div className="pt-2 border-t border-indigo-100/60">
                      <strong className="text-indigo-900 block font-bold mb-1">Suggested Ideal Answer:</strong>
                      <p className="text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                        {evaluation.suggestedIdealAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
