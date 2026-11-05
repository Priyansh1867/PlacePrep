import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  History,
  Send,
  Users,
  RotateCcw,
  RotateCw,
  Download,
  Trash2,
  Edit2,
  Copy,
  Archive,
  Search,
  BarChart2,
  CalendarCheck
} from 'lucide-react';
import { MasterTimetableApi, downloadFileBlob } from '../../services/api';
import TimetableGrid from '../timetable/TimetableGrid';
import SlotDialog from '../timetable/SlotDialog';
import ClashPanel from '../timetable/ClashPanel';
import ImportWizard from '../timetable/ImportWizard';
import VersionHistory from '../timetable/VersionHistory';
import PublishDialog from '../timetable/PublishDialog';
import ReferenceDataDrawer from '../timetable/ReferenceDataDrawer';
import StudentsGroupModal from '../timetable/StudentsGroupModal';
import AcademicCalendarManager from '../timetable/AcademicCalendarManager';
import TimetableReportsView from '../timetable/TimetableReportsView';
import AvailabilityHeatmap from '../timetable/AvailabilityHeatmap';
import AuditTrailView from '../timetable/AuditTrailView';

export default function MasterTimetableManagement({ currentUser }) {
  // Navigation: 'overview' | 'editor' | 'substitutions'
  const [activeView, setActiveView] = useState('overview');

  // KPI Stats
  const [stats, setStats] = useState({
    publishedCount: 0,
    draftCount: 0,
    openClashCount: 0,
    sectionsWithoutTimetableCount: 0,
    pendingSubstitutionsCount: 0,
    totalTimetables: 0
  });

  // Timetables List State
  const [timetables, setTimetables] = useState([]);
  const [loadingTimetables, setLoadingTimetables] = useState(true);
  const [timetableError, setTimetableError] = useState('');
  const [filters, setFilters] = useState({
    session: '2026-27',
    term: '',
    department: currentUser?.department || '',
    status: '',
    search: ''
  });

  // Active Timetable Editor State
  const [activeTimetableId, setActiveTimetableId] = useState(null);
  const [timetableDetail, setTimetableDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Editor View Switcher
  const [editorMode, setEditorMode] = useState('section'); // 'section' | 'group' | 'faculty' | 'room'
  const [selectedSectionName, setSelectedSectionName] = useState('A');
  const [selectedGroupCode, setSelectedGroupCode] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Clashes & Conflict Engine State
  const [conflicts, setConflicts] = useState([]);
  const [showClashPanel, setShowClashPanel] = useState(true);
  const [highlightedSlotId, setHighlightedSlotId] = useState(null);

  // Undo / Redo Stacks (Max 20 edits)
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Modals & Drawers
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showRefDrawer, setShowRefDrawer] = useState(false);
  const [refDrawerTab, setRefDrawerTab] = useState('subjects');
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [slotDialogInitial, setSlotDialogInitial] = useState(null);

  // Substitutions Queue State
  const [substitutions, setSubstitutions] = useState([]);
  const [loadingSubstitutions, setLoadingSubstitutions] = useState(false);

  // 409 Stale version conflict reload dialog
  const [staleConflictNotice, setStaleConflictNotice] = useState(null);

  // Load Overview Data (KPIs + List)
  const loadOverviewData = useCallback(async () => {
    setLoadingTimetables(true);
    setTimetableError('');
    try {
      const [statsData, listData] = await Promise.all([
        MasterTimetableApi.getStats().catch(() => ({})),
        MasterTimetableApi.listTimetables(filters).catch(() => [])
      ]);

      const safeList = Array.isArray(listData) ? listData : (listData?.content || []);
      setStats(statsData || {});
      setTimetables(safeList);
    } catch (err) {
      setTimetableError(err.message || 'Failed to load timetable management data.');
    } finally {
      setLoadingTimetables(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOverviewData();
  }, [loadOverviewData]);

  // Load Timetable Detail for Editor
  const loadTimetableDetail = useCallback(async (id) => {
    if (!id) return;
    setLoadingDetail(true);
    setDetailError('');
    try {
      const [detail, clashList] = await Promise.all([
        MasterTimetableApi.getTimetable(id),
        MasterTimetableApi.validateTimetable(id).catch(() => [])
      ]);

      setTimetableDetail(detail);
      setConflicts(clashList || []);

      // Auto-set selected section name if available
      if (detail.sections && detail.sections.length > 0) {
        setSelectedSectionName(detail.sections[0].name);
      }
    } catch (err) {
      if (err.status === 409) {
        setStaleConflictNotice('This timetable was updated by another administrator. Please reload to see latest edits.');
      } else {
        setDetailError(err.message || 'Failed to load timetable details.');
      }
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const openEditorForTimetable = (id) => {
    setActiveTimetableId(id);
    setActiveView('editor');
    setUndoStack([]);
    setRedoStack([]);
    loadTimetableDetail(id);
  };

  // Load Substitutions Queue
  const loadSubstitutions = async () => {
    setLoadingSubstitutions(true);
    try {
      const list = await MasterTimetableApi.listOverrides();
      setSubstitutions(list || []);
    } catch {
      setSubstitutions([]);
    } finally {
      setLoadingSubstitutions(false);
    }
  };

  // Drag Validation helper
  const handleValidateDropTarget = async (slot, dayOfWeek, periodIndex) => {
    if (!activeTimetableId) return { valid: true };
    try {
      const candidateSlot = {
        ...slot,
        dayOfWeek,
        startPeriod: periodIndex
      };
      const issues = await MasterTimetableApi.validateCandidateSlot(activeTimetableId, {
        slot: candidateSlot,
        candidateDay: dayOfWeek,
        candidatePeriod: periodIndex
      });

      const hardIssues = issues.filter(i => i.severity === 'HARD');
      if (hardIssues.length > 0) {
        return { valid: false, message: hardIssues[0].message };
      }
      return { valid: true, message: 'Valid slot destination' };
    } catch {
      return { valid: true };
    }
  };

  // Slot Move Action (Drag & Drop or Non-Drag "Move...")
  const handleSlotMove = async (slot, targetDay, targetPeriod) => {
    if (!activeTimetableId || !slot) return;
    const oldDay = slot.dayOfWeek;
    const oldPeriod = slot.startPeriod;

    try {
      const updatedSlot = await MasterTimetableApi.moveSlot(activeTimetableId, slot.id, {
        dayOfWeek: targetDay,
        startPeriod: targetPeriod
      });

      // Push to Undo stack
      setUndoStack(prev => [
        { type: 'MOVE', slotId: slot.id, fromDay: oldDay, fromPeriod: oldPeriod, toDay: targetDay, toPeriod: targetPeriod },
        ...prev.slice(0, 19)
      ]);
      setRedoStack([]);

      // Update local state smoothly
      if (timetableDetail?.slots) {
        const nextSlots = timetableDetail.slots.map(s => s.id === slot.id ? updatedSlot : s);
        setTimetableDetail({ ...timetableDetail, slots: nextSlots });
      }

      // Refresh validation clashes in background
      MasterTimetableApi.validateTimetable(activeTimetableId)
        .then(clashes => setConflicts(clashes || []))
        .catch(() => {});
    } catch (err) {
      if (err.status === 409) {
        setStaleConflictNotice('Conflict 409: Another administrator made changes. Please reload to sync.');
      } else {
        alert(err.message || 'Cannot move slot due to scheduling clash.');
      }
    }
  };

  // Undo and Redo Logic (replays inverse API calls)
  const handleUndo = async () => {
    if (undoStack.length === 0 || !activeTimetableId) return;
    const [action, ...remainingUndo] = undoStack;

    if (action.type === 'MOVE') {
      try {
        const reverted = await MasterTimetableApi.moveSlot(activeTimetableId, action.slotId, {
          dayOfWeek: action.fromDay,
          startPeriod: action.fromPeriod
        });

        setUndoStack(remainingUndo);
        setRedoStack(prev => [action, ...prev.slice(0, 19)]);

        if (timetableDetail?.slots) {
          const nextSlots = timetableDetail.slots.map(s => s.id === action.slotId ? reverted : s);
          setTimetableDetail({ ...timetableDetail, slots: nextSlots });
        }
      } catch (err) {
        alert('Undo failed: ' + err.message);
      }
    }
  };

  const handleRedo = async () => {
    if (redoStack.length === 0 || !activeTimetableId) return;
    const [action, ...remainingRedo] = redoStack;

    if (action.type === 'MOVE') {
      try {
        const reapplied = await MasterTimetableApi.moveSlot(activeTimetableId, action.slotId, {
          dayOfWeek: action.toDay,
          startPeriod: action.toPeriod
        });

        setRedoStack(remainingRedo);
        setUndoStack(prev => [action, ...prev.slice(0, 19)]);

        if (timetableDetail?.slots) {
          const nextSlots = timetableDetail.slots.map(s => s.id === action.slotId ? reapplied : s);
          setTimetableDetail({ ...timetableDetail, slots: nextSlots });
        }
      } catch (err) {
        alert('Redo failed: ' + err.message);
      }
    }
  };

  // Slot Save (Create / Update)
  const handleSaveSlot = async (slotData) => {
    if (!activeTimetableId) return;
    if (slotData.id) {
      const updated = await MasterTimetableApi.updateSlot(activeTimetableId, slotData.id, slotData);
      const nextSlots = timetableDetail.slots.map(s => s.id === slotData.id ? updated : s);
      setTimetableDetail({ ...timetableDetail, slots: nextSlots });
    } else {
      const created = await MasterTimetableApi.createSlot(activeTimetableId, slotData);
      setTimetableDetail({ ...timetableDetail, slots: [...(timetableDetail.slots || []), created] });
    }

    // Refresh clashes
    MasterTimetableApi.validateTimetable(activeTimetableId)
      .then(clashes => setConflicts(clashes || []))
      .catch(() => {});
  };

  // Slot Delete
  const handleDeleteSlot = async (slot) => {
    if (!activeTimetableId || !slot?.id) return;
    if (!window.confirm(`Delete ${slot.subjectName || slot.subjectCode} slot?`)) return;

    try {
      await MasterTimetableApi.deleteSlot(activeTimetableId, slot.id);
      const nextSlots = timetableDetail.slots.filter(s => s.id !== slot.id);
      setTimetableDetail({ ...timetableDetail, slots: nextSlots });

      // Refresh clashes
      MasterTimetableApi.validateTimetable(activeTimetableId)
        .then(clashes => setConflicts(clashes || []))
        .catch(() => {});
    } catch (err) {
      alert('Failed to delete slot: ' + err.message);
    }
  };

  // Export Timetable file download
  const handleExport = async (id, format) => {
    try {
      const blob = await MasterTimetableApi.exportTimetable(id, format, 'all');
      const filename = `timetable_${id}_${new Date().toISOString().slice(0, 10)}.${format}`;
      downloadFileBlob(blob, filename);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  // Clone Timetable
  const handleClone = async (tt) => {
    const nextSession = window.prompt(`Clone timetable "${tt.title}" to which academic session?`, '2027-28');
    if (!nextSession) return;
    try {
      const cloned = await MasterTimetableApi.cloneTimetable(tt.id, { targetSession: nextSession });
      alert('Cloned successfully as draft.');
      loadOverviewData();
      openEditorForTimetable(cloned.id);
    } catch (err) {
      alert('Clone failed: ' + err.message);
    }
  };

  // Revise Timetable (new draft version)
  const handleRevise = async (id) => {
    if (!window.confirm('Create a new working DRAFT revision of this published timetable?')) return;
    try {
      const revised = await MasterTimetableApi.reviseTimetable(id);
      loadOverviewData();
      openEditorForTimetable(revised.id);
    } catch (err) {
      alert('Revise failed: ' + err.message);
    }
  };

  // Unpublish Timetable
  const handleUnpublish = async (id) => {
    if (!window.confirm('Unpublish timetable? Students and faculty will no longer see this schedule.')) return;
    try {
      await MasterTimetableApi.unpublishTimetable(id);
      loadOverviewData();
    } catch (err) {
      alert('Unpublish failed: ' + err.message);
    }
  };

  // Archive Timetable
  const handleArchive = async (id) => {
    if (!window.confirm('Archive timetable? Archived timetables are read-only historical records.')) return;
    try {
      await MasterTimetableApi.archiveTimetable(id);
      loadOverviewData();
    } catch (err) {
      alert('Archive failed: ' + err.message);
    }
  };

  // Delete Timetable
  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Permanently delete this timetable and all its lecture assignments? This action cannot be undone.')) return;
    try {
      await MasterTimetableApi.deleteTimetable(id);
      loadOverviewData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Substitution Approvals
  const handleApproveSub = async (subId) => {
    try {
      await MasterTimetableApi.approveOverride(subId);
      loadSubstitutions();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleRejectSub = async (subId) => {
    const reason = window.prompt('Reason for rejecting substitution request:');
    if (reason === null) return;
    try {
      await MasterTimetableApi.rejectOverride(subId, reason);
      loadSubstitutions();
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    }
  };

  // Filter slots for the active editor view mode
  const displayedSlots = (timetableDetail?.slots || []).filter(s => {
    if (editorMode === 'section') {
      return s.sectionName === selectedSectionName;
    }
    if (editorMode === 'group') {
      return !s.labGroupCode || s.labGroupCode === selectedGroupCode;
    }
    if (editorMode === 'faculty') {
      return selectedFacultyId && s.facultyIds && s.facultyIds.includes(Number(selectedFacultyId));
    }
    if (editorMode === 'room') {
      return selectedRoomId && String(s.roomId) === String(selectedRoomId);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 409 Stale version reload notification modal */}
      {staleConflictNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Concurrent Edit Detected (409)</h3>
              <p className="text-xs text-slate-600 mt-1">{staleConflictNotice}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStaleConflictNotice(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setStaleConflictNotice(null);
                  loadTimetableDetail(activeTimetableId);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs"
              >
                Reload Latest Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar: Views & Global Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-teal-700" />
            <span>Master Timetable Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build, import, validate and publish university class schedules with real-time conflict prevention.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeView === 'editor' && (
            <button
              type="button"
              onClick={() => {
                setActiveView('overview');
                loadOverviewData();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              ← Back to Overview
            </button>
          )}

          {activeView === 'overview' && (
            <button
              type="button"
              onClick={() => setShowImportWizard(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-2 shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Import Schedule (.xlsx / .pdf)</span>
            </button>
          )}

          {activeView !== 'overview' && activeView !== 'editor' && (
            <button
              type="button"
              onClick={() => setActiveView('overview')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              ← Back to Timetables
            </button>
          )}
        </div>
      </div>

      {/* Module Navigation Tabs */}
      {activeView !== 'editor' && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeView === 'overview'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Timetables</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeView === 'calendar'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Academic Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeView === 'reports'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Reports & Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('availability')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeView === 'availability'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Availability Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('substitutions');
              loadSubstitutions();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeView === 'substitutions'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Substitutions Queue</span>
            {stats.pendingSubstitutionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {stats.pendingSubstitutionsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeView === 'audit'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW 1: OVERVIEW & TIMETABLES LIST
      ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">Published</div>
                <div className="text-xl font-black text-slate-900">{stats.publishedCount || 0}</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
                <Edit2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">Drafts</div>
                <div className="text-xl font-black text-slate-900">{stats.draftCount || 0}</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">Open Clashes</div>
                <div className="text-xl font-black text-rose-700">{stats.openClashCount || 0}</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">Missing TT</div>
                <div className="text-xl font-black text-amber-700">{stats.sectionsWithoutTimetableCount || 0}</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-slate-400">Pending Subs</div>
                <div className="text-xl font-black text-indigo-900">{stats.pendingSubstitutionsCount || 0}</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by title or department..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
              />
            </div>

            <select
              value={filters.session}
              onChange={(e) => setFilters(f => ({ ...f, session: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="2026-27">Session 2026-27</option>
              <option value="2025-26">Session 2025-26</option>
              <option value="2027-28">Session 2027-28</option>
            </select>

            <select
              value={filters.term}
              onChange={(e) => setFilters(f => ({ ...f, term: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="">All Terms</option>
              <option value="ODD">ODD Term</option>
              <option value="EVEN">EVEN Term</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <button
              type="button"
              onClick={loadOverviewData}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Timetables Table */}
          {timetableError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{timetableError}</span>
              </div>
              <button
                type="button"
                onClick={loadOverviewData}
                className="px-3 py-1 rounded-lg bg-white border border-rose-300 text-rose-800 font-bold"
              >
                Retry
              </button>
            </div>
          )}

          {loadingTimetables ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
              <div>Loading timetable schedules...</div>
            </div>
          ) : (!Array.isArray(timetables) || timetables.length === 0) ? (
            <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 space-y-3">
              <Calendar className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-bold text-slate-800">No Timetables Found</div>
              <p className="max-w-md mx-auto text-slate-500">
                No timetables match the current filters. Upload an Excel/PDF schedule or create a new draft schedule.
              </p>
              <button
                type="button"
                onClick={() => setShowImportWizard(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800"
              >
                Import First Timetable
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Title & Department</th>
                    <th className="px-4 py-3.5">Session / Term</th>
                    <th className="px-4 py-3.5">Sem & Year</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Version</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(Array.isArray(timetables) ? timetables : []).map((tt) => {
                    const isPub = tt.status === 'PUBLISHED';
                    const isDraft = tt.status === 'DRAFT';
                    const isArchived = tt.status === 'ARCHIVED';

                    return (
                      <tr key={tt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 text-sm">{tt.title}</div>
                          <div className="text-[11px] text-slate-500">{tt.departmentName || tt.departmentCode}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800">{tt.academicSession}</div>
                          <div className="text-[10px] text-slate-500">{tt.term} Term</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div>Semester {tt.semester || 5}</div>
                          <div className="text-[10px] text-slate-400">Year {tt.yearOfStudy || 3}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isPub ? 'bg-emerald-100 text-emerald-800' : isDraft ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPub ? 'bg-emerald-500' : isDraft ? 'bg-amber-500' : 'bg-slate-400'}`} />
                            <span>{tt.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          v{tt.versionNo || 1}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => openEditorForTimetable(tt.id)}
                            className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 font-bold hover:bg-teal-100 text-xs transition-colors"
                          >
                            Open Editor
                          </button>

                          {/* Quick export buttons */}
                          <button
                            type="button"
                            onClick={() => handleExport(tt.id, 'xlsx')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Export Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExport(tt.id, 'pdf')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Export PDF (.pdf)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Lifecycle options */}
                          {isPub && (
                            <button
                              type="button"
                              onClick={() => handleRevise(tt.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                              title="Create New Revision (Draft)"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {isPub && (
                            <button
                              type="button"
                              onClick={() => handleUnpublish(tt.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                              title="Unpublish (Return to Draft)"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {!isArchived && (
                            <button
                              type="button"
                              onClick={() => handleArchive(tt.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title="Archive Timetable"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleClone(tt)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50"
                            title="Clone to Next Session"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {isDraft && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTimetable(tt.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete Draft"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW 2: TIMETABLE EDITOR & GRID
      ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'editor' && (
        <div className="space-y-4">
          {loadingDetail ? (
            <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
              <div>Loading timetable grid and conflict models...</div>
            </div>
          ) : detailError ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <span>{detailError}</span>
              <button
                type="button"
                onClick={() => loadTimetableDetail(activeTimetableId)}
                className="px-3 py-1 bg-white border border-rose-300 text-rose-800 font-bold rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : timetableDetail && (
            <div className="space-y-4">
              {/* Editor Header Bar with Actions & Undo/Redo */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>{timetableDetail.title}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        timetableDetail.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        v{timetableDetail.versionNo || 1} • {timetableDetail.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {timetableDetail.academicSession} • {timetableDetail.term} Term • Sem {timetableDetail.semester}
                    </div>
                  </div>
                </div>

                {/* Editor Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Undo / Redo */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      disabled={undoStack.length === 0}
                      onClick={handleUndo}
                      className={`p-2 hover:bg-slate-200 transition-colors ${
                        undoStack.length === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-700'
                      }`}
                      title={`Undo last action (${undoStack.length} available)`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={redoStack.length === 0}
                      onClick={handleRedo}
                      className={`p-2 hover:bg-slate-200 transition-colors border-l border-slate-200 ${
                        redoStack.length === 0 ? 'opacity-30 cursor-not-allowed' : 'text-slate-700'
                      }`}
                      title={`Redo (${redoStack.length} available)`}
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Reference Drawers Shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      setRefDrawerTab('subjects');
                      setShowRefDrawer(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Catalogs
                  </button>

                  {/* Student Groups Tab */}
                  <button
                    type="button"
                    onClick={() => setShowStudentsModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>Students</span>
                  </button>

                  {/* Versions */}
                  <button
                    type="button"
                    onClick={() => setShowVersionHistory(true)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Versions</span>
                  </button>

                  {/* Export */}
                  <button
                    type="button"
                    onClick={() => handleExport(timetableDetail.id, 'xlsx')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  {/* Publish Dialog */}
                  <button
                    type="button"
                    onClick={() => setShowPublishDialog(true)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish...</span>
                  </button>
                </div>
              </div>

              {/* View Mode Switcher: Section, Group, Faculty, Room */}
              <div className="p-3.5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">View Grid By:</span>
                  <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 font-bold">
                    {['section', 'group', 'faculty', 'room'].map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setEditorMode(mode)}
                        className={`px-3 py-1 rounded-xl capitalize transition-all ${
                          editorMode === mode
                            ? 'bg-white text-teal-800 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-selector depending on editorMode */}
                <div className="flex items-center gap-2">
                  {editorMode === 'section' && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600">Section:</span>
                      {(timetableDetail.sections || [{ name: 'A' }]).map(s => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setSelectedSectionName(s.name)}
                          className={`px-3 py-1 rounded-xl font-bold transition-all ${
                            selectedSectionName === s.name
                              ? 'bg-teal-700 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Sec {s.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {editorMode === 'group' && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600">Lab Batch:</span>
                      {['A1', 'A2', 'B1', 'B2'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setSelectedGroupCode(g)}
                          className={`px-3 py-1 rounded-xl font-bold transition-all ${
                            selectedGroupCode === g
                              ? 'bg-teal-700 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Batch {g}
                        </button>
                      ))}
                    </div>
                  )}

                  {editorMode === 'faculty' && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600">Faculty:</span>
                      <select
                        value={selectedFacultyId}
                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800"
                      >
                        <option value="">-- Choose Faculty Member --</option>
                        {(timetableDetail.faculty || []).map(f => (
                          <option key={f.id} value={f.id}>{f.fullName || f.shortCode}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {editorMode === 'room' && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600">Room:</span>
                      <select
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800"
                      >
                        <option value="">-- Choose Room / Lab --</option>
                        {(timetableDetail.rooms || []).map(r => (
                          <option key={r.id} value={r.id}>{r.code} ({r.displayName || r.roomType})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Toggle Clash Panel */}
                  <button
                    type="button"
                    onClick={() => setShowClashPanel(!showClashPanel)}
                    className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
                      showClashPanel
                        ? 'bg-teal-50 border-teal-300 text-teal-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Clashes ({conflicts.length})</span>
                  </button>
                </div>
              </div>

              {/* Grid + Side Clash Panel Layout */}
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <TimetableGrid
                    periods={timetableDetail.periods || []}
                    slots={displayedSlots}
                    viewMode={editorMode}
                    filterGroup={editorMode === 'group' ? selectedGroupCode : null}
                    editable={true}
                    highlight={highlightedSlotId}
                    validateDropTarget={handleValidateDropTarget}
                    onSlotMove={handleSlotMove}
                    onSlotClick={(slot) => {
                      setSlotDialogInitial(slot);
                      setShowSlotDialog(true);
                    }}
                    onCellClick={(dayOfWeek, periodIndex) => {
                      setSlotDialogInitial({
                        dayOfWeek,
                        startPeriod: periodIndex,
                        sectionName: selectedSectionName,
                        labGroupCode: selectedGroupCode
                      });
                      setShowSlotDialog(true);
                    }}
                    onDeleteSlot={handleDeleteSlot}
                  />
                </div>

                {/* Collapsible Clash Panel */}
                {showClashPanel && (
                  <div className="w-80 shrink-0 sticky top-4">
                    <ClashPanel
                      conflicts={conflicts}
                      onSelectConflict={(c) => {
                        if (c.slotIds && c.slotIds.length > 0) {
                          setHighlightedSlotId(c.slotIds[0]);
                        }
                      }}
                      onClose={() => setShowClashPanel(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW 3: SUBSTITUTIONS & OVERRIDES QUEUE
      ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'substitutions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Faculty Substitution Approvals Queue</h3>
              <p className="text-xs text-slate-500">
                Review and approve teacher substitution or room change requests.
              </p>
            </div>
            <button
              type="button"
              onClick={loadSubstitutions}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loadingSubstitutions ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
              <div>Loading substitution requests...</div>
            </div>
          ) : substitutions.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
              <div className="text-sm font-bold text-slate-800">No Pending Requests</div>
              <div>All teacher substitutions and schedule overrides have been processed.</div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="px-5 py-3">Instructor / Requester</th>
                    <th className="px-4 py-3">Scheduled Slot</th>
                    <th className="px-4 py-3">Proposed Substitute / Room</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(Array.isArray(substitutions) ? substitutions : []).map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-slate-900">{sub.requesterName || 'Faculty Member'}</td>
                      <td className="px-4 py-3">
                        <div>{sub.subjectName || sub.subjectCode}</div>
                        <div className="text-[10px] text-slate-400">{sub.overrideDate} • P{sub.periodIndex || 1}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-teal-800">
                        {sub.substituteFacultyName || sub.substituteRoomCode || 'Class Cancelled'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{sub.reason || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          sub.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-1.5">
                        {(!sub.status || sub.status === 'PENDING') && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveSub(sub.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectSub(sub.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW 4: ACADEMIC CALENDAR & HOLIDAYS (Prompt A)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'calendar' && (
        <AcademicCalendarManager currentUser={currentUser} />
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW 5: REPORTS & ANALYTICS (Prompt B)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'reports' && (
        <TimetableReportsView currentUser={currentUser} isHod={false} />
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW 6: AVAILABILITY HEATMAP (Prompt D)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'availability' && (
        <AvailabilityHeatmap currentUser={currentUser} isHod={false} />
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          VIEW 7: AUDIT TRAIL (Prompt F)
      ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'audit' && (
        <AuditTrailView currentUser={currentUser} />
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          MODALS & DRAWERS
      ────────────────────────────────────────────────────────────────────────── */}
      {showImportWizard && (
        <ImportWizard
          isOpen={showImportWizard}
          onClose={() => setShowImportWizard(false)}
          onImportCommitted={(newTimetableId) => {
            loadOverviewData();
            if (newTimetableId) openEditorForTimetable(newTimetableId);
          }}
        />
      )}

      {showSlotDialog && (
        <SlotDialog
          isOpen={showSlotDialog}
          onClose={() => {
            setShowSlotDialog(false);
            setSlotDialogInitial(null);
          }}
          timetableId={activeTimetableId}
          initialData={slotDialogInitial}
          periods={timetableDetail?.periods || []}
          sections={timetableDetail?.sections || []}
          subjects={timetableDetail?.subjects || []}
          facultyList={timetableDetail?.faculty || []}
          rooms={timetableDetail?.rooms || []}
          onSave={handleSaveSlot}
          validateSlot={(candidate) =>
            MasterTimetableApi.validateCandidateSlot(activeTimetableId, {
              slot: candidate,
              candidateDay: candidate.dayOfWeek,
              candidatePeriod: candidate.startPeriod
            })
          }
        />
      )}

      {showPublishDialog && timetableDetail && (
        <PublishDialog
          isOpen={showPublishDialog}
          onClose={() => setShowPublishDialog(false)}
          timetable={timetableDetail}
          onPublished={(pub) => {
            setTimetableDetail(pub);
            loadOverviewData();
          }}
        />
      )}

      {showVersionHistory && (
        <VersionHistory
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          timetableId={activeTimetableId}
          currentVersionNo={timetableDetail?.versionNo || 1}
          onVersionRestored={(restored) => {
            setTimetableDetail(restored);
            loadOverviewData();
          }}
        />
      )}

      {showRefDrawer && (
        <ReferenceDataDrawer
          isOpen={showRefDrawer}
          onClose={() => setShowRefDrawer(false)}
          timetableId={activeTimetableId}
          initialTab={refDrawerTab}
          departmentCode={timetableDetail?.departmentCode || 'AI_DS'}
          onDataChanged={() => activeTimetableId && loadTimetableDetail(activeTimetableId)}
        />
      )}

      {showStudentsModal && (
        <StudentsGroupModal
          isOpen={showStudentsModal}
          onClose={() => setShowStudentsModal(false)}
          timetableId={activeTimetableId}
          sections={timetableDetail?.sections || []}
        />
      )}
    </div>
  );
}
