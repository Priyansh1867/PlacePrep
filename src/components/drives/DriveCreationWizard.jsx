import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import { DriveApi } from '../../services/api';

const BRANCH_OPTIONS = [
  'B.Tech Computer Science & Engineering (CSE)',
  'B.Tech Information Technology (IT)',
  'B.Tech Electronics & Communication (ECE)',
  'B.Tech Electrical Engineering (EE)',
  'B.Tech Mechanical Engineering (ME)',
  'B.Tech Civil Engineering (CE)',
  'MCA (Master of Computer Applications)',
  'M.Tech Computer Science'
];

const TIER_OPTIONS = [
  { value: 'Tier 1 / Product', label: 'Tier 1 — Product & R&D (CTC >= 18 LPA)', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'Tier 2 / Differential', label: 'Tier 2 — Differential / High-Growth (10 - 18 LPA)', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'Tier 3 / Mass Recruitment', label: 'Tier 3 — Mass IT & Consulting (4 - 10 LPA)', badge: 'bg-amber-50 text-amber-700 border-amber-200' }
];

const DEFAULT_ROUNDS = [
  {
    roundNumber: 1,
    roundName: 'Round 1: Aptitude Assessment',
    roundType: 'Aptitude Assessment',
    durationMinutes: 90,
    cutoffScore: 70,
    mode: 'Online Proctored',
    description: 'Quantitative aptitude, logical reasoning, verbal ability, and core CS fundamentals.'
  },
  {
    roundNumber: 2,
    roundName: 'Round 2: Technical Interview',
    roundType: 'Technical Interview',
    durationMinutes: 45,
    cutoffScore: 75,
    mode: 'In-Person / Virtual Panel',
    description: 'Data structures, algorithm design, live coding, and project architecture.'
  },
  {
    roundNumber: 3,
    roundName: 'Round 3: HR & Cultural Alignment',
    roundType: 'HR Round',
    durationMinutes: 30,
    cutoffScore: 80,
    mode: 'In-Person',
    description: 'Behavioral scenarios, STAR methodology, communication, and offer discussion.'
  }
];

export default function DriveCreationWizard({
  companies = [],
  onDriveCreated,
  onCancel
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Company details, role, CTC range, tier, and job description
  const [formDataStep1, setFormDataStep1] = useState({
    companyId: companies[0]?.companyId || companies[0]?.id || 'hcltech',
    companyName: companies[0]?.name || 'HCLTech',
    isNewCompany: false,
    customCompanyName: '',
    role: 'Graduate Software Engineer',
    ctcRange: '12 - 16 LPA',
    tier: 'Tier 2 / Differential',
    jobDescription: 'Design, develop, and maintain high-performance software modules. Collaborate in agile sprints, write clean testable code, and participate in code reviews.'
  });

  // Step 2: Eligibility cutoffs (Min CGPA, Min 10th/12th %, Max allowed backlogs, Allowed branches)
  const [formDataStep2, setFormDataStep2] = useState({
    minCgpa: 7.0,
    minTenthPercentage: 70.0,
    minTwelfthPercentage: 70.0,
    maxAllowedBacklogs: 0,
    allowedBranches: [
      'B.Tech Computer Science & Engineering (CSE)',
      'B.Tech Information Technology (IT)',
      'B.Tech Electronics & Communication (ECE)'
    ],
    eligibleBatches: ['2026', '2027', '2028']
  });

  // Step 3: Dates, venue, reporting time, and application deadline
  const [formDataStep3, setFormDataStep3] = useState({
    driveDate: '2026-11-20',
    driveTime: '09:00 AM',
    venue: 'Campus Main Auditorium & Computer Center Lab A',
    reportingTime: '08:30 AM (Mandatory formal verification)',
    applicationDeadline: '2026-11-15',
    registrationLink: 'https://placeprep.edu/apply/drv-active',
    instructions: 'Formal business attire mandatory. Bring 3 hard copies of resume, College Identity Card, and government photo ID.'
  });

  // Step 4: Round setup (Add Round 1: Aptitude, Round 2: Tech, Round 3: HR with cutoffs)
  const [rounds, setRounds] = useState(DEFAULT_ROUNDS);

  // Helper to sync company selection
  const handleCompanyChange = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setFormDataStep1({ ...formDataStep1, isNewCompany: true, companyId: 'custom', companyName: '' });
    } else {
      const match = companies.find(c => (c.companyId || c.id) === val);
      setFormDataStep1({
        ...formDataStep1,
        isNewCompany: false,
        companyId: val,
        companyName: match?.name || val
      });
    }
  };

  // Branch toggle
  const toggleBranch = (branch) => {
    setFormDataStep2(prev => {
      const exists = prev.allowedBranches.includes(branch);
      return {
        ...prev,
        allowedBranches: exists
          ? prev.allowedBranches.filter(b => b !== branch)
          : [...prev.allowedBranches, branch]
      };
    });
  };

  // Round management
  const handleUpdateRound = (index, field, value) => {
    setRounds(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRound = () => {
    const nextNum = rounds.length + 1;
    setRounds([
      ...rounds,
      {
        roundNumber: nextNum,
        roundName: `Round ${nextNum}: Technical Assessment`,
        roundType: 'Technical Interview',
        durationMinutes: 45,
        cutoffScore: 75,
        mode: 'In-Person',
        description: 'Interview evaluation and domain scrutiny.'
      }
    ]);
  };

  const handleRemoveRound = (index) => {
    if (rounds.length <= 1) return;
    setRounds(rounds.filter((_, idx) => idx !== index));
  };

  // Step Validation
  const validateStep = (step) => {
    setErrorMsg('');
    if (step === 1) {
      const compName = formDataStep1.isNewCompany ? formDataStep1.customCompanyName : formDataStep1.companyName;
      if (!compName?.trim()) {
        setErrorMsg('Please specify or select a company name.');
        return false;
      }
      if (!formDataStep1.role?.trim()) {
        setErrorMsg('Role Title is required.');
        return false;
      }
      if (!formDataStep1.ctcRange?.trim()) {
        setErrorMsg('CTC Package range is required.');
        return false;
      }
    } else if (step === 2) {
      if (formDataStep2.allowedBranches.length === 0) {
        setErrorMsg('Please select at least one eligible branch.');
        return false;
      }
    } else if (step === 3) {
      if (!formDataStep3.driveDate) {
        setErrorMsg('Drive Date is required.');
        return false;
      }
      if (!formDataStep3.venue?.trim()) {
        setErrorMsg('Drive Venue / Mode is required.');
        return false;
      }
    } else if (step === 4) {
      if (rounds.length === 0) {
        setErrorMsg('At least 1 round must be configured.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit complete drive
  const handleSubmitDrive = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const effectiveCompanyName = formDataStep1.isNewCompany
        ? formDataStep1.customCompanyName
        : formDataStep1.companyName;

      const driveId = `drv-${Date.now()}`;
      const payload = {
        driveId,
        companyId: formDataStep1.isNewCompany ? `comp-${Date.now()}` : formDataStep1.companyId,
        companyName: effectiveCompanyName,
        role: formDataStep1.role,
        ctc: formDataStep1.ctcRange,
        tier: formDataStep1.tier,
        instructions: formDataStep3.instructions,
        description: formDataStep1.jobDescription,
        driveDate: formDataStep3.driveDate,
        driveTime: formDataStep3.driveTime,
        deadline: formDataStep3.applicationDeadline,
        venue: formDataStep3.venue,
        reportingTime: formDataStep3.reportingTime,
        registrationLink: formDataStep3.registrationLink,
        minCgpa: parseFloat(formDataStep2.minCgpa) || 6.0,
        minTenthPercentage: parseFloat(formDataStep2.minTenthPercentage) || 60.0,
        minTwelfthPercentage: parseFloat(formDataStep2.minTwelfthPercentage) || 60.0,
        maxBacklogs: parseInt(formDataStep2.maxAllowedBacklogs, 10) || 0,
        allowedBranches: formDataStep2.allowedBranches,
        eligibleBatches: formDataStep2.eligibleBatches,
        status: 'Confirmed Upcoming Drive',
        verifiedBadge: true,
        rounds: rounds.map(r => r.roundName),
        roundConfigs: rounds,
        roundConfigsJson: JSON.stringify(rounds)
      };

      const created = await DriveApi.create(payload);
      setSuccessMsg(`Placement Drive for "${effectiveCompanyName}" created and published successfully!`);
      if (onDriveCreated) {
        onDriveCreated(created || payload);
      }
    } catch (err) {
      console.error('Error creating drive:', err);
      setErrorMsg(err.message || 'Failed to save drive to backend. Check network or admin session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Company & Role', desc: 'Tier, CTC, description' },
    { num: 2, title: 'Eligibility Cutoffs', desc: 'CGPA, marks, branches' },
    { num: 3, title: 'Dates & Logistics', desc: 'Venue, reporting, deadline' },
    { num: 4, title: 'Round Setup', desc: 'Aptitude, Tech, HR cutoffs' },
    { num: 5, title: 'Review & Broadcast', desc: 'Final audit & publish' }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">
      {/* Top Wizard Header & Stepper */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              TPO Admin Drive Creation Wizard
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Announce Campus Placement Drive
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Configure recruitment standards, academic cutoffs, logistic slots, and standardized evaluation rounds.
            </p>
          </div>

          <div className="text-xs font-bold text-indigo-200 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 w-fit">
            Step {currentStep} of {steps.length}
          </div>
        </div>

        {/* Step Progress Indicator */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {steps.map(step => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;
            return (
              <div
                key={step.num}
                onClick={() => {
                  if (step.num < currentStep) setCurrentStep(step.num);
                }}
                className={`flex flex-col gap-1.5 p-2 rounded-xl transition cursor-pointer ${
                  isCurrent
                    ? 'bg-white/15 border border-indigo-400/50'
                    : isCompleted
                    ? 'bg-white/5 hover:bg-white/10 opacity-90'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {isCompleted ? '✓' : step.num}
                  </div>
                  <span className="font-extrabold text-[11px] truncate hidden sm:inline">
                    {step.title}
                  </span>
                </div>
                <div className={`h-1 rounded-full w-full ${
                  isCompleted ? 'bg-emerald-400' : isCurrent ? 'bg-indigo-400' : 'bg-slate-700'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content Area */}
      <div className="p-6 sm:p-8 space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= STEP 1 ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Step 1: Recruiter Profile, Role, CTC & Job Description
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify company credentials, hiring compensation tier, and core role responsibilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Visiting Recruiter / Company *
                </label>
                <select
                  value={formDataStep1.isNewCompany ? '__custom__' : formDataStep1.companyId}
                  onChange={handleCompanyChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  {companies.map(c => {
                    const cid = c.companyId || c.id;
                    return <option key={cid} value={cid}>{c.name}</option>;
                  })}
                  <option value="__custom__">+ Enter Unlisted Visiting Recruiter...</option>
                </select>
              </div>

              {formDataStep1.isNewCompany ? (
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Custom Recruiter Name *
                  </label>
                  <input
                    type="text"
                    value={formDataStep1.customCompanyName}
                    onChange={e => setFormDataStep1({ ...formDataStep1, customCompanyName: e.target.value })}
                    placeholder="e.g. NVIDIA Corporation"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Hiring Category / Tier *
                  </label>
                  <select
                    value={formDataStep1.tier}
                    onChange={e => setFormDataStep1({ ...formDataStep1, tier: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    {TIER_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Job Role Title *
                </label>
                <input
                  type="text"
                  value={formDataStep1.role}
                  onChange={e => setFormDataStep1({ ...formDataStep1, role: e.target.value })}
                  placeholder="e.g. Associate Software Engineer (Backend)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  CTC Package Range (Annual Compensation) *
                </label>
                <input
                  type="text"
                  value={formDataStep1.ctcRange}
                  onChange={e => setFormDataStep1({ ...formDataStep1, ctcRange: e.target.value })}
                  placeholder="e.g. ₹14.5 - ₹18.0 LPA (Base: ₹12 LPA)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">
                  Job Description & Scope of Work
                </label>
                <textarea
                  rows={4}
                  value={formDataStep1.jobDescription}
                  onChange={e => setFormDataStep1({ ...formDataStep1, jobDescription: e.target.value })}
                  placeholder="Outline candidate responsibilities, tech stacks (Java, React, SQL, Cloud), and project expectations..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Step 2: Academic Eligibility Cutoffs & Branch Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set non-negotiable benchmark thresholds for automatic student application filtering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Minimum CGPA</span>
                  <span className="text-sm font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                    {formDataStep2.minCgpa}
                  </span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="9.5"
                  step="0.1"
                  value={formDataStep2.minCgpa}
                  onChange={e => setFormDataStep2({ ...formDataStep2, minCgpa: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Cumulative graduation score</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Class 10th Min %</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formDataStep2.minTenthPercentage}
                    onChange={e => setFormDataStep2({ ...formDataStep2, minTenthPercentage: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-center"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400">Secondary school certificate</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Class 12th / Diploma %</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formDataStep2.minTwelfthPercentage}
                    onChange={e => setFormDataStep2({ ...formDataStep2, minTwelfthPercentage: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-center"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400">Higher secondary or polytechnic</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-700">Max Allowed Backlogs</label>
                <select
                  value={formDataStep2.maxAllowedBacklogs}
                  onChange={e => setFormDataStep2({ ...formDataStep2, maxAllowedBacklogs: parseInt(e.target.value, 10) })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                >
                  <option value={0}>0 (Strict Zero Standing Backlog)</option>
                  <option value={1}>Max 1 Active Backlog</option>
                  <option value={2}>Max 2 Active Backlogs</option>
                </select>
                <p className="text-[10px] text-slate-400">Arrears at time of drive</p>
              </div>
            </div>

            {/* Allowed Branches */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block font-black text-slate-800 text-xs">
                  Allowed Branches & Degree Programs ({formDataStep2.allowedBranches.length} selected) *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormDataStep2({ ...formDataStep2, allowedBranches: [...BRANCH_OPTIONS] })}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setFormDataStep2({ ...formDataStep2, allowedBranches: [] })}
                    className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {BRANCH_OPTIONS.map(branch => {
                  const isChecked = formDataStep2.allowedBranches.includes(branch);
                  return (
                    <div
                      key={branch}
                      onClick={() => toggleBranch(branch)}
                      className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{branch}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Step 3: Dates, Venue, Reporting Time, & Application Deadline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide logistics, test venue coordinates, and student reporting guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Confirmed Drive Date *
                </label>
                <input
                  type="date"
                  value={formDataStep3.driveDate}
                  onChange={e => setFormDataStep3({ ...formDataStep3, driveDate: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  value={formDataStep3.applicationDeadline}
                  onChange={e => setFormDataStep3({ ...formDataStep3, applicationDeadline: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Reporting Time & Assembly *
                </label>
                <input
                  type="text"
                  value={formDataStep3.reportingTime}
                  onChange={e => setFormDataStep3({ ...formDataStep3, reportingTime: e.target.value })}
                  placeholder="e.g. 08:30 AM (Doors close at 08:45 AM)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Venue / Lab Details *
                </label>
                <input
                  type="text"
                  value={formDataStep3.venue}
                  onChange={e => setFormDataStep3({ ...formDataStep3, venue: e.target.value })}
                  placeholder="e.g. Campus Central Auditorium & Lab 4"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">
                  Mandatory Candidate Instructions & Documentation
                </label>
                <textarea
                  rows={3}
                  value={formDataStep3.instructions}
                  onChange={e => setFormDataStep3({ ...formDataStep3, instructions: e.target.value })}
                  placeholder="Requirements: College ID, 2 copies of resume, formal attire, laptops with Chrome..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4 ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Step 4: Standardized Round Setup & Cutoff Thresholds
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setup Round 1 (Aptitude), Round 2 (Technical), Round 3 (HR) with duration and qualifying cutoffs.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRound}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition flex items-center gap-1.5 w-fit cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Round</span>
              </button>
            </div>

            <div className="space-y-4">
              {rounds.map((round, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                      Round {idx + 1}
                    </span>
                    {rounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Round</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Round Title</label>
                      <input
                        type="text"
                        value={round.roundName}
                        onChange={e => handleUpdateRound(idx, 'roundName', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cutoff Score (%)</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="30"
                          max="100"
                          value={round.cutoffScore}
                          onChange={e => handleUpdateRound(idx, 'cutoffScore', parseInt(e.target.value, 10))}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-center"
                        />
                        <span className="font-bold text-slate-500">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={round.durationMinutes}
                        onChange={e => handleUpdateRound(idx, 'durationMinutes', parseInt(e.target.value, 10))}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-center"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Evaluation Scope & Criteria</label>
                      <input
                        type="text"
                        value={round.description}
                        onChange={e => handleUpdateRound(idx, 'description', e.target.value)}
                        placeholder="e.g. Speed math, coding logic, STAR behavioral delivery"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Assessment Mode</label>
                      <select
                        value={round.mode}
                        onChange={e => handleUpdateRound(idx, 'mode', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                      >
                        <option value="Online Proctored">Online Proctored (Computer Lab)</option>
                        <option value="In-Person Panel">In-Person Panel (Auditorium Desk)</option>
                        <option value="Virtual MS Teams / Meet">Virtual Video Call (Teams/Meet)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200 text-xs">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Step 5: Review & Broadcast Verified Campus Placement Drive
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit complete recruitment parameters before persisting to Spring Boot database and broadcasting to students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                  1. Company & Role
                </span>
                <p className="text-base font-black text-slate-900">
                  {formDataStep1.isNewCompany ? formDataStep1.customCompanyName : formDataStep1.companyName}
                </p>
                <div className="space-y-1.5 text-slate-600">
                  <p><strong className="text-slate-800">Role:</strong> {formDataStep1.role}</p>
                  <p><strong className="text-slate-800">Package:</strong> {formDataStep1.ctcRange}</p>
                  <p><strong className="text-slate-800">Tier:</strong> {formDataStep1.tier}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  2. Eligibility Criteria
                </span>
                <div className="space-y-1.5 text-slate-700 font-medium">
                  <p>Min CGPA: <strong className="text-indigo-600">{formDataStep2.minCgpa}</strong></p>
                  <p>10th / 12th: <strong>{formDataStep2.minTenthPercentage}% / {formDataStep2.minTwelfthPercentage}%</strong></p>
                  <p>Allowed Backlogs: <strong>{formDataStep2.maxAllowedBacklogs}</strong></p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    {formDataStep2.allowedBranches.length} Eligible Branches selected
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  3. Drive Logistics
                </span>
                <div className="space-y-1.5 text-slate-700 font-medium">
                  <p>Drive Date: <strong className="text-slate-900">{formDataStep3.driveDate}</strong></p>
                  <p>Venue: <span className="text-slate-800">{formDataStep3.venue}</span></p>
                  <p>Reporting: <span className="text-amber-700 font-bold">{formDataStep3.reportingTime}</span></p>
                  <p>Deadline: <span className="text-rose-600 font-bold">{formDataStep3.applicationDeadline}</span></p>
                </div>
              </div>
            </div>

            {/* Rounds Preview */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                4. Evaluation Stages ({rounds.length} rounds defined)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rounds.map((r, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="font-extrabold text-slate-900 block">{r.roundName}</span>
                    <p className="text-slate-500 text-[11px]">Cutoff: <strong className="text-indigo-600">{r.cutoffScore}%</strong> • {r.durationMinutes} mins</p>
                    <p className="text-[10px] text-slate-400 italic">{r.mode}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            {currentStep === 1 && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitDrive}
                disabled={isSubmitting}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing Drive...' : 'Confirm & Publish Placement Drive'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
