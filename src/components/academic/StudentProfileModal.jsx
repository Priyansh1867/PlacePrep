// PlacePrep AI - Team 2: Institute Support
// Comprehensive Student Profile Detail Modal

import React from 'react';
import { 
  X, 
  User, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Edit3, 
  ExternalLink
} from 'lucide-react';
import { calculateAgeFromDOB } from '../../data/initialAcademicRecords';

export default function StudentProfileModal({ 
  isOpen, 
  onClose, 
  student, 
  onEditStudent, 
  onOpenMarksheet, 
  onOpenBacklogs 
}) {
  if (!isOpen || !student) return null;

  const isLateral = 
    student.admissionType === 'Diploma / Lateral Entry' || 
    (student.course && student.course.toLowerCase().includes('diploma'));

  const age = student.age || (student.dateOfBirth ? calculateAgeFromDOB(student.dateOfBirth) : 'N/A');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Hero Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-900/40 border border-white/20">
              {student.fullName ? student.fullName.charAt(0) : 'S'}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">{student.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {student.admissionType || 'Regular Entry'}
                </span>
                {student.activeBacklogsCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/30 text-rose-200 border border-rose-400/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-300" />
                    {student.activeBacklogsCount} Active Backlog{student.activeBacklogsCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    Backlog Free
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-indigo-100/80">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded">Roll: {student.rollNumber}</span>
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded">Reg: {student.registrationNumber}</span>
                <span>{student.branch}</span>
                <span>Batch {student.graduationBatch}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => {
                  onClose();
                  onEditStudent(student);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Cumulative CGPA</span>
              <span className="text-xl font-black text-indigo-700 mt-0.5 block font-mono">
                {student.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Current Semester</span>
              <span className="text-xl font-black text-slate-800 mt-0.5 block">
                Semester {student.currentSemester}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Age</span>
              <span className="text-xl font-black text-slate-800 mt-0.5 block">
                {age} yrs
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Academic Standing</span>
              <span className={`text-sm font-bold mt-1 block ${
                student.activeBacklogsCount > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {student.activeBacklogsCount > 0 ? 'Needs Clearance' : 'In Good Standing'}
              </span>
            </div>
          </div>

          {/* Section: Personal & Contact Information */}
          <div className="border border-slate-200/80 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-indigo-600" />
              Personal & Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-slate-800">{student.dateOfBirth || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Gender</span>
                <span className="font-semibold text-slate-800">{student.gender || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Email Address</span>
                <span className="font-semibold text-slate-800 truncate block">{student.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Primary Mobile</span>
                <span className="font-semibold text-slate-800">{student.mobileNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Alternate Mobile</span>
                <span className="font-semibold text-slate-800">{student.alternateContact || 'None listed'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Institute</span>
                <span className="font-semibold text-slate-800 truncate block">{student.collegeName}</span>
              </div>
              <div className="sm:col-span-2 md:col-span-3">
                <span className="text-slate-400 block mb-0.5">Current Residential Address</span>
                <span className="font-medium text-slate-700">{student.currentAddress}</span>
              </div>
              {student.permanentAddress && student.permanentAddress !== student.currentAddress && (
                <div className="sm:col-span-2 md:col-span-3">
                  <span className="text-slate-400 block mb-0.5">Permanent Address</span>
                  <span className="font-medium text-slate-700">{student.permanentAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Prior Educational Qualifications */}
          <div className="border border-slate-200/80 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Award className="w-4 h-4 text-indigo-600" />
              Prior Educational Qualifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Class 10 Record */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-800">Class 10 / Matriculation</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    {student.class10Percentage}%
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p><span className="text-slate-400">Board:</span> {student.class10Board || 'CBSE / State'}</p>
                  <p><span className="text-slate-400">School:</span> {student.class10School || 'Secondary School'}</p>
                  <p><span className="text-slate-400">Passing Year:</span> {student.class10Year || '2020'}</p>
                </div>
              </div>

              {/* Class 12 Record (Regular Entry) */}
              {!isLateral && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">Class 12 / Senior Secondary</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                      {student.class12Percentage}%
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p><span className="text-slate-400">Board:</span> {student.class12Board || 'CBSE / State'}</p>
                    <p><span className="text-slate-400">School:</span> {student.class12School || 'Senior Secondary School'}</p>
                    <p><span className="text-slate-400">Passing Year:</span> {student.class12Year || '2022'}</p>
                  </div>
                </div>
              )}

              {/* Diploma Record (Lateral Entry Only) */}
              {isLateral && (
                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-amber-900">Polytechnic Diploma (Lateral Entry)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900">
                      {student.diplomaPercentage}%
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-700">
                    <p><span className="text-amber-800 font-medium">Polytechnic:</span> {student.diplomaCollege}</p>
                    <p><span className="text-amber-800 font-medium">Branch:</span> {student.diplomaSpecialization}</p>
                    <p><span className="text-amber-800 font-medium">Completion Year:</span> {student.diplomaYear}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Semester-Wise Marksheet Overview (1 to 8) */}
          <div className="border border-slate-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Semester Examination Progress (Semesters 1 to 8)
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onOpenMarksheet(student, student.currentSemester || 1);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Open Detailed Marksheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(semNum => {
                const semData = student.semesters?.find(s => Number(s.semester) === semNum);
                const isCompleted = semData?.status === 'Completed';
                const isInProgress = semData?.status === 'In Progress';
                const sgpa = semData?.sgpa;

                return (
                  <button
                    key={semNum}
                    onClick={() => {
                      onClose();
                      onOpenMarksheet(student, semNum);
                    }}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      isCompleted 
                        ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400' 
                        : isInProgress 
                          ? 'bg-indigo-50/60 border-indigo-200 hover:border-indigo-400' 
                          : 'bg-slate-50 border-slate-200/60 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold block text-slate-500">SEM {semNum}</span>
                    <span className="text-xs font-extrabold font-mono block mt-0.5 text-slate-800">
                      {sgpa ? Number(sgpa).toFixed(2) : '-'}
                    </span>
                    <span className={`text-[9px] font-semibold mt-0.5 block ${
                      isCompleted ? 'text-emerald-700' : isInProgress ? 'text-indigo-700' : 'text-slate-400'
                    }`}>
                      {isCompleted ? 'Pass' : isInProgress ? 'Ongoing' : 'Pending'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="text-xs text-slate-400">
            Enrolled Student ID: <span className="font-mono text-slate-600 font-semibold">{student.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {student.activeBacklogsCount > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBacklogs(student);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Manage Backlogs ({student.activeBacklogsCount})
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
