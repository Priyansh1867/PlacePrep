// PlacePrep AI - Team 2: Institute Support
// Student Directory: Search, Filters, Sorting, Pagination, and Record Actions

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { INITIAL_BRANCHES } from '../../data/initialAcademicRecords';
import { deleteStudent } from '../../services/academicRecordsService';
import BulkImportModal from '../BulkImportModal';

export default function StudentDirectoryView({ 
  students = [], 
  onRefresh, 
  onOpenCreateStudent, 
  onOpenEditStudent, 
  onOpenViewStudent, 
  onOpenMarksheet, 
  onOpenBacklogs 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterBatch, setFilterBatch] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterBacklogStatus, setFilterBacklogStatus] = useState('All'); // 'All', 'HasBacklogs', 'NoBacklogs'
  const [filterAdmissionType, setFilterAdmissionType] = useState('All');

  // Sorting
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete Confirmation Modal State
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search query across name, roll, reg, branch, id
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = student.fullName?.toLowerCase().includes(q);
        const matchRoll = student.rollNumber?.toLowerCase().includes(q);
        const matchReg = student.registrationNumber?.toLowerCase().includes(q);
        const matchBranch = student.branch?.toLowerCase().includes(q);
        const matchId = student.id?.toLowerCase().includes(q);
        if (!matchName && !matchRoll && !matchReg && !matchBranch && !matchId) {
          return false;
        }
      }

      if (filterCourse !== 'All' && student.course !== filterCourse) return false;
      if (filterBranch !== 'All' && student.branch !== filterBranch) return false;
      if (filterBatch !== 'All' && student.graduationBatch !== filterBatch) return false;
      if (filterSemester !== 'All' && String(student.currentSemester) !== String(filterSemester)) return false;
      if (filterAdmissionType !== 'All' && student.admissionType !== filterAdmissionType) return false;

      if (filterBacklogStatus === 'HasBacklogs' && (!student.activeBacklogsCount || student.activeBacklogsCount === 0)) {
        return false;
      }
      if (filterBacklogStatus === 'NoBacklogs' && student.activeBacklogsCount > 0) {
        return false;
      }

      return true;
    });
  }, [
    students, 
    searchQuery, 
    filterCourse, 
    filterBranch, 
    filterBatch, 
    filterSemester, 
    filterBacklogStatus, 
    filterAdmissionType
  ]);

  // Sorting Logic
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'cgpa' || sortField === 'currentSemester' || sortField === 'activeBacklogsCount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(sortedStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStudents.slice(start, start + pageSize);
  }, [sortedStudents, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    setStudentToDelete(null);
    if (onRefresh) onRefresh();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterCourse('All');
    setFilterBranch('All');
    setFilterBatch('All');
    setFilterSemester('All');
    setFilterBacklogStatus('All');
    setFilterAdmissionType('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Action Row: Search & Add */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll no, registration ID, or branch..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
          />
        </div>

        {/* Action Buttons: Add Student Profile & Bulk Import */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkImportOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Bulk Import (.xlsx / .csv)</span>
          </button>
          <button
            onClick={onOpenCreateStudent}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student Profile</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filter Student Directory</span>
          </div>
          {(filterCourse !== 'All' || filterBranch !== 'All' || filterBatch !== 'All' || filterSemester !== 'All' || filterBacklogStatus !== 'All' || filterAdmissionType !== 'All' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {/* Branch */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Branch</label>
            <select
              value={filterBranch}
              onChange={(e) => { setFilterBranch(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white"
            >
              <option value="All">All Branches</option>
              {INITIAL_BRANCHES.map(b => (
                <option key={b} value={b}>{b.split(' ')[0]}...</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Batch</label>
            <select
              value={filterBatch}
              onChange={(e) => { setFilterBatch(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white"
            >
              <option value="All">All Batches</option>
              <option value="2025">Batch 2025</option>
              <option value="2026">Batch 2026</option>
              <option value="2027">Batch 2027</option>
              <option value="2028">Batch 2028</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Semester</label>
            <select
              value={filterSemester}
              onChange={(e) => { setFilterSemester(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Admission Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Admission</label>
            <select
              value={filterAdmissionType}
              onChange={(e) => { setFilterAdmissionType(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white"
            >
              <option value="All">All Types</option>
              <option value="Regular Entry">Regular Entry</option>
              <option value="Diploma / Lateral Entry">Lateral Entry</option>
            </select>
          </div>

          {/* Backlogs */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Backlogs</label>
            <select
              value={filterBacklogStatus}
              onChange={(e) => { setFilterBacklogStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white"
            >
              <option value="All">All Students</option>
              <option value="HasBacklogs">Has Backlogs</option>
              <option value="NoBacklogs">Backlog Free</option>
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Per Page</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white"
            >
              <option value={5}>5 Records</option>
              <option value={10}>10 Records</option>
              <option value={20}>20 Records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => handleSort('fullName')}>
                  <div className="flex items-center gap-1.5">
                    <span>Student Profile</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => handleSort('rollNumber')}>
                  <div className="flex items-center gap-1.5">
                    <span>Roll & Reg ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-800" onClick={() => handleSort('branch')}>
                  <div className="flex items-center gap-1.5">
                    <span>Branch & Batch</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-slate-800" onClick={() => handleSort('currentSemester')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Semester</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-slate-800" onClick={() => handleSort('cgpa')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>CGPA</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center cursor-pointer hover:text-slate-800" onClick={() => handleSort('activeBacklogsCount')}>
                  <div className="flex items-center justify-center gap-1">
                    <span>Backlogs</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => {
                  const hasBacklogs = student.activeBacklogsCount > 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name & Admission Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shadow-inner">
                            {student.fullName ? student.fullName.charAt(0) : 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => onOpenViewStudent(student)}>
                              {student.fullName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                student.admissionType?.includes('Lateral')
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {student.admissionType || 'Regular Entry'}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {student.age ? `${student.age} yrs` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roll & Reg */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800 text-xs">
                          {student.rollNumber}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                          {student.registrationNumber}
                        </div>
                      </td>

                      {/* Branch & Batch */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 text-xs truncate max-w-xs">
                          {student.branch}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Class of {student.graduationBatch} &bull; Adm {student.admissionYear}
                        </div>
                      </td>

                      {/* Semester */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                          Sem {student.currentSemester}
                        </span>
                      </td>

                      {/* CGPA */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-black text-sm text-indigo-700">
                          {student.cgpa ? Number(student.cgpa).toFixed(2) : '-'}
                        </span>
                      </td>

                      {/* Backlogs */}
                      <td className="py-3.5 px-4 text-center">
                        {hasBacklogs ? (
                          <span 
                            onClick={() => onOpenBacklogs(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 cursor-pointer hover:bg-rose-200 transition-colors"
                            title="Click to view and manage active backlogs"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {student.activeBacklogsCount} Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Clean
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenViewStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenMarksheet(student, student.currentSemester || 1)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Semester Marksheets"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">No student academic records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try modifying your search criteria or add a new student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{sortedStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, sortedStudents.length)}</strong> of{' '}
            <strong className="text-slate-900">{sortedStudents.length}</strong> students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Student Record</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">{studentToDelete.fullName}</strong> (Roll: {studentToDelete.rollNumber})?
              </p>
              <p className="text-[11px] text-rose-600 mt-2 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                Warning: All associated semester marksheet data and backlog records for this student will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT SPREADSHEET MODAL */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
