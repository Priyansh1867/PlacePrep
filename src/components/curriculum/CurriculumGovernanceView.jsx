// PlacePrep AI - HOD Curriculum & Syllabus Governance Workspace
// Monitors department-wide syllabus delivery, planned vs actual coverage,
// laboratory practical completion, internal assessments, academic deadlines, and behind-schedule alerts.

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  CheckSquare,
  Beaker,
  Building2,
  Trash2
} from 'lucide-react';
import {
  DEPARTMENTS,
  ACADEMIC_YEARS,
  SEMESTERS,
  PROGRESS_STATUSES,
  getCurriculumTargets,
  saveCurriculumTarget,
  deleteCurriculumTarget,
  updateTopicStatus,
  getLabCompletionRecords,
  logLabSession,
  getInternalAssessments,
  updateAssessmentStatus,
  getAcademicDeadlines,
  getBehindScheduleAlerts,
  getCurriculumOverviewMetrics,
  isUserAuthorizedHOD,
  exportCurriculumProgressReport
} from '../../services/curriculumGovernanceService.js';
import { BRANCH_SEMESTER_SUBJECTS } from '../../data/initialAcademicRecords.js';
import { getCurrentUser } from '../../services/storage.js';
import SearchBar from '../ui/SearchBar';

export default function CurriculumGovernanceView({ onNavigate }) {
  const currentUser = getCurrentUser();
  const isAuthorized = isUserAuthorizedHOD(currentUser);

  // Department & Academic Year State
  const [selectedDept, setSelectedDept] = useState(
    currentUser?.department && DEPARTMENTS.some(d => d.code === currentUser.department)
      ? currentUser.department
      : 'CSE'
  );
  const [selectedYear, setSelectedYear] = useState('2026-2027');

  // Active view section tab
  // 'overview' | 'syllabus' | 'laboratories' | 'assessments' | 'deadlines' | 'alerts'
  const [activeSection, setActiveSection] = useState('overview');

  // Filter states
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [expandedTargetId, setExpandedTargetId] = useState(null);

  // Modals
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isLogLabModalOpen, setIsLogLabModalOpen] = useState(false);
  const [selectedLabForLog, setSelectedLabForLog] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState({ type: '', text: '' });

  // Data Refresh Trigger
  const [dataVersion, setDataVersion] = useState(0);
  const triggerRefresh = useCallback(() => setDataVersion(v => v + 1), []);

  // Form State: New Target
  const [targetForm, setTargetForm] = useState({
    semester: 6,
    subjectCode: '',
    subjectName: '',
    assignedFaculty: '',
    facultyDesignation: 'Assistant Professor',
    totalUnits: 5,
    targetPercentage: 80,
    plannedPercentage: 75,
    targetDate: '2026-11-20'
  });
  const [targetFormError, setTargetFormError] = useState('');

  // Form State: Log Lab Session
  const [labForm, setLabForm] = useState({
    sessionDate: new Date().toISOString().slice(0, 10),
    topicVerified: '',
    batchCode: 'Batch A & B',
    remarks: ''
  });

  // Query computed metrics & records
  const overviewMetrics = useMemo(() => {
    return getCurriculumOverviewMetrics(selectedDept, selectedYear);
  }, [selectedDept, selectedYear, dataVersion]);

  const targets = useMemo(() => {
    return getCurriculumTargets({
      department: selectedDept,
      academicYear: selectedYear,
      semester: semesterFilter,
      status: statusFilter,
      search: searchQuery
    });
  }, [selectedDept, selectedYear, semesterFilter, statusFilter, searchQuery, dataVersion]);

  const labs = useMemo(() => {
    return getLabCompletionRecords({
      department: selectedDept,
      semester: semesterFilter,
      status: statusFilter === 'ALL' ? undefined : statusFilter
    });
  }, [selectedDept, semesterFilter, statusFilter, dataVersion]);

  const filteredLabs = useMemo(() => {
    const q = (labSearchQuery || '').trim().toLowerCase();
    if (!q) return labs;
    return labs.filter(l =>
      (l.labName || '').toLowerCase().includes(q) ||
      (l.subjectCode || '').toLowerCase().includes(q) ||
      (l.assignedFaculty || '').toLowerCase().includes(q)
    );
  }, [labs, labSearchQuery]);

  const assessments = useMemo(() => {
    return getInternalAssessments({
      department: selectedDept,
      semester: semesterFilter
    });
  }, [selectedDept, semesterFilter, dataVersion]);

  const deadlines = useMemo(() => {
    return getAcademicDeadlines({
      department: selectedDept
    });
  }, [selectedDept, dataVersion]);

  const alerts = useMemo(() => {
    return getBehindScheduleAlerts({
      department: selectedDept,
      academicYear: selectedYear
    });
  }, [selectedDept, selectedYear, dataVersion]);

  // Dynamic available subjects for chosen semester in target form
  const availableSubjectsForSemester = useMemo(() => {
    const deptFullName = DEPARTMENTS.find(d => d.code === selectedDept)?.name || 'Computer Science and Engineering';
    const deptMap = BRANCH_SEMESTER_SUBJECTS[deptFullName] || BRANCH_SEMESTER_SUBJECTS['Computer Science and Engineering'];
    return deptMap ? (deptMap[targetForm.semester] || []) : [];
  }, [selectedDept, targetForm.semester]);

  // When available subjects update, populate subjectCode/Name if empty
  useEffect(() => {
    if (availableSubjectsForSemester.length > 0 && !targetForm.subjectCode) {
      setTargetForm(f => ({
        ...f,
        subjectCode: availableSubjectsForSemester[0].code,
        subjectName: availableSubjectsForSemester[0].name
      }));
    }
  }, [availableSubjectsForSemester, targetForm.subjectCode]);

  // Show auto-dismiss notification
  const showNotification = (type, text) => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg({ type: '', text: '' }), 4500);
  };

  // Handlers
  const handleSubjectSelectChange = (e) => {
    const code = e.target.value;
    const found = availableSubjectsForSemester.find(s => s.code === code);
    if (found) {
      setTargetForm(f => ({ ...f, subjectCode: found.code, subjectName: found.name }));
    }
  };

  const handleSaveTarget = (e) => {
    e.preventDefault();
    setTargetFormError('');
    try {
      saveCurriculumTarget({
        ...targetForm,
        department: selectedDept,
        academicYear: selectedYear
      }, currentUser);

      setIsTargetModalOpen(false);
      showNotification('success', `Curriculum target for ${targetForm.subjectCode} (${targetForm.subjectName}) established successfully.`);
      triggerRefresh();
    } catch (err) {
      setTargetFormError(err.message);
    }
  };

  const handleDeleteTarget = (targetId, subjectCode) => {
    if (!window.confirm(`Are you sure you want to remove the curriculum target for ${subjectCode}?`)) return;
    try {
      deleteCurriculumTarget(targetId, currentUser);
      showNotification('success', `Curriculum target for ${subjectCode} removed.`);
      triggerRefresh();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleToggleTopic = (targetId, unitNumber, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'In Progress' : (currentStatus === 'In Progress' ? 'Not Started' : 'Completed');
    try {
      updateTopicStatus(targetId, unitNumber, nextStatus, currentUser);
      triggerRefresh();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleOpenLogLab = (lab) => {
    setSelectedLabForLog(lab);
    setLabForm({
      sessionDate: new Date().toISOString().slice(0, 10),
      topicVerified: `Experiment ${lab.completedSessions + 1} - Hands-on Practical`,
      batchCode: 'Batch A & B',
      remarks: ''
    });
    setIsLogLabModalOpen(true);
  };

  const handleSaveLabSession = (e) => {
    e.preventDefault();
    if (!selectedLabForLog) return;
    try {
      logLabSession(selectedLabForLog.id, {
        date: labForm.sessionDate,
        remarks: `${labForm.topicVerified} (${labForm.batchCode}). ${labForm.remarks}`
      }, currentUser);
      setIsLogLabModalOpen(false);
      showNotification('success', `Practical session logged for ${selectedLabForLog.labName}.`);
      triggerRefresh();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleMarkAssessmentCompleted = (asmId, name) => {
    try {
      updateAssessmentStatus(asmId, 'Completed', new Date().toISOString().slice(0, 10), currentUser);
      showNotification('success', `Internal assessment "${name}" marked as completed.`);
      triggerRefresh();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleExport = (format) => {
    const res = exportCurriculumProgressReport(selectedDept, selectedYear, format);
    showNotification('success', `Downloaded ${res.filename} (${res.rowCount} subject records).`);
  };

  // Status color pill helper
  const getStatusBadge = (status) => {
    switch (status) {
      case PROGRESS_STATUSES.COMPLETED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case PROGRESS_STATUSES.ON_TRACK:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case PROGRESS_STATUSES.AT_RISK:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case PROGRESS_STATUSES.BEHIND_SCHEDULE:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">HOD Authorization Required</h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          The <strong>Curriculum & Syllabus Governance</strong> module is exclusively restricted to department Heads of Department (HOD) and Academic Directors. Your current role ({currentUser.role || 'Student'}) does not have governance permissions.
        </p>
        <button
          onClick={() => onNavigate?.('institute-portal')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
        >
          Return to Institute Portal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* TOP HEADER & CONTROLS */}
      <div className="bg-gradient-to-r from-[#111439] via-[#1A1E4F] to-[#282F74] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
              <span>HOD Academic Governance • Syllabus & Curriculum Delivery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <span>Curriculum & Syllabus Governance</span>
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
              Department Academic Progress • Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.role?.toUpperCase()})
            </p>
          </div>

          {/* Department, Year Selector & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <Building2 className="w-4 h-4 text-indigo-300" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.code} value={d.code} className="text-slate-900 font-semibold">
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <Calendar className="w-4 h-4 text-indigo-300" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {ACADEMIC_YEARS.map(yr => (
                  <option key={yr} value={yr} className="text-slate-900 font-semibold">
                    AY {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Target</span>
            </button>

            <div className="flex items-center rounded-xl bg-white/15 p-1 border border-white/15">
              <button
                onClick={() => handleExport('xlsx')}
                className="px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 rounded-lg transition flex items-center gap-1"
                title="Download Excel Report"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>XLSX</span>
              </button>
              <span className="text-white/30 text-xs">|</span>
              <button
                onClick={() => handleExport('csv')}
                className="px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 rounded-lg transition flex items-center gap-1"
                title="Download CSV Report"
              >
                <Download className="w-3.5 h-3.5 text-blue-300" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {notificationMsg.text && (
          <div className={`mt-4 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm ${
            notificationMsg.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {notificationMsg.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            <span>{notificationMsg.text}</span>
          </div>
        )}
      </div>

      {/* OVERVIEW METRIC CARDS (8 Core KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {/* Metric 1: Dept Syllabus Completion */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Dept Completion</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-indigo-700">{overviewMetrics.departmentCompletionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${overviewMetrics.departmentCompletionPercentage}%` }} />
          </div>
        </div>

        {/* Metric 2: Planned Coverage */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Planned Target</span>
          <span className="text-xl font-black text-slate-900">{overviewMetrics.overallPlannedCoverage}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Midterm benchmark</span>
        </div>

        {/* Metric 3: Actual Completed */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Actual Delivered</span>
          <span className="text-xl font-black text-slate-900">{overviewMetrics.overallCompletedCoverage}%</span>
          <span className={`text-[10px] font-bold block mt-1 ${overviewMetrics.overallCompletedCoverage >= overviewMetrics.overallPlannedCoverage ? 'text-emerald-600' : 'text-rose-600'}`}>
            {overviewMetrics.overallCompletedCoverage >= overviewMetrics.overallPlannedCoverage ? 'Target met' : `${overviewMetrics.overallPlannedCoverage - overviewMetrics.overallCompletedCoverage}% gap`}
          </span>
        </div>

        {/* Metric 4: On Track */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">On Track</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-emerald-600">{overviewMetrics.subjectsOnTrack}</span>
            <span className="text-xs text-slate-400">/{overviewMetrics.totalSubjectsMonitored}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Healthy pacing</span>
        </div>

        {/* Metric 5: Behind Schedule */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Behind Schedule</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black text-rose-600">{overviewMetrics.subjectsBehindSchedule}</span>
            <span className="text-xs text-slate-400">subjects</span>
          </div>
          <span className="text-[10px] text-rose-700 font-semibold block mt-1">Needs intervention</span>
        </div>

        {/* Metric 6: Pending Labs */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Pending Labs</span>
          <span className="text-xl font-black text-amber-600">{overviewMetrics.pendingLabSessions}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Sessions to conduct</span>
        </div>

        {/* Metric 7: Pending Assessments */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Assessments</span>
          <span className="text-xl font-black text-indigo-600">{overviewMetrics.pendingInternalAssessments}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Midterms / Vivas</span>
        </div>

        {/* Metric 8: Overdue Deadlines */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Overdue Items</span>
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-black ${overviewMetrics.overdueDeadlines > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overviewMetrics.overdueDeadlines}
            </span>
            {overviewMetrics.overdueDeadlines > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">{overviewMetrics.upcomingDeadlines} upcoming</span>
        </div>
      </div>

      {/* SECTION NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'overview', label: 'Syllabus Progress & Units', icon: BookOpen, count: targets.length },
          { id: 'laboratories', label: 'Laboratory Practical Monitoring', icon: Beaker, count: labs.length },
          { id: 'assessments', label: 'Internal Assessments Tracker', icon: CheckSquare, count: assessments.length },
          { id: 'deadlines', label: 'Academic Deadlines Calendar', icon: Calendar, count: deadlines.length },
          { id: 'alerts', label: 'Behind-Schedule Alerts', icon: AlertTriangle, count: alerts.length, isWarning: alerts.length > 0 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.isWarning ? 'text-rose-500' : (isActive ? 'text-indigo-300' : 'text-slate-400')}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : (tab.isWarning ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600')
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: PLANNED VS COMPLETED SYLLABUS PROGRESS & TOPICS */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Semester:</span>
              </span>
              {['ALL', 4, 6].map(sem => (
                <button
                  key={sem}
                  onClick={() => setSemesterFilter(sem)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    semesterFilter === sem ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sem === 'ALL' ? 'All Semesters' : `Sem ${sem}`}
                </button>
              ))}

              <span className="text-slate-300 mx-1">|</span>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value={PROGRESS_STATUSES.ON_TRACK}>On Track</option>
                <option value={PROGRESS_STATUSES.BEHIND_SCHEDULE}>Behind Schedule</option>
                <option value={PROGRESS_STATUSES.AT_RISK}>At Risk</option>
                <option value={PROGRESS_STATUSES.COMPLETED}>Completed</option>
              </select>
            </div>

            <div className="w-full sm:w-72">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search subject code, title or faculty..."
                size="sm"
                resultCount={targets.length}
              />
            </div>
          </div>

          {/* Subject-Wise Progress Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900">Department Syllabus Coverage Registry</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subject-level planned coverage vs actual verified delivery in {selectedDept} (AY {selectedYear})
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">{targets.length} subjects monitored</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Subject & Code</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Assigned Faculty</th>
                    <th className="py-3 px-4">Units</th>
                    <th className="py-3 px-4">Planned %</th>
                    <th className="py-3 px-4">Actual %</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {targets.map(target => {
                    const isExpanded = expandedTargetId === target.id;
                    const statusClass = getStatusBadge(target.status);
                    return (
                      <React.Fragment key={target.id}>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900">{target.subjectCode}</div>
                            <div className="text-[11px] text-slate-500 max-w-xs truncate">{target.subjectName}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            Sem {target.semester}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{target.assignedFaculty}</div>
                            <div className="text-[10px] text-slate-400">{target.facultyDesignation || 'Faculty'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            {target.totalUnits} Units
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700 w-7">{target.plannedPercentage}%</span>
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: `${target.plannedPercentage}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-black w-7 ${target.actualPercentage >= target.plannedPercentage ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {target.actualPercentage}%
                              </span>
                              <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full ${target.actualPercentage >= target.plannedPercentage ? 'bg-emerald-500' : (target.actualPercentage >= 60 ? 'bg-amber-500' : 'bg-rose-500')}`}
                                  style={{ width: `${target.actualPercentage}%` }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-600">
                            {target.targetDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider inline-block ${statusClass}`}>
                              {target.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {target.updatedAt || 'Recent'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setExpandedTargetId(isExpanded ? null : target.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                  isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                <span>{isExpanded ? 'Hide Units' : 'Units'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteTarget(target.id, target.subjectCode)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete Target"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDABLE UNIT / TOPIC BREAKDOWN DRAWER */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70 border-b border-indigo-100">
                            <td colSpan={10} className="p-4 sm:p-6">
                              <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                      <span>Unit-Wise Syllabus Progress for {target.subjectCode}</span>
                                      <span className="text-xs font-normal text-slate-500">({target.subjectName})</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Click any unit badge to update status. Actual percentage automatically re-computes.
                                    </p>
                                  </div>
                                  <div className="text-xs font-bold text-indigo-700">
                                    Overall: {target.actualPercentage}% Completed
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  {target.units?.map(unit => {
                                    const uStatus = unit.status;
                                    return (
                                      <div
                                        key={unit.unitNumber}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-3 hover:border-indigo-200 transition"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                            uStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : (uStatus === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700')
                                          }`}>
                                            {unit.unitNumber}
                                          </div>
                                          <div>
                                            <div className="font-bold text-slate-800 text-xs">Unit {unit.unitNumber}: {unit.title}</div>
                                            <span className="text-[10px] text-slate-400">
                                              Topics: {unit.completedTopics || 0} / {unit.topicsCount || 5} completed
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handleToggleTopic(target.id, unit.unitNumber, uStatus)}
                                            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                              uStatus === 'Completed'
                                                ? 'bg-emerald-600 text-white'
                                                : (uStatus === 'In Progress' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300')
                                            }`}
                                          >
                                            {uStatus === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {uStatus === 'In Progress' && <Clock className="w-3.5 h-3.5" />}
                                            <span>{uStatus}</span>
                                          </button>
                                          <span className="text-[10px] text-slate-400">(Click to toggle)</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {targets.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                No syllabus targets match the selected filters. Use "Configure Target" above to establish targets.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: LABORATORY PRACTICAL SESSIONS MONITORING */}
      {activeSection === 'laboratories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Laboratory & Practical Course Progress</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track weekly practical sessions held, code execution checks, and lab journals in {selectedDept}
                </p>
              </div>
              <div className="w-full sm:w-72">
                <SearchBar
                  value={labSearchQuery}
                  onChange={(e) => setLabSearchQuery(e.target.value)}
                  onClear={() => setLabSearchQuery('')}
                  placeholder="Search lab name, subject, faculty..."
                  size="sm"
                  resultCount={filteredLabs.length}
                  totalCount={labs.length}
                />
              </div>
            </div>

            {filteredLabs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No laboratory courses match the search query.</p>
                {labSearchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setLabSearchQuery('')}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLabs.map(lab => {
                const statusBadge = getStatusBadge(lab.status);
                return (
                  <div key={lab.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {lab.subjectCode} • Sem {lab.semester}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1.5">{lab.labName}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${statusBadge}`}>
                          {lab.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mb-4">
                        Faculty In-Charge: <strong className="text-slate-800">{lab.assignedFaculty}</strong>
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Practical Sessions Held:</span>
                          <span className="font-extrabold text-slate-900">{lab.completedSessions} / {lab.totalPlannedSessions} ({lab.completionPercentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${lab.completionPercentage >= 80 ? 'bg-emerald-500' : (lab.completionPercentage >= 70 ? 'bg-amber-500' : 'bg-rose-500')}`}
                            style={{ width: `${lab.completionPercentage}%` }} 
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1 mb-4">
                        <div className="flex justify-between">
                          <span>Pending Sessions:</span>
                          <strong className="text-rose-600 font-bold">{lab.pendingSessions} remaining</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Completion Date:</span>
                          <span className="text-slate-700 font-semibold">{lab.targetDate}</span>
                        </div>
                        {lab.remarks && (
                          <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-2">
                            {lab.remarks}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Last Session: {lab.lastSessionDate || 'Recent'}</span>
                      <button
                        onClick={() => handleOpenLogLab(lab)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Session</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: INTERNAL ASSESSMENT TRACKING */}
      {activeSection === 'assessments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900">Department Internal Assessment Milestones</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mid-terms, lab viva, and continuous evaluation deadlines across {selectedDept}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">{assessments.length} assessments scheduled</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Assessment Type</th>
                    <th className="py-3 px-4">Planned Date</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Max Marks</th>
                    <th className="py-3 px-4">Faculty In-Charge</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.map(asm => {
                    const isCompleted = asm.status === 'Completed';
                    const isOverdue = asm.status === 'Overdue';
                    return (
                      <tr key={asm.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{asm.subjectCode}</div>
                          <div className="text-[11px] text-slate-500">{asm.subjectName}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">Sem {asm.semester}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800">{asm.assessmentName}</span>
                          <span className="text-[10px] text-slate-400 block">{asm.assessmentType}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">{asm.plannedDate}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{asm.deadline}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">{asm.maxMarks} Marks</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{asm.assignedFaculty}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : (isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800')
                          }`}>
                            {asm.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isCompleted ? (
                            <button
                              onClick={() => handleMarkAssessmentCompleted(asm.id, asm.assessmentName)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          ) : (
                            <span className="text-emerald-600 text-[11px] font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </span>
                          )}
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

      {/* SECTION 4: ACADEMIC DEADLINES CALENDAR */}
      {activeSection === 'deadlines' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Academic Deadlines & Department Milestones</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Chronological schedule of syllabus completion milestones, lab sign-offs, and exam submissions
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {deadlines.map(dl => {
                const isOverdue = dl.status === 'Overdue';
                const isCompleted = dl.status === 'Completed';
                return (
                  <div
                    key={dl.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                      isOverdue 
                        ? 'bg-rose-50/50 border-rose-200' 
                        : (isCompleted ? 'bg-slate-50/60 border-slate-200 opacity-70' : 'bg-white border-slate-200 shadow-xs')
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isOverdue ? 'bg-rose-100 text-rose-700' : (isCompleted ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-700')
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-sm">{dl.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                            {dl.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            dl.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {dl.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{dl.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:text-right">
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">Due: {dl.targetDate}</div>
                        <span className={`text-[11px] font-bold block ${
                          isOverdue ? 'text-rose-600' : (isCompleted ? 'text-slate-400' : 'text-indigo-600')
                        }`}>
                          {isOverdue ? 'OVERDUE' : (isCompleted ? 'Completed' : 'Upcoming')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: BEHIND-SCHEDULE ACTIONABLE ALERTS */}
      {activeSection === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Behind-Schedule Remedial Interventions</span>
                  {alerts.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                      {alerts.length} Action Items
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Subjects and practical labs falling behind expected syllabus coverage and target milestones
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                        {alert.type}
                      </span>
                      <span className="font-black text-slate-900 text-sm">{alert.title}</span>
                      <span className="text-xs text-slate-500">• Semester {alert.semester}</span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-4">
                      <span>Faculty: <strong className="text-slate-800">{alert.assignedFaculty}</strong></span>
                      <span>Target Date: <strong className="text-slate-800">{alert.targetDate}</strong></span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-rose-100 text-xs space-y-1">
                      <div className="font-bold text-rose-700 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Deficit Reason: {alert.reason}</span>
                      </div>
                      <div className="font-semibold text-slate-700">
                        Recommended Action: {alert.recommendedAction}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-2">
                    <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-xs">
                      {alert.gapPercentage}% Lag
                    </span>
                    <button
                      onClick={() => showNotification('success', `Remedial lecture notification dispatched to ${alert.assignedFaculty}.`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Acknowledge & Schedule Extra Class
                    </button>
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="p-12 text-center text-emerald-700 font-bold text-xs bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <span>Excellent! All theory subjects and laboratories are pacing strictly on schedule in {selectedDept}.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIGURE NEW SYLLABUS TARGET */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900 mb-1">Establish Syllabus Completion Target</h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure department syllabus delivery targets and milestone deadlines for {selectedDept} (AY {selectedYear})
            </p>

            {targetFormError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{targetFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTarget} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Department</label>
                  <input
                    type="text"
                    disabled
                    value={selectedDept}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    disabled
                    value={selectedYear}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Semester *</label>
                <select
                  value={targetForm.semester}
                  onChange={(e) => setTargetForm(f => ({ ...f, semester: Number(e.target.value), subjectCode: '' }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {SEMESTERS.map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Subject *</label>
                <select
                  value={targetForm.subjectCode}
                  onChange={handleSubjectSelectChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {availableSubjectsForSemester.map(sub => (
                    <option key={sub.code} value={sub.code}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Assigned Faculty *</label>
                  <input
                    type="text"
                    required
                    value={targetForm.assignedFaculty}
                    onChange={(e) => setTargetForm(f => ({ ...f, assignedFaculty: e.target.value }))}
                    placeholder="e.g. Dr. Neha Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Total Units *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={targetForm.totalUnits}
                    onChange={(e) => setTargetForm(f => ({ ...f, totalUnits: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Target % *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={targetForm.targetPercentage}
                    onChange={(e) => setTargetForm(f => ({ ...f, targetPercentage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Planned % *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={targetForm.plannedPercentage}
                    onChange={(e) => setTargetForm(f => ({ ...f, plannedPercentage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={targetForm.targetDate}
                    onChange={(e) => setTargetForm(f => ({ ...f, targetDate: e.target.value }))}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG LAB PRACTICAL SESSION */}
      {isLogLabModalOpen && selectedLabForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">Log Practical Session</h3>
            <p className="text-xs text-slate-500 mb-4">
              Recording completion for {selectedLabForLog.subjectCode}: {selectedLabForLog.labName}
            </p>

            <form onSubmit={handleSaveLabSession} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Session Date *</label>
                <input
                  type="date"
                  required
                  value={labForm.sessionDate}
                  onChange={(e) => setLabForm(f => ({ ...f, sessionDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Experiment / Topic Conducted *</label>
                <input
                  type="text"
                  required
                  value={labForm.topicVerified}
                  onChange={(e) => setLabForm(f => ({ ...f, topicVerified: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Student Batch Handled</label>
                <input
                  type="text"
                  value={labForm.batchCode}
                  onChange={(e) => setLabForm(f => ({ ...f, batchCode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-900 text-xs flex justify-between">
                <span>Total Sessions After Update:</span>
                <strong className="font-extrabold">{selectedLabForLog.completedSessions + 1} / {selectedLabForLog.totalPlannedSessions}</strong>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogLabModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                >
                  Confirm & Log Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
