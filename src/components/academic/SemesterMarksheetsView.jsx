// PlacePrep AI - Team 2: Institute Support
// Semester-Wise Marksheets (Semesters 1 to 8) with Inline Marks Editing & Print-Ready View

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Edit2, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft
} from 'lucide-react';
import { 
  getAllStudents, 
  updateSubjectMarks
} from '../../services/academicRecordsService';

export default function SemesterMarksheetsView({ 
  initialStudentId = null, 
  initialSemester = 1,
  onBackToDirectory 
}) {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [activeSemester, setActiveSemester] = useState(initialSemester || 1);
  const [editingSubjectCode, setEditingSubjectCode] = useState(null);
  const [editMarksValue, setEditMarksValue] = useState('');
  const [editError, setEditError] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load students on mount
  useEffect(() => {
    const list = getAllStudents();
    setStudents(list);
    if (!selectedStudentId && list.length > 0) {
      setSelectedStudentId(list[0].id);
    }
  }, [selectedStudentId]);

  const currentStudent = students.find(s => s.id === selectedStudentId);
  const currentSemesterRecord = currentStudent?.semesters?.find(
    s => Number(s.semester) === Number(activeSemester)
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startEdit = (subject) => {
    setEditingSubjectCode(subject.code);
    setEditMarksValue(subject.obtainedMarks !== null && subject.obtainedMarks !== undefined ? subject.obtainedMarks : '');
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingSubjectCode(null);
    setEditMarksValue('');
    setEditError('');
  };

  const saveEdit = (subjectCode) => {
    const marks = editMarksValue === '' ? null : Number(editMarksValue);
    if (marks !== null && (isNaN(marks) || marks < 0 || marks > 100)) {
      setEditError('Marks must be between 0 and 100');
      return;
    }

    const res = updateSubjectMarks(selectedStudentId, activeSemester, subjectCode, marks);
    if (res.success) {
      // Refresh students
      const updated = getAllStudents();
      setStudents(updated);
      cancelEdit();
      showToast(`Subject ${subjectCode} marks updated successfully.`);
    } else {
      setEditError(res.message || 'Failed to update marks');
    }
  };

  const handlePrint = () => {
    window.print();
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

      {/* Top Header & Student Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDirectory && (
            <button
              onClick={onBackToDirectory}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Back to Student Directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Semester Marksheet Examination Records
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official institutional grade sheets for Semesters 1 through 8 with SGPA & CGPA audit
            </p>
          </div>
        </div>

        {/* Student Switcher Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-72">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Student Record
            </label>
            <select
              value={selectedStudentId || ''}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                cancelEdit();
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.rollNumber}) - {s.branch.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Print Marksheet</span>
            </button>
          </div>
        </div>
      </div>

      {currentStudent && (
        <>
          {/* Student Banner Info */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-xl bg-indigo-600/60 border border-white/20 text-white flex items-center justify-center font-bold text-xl shadow-inner">
                {currentStudent.fullName?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{currentStudent.fullName}</h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/10 text-indigo-200 border border-white/10">
                    {currentStudent.course}
                  </span>
                </div>
                <div className="text-xs text-indigo-200/80 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Roll: <strong className="text-white font-mono">{currentStudent.rollNumber}</strong></span>
                  <span>Reg: <strong className="text-white font-mono">{currentStudent.registrationNumber}</strong></span>
                  <span>{currentStudent.branch}</span>
                  <span>Batch: <strong className="text-white">{currentStudent.graduationBatch}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t border-white/10 md:border-none pt-3 md:pt-0">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">Cumulative CGPA</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {currentStudent.cgpa ? Number(currentStudent.cgpa).toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-white/20 mx-2" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">Backlogs</span>
                <span className={`text-base font-bold ${
                  currentStudent.activeBacklogsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {currentStudent.activeBacklogsCount || 0} Active
                </span>
              </div>
            </div>
          </div>

          {/* Semesters 1 to 8 Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(semNum => {
                const semData = currentStudent.semesters?.find(s => Number(s.semester) === semNum);
                const isSelected = activeSemester === semNum;
                const isCompleted = semData?.status === 'Completed';
                const isInProgress = semData?.status === 'In Progress';
                const sgpa = semData?.sgpa;

                return (
                  <button
                    key={semNum}
                    onClick={() => {
                      setActiveSemester(semNum);
                      cancelEdit();
                    }}
                    className={`py-3 px-2 rounded-xl text-center transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200'
                        : isCompleted
                          ? 'bg-slate-50 hover:bg-emerald-50/60 text-slate-700 border border-slate-200/60 hover:border-emerald-300'
                          : isInProgress
                            ? 'bg-slate-50 hover:bg-indigo-50/60 text-slate-700 border border-slate-200/60 hover:border-indigo-300'
                            : 'bg-slate-50/60 text-slate-400 border border-dashed border-slate-200 hover:text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] block font-bold uppercase tracking-wider opacity-90">
                      Semester {semNum}
                    </span>
                    <span className={`text-sm font-black font-mono block mt-0.5 ${
                      isSelected ? 'text-white' : 'text-slate-800'
                    }`}>
                      {sgpa ? Number(sgpa).toFixed(2) : '-'}
                    </span>
                    <span className={`text-[9px] font-semibold block mt-0.5 ${
                      isSelected 
                        ? 'text-indigo-100' 
                        : isCompleted 
                          ? 'text-emerald-600' 
                          : isInProgress 
                            ? 'text-indigo-600' 
                            : 'text-slate-400'
                    }`}>
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Marksheet Details Card */}
          {currentSemesterRecord ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              
              {/* Semester Header Summary */}
              <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    S{activeSemester}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Semester {activeSemester} Marksheet
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        currentSemesterRecord.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentSemesterRecord.status === 'In Progress'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {currentSemesterRecord.status}
                      </span>
                      {currentSemesterRecord.resultStatus === 'Provisional' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Provisional Result
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Academic Session: {currentSemesterRecord.academicYear || '2024-2025'} &bull; {currentSemesterRecord.publicationDate || 'Standard Evaluation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Credits</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {currentSemesterRecord.subjects?.reduce((sum, s) => sum + (s.credits || 0), 0)}
                    </span>
                  </div>
                  <div className="h-6 w-[1px] bg-slate-200" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">SGPA</span>
                    <span className="font-extrabold text-indigo-700 text-sm font-mono">
                      {currentSemesterRecord.sgpa ? Number(currentSemesterRecord.sgpa).toFixed(2) : 'Pending'}
                    </span>
                  </div>
                  <div className="h-6 w-[1px] bg-slate-200" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Result</span>
                    <span className={`font-bold ${
                      currentSemesterRecord.resultStatus === 'Pass' 
                        ? 'text-emerald-600' 
                        : currentSemesterRecord.resultStatus?.includes('Backlog') 
                          ? 'text-rose-600' 
                          : 'text-amber-600'
                    }`}>
                      {currentSemesterRecord.resultStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Subject Code</th>
                      <th className="py-3 px-4">Course / Subject Title</th>
                      <th className="py-3 px-4 text-center">Credits</th>
                      <th className="py-3 px-4 text-center">Max Marks</th>
                      <th className="py-3 px-4 text-center">Marks Obtained</th>
                      <th className="py-3 px-4 text-center">Letter Grade</th>
                      <th className="py-3 px-4 text-center">Grade Point</th>
                      <th className="py-3 px-4 text-center">Result Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentSemesterRecord.subjects && currentSemesterRecord.subjects.length > 0 ? (
                      currentSemesterRecord.subjects.map((sub) => {
                        const isEditingThis = editingSubjectCode === sub.code;

                        return (
                          <tr 
                            key={sub.code} 
                            className={`hover:bg-slate-50/80 transition-colors ${
                              sub.result === 'Fail' ? 'bg-rose-50/30' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              {sub.code}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                              {sub.name}
                              {sub.isBacklog && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                  Backlog Record
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                              {sub.credits}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                              {sub.maxMarks || 100}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isEditingThis ? (
                                <div className="inline-flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max={sub.maxMarks || 100}
                                    value={editMarksValue}
                                    onChange={(e) => setEditMarksValue(e.target.value)}
                                    className="w-18 px-2 py-1 text-center font-mono font-bold text-xs border border-indigo-500 rounded bg-indigo-50 focus:outline-none"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <span className={`font-mono font-bold ${
                                  sub.obtainedMarks !== null ? 'text-slate-900' : 'text-slate-400 italic'
                                }`}>
                                  {sub.obtainedMarks !== null ? sub.obtainedMarks : 'Pending'}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded font-black font-mono text-xs ${
                                sub.grade === 'O' || sub.grade === 'A+' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : sub.grade === 'F' 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : sub.grade === '-' 
                                      ? 'text-slate-400' 
                                      : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {sub.grade || '-'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                              {sub.gradePoints !== null && sub.gradePoints !== undefined ? sub.gradePoints : '-'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                sub.result === 'Pass'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : sub.result === 'Fail'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-600'
                              }`}>
                                {sub.result === 'Pass' && <Check className="w-3 h-3" />}
                                {sub.result === 'Fail' && <AlertTriangle className="w-3 h-3" />}
                                {sub.result || 'Pending'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isEditingThis ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => saveEdit(sub.code)}
                                    className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                    title="Save Marks"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEdit(sub)}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 hover:underline"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit Marks</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No subjects registered for this semester.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {editError && (
                <div className="px-6 py-2 bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border-t border-rose-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Grading Scheme Legend Footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-bold uppercase tracking-wider text-slate-700">Grading Scale:</span>
                  <span className="inline-flex items-center gap-1"><strong className="text-emerald-700 font-mono">O</strong> (90-100%, 10 pts)</span>
                  <span className="inline-flex items-center gap-1"><strong className="text-emerald-700 font-mono">A+</strong> (80-89%, 9 pts)</span>
                  <span className="inline-flex items-center gap-1"><strong className="text-indigo-700 font-mono">A</strong> (70-79%, 8 pts)</span>
                  <span className="inline-flex items-center gap-1"><strong className="text-indigo-700 font-mono">B+</strong> (60-69%, 7 pts)</span>
                  <span className="inline-flex items-center gap-1"><strong className="text-slate-700 font-mono">B</strong> (50-59%, 6 pts)</span>
                  <span className="inline-flex items-center gap-1"><strong className="text-slate-700 font-mono">C</strong> (40-49%, 5 pts)</span>
                  <span className="inline-flex items-center gap-1"><strong className="text-rose-700 font-mono">F</strong> (&lt;40%, Fail)</span>
                </div>
                <div className="text-slate-400 italic">
                  Formula: SGPA = &Sigma;(Credit &times; Grade Point) / &Sigma;(Credit)
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 text-slate-400">
              No examination record available for Semester {activeSemester}.
            </div>
          )}
        </>
      )}

      {/* PRINT-FRIENDLY MARKSHEET MODAL */}
      {isPrintModalOpen && currentStudent && currentSemesterRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Modal Top Bar */}
            <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                Print Preview: Official Academic Grade Sheet
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Paper Canvas */}
            <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900 space-y-6 print:p-0 print:m-0">
              
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  {currentStudent.collegeName || ''}
                </h1>
                <p className="text-xs uppercase tracking-widest text-slate-600 mt-1 font-semibold">
                  Office of the Controller of Examinations &bull; Academic Transcript
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800">
                  Statement of Grades &bull; Semester {activeSemester} Examination
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border border-slate-300 p-4 rounded-lg bg-slate-50/50">
                <div>
                  <span className="text-slate-500 font-medium">Student Full Name:</span>{' '}
                  <strong className="text-slate-900">{currentStudent.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">University Reg No:</span>{' '}
                  <strong className="text-slate-900 font-mono">{currentStudent.registrationNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Institute Roll Number:</span>{' '}
                  <strong className="text-slate-900 font-mono">{currentStudent.rollNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Course & Degree:</span>{' '}
                  <strong className="text-slate-900">{currentStudent.course}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Branch / Stream:</span>{' '}
                  <strong className="text-slate-900">{currentStudent.branch}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Academic Session:</span>{' '}
                  <strong className="text-slate-900">{currentSemesterRecord.academicYear}</strong>
                </div>
              </div>

              {/* Printable Table of Subjects */}
              <table className="w-full text-left text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                    <th className="border border-slate-400 py-2 px-3">Sub Code</th>
                    <th className="border border-slate-400 py-2 px-3">Subject Name</th>
                    <th className="border border-slate-400 py-2 px-3 text-center">Credits</th>
                    <th className="border border-slate-400 py-2 px-3 text-center">Max</th>
                    <th className="border border-slate-400 py-2 px-3 text-center">Obt</th>
                    <th className="border border-slate-400 py-2 px-3 text-center">Grade</th>
                    <th className="border border-slate-400 py-2 px-3 text-center">Points</th>
                    <th className="border border-slate-400 py-2 px-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemesterRecord.subjects?.map(sub => (
                    <tr key={sub.code} className="border-b border-slate-300">
                      <td className="border border-slate-300 py-2 px-3 font-mono font-bold">{sub.code}</td>
                      <td className="border border-slate-300 py-2 px-3">{sub.name}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{sub.credits}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{sub.maxMarks}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono font-bold">
                        {sub.obtainedMarks !== null ? sub.obtainedMarks : '-'}
                      </td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-bold font-mono">{sub.grade}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-mono">{sub.gradePoints ?? '-'}</td>
                      <td className="border border-slate-300 py-2 px-3 text-center font-bold">{sub.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Performance Summary Banner */}
              <div className="grid grid-cols-3 gap-4 border-2 border-slate-900 p-3 rounded-lg text-center bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester SGPA</span>
                  <span className="text-xl font-black font-mono text-slate-900">
                    {currentSemesterRecord.sgpa ? Number(currentSemesterRecord.sgpa).toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Cumulative CGPA</span>
                  <span className="text-xl font-black font-mono text-slate-900">
                    {currentStudent.cgpa ? Number(currentStudent.cgpa).toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Semester Status</span>
                  <span className="text-base font-bold text-slate-900">
                    {currentSemesterRecord.resultStatus}
                  </span>
                </div>
              </div>

              {/* Signatures & Disclaimers */}
              <div className="pt-12 grid grid-cols-2 gap-8 text-xs border-t border-slate-300">
                <div className="text-center pt-8 border-t border-slate-400">
                  <span className="font-bold text-slate-800 uppercase block">Verified by HOD / Department Dean</span>
                  <span className="text-[10px] text-slate-500">Department of {currentStudent.branch}</span>
                </div>
                <div className="text-center pt-8 border-t border-slate-400">
                  <span className="font-bold text-slate-800 uppercase block">Controller of Examinations</span>
                  <span className="text-[10px] text-slate-500">PlacePrep AI Academic Records Authority</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
                Disclaimer: This is an official institutional copy generated by PlacePrep AI Student Academic Records System. Issued on {new Date().toLocaleDateString()}.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
