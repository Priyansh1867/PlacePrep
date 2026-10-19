import React, { useState, useEffect } from 'react';
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
  Briefcase
} from 'lucide-react';
import {
  SELECTION_ROUNDS,
  INITIAL_CANDIDATES_PIPELINE,
  INITIAL_EVALUATOR_RECORDS,
  INITIAL_STAKEHOLDER_FEEDBACK
} from '../data/selectionWorkflowData';
import { getCompanies, getInterviewQuestions } from '../services/storage';
import { WorkflowApi } from '../services/api';

export default function SelectionWorkflowPage({ onNavigate, onSelectQuestion }) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline', 'engine', 'evaluations', 'feedback', 'questions'
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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
    author: 'Priyansh Jain (2028 Batch)',
    companyName: 'HCLTech',
    driveName: 'Campus Hiring Drive 2026',
    rating: 5,
    roundDiscussed: 'Technical Interview',
    feedback: ''
  });

  const [activeFeedbackRole, setActiveFeedbackRole] = useState('All');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

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

  // Filter candidates
  const filteredCandidates = candidates.filter(cand => {
    const matchesRound = selectedRoundFilter === 'all' || cand.currentRound === selectedRoundFilter;
    const matchesSearch = !searchQuery.trim() ||
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRound && matchesSearch;
  });

  // Filter feedback by role
  const filteredFeedbackList = stakeholderFeedback.filter(fb =>
    activeFeedbackRole === 'All' || fb.role.toLowerCase() === activeFeedbackRole.toLowerCase()
  );

  // All questions for question bank view
  const allQuestions = getInterviewQuestions();

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
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <ClipboardCheck className="w-96 h-96" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold mb-4 border border-indigo-400/30">
              <Shield className="w-3.5 h-3.5" />
              End-to-End Placement Support Architecture
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
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
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{feedbackSuccessMsg}</span>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'pipeline', label: 'Candidate Selection Pipeline', icon: Users, badge: candidates.length },
            { id: 'engine', label: '4-Round Interview Engine', icon: Layers, badge: '4 Rounds' },
            { id: 'evaluations', label: 'Evaluator Records & Rubrics', icon: ClipboardCheck, badge: evaluatorRecords.length },
            { id: 'questions', label: 'Round-Wise Question Knowledge Base', icon: Briefcase, badge: allQuestions.length },
            { id: 'feedback', label: 'Multi-Stakeholder Feedback', icon: MessageSquare, badge: stakeholderFeedback.length },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: CANDIDATE SELECTION PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
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

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate, college, company..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Candidate Pipeline Cards / Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Round-Wise Candidate Roster</h3>
                  <p className="text-xs text-slate-500">Live shortlisting, elimination, advancement, and final selection audit records.</p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredCandidates.map((cand) => {
                  const currentRoundObj = SELECTION_ROUNDS.find(r => r.id === cand.currentRound);

                  return (
                    <div key={cand.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{cand.name}</h4>
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                            {cand.companyName}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {cand.branch} • {cand.batch} Batch
                          </span>
                          {getStatusBadge(cand.status)}
                        </div>

                        <p className="text-xs text-slate-500">{cand.college} • {cand.email}</p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          <span className="text-slate-600">
                            Current Stage: <span className="font-semibold text-indigo-600">{currentRoundObj?.name || cand.currentRound}</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            Evaluator: <span className="text-slate-700 font-medium">{cand.evaluator}</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">Updated {cand.lastUpdated}</span>
                        </div>

                        {cand.notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                            "{cand.notes}"
                          </p>
                        )}
                      </div>

                      {/* Right: Scores & Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-end lg:self-auto">
                        {/* Scores summary */}
                        <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="text-slate-500 font-medium">Apt: <strong className="text-slate-800">{cand.scores.aptitude || '-'}</strong></span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500 font-medium">Tech: <strong className="text-slate-800">{cand.scores.technical || '-'}</strong></span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500 font-medium">Mgr: <strong className="text-slate-800">{cand.scores.managerial || '-'}</strong></span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500 font-medium">HR: <strong className="text-slate-800">{cand.scores.hr || '-'}</strong></span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEvaluation(cand)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition flex items-center gap-1"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" /> Evaluate
                          </button>

                          {cand.status !== 'Selected' && cand.status !== 'Eliminated' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(cand.id, 'Advanced')}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                                title="Advance to Next Stage"
                              >
                                Advance
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(cand.id, 'Eliminated')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition"
                                title="Mark as Eliminated"
                              >
                                Eliminate
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: 4-ROUND INTERVIEW ENGINE */}
        {activeTab === 'engine' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Standardized 4-Round Selection Engine</h3>
              <p className="text-xs text-slate-500 max-w-2xl">
                The core interview engine models real-world hiring tracks at IT majors and differentials (HCLTech, TCS, Accenture, Deloitte).
                Each round implements clear criteria, automated cutoffs, and elimination rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SELECTION_ROUNDS.map(round => (
                <div key={round.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
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

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
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
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Evaluator Rubrics & Audit Trail</h3>
                <p className="text-xs text-slate-500">Official scorecard archives filled by technical leads, managers, and HR panels.</p>
              </div>

              <button
                onClick={() => {
                  setSelectedCandidateForEval(candidates[0]);
                  setIsEvaluationModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Record New Evaluation
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {evaluatorRecords.map((rec) => (
                <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
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
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
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
          </div>
        )}

        {/* TAB 4: ROUND-WISE QUESTION KNOWLEDGE BASE */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Round-Wise Interview Question Knowledge Base</h3>
                <p className="text-xs text-slate-500">Complete catalog of verified questions mapped to Aptitude, Technical, Managerial, and HR rounds.</p>
              </div>

              <button
                onClick={() => onNavigate('prep')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                Open Full Preparation Hub <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allQuestions.map(q => (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion && onSelectQuestion(q)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
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
          </div>
        )}

        {/* TAB 5: MULTI-STAKEHOLDER FEEDBACK SYSTEM */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Multi-Stakeholder Feedback System</h3>
                <p className="text-xs text-slate-500">Collects and analyzes transparent feedback from Students, TPO Placement Cell, Faculty, and Company Recruiters.</p>
              </div>

              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Submit Stakeholder Feedback
              </button>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex gap-2 pb-1 overflow-x-auto">
              {['All', 'Student', 'TPO', 'Faculty', 'Company'].map(role => (
                <button
                  key={role}
                  onClick={() => setActiveFeedbackRole(role)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    activeFeedbackRole === role
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {role} Reviews
                </button>
              ))}
            </div>

            {/* Feedback Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFeedbackList.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
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

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
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
          </div>
        )}

      </div>

      {/* EVALUATION FORM MODAL */}
      {isEvaluationModalOpen && selectedCandidateForEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in zoom-in-95">
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
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in zoom-in-95">
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

    </div>
  );
}
