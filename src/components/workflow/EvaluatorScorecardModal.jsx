import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  ClipboardCheck,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function EvaluatorScorecardModal({
  isOpen,
  onClose,
  candidate,
  roundName = 'Technical Interview',
  onSaveEvaluation
}) {
  const [technicalSkills, setTechnicalSkills] = useState(8);
  const [problemSolving, setProblemSolving] = useState(8);
  const [communicationSkills, setCommunicationSkills] = useState(8);
  const [decision, setDecision] = useState('RECOMMEND'); // 'RECOMMEND', 'HOLD', 'REJECT'
  const [notes, setNotes] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('Senior Tech Lead / Panel Lead');

  useEffect(() => {
    if (candidate) {
      setTechnicalSkills(candidate.scores?.technical ? Math.min(10, Math.round(candidate.scores.technical / 10)) : 8);
      setProblemSolving(candidate.scores?.aptitude ? Math.min(10, Math.round(candidate.scores.aptitude / 10)) : 8);
      setCommunicationSkills(candidate.scores?.hr ? Math.min(10, Math.round(candidate.scores.hr / 10)) : 8);
      setDecision(candidate.status === 'Eliminated' ? 'REJECT' : candidate.status === 'Selected' ? 'RECOMMEND' : 'RECOMMEND');
      setNotes(candidate.notes || '');
      setStrengths(candidate.strengths || '');
      setWeaknesses(candidate.weaknesses || '');
      setEvaluatorName(candidate.evaluator || 'Senior Interview Panel Member');
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const compositeScore = ((technicalSkills + problemSolving + communicationSkills) / 3).toFixed(1);

  const getScoreBadgeColor = (val) => {
    if (val >= 8) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (val >= 6) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (val >= 4) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const evaluationData = {
      candidateId: candidate.id || candidate.candidateId,
      candidateName: candidate.name,
      companyName: candidate.companyName,
      roundName,
      technicalSkills: Number(technicalSkills),
      problemSolving: Number(problemSolving),
      communicationSkills: Number(communicationSkills),
      compositeScore: Number(compositeScore),
      decision, // 'RECOMMEND', 'HOLD', 'REJECT'
      notes,
      strengths,
      weaknesses,
      evaluatorName,
      evaluatedAt: new Date().toISOString()
    };

    if (onSaveEvaluation) {
      onSaveEvaluation(evaluationData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 my-8 animate-in zoom-in-95">
        {/* Modal Top Banner */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200 mb-2">
              <ClipboardCheck className="w-3.5 h-3.5" />
              Interviewer Scorecard Modal
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Evaluate Candidate: {candidate.name}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {candidate.branch} • {candidate.batch} Batch • {candidate.companyName} ({roundName})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Quick Info & Composite Score */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                Calculated Candidate Rubric Average
              </span>
              <span className="text-2xl font-black text-white">{compositeScore} / 10.0</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">Round Format</span>
              <span className="font-extrabold text-indigo-300">{roundName}</span>
            </div>
          </div>

          {/* 3 Core 1-10 Sliders */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {/* 1. Technical Skills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span>1. Technical Skills</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Core CS, Algorithms, Code Quality)</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-black ${getScoreBadgeColor(technicalSkills)}`}>
                  {technicalSkills} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={technicalSkills}
                onChange={e => setTechnicalSkills(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                <span>1 (Inadequate)</span>
                <span>5 (Average)</span>
                <span>10 (Exceptional)</span>
              </div>
            </div>

            {/* 2. Problem Solving */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span>2. Problem Solving</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Edge Cases, Analytical Thinking, Speed)</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-black ${getScoreBadgeColor(problemSolving)}`}>
                  {problemSolving} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={problemSolving}
                onChange={e => setProblemSolving(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                <span>1 (Struggled)</span>
                <span>5 (Guided)</span>
                <span>10 (Independent & Flawless)</span>
              </div>
            </div>

            {/* 3. Communication Skills */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span>3. Communication Skills</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Clarity, Articulation, Professionalism)</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-black ${getScoreBadgeColor(communicationSkills)}`}>
                  {communicationSkills} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={communicationSkills}
                onChange={e => setCommunicationSkills(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-0.5">
                <span>1 (Unclear)</span>
                <span>5 (Conversational)</span>
                <span>10 (Inspiring & Crisp)</span>
              </div>
            </div>
          </div>

          {/* Notes / Strengths / Weaknesses Textareas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Key Strengths Demonstrated *
              </label>
              <textarea
                rows={2}
                value={strengths}
                onChange={e => setStrengths(e.target.value)}
                placeholder="e.g. Sharp grasp of binary tree traversals, fast SQL queries, confident explanation."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Areas for Improvement / Weaknesses *
              </label>
              <textarea
                rows={2}
                value={weaknesses}
                onChange={e => setWeaknesses(e.target.value)}
                placeholder="e.g. Could optimize space complexity; missed edge case on empty array."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                General Interviewer Notes & Observations
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Candidate demonstrated positive body language, culture alignment, and prompt replies."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Decision Dropdown (RECOMMEND, HOLD, REJECT) & Evaluator Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-black text-slate-900 mb-1">
                Interviewer Final Decision *
              </label>
              <select
                value={decision}
                onChange={e => setDecision(e.target.value)}
                className={`w-full p-3 rounded-xl border font-black text-xs cursor-pointer ${
                  decision === 'RECOMMEND'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : decision === 'HOLD'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <option value="RECOMMEND">✓ RECOMMEND (Advance to Next Round / Offer)</option>
                <option value="HOLD">⏸ HOLD (Waitlist for Batch Comparison)</option>
                <option value="REJECT">✕ REJECT (Eliminate from Selection)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Interviewer / Panel Name *
              </label>
              <input
                type="text"
                value={evaluatorName}
                onChange={e => setEvaluatorName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Kumar (Tech Panel)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record & Save Scorecard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
