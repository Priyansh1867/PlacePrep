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
  Loader2
} from 'lucide-react';
import {
  SHORTAGE_THRESHOLD_PERCENT,
  ACADEMIC_YEARS,
  DEPARTMENTS,
  CLASS_PERIODS,
  CLASS_SECTIONS,
  getSubjectsForDeptAndSemester,
  fetchClassRoster,
  findOrCreateSession,
  saveClassAttendance,
  fetchSessionRecords,
  fetchAttendanceReport,
  exportAttendanceReportToCSV
} from '../../services/attendanceStorage';
import { getCurrentUser, setCurrentUser, setPortalRole } from '../../services/storage';
import { AuthApi } from '../../services/api';

export default function DailyAttendancePortalView({ onNavigate: _onNavigate }) {
  // Current logged in user & role
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());
  const [activeRole, setActiveRole] = useState(currentUser.role || 'teacher');

  // View Mode: 'marking' (speed marking) vs 'report' (cumulative shortage report)
  const [viewMode, setViewMode] = useState('marking');

  // Cascading Selection State
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedYear, setSelectedYear] = useState('3'); // 3rd Year
  const [selectedSemester, setSelectedSemester] = useState('6'); // Sem 6
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CS306');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedPeriod, setSelectedPeriod] = useState(2);
  const [sessionDate, setSessionDate] = useState('2026-10-22');

  // Unsaved changes dirty tracking
  const [isDirty, setIsDirty] = useState(false);
  const [pendingClassChange, setPendingClassChange] = useState(null);
  const [showDirtyModal, setShowDirtyModal] = useState(false);

  // Loaded data
  const [roster, setRoster] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: { status, remarks } }
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [cumulativeReport, setCumulativeReport] = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('ALL'); // 'ALL', 'SHORTAGE', 'ELIGIBLE'

  // Available Semesters for selected year
  const availableSemesters = useMemo(() => {
    const yr = ACADEMIC_YEARS.find(y => y.id === selectedYear);
    return yr ? yr.semesters : [1, 2];
  }, [selectedYear]);

  // Available Subjects for selected department & semester (cascading)
  const availableSubjects = useMemo(() => {
    return getSubjectsForDeptAndSemester(selectedDept, selectedSemester);
  }, [selectedDept, selectedSemester]);

  // Current Subject Object
  const currentSubject = useMemo(() => {
    return availableSubjects.find(s => s.code === selectedSubjectCode) || availableSubjects[0] || {
      code: selectedSubjectCode,
      name: 'Cloud Computing & Distributed Systems'
    };
  }, [availableSubjects, selectedSubjectCode]);

  // Check if current user is authorized to manage/mark attendance
  const isAuthorized = activeRole === 'teacher' || activeRole === 'hod' || activeRole === 'admin' || activeRole === 'faculty';

  // Quick Demo Role Switcher
  const handleSwitchDemoRole = async (newRole) => {
    setActiveRole(newRole);
    setPortalRole(newRole);
    let updatedUser = { ...currentUser, role: newRole };
    if (newRole === 'teacher') {
      updatedUser.name = 'Dr. Neha Sharma';
      updatedUser.email = 'teacher@placeprep.com';
    } else if (newRole === 'hod') {
      updatedUser.name = 'Prof. Alok Verma';
      updatedUser.email = 'hod@placeprep.com';
    } else if (newRole === 'student') {
      updatedUser.name = 'Priyansh Jain';
      updatedUser.email = 'priyansh.jain@example.edu';
    }
    setCurrentUser(updatedUser);
    setCurrentUserState(updatedUser);

    // Call demoLogin in background to acquire role JWT token from backend
    try {
      await AuthApi.demoLogin(newRole);
    } catch {
      // Offline fallback
    }

    showToast(`Switched active portal view to: ${newRole.toUpperCase()}`, 'info');
  };

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Handle Cascading Changes with Dirty-check
  const requestClassChange = (changeCallback) => {
    if (isDirty) {
      setPendingClassChange(() => changeCallback);
      setShowDirtyModal(true);
    } else {
      changeCallback();
    }
  };

  const confirmDiscardChanges = () => {
    setShowDirtyModal(false);
    setIsDirty(false);
    if (pendingClassChange) {
      pendingClassChange();
      setPendingClassChange(null);
    }
  };

  const cancelDiscardChanges = () => {
    setShowDirtyModal(false);
    setPendingClassChange(null);
  };

  // Update Year & auto-select its first semester
  const handleYearChange = (newYear) => {
    requestClassChange(() => {
      setSelectedYear(newYear);
      const yr = ACADEMIC_YEARS.find(y => y.id === newYear);
      if (yr && yr.semesters && yr.semesters.length > 0) {
        setSelectedSemester(String(yr.semesters[0]));
      }
    });
  };

  // Update Department
  const handleDeptChange = (newDept) => {
    requestClassChange(() => {
      setSelectedDept(newDept);
    });
  };

  // Update Semester
  const handleSemesterChange = (newSem) => {
    requestClassChange(() => {
      setSelectedSemester(newSem);
    });
  };

  // Keep selected subject code in sync with available subjects
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const match = availableSubjects.find(s => s.code === selectedSubjectCode);
      if (!match) {
        setSelectedSubjectCode(availableSubjects[0].code);
      }
    }
  }, [availableSubjects, selectedSubjectCode]);

  // Load Roster & Existing Session Attendance
  const loadClassData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Roster
      const loadedRoster = await fetchClassRoster(selectedDept, selectedSemester);
      setRoster(loadedRoster);

      // 2. Find or create session
      const session = await findOrCreateSession({
        department: selectedDept,
        semester: selectedSemester,
        subjectCode: currentSubject?.code || selectedSubjectCode,
        subjectName: currentSubject?.name || 'Class Subject',
        section: selectedSection,
        periodNumber: selectedPeriod,
        sessionDate: sessionDate,
        facultyName: currentUser?.name || 'Dr. Neha Sharma',
        facultyId: currentUser?.email || 'FAC-CSE-042'
      });

      setCurrentSessionId(session?.id || null);

      // 3. Fetch records for this session
      const initialMap = {};
      // Default state: UNMARKED (so students are not silently recorded as present)
      loadedRoster.forEach(s => {
        initialMap[s.studentId] = {
          status: 'UNMARKED',
          remarks: ''
        };
      });

      if (session?.id) {
        const savedRecs = await fetchSessionRecords(session.id);
        savedRecs.forEach(r => {
          if (r.studentId) {
            initialMap[r.studentId] = {
              status: r.status || 'UNMARKED',
              remarks: r.remarks || ''
            };
          }
        });
      }

      setAttendanceRecords(initialMap);
      setIsDirty(false);

      // 4. Fetch cumulative report for this class
      const report = await fetchAttendanceReport({
        department: selectedDept,
        semester: selectedSemester,
        subjectCode: currentSubject?.code || selectedSubjectCode,
        targetDate: sessionDate
      });
      setCumulativeReport(report);
    } catch (e) {
      console.error('Error loading attendance data:', e);
      showToast('Error loading roster records. Using offline data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDept, selectedSemester, selectedSubjectCode, currentSubject, selectedSection, selectedPeriod, sessionDate, currentUser]);

  // Re-load when class selection or date changes
  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  // One-Click Status Toggle for a student
  const handleToggleStatus = (studentId, newStatus) => {
    if (!isAuthorized) {
      showToast('Attendance marking is restricted to Teachers and HODs. Switch role to test.', 'error');
      return;
    }
    setAttendanceRecords(prev => {
      const current = prev[studentId] || { status: 'UNMARKED', remarks: '' };
      // If clicking the already selected status, toggle to UNMARKED
      const updatedStatus = current.status === newStatus ? 'UNMARKED' : newStatus;
      return {
        ...prev,
        [studentId]: {
          ...current,
          status: updatedStatus
        }
      };
    });
    setIsDirty(true);
  };

  // Row-level remark change
  const handleRemarkChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'UNMARKED' }),
        remarks
      }
    }));
    setIsDirty(true);
  };

  // Bulk: Mark All Present
  const handleMarkAllPresent = () => {
    if (!isAuthorized) return;
    setAttendanceRecords(prev => {
      const next = { ...prev };
      roster.forEach(stu => {
        next[stu.studentId] = {
          ...(next[stu.studentId] || {}),
          status: 'PRESENT'
        };
      });
      return next;
    });
    setIsDirty(true);
    showToast(`Marked all ${roster.length} students as PRESENT`, 'info');
  };

  // Bulk: Reset All (Unmark)
  const handleResetAll = () => {
    if (!isAuthorized) return;
    if (window.confirm('Reset all attendance statuses in this session to UNMARKED? Previously saved records will not be deleted until you click Save.')) {
      setAttendanceRecords(prev => {
        const next = { ...prev };
        roster.forEach(stu => {
          next[stu.studentId] = {
            ...(next[stu.studentId] || {}),
            status: 'UNMARKED'
          };
        });
        return next;
      });
      setIsDirty(true);
    }
  };

  // Save Attendance Action
  const handleSaveAttendance = async () => {
    if (!isAuthorized) {
      showToast('Unauthorized: Only Teachers and HODs can save attendance.', 'error');
      return;
    }

    if (!currentSessionId) {
      showToast('Invalid class session. Please re-select parameters.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const recordsToSave = roster.map(stu => {
        const entry = attendanceRecords[stu.studentId] || { status: 'UNMARKED', remarks: '' };
        return {
          sessionId: currentSessionId,
          studentId: stu.studentId,
          studentRollNumber: stu.rollNumber,
          studentName: stu.name,
          status: entry.status || 'UNMARKED',
          remarks: entry.remarks || ''
        };
      });

      await saveClassAttendance(currentSessionId, recordsToSave);
      setIsDirty(false);
      showToast(`Daily class attendance successfully recorded for ${roster.length} students!`, 'success');

      // Refresh report
      const updatedReport = await fetchAttendanceReport({
        department: selectedDept,
        semester: selectedSemester,
        subjectCode: currentSubject?.code || selectedSubjectCode,
        targetDate: sessionDate
      });
      setCumulativeReport(updatedReport);
    } catch (e) {
      console.error('Failed to save attendance:', e);
      showToast('Failed to save attendance records. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Real-time Counts for the current session
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let unmarked = 0;

    roster.forEach(stu => {
      const st = attendanceRecords[stu.studentId]?.status || 'UNMARKED';
      if (st === 'PRESENT') present++;
      else if (st === 'ABSENT') absent++;
      else if (st === 'LATE') late++;
      else unmarked++;
    });

    const markedTotal = present + absent + late;
    const rate = markedTotal > 0 ? Math.round(((present + late) / markedTotal) * 100) : 0;

    return {
      total: roster.length,
      present,
      absent,
      late,
      unmarked,
      rate
    };
  }, [roster, attendanceRecords]);

  // Filtered Roster for Speed Marking Table
  const filteredRoster = useMemo(() => {
    if (!searchFilter.trim()) return roster;
    const q = searchFilter.toLowerCase();
    return roster.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q)
    );
  }, [roster, searchFilter]);

  // Filtered Report Rows for Roster Report
  const filteredReportRows = useMemo(() => {
    if (!cumulativeReport || !cumulativeReport.roster) return [];
    let rows = cumulativeReport.roster;

    if (reportStatusFilter === 'SHORTAGE') {
      rows = rows.filter(r => r.shortageWarning);
    } else if (reportStatusFilter === 'ELIGIBLE') {
      rows = rows.filter(r => !r.shortageWarning);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.rollNumber.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [cumulativeReport, reportStatusFilter, searchFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all transform animate-bounce ${
          toastMsg.type === 'error'
            ? 'bg-rose-900 text-rose-100 border border-rose-700'
            : toastMsg.type === 'info'
            ? 'bg-sky-900 text-sky-100 border border-sky-700'
            : 'bg-emerald-900 text-emerald-100 border border-emerald-700'
        }`}>
          {toastMsg.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-300" /> : <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
          <span>{toastMsg.message}</span>
        </div>
      )}

      {/* Dirty-Check Warning Modal */}
      {showDirtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2">Unsaved Attendance Changes</h4>
            <p className="text-sm text-slate-600 mb-6">
              You have marked attendance changes that have not yet been saved. Switching classes will discard these changes. Do you want to proceed?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelDiscardChanges}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmDiscardChanges}
                className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-md transition-colors"
              >
                Discard & Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Title & Demo Role Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>FACULTY ACADEMIC WORKSPACE</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              Mandatory Shortage Threshold: {SHORTAGE_THRESHOLD_PERCENT}%
            </span>
            {isDirty && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>Unsaved Edits</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Daily Class Attendance Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Speed attendance marking, cascading syllabus roster selectors, and real-time attendance shortage radar for Teachers & HODs.
          </p>
        </div>

        {/* Demo Role Switcher (per requirement 4: reuse roles, test easily without breaking permissions) */}
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex flex-col gap-1.5 shrink-0 w-full sm:w-auto">
          <div className="flex items-center justify-between gap-3 px-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Active Role:</span>
            </span>
            <span className="text-xs font-black text-slate-900 capitalize bg-white px-2 py-0.5 rounded-lg border border-slate-200">
              {currentUser.name} ({activeRole})
            </span>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleSwitchDemoRole('teacher')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeRole === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Teacher View
            </button>
            <button
              onClick={() => handleSwitchDemoRole('hod')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeRole === 'hod'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              HOD View
            </button>
            <button
              onClick={() => handleSwitchDemoRole('student')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeRole === 'student'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Student View
            </button>
          </div>
        </div>
      </div>

      {/* Student Advisory Mode Notice if active role is student */}
      {!isAuthorized && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <strong className="font-bold">Student Advisory Mode:</strong> You are viewing attendance records as an enrolled student. You can inspect subject rosters and verify your cumulative attendance percentage, but status marking controls are disabled. Teachers and HODs have authorization to mark and submit daily attendance.
          </div>
        </div>
      )}

      {/* A. CLASS ROSTER SELECTOR (Cascading dropdowns) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Class Roster Selector</h2>
              <p className="text-xs text-slate-500">Configure department, academic year, semester, and cascading subject roster</p>
            </div>
          </div>

          {/* View Mode Switcher: Speed Marking vs Shortage Report */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('marking')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                viewMode === 'marking'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Speed Attendance Marking</span>
            </button>
            <button
              onClick={() => setViewMode('report')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                viewMode === 'report'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Attendance Roster Report</span>
              {cumulativeReport?.shortageCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {cumulativeReport.shortageCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cascading Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Department / Branch <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept.code} value={dept.code}>
                  {dept.code} — {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Academic Year <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {ACADEMIC_YEARS.map(yr => (
                <option key={yr.id} value={yr.id}>
                  {yr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Semester (Cascades from Year) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Semester <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {availableSemesters.map(sem => (
                <option key={sem} value={String(sem)}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Subject (Cascades from Department & Semester) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedSubjectCode}
              onChange={(e) => {
                const code = e.target.value;
                requestClassChange(() => setSelectedSubjectCode(code));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {availableSubjects.map(sub => (
                <option key={sub.code} value={sub.code}>
                  {sub.code}: {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Parameters: Date, Section, Period */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Session Date <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => {
                const d = e.target.value;
                requestClassChange(() => setSessionDate(d));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                const sec = e.target.value;
                requestClassChange(() => setSelectedSection(sec));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {CLASS_SECTIONS.map(sec => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Period Band</span>
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => {
                const p = parseInt(e.target.value, 10);
                requestClassChange(() => setSelectedPeriod(p));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {CLASS_PERIODS.map(p => (
                <option key={p.period} value={p.period}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Class Clear Information Badge */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs">
              {selectedDept} • Sem {selectedSemester} • Sec {selectedSection}
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              {currentSubject.code}: {currentSubject.name}
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-slate-600 font-medium">
              Period {selectedPeriod} ({CLASS_PERIODS.find(p => p.period === selectedPeriod)?.time})
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-slate-600 font-medium">
              Date: <strong className="text-slate-900">{sessionDate}</strong>
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Enrolled: <strong className="text-slate-900 font-bold">{roster.length} students</strong>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: SPEED ATTENDANCE MARKING */}
      {viewMode === 'marking' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
              <span className="text-xs text-slate-500 block font-semibold mb-1">Total Enrolled</span>
              <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            </div>
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 shadow-sm text-center">
              <span className="text-xs text-emerald-700 block font-bold mb-1">Present</span>
              <span className="text-2xl font-black text-emerald-700">{stats.present}</span>
            </div>
            <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200 shadow-sm text-center">
              <span className="text-xs text-rose-700 block font-bold mb-1">Absent</span>
              <span className="text-2xl font-black text-rose-700">{stats.absent}</span>
            </div>
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 shadow-sm text-center">
              <span className="text-xs text-amber-800 block font-bold mb-1">Late</span>
              <span className="text-2xl font-black text-amber-700">{stats.late}</span>
            </div>
            <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
              <span className="text-xs text-slate-600 block font-bold mb-1">Unmarked</span>
              <span className="text-2xl font-black text-slate-700">{stats.unmarked}</span>
            </div>
            <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-200 shadow-sm text-center">
              <span className="text-xs text-indigo-700 block font-bold mb-1">Session Rate</span>
              <span className="text-2xl font-black text-indigo-700">{stats.rate}%</span>
            </div>
          </div>

          {/* Speed Attendance Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Actions Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by student name or roll #..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                  />
                </div>
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                {isLoading && (
                  <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading roster...</span>
                  </span>
                )}
              </div>

              {/* Bulk Actions & Save Button */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                <button
                  onClick={handleMarkAllPresent}
                  disabled={!isAuthorized}
                  className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  onClick={handleResetAll}
                  disabled={!isAuthorized}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
                <button
                  onClick={handleSaveAttendance}
                  disabled={!isAuthorized || isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Records...' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4 text-center">One-Click Status Toggle</th>
                    <th className="py-3.5 px-4">Feedback / Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        No students found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((student, idx) => {
                      const entry = attendanceRecords[student.studentId] || { status: 'UNMARKED', remarks: '' };
                      const currentStatus = entry.status || 'UNMARKED';

                      return (
                        <tr
                          key={student.studentId}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-50/20'
                              : currentStatus === 'ABSENT'
                              ? 'bg-rose-50/20'
                              : currentStatus === 'LATE'
                              ? 'bg-amber-50/20'
                              : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                            <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                              {student.rollNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-400">{student.email}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {/* One-Click Status Controls: Present (Green), Absent (Red), Late (Yellow), Unmarked */}
                            <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                              {/* Present (Green) */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.studentId, 'PRESENT')}
                                disabled={!isAuthorized}
                                title="Mark Present (Green)"
                                className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all flex items-center gap-1 ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                                    : 'text-emerald-700 hover:bg-emerald-100/70'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Present</span>
                              </button>

                              {/* Absent (Red) */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.studentId, 'ABSENT')}
                                disabled={!isAuthorized}
                                title="Mark Absent (Red)"
                                className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all flex items-center gap-1 ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30'
                                    : 'text-rose-700 hover:bg-rose-100/70'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Absent</span>
                              </button>

                              {/* Late (Yellow) */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student.studentId, 'LATE')}
                                disabled={!isAuthorized}
                                title="Mark Late (Yellow)"
                                className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all flex items-center gap-1 ${
                                  currentStatus === 'LATE'
                                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/30'
                                    : 'text-amber-800 hover:bg-amber-100/70'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Late</span>
                              </button>

                              {/* Default / Unmarked indicator */}
                              {currentStatus === 'UNMARKED' && (
                                <span className="px-2 py-1 text-[11px] font-bold text-slate-500 bg-white rounded-lg border border-slate-200">
                                  Unmarked
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={entry.remarks || ''}
                              onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                              disabled={!isAuthorized}
                              placeholder="Optional remarks (e.g. 10m late, sports leave)"
                              className="w-full max-w-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Table Toolbar */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>Showing {filteredRoster.length} of {roster.length} students</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2"></span> Absent
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Late
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ml-2"></span> Unmarked
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAttendance}
                  disabled={!isAuthorized || isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ATTENDANCE ROSTER REPORT (<75% SHORTAGE RADAR) */}
      {viewMode === 'report' && (
        <div className="space-y-6">
          {/* Shortage Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Classes Held</span>
                <span className="text-3xl font-black text-slate-900">{cumulativeReport?.classesHeld || 0}</span>
                <span className="text-[11px] text-slate-400 block mt-1">Recorded class sessions</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Enrolled Students</span>
                <span className="text-3xl font-black text-slate-900">{cumulativeReport?.totalStudents || roster.length}</span>
                <span className="text-[11px] text-slate-400 block mt-1">In {selectedDept} Sem {selectedSemester}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-rose-50/70 rounded-2xl p-5 border border-rose-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-700 block mb-1">Shortage Flagged (&lt;75%)</span>
                <span className="text-3xl font-black text-rose-700">{cumulativeReport?.shortageCount || 0}</span>
                <span className="text-[11px] text-rose-600 block mt-1">Require academic notice</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 block mb-1">Average Attendance</span>
                <span className="text-3xl font-black text-emerald-700">{cumulativeReport?.averageAttendance || 100}%</span>
                <span className="text-[11px] text-emerald-600 block mt-1">Across all enrolled students</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Shortage Warning Banner */}
          {cumulativeReport?.shortageCount > 0 && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-rose-900">
                  Attendance Shortage Warning: {cumulativeReport.shortageCount} Student(s) Strictly Below 75%
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  University and AICTE regulations require a minimum 75.0% cumulative attendance for semester exam and campus placement drive eligibility. Students marked at exactly 75.0% meet the threshold; students strictly below 75% are highlighted below for immediate remedial counseling.
                </p>
              </div>
            </div>
          )}

          {/* Roster Report Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Report Toolbar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search report by name or roll..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Filter buttons: All vs Shortage vs Eligible */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setReportStatusFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      reportStatusFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Students
                  </button>
                  <button
                    onClick={() => setReportStatusFilter('SHORTAGE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      reportStatusFilter === 'SHORTAGE'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-rose-700 hover:bg-rose-100/50'
                    }`}
                  >
                    Shortage (&lt;75%)
                  </button>
                  <button
                    onClick={() => setReportStatusFilter('ELIGIBLE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      reportStatusFilter === 'ELIGIBLE'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-700 hover:bg-emerald-100/50'
                    }`}
                  >
                    Eligible (≥75%)
                  </button>
                </div>
              </div>

              {/* Export to CSV */}
              <button
                onClick={() => exportAttendanceReportToCSV(cumulativeReport, currentSubject?.name)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Export Report to CSV</span>
              </button>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Roll Number</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4 text-center">Classes Attended</th>
                    <th className="py-3.5 px-4 text-center">Classes Held</th>
                    <th className="py-3.5 px-4 text-center">Attendance %</th>
                    <th className="py-3.5 px-4 text-center">Current Status ({sessionDate})</th>
                    <th className="py-3.5 px-4 text-center">Eligibility / Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReportRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No report rows matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredReportRows.map((row, idx) => {
                      const isShortage = row.shortageWarning;
                      const isExact75 = row.attendancePercentage === 75.0 && row.classesHeld > 0;

                      return (
                        <tr
                          key={row.studentId}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isShortage ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                              {row.rollNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{row.name}</div>
                            <div className="text-[11px] text-slate-400">{row.email}</div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {row.classesAttended}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-600">
                            {row.classesHeld}
                          </td>
                          <td className="py-3 px-4 text-center font-black">
                            <span className={`px-2.5 py-1 rounded-lg text-xs ${
                              row.classesHeld === 0
                                ? 'bg-slate-100 text-slate-600'
                                : isShortage
                                ? 'bg-rose-100 text-rose-800 font-black'
                                : isExact75
                                ? 'bg-amber-100 text-amber-900 font-black'
                                : 'bg-emerald-100 text-emerald-800 font-black'
                            }`}>
                              {row.classesHeld === 0 ? 'N/A (0 held)' : `${row.attendancePercentage}%`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              row.currentStatus === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.currentStatus === 'ABSENT'
                                ? 'bg-rose-100 text-rose-800'
                                : row.currentStatus === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {row.currentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {row.classesHeld === 0 ? (
                              <span className="text-slate-400 font-medium text-xs">
                                No sessions recorded
                              </span>
                            ) : isShortage ? (
                              /* Visible alert for strictly below 75% per requirement */
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-xs">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Shortage (&lt;75%)</span>
                              </span>
                            ) : isExact75 ? (
                              /* Boundary test: Exactly 75.0% is NOT flagged as shortage */
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                                <span>75.0% Minimum Met</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Eligible</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Report Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                Formula: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700">Attendance % = (Classes Attended / Classes Held) × 100</code>
              </div>
              <div>
                * Both <strong className="text-emerald-700">Present</strong> and <strong className="text-amber-700">Late</strong> count towards Attended Classes.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
