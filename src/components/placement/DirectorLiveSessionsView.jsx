import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Edit3,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  BookmarkCheck,
  Check,
  Briefcase,
  History,
  ChevronDown,
  ChevronUp,
  Radio
} from 'lucide-react';
import {
  getLiveSessions,
  addLiveSession,
  updateLiveSession,
  rescheduleLiveSession,
  cancelLiveSession,
  rsvpLiveSession,
  calculateEligibleStudentsForDrive,
  publishLiveSessionWithNotifications,
  getUpcomingDrives
} from '../../services/storage';
import { LiveSessionApi, DriveApi, AcademicsApi } from '../../services/api';
import { DIRECTOR_COMPANY_ANALYTICS } from '../../data/directorPlacementAnalyticsData';

export default function DirectorLiveSessionsView({ onNavigate, showToast = () => {} }) {
  // Session list state
  const [sessions, setSessions] = useState(() => getLiveSessions());
  const [drives, setDrives] = useState(() => getUpcomingDrives());
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState('Local Analytical Cache');

  // Filter & Search states
  const [activeStatusTab, setActiveStatusTab] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable audit trail accordion
  const [expandedAuditId, setExpandedAuditId] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [activeSessionForModal, setActiveSessionForModal] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    companyName: '',
    driveId: '',
    driveTitle: '',
    sessionType: 'Pre-Placement Talk',
    platform: 'Google Meet',
    joinUrl: '',
    date: '',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    speaker: '',
    agenda: '',
    instructions: ''
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    newStartTime: '11:00 AM',
    newEndTime: '12:00 PM',
    reason: 'Operational schedule adjustment by Director'
  });

  const [editForm, setEditForm] = useState({
    title: '',
    speaker: '',
    platform: 'Google Meet',
    joinUrl: '',
    agenda: '',
    instructions: ''
  });

  const [cancelReason, setCancelReason] = useState('Recruiter unavailable / Date clash resolved');

  // Load sessions and drives from backend with fallback
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [backendSessions, backendDrives, backendStudents] = await Promise.allSettled([
        LiveSessionApi.getAll('DIRECTOR'),
        DriveApi.getAll(),
        AcademicsApi.getAllStudents()
      ]);

      if (backendSessions.status === 'fulfilled' && Array.isArray(backendSessions.value) && backendSessions.value.length > 0) {
        setSessions(backendSessions.value);
        setDataSource('TiDB Cloud Remote DB');
      } else {
        setSessions(getLiveSessions());
        setDataSource('Local Live Engine');
      }

      if (backendDrives.status === 'fulfilled' && Array.isArray(backendDrives.value) && backendDrives.value.length > 0) {
        setDrives(backendDrives.value);
      } else {
        setDrives(getUpcomingDrives());
      }

      if (backendStudents.status === 'fulfilled' && Array.isArray(backendStudents.value)) {
        setRegisteredStudents(backendStudents.value);
      }
    } catch (err) {
      console.warn('Backend live sessions load warning:', err);
      setSessions(getLiveSessions());
      setDataSource('Local Live Engine (Offline Fallback)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Combined available drives list (including default 8 companies for rich selection)
  const availableDrivesList = useMemo(() => {
    const map = new Map();
    // Add 8 company drives
    DIRECTOR_COMPANY_ANALYTICS.forEach((c) => {
      map.set(c.id, {
        id: c.id,
        companyName: c.companyName,
        role: c.role,
        ctc: c.ctc,
        minCgpa: 6.5,
        maxBacklogs: 0,
        eligibleBatches: ['2025', '2026'],
        allowedBranches: ['CSE', 'IT', 'ECE', 'EE']
      });
    });

    // Add stored / custom drives
    drives.forEach((d) => {
      const id = d.id || d.driveId || d.companyId;
      if (id) {
        map.set(id, {
          id,
          companyName: d.companyName,
          role: d.role,
          ctc: d.ctc || '₹6.00 - ₹12.00 LPA',
          minCgpa: d.minCgpa ?? 6.5,
          maxBacklogs: d.maxBacklogs ?? 0,
          eligibleBatches: d.eligibleBatches || ['2025', '2026'],
          allowedBranches: d.allowedBranches || ['CSE', 'IT', 'ECE']
        });
      }
    });

    return Array.from(map.values());
  }, [drives]);

  // Selected drive inside Create Modal to show dynamic eligibility preview
  const selectedDriveForPreview = useMemo(() => {
    if (!createForm.driveId) return null;
    return availableDrivesList.find((d) => d.id === createForm.driveId) || null;
  }, [createForm.driveId, availableDrivesList]);

  // Dynamic eligibility calculation in Create Modal
  const previewEligibility = useMemo(() => {
    if (!selectedDriveForPreview) return null;
    return calculateEligibleStudentsForDrive(selectedDriveForPreview, registeredStudents);
  }, [selectedDriveForPreview, registeredStudents]);

  // Handle Drive selection in Create Modal
  const handleDriveSelect = (driveId) => {
    const drive = availableDrivesList.find((d) => d.id === driveId);
    if (drive) {
      setCreateForm((prev) => ({
        ...prev,
        driveId: drive.id,
        driveTitle: `${drive.companyName} – ${drive.role}`,
        companyName: drive.companyName,
        title: prev.title || `${drive.companyName} Pre-Placement Talk & Technical Culture Overview`
      }));
    } else {
      setCreateForm((prev) => ({ ...prev, driveId: '', driveTitle: '' }));
    }
  };

  // Submit Create Live Session
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.companyName.trim() || !createForm.driveId) {
      showToast('Please fill in Session Title, Company Name, and select an Associated Drive.');
      return;
    }
    if (!createForm.joinUrl.trim() || !/^https?:\/\//i.test(createForm.joinUrl.trim())) {
      showToast('Please provide a valid Meeting URL starting with http:// or https://');
      return;
    }
    if (!createForm.date || !createForm.startTime || !createForm.endTime) {
      showToast('Please provide Session Date, Start Time, and End Time.');
      return;
    }

    const payload = {
      ...createForm,
      associatedDrive: selectedDriveForPreview
    };

    // 1. Save and broadcast locally with smart notifications
    const result = publishLiveSessionWithNotifications(
      payload,
      registeredStudents,
      'Director (Dr. Vikramaditya Sen)'
    );

    setSessions(result.sessions);
    setIsCreateModalOpen(false);

    // 2. Sync with backend API
    try {
      await LiveSessionApi.create({
        ...result.session,
        joinUrl: createForm.joinUrl.trim()
      });
    } catch (err) {
      console.warn('Backend live session create warning (persisted locally):', err);
    }

    showToast(result.message);

    // Reset Form
    setCreateForm({
      title: '',
      companyName: '',
      driveId: '',
      driveTitle: '',
      sessionType: 'Pre-Placement Talk',
      platform: 'Google Meet',
      joinUrl: '',
      date: '',
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      speaker: '',
      agenda: '',
      instructions: ''
    });
  };

  // Reschedule Session Submit
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!activeSessionForModal) return;
    if (!rescheduleForm.newDate || !rescheduleForm.newStartTime || !rescheduleForm.newEndTime) {
      showToast('Please enter the new date, start time, and end time.');
      return;
    }

    const updated = rescheduleLiveSession(activeSessionForModal.id, {
      newDate: rescheduleForm.newDate,
      newStartTime: rescheduleForm.newStartTime,
      newEndTime: rescheduleForm.newEndTime,
      reason: rescheduleForm.reason,
      actorName: 'Director (Dr. Vikramaditya Sen)'
    });

    setSessions(updated);
    setIsRescheduleModalOpen(false);

    try {
      await LiveSessionApi.reschedule(activeSessionForModal.id, {
        newDate: rescheduleForm.newDate,
        newStartTime: rescheduleForm.newStartTime,
        newEndTime: rescheduleForm.newEndTime,
        reason: rescheduleForm.reason
      });
    } catch (err) {
      console.warn('Backend reschedule warning (persisted locally):', err);
    }

    showToast(
      `Session rescheduled to ${rescheduleForm.newDate} (${rescheduleForm.newStartTime} – ${rescheduleForm.newEndTime}). Affected eligible students have been notified!`
    );
  };

  // Edit Session Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeSessionForModal) return;
    if (!editForm.joinUrl.trim() || !/^https?:\/\//i.test(editForm.joinUrl.trim())) {
      showToast('Please provide a valid Meeting URL starting with http:// or https://');
      return;
    }

    const updated = updateLiveSession(activeSessionForModal.id, {
      ...editForm,
      actorName: 'Director (Dr. Vikramaditya Sen)'
    });

    setSessions(updated);
    setIsEditModalOpen(false);

    try {
      await LiveSessionApi.update(activeSessionForModal.id, editForm);
    } catch (err) {
      console.warn('Backend update warning (persisted locally):', err);
    }

    showToast('Meeting link and session details updated successfully!');
  };

  // Cancel Session Submit
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!activeSessionForModal) return;

    const updated = cancelLiveSession(activeSessionForModal.id, {
      reason: cancelReason,
      actorName: 'Director (Dr. Vikramaditya Sen)'
    });

    setSessions(updated);
    setIsCancelModalOpen(false);

    try {
      await LiveSessionApi.cancel(activeSessionForModal.id, { reason: cancelReason });
    } catch (err) {
      console.warn('Backend cancel warning (persisted locally):', err);
    }

    showToast('Live session cancelled. Cancellation notifications sent to eligible candidates.');
  };

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalSessions = sessions.length;
    const upcomingCount = sessions.filter((s) => s.status === 'Published' || s.status === 'Upcoming' || s.status === 'Rescheduled').length;
    const publishedCount = sessions.filter((s) => s.status === 'Published').length;
    const completedCount = sessions.filter((s) => s.status === 'Completed').length;
    const cancelledCount = sessions.filter((s) => s.status === 'Cancelled').length;
    const totalNotified = sessions.reduce((sum, s) => sum + (s.notifiedCount || s.eligibleStudentsCount || 0), 0);
    const totalRsvps = sessions.reduce((sum, s) => sum + (s.rsvpsCount || 0), 0);

    return {
      totalSessions,
      upcomingCount,
      publishedCount,
      completedCount,
      cancelledCount,
      totalNotified,
      totalRsvps
    };
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        s.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.platform?.toLowerCase().includes(searchQuery.toLowerCase());

      const status = (s.status || '').toUpperCase();
      let matchesTab = true;
      if (activeStatusTab === 'UPCOMING') {
        matchesTab = status === 'UPCOMING' || status === 'PUBLISHED' || status === 'RESCHEDULED';
      } else if (activeStatusTab === 'PUBLISHED') {
        matchesTab = status === 'PUBLISHED';
      } else if (activeStatusTab === 'COMPLETED') {
        matchesTab = status === 'COMPLETED';
      } else if (activeStatusTab === 'CANCELLED') {
        matchesTab = status === 'CANCELLED';
      }

      return matchesSearch && matchesTab;
    });
  }, [sessions, searchQuery, activeStatusTab]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE BANNER & ACTION HEADER                                       */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-7 rounded-3xl border border-slate-800/90 shadow-xl shadow-slate-950/25 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h3 className="font-black text-white text-lg sm:text-xl tracking-tight">
              Pre-Placement Talks (PPT) & Executive Corporate Webinars
            </h3>
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-red-600 text-white shadow-xs tracking-wide">
              Director Scheduling & Smart Dispatch
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Source: {dataSource}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Schedule corporate webinars and pre-placement talks with automated eligibility calculation and smart student notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Live Session</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY METRICS CARDS (COUNTERS)                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Sessions
          </span>
          <span className="text-xl font-black text-slate-900">{summaryMetrics.totalSessions}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">All scheduled webinars</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-indigo-200 bg-gradient-to-b from-white to-indigo-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
            Upcoming Sessions
          </span>
          <span className="text-xl font-black text-indigo-600">{summaryMetrics.upcomingCount}</span>
          <span className="text-[10px] text-indigo-600/70 block mt-0.5">Active schedule</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Published Sessions
          </span>
          <span className="text-xl font-black text-emerald-600">{summaryMetrics.publishedCount}</span>
          <span className="text-[10px] text-emerald-600/70 block mt-0.5">Live in portals</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Cancelled Sessions
          </span>
          <span className="text-xl font-black text-rose-600">{summaryMetrics.cancelledCount}</span>
          <span className="text-[10px] text-rose-600/70 block mt-0.5">Discontinued</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200 bg-gradient-to-b from-white to-blue-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
            Students Notified
          </span>
          <span className="text-xl font-black text-blue-600">{summaryMetrics.totalNotified}</span>
          <span className="text-[10px] text-blue-600/70 block mt-0.5">Smart dispatch</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-gradient-to-b from-white to-amber-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
            RSVPs / Attending
          </span>
          <span className="text-xl font-black text-amber-600">{summaryMetrics.totalRsvps}</span>
          <span className="text-[10px] text-amber-600/70 block mt-0.5">Confirmed students</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TABS AND SEARCH BAR                                                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Sessions' },
            { id: 'UPCOMING', label: `Upcoming (${summaryMetrics.upcomingCount})` },
            { id: 'PUBLISHED', label: `Published (${summaryMetrics.publishedCount})` },
            { id: 'CANCELLED', label: `Cancelled (${summaryMetrics.cancelledCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeStatusTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, title, speaker, platform..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LIVE SESSIONS ROW CARDS                                                */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const isCancelled = session.status === 'Cancelled';
          const isRescheduled = session.status === 'Rescheduled';
          const isExpandedAudit = expandedAuditId === session.id;

          return (
            <div
              key={session.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-2xs hover:shadow-md ${
                isCancelled
                  ? 'border-rose-200 bg-rose-50/15 opacity-85'
                  : isRescheduled
                  ? 'border-amber-300 hover:border-indigo-500'
                  : 'border-slate-200/90 hover:border-indigo-500'
              }`}
            >
              {/* Left Side: Session Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-black text-base text-slate-900 tracking-tight group-hover:text-indigo-700 transition-colors">
                    {session.companyName}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {session.sessionType || 'Pre-Placement Talk'}
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {session.platform}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      session.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : session.status === 'Rescheduled'
                        ? 'bg-amber-100 text-amber-800'
                        : session.status === 'Completed'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {session.status}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {session.date} • {session.time}
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base mb-1.5">
                  {session.title}
                </h4>

                {session.agenda && (
                  <p className="text-xs text-slate-500 mb-3 italic leading-relaxed line-clamp-2">
                    "{session.agenda}"
                  </p>
                )}

                {/* Metadata & Smart Notification Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Presenter / Speaker</span>
                    <span className="font-bold text-slate-800 truncate">{session.speaker || 'Recruitment Engineering Lead'}</span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      Eligible Notified
                    </span>
                    <span className="font-black text-indigo-700 truncate">
                      {session.notifiedCount || session.eligibleStudentsCount || 0} Candidates
                    </span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">RSVP Attending</span>
                    <span className="font-bold text-emerald-600 truncate">{session.rsvpsCount || 0} Students</span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Associated Drive</span>
                    <span className="font-bold text-slate-800 truncate" title={session.driveTitle || session.driveId}>
                      {session.driveTitle || session.companyName}
                    </span>
                  </div>
                </div>

                {/* Audit Trail Accordion */}
                {Array.isArray(session.auditTrail) && session.auditTrail.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setExpandedAuditId(isExpandedAudit ? null : session.id)}
                      className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <History className="w-3 h-3 text-slate-400" />
                      <span>Audit Trail & Activity Log ({session.auditTrail.length})</span>
                      {isExpandedAudit ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isExpandedAudit && (
                      <div className="mt-2 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                        {session.auditTrail.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <div>
                              <strong className="text-slate-800 font-bold">{log.action}:</strong> {log.details}
                              <span className="text-slate-400 ml-1.5 font-mono">[{log.timestamp} by {log.actor}]</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side: Director Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {/* Join Meeting Link Button */}
                <a
                  href={session.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-4 py-2 rounded-xl text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow cursor-pointer ${
                    isCancelled
                      ? 'bg-slate-400 hover:bg-slate-500 pointer-events-none'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Live Video Room</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {/* Director Management Actions Toolbar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {!isCancelled && (
                    <>
                      {/* Reschedule Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSessionForModal(session);
                          setRescheduleForm({
                            newDate: session.date,
                            newStartTime: session.startTime || '11:00 AM',
                            newEndTime: session.endTime || '12:00 PM',
                            reason: ''
                          });
                          setIsRescheduleModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Reschedule session and notify eligible candidates"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
                        <span>Reschedule</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSessionForModal(session);
                          setEditForm({
                            title: session.title,
                            speaker: session.speaker || '',
                            platform: session.platform || 'Google Meet',
                            joinUrl: session.joinUrl || '',
                            agenda: session.agenda || '',
                            instructions: session.instructions || ''
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Edit details or update meeting URL"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit Link</span>
                      </button>

                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSessionForModal(session);
                          setCancelReason('');
                          setIsCancelModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Cancel session and notify candidates"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredSessions.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-base">No live webinars found</h4>
            <p className="text-xs text-slate-400 mt-1">Try selecting another status tab or clear your search query.</p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL: CREATE AND PUBLISH LIVE SESSION                                 */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Schedule & Publish Pre-Placement Talk</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set up corporate webinar with automated eligibility filtering and student dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* Drive Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Associated Campus Hiring Drive *
                </label>
                <select
                  required
                  value={createForm.driveId}
                  onChange={(e) => handleDriveSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select Corporate Hiring Drive --</option>
                  {availableDrivesList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.companyName} – {d.role} ({d.ctc})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Smart Eligibility Calculation Preview */}
              {previewEligibility && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-xs text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Smart Candidate Eligibility Matched</span>
                  </div>
                  <p className="text-xs font-medium">
                    🎯 <strong>{previewEligibility.count} eligible students</strong> meet criteria and will automatically
                    receive notifications in their portal.
                  </p>
                  <div className="text-[11px] text-indigo-800/80 font-mono pt-1 border-t border-indigo-200/60">
                    {previewEligibility.summary}
                  </div>
                </div>
              )}

              {/* Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.companyName}
                    onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                    placeholder="e.g. Tata Consultancy Services"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Type *</label>
                  <select
                    value={createForm.sessionType}
                    onChange={(e) => setCreateForm({ ...createForm, sessionType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pre-Placement Talk">Pre-Placement Talk (PPT)</option>
                    <option value="Company Webinar">Company Webinar</option>
                    <option value="Recruitment Orientation">Recruitment Orientation</option>
                    <option value="Technical Information Session">Technical Information Session</option>
                    <option value="Other">Other Executive Session</option>
                  </select>
                </div>
              </div>

              {/* Session Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. SDE Roles, Compensation Structure & System Design Walkthrough"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Platform & Meeting URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meeting Platform *</label>
                  <select
                    value={createForm.platform}
                    onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Other">Other Platform</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Meeting URL *</label>
                  <input
                    type="url"
                    required
                    value={createForm.joinUrl}
                    onChange={(e) => setCreateForm({ ...createForm, joinUrl: e.target.value })}
                    placeholder="https://meet.google.com/xyz-abcd-efg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Date, Start Time, End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.date}
                    onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                    placeholder="e.g. 11:00 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                    placeholder="e.g. 12:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Speaker / Presenter */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Presenter / Speaker Name</label>
                <input
                  type="text"
                  value={createForm.speaker}
                  onChange={(e) => setCreateForm({ ...createForm, speaker: e.target.value })}
                  placeholder="e.g. Karthik Ramanathan (Principal Engineering Director)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Agenda */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Agenda</label>
                <textarea
                  rows="2"
                  value={createForm.agenda}
                  onChange={(e) => setCreateForm({ ...createForm, agenda: e.target.value })}
                  placeholder="Key topics to be addressed during the session..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Meeting Instructions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Meeting Instructions</label>
                <input
                  type="text"
                  value={createForm.instructions}
                  onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                  placeholder="e.g. Please join 5 minutes early with your student registration ID."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish & Notify Eligible Students</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: RESCHEDULE SESSION                                              */}
      {/* ========================================================================= */}
      {isRescheduleModalOpen && activeSessionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Reschedule Live Session: {activeSessionForModal.companyName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All {activeSessionForModal.notifiedCount || activeSessionForModal.eligibleStudentsCount} previously notified
              eligible candidates will receive updated reschedule alerts automatically.
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Session Date *</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.newDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Start Time *</label>
                  <input
                    type="text"
                    required
                    value={rescheduleForm.newStartTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New End Time *</label>
                  <input
                    type="text"
                    required
                    value={rescheduleForm.newEndTime}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, newEndTime: e.target.value })}
                    placeholder="12:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Rescheduling</label>
                <input
                  type="text"
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  placeholder="e.g. Recruiter requested slot shift to avoid lab schedule clash"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Save & Notify Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: EDIT SESSION / UPDATE LINK                                      */}
      {/* ========================================================================= */}
      {isEditModalOpen && activeSessionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Edit Meeting Details: {activeSessionForModal.companyName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update the video conference link, agenda, or speaker information.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Meeting URL *</label>
                <input
                  type="url"
                  required
                  value={editForm.joinUrl}
                  onChange={(e) => setEditForm({ ...editForm, joinUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Platform</label>
                <select
                  value={editForm.platform}
                  onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Presenter / Speaker</label>
                <input
                  type="text"
                  value={editForm.speaker}
                  onChange={(e) => setEditForm({ ...editForm, speaker: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Agenda / Description</label>
                <textarea
                  rows="2"
                  value={editForm.agenda}
                  onChange={(e) => setEditForm({ ...editForm, agenda: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: CANCEL SESSION CONFIRMATION                                     */}
      {/* ========================================================================= */}
      {isCancelModalOpen && activeSessionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Cancel Live Session: {activeSessionForModal.companyName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to cancel this scheduled session? Cancellation notifications will be sent to{' '}
              {activeSessionForModal.notifiedCount || activeSessionForModal.eligibleStudentsCount} students.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Cancellation</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Drive postponed / Corporate recruiter unable to attend"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
