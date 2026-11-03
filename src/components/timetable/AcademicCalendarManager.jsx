import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Filter,
  X,
  CalendarCheck
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';

const EVENT_KINDS = [
  { value: 'HOLIDAY', label: 'Holiday', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'EXAM', label: 'Exam / Evaluation', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'NO_CLASSES', label: 'No Classes', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'EVENT', label: 'College Event / Fest', color: 'bg-blue-100 text-blue-800 border-blue-300' }
];

const EVENT_SCOPES = [
  { value: 'WHOLE_INSTITUTE', label: 'Whole Institute' },
  { value: 'DEPARTMENT', label: 'Specific Department' },
  { value: 'YEAR_SECTION', label: 'Specific Year & Section' }
];

export default function AcademicCalendarManager({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterKind, setFilterKind] = useState('');
  const [filterScope, setFilterScope] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    kind: 'HOLIDAY',
    scope: 'WHOLE_INSTITUTE',
    departmentCode: '',
    yearOfStudy: '',
    sectionName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await MasterTimetableApi.listCalendarEvents();
      setEvents(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      setError(err.message || 'Failed to fetch academic calendar events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      kind: 'HOLIDAY',
      scope: 'WHOLE_INSTITUTE',
      departmentCode: '',
      yearOfStudy: '',
      sectionName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingId(evt.id);
    setFormData({
      title: evt.title || '',
      kind: evt.kind || 'HOLIDAY',
      scope: evt.scope || 'WHOLE_INSTITUTE',
      departmentCode: evt.departmentCode || '',
      yearOfStudy: evt.yearOfStudy !== null && evt.yearOfStudy !== undefined ? String(evt.yearOfStudy) : '',
      sectionName: evt.sectionName || '',
      startDate: evt.startDate || '',
      endDate: evt.endDate || '',
      description: evt.description || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete calendar event "${title}"?`)) return;
    try {
      await MasterTimetableApi.deleteCalendarEvent(id);
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event: ' + (err.message || 'Server error'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Event title is required');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setFormError('Start date and end date are required');
      return;
    }
    if (formData.startDate > formData.endDate) {
      setFormError('Start date cannot be after end date');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        title: formData.title.trim(),
        kind: formData.kind,
        scope: formData.scope,
        departmentCode: formData.scope !== 'WHOLE_INSTITUTE' ? (formData.departmentCode.trim() || null) : null,
        yearOfStudy: formData.scope === 'YEAR_SECTION' && formData.yearOfStudy ? Number(formData.yearOfStudy) : null,
        sectionName: formData.scope === 'YEAR_SECTION' && formData.sectionName ? formData.sectionName.trim().toUpperCase() : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim() || null
      };

      if (editingId) {
        await MasterTimetableApi.updateCalendarEvent(editingId, payload);
      } else {
        await MasterTimetableApi.createCalendarEvent(payload);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      setFormError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const safeEvents = Array.isArray(events) ? events : [];
  const filteredEvents = safeEvents.filter(evt => {
    if (filterKind && evt.kind !== filterKind) return false;
    if (filterScope && evt.scope !== filterScope) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Academic Calendar & Holidays</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official holidays, exams, and non-instructional days. The master timetable grid is preserved, while class schedules are dynamically marked or suspended.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEvents}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Calendar Event</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Kind:</span>
          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value)}
            className="bg-transparent text-slate-800 font-medium focus:outline-none"
          >
            <option value="">All Kinds</option>
            {EVENT_KINDS.map(k => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="font-semibold text-slate-600">Scope:</span>
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            className="bg-transparent text-slate-800 font-medium focus:outline-none"
          >
            <option value="">All Scopes</option>
            {EVENT_SCOPES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {(filterKind || filterScope) && (
          <button
            type="button"
            onClick={() => { setFilterKind(''); setFilterScope(''); }}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span className="text-xs font-medium">Loading calendar events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CalendarCheck className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">No Calendar Events Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No academic events or holidays have been scheduled yet. Click "Add Calendar Event" to schedule institute holidays or exam weeks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Kind</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Date Range</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map(evt => {
                  const kindMeta = EVENT_KINDS.find(k => k.value === evt.kind) || EVENT_KINDS[0];
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {evt.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${kindMeta.color}`}>
                          {kindMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800">
                          {evt.scope === 'WHOLE_INSTITUTE' ? 'Whole Institute' : evt.scope === 'DEPARTMENT' ? `Dept: ${evt.departmentCode || 'All'}` : `Sec ${evt.sectionName || ''} (Yr ${evt.yearOfStudy || ''})`}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {evt.startDate} {evt.endDate !== evt.startDate ? `→ ${evt.endDate}` : ''}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {evt.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(evt)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(evt.id, evt.title)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>{editingId ? 'Edit Calendar Event' : 'Create Academic Event / Holiday'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Break, Mid-Term Exam Week, Sports Day"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Kind *</label>
                  <select
                    value={formData.kind}
                    onChange={(e) => setFormData(prev => ({ ...prev, kind: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    {EVENT_KINDS.map(k => (
                      <option key={k.value} value={k.value}>{k.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Applicable Scope *</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800"
                  >
                    {EVENT_SCOPES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.scope !== 'WHOLE_INSTITUTE' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CSE, AI_DS, ECE"
                      value={formData.departmentCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, departmentCode: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  {formData.scope === 'YEAR_SECTION' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Year of Study</label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          placeholder="e.g. 3"
                          value={formData.yearOfStudy}
                          onChange={(e) => setFormData(prev => ({ ...prev, yearOfStudy: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Section</label>
                        <input
                          type="text"
                          placeholder="e.g. A"
                          value={formData.sectionName}
                          onChange={(e) => setFormData(prev => ({ ...prev, sectionName: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Reason</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or administrative memo reference"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-2"
                >
                  {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingId ? 'Update Event' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

