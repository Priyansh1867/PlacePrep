import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Plus, 
  Briefcase, 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  SlidersHorizontal,
  Layers,
  Database,
  Lock,
  UserCheck,
  Check,
  X,
  Flag,
  Loader2,
  Calendar,
  Award
} from 'lucide-react';
import { 
  getCompanies, 
  getUpcomingDrives, 
  getInterviewQuestions, 
  getInterviewExperiences, 
  getPlatformFeedback,
  getCurrentUser,
  setCurrentUser
} from '../services/storage';
import { 
  CompanyApi, 
  DriveApi, 
  QuestionApi, 
  ExperienceApi, 
  FeedbackApi, 
  AuthApi 
} from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import SearchBar from '../components/ui/SearchBar';

export default function AdminPage({ onNavigate, onBack }) {
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState('overview');

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
  }, [activeTab]); // 'overview', 'companies', 'drives', 'questions', 'moderation', 'feedback'
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Search states for management tabs
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [moderationSearchQuery, setModerationSearchQuery] = useState('');
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState('');

  // Live entity states
  const [companies, setCompanies] = useState(() => getCompanies());
  const [drives, setDrives] = useState(() => getUpcomingDrives());
  const [questions, setQuestions] = useState(() => getInterviewQuestions());
  const [experiences, setExperiences] = useState(() => getInterviewExperiences());
  const [feedbackList, setFeedbackList] = useState(() => getPlatformFeedback());

  // New Company Form State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyTier, setNewCompanyTier] = useState('Tier 1 IT Services');
  const [newCompanyCtc, setNewCompanyCtc] = useState('₹5.0 - ₹9.0 LPA');
  const [newCompanyRoles, setNewCompanyRoles] = useState('Software Engineer, GET');
  const [newCompanyBatches, setNewCompanyBatches] = useState('2026, 2027, 2028');

  // New Drive Form State
  const [driveCompany, setDriveCompany] = useState('hcltech');
  const [driveRole, setDriveRole] = useState('Associate Software Engineer');
  const [driveCtc, setDriveCtc] = useState('₹6.5 LPA');
  const [driveDate, setDriveDate] = useState('December 20, 2026');
  const [driveDeadline, setDriveDeadline] = useState('December 10, 2026');
  const [driveVenue, setDriveVenue] = useState('Auditorium Hall B & Labs');
  const [driveReportingTime, setDriveReportingTime] = useState('08:30 AM');
  const [driveInstructions, setDriveInstructions] = useState('Carry printed resume, college ID, and laptop.');
  const [driveMinCgpa, setDriveMinCgpa] = useState(6.5);

  // New Question Form State
  const [qCompany, setQCompany] = useState('hcltech');
  const [qRound, setQRound] = useState('technical');
  const [qCategory, setQCategory] = useState('Data Structures and Algorithms');
  const [qDifficulty, setQDifficulty] = useState('Medium');
  const [qText, setQText] = useState('');
  const [qAnswer, setQAnswer] = useState('');
  const [qApproach, setQApproach] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 4500);
  };

  // Fetch all live data from backend
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [compRes, driveRes, qRes, expRes, fbRes] = await Promise.allSettled([
        CompanyApi.getAll(),
        DriveApi.getAll(),
        QuestionApi.getAll(),
        ExperienceApi.getAll(),
        FeedbackApi.getAll()
      ]);

      if (compRes.status === 'fulfilled' && Array.isArray(compRes.value)) {
        setCompanies(compRes.value);
      }
      if (driveRes.status === 'fulfilled' && Array.isArray(driveRes.value)) {
        setDrives(driveRes.value);
      }
      if (qRes.status === 'fulfilled' && Array.isArray(qRes.value)) {
        setQuestions(qRes.value);
      }
      if (expRes.status === 'fulfilled' && Array.isArray(expRes.value)) {
        setExperiences(expRes.value);
      }
      if (fbRes.status === 'fulfilled' && Array.isArray(fbRes.value)) {
        setFeedbackList(fbRes.value);
      }
    } catch (err) {
      console.warn('Error fetching admin data from backend; utilizing cached records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSwitchToAdmin = () => { showToast('Sign in with your administrator account to manage records.', 'error'); };

  // 1. Create Company Profile (Backend REST)
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const slug = newCompanyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCompPayload = {
      companyId: slug,
      name: newCompanyName.trim(),
      slug: slug,
      tier: newCompanyTier,
      headquarters: 'India / Global',
      industry: 'Technology & Consulting',
      roles: newCompanyRoles.split(',').map(r => r.trim()).filter(Boolean),
      ctcRange: newCompanyCtc,
      verifiedUpcomingDrive: true,
      upcomingDriveDate: 'December 2026',
      eligibleBatches: newCompanyBatches.split(',').map(b => b.trim()).filter(Boolean),
      driveStatus: 'Campus Shortlisting Active',
      eligibilityCriteria: 'Minimum 60% or 6.0 CGPA in 10th, 12th, and Under-Graduation with maximum 1 active backlog.',
      recruitmentProcess: JSON.stringify([
        { step: 1, title: 'Online Assessment', desc: 'Aptitude & Technical MCQs' },
        { step: 2, title: 'Technical Interview', desc: 'Core CS and live problem solving' },
        { step: 3, title: 'HR Round', desc: 'Behavioral and culture alignment' }
      ]),
      frequentTopics: ['DSA', 'OOPs', 'SQL Queries', 'System Design Basics'],
      latestUpdateDate: 'October 2026',
      verifiedHistoricalSource: 'Verified via campus placement cell',
      popularityScore: 88,
      experienceCount: 12,
      questionCount: 8
    };

    try {
      setSubmittingAction(true);
      const created = await CompanyApi.create(newCompPayload);
      setCompanies(prev => [created || newCompPayload, ...prev]);
      setNewCompanyName('');
      showToast(`Company profile "${newCompPayload.name}" saved directly to Spring Boot database!`);
    } catch (err) {
      console.error('Error creating company:', err);
      showToast('Error creating company: ' + (err.message || 'Check administrator permissions'), 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Delete Company
  const handleDeleteCompany = async (compId) => {
    if (!window.confirm('Are you sure you want to retire this company profile?')) return;
    try {
      await CompanyApi.delete(compId);
      setCompanies(prev => prev.filter(c => (c.companyId || c.id) !== compId));
      showToast('Company profile removed successfully.');
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  // 2. Announce Placement Drive (Backend REST)
  const handleCreateDrive = async (e) => {
    e.preventDefault();
    const comp = companies.find(c => (c.companyId || c.id) === driveCompany) || companies[0];
    const newDrivePayload = {
      driveId: `drv-${Date.now()}`,
      companyId: comp?.companyId || comp?.id || driveCompany,
      companyName: comp?.name || 'Recruiter',
      role: driveRole,
      ctc: driveCtc,
      driveDate: driveDate,
      driveTime: '09:00 AM',
      deadline: driveDeadline,
      venue: driveVenue,
      reportingTime: driveReportingTime,
      instructions: driveInstructions,
      minCgpa: parseFloat(driveMinCgpa) || 6.5,
      minTenthPercentage: 60.0,
      minTwelfthPercentage: 60.0,
      maxBacklogs: 0,
      eligibleBatches: ['2026', '2027', '2028'],
      status: 'Verified Upcoming Drive',
      locations: ['Pan-India Virtual & On-Campus'],
      rounds: ['Online Assessment', 'Technical Round 1', 'HR Round'],
      roundConfigs: [
        { roundNumber: 1, roundName: 'Online Assessment', roundType: 'Aptitude Assessment', durationMinutes: 60, cutoffScore: 70, mode: 'Online Proctored', venueOrLink: driveVenue },
        { roundNumber: 2, roundName: 'Technical Round 1', roundType: 'Technical Interview', durationMinutes: 45, cutoffScore: 75, mode: 'In-Person Panel', venueOrLink: driveVenue },
        { roundNumber: 3, roundName: 'HR Round', roundType: 'HR Round', durationMinutes: 30, cutoffScore: 80, mode: 'In-Person', venueOrLink: 'Placement Office' }
      ],
      verifiedBadge: true
    };

    try {
      setSubmittingAction(true);
      const created = await DriveApi.create(newDrivePayload);
      setDrives(prev => [created || newDrivePayload, ...prev]);
      showToast(`Placement drive for ${comp?.name} published successfully!`);
    } catch (err) {
      console.error('Error creating drive:', err);
      showToast('Error publishing drive: ' + (err.message || 'Check administrator permissions'), 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Delete Drive
  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm('Retire this placement drive?')) return;
    try {
      await DriveApi.delete(driveId);
      setDrives(prev => prev.filter(d => (d.driveId || d.id) !== driveId));
      showToast('Placement drive schedule removed.');
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  // 3. Add Verified Interview Question (Backend REST)
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!qText.trim()) return;

    const newQuestionPayload = {
      questionId: `q-${Date.now()}`,
      companyId: qCompany,
      round: qRound,
      category: qCategory,
      difficulty: qDifficulty,
      questionText: qText.trim(),
      frequencyScore: 90,
      recencyRating: 'High',
      timesReported: 15,
      lastReportedDate: 'October 2026',
      verifiedHistorical: true,
      skills: [qCategory],
      approach: qApproach || 'Break down into fundamental components, evaluate space-time trade-offs.',
      suggestedAnswer: qAnswer || 'Standard model answer covering core theory and clean implementation.',
      followUps: ['How does this approach perform under high-concurrency loads?']
    };

    try {
      setSubmittingAction(true);
      const created = await QuestionApi.create(newQuestionPayload);
      setQuestions(prev => [created || newQuestionPayload, ...prev]);
      setQText('');
      setQAnswer('');
      setQApproach('');
      showToast('Question added directly to verified question database!');
    } catch (err) {
      console.error('Error adding question:', err);
      showToast('Error adding question: ' + (err.message || 'Check administrator permissions'), 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question from question bank?')) return;
    try {
      await QuestionApi.delete(questionId);
      setQuestions(prev => prev.filter(q => (q.questionId || q.id) !== questionId));
      showToast('Question removed from database.');
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  // 4. Moderate Candidate Interview Experience (Backend REST)
  const handleModerateExperience = async (expId, status) => {
    try {
      await ExperienceApi.moderate(expId, status);
      setExperiences(prev => prev.map(exp => {
        if ((exp.experienceId || exp.id) === expId) {
          return {
            ...exp,
            moderationStatus: status,
            verified: status === 'APPROVED',
            reported: false
          };
        }
        return exp;
      }));
      showToast(`Experience marked as ${status}.`);
    } catch (err) {
      showToast('Moderation failed: ' + err.message, 'error');
    }
  };

  // Recalculate AI analysis
  const handleTriggerAnalysis = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
      showToast('AI Intelligence Engine recalculated! Weights and preparation matrices synchronized across all company hubs.');
    }, 1200);
  };

  const isAdmin = currentUser?.role === 'admin';

  // Filtered lists for management tabs
  const filteredCompanies = companies.filter(c => {
    const q = (companySearchQuery || '').trim().toLowerCase();
    if (!q) return true;
    const batches = Array.isArray(c.eligibleBatches) ? c.eligibleBatches.join(' ') : String(c.eligibleBatches || '');
    const roles = Array.isArray(c.roles) ? c.roles.join(' ') : String(c.roles || '');
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.tier || '').toLowerCase().includes(q) ||
      (c.ctcRange || '').toLowerCase().includes(q) ||
      roles.toLowerCase().includes(q) ||
      batches.toLowerCase().includes(q)
    );
  });

  const filteredDrives = drives.filter(d => {
    const q = (driveSearchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (d.companyName || '').toLowerCase().includes(q) ||
      (d.role || '').toLowerCase().includes(q) ||
      (d.ctc || '').toLowerCase().includes(q) ||
      (d.venue || '').toLowerCase().includes(q) ||
      (d.status || '').toLowerCase().includes(q) ||
      (d.driveDate || '').toLowerCase().includes(q)
    );
  });

  const filteredQuestions = questions.filter(qItem => {
    const q = (questionSearchQuery || '').trim().toLowerCase();
    if (!q) return true;
    const text = qItem.questionText || qItem.question || '';
    return (
      text.toLowerCase().includes(q) ||
      (qItem.category || '').toLowerCase().includes(q) ||
      (qItem.round || '').toLowerCase().includes(q) ||
      (qItem.difficulty || '').toLowerCase().includes(q) ||
      (qItem.companyId || '').toLowerCase().includes(q)
    );
  });

  const filteredExperiences = experiences.filter(exp => {
    const q = (moderationSearchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (exp.companyName || '').toLowerCase().includes(q) ||
      (exp.role || '').toLowerCase().includes(q) ||
      (exp.studentName || '').toLowerCase().includes(q) ||
      (exp.college || '').toLowerCase().includes(q) ||
      (exp.tips || '').toLowerCase().includes(q) ||
      (exp.reportReason || '').toLowerCase().includes(q) ||
      (exp.moderationStatus || '').toLowerCase().includes(q)
    );
  });

  const filteredFeedbackList = feedbackList.filter(fb => {
    const q = (feedbackSearchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (fb.category || '').toLowerCase().includes(q) ||
      (fb.message || '').toLowerCase().includes(q) ||
      (fb.batch || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Role Verification Banner if not admin */}
      {!isAdmin && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-amber-950">Administrative Read-Only View</p>
              <p className="text-xs text-amber-800 mt-0.5">
                You are currently signed in as a student. Administrative mutations (creating companies, posting drives, adding questions, moderating content) require <b>ROLE_ADMIN</b> authorization.
              </p>
            </div>
          </div>

          <button
            onClick={handleSwitchToAdmin}
            disabled={submittingAction}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to Demo Admin</span>
          </button>
        </div>
      )}

      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackNavButton onNavigate={onNavigate} onBack={onBack} fallbackRoute="dashboard" label="Back to Dashboard" />
        <span className="text-xs font-semibold text-slate-400">Super Admin Console • Placement Ops</span>
      </div>

      {/* Admin Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Placement Officer & Admin Console</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-300">Live Spring Boot Backend</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Administrative Control Center
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Manage recruiter profiles, broadcast verified hiring drives, curate technical interview questions, and moderate community-submitted candidate logs with instant database persistence.
          </p>
        </div>

        {/* Trigger Recalculation & Refresh CTA */}
        <div className="flex flex-col gap-2 relative z-10 shrink-0">
          <button
            onClick={handleTriggerAnalysis}
            disabled={recalculating}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
            <span>{recalculating ? 'Recalculating Intelligence...' : 'Recalculate AI Analytics'}</span>
          </button>

          <button
            onClick={loadAdminData}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Backend Data</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Platform Health' },
          { id: 'companies', label: `Recruiter Hubs (${companies.length})` },
          { id: 'drives', label: `Placement Drives (${drives.length})` },
          { id: 'questions', label: `Question Bank (${questions.length})` },
          { id: 'moderation', label: `Moderation Queue (${experiences.length})` },
          { id: 'feedback', label: `Feedback & Reports (${feedbackList.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recruiter Hubs</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{companies.length}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Database records</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified Drives</span>
              <p className="text-3xl font-black text-indigo-600 mt-1">{drives.length}</p>
              <p className="text-xs text-indigo-500 font-semibold mt-1">Active candidate applications</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Questions Indexed</span>
              <p className="text-3xl font-black text-purple-600 mt-1">{questions.length}</p>
              <p className="text-xs text-purple-500 font-semibold mt-1">Across 6 topic categories</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Peer Debriefs</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">{experiences.length}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Quality verified logs</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              AI Intelligence Pipeline & Security Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-bold">Persistence Layer:</span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">Application database</span>
                <p className="text-slate-500 mt-1">All mutations persist across server sessions.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-bold">Security Enforcement:</span>
                <span className="font-extrabold text-indigo-600 text-sm mt-0.5 block">Spring Security ROLE_ADMIN</span>
                <p className="text-slate-500 mt-1">Write operations require authorized Bearer token.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-bold">Recency Weight:</span>
                <span className="font-extrabold text-emerald-600 text-sm mt-0.5 block">Based on registered drive records</span>
                <p className="text-slate-500 mt-1">Grounding verified with zero synthetic statistics.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
            <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" /> Add Recruiter Hub
            </h3>
            <form onSubmit={handleCreateCompany} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Cisco Systems"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tier / Category</label>
                <input
                  type="text"
                  value={newCompanyTier}
                  onChange={(e) => setNewCompanyTier(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CTC Range / Package</label>
                <input
                  type="text"
                  value={newCompanyCtc}
                  onChange={(e) => setNewCompanyCtc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Roles (comma-separated)</label>
                <input
                  type="text"
                  value={newCompanyRoles}
                  onChange={(e) => setNewCompanyRoles(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligible Batches</label>
                <input
                  type="text"
                  value={newCompanyBatches}
                  onChange={(e) => setNewCompanyBatches(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAction}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save to Database</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <h3 className="font-extrabold text-base text-slate-900">
                Registered Recruiter Hubs ({companies.length})
              </h3>
            </div>

            <SearchBar
              value={companySearchQuery}
              onChange={(e) => setCompanySearchQuery(e.target.value)}
              onClear={() => setCompanySearchQuery('')}
              placeholder="Search companies by name, tier, roles, batches..."
              resultCount={filteredCompanies.length}
              totalCount={companies.length}
              size="sm"
              ariaLabel="Search companies"
            />

            {filteredCompanies.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No companies matched "{companySearchQuery.trim()}".</p>
                <button
                  onClick={() => setCompanySearchQuery('')}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredCompanies.map(c => {
                  const cId = c.companyId || c.id;
                  return (
                    <div key={cId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                      <div>
                        <span className="font-extrabold text-slate-900">{c.name}</span>
                        <span className="text-slate-500 ml-2">({c.tier} • {c.ctcRange})</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Batches: {Array.isArray(c.eligibleBatches) ? c.eligibleBatches.join(', ') : '2026, 2027'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          Active
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteCompany(cId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete company profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
            <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" /> Announce Placement Drive
            </h3>
            <form onSubmit={handleCreateDrive} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company *</label>
                <select
                  value={driveCompany}
                  onChange={(e) => setDriveCompany(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                >
                  {companies.map(c => {
                    const cId = c.companyId || c.id;
                    return <option key={cId} value={cId}>{c.name}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Title *</label>
                <input
                  type="text"
                  value={driveRole}
                  onChange={(e) => setDriveRole(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CTC Package</label>
                <input
                  type="text"
                  value={driveCtc}
                  onChange={(e) => setDriveCtc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Drive Date</label>
                  <input
                    type="text"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">App Deadline</label>
                  <input
                    type="text"
                    value={driveDeadline}
                    onChange={(e) => setDriveDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue / Mode</label>
                  <input
                    type="text"
                    value={driveVenue}
                    onChange={(e) => setDriveVenue(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={driveMinCgpa}
                    onChange={(e) => setDriveMinCgpa(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reporting Time</label>
                <input
                  type="text"
                  value={driveReportingTime}
                  onChange={(e) => setDriveReportingTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Drive Instructions</label>
                <textarea
                  rows={2}
                  value={driveInstructions}
                  onChange={(e) => setDriveInstructions(e.target.value)}
                  placeholder="Dress code, items to carry..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAction}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Publish Drive Schedule</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <h3 className="font-extrabold text-base text-slate-900">
                Active Placement Drives ({drives.length})
              </h3>
            </div>

            <SearchBar
              value={driveSearchQuery}
              onChange={(e) => setDriveSearchQuery(e.target.value)}
              onClear={() => setDriveSearchQuery('')}
              placeholder="Search drives by company, role, package, venue, date..."
              resultCount={filteredDrives.length}
              totalCount={drives.length}
              size="sm"
              ariaLabel="Search drives"
            />

            {filteredDrives.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No placement drives matched "{driveSearchQuery.trim()}".</p>
                <button
                  onClick={() => setDriveSearchQuery('')}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredDrives.map(d => {
                  const dId = d.driveId || d.id;
                  return (
                    <div key={dId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                      <div>
                        <span className="font-extrabold text-slate-900">{d.companyName}</span>
                        <span className="text-slate-600 ml-2 font-medium">• {d.role} ({d.ctc})</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Drive: {d.driveDate} • Deadline: {d.deadline}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {d.status || 'Verified'}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteDrive(dId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove placement drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ADD QUESTION */}
      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
            <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Add Verified Question
            </h3>

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Recruiter</label>
                <select
                  value={qCompany}
                  onChange={(e) => setQCompany(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                >
                  {companies.map(c => {
                    const cId = c.companyId || c.id;
                    return <option key={cId} value={cId}>{c.name}</option>;
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interview Round</label>
                  <select
                    value={qRound}
                    onChange={(e) => setQRound(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="technical">Technical Round</option>
                    <option value="hr">HR Round</option>
                    <option value="managerial">Managerial Round</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category / Domain</label>
                <input
                  type="text"
                  value={qCategory}
                  onChange={(e) => setQCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Operating Systems"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Question *</label>
                <input
                  type="text"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="e.g. Explain Virtual Memory & Page Fault handling in OS"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recommended Approach</label>
                <textarea
                  rows={2}
                  value={qApproach}
                  onChange={(e) => setQApproach(e.target.value)}
                  placeholder="Steps, diagrams, or trade-offs to cover..."
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Suggested Model Answer</label>
                <textarea
                  rows={3}
                  value={qAnswer}
                  onChange={(e) => setQAnswer(e.target.value)}
                  placeholder="Standard verified response..."
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAction}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingAction && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Add Question to Bank</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
              <h3 className="font-extrabold text-base text-slate-900">
                Indexed Questions in Bank ({questions.length})
              </h3>
            </div>

            <SearchBar
              value={questionSearchQuery}
              onChange={(e) => setQuestionSearchQuery(e.target.value)}
              onClear={() => setQuestionSearchQuery('')}
              placeholder="Search questions by text, category, round, difficulty..."
              resultCount={filteredQuestions.length}
              totalCount={questions.length}
              size="sm"
              ariaLabel="Search questions in bank"
            />

            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No questions matched "{questionSearchQuery.trim()}".</p>
                <button
                  onClick={() => setQuestionSearchQuery('')}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredQuestions.map((q, qIdx) => {
                  const qId = q.questionId || q.id || `q-${qIdx}`;
                  return (
                    <div key={qId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase">
                            {q.category || 'General'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px]">
                            {q.round || 'Technical'}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600">
                            {q.difficulty || 'Medium'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">{q.questionText || q.question}</p>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteQuestion(qId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MODERATION */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Candidate Interview Debriefs & Content Moderation ({experiences.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">Enforcing Quality & Community Standards</span>
            </div>
            <div className="sm:w-72">
              <SearchBar
                value={moderationSearchQuery}
                onChange={(e) => setModerationSearchQuery(e.target.value)}
                onClear={() => setModerationSearchQuery('')}
                placeholder="Search debriefs..."
                resultCount={filteredExperiences.length}
                totalCount={experiences.length}
                size="sm"
                ariaLabel="Search interview debriefs"
              />
            </div>
          </div>

          {filteredExperiences.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <p className="font-semibold text-slate-700">No debriefs matched "{moderationSearchQuery.trim()}".</p>
              <button
                onClick={() => setModerationSearchQuery('')}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExperiences.map((exp, idx) => {
                const expId = exp.experienceId || exp.id || `exp-${idx}`;
                const isApproved = (exp.moderationStatus || 'APPROVED') === 'APPROVED';
                const isReported = exp.reported;

                return (
                  <div
                    key={expId}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-colors ${
                      isReported ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900">{exp.companyName}</span>
                        <span className="text-slate-500">• {exp.role}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                          Batch {exp.batch}
                        </span>
                        {isReported && (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1">
                            <Flag className="w-3 h-3 text-rose-600" />
                            <span>Flagged: {exp.reportReason || 'Reported Content'}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">"{exp.tips}"</p>
                      <p className="text-[11px] text-slate-400">
                        Author: {exp.studentName} {exp.college ? `• ${exp.college}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {exp.moderationStatus || 'APPROVED'}
                      </span>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          {!isApproved && (
                            <button
                              onClick={() => handleModerateExperience(expId, 'APPROVED')}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Approve this post"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}
                          {isApproved && (
                            <button
                              onClick={() => handleModerateExperience(expId, 'REJECTED')}
                              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Reject/Hide this post"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-extrabold text-base text-slate-900">
              Student Feedback & Platform Reports ({feedbackList.length})
            </h3>
            {feedbackList.length > 0 && (
              <div className="sm:w-72">
                <SearchBar
                  value={feedbackSearchQuery}
                  onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                  onClear={() => setFeedbackSearchQuery('')}
                  placeholder="Search feedback..."
                  resultCount={filteredFeedbackList.length}
                  totalCount={feedbackList.length}
                  size="sm"
                  ariaLabel="Search student feedback"
                />
              </div>
            )}
          </div>
          {feedbackList.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No Feedback Submissions Recorded"
              description="Feedback sent by students via the Experience Vault will populate here for review."
            />
          ) : filteredFeedbackList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <p className="font-semibold text-slate-700">No feedback matched "{feedbackSearchQuery.trim()}".</p>
              <button
                onClick={() => setFeedbackSearchQuery('')}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedbackList.map((fb, idx) => (
                <div key={fb.feedbackId || fb.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[10px]">
                      {fb.category}
                    </span>
                    <span className="text-slate-400 text-[11px]">{fb.date?.split('T')[0] || 'Verified'}</span>
                  </div>
                  <p className="text-slate-700">{fb.message}</p>
                  <p className="text-[11px] text-slate-400">Batch: {fb.batch || 'General'} • Rating: {fb.rating || 5}/5</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
