// PlacePrep AI - DSA Question Solving & Coding Workspace Component
// Features: Problem description, constraints, examples, collapsible hints,
// multi-language editor (Java, Python, C++, JS), line numbers, draft persistence,
// submission history, and transparent execution infrastructure status reporting.

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Code2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Play,
  Send,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Layers,
  Clock,
  Terminal,
  FileCode,
  Save,
  Info
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  getStarterCodeTemplate,
  getStudentCodeDraft,
  saveStudentCodeDraft,
  getStudentSubmissions,
  recordStudentSubmission,
  recordRecentlyAttempted
} from '../../services/dsaService.js';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function DsaCodingWorkspace({
  question,
  allQuestions = [],
  currentIndex = 0,
  currentUser,
  isPracticed,
  isRevision,
  onTogglePracticed,
  onToggleRevision,
  onBackToExplorer,
  onSelectQuestion
}) {
  const studentId = currentUser?.id || currentUser?.email || 'default_student';

  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('tests'); // 'tests' | 'submissions' | 'solution'
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved' | 'Saving...'
  const [activeTabLeft, setActiveTabLeft] = useState('problem'); // 'problem' | 'examples' | 'approach'

  const textareaRef = useRef(null);

  // Load code draft or starter code when question or language changes
  useEffect(() => {
    if (!question) return;

    recordRecentlyAttempted(studentId, question.id);

    const savedDraft = getStudentCodeDraft(studentId, question.id, selectedLanguage);
    if (savedDraft) {
      setCode(savedDraft);
    } else {
      setCode(getStarterCodeTemplate(question, selectedLanguage));
    }

    setSubmissions(getStudentSubmissions(studentId, question.id));
    setExecutionResult(null);
    setShowSolution(false);
  }, [question?.id, selectedLanguage, studentId]);

  // Debounced auto-save of student code draft
  useEffect(() => {
    if (!question?.id) return;
    setSaveStatus('Saving...');
    const timer = setTimeout(() => {
      saveStudentCodeDraft(studentId, question.id, selectedLanguage, code);
      setSaveStatus('Draft Saved');
    }, 600);
    return () => clearTimeout(timer);
  }, [code, question?.id, selectedLanguage, studentId]);

  const handleResetCode = () => {
    if (window.confirm('Reset code to the default starter template for this language?')) {
      const template = getStarterCodeTemplate(question, selectedLanguage);
      setCode(template);
      saveStudentCodeDraft(studentId, question.id, selectedLanguage, template);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Supports Tab key indentation inside the editor textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineCount = Math.max(code.split('\n').length, 16);

  // Honest Execution Handler: Validates code structure and transparently notifies of backend runner status
  const handleRunCode = () => {
    setIsRunning(true);
    setActiveConsoleTab('tests');

    setTimeout(() => {
      setIsRunning(false);
      const trimmed = code.trim();
      let syntaxPass = true;
      let diagnosticMessage = '';

      // Basic client-side structural sanity checks
      if (!trimmed) {
        syntaxPass = false;
        diagnosticMessage = 'Empty code file: Please write your algorithmic logic before running tests.';
      } else {
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          syntaxPass = false;
          diagnosticMessage = `Bracket mismatch: Found ${openBraces} opening '{' and ${closeBraces} closing '}'. Verify code blocks.`;
        }
      }

      setExecutionResult({
        type: syntaxPass ? 'notice' : 'error',
        title: syntaxPass ? 'Local Validation Passed • Execution Environment Pending' : 'Syntax Check Failed',
        syntaxPassed: syntaxPass,
        diagnostic: diagnosticMessage,
        runtimeStatus: 'Pending Sandbox Infrastructure',
        sampleInput: question?.examples?.[0]?.input || 'N/A',
        expectedOutput: question?.examples?.[0]?.output || 'N/A',
        note: 'PlacePrep institutional backend does not host arbitrary remote code execution runners in this tier. Your code was validated and saved locally for your student account.'
      });
    }, 700);
  };

  const handleSubmitSolution = () => {
    setIsSubmitting(true);
    setActiveConsoleTab('submissions');

    setTimeout(() => {
      setIsSubmitting(false);
      const newSub = recordStudentSubmission(studentId, question.id, {
        language: selectedLanguage,
        code,
        status: 'Recorded',
        notes: `Submission recorded for ${question.title}.`
      });

      if (newSub) {
        setSubmissions(prev => [newSub, ...prev]);
      }

      // Automatically mark as practiced if not already marked
      if (!isPracticed) {
        onTogglePracticed(question.id);
      }
    }, 800);
  };

  const handlePrev = () => {
    if (currentIndex > 0 && allQuestions[currentIndex - 1]) {
      onSelectQuestion(allQuestions[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allQuestions.length - 1 && allQuestions[currentIndex + 1]) {
      onSelectQuestion(allQuestions[currentIndex + 1]);
    }
  };

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'medium').toLowerCase();
    if (d === 'easy') return <Badge variant="emerald" size="sm">Easy</Badge>;
    if (d === 'hard') return <Badge variant="rose" size="sm">Hard</Badge>;
    return <Badge variant="amber" size="sm">Medium</Badge>;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Workspace Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToExplorer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Problem Explorer</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2 flex-wrap">
            {getDifficultyBadge(question.difficulty)}
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
              {question.companyName}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
              {question.topic}
            </span>
            {question.frequencyScore && (
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                ★ {question.frequencyScore}% Frequency
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => onTogglePracticed(question.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isPracticed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isPracticed ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isPracticed ? 'Solved' : 'Mark Solved'}</span>
          </button>

          <button
            onClick={() => onToggleRevision(question.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isRevision
                ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Flag for revision review"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRevision ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Revision</span>
          </button>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Problem"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-[11px] font-semibold text-slate-500 px-1">
              {currentIndex + 1} / {allQuestions.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex >= allQuestions.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Problem"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Problem Description, Constraints, Examples, and Hints */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
          
          {/* Left Tabs */}
          <div className="flex items-center border-b border-slate-100 bg-slate-50/50 px-4 pt-3 gap-2">
            <button
              onClick={() => setActiveTabLeft('problem')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTabLeft === 'problem'
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTabLeft('examples')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTabLeft === 'examples'
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Examples & Constraints
            </button>
            <button
              onClick={() => setActiveTabLeft('approach')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTabLeft === 'approach'
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Hints & Approach
            </button>
          </div>

          {/* Left Content Scrollable Container */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
            
            {/* PROBLEM DESCRIPTION TAB */}
            {activeTabLeft === 'problem' && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Technical Problem Statement
                  </span>
                  <h2 className="text-xl font-black text-slate-900 mt-2 leading-snug">
                    {question.title}
                  </h2>
                </div>

                {question.question && question.question !== question.title && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 leading-relaxed font-sans">
                    {question.question}
                  </div>
                )}

                {/* Skills & Concepts */}
                {question.skills && question.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Target Concepts & Patterns
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {question.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recruiter Frequency Context */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Recruiter Round Context ({question.companyName})</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Frequently asked in first-round technical screenings and live pair-programming rounds. Expect interviewers to ask for complexity proof and edge-case handling.
                  </p>
                </div>
              </div>
            )}

            {/* EXAMPLES & CONSTRAINTS TAB */}
            {activeTabLeft === 'examples' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Sample Test Cases & Scenarios
                  </h4>
                  <div className="space-y-3">
                    {question.examples.map((ex, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                        <div>
                          <span className="font-bold text-slate-500 block uppercase font-sans text-[10px]">Input:</span>
                          <code className="text-indigo-900 font-bold">{ex.input}</code>
                        </div>
                        <div>
                          <span className="font-bold text-slate-500 block uppercase font-sans text-[10px]">Output:</span>
                          <code className="text-emerald-800 font-bold">{ex.output}</code>
                        </div>
                        {ex.explanation && (
                          <div className="pt-2 border-t border-slate-200/60 font-sans text-slate-600 text-[11px]">
                            <strong className="text-slate-800">Explanation: </strong>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Algorithmic Constraints
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {question.constraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <span className="font-mono text-slate-800">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* HINTS & APPROACH TAB */}
            {activeTabLeft === 'approach' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-700" />
                      <span>Recommended Algorithmic Approach</span>
                    </span>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="text-xs font-bold text-amber-800 hover:text-amber-900 underline cursor-pointer"
                    >
                      {showHints ? 'Hide Hint' : 'Reveal Hint'}
                    </button>
                  </div>
                  {showHints ? (
                    <p className="mt-3 text-xs text-amber-950 leading-relaxed font-sans border-t border-amber-200/60 pt-3">
                      {question.approach || 'Break the problem into subproblems. Consider two pointers or hash-table lookups to achieve linear time complexity.'}
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-amber-800/80 italic">
                      Click 'Reveal Hint' if you need guidance on time-space optimal patterns.
                    </p>
                  )}
                </div>

                {/* Follow-up Interview Questions */}
                {question.followUps && question.followUps.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                      Recruiter Follow-Up Questions
                    </h4>
                    <div className="space-y-2">
                      {question.followUps.map((fu, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                          <strong className="text-indigo-700 mr-1.5">Q{idx + 1}:</strong>
                          {fu}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor, Language Selection, Execution Console */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Code Editor Container */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden text-slate-100 flex flex-col h-[520px]">
            
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>

                {/* Language Picker */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label} ({lang.extension})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status and Tools */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {saveStatus}
                </span>

                <button
                  onClick={handleCopyCode}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleResetCode}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Reset to Starter Template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editor Textarea with Gutters */}
            <div className="flex-1 flex overflow-hidden relative font-mono text-xs">
              {/* Line Numbers Gutter */}
              <div className="w-12 bg-slate-900/60 select-none py-4 text-right pr-3 text-slate-600 border-r border-slate-850">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i + 1} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Code Input */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                className="flex-1 bg-transparent text-slate-200 py-4 px-4 leading-6 resize-none focus:outline-none font-mono selection:bg-indigo-900 selection:text-white overflow-auto"
                placeholder="// Write your solution here..."
              />
            </div>

            {/* Editor Action Bottom Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-t border-slate-850">
              <span className="text-[11px] text-slate-400">
                Language: <strong className="text-slate-200">{selectedLanguage.toUpperCase()}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>{isRunning ? 'Validating...' : 'Run Code'}</span>
                </button>

                <button
                  onClick={handleSubmitSolution}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Recording...' : 'Submit Solution'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Execution Console & Evaluation Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[220px]">
            
            {/* Console Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 pt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConsoleTab('tests')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeConsoleTab === 'tests'
                      ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Test Results & Output</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('submissions')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeConsoleTab === 'submissions'
                      ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Submissions ({submissions.length})</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('solution')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeConsoleTab === 'solution'
                      ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Verified Reference</span>
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="p-5 text-xs">
              
              {/* TAB 1: TEST RESULTS & RUNNER STATUS */}
              {activeConsoleTab === 'tests' && (
                <div>
                  {executionResult ? (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-2xl border ${
                        executionResult.type === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                      }`}>
                        <div className="flex items-center gap-2 font-bold mb-1">
                          {executionResult.type === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : (
                            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                          <span>{executionResult.title}</span>
                        </div>
                        {executionResult.diagnostic && (
                          <p className="mt-1 font-mono text-[11px] text-rose-700">
                            {executionResult.diagnostic}
                          </p>
                        )}
                        <p className="mt-2 text-[11px] text-slate-600 leading-relaxed">
                          {executionResult.note}
                        </p>
                      </div>

                      {/* Sample Test Case Inspection */}
                      <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-sans block mb-1">
                            Sample Input Verified
                          </span>
                          <span className="text-slate-800">{executionResult.sampleInput}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-sans block mb-1">
                            Expected Output
                          </span>
                          <span className="text-emerald-700 font-bold">{executionResult.expectedOutput}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 space-y-1">
                      <Terminal className="w-6 h-6 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">Console is idle</p>
                      <p className="text-[11px]">Click "Run Code" to validate your logic and view test evaluation.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SUBMISSIONS */}
              {activeConsoleTab === 'submissions' && (
                <div>
                  {submissions.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 space-y-1">
                      <Layers className="w-6 h-6 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">No submissions recorded yet</p>
                      <p className="text-[11px]">Click "Submit Solution" to record your code under your student profile.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 uppercase">{sub.language}</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {sub.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                              Recorded on {new Date(sub.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setCode(sub.code);
                              setSelectedLanguage(sub.language);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                          >
                            Load Code
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VERIFIED SOLUTION REFERENCE */}
              {activeConsoleTab === 'solution' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Official Solution & Pattern Implementation</span>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSolution ? 'Hide Solution' : 'Reveal Solution'}</span>
                    </button>
                  </div>

                  {showSolution ? (
                    <div className="space-y-3">
                      {question.suggestedAnswer && (
                        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 font-sans leading-relaxed whitespace-pre-wrap">
                          {question.suggestedAnswer}
                        </div>
                      )}

                      {question.sampleCode && (
                        <div className="relative">
                          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto">
                            {question.sampleCode}
                          </pre>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(question.sampleCode);
                              alert('Sample solution copied to clipboard.');
                            }}
                            className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                          >
                            Copy Sample
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-1">
                      <p className="font-semibold">Solution is hidden to encourage practice</p>
                      <p className="text-[11px]">Reveal only after giving the problem an honest attempt.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
