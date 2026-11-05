import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart2,
  Download,
  RefreshCw,
  Users,
  Building,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle
} from 'lucide-react';
import { MasterTimetableApi, TimetableViewApi, downloadFileBlob } from '../../services/api';

export default function TimetableReportsView({ currentUser, isHod = false, department = '' }) {
  const [activeReport, setActiveReport] = useState('workload'); // 'workload' | 'room' | 'free'
  const [selectedDept, setSelectedDept] = useState(department || currentUser?.department || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Data states
  const [workloadData, setWorkloadData] = useState([]);
  const [roomData, setRoomData] = useState({ rooms: [], idleRooms: [], totalRooms: 0, utilizedRooms: 0 });
  const [freePeriodsData, setFreePeriodsData] = useState([]);

  // Sorting
  const [sortField, setSortField] = useState('totalPeriods');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const api = isHod ? TimetableViewApi : MasterTimetableApi;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activeReport === 'workload') {
        const fn = isHod ? TimetableViewApi.getHodFacultyWorkload : MasterTimetableApi.getFacultyWorkloadReport;
        const res = await fn(selectedDept);
        setWorkloadData(Array.isArray(res) ? res : (res?.content || []));
      } else if (activeReport === 'room') {
        const fn = isHod ? TimetableViewApi.getHodRoomUtilisation : MasterTimetableApi.getRoomUtilisationReport;
        const res = await fn(selectedDept);
        setRoomData(res || { rooms: [], idleRooms: [], totalRooms: 0, utilizedRooms: 0 });
      } else if (activeReport === 'free') {
        const fn = isHod ? TimetableViewApi.getHodSectionFreePeriods : MasterTimetableApi.getSectionFreePeriodsReport;
        const res = await fn(selectedDept);
        setFreePeriodsData(Array.isArray(res) ? res : (res?.content || []));
      }
    } catch (err) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [activeReport, selectedDept, isHod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export Faculty Workload XLSX
  const handleExportXlsx = async () => {
    setExporting(true);
    try {
      const fn = isHod ? TimetableViewApi.exportHodFacultyWorkloadXlsx : MasterTimetableApi.exportFacultyWorkloadXlsx;
      const blob = await fn(selectedDept);
      downloadFileBlob(blob, `Faculty_Workload_Report_${selectedDept || 'All'}.xlsx`);
    } catch (err) {
      alert('Failed to export XLSX: ' + (err.message || 'Server error'));
    } finally {
      setExporting(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Sorted Workload
  const sortedWorkload = useMemo(() => {
    const list = Array.isArray(workloadData) ? workloadData : [];
    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [workloadData, sortField, sortOrder]);

  // Sorted Rooms
  const sortedRooms = useMemo(() => {
    return [...(roomData?.rooms || [])].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [roomData, sortField, sortOrder]);

  // Sorted Free Periods
  const sortedFreePeriods = useMemo(() => {
    const list = Array.isArray(freePeriodsData) ? freePeriodsData : [];
    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [freePeriodsData, sortField, sortOrder]);

  // Max periods for chart scaling
  const maxTotalPeriods = useMemo(() => {
    const list = Array.isArray(workloadData) ? workloadData : [];
    if (!list.length) return 20;
    return Math.max(...list.map(f => f.totalPeriods || 0), 20);
  }, [workloadData]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-teal-600" />
            <span>Academic Load & Utilisation Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit faculty weekly workload, consecutive period fatigue, room/lab capacity saturation, and section free time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!isHod && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Department:</span>
              <input
                type="text"
                placeholder="All Departments"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none w-28"
              />
            </div>
          )}

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {activeReport === 'workload' && (
            <button
              type="button"
              onClick={handleExportXlsx}
              disabled={exporting || workloadData.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-2 shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Exporting...' : 'Export XLSX'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => { setActiveReport('workload'); setSortField('totalPeriods'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeReport === 'workload'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty Workload & Peak</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveReport('room'); setSortField('gridPercentage'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeReport === 'room'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Room & Lab Utilisation</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveReport('free'); setSortField('totalFreePeriods'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeReport === 'free'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Section Free Periods</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* REPORT 1: FACULTY WORKLOAD */}
      {activeReport === 'workload' && (
        <div className="space-y-6">
          {/* Workload Visual Chart Card */}
          {workloadData.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Workload Distribution Chart</h3>
                  <p className="text-[11px] text-slate-500">Weekly teaching load breakdown: Theory (teal) vs Lab practicals (amber)</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <span className="w-3 h-3 rounded bg-teal-600 inline-block" />
                    <span>Theory</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                    <span>Lab</span>
                  </span>
                </div>
              </div>

              {/* Horizontal Bar Chart (Top 8 faculty) */}
              <div className="space-y-2.5 pt-2">
                {sortedWorkload.slice(0, 8).map(f => {
                  const theoryWidth = (f.theoryPeriods / maxTotalPeriods) * 100;
                  const labWidth = (f.labPeriods / maxTotalPeriods) * 100;
                  return (
                    <div key={f.facultyId} className="flex items-center gap-3 text-xs">
                      <div className="w-28 truncate font-bold text-slate-800 text-right" title={f.facultyName}>
                        {f.facultyCode || f.facultyName}
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden flex relative">
                        <div
                          style={{ width: `${theoryWidth}%` }}
                          className="bg-teal-600 h-full transition-all duration-300"
                          title={`Theory: ${f.theoryPeriods} periods`}
                        />
                        <div
                          style={{ width: `${labWidth}%` }}
                          className="bg-amber-500 h-full transition-all duration-300"
                          title={`Lab: ${f.labPeriods} periods`}
                        />
                      </div>
                      <div className="w-16 text-right font-mono font-bold text-slate-700">
                        {f.totalPeriods} <span className="text-[10px] text-slate-400 font-normal">hrs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Workload Data Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('facultyName')}>
                      <div className="flex items-center gap-1">
                        <span>Faculty Member</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('theoryPeriods')}>
                      <div className="flex items-center gap-1">
                        <span>Theory</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('labPeriods')}>
                      <div className="flex items-center gap-1">
                        <span>Lab</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('totalPeriods')}>
                      <div className="flex items-center gap-1">
                        <span>Total Weekly</span>
                        <ArrowUpDown className="w-3 h-3 text-teal-700" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('peakPerDay')}>
                      <div className="flex items-center gap-1">
                        <span>Day Peak</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('maxConsecutive')}>
                      <div className="flex items-center gap-1">
                        <span>Consecutive Max</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedWorkload.map(f => (
                    <tr key={f.facultyId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{f.facultyName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{f.facultyCode}</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{f.theoryPeriods}</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">{f.labPeriods}</td>
                      <td className="py-3 px-4 font-extrabold text-teal-800 text-sm">{f.totalPeriods}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          f.peakPerDay > 6 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.peakPerDay} periods
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          f.maxConsecutive > 4 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.maxConsecutive} in a row
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sortedWorkload.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No faculty workload records found for selected department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: ROOM & LAB UTILISATION */}
      {activeReport === 'room' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Total Rooms Registered</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{roomData.totalRooms || 0}</div>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-emerald-600">Active Utilised Rooms</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{roomData.utilizedRooms || 0}</div>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-amber-600">Idle / Unassigned Rooms</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{roomData.idleRoomsCount || 0}</div>
            </div>
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('roomCode')}>
                      <div className="flex items-center gap-1">
                        <span>Room Code</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Room Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('capacity')}>
                      <div className="flex items-center gap-1">
                        <span>Capacity</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('hoursPerWeek')}>
                      <div className="flex items-center gap-1">
                        <span>Hours / Week</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('gridPercentage')}>
                      <div className="flex items-center gap-1">
                        <span>Grid Utilisation</span>
                        <ArrowUpDown className="w-3 h-3 text-teal-700" />
                      </div>
                    </th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRooms.map(r => (
                    <tr key={r.roomId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.roomCode}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{r.roomName || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r.roomType || 'ROOM'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{r.capacity || '—'}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{r.hoursPerWeek} hrs</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${Math.min(r.gridPercentage, 100)}%` }}
                              className={`h-full ${
                                r.gridPercentage > 75 ? 'bg-emerald-600' : r.gridPercentage > 30 ? 'bg-teal-500' : 'bg-amber-500'
                              }`}
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-800">{r.gridPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {r.isIdle ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Idle</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sortedRooms.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No room utilisation records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: SECTION FREE PERIODS */}
      {activeReport === 'free' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('totalFreePeriods')}>
                    <div className="flex items-center gap-1">
                      <span>Total Free Periods</span>
                      <ArrowUpDown className="w-3 h-3 text-teal-700" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Free Periods by Day (Mon → Sat)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFreePeriods.map(s => (
                  <tr key={s.sectionId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">Section {s.sectionName}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">Sem {s.semester || '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.departmentCode}</td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      {s.totalFreePeriods} periods
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => {
                          const dow = idx + 1;
                          const freeCount = s.freePeriodsPerDay ? s.freePeriodsPerDay[dow] || 0 : 0;
                          return (
                            <span
                              key={dow}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                freeCount > 0 ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {dayName}: {freeCount}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedFreePeriods.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No section free period records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

