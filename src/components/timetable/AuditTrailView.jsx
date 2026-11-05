import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  User,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';

export default function AuditTrailView({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [userId, setUserId] = useState('');
  const [timetableId, setTimetableId] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await MasterTimetableApi.getAuditLogs({
        from: from || undefined,
        to: to || undefined,
        userId: userId || undefined,
        timetableId: timetableId || undefined,
        page,
        size: pageSize
      });
      setLogs(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      setError(err.message || 'Failed to fetch timetable audit logs');
    } finally {
      setLoading(false);
    }
  }, [from, to, userId, timetableId, page, pageSize]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(0);
    loadLogs();
  };

  const handleClearFilters = () => {
    setFrom('');
    setTo('');
    setUserId('');
    setTimetableId('');
    setPage(0);
  };

  const safeLogs = Array.isArray(logs) ? logs : [];
  const filteredLogs = safeLogs.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.username && l.username.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.entityType && l.entityType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <span>Timetable Governance & Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all timetable modifications, slot additions, publish events, version restores, and Excel/PDF import jobs.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-2"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-semibold">Refresh</span>
        </button>
      </div>

      {/* Filter Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">User ID</label>
            <input
              type="text"
              placeholder="e.g. 42"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Timetable ID</label>
            <input
              type="text"
              placeholder="e.g. 101"
              value={timetableId}
              onChange={(e) => setTimetableId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition shadow-2xs"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Quick Search */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Quick search in current results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-teal-600"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredLogs.length} audit event{filteredLogs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-xs font-medium">Loading audit history...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No Audit Logs Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No audit records matched your filter criteria. Try adjusting dates or clearing the search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => {
                  let badgeColor = 'bg-slate-100 text-slate-800';
                  if (log.action?.includes('PUBLISH')) badgeColor = 'bg-emerald-100 text-emerald-800';
                  else if (log.action?.includes('IMPORT')) badgeColor = 'bg-indigo-100 text-indigo-800';
                  else if (log.action?.includes('RESTORE')) badgeColor = 'bg-purple-100 text-purple-800';
                  else if (log.action?.includes('DELETE')) badgeColor = 'bg-rose-100 text-rose-800';
                  else if (log.action?.includes('UPDATE') || log.action?.includes('OVERRIDE')) badgeColor = 'bg-amber-100 text-amber-800';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${badgeColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{log.entityType || '—'}</span>
                        {log.entityId && (
                          <span className="text-slate-400 text-[10px] ml-1">#{log.entityId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{log.username || 'System'}</div>
                        {log.userId && (
                          <div className="text-[10px] text-slate-400">UID: {log.userId}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-md truncate" title={log.details}>
                        {log.details || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        {log.ipAddress || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Page {page + 1}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={safeLogs.length < pageSize || loading}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

