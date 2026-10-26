// PlacePrep AI - Team 2: Institute Support
// Backlog Management & Clearance Module with Automated Marksheet Synchronization

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Search, 
  Calendar, 
  FileCheck, 
  Trash2, 
  ExternalLink, 
  X
} from 'lucide-react';
import { 
  getAllBacklogs, 
  clearBacklog, 
  getAllStudents, 
  deleteBacklogRecord
} from '../../services/academicRecordsService';
import SearchBar from '../ui/SearchBar';

export default function BacklogManagementView({ 
  initialStudentFilter = null, 
  onViewMarksheet 
}) {
  const [backlogs, setBacklogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Cleared'
  const [branchFilter, setBranchFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState(initialStudentFilter || 'All');

  // Clearance Modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [activeBacklogToClear, setActiveBacklogToClear] = useState(null);
  const [clearanceForm, setClearanceForm] = useState({
    obtainedMarks: '',
    reExamDate: new Date().toISOString().slice(0, 10),
    clearedSemester: '',
    remarks: 'Cleared in Supplementary Examination'
  });
  const [clearanceError, setClearanceError] = useState('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const loadData = () => {
    const bList = getAllBacklogs();
    setBacklogs(bList);
    const sList = getAllStudents();
    setStudents(sList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter Backlogs
  const filteredBacklogs = backlogs.filter(b => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (branchFilter !== 'All' && b.branch !== branchFilter) return false;
    if (selectedStudentFilter !== 'All' && b.studentId !== selectedStudentFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.studentName?.toLowerCase().includes(q);
      const matchRoll = b.rollNumber?.toLowerCase().includes(q);
      const matchCode = b.subjectCode?.toLowerCase().includes(q);
      const matchSub = b.subjectName?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchCode && !matchSub) return false;
    }
    return true;
  });

  const totalActive = backlogs.filter(b => b.status === 'Active').length;
  const totalCleared = backlogs.filter(b => b.status === 'Cleared').length;

  const handleOpenClearModal = (backlog) => {
    setActiveBacklogToClear(backlog);
    setClearanceForm({
      obtainedMarks: '',
      reExamDate: new Date().toISOString().slice(0, 10),
      clearedSemester: backlog.originalSemester || 1,
      remarks: 'Cleared in Supplementary Examination'
    });
    setClearanceError('');
    setIsClearModalOpen(true);
  };

  const handleExecuteClearance = (e) => {
    e.preventDefault();
    if (!activeBacklogToClear) return;

    const marks = Number(clearanceForm.obtainedMarks);
    if (isNaN(marks) || marks < 40 || marks > 100) {
      setClearanceError('Cleared marks must be a passing score between 40 and 100 marks');
      return;
    }

    const res = clearBacklog(activeBacklogToClear.id, clearanceForm);
    if (res.success) {
      setIsClearModalOpen(false);
      loadData();
      showToast(`Backlog for ${activeBacklogToClear.subjectCode} (${activeBacklogToClear.studentName}) cleared successfully! Semester marksheet updated.`);
    } else {
      setClearanceError(res.message || 'Failed to clear backlog');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this backlog record?')) {
      deleteBacklogRecord(id);
      loadData();
      showToast('Backlog record deleted.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Backlog Registry & Re-Examination Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track active and cleared backlogs across all semesters. Clearing a backlog automatically updates student marksheet records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
              Automated SGPA Recalculation Active
            </span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50/80 to-white p-4 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">Active Backlogs</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-900 mt-2 font-mono">{totalActive}</div>
            <p className="text-[11px] text-amber-700 mt-1">Pending supplementary re-examination</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/80 to-white p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Cleared Backlogs</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-900 mt-2 font-mono">{totalCleared}</div>
            <p className="text-[11px] text-emerald-700 mt-1">Successfully resolved and recalculated</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-xl border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Clearance Rate</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-indigo-900 mt-2 font-mono">
              {totalActive + totalCleared > 0 
                ? `${Math.round((totalCleared / (totalActive + totalCleared)) * 100)}%`
                : '100%'}
            </div>
            <p className="text-[11px] text-indigo-700 mt-1">Institutional re-exam resolution</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full md:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search by student name, roll number, or subject code..."
            resultCount={filteredBacklogs.length}
            totalCount={backlogs.length}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only ({totalActive})</option>
            <option value="Cleared">Cleared Only ({totalCleared})</option>
          </select>

          {/* Student Filter */}
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:outline-none max-w-xs truncate"
          >
            <option value="All">All Students</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.fullName} ({s.rollNumber})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Backlogs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">Attempt #</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Latest Result / Evaluation</th>
                <th className="py-3 px-4">Re-Exam Session</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBacklogs.length > 0 ? (
                filteredBacklogs.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Roll: {b.rollNumber} &bull; {b.branch?.split(' ')[0]}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold font-mono text-indigo-700">{b.subjectCode}</div>
                      <div className="text-slate-700 text-xs">{b.subjectName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-700">
                      Sem {b.originalSemester}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-600">
                      #{b.attemptNumber || 1}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'Active'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {b.status === 'Active' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 font-medium block">{b.latestResult || 'Pending Evaluation'}</span>
                      {b.remarks && <span className="text-[10px] text-slate-400 block italic">{b.remarks}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {b.reExamDate || 'Next Cycle'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'Active' ? (
                          <button
                            onClick={() => handleOpenClearModal(b)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1 transition-all"
                            title="Record Passing Re-Exam Score and Clear Backlog"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Clear Backlog</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Cleared & Synced
                          </span>
                        )}
                        {onViewMarksheet && (
                          <button
                            onClick={() => onViewMarksheet(b.studentId, b.originalSemester)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Marksheet"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No backlog records match the selected filters.</p>
                    {searchQuery.trim() && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition cursor-pointer"
                      >
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLUTION & CLEARANCE MODAL */}
      {isClearModalOpen && activeBacklogToClear && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-200" />
                <h2 className="text-base font-bold">Clear Subject Backlog</h2>
              </div>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteClearance} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">{activeBacklogToClear.studentName} ({activeBacklogToClear.rollNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject:</span>
                  <span className="font-bold text-indigo-700 font-mono">{activeBacklogToClear.subjectCode} - {activeBacklogToClear.subjectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Semester:</span>
                  <span className="font-bold text-slate-800">Semester {activeBacklogToClear.originalSemester}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Re-Examination Marks Obtained (Max: 100) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  required
                  placeholder="e.g. 58 (Must be >= 40 to pass)"
                  value={clearanceForm.obtainedMarks}
                  onChange={(e) => setClearanceForm({ ...clearanceForm, obtainedMarks: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-mono font-bold"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  * Note: According to configured institutional grading rules, marks &gt;= 40 are required for Grade C (Pass).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Re-Examination Clearance Date</label>
                <input
                  type="date"
                  value={clearanceForm.reExamDate}
                  onChange={(e) => setClearanceForm({ ...clearanceForm, reExamDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Remarks</label>
                <input
                  type="text"
                  value={clearanceForm.remarks}
                  onChange={(e) => setClearanceForm({ ...clearanceForm, remarks: e.target.value })}
                  placeholder="e.g. Cleared in Supplementary Winter Session"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              {clearanceError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{clearanceError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Clearance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
