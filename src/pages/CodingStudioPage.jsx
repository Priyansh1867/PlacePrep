import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Code2,
  History,
  LoaderCircle,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldCheck
} from 'lucide-react';
import { AuthApi, CodingStudioApi } from '../services/api';

const verdictStyles = {
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  WRONG_ANSWER: 'bg-rose-100 text-rose-800',
  COMPILATION_ERROR: 'bg-amber-100 text-amber-800',
  RUNTIME_ERROR: 'bg-orange-100 text-orange-800',
  TIME_LIMIT_EXCEEDED: 'bg-violet-100 text-violet-800'
};

const javaTokenPattern = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:abstract|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|null|package|private|protected|public|return|short|static|super|switch|this|throw|throws|try|void|while|String|System|Scanner|Map|HashMap|List|ArrayList|Collections|Arrays|Math)\b|\b\d+(?:\.\d+)?\b)/g;

function highlightedJava(source) {
  return source.split(javaTokenPattern).map((token, index) => {
    if (!token) return null;
    const className = token.startsWith('//') || token.startsWith('/*')
      ? 'text-slate-500 italic'
      : token.startsWith('"') || token.startsWith("'")
        ? 'text-emerald-300'
        : /^\d/.test(token)
          ? 'text-amber-300'
          : javaTokenPattern.test(token)
            ? 'text-sky-300'
            : '';
    javaTokenPattern.lastIndex = 0;
    return <span key={`${index}-${token}`} className={className}>{token}</span>;
  });
}

function VerdictPill({ verdict }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${verdictStyles[verdict] || 'bg-slate-100 text-slate-700'}`}>
      {verdict?.replaceAll('_', ' ') || 'PENDING'}
    </span>
  );
}

export default function CodingStudioPage({ onBack }) {
  const [access, setAccess] = useState('checking');
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyPages, setHistoryPages] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [sourceByProblem, setSourceByProblem] = useState({});
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('All topics');
  const [difficultyFilter, setDifficultyFilter] = useState('All levels');
  const [statusFilter, setStatusFilter] = useState('All problems');
  const [result, setResult] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [activeSubmission, setActiveSubmission] = useState(null);
  const codePreRef = useRef(null);
  const textareaRef = useRef(null);

  const refreshStudentData = async (page = 0) => {
    const [problemData, progressData, historyData] = await Promise.all([
      CodingStudioApi.getProblems(),
      CodingStudioApi.getProgress(),
      CodingStudioApi.getSubmissions({ page, size: 8 })
    ]);
    setProblems(problemData);
    setProgress(progressData);
    setSubmissions(historyData.content || []);
    setHistoryPage(historyData.page || 0);
    setHistoryPages(historyData.totalPages || 0);
    setSelectedProblemId((current) => current || problemData[0]?.id || '');
  };

  useEffect(() => {
    let isCurrent = true;
    const verifyAndLoad = async () => {
      try {
        const user = await AuthApi.getMe();
        if (!isCurrent) return;
        if (user.role?.toLowerCase() !== 'student') {
          setAccess('denied');
          return;
        }
        setAccess('loading');
        await refreshStudentData(0);
        if (isCurrent) setAccess('allowed');
      } catch (loadError) {
        if (!isCurrent) return;
        setError(loadError.message || 'Unable to verify your student account.');
        setAccess('denied');
      }
    };
    verifyAndLoad();
    return () => {
      isCurrent = false;
    };
  }, []);

  const topics = useMemo(
    () => ['All topics', ...new Set(problems.map((problem) => problem.topic).filter(Boolean))],
    [problems]
  );

  const visibleProblems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return problems.filter((problem) => {
      const matchesSearch = !term
        || problem.title?.toLowerCase().includes(term)
        || problem.statement?.toLowerCase().includes(term)
        || problem.topic?.toLowerCase().includes(term);
      const matchesTopic = topicFilter === 'All topics' || problem.topic === topicFilter;
      const matchesDifficulty = difficultyFilter === 'All levels' || problem.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
      const matchesStatus = statusFilter === 'All problems'
        || (statusFilter === 'Solved' ? problem.solved : !problem.solved);
      return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
    });
  }, [problems, search, topicFilter, difficultyFilter, statusFilter]);

  const selectedProblem = problems.find((problem) => problem.id === selectedProblemId);
  const sourceCode = selectedProblem
    ? sourceByProblem[selectedProblem.id] ?? selectedProblem.starterCode ?? ''
    : '';

  const changeSource = (value) => {
    if (!selectedProblem) return;
    setSourceByProblem((current) => ({ ...current, [selectedProblem.id]: value }));
    setActiveSubmission(null);
  };

  const resetToStarter = () => {
    if (!selectedProblem) return;
    const starter = selectedProblem.starterCode || '';
    setSourceByProblem((current) => ({ ...current, [selectedProblem.id]: starter }));
    setActiveSubmission(null);
    setResult(null);
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = sourceCode;
      const updated = current.substring(0, start) + '    ' + current.substring(end);
      changeSource(updated);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      });
    }
  };

  const handleExecute = async (action) => {
    if (!selectedProblem || !sourceCode.trim()) {
      setError('Choose a problem and enter Java code before running it.');
      return;
    }
    setBusyAction(action);
    setError('');
    setResult(null);
    setActiveSubmission(null);
    try {
      const response = action === 'submit'
        ? await CodingStudioApi.submit(selectedProblem.id, 'java', sourceCode)
        : await CodingStudioApi.run(selectedProblem.id, 'java', sourceCode);
      setResult(response);
      try {
        await refreshStudentData();
      } catch (syncErr) {
        console.warn('Could not sync progress data:', syncErr);
      }
    } catch (executionError) {
      setError(executionError.message || 'The code could not be evaluated. Please try again.');
    } finally {
      setBusyAction('');
    }
  };

  const viewSubmission = (submission) => {
    setSelectedProblemId(submission.problemId);
    setSourceByProblem((current) => ({ ...current, [submission.problemId]: submission.sourceCode }));
    setResult(submission);
    setActiveSubmission(submission.id);
  };

  const changeHistoryPage = async (page) => {
    setHistoryLoading(true);
    try {
      const historyData = await CodingStudioApi.getSubmissions({ page, size: 8 });
      setSubmissions(historyData.content || []);
      setHistoryPage(historyData.page || 0);
      setHistoryPages(historyData.totalPages || 0);
    } catch (historyError) {
      setError(historyError.message || 'Unable to load your submission history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  if (access === 'checking' || access === 'loading') {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-700 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" />
          Verifying Student access and loading your Studio…
        </div>
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 rounded-2xl bg-rose-50 p-4 text-rose-700"><ShieldCheck className="h-8 w-8" /></div>
        <h1 className="text-2xl font-black text-slate-900">Student access required</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
          The Coding Studio is only available to students signed in through a verified PlacePrep account.
          {error ? ` ${error}` : ''}
        </p>
        <button onClick={onBack} className="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
          Back to Institution
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-slate-50 px-3 py-5 text-slate-900 sm:px-5 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-[1500px]">
        <header className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#111439] via-[#1A1E4F] to-[#282F74] p-5 text-white shadow-lg sm:p-7">
          <div className="flex min-w-0 items-start gap-3">
            <button onClick={onBack} className="mt-1 rounded-xl border border-white/20 bg-white/10 p-2 hover:bg-white/20" aria-label="Back to Institution">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                <Code2 className="h-4 w-4" /> Institution · Student workspace
              </div>
              <h1 className="text-2xl font-black sm:text-3xl">Coding Studio</h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-indigo-100 sm:text-sm">
                Practice existing PlacePrep DSA questions with real, isolated Java evaluation.
              </p>
            </div>
          </div>
          <div className="grid w-full grid-cols-3 gap-2 text-center sm:w-auto">
            <Metric icon={CheckCircle2} label="Solved" value={progress?.solvedProblems ?? 0} />
            <Metric icon={History} label="Attempts" value={progress?.attempts ?? 0} />
            <Metric icon={BarChart3} label="Accuracy" value={`${progress?.accuracyPercent ?? 0}%`} />
          </div>
        </header>

        {error && (
          <div className="mb-4 flex min-w-0 flex-wrap items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 break-words">{error}</span>
            <button className="ml-auto text-xs font-bold underline" onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-extrabold">Problem library</h2>
              <label className="relative mb-3 block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problems…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px]">
                  {topics.map((topic) => <option key={topic}>{topic}</option>)}
                </select>
                <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px]">
                  {['All levels', 'Easy', 'Medium', 'Hard'].map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                </select>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px]">
                  {['All problems', 'Solved', 'Unsolved'].map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
              <div className="mt-3 max-h-[430px] space-y-2 overflow-y-auto pr-1">
                {visibleProblems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => {
                      setSelectedProblemId(problem.id);
                      setResult(null);
                      setActiveSubmission(null);
                      setError('');
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition ${selectedProblemId === problem.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold leading-5">{problem.title}</span>
                      {problem.solved && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                    </span>
                    <span className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>{problem.topic}</span>
                      <span>{problem.difficulty}</span>
                    </span>
                  </button>
                ))}
                {visibleProblems.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">No problems match those filters.</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-extrabold"><History className="h-4 w-4 text-indigo-600" /> Recent attempts</div>
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-500">Your code runs and submissions will appear here.</p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((submission) => (
                    <button key={submission.id} onClick={() => viewSubmission(submission)} className={`w-full rounded-xl border p-2.5 text-left ${activeSubmission === submission.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <span className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-bold">{problems.find((problem) => problem.id === submission.problemId)?.title || submission.problemId}</span>
                        <VerdictPill verdict={submission.verdict} />
                      </span>
                      <span className="block text-[10px] text-slate-500">{submission.submissionType} · {new Date(submission.submittedAt).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
              {historyPages > 1 && (
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                  <button disabled={historyPage === 0 || historyLoading} onClick={() => changeHistoryPage(historyPage - 1)} className="rounded-lg px-2 py-1 font-bold hover:bg-slate-100 disabled:opacity-40">Previous</button>
                  <span>Page {historyPage + 1} of {historyPages}</span>
                  <button disabled={historyPage + 1 >= historyPages || historyLoading} onClick={() => changeHistoryPage(historyPage + 1)} className="rounded-lg px-2 py-1 font-bold hover:bg-slate-100 disabled:opacity-40">Next</button>
                </div>
              )}
            </section>
          </aside>

          <main className="min-w-0 space-y-5">
            {selectedProblem ? (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600">{selectedProblem.topic} · {selectedProblem.id}</div>
                      <h2 className="text-xl font-black">{selectedProblem.title}</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{selectedProblem.difficulty}</span>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{selectedProblem.statement}</p>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-600">Input and output</h3>
                      <p className="text-xs leading-5"><strong>Input:</strong> {selectedProblem.inputFormat}</p>
                      <p className="mt-1 text-xs leading-5"><strong>Output:</strong> {selectedProblem.outputFormat}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-600">Constraints</h3>
                      <ul className="list-inside list-disc space-y-1 text-xs text-slate-700">
                        {selectedProblem.constraints?.map((constraint) => <li key={constraint}>{constraint}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {selectedProblem.examples?.map((example, index) => (
                      <div key={`${selectedProblem.id}-example-${index}`} className="rounded-xl border border-slate-200 p-4">
                        <h3 className="mb-2 text-xs font-extrabold">Example {index + 1}</h3>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                          <div className="rounded-lg bg-slate-950 p-2 text-slate-100"><span className="mb-1 block font-sans text-[9px] text-slate-400">INPUT</span><pre className="whitespace-pre-wrap">{example.input}</pre></div>
                          <div className="rounded-lg bg-slate-950 p-2 text-emerald-300"><span className="mb-1 block font-sans text-[9px] text-slate-400">OUTPUT</span><pre className="whitespace-pre-wrap">{example.output}</pre></div>
                        </div>
                        {example.explanation && <p className="mt-2 text-[11px] leading-5 text-slate-500">{example.explanation}</p>}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Code2 className="h-4 w-4 text-indigo-300" />
                      Solution editor
                      <span className="rounded bg-white/10 px-2 py-1 text-[10px] text-slate-300">Java</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={resetToStarter}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                        title="Reset code to problem template"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset Starter
                      </button>
                      <span className="hidden sm:inline text-[10px] text-slate-400">Java is enabled; other languages require provider mappings.</span>
                    </div>
                  </div>
                  <div className="relative h-[390px] overflow-hidden sm:h-[470px]">
                    <pre ref={codePreRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-4 font-mono text-[12px] leading-6 text-slate-100 sm:text-[13px]"><code>{highlightedJava(sourceCode)}{' '}</code></pre>
                    <textarea
                      ref={textareaRef}
                      aria-label="Java solution source code"
                      spellCheck="false"
                      autoCapitalize="off"
                      autoComplete="off"
                      value={sourceCode}
                      onChange={(event) => changeSource(event.target.value)}
                      onKeyDown={handleKeyDown}
                      onScroll={(event) => {
                        if (codePreRef.current) {
                          codePreRef.current.scrollTop = event.target.scrollTop;
                          codePreRef.current.scrollLeft = event.target.scrollLeft;
                        }
                      }}
                      className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-4 font-mono text-[12px] leading-6 text-transparent caret-white outline-none selection:bg-indigo-500/50 sm:text-[13px]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[10px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Runs in the configured isolated judge, never in your browser.</p>
                    <div className="flex gap-2">
                      <button disabled={Boolean(busyAction)} onClick={() => handleExecute('run')} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50">
                        {busyAction === 'run' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        Run Code
                      </button>
                      <button disabled={Boolean(busyAction)} onClick={() => handleExecute('submit')} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-400 disabled:opacity-50">
                        {busyAction === 'submit' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Submit Solution
                      </button>
                    </div>
                  </div>
                </section>

                {result && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold">Execution result</h2>
                        <VerdictPill verdict={result.verdict} />
                      </div>
                      <div className="flex gap-4 text-[11px] text-slate-500">
                        {result.executionTimeMs != null && <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{result.executionTimeMs} ms total</span>}
                        {result.memoryKb != null && <span>{result.memoryKb} KB peak</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {result.testResults?.map((test) => (
                        <div key={test.testCaseNumber} className={`grid gap-2 rounded-xl border p-3 sm:grid-cols-[110px_1fr] ${test.passed ? 'border-emerald-100 bg-emerald-50/60' : 'border-rose-100 bg-rose-50/60'}`}>
                          <div className={`text-xs font-extrabold ${test.passed ? 'text-emerald-800' : 'text-rose-800'}`}>Sample {test.testCaseNumber} · {test.verdict.replaceAll('_', ' ')}</div>
                          <div className="grid gap-2 text-[10px] sm:grid-cols-3">
                            <OutputBlock label="Input" value={test.input} />
                            <OutputBlock label="Expected" value={test.expectedOutput} />
                            <OutputBlock label="Your output" value={test.actualOutput || '(no output)'} />
                          </div>
                        </div>
                      ))}
                      {result.submissionType === 'SUBMIT' && (
                        <p className="rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
                          Hidden cases were evaluated on the server. Their inputs and expected outputs are not sent to your browser.
                        </p>
                      )}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No coding problems are available yet.</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-[72px] rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <div className="flex items-center justify-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-indigo-200"><Icon className="h-3 w-3" />{label}</div>
      <div className="mt-1 text-lg font-black">{value}</div>
    </div>
  );
}

function OutputBlock({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-white/80 p-2">
      <span className="mb-1 block font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-words font-mono text-slate-700">{value}</pre>
    </div>
  );
}
