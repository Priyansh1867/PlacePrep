import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Target,
  Terminal
} from 'lucide-react';
import { INITIAL_BATCHES } from '../data/initialData';
import { setGraduationBatch, getGraduationBatch } from '../services/storage';

export default function BatchSelectionModal({ isOpen, onClose, onBatchSelected }) {
  const currentSaved = getGraduationBatch();
  const [selectedBatch, setSelectedBatch] = useState(currentSaved || '2026');

  if (!isOpen) return null;

  const handleConfirm = () => {
    setGraduationBatch(selectedBatch);
    if (onBatchSelected) {
      onBatchSelected(selectedBatch);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0B0F19] rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden transform transition-all max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 text-white"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#0B0F19] via-slate-900 to-indigo-950/70 text-white shrink-0 border-b border-slate-800">
          {currentSaved && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
              Configure Target Cohort Batch
            </h2>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-mono">
            Select your graduation cohort to filter verified drives, company eligibility gates, and placement telemetry.
          </p>
        </div>

        {/* Modal Body - Scrollable Batch Cards */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5 font-mono">
          <div className="space-y-2">
            {INITIAL_BATCHES.map((batchItem) => {
              const isSelected = selectedBatch === batchItem.id;
              return (
                <div
                  key={batchItem.id}
                  onClick={() => setSelectedBatch(batchItem.id)}
                  className={`relative p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Custom Radio Circle */}
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'border-indigo-500 bg-indigo-600' : 'border-slate-700 group-hover:border-slate-600'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {batchItem.label}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isSelected 
                            ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40 font-bold' 
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {batchItem.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {batchItem.desc}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:block animate-in zoom-in-75 duration-150" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Dynamic Confirmation Box with Integrated Continue Button */}
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Target: <span className="text-indigo-400 font-extrabold">{selectedBatch} Batch Cohort</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Prioritizing {selectedBatch} recruitment calendars & company tracks.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all flex items-center justify-center gap-1.5 shrink-0 group border border-indigo-400/30"
            >
              <span>Confirm & Enter</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
          <span>Batch setting can be toggled anytime from the navbar.</span>
          <button
            onClick={handleConfirm}
            className="text-indigo-400 font-bold hover:underline hidden sm:inline"
          >
            Save & Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
