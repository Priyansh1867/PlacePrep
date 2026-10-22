import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Building2,
  AlertTriangle,
  Briefcase,
  Users,
  CheckCircle2,
  Filter,
  Sparkles,
  ExternalLink,
  Eye
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PlacementCalendarView({
  drives = [],
  onSelectDrive,
  onApplyDrive
}) {
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  // Default to November 2026 where campus hiring drives are scheduled
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 10, 1));
  const [selectedFilterCompany, setSelectedFilterCompany] = useState('ALL');
  const [activeModalDrive, setActiveModalDrive] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Normalize drives into map by date string YYYY-MM-DD
  const drivesByDate = useMemo(() => {
    const map = {};
    drives.forEach(drive => {
      // Find date string or parse
      let dateKey = drive.driveDate || drive.date;
      if (!dateKey) return;
      // Handle formats: "2026-11-18", "Nov 18, 2026", "2026-11-20"
      if (dateKey.includes('-')) {
        const parts = dateKey.split('-');
        if (parts.length === 3) {
          dateKey = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      } else {
        const d = new Date(dateKey);
        if (!isNaN(d.getTime())) {
          dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      }

      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(drive);
    });
    return map;
  }, [drives]);

  // Companies for filter dropdown
  const uniqueCompanies = useMemo(() => {
    const set = new Set();
    drives.forEach(d => {
      if (d.companyName) set.add(d.companyName);
    });
    return Array.from(set);
  }, [drives]);

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 18));
  };

  // Week days calculation around currentDate
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: d,
        dateKey,
        dayName: DAYS_OF_WEEK[i],
        dayNum: d.getDate(),
        isCurrentMonth: d.getMonth() === month
      });
    }
    return days;
  }, [currentDate, month]);

  return (
    <div className="space-y-6">
      {/* Calendar Top Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              Interactive Placement Calendar & Drive Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time schedule of verified campus recruitment tests, interview slots, reporting venues, and slot clash alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Company Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilterCompany}
              onChange={e => setSelectedFilterCompany(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700"
            >
              <option value="ALL">All Recruiters ({drives.length})</option>
              {uniqueCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Month / Week View Toggle */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'week' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week View
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer"
            >
              Nov 2026
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Calendar Header Month Name */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-lg font-black text-slate-900">
              {MONTH_NAMES[month]} {year}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Confirmed Drive
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Overlapping Slot
              </span>
            </div>
          </div>

          {/* Day of Week Labels */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-2.5">
            {DAYS_OF_WEEK.map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {/* Trailing Days of Previous Month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayIndex + i + 1;
              return (
                <div key={`prev-${i}`} className="min-h-[110px] p-2 bg-slate-50/40 text-slate-400 text-xs">
                  <span className="font-semibold">{dayNum}</span>
                </div>
              );
            })}

            {/* Days of Current Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              let dayDrives = drivesByDate[dateKey] || [];

              if (selectedFilterCompany !== 'ALL') {
                dayDrives = dayDrives.filter(d => d.companyName === selectedFilterCompany);
              }

              const hasClash = dayDrives.length >= 2;
              const isNov18 = dayNum === 18 && month === 10;

              return (
                <div
                  key={dayNum}
                  className={`min-h-[120px] p-2 transition flex flex-col justify-between ${
                    isNov18
                      ? 'bg-amber-50/30 ring-1 ring-inset ring-amber-300'
                      : 'hover:bg-indigo-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black rounded-full w-6 h-6 flex items-center justify-center ${
                      isNov18 ? 'bg-indigo-600 text-white' : 'text-slate-800'
                    }`}>
                      {dayNum}
                    </span>
                    {hasClash && (
                      <span
                        className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5"
                        title="Multiple recruitment drives scheduled on same date"
                      >
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> Clash
                      </span>
                    )}
                  </div>

                  {/* Drive Cards on this day */}
                  <div className="space-y-1.5 flex-1">
                    {dayDrives.map((drive, dIdx) => (
                      <div
                        key={drive.driveId || drive.id || dIdx}
                        onClick={() => setActiveModalDrive(drive)}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 text-[11px] font-semibold cursor-pointer transition shadow-2xs group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-indigo-900 truncate">
                            {drive.companyName}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-bold shrink-0">
                            {drive.ctc || drive.packageDetails}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {drive.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW TIMELINE */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h4 className="font-black text-slate-900 text-base">
              Week of {weekDays[0].dayName}, {MONTH_NAMES[weekDays[0].date.getMonth()]} {weekDays[0].dayNum} — {weekDays[6].dayName}, {MONTH_NAMES[weekDays[6].date.getMonth()]} {weekDays[6].dayNum}, {year}
            </h4>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Campus Recruitment Slot Grid
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map(day => {
              let dayDrives = drivesByDate[day.dateKey] || [];
              if (selectedFilterCompany !== 'ALL') {
                dayDrives = dayDrives.filter(d => d.companyName === selectedFilterCompany);
              }

              return (
                <div
                  key={day.dateKey}
                  className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[220px] ${
                    day.dayNum === 18 && month === 10
                      ? 'bg-amber-50/40 border-amber-300'
                      : dayDrives.length > 0
                      ? 'bg-indigo-50/30 border-indigo-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
                    <div>
                      <span className="font-black text-sm text-slate-900 block">{day.dayName}</span>
                      <span className="text-xs text-slate-500">{day.dayNum} {MONTH_NAMES[day.date.getMonth()].slice(0, 3)}</span>
                    </div>
                    {dayDrives.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {dayDrives.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayDrives.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic pt-6 text-center">No drives scheduled</p>
                    ) : (
                      dayDrives.map(drive => (
                        <div
                          key={drive.driveId || drive.id}
                          onClick={() => setActiveModalDrive(drive)}
                          className="p-3 rounded-xl bg-white border border-indigo-200 shadow-2xs hover:shadow-md transition cursor-pointer space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-indigo-950">{drive.companyName}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                              {drive.ctc}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-semibold">{drive.role}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{drive.driveTime || '09:00 AM'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRIVE DETAIL FLYOUT / MODAL */}
      {activeModalDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  Confirmed Campus Drive
                </span>
                <h3 className="font-black text-slate-900 text-xl mt-1">
                  {activeModalDrive.companyName}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{activeModalDrive.role}</p>
              </div>
              <button
                onClick={() => setActiveModalDrive(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Package / CTC</span>
                <span className="font-extrabold text-indigo-700 text-sm">{activeModalDrive.ctc || activeModalDrive.packageDetails}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Drive Date & Time</span>
                <span className="font-bold text-slate-800">{activeModalDrive.driveDate} • {activeModalDrive.driveTime || '09:00 AM'}</span>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Venue</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  {activeModalDrive.venue || 'Campus Auditorium Hall A'}
                </span>
              </div>
            </div>

            {/* Rounds Overview */}
            {activeModalDrive.rounds && activeModalDrive.rounds.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Recruitment Stages:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalDrive.rounds.map((r, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                      {typeof r === 'string' ? r : r.roundName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveModalDrive(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close
              </button>
              {onApplyDrive && (
                <button
                  onClick={() => {
                    onApplyDrive(activeModalDrive);
                    setActiveModalDrive(null);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply & Track</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
