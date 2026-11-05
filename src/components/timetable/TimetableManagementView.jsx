// PlacePrep AI - Timetable & Schedule Management Component
// Master Academic Timetable View for Faculty and Head of Department (HOD)
// Powered by TimetableViewApi read and operational substitution endpoints.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  RefreshCw,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  Search,
  ChevronRight,
  X,
  Check,
  DoorOpen,
  Layers,
  UserCheck,
  ArrowLeftRight,
  BarChart2
} from 'lucide-react';
import { TimetableViewApi, downloadFileBlob } from '../../services/api';
import TimetableGrid from './TimetableGrid';
import TimetableReportsView from './TimetableReportsView';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import PeerSwapsPanel from './PeerSwapsPanel';
import {
  DEFAULT_PERIODS,
  DAYS,
  getSlotKindMeta
} from '../../utils/timetableGrid';

export default function TimetableManagementView({ currentUser }) {
  const isHod = currentUser?.role === 'hod' || currentUser?.role === 'admin' || currentUser?.role === 'management';

  // ==========================================
  // FACULTY STATE
  // ==========================================
  const [facultyData, setFacultyData] = useState(null);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [facultyError, setFacultyError] = useState(null);
  const [facultySubTab, setFacultySubTab] = useState('schedule'); // 'schedule' | 'requests'
  const [exportingSchedule, setExportingSchedule] = useState(false);

  // Substitution request dialog
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    slotId: '',
    onDate: new Date().toISOString().split('T')[0],
    kind: 'SUBSTITUTE',
    substituteFacultyId: '',
    newRoomId: '',
    reason: ''
  });
  const [submittingOverride, setSubmittingOverride] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState('');
  const [overrideError, setOverrideError] = useState('');

  // Faculty substitution requests list
  const [myOverrides, setMyOverrides] = useState([]);
  const [loadingOverrides, setLoadingOverrides] = useState(false);

  // ==========================================
  // HOD STATE
  // ==========================================
  const [hodOverview, setHodOverview] = useState(null);
  const [loadingHod, setLoadingHod] = useState(isHod);
  const [hodError, setHodError] = useState(null);
  const [hodActiveTab, setHodActiveTab] = useState('workload'); // 'workload' | 'faculty' | 'section' | 'room' | 'free-rooms' | 'approvals'

  // HOD Faculty workload sort & filter
  const [workloadSort, setWorkloadSort] = useState('desc'); // 'desc' | 'asc' | 'name'
  const [facultySearch, setFacultySearch] = useState('');
  const [selectedFacultyForGrid, setSelectedFacultyForGrid] = useState(null);
  const [facultyGridData, setFacultyGridData] = useState(null);
  const [loadingFacultyGrid, setLoadingFacultyGrid] = useState(false);

  // HOD Section grid
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [sectionGridData, setSectionGridData] = useState(null);
  const [loadingSectionGrid, setLoadingSectionGrid] = useState(false);

  // HOD Room grid
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [roomGridSlots, setRoomGridSlots] = useState([]);
  const [loadingRoomGrid, setLoadingRoomGrid] = useState(false);

  // Free Room Finder
  const [freeRoomDay, setFreeRoomDay] = useState(1);
  const [freeRoomPeriod, setFreeRoomPeriod] = useState(1);
  const [freeRoomType, setFreeRoomType] = useState('');
  const [freeRooms, setFreeRooms] = useState([]);
  const [loadingFreeRooms, setLoadingFreeRooms] = useState(false);
  const [hasQueriedFreeRooms, setHasQueriedFreeRooms] = useState(false);

  // Substitution Approvals Queue
  const [departmentOverrides, setDepartmentOverrides] = useState([]);
  const [loadingDeptOverrides, setLoadingDeptOverrides] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalActionError, setApprovalActionError] = useState('');

  // ==========================================
  // DATA FETCHING: FACULTY
  // ==========================================
  const fetchFacultySchedule = useCallback(async () => {
    if (isHod && hodActiveTab !== 'faculty') return;
    setLoadingFaculty(true);
    setFacultyError(null);
    try {
      const res = await TimetableViewApi.getMyTimetable();
      setFacultyData(res);
    } catch (err) {
      console.error('Failed to load faculty schedule:', err);
      setFacultyError(err?.message || 'Unable to load your teaching schedule.');
    } finally {
      setLoadingFaculty(false);
    }
  }, [isHod, hodActiveTab]);

  const fetchMyOverrides = useCallback(async () => {
    setLoadingOverrides(true);
    try {
      const res = await TimetableViewApi.listOverrides();
      setMyOverrides(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load substitution requests:', err);
    } finally {
      setLoadingOverrides(false);
    }
  }, []);

  // ==========================================
  // DATA FETCHING: HOD
  // ==========================================
  const fetchHodOverview = useCallback(async () => {
    if (!isHod) return;
    setLoadingHod(true);
    setHodError(null);
    try {
      const res = await TimetableViewApi.getHodOverview(currentUser?.department || '');
      setHodOverview(res);
      if (res.sections && res.sections.length > 0 && !selectedSectionId) {
        setSelectedSectionId(res.sections[0].id);
      }
      if (res.roomsInUse && res.roomsInUse.length > 0 && !selectedRoomId) {
        setSelectedRoomId(res.roomsInUse[0].id);
      }
    } catch (err) {
      console.error('Failed to load HOD department overview:', err);
      setHodError(err?.message || 'Unable to load department overview.');
    } finally {
      setLoadingHod(false);
    }
  }, [isHod, currentUser?.department, selectedSectionId, selectedRoomId]);

  const fetchDepartmentOverrides = useCallback(async () => {
    if (!isHod) return;
    setLoadingDeptOverrides(true);
    try {
      const res = await TimetableViewApi.listOverrides();
      setDepartmentOverrides(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load department overrides:', err);
    } finally {
      setLoadingDeptOverrides(false);
    }
  }, [isHod]);

  // Initial load
  useEffect(() => {
    if (isHod) {
      fetchHodOverview();
      fetchDepartmentOverrides();
    } else {
      fetchFacultySchedule();
      fetchMyOverrides();
    }
  }, [isHod, fetchHodOverview, fetchDepartmentOverrides, fetchFacultySchedule, fetchMyOverrides]);

  // Load HOD selected faculty grid
  const handleSelectFacultyForGrid = async (faculty) => {
    setSelectedFacultyForGrid(faculty);
    setLoadingFacultyGrid(true);
    try {
      const res = await TimetableViewApi.getFacultyGrid(faculty.facultyId);
      setFacultyGridData(res);
    } catch (err) {
      console.error('Failed to load faculty grid:', err);
      alert('Could not load weekly schedule for ' + faculty.fullName);
    } finally {
      setLoadingFacultyGrid(false);
    }
  };

  // Load HOD selected section grid
  useEffect(() => {
    if (!isHod || !selectedSectionId || hodActiveTab !== 'section') return;
    let isCurrent = true;
    const loadSection = async () => {
      setLoadingSectionGrid(true);
      try {
        const res = await TimetableViewApi.getSectionGrid(selectedSectionId);
        if (isCurrent) setSectionGridData(res);
      } catch (err) {
        console.error('Failed to load section grid:', err);
      } finally {
        if (isCurrent) setLoadingSectionGrid(false);
      }
    };
    loadSection();
    return () => { isCurrent = false; };
  }, [isHod, selectedSectionId, hodActiveTab]);

  // Load HOD selected room grid
  useEffect(() => {
    if (!isHod || !selectedRoomId || hodActiveTab !== 'room') return;
    let isCurrent = true;
    const loadRoom = async () => {
      setLoadingRoomGrid(true);
      try {
        const res = await TimetableViewApi.getRoomGrid(selectedRoomId);
        if (isCurrent) setRoomGridSlots(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Failed to load room grid:', err);
      } finally {
        if (isCurrent) setLoadingRoomGrid(false);
      }
    };
    loadRoom();
    return () => { isCurrent = false; };
  }, [isHod, selectedRoomId, hodActiveTab]);

  // Free room search
  const handleSearchFreeRooms = async (e) => {
    if (e) e.preventDefault();
    setLoadingFreeRooms(true);
    setHasQueriedFreeRooms(true);
    try {
      const res = await TimetableViewApi.getFreeRooms({
        day: Number(freeRoomDay),
        period: Number(freeRoomPeriod),
        roomType: freeRoomType || undefined
      });
      setFreeRooms(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to query free rooms:', err);
      alert('Error searching free rooms: ' + err.message);
    } finally {
      setLoadingFreeRooms(false);
    }
  };

  // Submit substitution request
  const handleSubmitOverride = async (e) => {
    e.preventDefault();
    setSubmittingOverride(true);
    setOverrideError('');
    setOverrideSuccess('');
    try {
      const payload = {
        slotId: Number(overrideForm.slotId),
        onDate: overrideForm.onDate,
        kind: overrideForm.kind,
        reason: overrideForm.reason || 'Operational adjustment',
        substituteFacultyId: overrideForm.substituteFacultyId ? Number(overrideForm.substituteFacultyId) : null,
        newRoomId: overrideForm.newRoomId ? Number(overrideForm.newRoomId) : null
      };
      await TimetableViewApi.requestOverride(payload);
      setOverrideSuccess('Substitution request submitted successfully! Pending HOD approval.');
      setTimeout(() => {
        setShowOverrideModal(false);
        setOverrideSuccess('');
        fetchMyOverrides();
      }, 1500);
    } catch (err) {
      setOverrideError(err?.message || 'Failed to submit substitution request.');
    } finally {
      setSubmittingOverride(false);
    }
  };

  // HOD approve / reject
  const handleApproveOverride = async (overrideId) => {
    setApprovalActionError('');
    try {
      await TimetableViewApi.approveOverride(overrideId);
      await fetchDepartmentOverrides();
      if (selectedSectionId && hodActiveTab === 'section') {
        const res = await TimetableViewApi.getSectionGrid(selectedSectionId);
        setSectionGridData(res);
      }
    } catch (err) {
      setApprovalActionError('Approval failed: ' + (err.message || 'Clash detected'));
    }
  };

  const handleRejectOverride = async (overrideId) => {
    setApprovalActionError('');
    try {
      await TimetableViewApi.rejectOverride(overrideId, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      await fetchDepartmentOverrides();
    } catch (err) {
      setApprovalActionError('Rejection failed: ' + err.message);
    }
  };

  // Export faculty schedule
  const handleExportFacultyPdf = async () => {
    setExportingSchedule(true);
    try {
      const blob = await TimetableViewApi.exportMyTimetable('pdf');
      downloadFileBlob(blob, `Teaching_Schedule_${currentUser?.name || 'Faculty'}.pdf`);
    } catch (err) {
      alert('Failed to export schedule: ' + err.message);
    } finally {
      setExportingSchedule(false);
    }
  };

  // Today calculations for Faculty
  const currentJsDay = new Date().getDay();
  const currentDayOfWeek = currentJsDay === 0 ? 7 : currentJsDay;

  const facultySlots = useMemo(() => facultyData?.slots || [], [facultyData?.slots]);
  const todayFacultySlots = useMemo(() => {
    return facultySlots
      .filter(s => Number(s.dayOfWeek) === currentDayOfWeek && !s.isCancelled)
      .sort((a, b) => (a.startPeriod || 0) - (b.startPeriod || 0));
  }, [facultySlots, currentDayOfWeek]);

  // HOD sorted faculty
  const sortedFacultyLoads = useMemo(() => {
    if (!hodOverview?.facultyLoads) return [];
    let list = [...hodOverview.facultyLoads];

    if (facultySearch.trim()) {
      const q = facultySearch.toLowerCase();
      list = list.filter(f =>
        f.fullName?.toLowerCase().includes(q) ||
        f.shortCode?.toLowerCase().includes(q)
      );
    }

    if (workloadSort === 'desc') {
      list.sort((a, b) => b.totalWeeklyPeriods - a.totalWeeklyPeriods);
    } else if (workloadSort === 'asc') {
      list.sort((a, b) => a.totalWeeklyPeriods - b.totalWeeklyPeriods);
    } else if (workloadSort === 'name') {
      list.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    }
    return list;
  }, [hodOverview?.facultyLoads, facultySearch, workloadSort]);

  // ==========================================
  // RENDER: FACULTY VIEW
  // ==========================================
  if (!isHod) {
    if (loadingFaculty) {
      return (
        <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 animate-spin">
            <RefreshCw className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Loading Teaching Timetable</h3>
          <p className="text-xs text-slate-500 mt-1">Retrieving departmental allocations, period slots, and active substitutions...</p>
        </div>
      );
    }

    if (facultyError) {
      return (
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center max-w-2xl mx-auto my-6">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-900">Unable to Load Timetable</h3>
          <p className="text-xs text-rose-700 mt-1 mb-4">{facultyError}</p>
          <button
            onClick={fetchFacultySchedule}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Needs Linking Alert Banner */}
        {facultyData?.needsLinking && (
          <div className="p-5 bg-amber-50 border border-amber-300 rounded-3xl shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                    Profile Unlinked
                  </span>
                  <h4 className="text-sm font-bold text-amber-900">
                    Your account is not linked to a timetable faculty record
                  </h4>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  {facultyData?.message || 'The timetable management engine needs to match your user login to an official department faculty profile to show your teaching matrix.'}
                </p>

                {facultyData?.suggestedProfiles && facultyData.suggestedProfiles.length > 0 && (
                  <div className="mt-3 p-3 bg-white/80 rounded-2xl border border-amber-200">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Suggested Profile Matches:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {facultyData.suggestedProfiles.map(prof => (
                        <div key={prof.id} className="px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs font-semibold text-slate-800 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-amber-700" />
                          <span>{prof.fullName} ({prof.shortCode})</span>
                          <span className="text-[10px] text-slate-500">[{prof.departmentCode}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs font-medium text-amber-800">
                    A notification has been dispatched to Management to link your profile. You can also contact your department coordinator.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Faculty Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentUser?.department || 'Engineering'} Department
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {facultySlots.length} Weekly Lectures
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-teal-600" />
              <span>Teaching Schedule & Allocation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active timetable slots across all assigned semesters and practical batches.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setOverrideForm({
                  slotId: facultySlots[0]?.id || '',
                  onDate: new Date().toISOString().split('T')[0],
                  kind: 'SUBSTITUTE',
                  substituteFacultyId: '',
                  newRoomId: '',
                  reason: ''
                });
                setShowOverrideModal(true);
              }}
              disabled={facultySlots.length === 0}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Request Substitution</span>
            </button>

            <button
              onClick={handleExportFacultyPdf}
              disabled={exportingSchedule || facultySlots.length === 0}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exportingSchedule ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={fetchFacultySchedule}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setFacultySubTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              facultySubTab === 'schedule'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Weekly Schedule ({facultySlots.length})</span>
          </button>
          <button
            onClick={() => {
              setFacultySubTab('requests');
              fetchMyOverrides();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              facultySubTab === 'requests'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Substitution Requests ({myOverrides.length})</span>
          </button>
          <button
            onClick={() => setFacultySubTab('peer-swaps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              facultySubTab === 'peer-swaps'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Peer Slot Swaps</span>
          </button>
        </div>

        {/* Academic Calendar Holiday Banner for Faculty (Prompt A) */}
        {facultyData?.eventNote && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-3.5 shadow-2xs">
            <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">{facultyData.eventNote}</h4>
              <p className="text-xs text-amber-700">Official academic calendar notice: schedule is adjusted for this event.</p>
            </div>
          </div>
        )}

        {/* TAB 1: WEEKLY SCHEDULE & TODAY LIST */}
        {facultySubTab === 'schedule' && (
          <div className="space-y-6">
            {/* Today's Lectures Strip */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Today's Classes ({DAYS.find(d => d.dayOfWeek === currentDayOfWeek)?.name || 'Today'})</span>
                </h3>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  {todayFacultySlots.length} lecture{todayFacultySlots.length === 1 ? '' : 's'} today
                </span>
              </div>

              {todayFacultySlots.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">No lectures scheduled for you today.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use this time for research, mentoring, or preparation.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {todayFacultySlots.map((slot, idx) => {
                    const meta = getSlotKindMeta(slot.kind);
                    return (
                      <div
                        key={slot.id || idx}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-300 transition shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white">
                            SEC {slot.sectionName || 'A'} {slot.labGroupCode ? `• ${slot.labGroupCode}` : ''}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeClass}`}>
                            {meta.shortLabel}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {slot.subjectName || slot.subjectShortCode}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-500">
                            {slot.subjectRtuCode || slot.subjectShortCode}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-semibold">
                            <DoorOpen className="w-3.5 h-3.5 text-teal-600" />
                            <span>Room {slot.roomCode || 'TBD'}</span>
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-700">
                            P{slot.startPeriod} ({slot.span || 1}h)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weekly Teaching Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span>Weekly Teaching Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any slot to request a substitution or view room allocation.
                  </p>
                </div>
              </div>

              <TimetableGrid
                periods={facultyData?.periods || DEFAULT_PERIODS}
                slots={facultySlots}
                viewMode="faculty"
                editable={false}
                onSlotClick={(slot) => {
                  setOverrideForm({
                    slotId: slot.id,
                    onDate: new Date().toISOString().split('T')[0],
                    kind: 'SUBSTITUTE',
                    substituteFacultyId: '',
                    newRoomId: '',
                    reason: ''
                  });
                  setShowOverrideModal(true);
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 2: MY SUBSTITUTION REQUESTS */}
        {facultySubTab === 'requests' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" />
                  <span>My Operational Overrides & Substitutions</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track the approval status of lecture swaps, reliever faculty, and room changes.
                </p>
              </div>
              <button
                onClick={fetchMyOverrides}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingOverrides ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading requests...</div>
            ) : myOverrides.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-600">No substitution requests created yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  If you need leave or room relocation, click "Request Substitution" above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3">Date</th>
                      <th className="p-3">Kind</th>
                      <th className="p-3">Original Lecture</th>
                      <th className="p-3">Substitute / Room</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Decided By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myOverrides.map((ov) => {
                      const isApproved = ov.status === 'APPROVED';
                      const isRejected = ov.status === 'REJECTED';
                      return (
                        <tr key={ov.id} className="hover:bg-slate-50/60 transition">
                          <td className="p-3 font-semibold text-slate-900">{ov.onDate}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                              {ov.kind}
                            </span>
                          </td>
                          <td className="p-3">
                            {ov.originalSlot ? (
                              <div>
                                <span className="font-bold text-slate-800">{ov.originalSlot.subjectShortCode}</span>
                                <span className="text-slate-400 ml-1">P{ov.originalSlot.startPeriod}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">Slot #{ov.slotId}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {ov.substituteFaculty ? (
                              <span className="font-semibold text-indigo-700">
                                {ov.substituteFaculty.fullName}
                              </span>
                            ) : ov.newRoom ? (
                              <span className="font-semibold text-teal-700">
                                Room {ov.newRoom.roomCode}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-slate-600">
                            {ov.reason || '-'}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isRejected
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ov.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">
                            {ov.decidedBy ? (
                              <span>{ov.decidedBy}</span>
                            ) : (
                              <span className="text-slate-400 italic">Pending HOD</span>
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

        {/* TAB 3: PEER SWAPS (Prompt E) */}
        {facultySubTab === 'peer-swaps' && (
          <PeerSwapsPanel
            currentUser={currentUser}
            isHod={false}
            mySlots={facultySlots}
          />
        )}

        {/* Modal: Request Substitution */}
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">Request Lecture Substitution</h3>
                </div>
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {overrideSuccess && (
                <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{overrideSuccess}</span>
                </div>
              )}

              {overrideError && (
                <div className="my-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{overrideError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitOverride} className="space-y-4 py-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Lecture Slot</label>
                  <select
                    value={overrideForm.slotId}
                    onChange={(e) => setOverrideForm({ ...overrideForm, slotId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- Choose Slot --</option>
                    {facultySlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {DAYS.find(d => d.dayOfWeek === Number(s.dayOfWeek))?.shortName} P{s.startPeriod}: {s.subjectShortCode} (Sec {s.sectionName}) Room {s.roomCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={overrideForm.onDate}
                      onChange={(e) => setOverrideForm({ ...overrideForm, onDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Action Kind</label>
                    <select
                      value={overrideForm.kind}
                      onChange={(e) => setOverrideForm({ ...overrideForm, kind: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="SUBSTITUTE">Substitute / Reliever</option>
                      <option value="SWAP">Swap Faculty</option>
                      <option value="ROOM_CHANGE">Room Change</option>
                      <option value="CANCEL">Class Cancellation</option>
                      <option value="RESCHEDULE">Reschedule Time</option>
                    </select>
                  </div>
                </div>

                {(overrideForm.kind === 'SUBSTITUTE' || overrideForm.kind === 'SWAP') && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Substitute Faculty Member ID
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 102"
                      value={overrideForm.substituteFacultyId}
                      onChange={(e) => setOverrideForm({ ...overrideForm, substituteFacultyId: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      The clash engine will automatically verify their availability before approval.
                    </span>
                  </div>
                )}

                {overrideForm.kind === 'ROOM_CHANGE' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Room ID</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={overrideForm.newRoomId}
                      onChange={(e) => setOverrideForm({ ...overrideForm, newRoomId: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Request</label>
                  <textarea
                    rows={2}
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                    required
                    placeholder="e.g. Attending academic conference, sick leave, lab equipment upgrade..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowOverrideModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOverride}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs disabled:opacity-50"
                  >
                    {submittingOverride ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: HOD VIEW
  // ==========================================
  if (loadingHod) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 animate-spin">
          <RefreshCw className="w-6 h-6 text-teal-600" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Loading Department Timetable Governance</h3>
        <p className="text-xs text-slate-500 mt-1">Aggregating faculty teaching loads, room occupancies, and pending substitutions...</p>
      </div>
    );
  }

  if (hodError) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center max-w-2xl mx-auto my-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-rose-900">Department Overview Error</h3>
        <p className="text-xs text-rose-700 mt-1 mb-4">{hodError}</p>
        <button
          onClick={fetchHodOverview}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload</span>
        </button>
      </div>
    );
  }

  const pendingApprovalsCount = departmentOverrides.filter(o => o.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HOD Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              HOD Governance Console
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {hodOverview?.departmentName || currentUser?.department || 'Computer Science'} ({hodOverview?.departmentCode || 'CSE'})
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {hodOverview?.facultyLoads?.length || 0} Faculty Profiles
            </span>
            {pendingApprovalsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                {pendingApprovalsCount} Pending Substitutions
              </span>
            )}
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            <span>Master Timetable Operations & Workload Audit</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Department-wide faculty teaching loads, room availability, and operational substitution approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              fetchHodOverview();
              fetchDepartmentOverrides();
            }}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
            title="Refresh All"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action Error Banner if any */}
      {approvalActionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span>{approvalActionError}</span>
          <button onClick={() => setApprovalActionError('')} className="p-1 text-rose-500">✕</button>
        </div>
      )}

      {/* HOD Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setHodActiveTab('workload')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            hodActiveTab === 'workload'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty Workload Strip</span>
        </button>

        <button
          onClick={() => setHodActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            hodActiveTab === 'reports'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Reports & Analytics</span>
        </button>

        <button
          onClick={() => setHodActiveTab('availability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            hodActiveTab === 'availability'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Availability Heatmap</span>
        </button>

        <button
          onClick={() => setHodActiveTab('peer-swaps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            hodActiveTab === 'peer-swaps'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Peer Swaps</span>
        </button>

        <button
          onClick={() => setHodActiveTab('section')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            hodActiveTab === 'section'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>By Section Grid</span>
        </button>

        <button
          onClick={() => setHodActiveTab('room')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            hodActiveTab === 'room'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>By Room Grid</span>
        </button>

        <button
          onClick={() => setHodActiveTab('free-rooms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            hodActiveTab === 'free-rooms'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Free Room Finder</span>
        </button>

        <button
          onClick={() => {
            setHodActiveTab('approvals');
            fetchDepartmentOverrides();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            hodActiveTab === 'approvals'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Substitution Approvals</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: FACULTY WORKLOAD STRIP                            */}
      {/* ======================================================== */}
      {hodActiveTab === 'workload' && (
        <div className="space-y-6">
          {/* Controls: Search & Sort */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search faculty name or code..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500">Sort by:</span>
              <select
                value={workloadSort}
                onChange={(e) => setWorkloadSort(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 cursor-pointer"
              >
                <option value="desc">Highest Workload First</option>
                <option value="asc">Lowest Workload First</option>
                <option value="name">Faculty Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Faculty Workload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFacultyLoads.map((fac) => {
              const count = fac.totalWeeklyPeriods || 0;
              // Underloaded < 12 (blue/cyan), Normal 12-18 (emerald), Overloaded > 18 (rose)
              const isUnder = count < 12;
              const isNormal = count >= 12 && count <= 18;

              return (
                <div
                  key={fac.facultyId}
                  onClick={() => handleSelectFacultyForGrid(fac)}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 group-hover:bg-teal-50 group-hover:text-teal-700 transition">
                        {fac.shortCode || 'FAC'}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          isUnder
                            ? 'bg-sky-50 text-sky-800 border-sky-300'
                            : isNormal
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {isUnder ? 'Underloaded' : isNormal ? 'Normal Load' : 'Overloaded'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition">
                      {fac.fullName}
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">Code: {fac.shortCode}</span>

                    {/* Per-day load bar strip */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Daily Lecture Distribution (Mon-Sat)
                      </span>
                      <div className="grid grid-cols-6 gap-1 text-center">
                        {[1, 2, 3, 4, 5, 6].map((dayIdx) => {
                          const dayLoad = fac.perDayLoad ? (fac.perDayLoad[dayIdx] || 0) : 0;
                          return (
                            <div key={dayIdx} className="space-y-1">
                              <div className="h-10 bg-slate-100 rounded-md p-0.5 flex flex-col justify-end overflow-hidden">
                                <div
                                  style={{ height: `${Math.min(100, (dayLoad / 6) * 100)}%` }}
                                  className={`w-full rounded-xs transition-all ${
                                    dayLoad >= 5
                                      ? 'bg-rose-500'
                                      : dayLoad >= 3
                                      ? 'bg-teal-500'
                                      : dayLoad > 0
                                      ? 'bg-sky-400'
                                      : 'bg-transparent'
                                  }`}
                                />
                              </div>
                              <span className="text-[9px] font-bold text-slate-500">
                                {DAYS.find(d => d.dayOfWeek === dayIdx)?.shortName[0]}
                              </span>
                              <span className="text-[10px] font-extrabold text-slate-800 block">
                                {dayLoad}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      Total Load: <strong className="text-slate-900 text-sm font-extrabold">{count}</strong> periods/wk
                    </span>
                    <span className="text-xs text-teal-600 font-bold group-hover:translate-x-0.5 transition inline-flex items-center gap-1">
                      <span>View Grid</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drilldown Modal: Selected Faculty Grid */}
          {selectedFacultyForGrid && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-teal-600" />
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedFacultyForGrid.fullName} ({selectedFacultyForGrid.shortCode})
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {selectedFacultyForGrid.totalWeeklyPeriods} Periods/Week
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Weekly teaching matrix across all sections in the academic session.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFacultyForGrid(null);
                      setFacultyGridData(null);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loadingFacultyGrid ? (
                  <div className="p-12 text-center text-xs text-slate-500">
                    Loading faculty timetable grid...
                  </div>
                ) : (
                  <TimetableGrid
                    periods={facultyGridData?.periods || DEFAULT_PERIODS}
                    slots={facultyGridData?.slots || []}
                    viewMode="faculty"
                    editable={false}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BY SECTION GRID                                   */}
      {/* ======================================================== */}
      {hodActiveTab === 'section' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                <span>Department Section Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect full section timetables including parallel practical lab groups.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Select Section:</span>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900 cursor-pointer"
              >
                {hodOverview?.sections?.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Sem {sec.semester || ''} • Section {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingSectionGrid ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading section schedule...</div>
          ) : sectionGridData ? (
            <TimetableGrid
              periods={sectionGridData.periods || DEFAULT_PERIODS}
              slots={sectionGridData.slots || []}
              viewMode="section"
              editable={false}
            />
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              No section selected or timetable data found.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BY ROOM GRID                                      */}
      {/* ======================================================== */}
      {hodActiveTab === 'room' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                <span>Room Occupancy Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor classroom, lecture theatre, and lab utilization across published timetables.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Select Room:</span>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900 cursor-pointer"
              >
                {hodOverview?.roomsInUse?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomCode} ({r.building || 'Main'} • Cap: {r.capacity || '60'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingRoomGrid ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading room grid...</div>
          ) : (
            <TimetableGrid
              periods={DEFAULT_PERIODS}
              slots={roomGridSlots}
              viewMode="room"
              editable={false}
            />
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: FREE ROOM FINDER                                  */}
      {/* ======================================================== */}
      {hodActiveTab === 'free-rooms' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-teal-600" />
              <span>Instant Free Room Finder</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly find unallocated lecture halls and labs for extra classes, remedial lectures, or meetings.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchFreeRooms} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
              <select
                value={freeRoomDay}
                onChange={(e) => setFreeRoomDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              >
                {DAYS.map(d => (
                  <option key={d.dayOfWeek} value={d.dayOfWeek}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Period Index</label>
              <select
                value={freeRoomPeriod}
                onChange={(e) => setFreeRoomPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              >
                {DEFAULT_PERIODS.filter(p => !p.isBreak).map(p => (
                  <option key={p.periodIndex} value={p.periodIndex}>
                    Period {p.periodIndex} ({p.startTime}-{p.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Type</label>
              <select
                value={freeRoomType}
                onChange={(e) => setFreeRoomType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              >
                <option value="">All Room Types</option>
                <option value="LECTURE_HALL">Lecture Hall / Classroom</option>
                <option value="LAB">Computer / Practical Lab</option>
                <option value="SEMINAR_HALL">Seminar Hall</option>
                <option value="AUDITORIUM">Auditorium</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loadingFreeRooms}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{loadingFreeRooms ? 'Searching...' : 'Find Free Rooms'}</span>
              </button>
            </div>
          </form>

          {/* Results */}
          {hasQueriedFreeRooms && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700">
                  {freeRooms.length} room{freeRooms.length === 1 ? '' : 's'} available
                </span>
              </div>

              {freeRooms.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No empty rooms found for the selected day and period. All departmental rooms are booked.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {freeRooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-black text-slate-900">{room.roomCode}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            FREE
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{room.building || 'Academic Block'}</p>
                        <span className="text-[11px] text-slate-500">{room.roomType || 'Lecture Hall'}</span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-600">
                        <span>Capacity: <strong className="text-slate-900">{room.capacity || 60}</strong></span>
                        <span className="text-emerald-700 font-bold">Available</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SUBSTITUTION APPROVALS                            */}
      {/* ======================================================== */}
      {hodActiveTab === 'approvals' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span>Department Substitution Approvals Queue</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review faculty requests. Approvals automatically trigger clash validation and update student views.
              </p>
            </div>

            <button
              onClick={fetchDepartmentOverrides}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loadingDeptOverrides ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading overrides queue...</div>
          ) : departmentOverrides.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-slate-600">All clear! No substitution requests pending.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">New requests from faculty will appear here for review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {departmentOverrides.map((ov) => {
                const isPending = ov.status === 'PENDING';
                const isApproved = ov.status === 'APPROVED';

                return (
                  <div
                    key={ov.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isPending
                        ? 'bg-amber-50/50 border-amber-200'
                        : isApproved
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900">
                          {ov.requestedBy || 'Faculty Member'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800">
                          {ov.kind}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-700">Date: {ov.onDate}</span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                        {ov.originalSlot && (
                          <span>
                            Lecture: <strong>{ov.originalSlot.subjectShortCode}</strong> (P{ov.originalSlot.startPeriod}, Sec {ov.originalSlot.sectionName})
                          </span>
                        )}
                        {ov.substituteFaculty && (
                          <span>
                            Substitute: <strong className="text-indigo-700">{ov.substituteFaculty.fullName}</strong>
                          </span>
                        )}
                        {ov.newRoom && (
                          <span>
                            New Room: <strong className="text-teal-700">{ov.newRoom.roomCode}</strong>
                          </span>
                        )}
                      </div>

                      {ov.reason && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{ov.reason}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleApproveOverride(ov.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          {rejectingId === ov.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Rejection reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="px-2 py-1 rounded-lg border border-slate-300 text-xs"
                              />
                              <button
                                onClick={() => handleRejectOverride(ov.id)}
                                className="px-2 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setRejectingId(null)}
                                className="px-2 py-1 text-slate-500 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRejectingId(ov.id)}
                              className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ov.status} {ov.decidedBy ? `by ${ov.decidedBy}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: REPORTS & ANALYTICS (Prompt B) */}
      {hodActiveTab === 'reports' && (
        <TimetableReportsView
          currentUser={currentUser}
          isHod={true}
          department={hodOverview?.departmentCode || currentUser?.department}
        />
      )}

      {/* TAB: AVAILABILITY HEATMAP (Prompt D) */}
      {hodActiveTab === 'availability' && (
        <AvailabilityHeatmap
          currentUser={currentUser}
          isHod={true}
          department={hodOverview?.departmentCode || currentUser?.department}
        />
      )}

      {/* TAB: PEER SWAPS (Prompt E) */}
      {hodActiveTab === 'peer-swaps' && (
        <PeerSwapsPanel
          currentUser={currentUser}
          isHod={true}
        />
      )}
    </div>
  );
}
