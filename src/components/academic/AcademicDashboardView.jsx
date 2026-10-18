// PlacePrep AI - Team 2: Institute Support
// Academic Records Overview Dashboard with Analytics, Distribution Visuals & Recent Activity

import React, { useMemo } from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  ArrowRight, 
  Plus, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  BarChart3, 
  Clock, 
  ChevronRight
} from 'lucide-react';
import { getAcademicDashboardMetrics } from '../../services/academicRecordsService';

export default function AcademicDashboardView({ 
  onNavigateTab, 
  onOpenCreateStudent, 
  onOpenViewStudent 
}) {
  const metrics = useMemo(() => getAcademicDashboardMetrics(), []);

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden">
        <div className="absolute -right-8 -top-8 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Team 2 &bull; Institute Support & Academic Registry</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Student Academic Records Administration
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 mt-1.5 leading-relaxed">
              Centralized repository for student profiles, 10th/12th/Diploma credentials, semester 1–8 marksheets, automated SGPA/CGPA evaluation, and backlog tracking.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreateStudent}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => onNavigateTab('import-export')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Bulk Ingestion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Enrolled Students
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
              {metrics.totalStudents}
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 mt-1 block">
              Across all batches
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Average CGPA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Average Institute CGPA
            </span>
            <span className="text-2xl font-black text-indigo-700 mt-1 block font-mono">
              {metrics.avgCGPA} / 10
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
              Weighted grading standard
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Active Backlogs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Backlogs
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">
              {metrics.activeBacklogsCount}
            </span>
            <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
              {metrics.studentsWithActiveBacklogs} students affected
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Backlog Free Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Backlog-Free Rate
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">
              {metrics.totalStudents > 0 
                ? `${Math.round((metrics.backlogFreeStudents / metrics.totalStudents) * 100)}%` 
                : '100%'}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              {metrics.backlogFreeStudents} students clean
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Distribution Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Distribution Visuals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Branch Distribution Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Students Grouped by Branch / Specialization
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('directory')}
                className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>View in Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(metrics.branchCount).map(([branch, count]) => {
                const percentage = metrics.totalStudents > 0 
                  ? Math.round((count / metrics.totalStudents) * 100) 
                  : 0;

                return (
                  <div key={branch} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-xs">{branch}</span>
                      <span className="font-mono text-slate-500 font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Semester Distribution Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Semester-Wise Student Enrollment
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Object.entries(metrics.semesterCount).map(([sem, count]) => (
                <div key={sem} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">SEM {sem}</span>
                  <span className="text-lg font-black font-mono text-slate-900 block mt-0.5">{count}</span>
                  <span className="text-[10px] text-slate-500 block">students</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Student Activity & Backlog Highlights */}
        <div className="space-y-6">
          
          {/* Recently Added / Updated Records */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Recently Updated Profiles
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {metrics.recentStudents && metrics.recentStudents.length > 0 ? (
                metrics.recentStudents.map(student => (
                  <div
                    key={student.id}
                    onClick={() => onOpenViewStudent(student)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {student.fullName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {student.rollNumber} &bull; Sem {student.currentSemester}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-indigo-700 block">
                        {student.cgpa ? Number(student.cgpa).toFixed(2) : '-'}
                      </span>
                      <span className="text-[10px] text-slate-400">CGPA</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No student records yet.
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigateTab('directory')}
              className="w-full py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
            >
              <span>Explore All {metrics.totalStudents} Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Cards */}
          <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
              Module Quick Links
            </h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigateTab('marksheets')}
                className="w-full p-2.5 rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 shadow-sm text-left font-semibold text-slate-800 hover:text-indigo-600 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Semester 1–8 Marksheets</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('backlogs')}
                className="w-full p-2.5 rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 shadow-sm text-left font-semibold text-slate-800 hover:text-indigo-600 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Backlog Resolution Tracker</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('import-export')}
                className="w-full p-2.5 rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 shadow-sm text-left font-semibold text-slate-800 hover:text-indigo-600 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>Excel (.xlsx) / CSV Import Center</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
