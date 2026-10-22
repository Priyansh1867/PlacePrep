import React from 'react';
import { ArrowLeft, School, GraduationCap, Users } from 'lucide-react';
import DailyAttendancePortalView from '../components/attendance/DailyAttendancePortalView';

export default function DailyAttendancePage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate ? onNavigate('institute-portal') : window.history.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Institute Portal</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="cursor-pointer hover:text-slate-900" onClick={() => onNavigate && onNavigate('gateway')}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-slate-900" onClick={() => onNavigate && onNavigate('institute-portal')}>Institute Portal</span>
          <span>/</span>
          <span className="text-indigo-600 font-bold">Class Attendance</span>
        </div>
      </div>

      {/* Main Attendance Workspace */}
      <DailyAttendancePortalView onNavigate={onNavigate} />
    </div>
  );
}
