import React, { useState, useEffect } from 'react';
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
  ChevronLeft
} from 'lucide-react';
import { 
  getCompanies, 
  getInterviewQuestions, 
  saveMockSession, 
  getGraduationBatch 
} from '../services/storage';
import { evaluateStudentAnswer } from '../services/aiEngine';

export default function MockInterviewPage({ initialCompany, initialRound, onFinish }) {
  const companies = getCompanies();
  const currentBatch = getGraduationBatch();

  // Setup state
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompany?.id || 'hcltech');
  const [selectedRound, setSelectedRound] = useState(initialRound || 'technical');
  const [sessionActive, setSessionActive] = useState(false);
  
  // Interview active session state
  const [questionsList, setQuestionsList] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentInput, setStudentInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [sessionEvaluations, setSessionEvaluations] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const startInterview = () => {
    const all = getInterviewQuestions();
    const filtered = all.filter(q => q.companyId === selectedCompanyId && q.round === selectedRound);
    const pool = filtered.length > 0 ? filtered : all.filter(q => q.round === selectedRound);

    // Pick 3 questions
    const picked = pool.slice(0, 3);
    setQuestionsList(picked);
    setCurrentQIndex(0);
    setStudentInput('');
    setCurrentEvaluation(null);
    setSessionEvaluations([]);
    setSessionComplete(false);
    setSessionActive(true);
  };

  const currentQuestion = questionsList[currentQIndex];

  const handleSubmitAnswer = () => {
    if (!studentInput.trim()) return;

    setIsEvaluating(true);

    // Simulate smart AI evaluation delay
    setTimeout(() => {
      const evalResult = evaluateStudentAnswer(currentQuestion, studentInput, selectedRound);
      setCurrentEvaluation(evalResult);
      setSessionEvaluations(prev => [...prev, {
        question: currentQuestion.question,
        studentAnswer: studentInput,
        evaluation: evalResult
      }]);
      setIsEvaluating(false);
    }, 800);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questionsList.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setStudentInput('');
      setCurrentEvaluation(null);
    } else {
      // Complete Session
      const totalScore = Math.round(
        sessionEvaluations.reduce((acc, curr) => acc + curr.evaluation.overallScore, 0) / Math.max(1, sessionEvaluations.length)
      );
      
      const newSession = {
        companyId: selectedCompany.id,
        companyName: selectedCompany.name,
        round: `${selectedRound.toUpperCase()} Interview`,
        date: new Date().toISOString().split('T')[0],
        score: totalScore,
        correctness: Math.round(sessionEvaluations.reduce((acc, curr) => acc + curr.evaluation.correctnessScore, 0) / sessionEvaluations.length),
        clarity: Math.round(sessionEvaluations.reduce((acc, curr) => acc + curr.evaluation.clarityScore, 0) / sessionEvaluations.length),
        structure: Math.round(sessionEvaluations.reduce((acc, curr) => acc + curr.evaluation.structureScore, 0) / sessionEvaluations.length),
        questionsAnswered: sessionEvaluations.length,
        feedbackSummary: `Completed ${selectedCompany.name} ${selectedRound} simulated panel with ${totalScore}% score.`
      };

      saveMockSession(newSession);
      setSessionComplete(true);
    }
  };

  // Toggle speech simulation
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }
    
    // Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setStudentInput(prev => (prev ? prev + ' ' : '') + transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200 mb-3">
            <Bot className="w-3.5 h-3.5" />
            <span>Interactive AI Interview Simulator</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            AI-Powered Mock Interviewer
          </h1>

          <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Practice realistic 1-on-1 placement interviews. Get instant automated scoring on correctness, communication clarity, and STAR structure.
          </p>
        </div>
      </div>

      {/* SETUP SCREEN */}
      {!sessionActive && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <h2 className="font-extrabold text-xl text-slate-900 mb-1">
              Configure Your Mock Interview Round
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select your target company and the interview stage you wish to simulate.
            </p>
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              1. Select Company:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {companies.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    selectedCompanyId === c.id
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-bold text-sm text-slate-900">{c.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.tier}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Round Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              2. Select Interview Round:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'technical', title: 'Technical Interview', desc: 'Core CS, DSA, SQL, OOP, and coding rationale' },
                { id: 'hr', title: 'HR Round', desc: 'Tell me about yourself, why this company, relocation, culture fit' },
                { id: 'managerial', title: 'Managerial Round', desc: 'Conflict resolution, handling pressure, situational scenarios' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRound(r.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRound === r.id
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-bold text-sm text-slate-900">{r.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Simulates 3 interview questions with full diagnostic feedback.</span>
            </div>

            <button
              onClick={startInterview}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Start Simulated Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW SCREEN */}
      {sessionActive && !sessionComplete && currentQuestion && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-0">
          
          {/* Interview Progress Bar */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-white">
                  {selectedCompany.name} • {selectedRound.toUpperCase()} Round
                </p>
                <p className="text-xs text-slate-400">
                  AI Interviewer Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">
                Question {currentQIndex + 1} of {questionsList.length}
              </span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / questionsList.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* AI Question Bubble */}
          <div className="p-6 sm:p-8 bg-indigo-50/40 border-b border-indigo-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-sm">
                AI
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 uppercase">
                    Interviewer Question:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-slate-600 text-[10px] font-bold border border-slate-200">
                    {currentQuestion.category}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  "{currentQuestion.question}"
                </h2>
              </div>
            </div>
          </div>

          {/* Student Response Area */}
          <div className="p-6 sm:p-8 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Answer:
                </label>
                <button
                  onClick={toggleSpeechRecognition}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                    isListening
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                placeholder="Type your structured answer here. Use STAR framework for behavioral questions or explain logic/complexity for technical rounds..."
                disabled={currentEvaluation !== null || isEvaluating}
                className="w-full p-4 border border-slate-300 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 leading-relaxed font-normal"
              />
            </div>

            {/* Submit Action */}
            {!currentEvaluation && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400">
                  Aim for 60-150 words for complete evaluation depth.
                </p>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!studentInput.trim() || isEvaluating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Evaluating Response...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for AI Evaluation</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI EVALUATION RESULTS CARD */}
            {currentEvaluation && (
              <div className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      AI Diagnostic Verdict:
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 mt-0.5">
                      {currentEvaluation.verdict}
                    </h3>
                  </div>

                  {/* Scores Badge */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-center shadow-xs">
                      <span className="text-xs font-medium block opacity-80">Score</span>
                      <span className="text-lg font-black leading-none">{currentEvaluation.overallScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-600 mb-1">
                      <span>Correctness & Depth</span>
                      <span className="font-bold text-indigo-600">{currentEvaluation.correctnessScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${currentEvaluation.correctnessScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-600 mb-1">
                      <span>Clarity & Tone</span>
                      <span className="font-bold text-emerald-600">{currentEvaluation.clarityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${currentEvaluation.clarityScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex justify-between font-semibold text-slate-600 mb-1">
                      <span>Structure (STAR / Logic)</span>
                      <span className="font-bold text-purple-600">{currentEvaluation.structureScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${currentEvaluation.structureScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Feedback prose */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {currentEvaluation.feedback}
                </p>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
                      <ThumbsUp className="w-3.5 h-3.5" /> Strengths Identified:
                    </span>
                    <ul className="space-y-1 text-emerald-900">
                      {currentEvaluation.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span> <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <span className="font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                      <ThumbsDown className="w-3.5 h-3.5" /> High-Impact Improvements:
                    </span>
                    <ul className="space-y-1 text-amber-900">
                      {currentEvaluation.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span> <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Model Guidance */}
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Ideal Candidate Approach / Benchmark Response:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                    {currentEvaluation.sampleGuidance}
                  </p>
                </div>

                {/* Advance Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{currentQIndex < questionsList.length - 1 ? 'Next Question' : 'View Session Results'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* SESSION COMPLETE SUMMARY SCREEN */}
      {sessionComplete && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Mock Interview Completed!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            You successfully completed the simulated <b>{selectedCompany.name}</b> {selectedRound} interview round.
          </p>

          {/* Average Score */}
          <div className="inline-block p-6 rounded-2xl bg-slate-50 border border-slate-200 my-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Performance Score</span>
            <div className="text-4xl font-black text-indigo-600 mt-1">
              {Math.round(sessionEvaluations.reduce((acc, curr) => acc + curr.evaluation.overallScore, 0) / sessionEvaluations.length)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Session results recorded to your student analytics profile.</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setSessionActive(false);
                setSessionComplete(false);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Take Another Mock Round
            </button>

            <button
              onClick={onFinish}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/25"
            >
              View My Dashboard Analytics
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
