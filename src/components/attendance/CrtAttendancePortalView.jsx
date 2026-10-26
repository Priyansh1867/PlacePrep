import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Save,
  Download,
  Search,
  Users,
  BookOpen,
  ShieldCheck,
  Check,
  Sparkles,
  TrendingUp,
  UserCheck,
  FileSpreadsheet,
  Loader2,
  Award,
  Filter,
  Plus,
  Edit,
  Ban,
  PlayCircle,
  Eye,
  MapPin,
  GraduationCap,
  Briefcase,
  ChevronRight,
  HelpCircle,
  CheckSquare
} from 'lucide-react';
import {
  CRT_SHORTAGE_THRESHOLD_PERCENT,
  CRT_CERTIFICATE_MIN_PERCENTAGE,
  CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS,
  CRT_MODULE_CATEGORIES,
  CRT_SESSION_STATUSES,
  CRT_BATCHES,
  ATTENDANCE_STATUS,
  fetchCrtSessions,
  fetchCrtSessionById,
  createCrtSession,
  updateCrtSession,
  updateCrtSessionStatus,
  fetchCrtSessionRoster,
  saveCrtAttendance,
  fetchCrtSessionReport,
  fetchCrtCumulativeReport,
  exportCrtCumulativeReportToCSV,
  exportCrtSessionReportToCSV
} from '../../services/crtAttendanceStorage';
import { DEPARTMENTS } from '../../services/attendanceStorage';
import { getCurrentUser, setCurrentUser, setPortalRole } from '../../services/storage';

export default function CrtAttendancePortalView({ onNavigate: _onNavigate }) {
  // Current user & active role
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser() || { role: 'teacher', name: 'Dr. Neha Sharma', email: 'teacher@placeprep.com' });
  const [activeRole, setActiveRole] = useState(() => (getCurrentUser()?.role || 'teacher'));

  // Active View Tab: 'sessions' | 'marking' | 'session-report' | 'cumulative-report'
  const [activeTab, setActiveTab] = useState('sessions');

  // Loaded CRT Sessions
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionFilterBatch, setSessionFilterBatch] = useState('ALL');
  const [sessionFilterDept, setSessionFilterDept] = useState('ALL');
  const [sessionFilterStatus, setSessionFilterStatus] = useState('ALL');

  // Active Selected Session
  const [activeSession, setActiveSession] = useState(null);

  // Speed Attendance Marking State
  const [roster, setRoster] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: { status, remarks, assessmentScore } }
  const [isDirty, setIsDirty] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState(null);
  const [pendingSessionChange, setPendingSessionChange] = useState(null);
  const [showDirtyModal, setShowDirtyModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Reports State
  const [sessionReport, setSessionReport] = useState(null);
  const [cumulativeReport, setCumulativeReport] = useState(null);
  const [cumulativeDeptFilter, setCumulativeDeptFilter] = useState('ALL');
  const [cumulativeBatchFilter, setCumulativeBatchFilter] = useState('ALL');
  const [cumulativeStatusFilter, setCumulativeStatusFilter] = useState('ALL'); // 'ALL' | 'SHORTAGE' | 'ELIGIBLE'

  // Modal State for Scheduling New Session
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    topic: '',
    moduleType: 'Quantitative Ability',
    trainerName: '',
    trainerOrganization: '',
    scheduledDate: new Date().toISOString().slice(0, 10),
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    venue: '',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: '',
    status: 'SCHEDULED'
  });

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Authorization check
  const isAuthorized = activeRole === 'teacher' || activeRole === 'hod' || activeRole === 'admin' || activeRole === 'faculty' || activeRole === 'tpo' || activeRole === 'coordinator';

  // Demo Role Switcher
  const handleSwitchDemoRole = (newRole) => {
    setActiveRole(newRole);
    setPortalRole(newRole);
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    setCurrentUserState(updated);
    showToast(`Switched active portal role to: ${newRole.toUpperCase()}`, 'info');
  };

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 1. Load Sessions on mount or when filter changes
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCrtSessions({
        targetBatch: sessionFilterBatch,
        department: sessionFilterDept,
        status: sessionFilterStatus
      });
      setSessions(data || []);

      // If active session is selected, refresh it
      if (selectedSessionId) {
        const found = (data || []).find(s => String(s.id) === String(selectedSessionId));
        if (found) setActiveSession(found);
      } else if (data && data.length > 0) {
        setSelectedSessionId(data[0].id);
        setActiveSession(data[0]);
      }
    } catch (e) {
      console.error('Error loading CRT sessions:', e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionFilterBatch, sessionFilterDept, sessionFilterStatus, selectedSessionId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // 2. Load Roster for active session
  const loadRosterForSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const rosterData = await fetchCrtSessionRoster(sessionId);
      setRoster(rosterData || []);

      // Pre-fill attendance records map
      const initialMap = {};
      (rosterData || []).forEach(stu => {
        initialMap[stu.studentId] = {
          status: stu.status || ATTENDANCE_STATUS.UNMARKED,
          remarks: stu.remarks || '',
          assessmentScore: stu.assessmentScore !== undefined && stu.assessmentScore !== null ? stu.assessmentScore : ''
        };
      });
      setAttendanceRecords(initialMap);
      setIsDirty(false);
    } catch (e) {
      console.error('Error loading roster for session:', e);
      showToast('Failed to load roster data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Load Cumulative Report
  const loadCumulativeReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const rep = await fetchCrtCumulativeReport({
        targetBatch: cumulativeBatchFilter,
        department: cumulativeDeptFilter
      });
      setCumulativeReport(rep);
    } catch (e) {
      console.error('Error loading cumulative report:', e);
    } finally {
      setIsLoading(false);
    }
  }, [cumulativeBatchFilter, cumulativeDeptFilter]);

  // 4. Load Session Report
  const loadSessionReport = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const rep = await fetchCrtSessionReport(sessionId);
      setSessionReport(rep);
    } catch (e) {
      console.error('Error loading session report:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tab switching with dirty-state guard
  const handleTabChange = (targetTab) => {
    if (activeTab === 'marking' && isDirty && targetTab !== 'marking') {
      setPendingTabChange(targetTab);
      setShowDirtyModal(true);
      return;
    }
    setActiveTab(targetTab);
    if (targetTab === 'cumulative-report') {
      loadCumulativeReport();
    } else if (targetTab === 'session-report' && selectedSessionId) {
      loadSessionReport(selectedSessionId);
    } else if (targetTab === 'marking' && selectedSessionId) {
      loadRosterForSession(selectedSessionId);
    }
  };

  // Open Marking for a specific session
  const handleStartMarkingForSession = (session) => {
    if (activeTab === 'marking' && isDirty && selectedSessionId !== session.id) {
      setPendingSessionChange(session);
      setShowDirtyModal(true);
      return;
    }
    setSelectedSessionId(session.id);
    setActiveSession(session);
    setActiveTab('marking');
    loadRosterForSession(session.id);
  };

  // View Session Report
  const handleViewSessionReport = (session) => {
    setSelectedSessionId(session.id);
    setActiveSession(session);
    setActiveTab('session-report');
    loadSessionReport(session.id);
  };

  // One-Click Status Change
  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status: newStatus
      }
    }));
    setIsDirty(true);
  };

  // Score or Remarks Change
  const handleRemarkChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        remarks
      }
    }));
    setIsDirty(true);
  };

  const handleScoreChange = (studentId, score) => {
    const val = score === '' ? '' : Math.max(0, Math.min(100, Number(score)));
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        assessmentScore: val
      }
    }));
    setIsDirty(true);
  };

  // Bulk: Mark All Present
  const handleMarkAllPresent = () => {
    const updated = {};
    roster.forEach(stu => {
      updated[stu.studentId] = {
        ...(attendanceRecords[stu.studentId] || {}),
        status: ATTENDANCE_STATUS.PRESENT
      };
    });
    setAttendanceRecords(updated);
    setIsDirty(true);
    showToast('All roster students set to PRESENT (Pending Save)', 'info');
  };

  // Bulk: Reset Unsaved Changes
  const handleResetAttendance = () => {
    loadRosterForSession(selectedSessionId);
    setIsDirty(false);
    showToast('Unsaved changes discarded, restored saved attendance state', 'info');
  };

  // Save Attendance to Backend & LocalStorage
  const handleSaveAttendance = async () => {
    if (!selectedSessionId) return;
    setIsSaving(true);
    try {
      const recordsToSave = roster.map(stu => {
        const marked = attendanceRecords[stu.studentId] || {};
        return {
          studentId: stu.studentId,
          rollNumber: stu.rollNumber,
          name: stu.name,
          department: stu.department,
          status: marked.status || ATTENDANCE_STATUS.UNMARKED,
          remarks: marked.remarks || null,
          assessmentScore: marked.assessmentScore !== '' && marked.assessmentScore !== undefined ? Number(marked.assessmentScore) : null
        };
      });

      await saveCrtAttendance(selectedSessionId, recordsToSave, currentUser.name || 'Faculty Coordinator');
      setIsDirty(false);
      showToast('CRT Attendance successfully recorded and persisted!', 'success');
      loadSessions(); // update session status if transitioned
    } catch (e) {
      console.error('Failed to save CRT attendance:', e);
      showToast('Error saving attendance. Please check input and retry.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Schedule / Create New Session
  const handleOpenScheduleModal = (sessionToEdit = null) => {
    if (sessionToEdit) {
      setIsEditingSession(true);
      setSessionFormData({
        ...sessionToEdit,
        startTime: sessionToEdit.startTime || '10:00 AM',
        endTime: sessionToEdit.endTime || '12:00 PM'
      });
    } else {
      setIsEditingSession(false);
      setSessionFormData({
        topic: '',
        moduleType: 'Quantitative Ability',
        trainerName: '',
        trainerOrganization: '',
        scheduledDate: new Date().toISOString().slice(0, 10),
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        venue: 'Campus Lab / Hall',
        targetBatch: '2026',
        targetBranch: 'ALL',
        academicYear: '3rd Year',
        semester: '6',
        description: '',
        status: 'SCHEDULED'
      });
    }
    setIsScheduleModalOpen(true);
  };

  const handleSaveSessionForm = async (e) => {
    e.preventDefault();
    if (!sessionFormData.topic.trim()) {
      showToast('Please provide a session title/topic', 'error');
      return;
    }
    if (!sessionFormData.scheduledDate) {
      showToast('Please select a scheduled date', 'error');
      return;
    }

    try {
      const timeSlot = `${sessionFormData.startTime} - ${sessionFormData.endTime}`;
      const payload = {
        ...sessionFormData,
        timeSlot,
        createdBy: currentUser.email || 'teacher@placeprep.com'
      };

      if (isEditingSession && sessionFormData.id) {
        await updateCrtSession(sessionFormData.id, payload);
        showToast('CRT Training Session updated successfully!', 'success');
      } else {
        await createCrtSession(payload);
        showToast('New CRT Training Session scheduled successfully!', 'success');
      }
      setIsScheduleModalOpen(false);
      loadSessions();
    } catch (err) {
      console.error('Error saving session:', err);
      showToast('Failed to save session. Please try again.', 'error');
    }
  };

  // Cancel Session Handler
  const handleCancelSession = async (session) => {
    if (window.confirm(`Are you sure you want to cancel the session: "${session.topic}"? Cancelled sessions are strictly excluded from attendance and certificate evaluations.`)) {
      await updateCrtSessionStatus(session.id, 'CANCELLED');
      showToast('Session status marked as CANCELLED', 'info');
      loadSessions();
    }
  };

  // Discard Unsaved Changes Modal confirm
  const handleConfirmDiscard = () => {
    setIsDirty(false);
    setShowDirtyModal(false);
    if (pendingTabChange) {
      setActiveTab(pendingTabChange);
      if (pendingTabChange === 'cumulative-report') loadCumulativeReport();
      else if (pendingTabChange === 'session-report' && selectedSessionId) loadSessionReport(selectedSessionId);
      setPendingTabChange(null);
    } else if (pendingSessionChange) {
      setSelectedSessionId(pendingSessionChange.id);
      setActiveSession(pendingSessionChange);
      loadRosterForSession(pendingSessionChange.id);
      setPendingSessionChange(null);
    }
  };

  // Stats calculation for current active roster
  const markingStats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let unmarked = 0;

    roster.forEach(stu => {
      const st = attendanceRecords[stu.studentId]?.status || ATTENDANCE_STATUS.UNMARKED;
      if (st === ATTENDANCE_STATUS.PRESENT) present++;
      else if (st === ATTENDANCE_STATUS.LATE) late++;
      else if (st === ATTENDANCE_STATUS.ABSENT) absent++;
      else unmarked++;
    });

    const total = roster.length;
    const attended = present + late;
    const turnoutRate = total > 0 ? Math.round((attended * 100.0 / total) * 10.0) / 10.0 : 0.0;

    return { total, present, late, absent, unmarked, attended, turnoutRate };
  }, [roster, attendanceRecords]);

  // Filtered Roster by search query
  const filteredRoster = useMemo(() => {
    if (!searchFilter.trim()) return roster;
    const q = searchFilter.toLowerCase();
    return roster.filter(stu =>
      stu.name?.toLowerCase().includes(q) ||
      stu.rollNumber?.toLowerCase().includes(q) ||
      stu.department?.toLowerCase().includes(q)
    );
  }, [roster, searchFilter]);

  // Filtered Cumulative Report Roster
  const filteredCumulativeRoster = useMemo(() => {
    if (!cumulativeReport || !cumulativeReport.roster) return [];
    let list = cumulativeReport.roster;
    if (cumulativeStatusFilter === 'SHORTAGE') {
      list = list.filter(r => r.shortageWarning);
    } else if (cumulativeStatusFilter === 'ELIGIBLE') {
      list = list.filter(r => r.certificateEligible);
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.rollNumber?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cumulativeReport, cumulativeStatusFilter, searchFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold animate-in fade-in slide-in-from-bottom-5 ${
          toastMsg.type === 'error'
            ? 'bg-rose-900 text-rose-100 border border-rose-700'
            : toastMsg.type === 'info'
            ? 'bg-slate-900 text-slate-100 border border-slate-700'
            : 'bg-emerald-950 text-emerald-100 border border-emerald-700'
        }`}>
          {toastMsg.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span>{toastMsg.message}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#31104B] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-xs font-bold text-violet-200">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span>Campus Recruitment Training Attendance Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              CRT Training Attendance & Eligibility Portal
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track aptitude, technical coding, soft skills, and mock interview training participation. Manage training rosters, speed-mark attendance, and evaluate certificate readiness.
            </p>
          </div>

          {/* Active Role Badge (Static - No Switching) */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/15 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px] block">Active Role</span>
              <span className="font-extrabold text-white capitalize">
                {currentUser?.name || 'User'} ({activeRole})
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => handleTabChange('sessions')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sessions'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Training Sessions ({sessions.length})</span>
          </button>

          {isAuthorized && (
            <button
              onClick={() => handleTabChange('marking')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'marking'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Speed Attendance Marking</span>
              {isDirty && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
              )}
            </button>
          )}

          <button
            onClick={() => handleTabChange('session-report')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'session-report'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>Session Turnout Report</span>
          </button>

          <button
            onClick={() => handleTabChange('cumulative-report')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cumulative-report'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Cumulative & Certificate Eligibility</span>
          </button>
        </div>
      </div>

      {/* Role Notice if Student */}
      {!isAuthorized && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p>
            You are viewing this portal in <strong>Student Mode</strong>. Student users can review training sessions, turnout reports, and personal certificate eligibility, but cannot create sessions or modify attendance records.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: TRAINING SESSIONS LIST & MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Batch
                </label>
                <select
                  value={sessionFilterBatch}
                  onChange={(e) => setSessionFilterBatch(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="ALL">All Batches</option>
                  <option value="2026">Batch 2026</option>
                  <option value="2027">Batch 2027</option>
                  <option value="2028">Batch 2028</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Department
                </label>
                <select
                  value={sessionFilterDept}
                  onChange={(e) => setSessionFilterDept(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Status
                </label>
                <select
                  value={sessionFilterStatus}
                  onChange={(e) => setSessionFilterStatus(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {isAuthorized && (
              <button
                onClick={() => handleOpenScheduleModal()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-200 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Training Session</span>
              </button>
            )}
          </div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map(sess => {
              const statusCfg = CRT_SESSION_STATUSES.find(s => s.id === sess.status) || {
                label: sess.status,
                color: 'slate'
              };

              return (
                <div
                  key={sess.id}
                  className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between p-5 relative ${
                    selectedSessionId === sess.id ? 'border-violet-400 ring-2 ring-violet-100 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-[11px] font-bold">
                        {sess.moduleType}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        sess.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        sess.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        sess.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {sess.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {sess.topic}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Trainer: <strong>{sess.trainerName || 'Designated Mentor'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sess.scheduledDate} • {sess.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{sess.venue || 'Campus Auditorium'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>Batch: {sess.targetBatch} • Dept: {sess.targetBranch}</span>
                      </div>
                    </div>

                    {sess.description && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                        {sess.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewSessionReport(sess)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        title="View Session Statistics"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Stats</span>
                      </button>

                      {isAuthorized && sess.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleOpenScheduleModal(sess)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                          title="Edit Session Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {isAuthorized && sess.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleStartMarkingForSession(sess)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3.5 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Mark Attendance</span>
                      </button>
                    )}

                    {isAuthorized && sess.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelSession(sess)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Cancel Session"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {sessions.length === 0 && !isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">No CRT Training Sessions Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No sessions match the selected batch or department filters. You can adjust the filter or schedule a new training session.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SPEED ATTENDANCE MARKING */}
      {/* ========================================================================= */}
      {activeTab === 'marking' && isAuthorized && (
        <div className="space-y-6">
          {/* Active Session Info Header */}
          {activeSession ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 text-[10px] font-bold uppercase">
                    {activeSession.moduleType}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">{activeSession.scheduledDate}</span>
                  <span className="text-xs font-semibold text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">{activeSession.timeSlot}</span>
                </div>
                <h2 className="text-lg font-black text-slate-900">{activeSession.topic}</h2>
                <p className="text-xs text-slate-500">
                  Trainer: <strong>{activeSession.trainerName || 'Lead Trainer'}</strong> ({activeSession.trainerOrganization || 'Corporate Mentors'}) • Venue: {activeSession.venue}
                </p>
              </div>

              {/* Session Selector Dropdown to switch quick */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Change Session:</span>
                <select
                  value={selectedSessionId || ''}
                  onChange={(e) => {
                    const chosen = sessions.find(s => String(s.id) === String(e.target.value));
                    if (chosen) handleStartMarkingForSession(chosen);
                  }}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 max-w-xs truncate"
                >
                  {sessions.filter(s => s.status !== 'CANCELLED').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.scheduledDate} - {s.topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
              Please select a training session to start marking attendance.
            </div>
          )}

          {/* Quick Stats Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Roster
              </span>
              <span className="text-2xl font-black text-slate-900">{markingStats.total}</span>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/60 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Present
              </span>
              <span className="text-2xl font-black text-emerald-700">{markingStats.present}</span>
            </div>

            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/60 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                Late
              </span>
              <span className="text-2xl font-black text-amber-700">{markingStats.late}</span>
            </div>

            <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-200/60 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                Absent
              </span>
              <span className="text-2xl font-black text-rose-700">{markingStats.absent}</span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Unmarked
              </span>
              <span className="text-2xl font-black text-slate-600">{markingStats.unmarked}</span>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-200/60 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                Turnout %
              </span>
              <span className="text-2xl font-black text-indigo-700">{markingStats.turnoutRate}%</span>
            </div>
          </div>

          {/* Table Action Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or roll number..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={handleResetAttendance}
                disabled={!isDirty}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDirty
                    ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300'
                    : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Unsaved</span>
              </button>

              <button
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Student Roster Table with One-Click Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider">
                  <tr>
                    <th className="p-3.5">Roll Number</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5 text-center">Attendance Status Control (One-Click)</th>
                    <th className="p-3.5">Quiz / Assessment Score</th>
                    <th className="p-3.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.map(stu => {
                    const currentRec = attendanceRecords[stu.studentId] || {};
                    const currentStatus = currentRec.status || ATTENDANCE_STATUS.UNMARKED;

                    return (
                      <tr key={stu.studentId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                          {stu.rollNumber}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">{stu.name}</span>
                          <span className="text-[11px] text-slate-400">{stu.email}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-600 whitespace-nowrap">
                          {stu.department}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* PRESENT - Green */}
                            <button
                              onClick={() => handleStatusChange(stu.studentId, ATTENDANCE_STATUS.PRESENT)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                currentStatus === ATTENDANCE_STATUS.PRESENT
                                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                                  : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* LATE - Yellow / Amber */}
                            <button
                              onClick={() => handleStatusChange(stu.studentId, ATTENDANCE_STATUS.LATE)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                currentStatus === ATTENDANCE_STATUS.LATE
                                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                                  : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>

                            {/* ABSENT - Red */}
                            <button
                              onClick={() => handleStatusChange(stu.studentId, ATTENDANCE_STATUS.ABSENT)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                currentStatus === ATTENDANCE_STATUS.ABSENT
                                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                                  : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            {/* UNMARKED state indicator */}
                            {currentStatus === ATTENDANCE_STATUS.UNMARKED && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                Unmarked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Score / 100"
                            value={currentRec.assessmentScore !== undefined && currentRec.assessmentScore !== null ? currentRec.assessmentScore : ''}
                            onChange={(e) => handleScoreChange(stu.studentId, e.target.value)}
                            className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </td>
                        <td className="p-3.5">
                          <input
                            type="text"
                            placeholder="Optional note / remarks..."
                            value={currentRec.remarks || ''}
                            onChange={(e) => handleRemarkChange(stu.studentId, e.target.value)}
                            className="w-full min-w-[160px] px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SESSION-WISE TURNOUT REPORT */}
      {/* ========================================================================= */}
      {activeTab === 'session-report' && (
        <div className="space-y-6">
          {sessionReport ? (
            <div className="space-y-6">
              {/* Header with Export */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider block mb-1">
                    Turnout Analytics for CRT Session #{sessionReport.sessionId}
                  </span>
                  <h2 className="text-xl font-black text-slate-900">{sessionReport.topic}</h2>
                  <p className="text-xs text-slate-500">
                    Category: <strong>{sessionReport.moduleType}</strong> • Scheduled: {sessionReport.scheduledDate} ({sessionReport.timeSlot}) • Trainer: {sessionReport.trainerName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportCrtSessionReportToCSV(sessionReport)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Session CSV</span>
                  </button>

                  {isAuthorized && (
                    <button
                      onClick={() => handleStartMarkingForSession(sessionReport)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-sm transition-all cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Edit Attendance</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Turnout KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Total Enrolled
                  </span>
                  <span className="text-2xl font-black text-slate-900">{sessionReport.totalEligibleStudents}</span>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    Present
                  </span>
                  <span className="text-2xl font-black text-emerald-700">{sessionReport.presentCount}</span>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                    Late
                  </span>
                  <span className="text-2xl font-black text-amber-700">{sessionReport.lateCount}</span>
                </div>
                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                    Absent
                  </span>
                  <span className="text-2xl font-black text-rose-700">{sessionReport.absentCount}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Unmarked
                  </span>
                  <span className="text-2xl font-black text-slate-600">{sessionReport.unmarkedCount}</span>
                </div>
                <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block mb-1">
                    Turnout %
                  </span>
                  <span className="text-2xl font-black text-violet-700">{sessionReport.attendanceCompletionPercentage}%</span>
                </div>
              </div>

              {/* Roster Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black">
                      <tr>
                        <th className="p-3.5">Roll Number</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Assessment Score</th>
                        <th className="p-3.5">Remarks</th>
                        <th className="p-3.5">Recorded At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessionReport.roster?.map(r => (
                        <tr key={r.studentId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{r.rollNumber}</td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{r.name}</span>
                            <span className="text-[11px] text-slate-400">{r.email}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-600">{r.department}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              r.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                              r.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                              r.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {r.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {r.status === 'LATE' && <Clock className="w-3 h-3 text-amber-600" />}
                              {r.status === 'ABSENT' && <XCircle className="w-3 h-3 text-rose-600" />}
                              <span>{r.status}</span>
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">
                            {r.assessmentScore !== null && r.assessmentScore !== undefined ? `${r.assessmentScore}/100` : '—'}
                          </td>
                          <td className="p-3.5 text-slate-500 max-w-xs truncate">{r.remarks || '—'}</td>
                          <td className="p-3.5 text-slate-400 whitespace-nowrap">{r.recordedAt || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">No Session Selected</h4>
              <p className="text-xs text-slate-500">Please choose a session from the Training Sessions list to view its turnout report.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CUMULATIVE REPORT & CERTIFICATE ELIGIBILITY */}
      {/* ========================================================================= */}
      {activeTab === 'cumulative-report' && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Department
                </label>
                <select
                  value={cumulativeDeptFilter}
                  onChange={(e) => setCumulativeDeptFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Batch
                </label>
                <select
                  value={cumulativeBatchFilter}
                  onChange={(e) => setCumulativeBatchFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="ALL">All Batches</option>
                  <option value="2026">Batch 2026</option>
                  <option value="2027">Batch 2027</option>
                  <option value="2028">Batch 2028</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Filter by Status
                </label>
                <select
                  value={cumulativeStatusFilter}
                  onChange={(e) => setCumulativeStatusFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="ALL">All Students</option>
                  <option value="SHORTAGE">Attendance Shortage (&lt; 75%)</option>
                  <option value="ELIGIBLE">Certificate Eligible (&ge; 75%)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => exportCrtCumulativeReportToCSV(cumulativeReport)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Cumulative CSV</span>
              </button>
            </div>
          </div>

          {/* Certificate Policy Explanation Banner */}
          <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-950 block">CRT Certificate & Placement Eligibility Rules</span>
                <p className="text-slate-600 mt-0.5">
                  1. Minimum CRT Attendance: <strong>{CRT_CERTIFICATE_MIN_PERCENTAGE}%</strong> (Strictly &lt; 75% triggers alert; exactly 75.0% is in good standing).
                  <br />
                  2. Qualifying Completed Sessions: At least <strong>{CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS} completed sessions</strong> must be held. Cancelled sessions are strictly excluded.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                Eligible &ge; 75%
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                Shortage &lt; 75%
              </span>
            </div>
          </div>

          {/* Cumulative KPI Cards */}
          {cumulativeReport && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Completed Sessions Held
                </span>
                <span className="text-2xl font-black text-slate-900">{cumulativeReport.completedSessionsHeld}</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Enrolled
                </span>
                <span className="text-2xl font-black text-slate-900">{cumulativeReport.totalStudents}</span>
              </div>

              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-200/60 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  Batch Avg %
                </span>
                <span className="text-2xl font-black text-indigo-700">{cumulativeReport.averageAttendance}%</span>
              </div>

              <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-200/60 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                  Shortage (&lt;75%)
                </span>
                <span className="text-2xl font-black text-rose-700">{cumulativeReport.shortageCount}</span>
              </div>

              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/60 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Certificate Eligible
                </span>
                <span className="text-2xl font-black text-emerald-700">{cumulativeReport.eligibleCertificateCount}</span>
              </div>
            </div>
          )}

          {/* Cumulative Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black">
                  <tr>
                    <th className="p-3.5">Roll Number</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Dept</th>
                    <th className="p-3.5 text-center">Sessions Held</th>
                    <th className="p-3.5 text-center">Attended (Present + Late)</th>
                    <th className="p-3.5 text-center">Missed</th>
                    <th className="p-3.5 text-center">Late Marks</th>
                    <th className="p-3.5 text-center">CRT Attendance %</th>
                    <th className="p-3.5 text-center">Shortage Alert (&lt;75%)</th>
                    <th className="p-3.5">Certificate Eligibility Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCumulativeRoster.map(r => (
                    <tr key={r.studentId} className={`hover:bg-slate-50/70 transition-colors ${
                      r.shortageWarning ? 'bg-rose-50/30' : ''
                    }`}>
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{r.rollNumber}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{r.name}</span>
                        <span className="text-[11px] text-slate-400">{r.studentId}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-600">{r.department}</td>
                      <td className="p-3.5 text-center font-bold text-slate-700">{r.eligibleSessionsHeld}</td>
                      <td className="p-3.5 text-center font-bold text-emerald-600">{r.sessionsAttended}</td>
                      <td className="p-3.5 text-center font-bold text-rose-600">{r.sessionsMissed}</td>
                      <td className="p-3.5 text-center font-semibold text-amber-600">{r.sessionsLate}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
                          r.crtAttendancePercentage >= 75.0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.crtAttendancePercentage}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {r.shortageWarning ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Shortage (&lt;75%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Good Standing</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase inline-block ${
                            r.certificateStatus === 'ELIGIBLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            r.certificateStatus === 'PENDING' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {r.certificateStatus}
                          </span>
                          <p className="text-[10px] text-slate-500">{r.certificateRemarks}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE / EDIT TRAINING SESSION */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isEditingSession ? 'Edit Training Session' : 'Schedule New CRT Training Session'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure training topics, category, trainer details, and target student cohort.
                </p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSessionForm} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Training Session Title / Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantitative Aptitude - Probability & Permutations"
                  value={sessionFormData.topic}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Training Category / Module <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sessionFormData.moduleType}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, moduleType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {CRT_MODULE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Department / Branch
                  </label>
                  <select
                    value={sessionFormData.targetBranch}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, targetBranch: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="ALL">ALL (Common Placement Training)</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Batch
                  </label>
                  <select
                    value={sessionFormData.targetBatch}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, targetBatch: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="ALL">All Batches</option>
                    <option value="2026">Batch 2026</option>
                    <option value="2027">Batch 2027</option>
                    <option value="2028">Batch 2028</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Academic Year
                  </label>
                  <select
                    value={sessionFormData.academicYear}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, academicYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year (Pre-Final)</option>
                    <option value="4th Year">4th Year (Final)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Semester
                  </label>
                  <select
                    value={sessionFormData.semester}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={String(s)}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Training Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionFormData.scheduledDate}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={sessionFormData.startTime}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    placeholder="01:00 PM"
                    value={sessionFormData.endTime}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trainer / Faculty Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Radhika Sen"
                    value={sessionFormData.trainerName}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, trainerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Organization / Profile
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ex-Amazon SDE / Placement Mentor"
                    value={sessionFormData.trainerOrganization}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, trainerOrganization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Center Lab 4 or Google Meet link"
                  value={sessionFormData.venue}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, venue: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Session Description & Learning Outcomes
                </label>
                <textarea
                  rows="2"
                  placeholder="Key topics, practice problems, or prerequisites..."
                  value={sessionFormData.description}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-200 transition-all cursor-pointer"
                >
                  {isEditingSession ? 'Save Changes' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UNSAVED CHANGES WARNING */}
      {/* ========================================================================= */}
      {showDirtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Unsaved Attendance Changes</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have modified attendance records that have not been saved yet. Navigating away will discard your recent status modifications.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDirtyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Keep Editing
              </button>

              <button
                onClick={handleConfirmDiscard}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all cursor-pointer"
              >
                Discard & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
