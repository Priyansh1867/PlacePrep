import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Users,
  UserCheck,
  Layers
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';

export default function PublishDialog({
  isOpen,
  onClose,
  timetable,
  onPublished
}) {
  const [diffReport, setDiffReport] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    if (!isOpen || !timetable?.id) return;

    let mounted = true;
    setLoading(true);
    setPublishError('');

    Promise.all([
      MasterTimetableApi.validateTimetable(timetable.id).catch(() => []),
      MasterTimetableApi.getDiff(timetable.id, (timetable.versionNo || 1) - 1, timetable.versionNo || 1).catch(() => null)
    ]).then(([clashList, diff]) => {
      if (!mounted) return;
      setConflicts(clashList || []);
      setDiffReport(diff);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [isOpen, timetable]);

  if (!isOpen || !timetable) return null;

  const hardClashes = conflicts.filter(c => c.severity === 'HARD');
  const softClashes = conflicts.filter(c => c.severity === 'SOFT');
  const isBlocked = hardClashes.length > 0;

  const handlePublish = async () => {
    if (isBlocked) return;
    setIsPublishing(true);
    setPublishError('');

    try {
      const updated = await MasterTimetableApi.publishTimetable(timetable.id);
      if (onPublished) onPublished(updated);
      onClose();
    } catch (err) {
      setPublishError(err.message || 'Failed to publish timetable.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h2 id="publish-dialog-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-600" />
              <span>Publish Timetable Version {timetable.versionNo || 1}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review diff, conflict checks, and coverage report before publishing to students and faculty.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close publish dialog"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {publishError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{publishError}</span>
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
              <div>Running validation and calculating version diff...</div>
            </div>
          ) : (
            <>
              {/* Coverage Report Card */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Section Status</div>
                    <div className="font-bold text-slate-800">
                      {timetable.departmentCode || 'AI_DS'} • Sem {timetable.semester || 5}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Target Version</div>
                    <div className="font-bold text-indigo-900">
                      v{timetable.versionNo || 1} (PUBLISHED)
                    </div>
                  </div>
                </div>
              </div>

              {/* Clash Check Status */}
              {isBlocked ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-2 text-rose-700">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Publish Blocked: {hardClashes.length} Hard Clash{hardClashes.length > 1 ? 'es' : ''}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    You cannot publish a timetable that has overlapping faculty, rooms, or whole-section slots.
                    Please resolve the clashes in the timetable editor before publishing.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    {hardClashes.slice(0, 3).map((c, i) => (
                      <li key={i}>{c.message}</li>
                    ))}
                    {hardClashes.length > 3 && (
                      <li className="font-semibold">+ {hardClashes.length - 3} more hard clashes</li>
                    )}
                  </ul>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Zero Hard Clashes Detected</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    The timetable is ready for live publishing. Students and instructors will immediately see this updated schedule.
                  </p>
                </div>
              )}

              {/* Soft Clashes / Warnings */}
              {!isBlocked && softClashes.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{softClashes.length} optimization warning{softClashes.length > 1 ? 's' : ''} detected. Publishing is permitted.</span>
                </div>
              )}

              {/* Diff summary */}
              {diffReport && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Version Comparison</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                    <div className="p-2 rounded-xl bg-emerald-100/60 text-emerald-800 font-bold">
                      +{diffReport.addedCount || 0} Added
                    </div>
                    <div className="p-2 rounded-xl bg-sky-100/60 text-sky-800 font-bold">
                      ~{diffReport.movedCount || 0} Moved
                    </div>
                    <div className="p-2 rounded-xl bg-rose-100/60 text-rose-800 font-bold">
                      -{diffReport.removedCount || 0} Removed
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isBlocked || loading || isPublishing}
            onClick={handlePublish}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
              !isBlocked && !loading && !isPublishing
                ? 'bg-teal-700 text-white hover:bg-teal-800 shadow-teal-700/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isPublishing && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <Send className="w-4 h-4" />
            <span>Confirm & Publish v{timetable.versionNo || 1}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
