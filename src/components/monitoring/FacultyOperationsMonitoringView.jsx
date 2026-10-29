import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  CheckSquare,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Eye,
  FileSpreadsheet,
  Activity
} from 'lucide-react';
import { getCurrentUser } from '../../services/storage';
import {
  isAuthorizedHod,
  fetchFacultyOperations,
  fetchFacultyMonitoringMetrics
} from '../../services/facultyMonitoringService';

export default function FacultyOperationsMonitoringView({ onNavigate }) {
  const currentUser = getCurrentUser();
  const isHod = isAuthorizedHod(currentUser);

  const [operations, setOperations] = useState([]);
  const [metrics, setMetrics] = useState({
    totalActiveFaculty: 0,
    totalClassSessions: 0,
    totalCrtSessions: 0,
    totalAttendanceEvaluations: 0,
    facultyList: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('ALL');
  const [selectedOpTypeFilter, setSelectedOpTypeFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  const loadData = useCallback(async () => {
    if (!isHod) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [opsData, metricsData] = await Promise.all([
        fetchFacultyOperations({}, currentUser),
        fetchFacultyMonitoringMetrics(currentUser)
      ]);
      setOperations(opsData || []);
      setMetrics(metricsData || {
        totalActiveFaculty: 0,
        totalClassSessions: 0,
        totalCrtSessions: 0,
        totalAttendanceEvaluations: 0,
        facultyList: []
      });
    } catch (err) {
      console.error('Error fetching faculty operations:', err);
      setErrorMsg(err.message || 'Failed to load faculty operations monitoring data.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isHod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived filtered operations
  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (op.facultyName || '').toLowerCase().includes(q);
        const matchesSubject = (op.subjectCode || '').toLowerCase().includes(q);
        const matchesTitle = (op.title || '').toLowerCase().includes(q);
        const matchesModule = (op.module || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSubject && !matchesTitle && !matchesModule) {
          return false;
        }
      }

      if (selectedFacultyFilter !== 'ALL' && op.facultyName !== selectedFacultyFilter) {
        return false;
      }

      if (selectedOpTypeFilter !== 'ALL' && op.operationType !== selectedOpTypeFilter) {
        return false;
      }

      if (selectedStatusFilter !== 'ALL' && op.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [operations, searchQuery, selectedFacultyFilter, selectedOpTypeFilter, selectedStatusFilter]);

  if (!isHod) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Restricted Access</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          The Faculty Operations Monitoring console is strictly reserved for Head of Department (HOD) and Institutional Administrators.
        </p>
      </div>
    );
  }

  const getOpBadge = (type) => {
    switch (type) {
      case 'CLASS_ATTENDANCE':
        return {
          icon: BookOpen,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Class Attendance'
        };
      case 'CRT_TRAINING':
        return {
          icon: CheckSquare,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'CRT Session'
        };
      case 'CURRICULUM_GOVERNANCE':
        return {
          icon: GraduationCap,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Syllabus Delivery'
        };
      default:
        return {
          icon: Activity,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'Faculty Operation'
        };
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'COMPLETED':
      case 'ON_TRACK':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BEHIND_SCHEDULE':
      case 'WARNING':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HOD Exclusive • Faculty Operations Monitoring</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Faculty Academic & Training Delivery Oversight
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tracking of faculty-led class attendance evaluations, CRT training sessions, and syllabus milestone delivery.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit Log</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Faculty</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {metrics.totalActiveFaculty}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Contributing to department cohorts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Class Sessions</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {metrics.totalClassSessions}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Conducted & logged</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">CRT Training</span>
            <CheckSquare className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {metrics.totalCrtSessions}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Modules & mock tests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Attendance Evaluated</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {metrics.totalAttendanceEvaluations}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Student candidate marks</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty name, subject code, or topic..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Faculty Select */}
          {metrics.facultyList && metrics.facultyList.length > 0 && (
            <select
              value={selectedFacultyFilter}
              onChange={(e) => setSelectedFacultyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Faculty Members</option>
              {metrics.facultyList.map((f, i) => (
                <option key={i} value={f}>
                  {f}
                </option>
              ))}
            </select>
          )}

          {/* Operation Type Select */}
          <select
            value={selectedOpTypeFilter}
            onChange={(e) => setSelectedOpTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Operations</option>
            <option value="CLASS_ATTENDANCE">Class Attendance</option>
            <option value="CRT_TRAINING">CRT Training</option>
            <option value="CURRICULUM_GOVERNANCE">Curriculum & Syllabus</option>
          </select>

          {/* Status Select */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ON_TRACK">On Track</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">Auditing Faculty Operations...</h4>
          <p className="text-xs text-slate-500 mt-1">Fetching real-time records from department attendance and training repositories.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMsg && filteredOperations.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h4 className="font-black text-slate-900 text-base mb-1">
            No Faculty Operations Records Found
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            {searchQuery || selectedFacultyFilter !== 'ALL' || selectedOpTypeFilter !== 'ALL'
              ? 'No faculty operations match your selected search or filter criteria. Try clearing filters.'
              : 'No faculty activity records have been recorded yet. Real operations (such as class attendance speed-marking, CRT sessions, and syllabus updates) will automatically display here when recorded.'}
          </p>
          {(searchQuery || selectedFacultyFilter !== 'ALL' || selectedOpTypeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFacultyFilter('ALL');
                setSelectedOpTypeFilter('ALL');
                setSelectedStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Activity Table & Records */}
      {!isLoading && !errorMsg && filteredOperations.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900 text-sm sm:text-base">
                Verified Faculty Operations Log ({filteredOperations.length})
              </h4>
              <p className="text-xs text-slate-500">Live operational ledger of faculty classroom and training actions.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-[11px]">
              Live Audited
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Operation Type</th>
                  <th className="py-3 px-4">Subject / Module</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Execution Summary</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOperations.map((act) => {
                  const badge = getOpBadge(act.operationType);
                  const Icon = badge.icon;
                  const initials = (act.facultyName || 'F')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Faculty Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-extrabold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {act.facultyName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {act.facultyId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Operation Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${badge.bg}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Subject / Module */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs">
                          <span className="font-bold text-slate-800 block truncate">
                            {act.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Dept: {act.department} • Sem {act.semester}
                          </span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col text-slate-600">
                          <span className="font-semibold">{act.sessionDate}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                        </div>
                      </td>

                      {/* Execution Details */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-600 font-medium leading-relaxed block">
                          {act.details}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border uppercase tracking-wider ${getStatusBadge(act.status)}`}>
                          {act.status}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
