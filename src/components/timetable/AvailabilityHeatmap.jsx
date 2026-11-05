import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { MasterTimetableApi, TimetableViewApi } from '../../services/api';
import { DAYS } from '../../utils/timetableGrid';

export default function AvailabilityHeatmap({ currentUser, isHod = false, department = '' }) {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState([]);
  const [facultySearch, setFacultySearch] = useState('');

  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);

  const api = isHod ? TimetableViewApi : MasterTimetableApi;

  // Load faculty options
  useEffect(() => {
    MasterTimetableApi.getFacultyProfiles(department)
      .then(res => setFacultyList(Array.isArray(res) ? res : (res?.content || [])))
      .catch(() => setFacultyList([]));
  }, [department]);

  const loadMatrix = useCallback(async (ids) => {
    if (!ids || ids.length === 0) {
      setMatrixData(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.getAvailabilityMatrix({ facultyIds: ids });
      setMatrixData(res);
    } catch (err) {
      setError(err.message || 'Failed to calculate availability matrix');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const handleToggleFaculty = (id) => {
    setSelectedFacultyIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      loadMatrix(next);
      return next;
    });
  };

  const handleSelectAll = () => {
    const list = Array.isArray(facultyList) ? facultyList : [];
    const allIds = list.map(f => f.id);
    setSelectedFacultyIds(allIds);
    loadMatrix(allIds);
  };

  const handleClearAll = () => {
    setSelectedFacultyIds([]);
    setMatrixData(null);
  };

  const list = Array.isArray(facultyList) ? facultyList : [];
  const filteredFaculty = list.filter(f =>
    (f.fullName && f.fullName.toLowerCase().includes(facultySearch.toLowerCase())) ||
    (f.shortCode && f.shortCode.toLowerCase().includes(facultySearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Faculty Availability Heatmap</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select one or more faculty members to compute real-time mutual availability. Green cells indicate common free periods suitable for departmental meetings or make-up classes.
          </p>
        </div>

        {selectedFacultyIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadMatrix(selectedFacultyIds)}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold"
            >
              Clear Selection ({selectedFacultyIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Faculty Selector Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Select Faculty to Compare:</span>
            <input
              type="text"
              placeholder="Search faculty..."
              value={facultySearch}
              onChange={(e) => setFacultySearch(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-teal-600 w-44"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-teal-700 hover:underline"
            >
              Select All ({facultyList.length})
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{selectedFacultyIds.length} Selected</span>
          </div>
        </div>

        {/* Faculty Pills List */}
        <div className="max-h-28 overflow-y-auto flex flex-wrap gap-1.5 pt-1">
          {filteredFaculty.map(f => {
            const isSelected = selectedFacultyIds.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleToggleFaculty(f.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{f.fullName || f.shortCode}</span>
                {f.shortCode && <span className={`text-[10px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>({f.shortCode})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Heatmap Grid */}
      {selectedFacultyIds.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No Faculty Selected</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Choose one or more faculty members above to view when they are all simultaneously free to meet.
          </p>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
          <span className="text-xs font-medium">Computing mutual schedule availability...</span>
        </div>
      ) : matrixData && matrixData.grid ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 overflow-hidden">
          {/* Legend */}
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs font-semibold border-b border-slate-200 pb-3">
            <span className="text-slate-700">Heatmap Legend:</span>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
                <span>100% Free (All {matrixData.totalFaculty} Available)</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-800">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block" />
                <span>Partially Free</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-800">
                <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" />
                <span>Fully Occupied (0 Free)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 inline-block" />
                <span>Break</span>
              </span>
            </div>
          </div>

          {/* Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold">
                  <th className="py-2.5 px-3 text-left w-24">Day</th>
                  {matrixData.grid[0]?.map((cell, pIdx) => (
                    <th key={pIdx} className="py-2.5 px-2 font-mono">
                      {cell.isBreak ? 'Break' : `Period ${cell.periodOrder}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.grid.map((dayRow, dayIdx) => {
                  const dayName = DAYS[dayIdx]?.name || `Day ${dayIdx + 1}`;
                  return (
                    <tr key={dayIdx} className="hover:bg-slate-50/40">
                      <td className="py-3 px-3 text-left font-bold text-slate-900 text-xs">
                        {dayName}
                      </td>
                      {dayRow.map((cell, pIdx) => {
                        if (cell.isBreak) {
                          return (
                            <td key={pIdx} className="p-1">
                              <div className="h-12 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-semibold select-none">
                                Break
                              </div>
                            </td>
                          );
                        }

                        const isAllFree = cell.isFreeForAll;
                        const isNoneFree = cell.freeCount === 0;
                        const busyCount = (cell.busyFaculty || []).length;

                        let bgClass = 'bg-amber-100 border-amber-300 text-amber-900';
                        if (isAllFree) bgClass = 'bg-emerald-100 border-emerald-300 text-emerald-900';
                        else if (isNoneFree) bgClass = 'bg-rose-100 border-rose-300 text-rose-900';

                        return (
                          <td key={pIdx} className="p-1 relative">
                            <div
                              onMouseEnter={() => setHoveredCell(cell)}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`h-12 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-2xs ${bgClass}`}
                            >
                              <span className="text-xs font-black">
                                {isAllFree ? 'Free' : `${cell.freeCount}/${cell.totalCount}`}
                              </span>
                              <span className="text-[9px] font-medium opacity-80">
                                {isAllFree ? 'Available' : `${busyCount} Busy`}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cell Tooltip Details Panel */}
          {hoveredCell && !hoveredCell.isBreak && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 animate-in fade-in">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>
                  {DAYS[hoveredCell.dayOfWeek - 1]?.name} • Period {hoveredCell.periodOrder}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  hoveredCell.isFreeForAll ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {hoveredCell.freeCount} of {hoveredCell.totalCount} Faculty Available
                </span>
              </div>

              {hoveredCell.busyFaculty && hoveredCell.busyFaculty.length > 0 ? (
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">Busy Faculty:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {hoveredCell.busyFaculty.map((b, i) => (
                      <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                        <span className="font-bold text-slate-900">{b.facultyName}</span>
                        <div className="text-slate-500 text-[10px] mt-0.5">
                          {b.subjectCode} • {b.roomCode || 'Room ?'} (Sec {b.sectionName})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-emerald-700 font-semibold text-[11px]">
                  All selected faculty members are free during this period! Ideal time slot to schedule a joint session.
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

