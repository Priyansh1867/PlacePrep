import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Download,
  Building2,
  Hash,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { getAllStudents, getStudentById } from '../services/academicRecordsService';
import { getCurrentUser, getGraduationBatch } from '../services/storage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';

export default function AcademicProfilePage({ onNavigate }) {
  const currentUser = getCurrentUser();
  const currentBatch = getGraduationBatch();
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const allStudents = getAllStudents();
    // Match current user by email or name, or fallback to first student (Priyansh Jain)
    let found = allStudents.find(
      s => (currentUser?.email && s.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
           (currentUser?.name && s.fullName?.toLowerCase().includes(currentUser.name?.toLowerCase()))
    );
    if (!found && allStudents.length > 0) {
      found = allStudents[0];
    }
    setStudent(found);
    if (found?.currentSemester) {
      setSelectedSemester(Math.min(found.currentSemester, 8));
    }
  }, [currentUser?.email]);

  if (!student) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700">Loading Academic Profile...</h3>
      </div>
    );
  }

  const currentMarksheet = (student.semesters || []).find(s => s.semester === selectedSemester) || student.semesters?.[0];
  const activeBacklogs = student.activeBacklogsCount || 0;
  const isBacklogFree = activeBacklogs === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Navigation */}
      {onNavigate && (
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </button>
      )}

      {/* Hero Profile Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/90 text-white font-black text-3xl flex items-center justify-center shadow-lg border border-white/20 shrink-0">
              {student.fullName?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {student.fullName}
                </h1>
                <Badge variant="purple" size="sm">
                  Batch {student.graduationBatch || currentBatch}
                </Badge>
                {isBacklogFree ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 0 Backlogs (All Clear)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {activeBacklogs} Active Backlog(s)
                  </span>
                )}
              </div>

              <p className="text-sm text-indigo-200 mt-1 font-mono">
                {student.collegeName || 'Delhi Technological University (DTU)'}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-indigo-100 border border-white/15">
                  Roll: <strong className="text-white">{student.rollNumber}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-indigo-100 border border-white/15">
                  Branch: <strong className="text-white">{student.branch}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-indigo-100 border border-white/15">
                  Degree: <strong className="text-white">{student.course || 'B.Tech'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick CGPA Highlight Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white shrink-0 md:text-right min-w-[200px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
              Cumulative CGPA
            </span>
            <div className="text-4xl font-black text-white flex items-baseline md:justify-end gap-1">
              <span>{student.cumulativeCgpa?.toFixed(2) || '8.84'}</span>
              <span className="text-sm font-semibold text-indigo-300">/ 10.0</span>
            </div>
            <p className="text-xs text-emerald-300 font-semibold mt-1 flex items-center md:justify-end gap-1">
              <Sparkles className="w-3.5 h-3.5" /> First Class with Distinction
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-indigo-100 bg-indigo-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall CGPA</span>
            <span className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-950">
            {student.cumulativeCgpa?.toFixed(2) || '8.84'}
          </div>
          <p className="mt-1 text-xs text-indigo-600 font-medium">Top 5% of Department</p>
        </Card>

        <Card className="p-5 border-emerald-100 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standing Backlogs</span>
            <span className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-950">
            {activeBacklogs}
          </div>
          <p className="mt-1 text-xs text-emerald-700 font-medium">Eligible for all company cutoffs</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class 10th Marks</span>
            <span className="p-2 bg-slate-100 rounded-xl text-slate-700">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {student.class10?.percentage || 94.4}%
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">{student.class10?.boardName || 'CBSE'}</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class 12th Marks</span>
            <span className="p-2 bg-slate-100 rounded-xl text-slate-700">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {student.class12?.percentage || 92.2}%
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">{student.class12?.boardName || 'CBSE'} (PCM)</p>
        </Card>
      </div>

      {/* Semester Progression Bar */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Semester-wise Academic Performance (Semesters 1 - 8)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a semester to review official grade cards, individual subject marks, credits, and grade points.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Current Standing: Semester {student.currentSemester || 6}
          </span>
        </div>

        {/* Semester Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(semNum => {
            const semData = (student.semesters || []).find(s => s.semester === semNum);
            const isCompleted = semData && semData.status === 'Completed';
            const isCurrent = (student.currentSemester || 6) === semNum;
            const isSelected = selectedSemester === semNum;

            return (
              <button
                key={semNum}
                onClick={() => setSelectedSemester(semNum)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex flex-col items-center min-w-[90px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isCompleted
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-slate-50/50 text-slate-400 border border-dashed border-slate-200'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold opacity-80">Sem {semNum}</span>
                <span className="text-sm font-extrabold mt-0.5">
                  {semData?.sgpa ? `${semData.sgpa.toFixed(2)} SGPA` : isCurrent ? 'Ongoing' : 'Upcoming'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Marksheet Detail for Selected Semester */}
        {currentMarksheet ? (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Semester {currentMarksheet.semester} SGPA</span>
                  <span className="text-2xl font-black text-indigo-700">{currentMarksheet.sgpa?.toFixed(2) || '8.80'}</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Progression CGPA</span>
                  <span className="text-2xl font-black text-slate-900">{currentMarksheet.cgpa?.toFixed(2) || student.cumulativeCgpa?.toFixed(2)}</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Total Marks</span>
                  <span className="text-2xl font-black text-slate-900">{currentMarksheet.obtainedMarks} / {currentMarksheet.maxMarks}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={currentMarksheet.resultStatus === 'Pass' ? 'success' : 'warning'}>
                  {currentMarksheet.resultStatus || 'Pass'}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Published: {currentMarksheet.publicationDate || 'June 2024'}</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4 text-center">Credits</th>
                    <th className="py-3 px-4 text-center">Max Marks</th>
                    <th className="py-3 px-4 text-center">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4 text-center">Grade Points</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(currentMarksheet.subjects || []).map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">{sub.code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{sub.name}</td>
                      <td className="py-3 px-4 text-center font-mono">{sub.credits}</td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{sub.maxMarks}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{sub.obtainedMarks}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold font-mono text-xs ${
                          sub.grade === 'O' ? 'bg-purple-100 text-purple-800' :
                          sub.grade === 'A+' ? 'bg-indigo-100 text-indigo-800' :
                          sub.grade === 'A' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">{sub.gradePoints}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={sub.isBacklog ? 'rose' : 'success'} size="sm">
                          {sub.result || 'Pass'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">Semester {selectedSemester} Curriculum in Progress</h4>
            <p className="text-xs text-slate-500 mt-1">Official marksheet for this semester will be published upon completion of end-semester examinations.</p>
          </div>
        )}
      </Card>

      {/* Placement Eligibility Clearance Verification Callout */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">Academic Eligibility Verified for Campus Drives</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              With a CGPA of <strong>{student.cumulativeCgpa?.toFixed(2) || '8.84'}</strong> and <strong>0 Active Backlogs</strong>, your academic record is clear for 100% of recruitment drives.
            </p>
          </div>
        </div>

        {onNavigate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('drives')}
            className="shrink-0"
          >
            Explore Eligible Drives →
          </Button>
        )}
      </div>

    </div>
  );
}
