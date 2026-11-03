import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  RotateCcw,
  Clock,
  AlertCircle
} from 'lucide-react';
import { MasterTimetableApi } from '../../services/api';

export default function VersionHistory({
  isOpen,
  onClose,
  timetableId,
  currentVersionNo,
  onVersionRestored
}) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [diffReport, setDiffReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !timetableId) return;

    let mounted = true;
    setLoading(true);
    setErrorMsg('');

    MasterTimetableApi.getVersions(timetableId)
      .then(list => {
        if (!mounted) return;
        setVersions(list || []);
        if (list && list.length > 0) {
          setSelectedVersion(list[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        setErrorMsg(err.message || 'Failed to load version history.');
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [isOpen, timetableId]);

  // Load diff when selectedVersion changes
  useEffect(() => {
    if (!timetableId || !selectedVersion) return;

    MasterTimetableApi.getDiff(timetableId, selectedVersion.versionNo, currentVersionNo)
      .then(diff => setDiffReport(diff))
      .catch(() => setDiffReport(null));
  }, [timetableId, selectedVersion, currentVersionNo]);

  if (!isOpen) return null;

  const handleRestore = async (versionNo) => {
    if (!window.confirm(`Are you sure you want to restore version v${versionNo}? Current draft edits will be replaced.`)) {
      return;
    }

    setIsRestoring(true);
    setErrorMsg('');
    try {
      const restored = await MasterTimetableApi.restoreVersion(timetableId, versionNo);
      if (onVersionRestored) onVersionRestored(restored);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to restore version.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-history-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-teal-600" />
            <div>
              <h2 id="version-history-title" className="text-base font-bold text-slate-900">
                Version History & Audit Log
              </h2>
              <p className="text-xs text-slate-500">
                Current Active Version: <strong>v{currentVersionNo || 1}</strong>
              </p>
            </div>
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

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin inline-block mb-2" />
              <div>Loading version history snapshots...</div>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <div>No historical published versions available yet for this timetable.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left Column: Version list */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {versions.map(v => {
                  const isSelected = selectedVersion?.versionNo === v.versionNo;
                  return (
                    <div
                      key={v.versionNo}
                      onClick={() => setSelectedVersion(v)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-sm text-slate-900">v{v.versionNo}</span>
                        {v.versionNo === currentVersionNo && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : 'Draft'}</span>
                      </div>
                      {v.publishedBy && (
                        <div className="text-[10px] text-slate-400 truncate mt-1">
                          By: {v.publishedBy}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Selected version diff details */}
              <div className="md:col-span-2 space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                {selectedVersion ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Comparing v{selectedVersion.versionNo} with Current (v{currentVersionNo})
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Published on {selectedVersion.publishedAt ? new Date(selectedVersion.publishedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>

                      {selectedVersion.versionNo !== currentVersionNo && (
                        <button
                          type="button"
                          disabled={isRestoring}
                          onClick={() => handleRestore(selectedVersion.versionNo)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 shadow-xs flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore v{selectedVersion.versionNo}</span>
                        </button>
                      )}
                    </div>

                    {/* Diff Counters */}
                    {diffReport ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-900">
                            <div className="text-lg font-black">+{diffReport.addedCount || 0}</div>
                            <div className="text-[10px] uppercase font-bold text-emerald-700">Slots Added</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-sky-100/70 border border-sky-200 text-sky-900">
                            <div className="text-lg font-black">~{diffReport.movedCount || 0}</div>
                            <div className="text-[10px] uppercase font-bold text-sky-700">Slots Moved</div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-900">
                            <div className="text-lg font-black">-{diffReport.removedCount || 0}</div>
                            <div className="text-[10px] uppercase font-bold text-rose-700">Slots Removed</div>
                          </div>
                        </div>

                        {diffReport.changes && diffReport.changes.length > 0 ? (
                          <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs text-slate-700 pr-1">
                            {diffReport.changes.map((c, i) => (
                              <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                                <span className={`font-bold mr-1.5 uppercase ${
                                  c.changeType === 'ADDED' ? 'text-emerald-600' : c.changeType === 'REMOVED' ? 'text-rose-600' : 'text-sky-600'
                                }`}>
                                  [{c.changeType}]
                                </span>
                                <span>{c.description}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                            No schedule differences between these versions.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 py-6 text-center">
                        Calculating differences...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-8">
                    Select a version on the left to inspect snapshot and diff.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
