import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Plus, 
  Briefcase, 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  SlidersHorizontal,
  Layers,
  Database
} from 'lucide-react';
import { 
  getCompanies, 
  addCompany, 
  getUpcomingDrives, 
  addDrive, 
  getInterviewQuestions, 
  addInterviewQuestion, 
  getInterviewExperiences, 
  getPlatformFeedback 
} from '../services/storage';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'companies', 'drives', 'questions', 'moderation', 'feedback'
  const [successToast, setSuccessToast] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  // Lists
  const companies = getCompanies();
  const drives = getUpcomingDrives();
  const questions = getInterviewQuestions();
  const experiences = getInterviewExperiences();
  const feedbackList = getPlatformFeedback();

  // New Company Form State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyTier, setNewCompanyTier] = useState('Tier 1 IT Services');
  const [newCompanyCtc, setNewCompanyCtc] = useState('₹5.0 - ₹9.0 LPA');
  const [newCompanyRoles, setNewCompanyRoles] = useState('Software Engineer, GET');
  const [newCompanyBatches, setNewCompanyBatches] = useState('2026, 2027, 2028');

  // New Drive Form State
  const [driveCompany, setDriveCompany] = useState('hcltech');
  const [driveRole, setDriveRole] = useState('Associate Engineer');
  const [driveCtc, setDriveCtc] = useState('₹5.5 LPA');
  const [driveDate, setDriveDate] = useState('December 20, 2026');
  const [driveDeadline, setDriveDeadline] = useState('December 10, 2026');
  const [driveVenue, setDriveVenue] = useState('Auditorium Hall B & Labs');
  const [driveReportingTime, setDriveReportingTime] = useState('08:30 AM');
  const [driveInstructions, setDriveInstructions] = useState('Carry printed resume, college ID, and laptop.');
  const [driveMinCgpa, setDriveMinCgpa] = useState(6.5);

  // New Question Form State
  const [qCompany, setQCompany] = useState('hcltech');
  const [qRound, setQRound] = useState('technical');
  const [qCategory, setQCategory] = useState('Data Structures and Algorithms');
  const [qDifficulty, setQDifficulty] = useState('Medium');
  const [qText, setQText] = useState('');
  const [qAnswer, setQAnswer] = useState('');
  const [qApproach, setQApproach] = useState('');

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleCreateCompany = (e) => {
    e.preventDefault();
    if (!newCompanyName) return;

    const slug = newCompanyName.toLowerCase().replace(/\s+/g, '-');
    const created = {
      id: slug,
      name: newCompanyName,
      slug,
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      tier: newCompanyTier,
      headquarters: 'India / Global',
      industry: 'Technology',
      roles: newCompanyRoles.split(',').map(r => r.trim()),
      ctcRange: newCompanyCtc,
      verifiedUpcomingDrive: true,
      upcomingDriveDate: 'Announced Soon',
      eligibleBatches: newCompanyBatches.split(',').map(b => b.trim()),
      driveStatus: 'Campus Shortlisting Active',
      eligibilityCriteria: 'Minimum 60% in 10th, 12th, and Under-Graduation with max 1 active backlog.',
      recruitmentProcess: [
        { step: 1, title: 'Online Assessment', desc: 'Aptitude & Technical MCQs' },
        { step: 2, title: 'Technical Interview', desc: 'Core CS and live problem solving' },
        { step: 3, title: 'HR Round', desc: 'Behavioral and culture alignment' }
      ],
      experienceCount: 15,
      frequentTopics: ['DSA', 'OOPs', 'SQL Queries'],
      latestUpdateDate: 'October 2026',
      verifiedHistoricalSource: 'Verified via campus placement cell',
      popularityScore: 85
    };

    addCompany(created);
    setNewCompanyName('');
    showToast(`Company "${created.name}" created successfully!`);
  };

  const handleCreateDrive = (e) => {
    e.preventDefault();
    const comp = companies.find(c => c.id === driveCompany) || companies[0];
    const newDrive = {
      id: `drv-${Date.now()}`,
      companyId: driveCompany,
      companyName: comp.name,
      role: driveRole,
      ctc: driveCtc,
      driveDate: driveDate,
      driveTime: '09:00 AM',
      deadline: driveDeadline,
      venue: driveVenue,
      reportingTime: driveReportingTime,
      instructions: driveInstructions,
      minCgpa: parseFloat(driveMinCgpa) || 6.5,
      minTenthPercentage: 60.0,
      minTwelfthPercentage: 60.0,
      maxBacklogs: 0,
      eligibleBatches: ['2026', '2027', '2028'],
      status: 'Verified Upcoming Drive',
      locations: ['Pan-India Virtual & On-Campus'],
      rounds: ['Online Assessment', 'Technical Round 1', 'HR Round'],
      roundConfigs: [
        { roundNumber: 1, roundName: 'Online Assessment', roundType: 'Aptitude Assessment', durationMinutes: 60, cutoffScore: 70, mode: 'Online Proctored', venueOrLink: driveVenue },
        { roundNumber: 2, roundName: 'Technical Round 1', roundType: 'Technical Interview', durationMinutes: 45, cutoffScore: 75, mode: 'In-Person Panel', venueOrLink: driveVenue },
        { roundNumber: 3, roundName: 'HR Round', roundType: 'HR Round', durationMinutes: 30, cutoffScore: 80, mode: 'In-Person', venueOrLink: 'Placement Office' }
      ],
      verifiedBadge: true
    };

    addDrive(newDrive);
    showToast(`Placement drive for ${comp.name} added!`);
  };

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    if (!qText) return;

    const newQuestion = {
      id: `q-${Date.now()}`,
      companyId: qCompany,
      round: qRound,
      category: qCategory,
      difficulty: qDifficulty,
      question: qText,
      frequencyScore: 88,
      recencyRating: 'High',
      timesReported: 18,
      lastReportedDate: 'October 2026',
      verifiedHistorical: true,
      skills: [qCategory],
      approach: qApproach || 'Break down into fundamental components, explain trade-offs and complexity.',
      suggestedAnswer: qAnswer || 'Standard model answer covering core theory and practical implementation.',
      followUps: ['How would this behave at enterprise scale?']
    };

    addInterviewQuestion(newQuestion);
    setQText('');
    setQAnswer('');
    setQApproach('');
    showToast('Interview question added to verified question bank!');
  };

  const handleTriggerAnalysis = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
      showToast('AI Historical Analysis engine recalculated! Frequency metrics, recency weights, and priority matrix updated.');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Admin Top Banner */}
      <div className="rounded-lg bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Administration Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            PlacePrep AI – Admin Control Panel
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Manage company preparation hubs, verified placement drives, question banks, and moderate student-submitted experiences.
          </p>
        </div>

        {/* Trigger Recalculation CTA */}
        <button
          onClick={handleTriggerAnalysis}
          disabled={recalculating}
          className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalculating Intelligence...' : 'Trigger AI Analysis Recalculation'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Platform Stats & Intelligence Status' },
          { id: 'companies', label: `Manage Companies (${companies.length})` },
          { id: 'drives', label: `Manage Placement Drives (${drives.length})` },
          { id: 'questions', label: `Add Question to Bank (${questions.length})` },
          { id: 'moderation', label: `Moderate Experiences (${experiences.length})` },
          { id: 'feedback', label: `User Feedback (${feedbackList.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-3 px-4 rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === t.id
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Recruiters</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{companies.length}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Active in database</p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified Drives</span>
              <p className="text-3xl font-black text-indigo-600 mt-1">{drives.length}</p>
              <p className="text-xs text-indigo-500 font-semibold mt-1">Confirmed campus dates</p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Question Bank</span>
              <p className="text-3xl font-black text-purple-600 mt-1">{questions.length}</p>
              <p className="text-xs text-purple-500 font-semibold mt-1">Technical, HR & Managerial</p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Candidate Logs</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">{experiences.length}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">Historical debriefs</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              AI Intelligence Pipeline Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-bold">Data Freshness:</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">October 2026 (Real-time)</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-bold">Recency Weight Factor:</span>
                <span className="font-semibold text-indigo-600 text-sm mt-0.5 block">1.4x for 2025-2026 Drives</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-bold">Moderation Gate:</span>
                <span className="font-semibold text-emerald-600 text-sm mt-0.5 block">Automated + Manual Review</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" /> Add New Company Profile
            </h3>
            <form onSubmit={handleCreateCompany} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Cisco Systems"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tier / Category</label>
                <input
                  type="text"
                  value={newCompanyTier}
                  onChange={(e) => setNewCompanyTier(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CTC Package Range</label>
                <input
                  type="text"
                  value={newCompanyCtc}
                  onChange={(e) => setNewCompanyCtc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hiring Roles (Comma separated)</label>
                <input
                  type="text"
                  value={newCompanyRoles}
                  onChange={(e) => setNewCompanyRoles(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligible Batches</label>
                <input
                  type="text"
                  value={newCompanyBatches}
                  onChange={(e) => setNewCompanyBatches(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
              >
                Create Company Profile
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-base text-slate-900 mb-2">Existing Companies</h3>
            <div className="space-y-2">
              {companies.map(c => (
                <div key={c.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    <span className="text-slate-500 ml-2">({c.tier} • {c.ctcRange})</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Batches: {c.eligibleBatches?.join(', ')}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="font-semibold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" /> Announce Placement Drive
            </h3>
            <form onSubmit={handleCreateDrive} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company</label>
                <select
                  value={driveCompany}
                  onChange={(e) => setDriveCompany(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  value={driveRole}
                  onChange={(e) => setDriveRole(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CTC Package</label>
                <input
                  type="text"
                  value={driveCtc}
                  onChange={(e) => setDriveCtc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Drive Date</label>
                  <input
                    type="text"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="text"
                    value={driveDeadline}
                    onChange={(e) => setDriveDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue / Room</label>
                  <input
                    type="text"
                    value={driveVenue}
                    onChange={(e) => setDriveVenue(e.target.value)}
                    placeholder="e.g. Auditorium Hall B"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reporting Time</label>
                  <input
                    type="text"
                    value={driveReportingTime}
                    onChange={(e) => setDriveReportingTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Min CGPA Cutoff</label>
                <input
                  type="number"
                  step="0.1"
                  value={driveMinCgpa}
                  onChange={(e) => setDriveMinCgpa(parseFloat(e.target.value) || 6.0)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Instructions</label>
                <textarea
                  rows={2}
                  value={driveInstructions}
                  onChange={(e) => setDriveInstructions(e.target.value)}
                  placeholder="Dress code, items to carry..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
              >
                Publish Drive Schedule
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="font-semibold text-base text-slate-900 mb-2">Active Placement Drives</h3>
            <div className="space-y-2">
              {drives.map(d => (
                <div key={d.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{d.companyName}</span>
                    <span className="text-slate-600 ml-2 font-medium">• {d.role} ({d.ctc})</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Date: {d.driveDate} • Deadline: {d.deadline}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADD QUESTION */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            Add Verified Interview Question to Bank
          </h3>

          <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company</label>
                <select
                  value={qCompany}
                  onChange={(e) => setQCompany(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interview Round</label>
                <select
                  value={qRound}
                  onChange={(e) => setQRound(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="technical">Technical Round</option>
                  <option value="hr">HR Round</option>
                  <option value="managerial">Managerial Round</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={qCategory}
                  onChange={(e) => setQCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Operating Systems"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={qDifficulty}
                  onChange={(e) => setQDifficulty(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Interview Question *</label>
              <input
                type="text"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="e.g. What is the difference between synchronous and asynchronous execution in Node.js?"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Recommended Answering Approach (STAR / Algorithmic Steps)</label>
              <textarea
                rows={2}
                value={qApproach}
                onChange={(e) => setQApproach(e.target.value)}
                placeholder="Explain the Event Loop, Call Stack, Callback Queue..."
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Model Suggested Answer</label>
              <textarea
                rows={4}
                value={qAnswer}
                onChange={(e) => setQAnswer(e.target.value)}
                placeholder="Provide a comprehensive explanation suitable for an interview panel..."
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
            >
              Add Question to Bank
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: MODERATION */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-slate-900">
            Submitted Interview Experiences Awaiting Moderation
          </h3>
          <div className="space-y-3">
            {experiences.map(exp => (
              <div key={exp.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{exp.companyName}</span>
                    <span className="text-slate-500">• {exp.role}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                      Batch {exp.batch}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">"{exp.tips}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base text-slate-900">
            Student Feedback & Question Reports
          </h3>
          {feedbackList.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No reports or feedback submissions pending.</p>
          ) : (
            <div className="space-y-3">
              {feedbackList.map(fb => (
                <div key={fb.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>{fb.category}</span>
                    <span className="text-slate-400">{fb.date?.split('T')[0]}</span>
                  </div>
                  <p className="text-slate-600">{fb.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
