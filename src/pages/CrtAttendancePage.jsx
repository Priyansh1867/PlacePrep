import React from 'react';
import { ArrowLeft, BookOpen, Award, Sparkles } from 'lucide-react';
import CrtAttendancePortalView from '../components/attendance/CrtAttendancePortalView';

export default function CrtAttendancePage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate ? onNavigate('institute-portal') : window.history.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Institute Portal</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('daily-attendance')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 px-3 py-2 rounded-xl border border-indigo-200 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Switch to Class Attendance</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="cursor-pointer hover:text-slate-900" onClick={() => onNavigate && onNavigate('gateway')}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-slate-900" onClick={() => onNavigate && onNavigate('institute-portal')}>Institute Portal</span>
          <span>/</span>
          <span className="text-violet-600 font-bold">CRT Attendance & Eligibility</span>
        </div>
      </div>

      {/* Main CRT Attendance Workspace */}
      <CrtAttendancePortalView onNavigate={onNavigate} />
    </div>
  );
}
