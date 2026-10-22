import React, { useState, useMemo, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  ArrowRight, 
  Clock, 
  Building2, 
  Filter,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  Sliders,
  Check,
  X,
  Plus,
  Send,
  FileText,
  CalendarDays,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  BookmarkCheck,
  GraduationCap
} from 'lucide-react';
import { 
  getUpcomingDrives, 
  getCompanies, 
  getGraduationBatch, 
  getCurrentUser,
  getStudentApplications,
  saveStudentApplication,
  evaluateStudentEligibility,
  detectScheduleConflicts,
  detectDriveLevelClashes,
  updateDriveRoundsConfig,
  getDriveRoundsConfig
} from '../services/storage';
import { DriveApi, ApplicationApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import PlacementCalendarView from '../components/drives/PlacementCalendarView';
import DriveCreationWizard from '../components/drives/DriveCreationWizard';

export default function PlacementDrivesPage({ onSelectCompany, onNavigate, onOpenAuthModal }) {
  const currentUser = getCurrentUser();
  const currentBatch = getGraduationBatch();
  const isAdminOrStaff = Boolean(
    currentUser && 
    (currentUser.role === 'admin' || currentUser.role === 'tpo' || currentUser.role === 'coordinator' || currentUser.role === 'director' || currentUser.role === 'recruiter')
  );

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('drives'); // 'drives', 'calendar', 'eligibility', 'applications', 'conflicts', 'team-controls'
  
  // Drives list and filter states
  const [selectedBatchFilter, setSelectedBatchFilter] = useState(currentBatch);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drivesList, setDrivesList] = useState(() => getUpcomingDrives());
  const [applications, setApplications] = useState(() => getStudentApplications());
  const [trackedApps, setTrackedApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trackingLoadingId, setTrackingLoadingId] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Logistics / Instructions Modal
  const [selectedDriveForInstructions, setSelectedDriveForInstructions] = useState(null);

  // Application Registration Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [driveToApply, setDriveToApply] = useState(null);
  const [applyStudentProfile, setApplyStudentProfile] = useState({
    studentName: currentUser?.name || 'Priyansh Jain',
    studentEmail: currentUser?.email || 'priyansh.jain@example.edu',
    college: currentUser?.college || 'Delhi Technological University (DTU)',
    branch: currentUser?.branch || 'Computer Science and Engineering',
    graduationBatch: currentBatch,
    cgpa: 8.85,
    tenthPercentage: 92.4,
    twelfthPercentage: 89.6,
    activeBacklogs: 0
  });
  const [applyFeedbackMsg, setApplyFeedbackMsg] = useState(null);

  // Eligibility Engine Live Checker Form State
  const [eligibilityForm, setEligibilityForm] = useState({
    cgpa: 8.5,
    tenthPercentage: 90.0,
    twelfthPercentage: 88.0,
    activeBacklogs: 0,
    branch: 'Computer Science and Engineering',
    graduationBatch: currentBatch,
    targetDriveId: drivesList[0]?.id || 'drv-hcl-2026'
  });

  // Schedule Conflict Interactive Checker State
  const [conflictCheckerForm, setConflictCheckerForm] = useState({
    targetDate: '2026-11-18',
    startTime: '10:30 AM',
    endTime: '11:45 AM',
    companyName: 'Accenture (Virtual Assessment)'
  });
  const [conflictResult, setConflictResult] = useState(null);

  // Placement-Team Round Controls State
  const [selectedDriveForConfig, setSelectedDriveForConfig] = useState(drivesList[0]?.id || 'drv-hcl-2026');
  const [roundsConfigState, setRoundsConfigState] = useState(() => {
    const d = drivesList[0];
    return d?.roundConfigs || [
      { roundNumber: 1, roundName: 'Online Screening', roundType: 'Aptitude Assessment', durationMinutes: 60, cutoffScore: 70, mode: 'Online Proctored', scheduledTime: '09:00 AM - 10:00 AM', venueOrLink: 'Lab 1' },
      { roundNumber: 2, roundName: 'Technical Interview', roundType: 'Technical Interview', durationMinutes: 45, cutoffScore: 75, mode: 'In-Person', scheduledTime: '11:00 AM - 12:00 PM', venueOrLink: 'Auditorium Panel 1' },
      { roundNumber: 3, roundName: 'HR & Final Fit', roundType: 'HR Round', durationMinutes: 30, cutoffScore: 80, mode: 'In-Person', scheduledTime: '02:00 PM - 03:00 PM', venueOrLink: 'TPO Room' }
    ];
  });
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundType, setNewRoundType] = useState('Technical Interview');
  const [newRoundDuration, setNewRoundDuration] = useState(45);
  const [newRoundCutoff, setNewRoundCutoff] = useState(75);
  const [teamSaveSuccess, setTeamSaveSuccess] = useState('');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState('');

  const companies = getCompanies();

  // Load backend drives and applications on mount or batch filter change
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [drivesData, myAppsData] = await Promise.allSettled([
        DriveApi.getAll(selectedBatchFilter === 'all' ? null : selectedBatchFilter),
        currentUser ? ApplicationApi.getMyApplications().catch(() => []) : Promise.resolve([])
      ]);

      if (drivesData.status === 'fulfilled' && Array.isArray(drivesData.value) && drivesData.value.length > 0) {
        setDrivesList(drivesData.value);
      } else {
        setDrivesList(getUpcomingDrives());
      }

      if (myAppsData.status === 'fulfilled' && Array.isArray(myAppsData.value)) {
        setTrackedApps(myAppsData.value);
      }

      setApplications(getStudentApplications());
    } catch (err) {
      console.warn('Backend unavailable, utilizing cached drives and passes:', err);
      setDrivesList(getUpcomingDrives());
      setApplications(getStudentApplications());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatchFilter, currentUser?.email]);

  useEffect(() => {
    const handleAppsChanged = () => setApplications(getStudentApplications());
    window.addEventListener('applications-changed', handleAppsChanged);
    return () => window.removeEventListener('applications-changed', handleAppsChanged);
  }, []);

  // Sync configured rounds when selected drive changes in team controls
  useEffect(() => {
    const target = drivesList.find(d => (d.driveId || d.id) === selectedDriveForConfig);
    if (target && target.roundConfigs) {
      setRoundsConfigState(target.roundConfigs);
    } else {
      const stored = getDriveRoundsConfig(selectedDriveForConfig);
      if (stored && stored.roundConfigs) {
        setRoundsConfigState(stored.roundConfigs);
      }
    }
  }, [selectedDriveForConfig, drivesList]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered drives list
  const filteredDrives = useMemo(() => {
    return drivesList.filter(d => {
      const matchBatch = selectedBatchFilter === 'all' || 
        (d.eligibleBatches && (d.eligibleBatches.includes(selectedBatchFilter) || d.eligibleBatches.includes(Number(selectedBatchFilter))));
      const matchSearch = (d.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.venue && d.venue.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' ? true : (d.status || '').toLowerCase().includes(statusFilter);
      return matchBatch && matchSearch && matchStatus;
    });
  }, [drivesList, selectedBatchFilter, searchQuery, statusFilter]);

  // Track drive in personal applications tracker
  const handleTrackDrive = async (drive, initialStatus = 'APPLIED') => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    const dId = drive.driveId || drive.id;
    setTrackingLoadingId(dId);
    try {
      const app = await ApplicationApi.trackApplication({
        driveId: dId,
        companyName: drive.companyName,
        roleTitle: drive.role,
        status: initialStatus,
        notes: `Eligible batches: ${(drive.eligibleBatches || []).join(', ')}. CTC: ${drive.ctc || drive.packageDetails || 'N/A'}`
      });
      setTrackedApps(prev => [...prev.filter(a => a.driveId !== app.driveId), app]);
      showToast(`Drive application for ${drive.companyName} tracked!`);
    } catch (err) {
      showToast('Failed to track application: ' + err.message);
    } finally {
      setTrackingLoadingId(null);
    }
  };

  const getApplicationForDrive = (drive) => {
    if (!drive) return null;
    const id = drive.driveId || drive.id;
    const pass = applications.find(a => 
      (id && (a.driveId === id || a.id === id)) ||
      (a.companyName && drive.companyName && a.companyName.toLowerCase() === drive.companyName.toLowerCase())
    );
    if (pass) return pass;
    return trackedApps.find(a => 
      (id && a.driveId === id) ||
      (a.companyName && drive.companyName && a.companyName.toLowerCase() === drive.companyName.toLowerCase())
    );
  };

  // Handle Application Submit (Verifies eligibility, checks conflicts, creates pass, tracks application)
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!driveToApply) return;

    // Check Eligibility first
    const eligCheck = evaluateStudentEligibility(applyStudentProfile, driveToApply);
    
    // Check Conflict
    const conflictCheck = detectScheduleConflicts(
      currentUser?.id || 'user-demo-01',
      driveToApply.driveDate,
      driveToApply.driveTime || '09:00 AM',
      '05:00 PM',
      driveToApply.id || driveToApply.driveId
    );

    const newApp = {
      applicationId: `APP-${Date.now().toString(36).toUpperCase()}`,
      studentId: currentUser?.id || 'user-demo-01',
      studentName: applyStudentProfile.studentName,
      studentEmail: applyStudentProfile.studentEmail,
      college: applyStudentProfile.college,
      branch: applyStudentProfile.branch,
      graduationBatch: applyStudentProfile.graduationBatch,
      cgpa: applyStudentProfile.cgpa,
      tenthPercentage: applyStudentProfile.tenthPercentage,
      twelfthPercentage: applyStudentProfile.twelfthPercentage,
      activeBacklogs: applyStudentProfile.activeBacklogs,
      driveId: driveToApply.driveId || driveToApply.id,
      companyId: driveToApply.companyId,
      companyName: driveToApply.companyName,
      role: driveToApply.role,
      appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: eligCheck.isEligible ? 'ELIGIBILITY_PASSED' : 'INELIGIBLE_REJECTED',
      eligibilityStatus: eligCheck.status,
      eligibilityRemarks: eligCheck.summary,
      currentRound: driveToApply.rounds ? driveToApply.rounds[0] : 'Round 1: Screening',
      scheduledDate: driveToApply.driveDate,
      scheduledTime: driveToApply.driveTime || '09:00 AM',
      scheduledEndTime: '11:00 AM',
      venue: driveToApply.venue || 'Campus Auditorium',
      reportingTime: driveToApply.reportingTime || '08:30 AM',
      candidateInstructions: driveToApply.instructions || 'Carry printed resume and college ID card.',
      conflictFlagged: conflictCheck.hasConflict,
      conflictReason: conflictCheck.hasConflict ? conflictCheck.conflicts[0]?.description : null
    };

    saveStudentApplication(newApp);
    setApplications(getStudentApplications());

    // Also sync to backend API
    try {
      await ApplicationApi.register(newApp).catch(() => {});
      if (currentUser) {
        await ApplicationApi.trackApplication({
          driveId: driveToApply.driveId || driveToApply.id,
          companyName: driveToApply.companyName,
          roleTitle: driveToApply.role,
          status: 'APPLIED',
          notes: `Drive Pass ID: ${newApp.applicationId}. Status: ${newApp.status}`
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('API sync warning:', err);
    }

    setApplyFeedbackMsg({
      isEligible: eligCheck.isEligible,
      hasConflict: conflictCheck.hasConflict,
      summary: eligCheck.summary,
      conflictDesc: conflictCheck.hasConflict ? conflictCheck.conflicts[0]?.description : null
    });

    showToast(`Application for ${driveToApply.companyName} submitted successfully!`);
  };

  // Run interactive conflict detector
  const handleRunConflictCheck = () => {
    const res = detectScheduleConflicts(
      currentUser?.id || 'user-demo-01',
      conflictCheckerForm.targetDate,
      conflictCheckerForm.startTime,
      conflictCheckerForm.endTime
    );
    setConflictResult(res);
  };

  // Save Placement-Team Round Configuration
  const handleSaveTeamRounds = () => {
    const roundsList = roundsConfigState.map(r => r.roundName);
    updateDriveRoundsConfig(selectedDriveForConfig, roundsList, roundsConfigState);
    
    // Also update current drive in state
    setDrivesList(prev => prev.map(d => {
      const id = d.driveId || d.id;
      if (id === selectedDriveForConfig) {
        return { ...d, rounds: roundsList, roundConfigs: roundsConfigState };
      }
      return d;
    }));

    // Sync to backend API
    DriveApi.updateRounds(selectedDriveForConfig, roundsList, JSON.stringify(roundsConfigState)).catch(() => {});

    setTeamSaveSuccess('Interview rounds configuration updated and published across platform!');
    setTimeout(() => setTeamSaveSuccess(''), 4000);
  };

  const handleAddRound = () => {
    if (!newRoundName.trim()) return;
    const nextNum = roundsConfigState.length + 1;
    const newRound = {
      roundNumber: nextNum,
      roundName: newRoundName.trim(),
      roundType: newRoundType,
      durationMinutes: parseInt(newRoundDuration, 10) || 45,
      cutoffScore: parseInt(newRoundCutoff, 10) || 75,
      mode: 'In-Person Panel',
      scheduledTime: `Round ${nextNum} Slot`,
      venueOrLink: 'Campus Placement Complex'
    };
    setRoundsConfigState([...roundsConfigState, newRound]);
    setNewRoundName('');
  };

  const handleRemoveRound = (idx) => {
    const updated = roundsConfigState.filter((_, i) => i !== idx).map((r, i) => ({ ...r, roundNumber: i + 1 }));
    setRoundsConfigState(updated);
  };

  // All drive clashes across campus
  const campusClashes = useMemo(() => detectDriveLevelClashes(), [drivesList]);

  // Selected drive for eligibility interactive engine
  const targetDriveForEligibility = useMemo(() => {
    return drivesList.find(d => (d.driveId || d.id) === eligibilityForm.targetDriveId) || drivesList[0] || {};
  }, [drivesList, eligibilityForm.targetDriveId]);

  const liveEligibilityEvaluation = useMemo(() => {
    return evaluateStudentEligibility(eligibilityForm, targetDriveForEligibility);
  }, [eligibilityForm, targetDriveForEligibility]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Campus Recruitment Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Placement Drives & Company Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Recruitment schedules, reporting passes, automated eligibility verification, conflict radar, and placement cell controls.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-xs font-medium text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Batch {currentBatch} Verification Active
            </span>
            {onNavigate && (
              <button
                onClick={() => onNavigate('applications')}
                className="px-3 py-1 text-xs font-semibold rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
              >
                Tracked Applications ({applications.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Suite Navigation Tabs */}
      <div className="surface-card p-2 shadow-sm flex flex-wrap gap-2">
        {[
          { id: 'drives', label: 'Recruitment Drives', icon: Briefcase, count: filteredDrives.length },
          { id: 'calendar', label: 'Drive Calendar & Logistics', icon: CalendarDays },
          { id: 'eligibility', label: 'Eligibility Engine', icon: ShieldCheck, isBadge: 'Live Check' },
          { id: 'applications', label: 'My Registration Passes', icon: FileText, count: applications.length },
          { id: 'conflicts', label: 'Schedule Conflict Radar', icon: AlertTriangle, hasAlert: applications.some(a => a.conflictFlagged) || campusClashes.length > 0 },
          ...(isAdminOrStaff ? [{ id: 'team-controls', label: 'Placement-Team Controls', icon: Sliders, isBadge: 'Admin/TPO' }] : []),
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive ? 'bg-indigo-600 text-white shadow-xs font-mono' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-mono'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700 font-mono'
                }`}>
                  {tab.count}
                </span>
              )}
              {tab.isBadge && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  {tab.isBadge}
                </span>
              )}
              {tab.hasAlert && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RECRUITMENT DRIVES DIRECTORY                     */}
      {/* ======================================================== */}
      {activeTab === 'drives' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="surface-card p-4 sm:p-5 border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search Input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search drives by company, role, or venue..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Batch Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
                <span className="text-slate-400 text-xs mr-1 font-semibold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Batch:
                </span>
                {['all', '2026', '2027', '2028', '2029'].map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBatchFilter(b)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedBatchFilter === b
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b === 'all' ? 'All Batches' : `${b} Batch`}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats / Filter tags */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <span>Showing <b>{filteredDrives.length}</b> verified campus opportunities</span>
                {selectedBatchFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                    Targeting Batch {selectedBatchFilter}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Open Drives
                </button>

                {isAdminOrStaff && (
                  <button
                    onClick={() => setIsWizardOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer ml-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Announce Drive (Wizard)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Drives Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive) => {
              const driveId = drive.driveId || drive.id;
              const applicationObj = getApplicationForDrive(drive);
              const hasApplied = !!applicationObj;
              const isEligible = (drive.eligibleBatches || []).map(String).includes(String(currentBatch));
              const isTracking = trackingLoadingId === driveId;
              const matchedCompany = companies.find(c => (c.companyId || c.id) === drive.companyId) || {
                id: (drive.companyId || drive.companyName).toLowerCase().replace(/\s+/g, ''),
                name: drive.companyName
              };

              return (
                <div
                  key={driveId}
                  className="surface-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Top Section */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{drive.companyName}</h3>
                        <p className="text-xs font-semibold text-slate-500">{drive.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {drive.status || 'Verified Drive'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 font-medium">CTC Package</span>
                        <p className="text-base font-extrabold text-indigo-600">{drive.ctc || drive.packageDetails || '₹7 - ₹12 LPA'}</p>
                      </div>
                    </div>

                    {/* Date, Reporting Time & Logistics */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">Drive Date</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" /> {drive.driveDate || drive.date || 'TBA'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">{drive.driveTime || '09:00 AM'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">Reporting Time</span>
                        <span className="font-bold text-amber-700 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> {drive.reportingTime || '08:30 AM'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold">Reg. Deadline</span>
                        <span className="font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-rose-500" /> {drive.deadline || 'Dec 2026'}
                        </span>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-start gap-2 text-xs text-slate-600 mb-3 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/60">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-950">Venue: </span>
                        <span>{drive.venue || 'Campus Placement Auditorium & Online Computing Labs'}</span>
                      </div>
                    </div>

                    {/* Eligibility thresholds summary */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] mb-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-slate-700 font-semibold">
                        Min CGPA: <b>{drive.minCgpa || 6.5}</b>
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-slate-700 font-semibold">
                        Max Backlogs: <b>{drive.maxBacklogs ?? 0}</b>
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-slate-700 font-semibold">
                        10th/12th: <b>{drive.minTenthPercentage || 60}%</b>
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-slate-700 font-semibold">
                        Batches: <b>{(drive.eligibleBatches || []).join(', ')}</b>
                      </span>
                    </div>

                    {/* Rounds Sequence */}
                    <div className="mb-4">
                      <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" /> Interview Rounds ({drive.rounds?.length || 3}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(drive.rounds || ['Online Assessment', 'Technical Round', 'HR Round']).map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-medium"
                          >
                            R{i + 1}: {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Eligibility Status */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        {hasApplied ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                            Registered: {applicationObj?.status}
                          </span>
                        ) : isEligible ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Batch {currentBatch} Eligible
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            Batch Ineligible
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedDriveForInstructions(drive)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Venue & Instructions</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDriveToApply(drive);
                          setIsApplyModalOpen(true);
                          setApplyFeedbackMsg(null);
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                          hasApplied
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/25'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{hasApplied ? 'View Registration Pass' : 'Apply / Register Pass'}</span>
                      </button>

                      <button
                        onClick={() => handleTrackDrive(drive, 'APPLIED')}
                        disabled={isTracking}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Track in personal placement tracker"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Track</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onSelectCompany && matchedCompany) onSelectCompany(matchedCompany);
                        }}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center gap-1 cursor-pointer"
                        title="Company Profile & Hub"
                      >
                        <span>Prep Hub</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DRIVE CALENDAR & TIMELINE VIEW                   */}
      {/* ======================================================== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <PlacementCalendarView
            drives={drivesList}
            onApplyDrive={handleApply}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ELIGIBILITY ENGINE (INTERACTIVE AUDIT)            */}
      {/* ======================================================== */}
      {activeTab === 'eligibility' && (
        <div className="space-y-6">
          <div className="surface-card p-6 shadow-sm">
            <div className="mb-6 pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Dynamic Eligibility Engine
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time academic criteria evaluation against company hiring guidelines. Test your profile metrics against any confirmed recruitment drive.
                </p>
              </div>

              {/* Target Drive Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Evaluating for:</span>
                <select
                  value={eligibilityForm.targetDriveId}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, targetDriveId: e.target.value })}
                  className="text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {drivesList.map(d => (
                    <option key={d.driveId || d.id} value={d.driveId || d.id}>
                      {d.companyName} - {d.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">CGPA (0 - 10)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={eligibilityForm.cgpa}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">10th Score (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={eligibilityForm.tenthPercentage}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, tenthPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">12th Score (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={eligibilityForm.twelfthPercentage}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, twelfthPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  value={eligibilityForm.activeBacklogs}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, activeBacklogs: parseInt(e.target.value, 10) || 0 })}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Graduation Batch</label>
                <select
                  value={eligibilityForm.graduationBatch}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, graduationBatch: e.target.value })}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {['2026', '2027', '2028', '2029'].map(b => (
                    <option key={b} value={b}>{b} Batch</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Academic Branch</label>
                <select
                  value={eligibilityForm.branch}
                  onChange={(e) => setEligibilityForm({ ...eligibilityForm, branch: e.target.value })}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="Computer Science and Engineering">CSE / IT</option>
                  <option value="Electronics and Communication">ECE</option>
                  <option value="Electrical Engineering">EEE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                </select>
              </div>
            </div>

            {/* Verdict Card */}
            <div className={`p-5 rounded-2xl border mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              liveEligibilityEvaluation.isEligible
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-3">
                {liveEligibilityEvaluation.isEligible ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-lg">
                    {liveEligibilityEvaluation.isEligible ? 'ELIGIBLE TO REGISTER' : 'INELIGIBLE FOR CURRENT CRITERIA'}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">{liveEligibilityEvaluation.summary}</p>
                </div>
              </div>

              {liveEligibilityEvaluation.isEligible && (
                <button
                  onClick={() => {
                    setDriveToApply(targetDriveForEligibility);
                    setIsApplyModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/25 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Register for {targetDriveForEligibility.companyName}</span>
                </button>
              )}
            </div>

            {/* Breakdown Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Evaluation Rule</th>
                    <th className="py-3 px-4">Your Profile Value</th>
                    <th className="py-3 px-4">Company Cutoff</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {liveEligibilityEvaluation.checks.map((chk, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{chk.criteria}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{chk.studentValue}</td>
                      <td className="py-3 px-4 text-slate-500">{chk.requiredValue}</td>
                      <td className="py-3 px-4 text-center">
                        {chk.passed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold">
                            <Check className="w-3 h-3 text-emerald-600" /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                            <X className="w-3 h-3 text-rose-600" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MY APPLICATIONS & INTERVIEW PASS                  */}
      {/* ======================================================== */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="surface-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Student Applications & Registration Tracker
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track your drive registrations, current interview stage, venue details, and download reporting hall passes.
                </p>
              </div>

              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                {applications.length} Application(s) on File
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No applications submitted yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Browse upcoming placement drives and click "Apply / Register Pass" to initiate your registration.
                </p>
                <button
                  onClick={() => setActiveTab('drives')}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                >
                  Explore Upcoming Drives
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.applicationId || app.id}
                    className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-base">{app.companyName}</h4>
                          <span className="text-xs font-semibold text-slate-500">• {app.role}</span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                            ID: {app.applicationId || app.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Applied: {app.appliedAt || app.appliedDate || 'Verified'}</p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        {app.conflictFlagged && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-mono text-xs font-bold flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Conflict Flagged
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          app.status === 'INTERVIEW_SCHEDULED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 font-mono'
                            : app.status === 'ELIGIBILITY_PASSED' || app.status === 'CONFIRMED_PASS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono'
                            : app.status === 'OFFERED'
                            ? 'bg-green-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {(app.status || 'APPLIED').replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Conflict Callout if flagged */}
                    {app.conflictFlagged && (
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold block">Interview Overlap Warning:</span>
                          <span>{app.conflictReason || 'This round collides with another scheduled campus interview on the same date.'}</span>
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => setActiveTab('conflicts')}
                              className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Resolve in Conflict Radar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interview Logistics Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Current Round</span>
                        <span className="font-bold text-slate-800">{app.currentRound || 'Round 1: Online Screening'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Interview Slot</span>
                        <span className="font-bold text-indigo-700">
                          {app.scheduledDate || 'Nov 18, 2026'} ({app.scheduledTime || '10:00 AM'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Venue & Desk</span>
                        <span className="font-bold text-slate-800">{app.venue || app.reportingVenue || 'Auditorium Hall A, Panel 4'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Reporting Time</span>
                        <span className="font-bold text-amber-700">{app.reportingTime || '08:15 AM (Strict)'}</span>
                      </div>
                    </div>

                    {/* Reporting instructions */}
                    <div className="text-xs text-slate-500 flex items-start gap-2 bg-slate-100 p-3 rounded-xl">
                      <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800">Candidate Instructions: </span>
                        <span>{app.candidateInstructions || 'Wear formal business attire. Carry 3 copies of resume, government ID, and college registration slip.'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SCHEDULE CONFLICT DETECTION RADAR                */}
      {/* ======================================================== */}
      {activeTab === 'conflicts' && (
        <div className="space-y-6">
          <div className="surface-card p-6 shadow-sm">
            <div className="mb-6 pb-4 border-b border-slate-200">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Cross-Company Schedule Conflict Detection Radar
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Monitors date and time overlaps between multiple recruitment drives, preventing candidates from double-booking simultaneous interview rounds.
              </p>
            </div>

            {/* Campus Clashes Summary */}
            <div className="space-y-4 mb-8">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Active Campus Schedule Collisions ({campusClashes.length})
              </h4>

              {campusClashes.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All placement drives are cleanly decoupled across campus with zero date collisions.
                </div>
              ) : (
                <div className="space-y-3">
                  {campusClashes.map((clash) => (
                    <div key={clash.id} className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-black">
                          DATE COLLISION: {clash.date}
                        </span>
                        <span className="text-xs font-bold text-rose-600">High Risk of Double Booking</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Drive A</span>
                          <span className="font-extrabold text-slate-900 text-sm">{clash.drive1.companyName}</span>
                          <span className="block text-slate-500 mt-0.5">{clash.drive1.role}</span>
                          <span className="block text-indigo-600 font-semibold mt-1">Venue: {clash.drive1.venue}</span>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Drive B</span>
                          <span className="font-extrabold text-slate-900 text-sm">{clash.drive2.companyName}</span>
                          <span className="block text-slate-500 mt-0.5">{clash.drive2.role}</span>
                          <span className="block text-indigo-600 font-semibold mt-1">Venue: {clash.drive2.venue}</span>
                        </div>
                      </div>

                      <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        {clash.warning}
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                        <span className="text-xs font-bold text-slate-700">Recommended Resolution:</span>
                        <span className="text-xs text-slate-500">
                          Shift {clash.drive2.companyName} virtual screening slot to Nov 19, or stagger interview rounds into morning (09:00 - 12:00) and afternoon (14:00 - 18:00) cohorts.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Candidate Slot Conflict Tester */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Test Specific Interview Slot for Schedule Conflicts
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Company / Round</label>
                  <input
                    type="text"
                    value={conflictCheckerForm.companyName}
                    onChange={(e) => setConflictCheckerForm({ ...conflictCheckerForm, companyName: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Target Date</label>
                  <input
                    type="text"
                    value={conflictCheckerForm.targetDate}
                    onChange={(e) => setConflictCheckerForm({ ...conflictCheckerForm, targetDate: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={conflictCheckerForm.startTime}
                    onChange={(e) => setConflictCheckerForm({ ...conflictCheckerForm, startTime: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={conflictCheckerForm.endTime}
                    onChange={(e) => setConflictCheckerForm({ ...conflictCheckerForm, endTime: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleRunConflictCheck}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Check for Candidate Conflicts</span>
              </button>

              {/* Result display */}
              {conflictResult && (
                <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                  conflictResult.hasConflict
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {conflictResult.hasConflict ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Conflict Detected: {conflictResult.conflictCount} clash(es) found!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Schedule is 100% Clear - No Overlapping Interviews</span>
                      </>
                    )}
                  </div>

                  {conflictResult.hasConflict && (
                    <div className="space-y-2 mt-2">
                      {conflictResult.conflicts.map((c, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-rose-200 space-y-1">
                          <span className="font-bold text-rose-900 block">{c.description}</span>
                          <span className="text-slate-500 text-[11px] block">
                            Colliding Company: <b>{c.conflictingCompany}</b> ({c.conflictingRound}) at <b>{c.conflictingTime}</b>
                          </span>
                        </div>
                      ))}

                      <div className="pt-2 border-t border-rose-200">
                        <span className="font-bold text-rose-900 block mb-1">Next Steps / Action Items:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                          {conflictResult.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: PLACEMENT-TEAM ROUND & LOGISTICS CONTROLS         */}
      {/* ======================================================== */}
      {activeTab === 'team-controls' && isAdminOrStaff && (
        <div className="space-y-6">
          <div className="surface-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  Placement-Team Controls: Interview Rounds & Workflow
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure the number, sequence, types, durations, and qualifying cutoffs of interview rounds for any recruitment drive.
                </p>
              </div>

              {/* Target Drive Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Configure for:</span>
                <select
                  value={selectedDriveForConfig}
                  onChange={(e) => setSelectedDriveForConfig(e.target.value)}
                  className="text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                >
                  {drivesList.map(d => (
                    <option key={d.driveId || d.id} value={d.driveId || d.id}>{d.companyName} - {d.role}</option>
                  ))}
                </select>
              </div>
            </div>

            {teamSaveSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {teamSaveSuccess}
              </div>
            )}

            {/* Rounds List Configurator */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Current Configured Rounds ({roundsConfigState.length})
              </span>

              {roundsConfigState.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">{r.roundName}</span>
                      <span className="text-slate-500 text-[11px] font-semibold">{r.roundType} • {r.mode || 'In-Person'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block font-bold">DURATION</span>
                      <span className="font-bold text-slate-800">{r.durationMinutes} mins</span>
                    </div>

                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block font-bold">CUTOFF</span>
                      <span className="font-bold text-purple-700">{r.cutoffScore}%</span>
                    </div>

                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-left">
                      <span className="text-[10px] text-slate-500 block font-bold">VENUE / LINK</span>
                      <span className="font-bold text-slate-700">{r.venueOrLink || 'Campus Hall'}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveRound(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer"
                      title="Remove Round"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Round Form */}
            <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-200 space-y-4 mb-6">
              <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-600" />
                Add Interview Round to Recruitment Pipeline
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Round Name</label>
                  <input
                    type="text"
                    value={newRoundName}
                    onChange={(e) => setNewRoundName(e.target.value)}
                    placeholder="e.g. System Design Interview"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Round Type</label>
                  <select
                    value={newRoundType}
                    onChange={(e) => setNewRoundType(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    <option value="Aptitude Assessment">Aptitude Assessment</option>
                    <option value="Coding Assessment">Coding Assessment</option>
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="System Design">System Design</option>
                    <option value="Group Discussion">Group Discussion</option>
                    <option value="Managerial Round">Managerial Round</option>
                    <option value="HR Round">HR Round</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newRoundDuration}
                    onChange={(e) => setNewRoundDuration(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Cutoff Score (%)</label>
                  <input
                    type="number"
                    value={newRoundCutoff}
                    onChange={(e) => setNewRoundCutoff(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleAddRound}
                className="px-4 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add This Round</span>
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={handleSaveTeamRounds}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save & Deploy Interview Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VENUE, REPORTING TIME & INSTRUCTIONS PASS         */}
      {/* ======================================================== */}
      {selectedDriveForInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                  Logistics & Candidate Instructions
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  {selectedDriveForInstructions.companyName}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedDriveForInstructions.role}</p>
              </div>

              <button
                onClick={() => setSelectedDriveForInstructions(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key timings */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Drive Date</span>
                <span className="font-extrabold text-slate-800 text-sm">{selectedDriveForInstructions.driveDate || selectedDriveForInstructions.date}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Reporting Time</span>
                <span className="font-extrabold text-amber-700 text-sm">{selectedDriveForInstructions.reportingTime || '08:15 AM'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Start Time</span>
                <span className="font-extrabold text-indigo-700 text-sm">{selectedDriveForInstructions.driveTime || '09:00 AM'}</span>
              </div>
            </div>

            {/* Venue & Location */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-1">
              <span className="text-[11px] font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Confirmed Venue / Location
              </span>
              <p className="text-xs text-indigo-950 font-bold">
                {selectedDriveForInstructions.venue || 'Auditorium Hall A & Online Computing Labs'}
              </p>
              <p className="text-[11px] text-slate-500">
                Placement Cell Gate 2 Entrance • Parking permitted at Student Quad
              </p>
            </div>

            {/* Detailed Instructions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Instructions & Documents to Carry:
              </span>
              <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed space-y-2">
                <p>{selectedDriveForInstructions.instructions}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 mt-2">
                  <li>3 hard copies of updated resume with color photograph.</li>
                  <li>Original College ID card and Government Photo ID (Aadhaar / Voter ID).</li>
                  <li>Laptop with webcam and stable Wi-Fi configuration for coding rounds.</li>
                  <li>Dress Code: Formal business attire (Blazer / Formal shirt and trousers).</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedDriveForInstructions(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const drive = selectedDriveForInstructions;
                  setSelectedDriveForInstructions(null);
                  setDriveToApply(drive);
                  setIsApplyModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Register for Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: APPLICATION REGISTRATION & ELIGIBILITY CHECK     */}
      {/* ======================================================== */}
      {isApplyModalOpen && driveToApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                  Drive Registration & Eligibility Verification
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Apply for {driveToApply.companyName}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{driveToApply.role} • {driveToApply.ctc || driveToApply.packageDetails}</p>
              </div>

              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyFeedbackMsg ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  applyFeedbackMsg.isEligible
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {applyFeedbackMsg.isEligible ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Registration Successful: Eligibility Verified!</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                        <span>Registration Ineligible: Academic Criteria Not Met</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs opacity-90">{applyFeedbackMsg.summary}</p>

                  {applyFeedbackMsg.hasConflict && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 font-semibold flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{applyFeedbackMsg.conflictDesc || 'Warning: You have another interview slot conflicting with this drive date.'}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsApplyModalOpen(false);
                      setApplyFeedbackMsg(null);
                      setActiveTab('applications');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer"
                  >
                    View in My Applications
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={applyStudentProfile.studentName}
                      onChange={(e) => setApplyStudentProfile({ ...applyStudentProfile, studentName: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Student Email</label>
                    <input
                      type="email"
                      value={applyStudentProfile.studentEmail}
                      onChange={(e) => setApplyStudentProfile({ ...applyStudentProfile, studentEmail: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">College</label>
                    <input
                      type="text"
                      value={applyStudentProfile.college}
                      onChange={(e) => setApplyStudentProfile({ ...applyStudentProfile, college: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Branch</label>
                    <input
                      type="text"
                      value={applyStudentProfile.branch}
                      onChange={(e) => setApplyStudentProfile({ ...applyStudentProfile, branch: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={applyStudentProfile.cgpa}
                      onChange={(e) => setApplyStudentProfile({ ...applyStudentProfile, cgpa: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-indigo-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">10th %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={applyStudentProfile.tenthPercentage}
                      onChange={(e) => setApplyStudentProfile({ ...applyStudentProfile, tenthPercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">12th %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={applyStudentProfile.twelfthPercentage}
                      onChange={(e) => setApplyStudentProfile({ ...applyStudentProfile, twelfthPercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      value={applyStudentProfile.activeBacklogs}
                      onChange={(e) => setApplyStudentProfile({ ...applyStudentProfile, activeBacklogs: parseInt(e.target.value, 10) || 0 })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs text-indigo-900 leading-snug">
                  <span className="font-bold block">Eligibility Threshold for {driveToApply.companyName}:</span>
                  <span>Min CGPA: {driveToApply.minCgpa || 6.5} • Max Backlogs: {driveToApply.maxBacklogs ?? 0} • Date: {driveToApply.driveDate || driveToApply.date}</span>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Run Verification & Submit</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DRIVE CREATION WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="max-w-4xl w-full my-8">
            <DriveCreationWizard
              companies={getCompanies()}
              onDriveCreated={(newDrive) => {
                setDrivesList(prev => [newDrive, ...prev]);
                setIsWizardOpen(false);
              }}
              onCancel={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
