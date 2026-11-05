import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';

export default function ClashPanel({
  conflicts = [],
  onSelectConflict,
  onClose
}) {
  const hardConflicts = conflicts.filter(c => c.severity === 'HARD');
  const softConflicts = conflicts.filter(c => c.severity === 'SOFT');

  return (
    <aside
      aria-label="Timetable Clash Engine Panel"
      className="w-80 border-l border-slate-200 bg-white flex flex-col h-full shadow-xs animate-in slide-in-from-right-4 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-teal-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Clash Engine</h3>
            <p className="text-[11px] text-slate-500">
              {conflicts.length} issue{conflicts.length !== 1 ? 's' : ''} detected
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close clash panel"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Conflicts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conflicts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="text-xs font-bold text-slate-800">No Clashes Found</div>
            <div className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
              Schedule passes all hard conflict rules and soft optimization checks.
            </div>
          </div>
        ) : (
          <>
            {/* Hard Clashes (Block Publish) */}
            {hardConflicts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Hard Clashes ({hardConflicts.length})</span>
                </div>
                <div className="space-y-1.5">
                  {hardConflicts.map((c, idx) => (
                    <div
                      key={`hard-${idx}`}
                      onClick={() => onSelectConflict && onSelectConflict(c)}
                      className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 transition-colors cursor-pointer group text-xs text-rose-950 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-rose-700 mb-1">
                        <span className="uppercase tracking-wider">{c.code || 'HARD_CLASH'}</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[11px] leading-relaxed">{c.message}</div>
                      {c.slotIds && c.slotIds.length > 0 && (
                        <div className="mt-1.5 text-[10px] text-rose-600 font-medium">
                          Slots: #{c.slotIds.join(', #')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Warnings (Optimization / Alerts) */}
            {softConflicts.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Soft Warnings ({softConflicts.length})</span>
                </div>
                <div className="space-y-1.5">
                  {softConflicts.map((c, idx) => (
                    <div
                      key={`soft-${idx}`}
                      onClick={() => onSelectConflict && onSelectConflict(c)}
                      className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 transition-colors cursor-pointer group text-xs text-amber-950 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 mb-1">
                        <span className="uppercase tracking-wider">{c.code || 'NOTICE'}</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[11px] leading-relaxed">{c.message}</div>
                      {c.slotIds && c.slotIds.length > 0 && (
                        <div className="mt-1.5 text-[10px] text-amber-600 font-medium">
                          Slots: #{c.slotIds.join(', #')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
        Hard clashes block save and publish. Click any clash to locate and highlight affected slot(s).
      </div>
    </aside>
  );
}
