import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Award,
  ChevronRight,
  ClipboardCheck,
  Building2,
  GraduationCap,
  Sparkles,
  Layers,
  MessageSquare,
  PlusCircle,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertCircle,
  Send,
  Star,
  UserCheck,
  Shield,
  Briefcase,
  Upload,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  SELECTION_ROUNDS,
  INITIAL_CANDIDATES_PIPELINE,
  INITIAL_EVALUATOR_RECORDS,
  INITIAL_STAKEHOLDER_FEEDBACK
} from '../data/selectionWorkflowData';
import { getCompanies, getInterviewQuestions } from '../services/storage';
import { WorkflowApi } from '../services/api';
import PortalModuleCards from '../components/PortalModuleCards';
import SearchBar from '../components/ui/SearchBar';

export default function SelectionWorkflowPage({ onNavigate, onBack, onSelectQuestion }) {
  const [activeTab, setActiveTab] = useState('pipeline');

  // Reset scroll to top on tab change so SearchBar is directly visible
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (typeof document !== 'undefined') {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeTab]); // 'pipeline', 'engine', 'evaluations', 'feedback', 'questions'
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [evalSearchQuery, setEvalSearchQuery] = useState('');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState('');
  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_candidates_pipeline');
      return saved ? JSON.parse(saved) : INITIAL_CANDIDATES_PIPELINE;
    } catch {
      return INITIAL_CANDIDATES_PIPELINE;
    }
  });

  const [evaluatorRecords, setEvaluatorRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_evaluator_records');
      return saved ? JSON.parse(saved) : INITIAL_EVALUATOR_RECORDS;
    } catch {
      return INITIAL_EVALUATOR_RECORDS;
    }
  });

  const [stakeholderFeedback, setStakeholderFeedback] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_stakeholder_feedback');
      return saved ? JSON.parse(saved) : INITIAL_STAKEHOLDER_FEEDBACK;
    } catch {
      return INITIAL_STAKEHOLDER_FEEDBACK;
    }
  });

  // Modal / Form States
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedCandidateForEval, setSelectedCandidateForEval] = useState(null);
  const [evalForm, setEvalForm] = useState({
    evaluatorName: 'Tech Lead / Panel Member',
    problemSolving: 8,
    technicalDepth: 8,
    communication: 8,
    culturalFit: 8,
    recommendation: 'Advance to Next Round',
    feedbackNotes: ''
  });

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    role: 'Student', // 'Student', 'TPO', 'Faculty', 'Company'
    author: getCurrentUser()?.name || '',
    companyName: '',
    driveName: 'Campus Hiring Drive 2026',
    rating: 5,
    roundDiscussed: 'Technical Interview',
    feedback: ''
  });

  const [activeFeedbackRole, setActiveFeedbackRole] = useState('All');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');
  const csvInputRef = useRef(null);
  const [candidateImport, setCandidateImport] = useState(null);
  const [candidateImportError, setCandidateImportError] = useState('');
  const [candidateImportSuccess, setCandidateImportSuccess] = useState('');

  // Check backend connectivity on mount and sync candidates if backend has records
  useEffect(() => {
    let isMounted = true;
    WorkflowApi.getCandidates().then(serverCandidates => {
      if (isMounted && Array.isArray(serverCandidates) && serverCandidates.length > 0) {
        // Map backend candidate models to frontend pipeline structure
        const mapped = serverCandidates.map(c => ({
          id: c.candidateId,
          name: c.name,
          email: c.email,
          college: c.college,
          branch: c.branch,
          batch: c.batch,
          companyId: c.companyId,
          companyName: c.companyName,
          currentRound: c.currentRound,
          status: c.status,
          scores: {
            aptitude: c.aptitudeScore,
            technical: c.technicalScore,
            managerial: c.managerialScore,
            hr: c.hrScore
          },
          evaluator: c.evaluator,
          notes: c.notes,
          lastUpdated: c.lastUpdated
        }));
        setCandidates(mapped);
      }
    }).catch(() => {
      // Offline fallback already loaded via localStorage/initialData
    });
    return () => { isMounted = false; };
  }, []);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('placeprep_candidates_pipeline', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('placeprep_evaluator_records', JSON.stringify(evaluatorRecords));
  }, [evaluatorRecords]);

  useEffect(() => {
    localStorage.setItem('placeprep_stakeholder_feedback', JSON.stringify(stakeholderFeedback));
  }, [stakeholderFeedback]);

  // Candidate status actions
  const handleUpdateStatus = (candidateId, newStatus, nextRound = null) => {
    setCandidates(prev => prev.map(cand => {
      if (cand.id !== candidateId) return cand;
      const updated = {
        ...cand,
        status: newStatus,
        lastUpdated: 'Just now'
      };
      if (nextRound) {
        updated.currentRound = nextRound;
      }
      return updated;
    }));

    // Async sync to Spring Boot REST backend
    if (newStatus === 'Advanced' && nextRound) {
      WorkflowApi.advanceCandidate(candidateId, nextRound);
    } else if (newStatus === 'Eliminated') {
      WorkflowApi.eliminateCandidate(candidateId, 'Eliminated via pipeline evaluation');
    } else if (newStatus === 'Selected') {
      WorkflowApi.selectCandidate(candidateId);
    } else if (newStatus === 'Shortlisted') {
      WorkflowApi.shortlistCandidate(candidateId);
    }
  };

  const handleOpenEvaluation = (cand) => {
    setSelectedCandidateForEval(cand);
    setEvalForm({
      evaluatorName: cand.evaluator || 'Evaluator Panel',
      problemSolving: 8,
      technicalDepth: 8,
      communication: 8,
      culturalFit: 8,
      recommendation: 'Advance to Next Round',
      feedbackNotes: ''
    });
    setIsEvaluationModalOpen(true);
  };

  const handleSubmitEvaluation = (e) => {
    e.preventDefault();
    if (!selectedCandidateForEval) return;

    const newRecord = {
      id: `eval-${Date.now()}`,
      candidateId: selectedCandidateForEval.id,
      candidateName: selectedCandidateForEval.name,
      companyName: selectedCandidateForEval.companyName,
      round: SELECTION_ROUNDS.find(r => r.id === selectedCandidateForEval.currentRound)?.name || 'Interview Round',
      evaluatorName: evalForm.evaluatorName,
      date: new Date().toISOString().split('T')[0],
      rubrics: {
        problemSolving: Number(evalForm.problemSolving),
        technicalDepth: Number(evalForm.technicalDepth),
        communication: Number(evalForm.communication),
        culturalFit: Number(evalForm.culturalFit)
      },
      recommendation: evalForm.recommendation,
      feedbackNotes: evalForm.feedbackNotes || 'Evaluation completed and recorded in candidate audit trail.'
    };

    setEvaluatorRecords([newRecord, ...evaluatorRecords]);

    // Send evaluation to backend API
    WorkflowApi.submitEvaluation(selectedCandidateForEval.id, {
      evaluatorName: evalForm.evaluatorName,
      problemSolving: Number(evalForm.problemSolving),
      technicalDepth: Number(evalForm.technicalDepth),
      communication: Number(evalForm.communication),
      culturalFit: Number(evalForm.culturalFit),
      recommendation: evalForm.recommendation,
      feedbackNotes: evalForm.feedbackNotes
    });

    // Update candidate status based on recommendation
    if (evalForm.recommendation === 'Advance to Next Round') {
      const roundOrder = ['aptitude', 'technical', 'managerial', 'hr'];
      const currentIndex = roundOrder.indexOf(selectedCandidateForEval.currentRound);
      if (currentIndex < roundOrder.length - 1) {
        handleUpdateStatus(selectedCandidateForEval.id, 'Advanced', roundOrder[currentIndex + 1]);
      } else {
        handleUpdateStatus(selectedCandidateForEval.id, 'Selected');
      }
    } else if (evalForm.recommendation === 'Eliminate') {
      handleUpdateStatus(selectedCandidateForEval.id, 'Eliminated');
    } else if (evalForm.recommendation === 'Final Select') {
      handleUpdateStatus(selectedCandidateForEval.id, 'Selected');
    }

    setIsEvaluationModalOpen(false);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackForm.feedback.trim()) return;

    const newFb = {
      id: `fb-role-${Date.now()}`,
      role: feedbackForm.role,
      author: feedbackForm.author || `${feedbackForm.role} Representative`,
      companyName: feedbackForm.companyName || 'General',
      driveName: feedbackForm.driveName || 'Placement Season 2026',
      rating: Number(feedbackForm.rating),
      roundDiscussed: feedbackForm.roundDiscussed,
      feedback: feedbackForm.feedback,
      date: new Date().toISOString().split('T')[0]
    };

    setStakeholderFeedback([newFb, ...stakeholderFeedback]);
    setFeedbackForm(prev => ({ ...prev, feedback: '' }));
    setIsFeedbackModalOpen(false);

    // Sync to backend feedback API
    WorkflowApi.submitStakeholderFeedback({
      feedbackId: newFb.id,
      category: `${newFb.role} Feedback`,
      message: `${newFb.author} (${newFb.companyName} / ${newFb.roundDiscussed}): ${newFb.feedback}`,
      rating: newFb.rating,
      batch: '2028',
      date: newFb.date
    });

    setFeedbackSuccessMsg('Thank you! Feedback recorded into Placement Cell system and synchronized with Backend API.');
    setTimeout(() => setFeedbackSuccessMsg(''), 4000);
  };

  const handleWorkflowTabSelect = (tabId) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const target = document.getElementById(`workflow-tab-${tabId}`) || document.getElementById('workflow-module-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const handleCandidateCsvSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setCandidateImportError('');
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCandidateImportError('Please choose a CSV file. You can download the template to see the expected columns.');
      return;
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      const parsedRows = rawRows.map((row, index) => normaliseCandidateRow(row, index + 2));
      const validRows = parsedRows.filter((row) => row.isValid);
      const invalidRows = parsedRows.filter((row) => !row.isValid);
      if (!validRows.length) {
        setCandidateImportError('No usable candidate rows found. Include at least a Name column with a value.');
        return;
      }
      setCandidateImport({ fileName: file.name, validRows, invalidRows });
    } catch {
      setCandidateImportError('We could not read this CSV. Please save it as a standard comma-separated .csv file and try again.');
    }
  };

  const commitCandidateImport = () => {
    if (!candidateImport) return;
    let added = 0;
    let updated = 0;
    setCandidates((current) => {
      const next = [...current];
      candidateImport.validRows.forEach(({ candidate }) => {
        const existingIndex = next.findIndex((item) =>
          (candidate.email && item.email?.toLowerCase() === candidate.email.toLowerCase()) || item.id === candidate.id
        );
        if (existingIndex >= 0) {
          next[existingIndex] = { ...next[existingIndex], ...candidate, scores: { ...next[existingIndex].scores, ...candidate.scores } };
          updated += 1;
        } else {
          next.unshift(candidate);
          added += 1;
        }
      });
      return next;
    });
    setCandidateImportSuccess(`${added} candidate${added === 1 ? '' : 's'} added${updated ? ` and ${updated} updated` : ''} in the selection pipeline.`);
    setCandidateImport(null);
    window.setTimeout(() => setCandidateImportSuccess(''), 5000);
  };

  const downloadCandidateCsvTemplate = () => {
    const headers = ['name', 'email', 'college', 'branch', 'batch', 'companyName', 'currentRound', 'status', 'evaluator', 'aptitude', 'technical', 'managerial', 'hr', 'notes'];
    const csv = [headers].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'placeprep-candidate-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(cand => {
    const matchesRound = selectedRoundFilter === 'all' || cand.currentRound === selectedRoundFilter;
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !q ||
      cand.name.toLowerCase().includes(q) ||
      cand.college.toLowerCase().includes(q) ||
      cand.companyName.toLowerCase().includes(q) ||
      cand.status.toLowerCase().includes(q);
    return matchesRound && matchesSearch;
  });

  // Filter evaluator records
  const filteredEvaluatorRecords = evaluatorRecords.filter(rec => {
    const q = (evalSearchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (rec.candidateName || '').toLowerCase().includes(q) ||
      (rec.companyName || '').toLowerCase().includes(q) ||
      (rec.evaluatorName || '').toLowerCase().includes(q) ||
      (rec.round || '').toLowerCase().includes(q) ||
      (rec.feedbackNotes || '').toLowerCase().includes(q) ||
      (rec.recommendation || '').toLowerCase().includes(q)
    );
  });

  // Filter feedback by role & search
  const filteredFeedbackList = stakeholderFeedback.filter(fb => {
    const matchRole = activeFeedbackRole === 'All' || fb.role.toLowerCase() === activeFeedbackRole.toLowerCase();
    const q = (feedbackSearchQuery || '').trim().toLowerCase();
    const matchQuery = !q ||
      (fb.author || '').toLowerCase().includes(q) ||
      (fb.companyName || '').toLowerCase().includes(q) ||
      (fb.roundDiscussed || '').toLowerCase().includes(q) ||
      (fb.feedback || '').toLowerCase().includes(q);
    return matchRole && matchQuery;
  });

  // All questions for question bank view
  const allQuestions = getInterviewQuestions();

  const filteredWorkflowQuestions = allQuestions.filter(q => {
    const query = (questionSearchQuery || '').trim().toLowerCase();
    if (!query) return true;
    return (
      (q.question || '').toLowerCase().includes(query) ||
      (q.companyId || '').toLowerCase().includes(query) ||
      (q.category || '').toLowerCase().includes(query) ||
      (q.round || '').toLowerCase().includes(query)
    );
  });
  const workflowSections = [
    { id: 'pipeline', label: 'Selection Pipeline', icon: Users, badge: `${candidates.length} candidates`, description: 'Live candidate decisions' },
    { id: 'engine', label: '4-Round Interview Engine', icon: Layers, badge: '4 rounds', description: 'Configure the process' },
    { id: 'evaluations', label: 'Evaluator Records', icon: ClipboardCheck, badge: `${evaluatorRecords.length} reviews`, description: 'Scorecards & rubrics' },
    { id: 'questions', label: 'Question Knowledge Base', icon: Briefcase, badge: `${allQuestions.length} questions`, description: 'Round-wise preparation' },
    { id: 'feedback', label: 'Stakeholder Feedback', icon: MessageSquare, badge: `${stakeholderFeedback.length} reviews`, description: 'TPO, faculty & company' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selected</span>;
      case 'Advanced':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1"><ArrowRight className="w-3 h-3 text-indigo-600" /> Advanced</span>;
      case 'Shortlisted':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"><Clock className="w-3 h-3 text-amber-600" /> Shortlisted</span>;
      case 'Eliminated':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" /> Eliminated</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <BackNavButton onNavigate={onNavigate} onBack={onBack} fallbackRoute="placement-portal" label="Back to Placement Portal" />
          <span className="text-xs font-semibold text-slate-500">Corporate Selection Pipeline</span>
        </div>

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-lg p-6 sm:p-10 text-white shadow-xs relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <ClipboardCheck className="w-96 h-96" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold mb-4 border border-indigo-400/30">
              <Shield className="w-3.5 h-3.5" />
              End-to-End Placement Support Architecture
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Interview Rounds & Selection Workflow
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Manage the comprehensive placement lifecycle across 4 evaluation stages: Aptitude, Technical, Managerial,
              and HR rounds. Track candidate advancement, record evaluator rubrics, audit round-wise candidate lists,
              and coordinate multi-stakeholder feedback across Students, TPOs, Faculty, and Companies.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div>
                <span className="text-2xl font-bold text-white">4 Stages</span>
                <p className="text-xs text-slate-400">Aptitude to HR</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-indigo-400">{candidates.length} Candidates</span>
                <p className="text-xs text-slate-400">Active in Pipeline</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-400">
                  {candidates.filter(c => c.status === 'Selected').length} Selected
                </span>
                <p className="text-xs text-slate-400">Final Offers Made</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-amber-400">{stakeholderFeedback.length} Reviews</span>
                <p className="text-xs text-slate-400">Student & Recruiter Feedback</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {feedbackSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{feedbackSuccessMsg}</span>
          </div>
        )}
        {candidateImportSuccess && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />{candidateImportSuccess}
          </div>
        )}

        {/* Visual workflow navigation */}
        <PortalModuleCards items={workflowSections} activeId={activeTab} onSelect={handleWorkflowTabSelect} tone="indigo" />

        <div id="workflow-module-content" className="scroll-mt-24">
        {/* TAB 1: CANDIDATE SELECTION PIPELINE */}
        {activeTab === 'pipeline' && (
          <div id="workflow-tab-pipeline" className="space-y-6 scroll-mt-24">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter by Round:
                </span>
                {['all', 'aptitude', 'technical', 'managerial', 'hr'].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRoundFilter(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                      selectedRoundFilter === r
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {r === 'all' ? 'All Rounds' : `${r} Round`}
                  </button>
                ))}
              </div>

              <div className="flex w-full items-center gap-2 md:w-auto">
                <div className="flex-1 md:w-72">
                  <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    placeholder="Search candidate, college, company..."
                    size="sm"
                    resultCount={filteredCandidates.length}
                    totalCount={candidates.length}
                  />
                </div>
                <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleCandidateCsvSelect} className="hidden" />
                <button type="button" onClick={() => csvInputRef.current?.click()} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 cursor-pointer"><Upload className="h-3.5 w-3.5" />Import CSV</button>
              </div>
            </div>

            {candidateImportError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{candidateImportError}</div>}

            {/* Candidate decision cards */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_35px_-27px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-1 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" /><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">Live decision board</span></div>
                  <h3 className="text-lg font-black tracking-tight text-slate-950">Candidate selection roster</h3>
                  <p className="mt-1 text-xs text-slate-500">Review scores, evidence, and the next decision without losing candidate context.</p>
                </div>
                <span className="w-fit rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">{filteredCandidates.length} of {candidates.length} candidates</span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {filteredCandidates.map((cand) => {
                  const currentRoundObj = SELECTION_ROUNDS.find(r => r.id === cand.currentRound);
                  const roundIndex = Math.max(0, SELECTION_ROUNDS.findIndex(r => r.id === cand.currentRound));
                  const initials = cand.name.split(' ').map((name) => name[0]).slice(0, 2).join('');

                  return (
                    <article key={cand.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_18px_30px_-22px_rgba(49,46,129,0.45)]">
                      <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/60 px-4 py-3.5">
                        <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-xs font-black text-white shadow-lg shadow-indigo-200">{initials}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="truncate text-sm font-black text-slate-950">{cand.name}</h4>{getStatusBadge(cand.status)}</div><p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{cand.branch} · {cand.batch} batch</p></div></div>
                        <span className="rounded-lg border border-indigo-100 bg-white px-2 py-1 text-[10px] font-bold text-indigo-700 shadow-sm">{cand.companyName}</span>
                      </div>
                      <div className="space-y-4 p-4">
                        <div className="flex items-center justify-between gap-3 text-xs"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current stage</p><p className="mt-0.5 font-bold text-indigo-700">{currentRoundObj?.name || cand.currentRound}</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last updated</p><p className="mt-0.5 font-semibold text-slate-600">{cand.lastUpdated}</p></div></div>
                        <div className="flex gap-1.5">{SELECTION_ROUNDS.map((round, index) => <span key={round.id} title={round.name} className={`h-1.5 flex-1 rounded-full ${index <= roundIndex ? 'bg-indigo-500' : 'bg-slate-100'}`} />)}</div>
                        <div className="grid grid-cols-4 gap-1.5">{[['Apt', cand.scores.aptitude], ['Tech', cand.scores.technical], ['Mgr', cand.scores.managerial], ['HR', cand.scores.hr]].map(([label, score]) => <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-1.5 text-center"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 text-sm font-black text-slate-800">{score || '—'}</p></div>)}</div>
                        <div className="border-l-2 border-indigo-200 bg-indigo-50/50 px-3 py-2 text-[11px] leading-4 text-slate-600"><span className="font-bold text-slate-700">Evaluator:</span> {cand.evaluator || 'Awaiting allocation'}<span className="mx-1.5 text-indigo-300">·</span>{cand.college}</div>
                        {cand.notes && <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] italic leading-4 text-slate-600">“{cand.notes}”</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3"><button onClick={() => handleOpenEvaluation(cand)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-indigo-700"><ClipboardCheck className="h-3.5 w-3.5" />Evaluate</button>{cand.status !== 'Selected' && cand.status !== 'Eliminated' && <><button onClick={() => handleUpdateStatus(cand.id, 'Advanced')} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100">Advance</button><button onClick={() => handleUpdateStatus(cand.id, 'Eliminated')} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100">Eliminate</button></>}</div>
                    </article>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: 4-ROUND INTERVIEW ENGINE */}
        {activeTab === 'engine' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Standardized 4-Round Selection Engine</h3>
              <p className="text-xs text-slate-500 max-w-2xl">
                The core interview engine models real-world hiring tracks at IT majors and differentials (HCLTech, TCS, Accenture, Deloitte).
                Each round implements clear criteria, automated cutoffs, and elimination rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SELECTION_ROUNDS.map(round => (
                <div key={round.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
                        {round.badge}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {round.duration}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-slate-900">{round.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{round.description}</p>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block">Cutoff Requirement</span>
                        <span className="font-bold text-slate-800">{round.cutoffScore}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Elimination Filter</span>
                        <span className="font-bold text-rose-600">{round.eliminationRate}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block">Evaluator Role</span>
                        <span className="font-semibold text-slate-700">{round.evaluatorRole}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Evaluation Rubric</h5>
                      <ul className="space-y-1">
                        {round.criteria.map((c, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedRoundFilter(round.id);
                        setActiveTab('pipeline');
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      View candidates in this round <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onNavigate('mock-interview')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                    >
                      Practice Mock Round
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EVALUATOR RECORDS & RUBRICS */}
        {activeTab === 'evaluations' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Evaluator Rubrics & Audit Trail</h3>
                <p className="text-xs text-slate-500">Official scorecard archives filled by technical leads, managers, and HR panels.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <SearchBar
                    value={evalSearchQuery}
                    onChange={(e) => setEvalSearchQuery(e.target.value)}
                    onClear={() => setEvalSearchQuery('')}
                    placeholder="Search candidate, evaluator, role..."
                    size="sm"
                    resultCount={filteredEvaluatorRecords.length}
                    totalCount={evaluatorRecords.length}
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedCandidateForEval(candidates[0]);
                    setIsEvaluationModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Record New Evaluation
                </button>
              </div>
            </div>

            {filteredEvaluatorRecords.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No evaluation scorecards matched "{evalSearchQuery.trim()}".</p>
                <button
                  onClick={() => setEvalSearchQuery('')}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvaluatorRecords.map((rec) => (
                <div key={rec.id} className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                        {rec.companyName}
                      </span>
                      <span className="text-xs text-slate-400">{rec.date}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{rec.candidateName}</h4>
                    <p className="text-xs text-slate-500">{rec.round} • Evaluator: {rec.evaluatorName}</p>

                    {/* Rubrics breakdown */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Problem Solving</span>
                        <span className="font-bold text-slate-800">{rec.rubrics.problemSolving} / 10</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Technical Depth</span>
                        <span className="font-bold text-slate-800">{rec.rubrics.technicalDepth} / 10</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Communication</span>
                        <span className="font-bold text-slate-800">{rec.rubrics.communication} / 10</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Cultural Fit</span>
                        <span className="font-bold text-slate-800">{rec.rubrics.culturalFit} / 10</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 leading-relaxed italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/60">
                      "{rec.feedbackNotes}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Recommendation:</span>
                    <span className={`font-bold ${
                      rec.recommendation.includes('Advance') ? 'text-indigo-600' :
                      rec.recommendation.includes('Eliminate') ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {rec.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* TAB 4: ROUND-WISE QUESTION KNOWLEDGE BASE */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Round-Wise Interview Question Knowledge Base</h3>
                <p className="text-xs text-slate-500">Complete catalog of verified questions mapped to Aptitude, Technical, Managerial, and HR rounds.</p>
              </div>

              <button
                onClick={() => onNavigate('prep')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                Open Full Preparation Hub <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-full">
              <SearchBar
                value={questionSearchQuery}
                onChange={(e) => setQuestionSearchQuery(e.target.value)}
                onClear={() => setQuestionSearchQuery('')}
                placeholder="Search questions by text, company, category, or round..."
                resultCount={filteredWorkflowQuestions.length}
                totalCount={allQuestions.length}
                ariaLabel="Search interview questions"
              />
            </div>

            {filteredWorkflowQuestions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No questions matched "{questionSearchQuery.trim()}".</p>
                <button
                  onClick={() => setQuestionSearchQuery('')}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWorkflowQuestions.map(q => (
                  <div
                    key={q.id}
                    onClick={() => onSelectQuestion && onSelectQuestion(q)}
                    className="p-5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold uppercase">
                            {q.companyId}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold uppercase">
                            {q.round} Round
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-xs">
                            {q.category}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">{q.frequencyScore}% freq</span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Reported {q.timesReported} times</span>
                      <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Practice <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MULTI-STAKEHOLDER FEEDBACK SYSTEM */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Multi-Stakeholder Feedback System</h3>
                <p className="text-xs text-slate-500">Collects and analyzes transparent feedback from Students, TPO Placement Cell, Faculty, and Company Recruiters.</p>
              </div>

              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Submit Stakeholder Feedback
              </button>
            </div>

            {/* Role Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex gap-2 pb-1 overflow-x-auto">
                {['All', 'Student', 'TPO', 'Faculty', 'Company'].map(role => (
                  <button
                    key={role}
                    onClick={() => setActiveFeedbackRole(role)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                      activeFeedbackRole === role
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {role} Reviews
                  </button>
                ))}
              </div>
              <div className="sm:w-72">
                <SearchBar
                  value={feedbackSearchQuery}
                  onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                  onClear={() => setFeedbackSearchQuery('')}
                  placeholder="Search feedback..."
                  resultCount={filteredFeedbackList.length}
                  totalCount={stakeholderFeedback.length}
                  size="sm"
                  ariaLabel="Search stakeholder feedback"
                />
              </div>
            </div>

            {/* Feedback Cards */}
            {filteredFeedbackList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No reviews found matching the current criteria.</p>
                {(feedbackSearchQuery || activeFeedbackRole !== 'All') && (
                  <button
                    onClick={() => {
                      setFeedbackSearchQuery('');
                      setActiveFeedbackRole('All');
                    }}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                  >
                    Reset Filters & Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFeedbackList.map(item => (
                <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.role === 'Student' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        item.role === 'TPO' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        item.role === 'Faculty' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.role} Feedback
                      </span>

                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{item.author}</h4>
                      <p className="text-xs text-slate-500">{item.companyName} • {item.driveName}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                      <span className="font-semibold text-slate-500 block mb-1">Focus Area: {item.roundDiscussed}</span>
                      <p className="leading-relaxed italic">"{item.feedback}"</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
                    <span>Verified Stakeholder Audit</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}
        </div>

      </div>

      {/* EVALUATION FORM MODAL */}
      {isEvaluationModalOpen && selectedCandidateForEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Interview Evaluation Form</h3>
                <p className="text-xs text-slate-500">
                  Candidate: <strong className="text-indigo-600">{selectedCandidateForEval.name}</strong> • {selectedCandidateForEval.companyName}
                </p>
              </div>
              <button
                onClick={() => setIsEvaluationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Evaluator Name / Role</label>
                <input
                  type="text"
                  value={evalForm.evaluatorName}
                  onChange={e => setEvalForm({ ...evalForm, evaluatorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Rubric Sliders (1-10) */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">Evaluation Rubric (Score 1 - 10)</span>
                
                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Problem Solving & Algorithms</span>
                    <span className="font-bold text-indigo-600">{evalForm.problemSolving}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evalForm.problemSolving}
                    onChange={e => setEvalForm({ ...evalForm, problemSolving: e.target.value })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Technical Depth & Core CS</span>
                    <span className="font-bold text-indigo-600">{evalForm.technicalDepth}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evalForm.technicalDepth}
                    onChange={e => setEvalForm({ ...evalForm, technicalDepth: e.target.value })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Communication & Thought Articulation</span>
                    <span className="font-bold text-indigo-600">{evalForm.communication}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evalForm.communication}
                    onChange={e => setEvalForm({ ...evalForm, communication: e.target.value })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Cultural & Value Fit</span>
                    <span className="font-bold text-indigo-600">{evalForm.culturalFit}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={evalForm.culturalFit}
                    onChange={e => setEvalForm({ ...evalForm, culturalFit: e.target.value })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Evaluator Recommendation</label>
                <select
                  value={evalForm.recommendation}
                  onChange={e => setEvalForm({ ...evalForm, recommendation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="Advance to Next Round">✓ Advance to Next Round</option>
                  <option value="Put on Hold">⏸ Put on Hold / Waitlist</option>
                  <option value="Eliminate">✕ Eliminate from Process</option>
                  <option value="Final Select">★ Final Select / Release Offer</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Evaluation Notes & Feedback</label>
                <textarea
                  rows="3"
                  value={evalForm.feedbackNotes}
                  onChange={e => setEvalForm({ ...evalForm, feedbackNotes: e.target.value })}
                  placeholder="e.g. Demonstrated exceptional knowledge in Java Collections and SQL joins. Clear explanations."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition"
                >
                  Save & Record Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAKEHOLDER FEEDBACK MODAL */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Submit Placement Stakeholder Feedback</h3>
                <p className="text-xs text-slate-500">Provide verified feedback as Student, TPO, Faculty, or Company.</p>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stakeholder Role</label>
                  <select
                    value={feedbackForm.role}
                    onChange={e => setFeedbackForm({ ...feedbackForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Student">Student</option>
                    <option value="TPO">TPO (Placement Cell)</option>
                    <option value="Faculty">Faculty Coordinator</option>
                    <option value="Company">Company Recruiter</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Author Name / Designation</label>
                  <input
                    type="text"
                    value={feedbackForm.author}
                    onChange={e => setFeedbackForm({ ...feedbackForm, author: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={feedbackForm.companyName}
                    onChange={e => setFeedbackForm({ ...feedbackForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Focus Round / Workflow</label>
                  <input
                    type="text"
                    value={feedbackForm.roundDiscussed}
                    onChange={e => setFeedbackForm({ ...feedbackForm, roundDiscussed: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Technical Interview / Workflow"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Overall Rating (1 - 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: val })}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                        feedbackForm.rating >= val
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${feedbackForm.rating >= val ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Feedback Comments & Action Items</label>
                <textarea
                  rows="4"
                  value={feedbackForm.feedback}
                  onChange={e => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                  placeholder="Share details on candidate quality, round difficulty, coordination efficiency, or platform improvements..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV candidate import review */}
      {candidateImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-700 to-violet-700 px-6 py-5 text-white"><div className="flex items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-100"><FileSpreadsheet className="h-4 w-4" />CSV CANDIDATE IMPORT</div><h3 className="text-xl font-black">Review data before auto-entry</h3><p className="mt-1 text-xs text-indigo-100">{candidateImport.fileName}</p></div><button type="button" onClick={() => setCandidateImport(null)} className="rounded-lg bg-white/10 px-2 py-1 text-sm font-bold hover:bg-white/20">×</button></div></div>
            <div className="space-y-5 p-6"><div className="grid grid-cols-3 gap-3"><div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Ready</p><p className="mt-1 text-2xl font-black text-indigo-900">{candidateImport.validRows.length}</p></div><div className="rounded-2xl border border-rose-100 bg-rose-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Skipped</p><p className="mt-1 text-2xl font-black text-rose-900">{candidateImport.invalidRows.length}</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Import type</p><p className="mt-2 text-xs font-bold text-slate-700">Add or update</p></div></div>
              <div className="overflow-hidden rounded-2xl border border-slate-200"><div className="grid grid-cols-[1.25fr_1fr_0.85fr] bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>Candidate</span><span>Company</span><span>Current round</span></div><div className="max-h-48 overflow-y-auto divide-y divide-slate-100">{candidateImport.validRows.slice(0, 8).map(({ candidate }) => <div key={candidate.id} className="grid grid-cols-[1.25fr_1fr_0.85fr] px-4 py-3 text-xs"><div><p className="font-bold text-slate-800">{candidate.name}</p><p className="truncate text-[10px] text-slate-400">{candidate.email || 'No email supplied'}</p></div><span className="font-semibold text-indigo-700">{candidate.companyName}</span><span className="capitalize text-slate-600">{candidate.currentRound}</span></div>)}</div></div>
              {candidateImport.validRows.length > 8 && <p className="text-center text-[11px] font-medium text-slate-400">+ {candidateImport.validRows.length - 8} more candidate rows ready to add</p>}
              {candidateImport.invalidRows.length > 0 && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">Rows without a candidate name are skipped automatically.</p>}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between"><button type="button" onClick={downloadCandidateCsvTemplate} className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"><Download className="h-3.5 w-3.5" />Download template</button><div className="flex gap-2"><button type="button" onClick={() => setCandidateImport(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button type="button" onClick={commitCandidateImport} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700">Import {candidateImport.validRows.length} candidate records</button></div></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function normaliseCandidateRow(row, rowNumber) {
  const values = Object.entries(row).reduce((result, [key, value]) => {
    result[String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '')] = String(value ?? '').trim();
    return result;
  }, {});
  const read = (...aliases) => aliases.map((alias) => values[alias]).find(Boolean) || '';
  const name = read('name', 'candidatename', 'studentname', 'fullname');
  const email = read('email', 'emailaddress');
  const candidate = {
    id: read('id', 'candidateid') || `csv-${Date.now()}-${rowNumber}`,
    name,
    email,
    college: read('college', 'university', 'institute') || 'Not specified',
    branch: read('branch', 'department', 'course') || 'Not specified',
    batch: read('batch', 'graduationbatch', 'year') || 'Not specified',
    companyId: read('companyid') || 'imported-company',
    companyName: read('companyname', 'company', 'organisation', 'organization') || 'General placement drive',
    currentRound: normaliseRound(read('currentround', 'round', 'stage')),
    status: read('status') || 'Shortlisted',
    evaluator: read('evaluator', 'evaluatorname') || 'Awaiting allocation',
    scores: {
      aptitude: read('aptitude', 'aptitudescore'),
      technical: read('technical', 'technicalscore', 'tech'),
      managerial: read('managerial', 'managerialscore', 'mgr'),
      hr: read('hr', 'hrscore'),
    },
    notes: read('notes', 'feedback', 'remarks'),
    lastUpdated: 'Imported just now',
  };
  return { rowNumber, isValid: Boolean(name), candidate };
}

function normaliseRound(value) {
  const round = value.toLowerCase();
  if (round.startsWith('apt')) return 'aptitude';
  if (round.startsWith('tech')) return 'technical';
  if (round.startsWith('man') || round.startsWith('mgr')) return 'managerial';
  if (round.startsWith('hr')) return 'hr';
  return 'aptitude';
}
