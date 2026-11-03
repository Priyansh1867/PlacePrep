import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  CalendarCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import { TimetableViewApi, downloadFileBlob } from '../../services/api';
import TimetableGrid from './TimetableGrid';
import {
  findNextClass,
  DEFAULT_PERIODS,
  DAYS,
  getSlotKindMeta
} from '../../utils/timetableGrid';

export default function StudentMasterTimetableView({ currentUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingIcs, setExportingIcs] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await TimetableViewApi.getMyTimetable();
      setData(res);
    } catch (err) {
      console.error('Failed to load student timetable:', err);
      setError(err?.message || 'Unable to load timetable schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
    TimetableViewApi.getCalendarEvents()
      .then(res => setCalendarEvents(res || []))
      .catch(() => {});
  }, [fetchTimetable]);

  // Filter slots for student's section and specific lab group only
  // (Hides parallel labs of other groups so student gets a clean single lane)
  const studentSlots = useMemo(() => {
    if (!data?.slots) return [];
    const myGroup = data.labGroupCode;
    return data.slots.filter(s => {
      // Whole-section slots have no labGroupCode
      if (!s.labGroupCode) return true;
      // If student has no lab group assigned, show all group slots
      if (!myGroup) return true;
      return s.labGroupCode.trim().toUpperCase() === myGroup.trim().toUpperCase();
    });
  }, [data?.slots, data?.labGroupCode]);

  // Today's classes and next class
  const jsDay = new Date().getDay();
  const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;

  const todaySlots = useMemo(() => {
    return studentSlots
      .filter(s => Number(s.dayOfWeek) === currentDayOfWeek && !s.isCancelled)
      .sort((a, b) => (a.startPeriod || 0) - (b.startPeriod || 0));
  }, [studentSlots, currentDayOfWeek]);

  const nextClassInfo = useMemo(() => {
    return findNextClass(studentSlots, new Date());
  }, [studentSlots]);

  // Export handlers
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const blob = await TimetableViewApi.exportMyTimetable('pdf');
      const filename = `Timetable_${data?.departmentCode || 'Student'}_Sec${data?.sectionName || 'A'}${data?.labGroupCode ? '_' + data.labGroupCode : ''}.pdf`;
      downloadFileBlob(blob, filename);
    } catch (err) {
      alert('Failed to export PDF: ' + (err.message || 'Server error'));
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportIcs = async () => {
    setExportingIcs(true);
    try {
      const blob = await TimetableViewApi.exportMyTimetable('ics');
      downloadFileBlob(blob, 'PlacePrep_Class_Schedule.ics');
    } catch (err) {
      alert('Failed to export calendar (.ics): ' + (err.message || 'Server error'));
    } finally {
      setExportingIcs(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 animate-spin">
          <RefreshCw className="w-6 h-6 text-teal-600" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Loading Your Timetable</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Synchronizing class periods, room allocations, and approved schedule changes...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center max-w-2xl mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-rose-900">Failed to Load Timetable</h3>
        <p className="text-xs text-rose-700 mt-1 mb-4">{error}</p>
        <button
          onClick={fetchTimetable}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // Unassigned state (Strict Requirement: Never show another section's timetable!)
  if (!data || data.unassigned) {
    return (
      <div className="min-h-[460px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-amber-200 shadow-xs text-center max-w-2xl mx-auto my-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
          <GraduationCap className="w-8 h-8 text-amber-600" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-3">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Section Assignment Pending</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          You haven't been assigned to a timetable section yet
        </h3>
        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
          {data?.message || 'Please contact your department academic coordinator or HOD to map your student profile to your respective semester section and practical lab group.'}
        </p>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 text-left w-full max-w-md space-y-2 mb-6">
          <div className="font-semibold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600" />
            <span>Department Coordination Support</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Once your section is assigned in the master timetable roster, your personalized class schedule with live room allocations will appear here automatically.
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-600 border-t border-slate-200">
            <span>Student Roll: <span className="font-mono text-slate-900">{currentUser?.rollNumber || currentUser?.id || 'Registered'}</span></span>
            <span>Department: <span className="text-slate-900">{currentUser?.department || 'Engineering'}</span></span>
          </div>
        </div>
        <button
          onClick={fetchTimetable}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Check Status Again</span>
        </button>
      </div>
    );
  }

  // Assigned Timetable View
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {data.academicSession || '2026-27'} {data.term || 'ODD'} SEMESTER
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {data.departmentCode || 'CSE'} • SEM {data.semester || 'V'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-900 text-white">
              SEC {data.sectionName}
            </span>
            {data.labGroupCode && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Batch {data.labGroupCode}
              </span>
            )}
          </div>
          <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-teal-600" />
            <span>My Master Academic Timetable</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>Personalized for Section {data.sectionName} {data.labGroupCode ? `(Lab Group ${data.labGroupCode})` : ''}</span>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setShowVersionModal(true)}
              className="text-teal-600 hover:text-teal-700 font-semibold underline underline-offset-2 flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Published Schedule v{data.timetableId ? '1' : '1'} (What changed?)</span>
            </button>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          <button
            onClick={fetchTimetable}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
            title="Refresh schedule"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportIcs}
            disabled={exportingIcs}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-2 transition shadow-xs disabled:opacity-50"
            title="Add schedule to Apple / Google / Outlook Calendar"
          >
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <span>{exportingIcs ? 'Generating...' : 'Add to Calendar'}</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exportingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Active Holiday / Event Notice Banner (Prompt A) */}
      {data.eventNote && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-3.5 shadow-2xs">
          <Calendar className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">{data.eventNote}</h4>
            <p className="text-xs text-amber-700">Regular classes are modified or suspended according to the official academic calendar.</p>
          </div>
        </div>
      )}

      {/* Academic Calendar Events Banner (if any upcoming) */}
      {calendarEvents.length > 0 && (
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-900 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-bold text-[10px]">Academic Calendar</span>
            <span className="font-medium">
              Upcoming: <span className="font-bold">{calendarEvents[0].title}</span> ({calendarEvents[0].startDate}{calendarEvents[0].endDate !== calendarEvents[0].startDate ? ` to ${calendarEvents[0].endDate}` : ''}) — {calendarEvents[0].kind}
            </span>
          </div>
          {calendarEvents.length > 1 && (
            <span className="text-[11px] text-indigo-600 font-semibold shrink-0">
              +{calendarEvents.length - 1} more event{calendarEvents.length - 1 > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Today's Schedule & Next Class Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Class Hero Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Clock className="w-40 h-40" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Class</span>
              </span>
              {nextClassInfo?.startsInMins !== undefined && (
                <span className="text-xs font-mono font-bold text-teal-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  {nextClassInfo.startsInMins <= 0
                    ? 'Happening Now'
                    : `Starts in ${nextClassInfo.startsInMins} min`}
                </span>
              )}
            </div>

            {nextClassInfo?.slot ? (
              <div className="space-y-3">
                <div className="text-2xl font-black text-white leading-tight line-clamp-2">
                  {nextClassInfo.slot.subjectName || nextClassInfo.slot.subjectShortCode || 'Scheduled Lecture'}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-teal-200 text-xs font-mono font-bold">
                    {nextClassInfo.slot.subjectRtuCode || nextClassInfo.slot.subjectShortCode || 'THEORY'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-xs font-bold">
                    {nextClassInfo.slot.kind || 'THEORY'}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="font-bold text-white">Room:</span>
                    <span>{nextClassInfo.slot.roomCode || 'Allocated Venue'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="font-bold text-white">Faculty:</span>
                    <span className="truncate">
                      {nextClassInfo.slot.facultyNames && nextClassInfo.slot.facultyNames.length > 0
                        ? nextClassInfo.slot.facultyNames.join(', ')
                        : 'Department Faculty'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="font-bold text-white">Time:</span>
                    <span>
                      {nextClassInfo.slot.customStart && nextClassInfo.slot.customEnd
                        ? `${nextClassInfo.slot.customStart} - ${nextClassInfo.slot.customEnd}`
                        : `Period ${nextClassInfo.slot.startPeriod} (${nextClassInfo.slot.span || 1} hr)`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-200">All lectures done for today!</p>
                <p className="text-xs text-slate-400 mt-1">Review upcoming labs and assignments below.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Today's Total: <strong className="text-white">{todaySlots.length}</strong> classes</span>
            <span className="font-semibold text-teal-400">Section {data.sectionName}</span>
          </div>
        </div>

        {/* Today's Chronological Class List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Today's Schedule ({DAYS.find(d => d.dayOfWeek === currentDayOfWeek)?.name || 'Today'})</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {todaySlots.length} lecture{todaySlots.length === 1 ? '' : 's'} scheduled
              </span>
            </div>

            {todaySlots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-semibold text-slate-600">No classes scheduled for today.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Enjoy your free study day or project sprint!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {todaySlots.map((slot, idx) => {
                  const meta = getSlotKindMeta(slot.kind);
                  const isCurrent = nextClassInfo?.slot?.id === slot.id && nextClassInfo?.startsInMins <= 0;
                  return (
                    <div
                      key={slot.id || idx}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-500/20'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">P{slot.startPeriod}</span>
                          <span className="text-[10px] font-extrabold text-slate-800">
                            {slot.span > 1 ? `${slot.span}h` : '1h'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {slot.subjectName || slot.subjectShortCode}
                            </span>
                            <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold border ${meta.badgeClass}`}>
                              {meta.shortLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <strong className="text-slate-700">{slot.roomCode || 'TBD'}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{slot.facultyNames?.join(', ') || 'Faculty'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {slot.customStart && slot.customEnd
                            ? `${slot.customStart} - ${slot.customEnd}`
                            : `Period ${slot.startPeriod}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Room venues and faculty allocations are verified with master timetable.</span>
            <span className="font-semibold text-teal-700">Official Roster</span>
          </div>
        </div>
      </div>

      {/* Week Master Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Full Weekly Matrix • Section {data.sectionName}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing single student lane (Group {data.labGroupCode || 'General'} + whole-section theory lectures).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {studentSlots.length} weekly sessions
            </span>
          </div>
        </div>

        {/* Timetable Week Grid Component */}
        <TimetableGrid
          periods={data.periods && data.periods.length > 0 ? data.periods : DEFAULT_PERIODS}
          slots={studentSlots}
          viewMode="group"
          filterGroup={data.labGroupCode}
          editable={false}
        />
      </div>

      {/* "What Changed?" Version Info Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Timetable Version Details</h3>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl text-teal-900">
                <div className="font-bold text-sm mb-1">
                  {data.departmentCode} Semester {data.semester} Section {data.sectionName}
                </div>
                <p className="text-teal-700 text-[11px]">
                  Academic Session: {data.academicSession} ({data.term} Term)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">PUBLISHED</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Lab Group Assignment</span>
                  <span className="font-bold text-slate-900">{data.labGroupCode || 'Unsegmented Section'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Total Weekly Lectures</span>
                  <span className="font-bold text-slate-900">{studentSlots.length} periods</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Integrity Hash (ETag)</span>
                  <span className="font-mono text-[10px] text-slate-600">{data.etag || 'v1-verified'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                <strong>Schedule Stability:</strong> Any temporary substitutions, room changes, or extra sessions approved by the HOD will reflect in real time under today's schedule and the matrix.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
