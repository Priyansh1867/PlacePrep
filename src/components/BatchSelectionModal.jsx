import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Target
} from 'lucide-react';
import { INITIAL_BATCHES } from '../data/initialData';
import { setGraduationBatch, getGraduationBatch } from '../services/storage';

export default function BatchSelectionModal({ isOpen, onClose, onBatchSelected }) {
  const currentSaved = getGraduationBatch();
  const [selectedBatch, setSelectedBatch] = useState(currentSaved || '2028');

  if (!isOpen) return null;

  const handleConfirm = () => {
    setGraduationBatch(selectedBatch);
    if (onBatchSelected) {
      onBatchSelected(selectedBatch);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Compact Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white shrink-0">
          {currentSaved && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
              <GraduationCap className="w-5 h-5 text-indigo-200" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Let's Personalize Your Placement Journey!
            </h2>
          </div>

          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Select your graduation batch to discover relevant placement drives, company-specific interview experiences, and preparation resources.
          </p>
        </div>

        {/* Modal Body - Scrollable Batch Cards */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          <div className="space-y-2">
            {INITIAL_BATCHES.map((batchItem) => {
              const isSelected = selectedBatch === batchItem.id;
              return (
                <div
                  key={batchItem.id}
                  onClick={() => setSelectedBatch(batchItem.id)}
                  className={`relative p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Custom Radio Circle */}
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {batchItem.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-indigo-200/80 text-indigo-900 font-bold' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {batchItem.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {batchItem.desc}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 hidden sm:block animate-in zoom-in-75 duration-150" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Dynamic Confirmation Box with Integrated Continue Button */}
          <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  You are a <span className="text-indigo-700 font-extrabold">{selectedBatch} batch student</span>.
                </p>
                <p className="text-[11px] text-slate-500">
                  Prioritizing {selectedBatch} recruitment calendars & company tracks.
                </p>
              </div>
            </div>

            {/* Direct Continue Button right in the confirmation box */}
            <button
              onClick={handleConfirm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 shrink-0 group"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Compact Modal Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>You can update your batch anytime in Profile Settings.</span>
          <button
            onClick={handleConfirm}
            className="text-indigo-600 font-bold hover:underline hidden sm:inline"
          >
            Save & Enter Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
