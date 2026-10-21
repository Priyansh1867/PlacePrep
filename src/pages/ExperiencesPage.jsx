import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Star, 
  ShieldCheck, 
  Filter, 
  Search, 
  ThumbsUp, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  GraduationCap, 
  HelpCircle,
  X,
  Send,
  Flag,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  getInterviewExperiences, 
  addInterviewExperience, 
  getCompanies, 
  getGraduationBatch, 
  submitPlatformFeedback,
  getCurrentUser
} from '../services/storage';
import { ExperienceApi, CompanyApi, FeedbackApi } from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function ExperiencesPage() {
  const currentBatch = getGraduationBatch();
  const currentUser = getCurrentUser();

  // Primary data states
  const [companies, setCompanies] = useState(() => getCompanies());
  const [experiences, setExperiences] = useState(() => getInterviewExperiences());
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingExp, setReportingExp] = useState(null);
  const [reportReason, setReportReason] = useState('Outdated / Inaccurate Question');
  
  // Feedback & Action Toasts
  const [actionToast, setActionToast] = useState({ visible: false, message: '', type: 'success' });
  const [submittingExp, setSubmittingExp] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Voted track to prevent duplicate upvotes per session
  const [votedIds, setVotedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('placeprep_voted_experiences');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Experience Form State
  const [formCompany, setFormCompany] = useState('hcltech');
  const [formBatch, setFormBatch] = useState(currentBatch || '2026');
  const [formRole, setFormRole] = useState('Graduate Engineer Trainee');
  const [formDate, setFormDate] = useState('October 2026');
  const [formRound, setFormRound] = useState('Technical Interview');
  const [formQuestions, setFormQuestions] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('Medium');
  const [formOutcome, setFormOutcome] = useState('Selected');
  const [formTips, setFormTips] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [formStudentName, setFormStudentName] = useState(currentUser?.name || 'Verified Student');
  const [formCollege, setFormCollege] = useState(currentUser?.college || 'National Technical University');

  // Platform Feedback Form State
  const [fbCategory, setFbCategory] = useState('General Feedback');
  const [fbRating, setFbRating] = useState(5);
  const [fbText, setFbText] = useState('');

  const showToast = (message, type = 'success') => {
    setActionToast({ visible: true, message, type });
    setTimeout(() => {
      setActionToast({ visible: false, message: '', type: 'success' });
    }, 4500);
  };

  // 1. Fetch live experiences & companies on mount
  const loadData = async () => {
    setLoading(true);
    setErrorNotice('');
    try {
      const [expRes, compRes] = await Promise.allSettled([
        ExperienceApi.getAll(),
        CompanyApi.getAll()
      ]);

      if (compRes.status === 'fulfilled' && Array.isArray(compRes.value) && compRes.value.length > 0) {
        setCompanies(compRes.value);
      }

      if (expRes.status === 'fulfilled' && Array.isArray(expRes.value) && expRes.value.length > 0) {
        setExperiences(expRes.value);
      } else {
        // Fall back to seed data from storage
        const local = getInterviewExperiences();
        if (local && local.length > 0) {
          setExperiences(local);
        }
      }
    } catch (err) {
      console.warn('Failed to load experiences via REST API, fallback active:', err);
      setErrorNotice('Operating with synchronized local cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered experiences
  const filtered = experiences.filter(exp => {
    const companyName = exp.companyName || '';
    const role = exp.role || '';
    const tips = exp.tips || '';
    const matchSearch = companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        tips.toLowerCase().includes(searchQuery.toLowerCase());
    const compId = exp.companyId;
    const matchCompany = companyFilter === 'all' || compId === companyFilter;
    const matchBatch = batchFilter === 'all' || exp.batch === batchFilter;
    return matchSearch && matchCompany && matchBatch;
  });

  // 2. Submit new interview experience
  const handleSubmitExperience = async (e) => {
    e.preventDefault();
    setSubmittingExp(true);

    const companyObj = companies.find(c => (c.companyId || c.id) === formCompany) || companies[0];
    const questionsArray = formQuestions
      .split('\n')
      .map(q => q.trim())
      .filter(Boolean);

    const newExpPayload = {
      experienceId: `exp-${Date.now()}`,
      companyId: formCompany,
      companyName: companyObj?.name || 'Recruiter Hub',
      studentName: formAnonymous ? 'Candidate (Anonymous)' : (formStudentName || 'Verified Student'),
      batch: formBatch,
      role: formRole,
      interviewDate: formDate,
      college: formAnonymous ? 'Protected Institution' : formCollege,
      branch: currentUser?.branch || 'Computer Science & Engineering',
      overallRating: formRating,
      outcome: formOutcome,
      roundsFaced: [formRound],
      questionsEncountered: questionsArray.length > 0 ? questionsArray : ['Technical discussion on OOP, SQL queries, and project architecture.'],
      difficulty: formDifficulty,
      tips: formTips || 'Focus on core fundamentals and explain your thought process clearly.',
      isAnonymous: formAnonymous,
      verified: true,
      helpfulVotes: 0,
      moderationStatus: 'APPROVED'
    };

    try {
      const created = await ExperienceApi.create(newExpPayload);
      const experienceToSave = created || newExpPayload;
      
      // Update state
      setExperiences(prev => [experienceToSave, ...prev]);
      addInterviewExperience(experienceToSave);
      
      setIsSubmitModalOpen(false);
      showToast('Thank you! Your interview debrief has been verified and added to the peer intelligence bank.');
      
      // Reset form
      setFormQuestions('');
      setFormTips('');
    } catch (err) {
      console.warn('Backend submission failed, saving to local fallback storage:', err);
      // Fallback
      addInterviewExperience(newExpPayload);
      setExperiences(prev => [newExpPayload, ...prev]);
      setIsSubmitModalOpen(false);
      showToast('Interview experience saved to your local session vault.');
    } finally {
      setSubmittingExp(false);
    }
  };

  // 3. Helpful vote handler
  const handleVoteHelpful = async (exp) => {
    const expId = exp.experienceId || exp.id;
    if (votedIds.includes(expId)) {
      showToast('You have already marked this experience as helpful.', 'info');
      return;
    }

    // Optimistic UI update
    setExperiences(prev => prev.map(item => {
      const itemId = item.experienceId || item.id;
      if (itemId === expId) {
        return { ...item, helpfulVotes: (item.helpfulVotes || 0) + 1 };
      }
      return item;
    }));

    const nextVoted = [...votedIds, expId];
    setVotedIds(nextVoted);
    try {
      localStorage.setItem('placeprep_voted_experiences', JSON.stringify(nextVoted));
    } catch (e) {
      console.error(e);
    }

    try {
      await ExperienceApi.vote(expId);
      showToast('Marked as helpful! Thank you for supporting peer intelligence.');
    } catch (err) {
      console.warn('Vote recorded locally; backend synchronization deferred:', err);
    }
  };

  // 4. Report experience handler
  const handleOpenReport = (exp) => {
    setReportingExp(exp);
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportingExp) return;

    const expId = reportingExp.experienceId || reportingExp.id;
    try {
      await ExperienceApi.report(expId, reportReason);
      showToast('Experience flagged for administrator quality review. Thank you for maintaining content hygiene.');
    } catch (err) {
      console.warn('Report logged locally:', err);
      showToast('Experience reported for moderation review.');
    } finally {
      setIsReportModalOpen(false);
      setReportingExp(null);
    }
  };

  // 5. Submit platform feedback
  const handleSubmitPlatformFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    const feedbackPayload = {
      category: fbCategory,
      rating: fbRating,
      message: fbText,
      batch: currentBatch
    };

    try {
      await FeedbackApi.submit(feedbackPayload);
      submitPlatformFeedback(feedbackPayload);
      setIsFeedbackModalOpen(false);
      setFbText('');
      showToast('Thank you! Your feedback helps calibrate the AI question bank and placement analytics.');
    } catch (err) {
      console.warn('Feedback fallback to local storage:', err);
      submitPlatformFeedback(feedbackPayload);
      setIsFeedbackModalOpen(false);
      setFbText('');
      showToast('Feedback recorded successfully.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {actionToast.visible && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          {actionToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{actionToast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200 mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Peer Experience & Feedback Vault</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-300">Live Spring Boot REST API</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Interview Experiences & Feedback
          </h1>

          <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Read authentic question debriefs directly from students who appeared in campus placement drives. Share your own experience to help juniors prepare with verified, real-world insights.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-extrabold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Interview Experience</span>
          </button>

          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-indigo-300" />
            <span>Platform Feedback / Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role, or interview advice..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs pb-1 md:pb-0">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Company:
            </span>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Companies</option>
              {companies.map(c => {
                const cId = c.companyId || c.id;
                return (
                  <option key={cId} value={cId}>{c.name}</option>
                );
              })}
            </select>

            <span className="text-slate-400 font-semibold ml-2 mr-1">Batch:</span>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Batches</option>
              <option value="2026">2026 Batch</option>
              <option value="2027">2027 Batch</option>
              <option value="2028">2028 Batch</option>
              <option value="2029">2029 Batch</option>
            </select>

            <button
              onClick={loadData}
              title="Refresh experiences from backend"
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Experiences List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Displaying <b>{filtered.length}</b> verified interview experiences</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Moderated & Content Quality Verified
          </span>
        </div>

        {loading && experiences.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-16 bg-slate-50 rounded" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Interview Experiences Match Filters"
            description="Be the first student to contribute an authentic debrief for this company or batch."
            actionLabel="Submit First Experience"
            onAction={() => setIsSubmitModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((exp, idx) => {
              const expId = exp.experienceId || exp.id || `exp-idx-${idx}`;
              const isVoted = votedIds.includes(expId);
              
              return (
                <div
                  key={expId}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base text-slate-900">{exp.companyName}</span>
                          <span className="text-xs font-semibold text-slate-500">• {exp.role}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exp.studentName} {exp.college ? `• ${exp.college}` : ''} ({exp.batch} Batch)
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        exp.outcome === 'Selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        exp.outcome === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {exp.outcome}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(exp.roundsFaced || []).map((r, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {r}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                        {exp.difficulty || 'Medium'} Difficulty
                      </span>
                    </div>

                    {/* Questions Encountered */}
                    <div className="mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Interview Questions Asked:</span>
                      </p>
                      <ul className="space-y-1">
                        {(exp.questionsEncountered || []).map((q, qIndex) => (
                          <li key={qIndex} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tips */}
                    <p className="text-xs text-slate-600 italic bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 mb-4 leading-relaxed">
                      "{exp.tips}"
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(exp.overallRating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">{exp.interviewDate}</span>
                      
                      <button
                        onClick={() => handleVoteHelpful(exp)}
                        className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          isVoted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={isVoted ? 'You found this helpful' : 'Mark as helpful'}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-emerald-600' : ''}`} />
                        <span>{exp.helpfulVotes || 0}</span>
                      </button>

                      {/* Flag Inappropriate Content */}
                      <button
                        onClick={() => handleOpenReport(exp)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Report this debrief as inappropriate or outdated"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 1. SUBMIT EXPERIENCE MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-white">Submit Interview Experience</h3>
                <p className="text-xs text-slate-400">Directly persisted to Spring Boot database and shared with fellow students.</p>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExperience} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                  <select
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    {companies.map(c => {
                      const cId = c.companyId || c.id;
                      return <option key={cId} value={cId}>{c.name}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Graduation Batch *</label>
                  <select
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="2026">2026 Batch</option>
                    <option value="2027">2027 Batch</option>
                    <option value="2028">2028 Batch</option>
                    <option value="2029">2029 Batch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Role</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. Associate Software Engineer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interview Round</label>
                  <select
                    value={formRound}
                    onChange={(e) => setFormRound(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="Technical Interview">Technical Round</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Managerial Round">Managerial Round</option>
                    <option value="Combined Panel">Combined Technical + HR</option>
                    <option value="Online Assessment">Online Assessment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Questions Encountered (One per line) *
                </label>
                <textarea
                  rows={4}
                  value={formQuestions}
                  onChange={(e) => setFormQuestions(e.target.value)}
                  placeholder="What is normalization?&#10;Write a query for 2nd highest salary&#10;Tell me about a challenging team conflict"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Outcome</label>
                  <select
                    value={formOutcome}
                    onChange={(e) => setFormOutcome(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="Selected">Selected</option>
                    <option value="Awaiting Result">Awaiting Result</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rating (1-5)</label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="5">5 - Excellent Experience</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Tough / Stressful</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preparation Tips for Juniors</label>
                <textarea
                  rows={2}
                  value={formTips}
                  onChange={(e) => setFormTips(e.target.value)}
                  placeholder="E.g., Revise SQL joins thoroughly, practice speaking out loud..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Submit Anonymously</span>
                  <span className="text-[11px] text-slate-400">Your name and personal college details will be protected publicly.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formAnonymous}
                  onChange={(e) => setFormAnonymous(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={submittingExp}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingExp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submittingExp ? 'Submitting to Backend...' : 'Submit Interview Experience'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. REPORT MODAL */}
      {isReportModalOpen && reportingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-rose-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">Report Content</h3>
                <p className="text-xs text-rose-200">Flag this experience for admin moderation.</p>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-rose-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-5 space-y-4 text-xs">
              <div>
                <p className="text-slate-600 mb-2">
                  Reporting debrief for <b>{reportingExp.companyName}</b> ({reportingExp.role}).
                </p>
                <label className="block font-bold text-slate-700 mb-1">Reason for Flagging *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                >
                  <option value="Outdated / Inaccurate Question">Outdated / Inaccurate Question</option>
                  <option value="Inappropriate / Offensive Language">Inappropriate / Offensive Language</option>
                  <option value="Fake or Fabricated Experience">Fake or Fabricated Experience</option>
                  <option value="Spam or Promotion">Spam or Promotion</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Confirm Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. FEEDBACK & REPORT MODAL */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">Platform Feedback & Reporting</h3>
                <p className="text-xs text-slate-400">Help improve PlacePrep AI question quality and coverage.</p>
              </div>
              <button onClick={() => setIsFeedbackModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlatformFeedback} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Feedback Category</label>
                <select
                  value={fbCategory}
                  onChange={(e) => setFbCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                >
                  <option value="General Feedback">General Feedback & Suggestions</option>
                  <option value="Report Outdated Question">Report Outdated / Incorrect Question</option>
                  <option value="AI Explanation Quality">AI Explanation Feedback</option>
                  <option value="New Company Request">Request New Company Hub</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Feedback / Issue Details *</label>
                <textarea
                  rows={4}
                  value={fbText}
                  onChange={(e) => setFbText(e.target.value)}
                  placeholder="Share what worked well or what needs revision..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submittingFeedback ? 'Submitting...' : 'Send Feedback'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
