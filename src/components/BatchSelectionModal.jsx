import React, { useState } from 'react';
import { Calendar, Check, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { getGraduationBatch, setGraduationBatch, setOnboardingCompleted } from '../services/storage';

export default function BatchSelectionModal({ isOpen, onClose, onBatchSelected }) {
  const currentSavedBatch = getGraduationBatch();
  const [selectedBatch, setSelectedBatch] = useState(currentSavedBatch);

  if (!isOpen) return null;

  const batches = [
    {
      year: '2026',
      label: 'Batch of 2026',
      sub: 'Final Year Students',
      status: 'Primary Drive Season Active',
      activeDrives: '4 Confirmed Drives'
    },
    {
      year: '2027',
      label: 'Batch of 2027',
      sub: 'Pre-Final Year Students',
      status: 'Summer Internship Tracks',
      activeDrives: '2 Upcoming Tracks'
    },
    {
      year: '2028',
      label: 'Batch of 2028',
      sub: 'Sophomore Year Students',
      status: 'Foundation & Core DSA Prep',
      activeDrives: 'Early Recruiter Prep'
    },
    {
      year: '2029',
      label: 'Batch of 2029',
      sub: 'First Year Students',
      status: 'Orientation & Roadmaps',
      activeDrives: 'Skill Roadmaps'
    }
  ];

  const handleSave = () => {
    setGraduationBatch(selectedBatch);
    setOnboardingCompleted();
    window.dispatchEvent(new CustomEvent('batch-changed', { detail: selectedBatch }));
    if (onBatchSelected) onBatchSelected(selectedBatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">Select Graduation Batch</h3>
              <p className="text-xs text-slate-500">Personalizes drive eligibility, question cutoffs, and calendar.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Batch Options List */}
        <div className="p-4 space-y-2">
          {batches.map((b) => {
            const isSelected = selectedBatch === b.year;
            return (
              <div
                key={b.year}
                onClick={() => setSelectedBatch(b.year)}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{b.label}</span>
                    <span className="text-[11px] text-slate-500">({b.sub})</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {b.status} • <span className="font-medium text-slate-700">{b.activeDrives}</span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            Confirm Batch Selection
          </button>
        </div>

      </div>
    </div>
  );
}
