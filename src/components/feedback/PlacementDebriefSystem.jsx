import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Building2,
  GraduationCap,
  Star,
  CheckCircle2,
  Sparkles,
  Filter,
  Plus,
  Send,
  Calendar,
  ThumbsUp,
  FileText,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Award
} from 'lucide-react';
import { FeedbackApi } from '../../services/api';

const INITIAL_DEBRIEFS = [
  {
    id: 'deb-01',
    type: 'tpo-review',
    companyName: 'HCLTech',
    driveDate: '2026-10-18',
    reviewerName: 'Dr. S. K. Sharma (Head - Corporate Relations & TPO)',
    hiringExperienceRating: 5,
    testQualityRating: 4.8,
    overallRating: 4.9,
    offersReleased: 24,
    notes: 'Exceptional coordination by HR team. Online coding platform operated smoothly with zero downtime. Technical panel members provided constructive feedback to candidates.',
    recommendation: 'Strongly Recommend for Priority Slot in 2027 Placement Season.',
    submittedAt: '2026-10-19'
  },
  {
    id: 'deb-02',
    type: 'company-batch-feedback',
    companyName: 'TCS Digital',
    driveDate: '2026-10-14',
    reviewerName: 'Mr. Arvind Saxena (Senior Director - Talent Acquisition)',
    techDepthRating: 4.5,
    communicationRating: 4.4,
    overallRating: 4.5,
    curriculumGaps: 'Students were very strong in algorithmic DSA and SQL. However, practical familiarity with Docker containerization and cloud CI/CD pipelines would make them Day-1 productive.',
    batchStrengths: 'Exceptional problem decomposition speed, polite attitude, and sound OOP fundamentals in Java & C++.',
    areasToImprove: 'More mock managerial STAR round practice to build concise situational articulation.',
    hiringIntent: 'Increase Quota Next Season (+20% projected)',
    submittedAt: '2026-10-16'
  },
  {
    id: 'deb-03',
    type: 'tpo-review',
    companyName: 'Deloitte USI',
    driveDate: '2026-09-28',
    reviewerName: 'Prof. Ananya Gupta (Placement Coordinator)',
    hiringExperienceRating: 4.7,
    testQualityRating: 4.6,
    overallRating: 4.7,
    offersReleased: 18,
    notes: 'Case study rounds were intellectually rigorous. Recruiter debrief session post-drive helped students understand exactly what differentiated final selects.',
    recommendation: 'Confirmed for Early Autumn Recruitment Drive.',
    submittedAt: '2026-09-29'
  }
];

export default function PlacementDebriefSystem() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'tpo-form', 'company-form'
  const [debriefs, setDebriefs] = useState(() => {
    try {
      const saved = localStorage.getItem('placeprep_placement_debriefs');
      return saved ? JSON.parse(saved) : INITIAL_DEBRIEFS;
    } catch {
      return INITIAL_DEBRIEFS;
    }
  });

  const [toastMsg, setToastMsg] = useState('');

  // Form 1: TPO Review Form (Rate Visiting Company)
  const [tpoForm, setTpoForm] = useState({
    companyName: 'Accenture',
    driveDate: '2026-11-10',
    reviewerName: 'Dr. S. K. Sharma (TPO Head)',
    hiringExperienceRating: 5,
    testQualityRating: 5,
    overallRating: 5,
    offersReleased: 35,
    notes: '',
    recommendation: 'Invite again for Day-1 priority slot next placement season.'
  });

  // Form 2: Company Recruiter Batch Feedback Form
  const [companyForm, setCompanyForm] = useState({
    companyName: 'Accenture',
    reviewerName: 'Pooja Iyer (Lead Campus Recruiter)',
    driveDate: '2026-11-10',
    techDepthRating: 4.5,
    communicationRating: 4.5,
    overallRating: 4.5,
    curriculumGaps: 'Recommend introducing basic System Design and Cloud microservices in 6th semester.',
    batchStrengths: 'Sound data structure understanding, positive collaboration mindset, and high aptitude clearance.',
    areasToImprove: 'System design scaling questions and Git workflow best practices.',
    hiringIntent: 'Increase Quota Next Season'
  });

  // Persist debriefs
  useEffect(() => {
    localStorage.setItem('placeprep_placement_debriefs', JSON.stringify(debriefs));
  }, [debriefs]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Submit TPO Review Form
  const handleSubmitTpoReview = (e) => {
    e.preventDefault();
    if (!tpoForm.companyName.trim() || !tpoForm.notes.trim()) {
      showToast('Please provide the visiting company and evaluation notes.');
      return;
    }

    const newRecord = {
      id: `deb-tpo-${Date.now()}`,
      type: 'tpo-review',
      companyName: tpoForm.companyName,
      driveDate: tpoForm.driveDate,
      reviewerName: tpoForm.reviewerName,
      hiringExperienceRating: Number(tpoForm.hiringExperienceRating),
      testQualityRating: Number(tpoForm.testQualityRating),
      overallRating: Number(tpoForm.overallRating),
      offersReleased: Number(tpoForm.offersReleased) || 0,
      notes: tpoForm.notes,
      recommendation: tpoForm.recommendation,
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setDebriefs([newRecord, ...debriefs]);
    setActiveTab('all');
    setTpoForm({
      companyName: '',
      driveDate: '2026-11-10',
      reviewerName: 'Dr. S. K. Sharma (TPO Head)',
      hiringExperienceRating: 5,
      testQualityRating: 5,
      overallRating: 5,
      offersReleased: 20,
      notes: '',
      recommendation: 'Invite again for Day-1 priority slot next placement season.'
    });

    // Also persist to platform feedback API
    try {
      FeedbackApi.submit({
        category: 'TPO Company Rating',
        message: `[TPO Review for ${newRecord.companyName}] Hiring Exp: ${newRecord.hiringExperienceRating}/5, Test Quality: ${newRecord.testQualityRating}/5. Notes: ${newRecord.notes}`,
        rating: newRecord.overallRating
      });
    } catch {
      // offline fallback
    }

    showToast(`TPO Review for "${newRecord.companyName}" recorded and saved!`);
  };

  // Submit Company Batch Feedback Form
  const handleSubmitCompanyFeedback = (e) => {
    e.preventDefault();
    if (!companyForm.companyName.trim() || !companyForm.curriculumGaps.trim()) {
      showToast('Please fill company name and curriculum gap observations.');
      return;
    }

    const newRecord = {
      id: `deb-comp-${Date.now()}`,
      type: 'company-batch-feedback',
      companyName: companyForm.companyName,
      driveDate: companyForm.driveDate,
      reviewerName: companyForm.reviewerName,
      techDepthRating: Number(companyForm.techDepthRating),
      communicationRating: Number(companyForm.communicationRating),
      overallRating: Number(companyForm.overallRating),
      curriculumGaps: companyForm.curriculumGaps,
      batchStrengths: companyForm.batchStrengths,
      areasToImprove: companyForm.areasToImprove,
      hiringIntent: companyForm.hiringIntent,
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setDebriefs([newRecord, ...debriefs]);
    setActiveTab('all');
    setCompanyForm({
      companyName: '',
      reviewerName: '',
      driveDate: '2026-11-10',
      techDepthRating: 4.5,
      communicationRating: 4.5,
      overallRating: 4.5,
      curriculumGaps: '',
      batchStrengths: '',
      areasToImprove: '',
      hiringIntent: 'Maintain Current Quota'
    });

    try {
      FeedbackApi.submit({
        category: 'Company Batch Feedback',
        message: `[${newRecord.companyName} Recruiter Feedback] Tech Depth: ${newRecord.techDepthRating}/5, Comm: ${newRecord.communicationRating}/5. Gaps: ${newRecord.curriculumGaps}`,
        rating: newRecord.overallRating
      });
    } catch {
      // offline fallback
    }

    showToast(`Batch feedback from "${newRecord.companyName}" submitted to TPO cell!`);
  };

  // Filtered
  const filteredDebriefs = debriefs.filter(d => {
    if (activeTab === 'tpo-reviews-only') return d.type === 'tpo-review';
    if (activeTab === 'company-feedback-only') return d.type === 'company-batch-feedback';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Continuous Quality Improvement Loop
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Placement Feedback & Debrief System
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Two-way institutional debriefing: TPOs evaluate visiting companies on hiring experience & test quality, while recruiters share actionable batch feedback on student technical depth and curriculum gaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('tpo-form')}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>TPO Review Form</span>
            </button>
            <button
              onClick={() => setActiveTab('company-form')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Company Batch Feedback</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Avg Company Rating (TPO)</span>
            <span className="text-2xl font-black text-indigo-400">4.8 / 5.0</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Hiring experience & platform</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Avg Batch Rating (Recruiters)</span>
            <span className="text-2xl font-black text-emerald-400">4.5 / 5.0</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Technical & soft skills</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Verified Debrief Reports</span>
            <span className="text-2xl font-black text-white">{debriefs.length} Filed</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Audited placement logs</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Priority Re-Invite Rate</span>
            <span className="text-2xl font-black text-amber-400">96.2%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Visiting company retention</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All Debrief Records ({debriefs.length})
        </button>
        <button
          onClick={() => setActiveTab('tpo-form')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'tpo-form'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Rate Visiting Company (TPO Form)</span>
        </button>
        <button
          onClick={() => setActiveTab('company-form')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'company-form'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Submit Batch Feedback (Company Form)</span>
        </button>
      </div>

      {/* VIEW 1: ALL DEBRIEF RECORDS */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDebriefs.map(deb => {
              const isTpo = deb.type === 'tpo-review';

              return (
                <div
                  key={deb.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Type Badge & Date */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        isTpo
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {isTpo ? 'TPO Institutional Review' : 'Recruiter Batch Feedback'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">{deb.submittedAt}</span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-slate-900">{deb.companyName} Campus Drive</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">By {deb.reviewerName}</p>
                    </div>

                    {/* Ratings Grid */}
                    {isTpo ? (
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold">Hiring Exp</span>
                          <span className="font-black text-indigo-600 text-sm">{deb.hiringExperienceRating} ★</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold">Test Quality</span>
                          <span className="font-black text-indigo-600 text-sm">{deb.testQualityRating} ★</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold">Overall</span>
                          <span className="font-black text-emerald-600 text-sm">{deb.overallRating} ★</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold">Tech Depth</span>
                          <span className="font-black text-emerald-600 text-sm">{deb.techDepthRating} ★</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold">Soft Skills</span>
                          <span className="font-black text-emerald-600 text-sm">{deb.communicationRating} ★</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold">Preparedness</span>
                          <span className="font-black text-emerald-600 text-sm">{deb.overallRating} ★</span>
                        </div>
                      </div>
                    )}

                    {/* Content Details */}
                    {isTpo ? (
                      <div className="space-y-2 text-xs text-slate-600">
                        <p className="leading-relaxed bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/50 italic">
                          "{deb.notes}"
                        </p>
                        <p className="font-bold text-slate-800">
                          Recommendation: <span className="text-emerald-700 font-semibold">{deb.recommendation}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                          <span className="font-bold text-amber-900 block text-[11px] mb-0.5">Curriculum Gaps Identified:</span>
                          <p className="text-slate-700 leading-relaxed italic">{deb.curriculumGaps}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="font-bold text-slate-700 block">Batch Strengths:</span>
                            <span className="text-slate-600">{deb.batchStrengths}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block">Hiring Intent:</span>
                            <span className="font-bold text-emerald-700">{deb.hiringIntent}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Verified Audit ID: {deb.id}</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Recorded in TPO Archive
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: TPO REVIEW FORM (RATE VISITING COMPANIES) */}
      {activeTab === 'tpo-form' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              TPO Institutional Debrief Form
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Structured Review Form for TPO to Rate Visiting Companies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluate recruiter hiring experience, online/offline test quality, logistics coordination, and slot decisions.
            </p>
          </div>

          <form onSubmit={handleSubmitTpoReview} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Visiting Company Name *</label>
                <input
                  type="text"
                  value={tpoForm.companyName}
                  onChange={e => setTpoForm({ ...tpoForm, companyName: e.target.value })}
                  placeholder="e.g. Cisco Systems"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Drive Date *</label>
                <input
                  type="date"
                  value={tpoForm.driveDate}
                  onChange={e => setTpoForm({ ...tpoForm, driveDate: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Core Ratings: Hiring Experience & Test Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  1. Hiring Experience Rating (1-5)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTpoForm({ ...tpoForm, hiringExperienceRating: val })}
                      className={`p-2 rounded-xl text-xs font-black transition flex-1 border ${
                        tpoForm.hiringExperienceRating >= val
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Interviewer professionalism & delays</p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  2. Test Quality Rating (1-5)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTpoForm({ ...tpoForm, testQualityRating: val })}
                      className={`p-2 rounded-xl text-xs font-black transition flex-1 border ${
                        tpoForm.testQualityRating >= val
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Syllabus relevance & platform stability</p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  3. Total Offers Released
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={tpoForm.offersReleased}
                  onChange={e => setTpoForm({ ...tpoForm, offersReleased: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-center"
                />
                <p className="text-[10px] text-slate-400 mt-1">Confirmed student selects</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                TPO Debrief Notes & General Observations *
              </label>
              <textarea
                rows={3}
                value={tpoForm.notes}
                onChange={e => setTpoForm({ ...tpoForm, notes: e.target.value })}
                placeholder="Share feedback on test server performance, interview question depth, punctuality of panel members, and student satisfaction..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Recommendation for Next Recruitment Cycle *
              </label>
              <select
                value={tpoForm.recommendation}
                onChange={e => setTpoForm({ ...tpoForm, recommendation: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="Invite again for Day-1 priority slot next placement season.">
                  ✓ Priority Day-1 Slot (Top Performer)
                </option>
                <option value="Invite again during regular campus schedule.">
                  ✓ Regular Slot Invite
                </option>
                <option value="Review test duration and panel size before confirming next season.">
                  ⏸ Conditional Invite (Logistics adjustment required)
                </option>
                <option value="Do not invite for upcoming season due to severe schedule delays.">
                  ✕ Do Not Re-Invite
                </option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Record TPO Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: COMPANY RECRUITER BATCH FEEDBACK FORM */}
      {activeTab === 'company-form' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Recruiter Feedback Channel
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Form for Companies to Submit Overall Batch Feedback to the TPO
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Provide actionable guidance on student technical depth, soft skills, curriculum gaps, and future hiring intent.
            </p>
          </div>

          <form onSubmit={handleSubmitCompanyFeedback} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  value={companyForm.companyName}
                  onChange={e => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  placeholder="e.g. Amazon / Microsoft"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Recruiter Name & Title *</label>
                <input
                  type="text"
                  value={companyForm.reviewerName}
                  onChange={e => setCompanyForm({ ...companyForm, reviewerName: e.target.value })}
                  placeholder="e.g. Vikram Mehta (Principal Talent Partner)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Batch Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  1. Technical Depth (1-5)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, techDepthRating: val })}
                      className={`p-2 rounded-xl text-xs font-black transition flex-1 border ${
                        companyForm.techDepthRating >= val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">DSA, algorithms & core CS</p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  2. Soft Skills & Communication
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, communicationRating: val })}
                      className={`p-2 rounded-xl text-xs font-black transition flex-1 border ${
                        companyForm.communicationRating >= val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">STAR presentation & clarity</p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  3. Overall Preparedness
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, overallRating: val })}
                      className={`p-2 rounded-xl text-xs font-black transition flex-1 border ${
                        companyForm.overallRating >= val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {val} ★
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Readiness for corporate deployment</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Curriculum Gap Observations & Feedback *
              </label>
              <textarea
                rows={3}
                value={companyForm.curriculumGaps}
                onChange={e => setCompanyForm({ ...companyForm, curriculumGaps: e.target.value })}
                placeholder="What technologies, frameworks, or problem types should the university integrate into courses to enhance student employability? (e.g. Cloud, Docker, System Design, Unit Testing)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Batch Key Strengths</label>
                <input
                  type="text"
                  value={companyForm.batchStrengths}
                  onChange={e => setCompanyForm({ ...companyForm, batchStrengths: e.target.value })}
                  placeholder="e.g. Fast problem solving, strong teamwork, clear Java code"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Future Hiring Intent *</label>
                <select
                  value={companyForm.hiringIntent}
                  onChange={e => setCompanyForm({ ...companyForm, hiringIntent: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="Increase Quota Next Season">Increase Hiring Quota Next Season</option>
                  <option value="Maintain Current Quota">Maintain Current Quota</option>
                  <option value="Review Academic Prep Before Next Drive">Review Academic Prep Before Next Drive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Batch Feedback to TPO</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
