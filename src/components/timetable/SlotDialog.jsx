import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DAYS, DEFAULT_PERIODS, SLOT_KINDS } from '../../utils/timetableGrid';
import { MasterTimetableApi } from '../../services/api';

export default function SlotDialog({
  isOpen,
  onClose,
  timetableId,
  initialData = null, // if editing existing slot or prefilled from cell click
  periods = DEFAULT_PERIODS,
  sections = [],
  subjects = [],
  facultyList = [],
  rooms = [],
  onSave, // (slotData) => Promise<void>
  validateSlot // (candidate) => Promise<ConflictDto[]>
}) {
  const dialogRef = useRef(null);

  const [formData, setFormData] = useState({
    id: null,
    sectionName: sections[0]?.name || 'A',
    labGroupCode: '', // empty string = whole section
    subjectId: '',
    subjectCode: '',
    subjectName: '',
    slotKind: 'THEORY',
    facultyIds: [],
    roomId: '',
    roomCode: '',
    dayOfWeek: 1,
    startPeriod: 1,
    span: 1,
    customStart: '',
    customEnd: '',
    note: ''
  });

  const [clashes, setClashes] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Find Available Slot Helper State (Prompt C)
  const [showFinder, setShowFinder] = useState(false);
  const [isFindingSlots, setIsFindingSlots] = useState(false);
  const [candidateSlots, setCandidateSlots] = useState(null);
  const [findSlotError, setFindSlotError] = useState('');

  const handleFindCandidates = async () => {
    setIsFindingSlots(true);
    setFindSlotError('');
    try {
      const payload = {
        sectionName: formData.sectionName,
        labGroupCode: formData.labGroupCode || null,
        kind: formData.slotKind,
        duration: Number(formData.span) || 1,
        facultyIds: formData.facultyIds || [],
        roomType: null
      };
      const results = await MasterTimetableApi.findCandidateSlots(payload, timetableId);
      setCandidateSlots(results || []);
    } catch (err) {
      setFindSlotError(err.message || 'Failed to find candidate slots');
    } finally {
      setIsFindingSlots(false);
    }
  };

  const applyCandidate = (cand) => {
    setFormData(prev => ({
      ...prev,
      dayOfWeek: cand.dayOfWeek,
      startPeriod: cand.startPeriod,
      span: cand.span,
      roomId: cand.roomId || prev.roomId,
      roomCode: cand.roomCode || prev.roomCode
    }));
  };

  // Sync initialData on open
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id || null,
          sectionName: initialData.sectionName || sections[0]?.name || 'A',
          labGroupCode: initialData.labGroupCode || '',
          subjectId: initialData.subjectId || '',
          subjectCode: initialData.subjectCode || '',
          subjectName: initialData.subjectName || '',
          slotKind: initialData.slotKind || 'THEORY',
          facultyIds: initialData.facultyIds || [],
          roomId: initialData.roomId || '',
          roomCode: initialData.roomCode || '',
          dayOfWeek: initialData.dayOfWeek || 1,
          startPeriod: initialData.startPeriod || 1,
          span: initialData.span || 1,
          customStart: initialData.customStart || '',
          customEnd: initialData.customEnd || '',
          note: initialData.note || ''
        });
      }
      setClashes([]);
      setErrorMessage('');
    }
  }, [isOpen, initialData, sections]);

  // Live Clash Validation (Debounced)
  const runLiveValidation = useCallback(async (currentForm) => {
    if (!validateSlot || !currentForm.subjectCode) return;
    setIsValidating(true);
    try {
      const results = await validateSlot(currentForm);
      setClashes(results || []);
    } catch {
      // Ignore background validation errors
    } finally {
      setIsValidating(false);
    }
  }, [validateSlot]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      runLiveValidation(formData);
    }, 350);
    return () => clearTimeout(timer);
  }, [formData, isOpen, runLiveValidation]);

  if (!isOpen) return null;

  // Selected section lab groups
  const currentSection = sections.find(s => s.name === formData.sectionName);
  const labGroups = currentSection?.labGroups || [
    { code: `${formData.sectionName}1` },
    { code: `${formData.sectionName}2` }
  ];

  const hardClashes = clashes.filter(c => c.severity === 'HARD');
  const softClashes = clashes.filter(c => c.severity === 'SOFT');
  const canSave = hardClashes.length === 0;

  const handleSubjectChange = (subjId) => {
    const s = subjects.find(sub => String(sub.id) === String(subjId));
    if (s) {
      setFormData(prev => ({
        ...prev,
        subjectId: s.id,
        subjectCode: s.shortCode || s.rtuCode,
        subjectName: s.name,
        slotKind: s.kind || prev.slotKind
      }));
    } else {
      setFormData(prev => ({ ...prev, subjectId: subjId }));
    }
  };

  const handleRoomChange = (rId) => {
    const r = rooms.find(rm => String(rm.id) === String(rId));
    setFormData(prev => ({
      ...prev,
      roomId: r ? r.id : rId,
      roomCode: r ? r.code : ''
    }));
  };

  const handleFacultyToggle = (facId) => {
    setFormData(prev => {
      const exists = prev.facultyIds.includes(facId);
      const updated = exists ? prev.facultyIds.filter(id => id !== facId) : [...prev.facultyIds, facId];
      return { ...prev, facultyIds: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      await onSave({
        ...formData,
        dayOfWeek: Number(formData.dayOfWeek),
        startPeriod: Number(formData.startPeriod),
        span: Number(formData.span)
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save slot');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h2 id="slot-dialog-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>{formData.id ? 'Edit Timetable Slot' : 'Add New Timetable Slot'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure subject, faculty, room and schedule alignment with live conflict checking.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Row 1: Section & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
              <select
                value={formData.sectionName}
                onChange={(e) => setFormData(prev => ({ ...prev, sectionName: e.target.value, labGroupCode: '' }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {sections.map(s => (
                  <option key={s.id || s.name} value={s.name}>Section {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Group</label>
              <select
                value={formData.labGroupCode}
                onChange={(e) => setFormData(prev => ({ ...prev, labGroupCode: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Whole Section (All Students)</option>
                {labGroups.map(g => (
                  <option key={g.code} value={g.code}>Batch {g.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Subject & Slot Kind */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={formData.subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="">-- Choose Subject or Custom --</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.shortCode || sub.rtuCode}: {sub.name} ({sub.kind || 'THEORY'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Slot Kind</label>
              <select
                value={formData.slotKind}
                onChange={(e) => setFormData(prev => ({ ...prev, slotKind: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {Object.entries(SLOT_KINDS).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Subject Inputs if manually entered */}
          {!formData.subjectId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Code / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. 5AID4-02 or CD"
                  value={formData.subjectCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, subjectCode: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Compiler Design"
                  value={formData.subjectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Find a Slot Helper (Prompt C) */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950">Find Available Slot Helper</span>
                <span className="text-[10px] text-indigo-600 font-medium">(Heuristic suggestion)</span>
              </div>
              <button
                type="button"
                onClick={handleFindCandidates}
                disabled={isFindingSlots}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {isFindingSlots && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{candidateSlots ? 'Refresh Suggestions' : 'Suggest Slots'}</span>
              </button>
            </div>

            {findSlotError && (
              <p className="text-[11px] text-rose-600 mt-2">{findSlotError}</p>
            )}

            {candidateSlots && (
              <div className="mt-3 space-y-1.5 border-t border-indigo-200 pt-2.5">
                <div className="text-[11px] font-semibold text-indigo-900 flex justify-between">
                  <span>Candidate Recommendations ({candidateSlots.length})</span>
                  <button
                    type="button"
                    onClick={() => setCandidateSlots(null)}
                    className="text-[10px] text-indigo-600 hover:underline"
                  >
                    Hide
                  </button>
                </div>
                {candidateSlots.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No zero-conflict slots found for current criteria.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {candidateSlots.map((cand, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-indigo-100 hover:border-indigo-300 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">
                            {DAYS[cand.dayOfWeek - 1]?.name || `Day ${cand.dayOfWeek}`}
                          </span>
                          <span className="text-slate-600 font-medium">
                            P{cand.startPeriod}{cand.span > 1 ? `-P${cand.startPeriod + cand.span - 1}` : ''}
                          </span>
                          {cand.roomCode && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                              {cand.roomCode}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => applyCandidate(cand)}
                          className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 3: Room & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Room / Venue</label>
              <select
                value={formData.roomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="">-- Choose Venue Room --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.code} {r.displayName ? `(${r.displayName})` : ''} — {r.roomType || 'ROOM'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                {DAYS.map(d => (
                  <option key={d.dayOfWeek} value={d.dayOfWeek}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Period & Span</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.startPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, startPeriod: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-800"
                >
                  {periods.map(p => (
                    <option key={p.periodIndex} value={p.periodIndex} disabled={p.isBreak}>
                      P{p.periodIndex} {p.isBreak ? '(Break)' : ''}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.span}
                  onChange={(e) => setFormData(prev => ({ ...prev, span: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-800"
                >
                  <option value={1}>1 Period</option>
                  <option value={2}>2 Periods (Lab)</option>
                  <option value={3}>3 Periods</option>
                  <option value={4}>4 Periods</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Faculty Multi-Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Faculty / Instructors (Multi-Select)
            </label>
            <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-50/50">
              {facultyList.map(f => {
                const isSelected = formData.facultyIds.includes(f.id);
                return (
                  <label
                    key={f.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                      isSelected ? 'bg-teal-100/70 text-teal-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleFacultyToggle(f.id)}
                      className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                    />
                    <span className="truncate">{f.fullName || f.shortCode}</span>
                    {f.shortCode && (
                      <span className="text-[10px] text-slate-400 font-normal">({f.shortCode})</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Row 5: Notes & Optional Custom Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Slot Note / Notice</label>
              <input
                type="text"
                placeholder="Optional instructions or room details"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Custom Start</label>
                <input
                  type="time"
                  value={formData.customStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, customStart: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-2 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Custom End</label>
                <input
                  type="time"
                  value={formData.customEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, customEnd: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-2 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Live Conflict Status Banner */}
          <div aria-live="polite" className="pt-2">
            {isValidating && (
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span>Checking clash engine...</span>
              </div>
            )}

            {!isValidating && hardClashes.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>Hard Clash Detected ({hardClashes.length}) — Cannot Save</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {hardClashes.map((c, i) => (
                    <li key={i}>{c.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {!isValidating && hardClashes.length === 0 && softClashes.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Notice ({softClashes.length} Warning{softClashes.length > 1 ? 's' : ''})</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {softClashes.map((c, i) => (
                    <li key={i}>{c.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {!isValidating && clashes.length === 0 && formData.subjectCode && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero clashes detected. Ready to save.</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave || isSaving}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 ${
                canSave && !isSaving
                  ? 'bg-teal-700 text-white hover:bg-teal-800'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSaving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{formData.id ? 'Save Changes' : 'Add Slot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
