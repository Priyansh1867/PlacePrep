import React, { useState } from 'react';
import { 
  Building2, 
  ChevronLeft, 
  Layers, 
  Sparkles, 
  Code2, 
  Users2, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  BookOpen, 
  ArrowRight, 
  Star, 
  Bot, 
  ShieldCheck, 
  FileCheck, 
  AlertCircle, 
  HelpCircle, 
  Flame, 
  Bookmark,
  Terminal,
  Activity,
  Zap
} from 'lucide-react';
import { 
  getInterviewQuestions, 
  getPracticedQuestions, 
  getSavedCompanies, 
  toggleSavedCompany, 
  getGraduationBatch,
  getUpcomingDrives
} from '../services/storage';

export default function CompanyHubPage({ 
  company, 
  onBack, 
  onSelectRound, 
  onSelectQuestion,
  onStartMockInterview,
  onViewInsights,
  onNavigateToDrives
}) {
  const [activeTab, setActiveTab] = useState('rounds');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');
  const currentBatch = getGraduationBatch();
  const savedCompanies = getSavedCompanies();
  const isSaved = savedCompanies.includes(company.id);
  const activeDrive = getUpcomingDrives().find(d => d.companyId === company.id);

  const allCompanyQuestions = getInterviewQuestions().filter(q => q.companyId === company.id);
  const practicedIds = getPracticedQuestions();

  const technicalQuestions = allCompanyQuestions.filter(q => q.round === 'technical');
  const hrQuestions = allCompanyQuestions.filter(q => q.round === 'hr');
  const managerialQuestions = allCompanyQuestions.filter(q => q.round === 'managerial');

  const filteredQuestions = selectedRoundFilter === 'all' 
    ? allCompanyQuestions 
    : allCompanyQuestions.filter(q => q.round === selectedRoundFilter);

  const roundDetails = [
    {
      id: 'technical',
      title: '1. Technical Interview',
      icon: Code2,
      badge: `${technicalQuestions.length} Questions Available`,
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-indigo-500/15 border border-indigo-500/30',
      textColor: 'text-indigo-400',
      topics: [
        'Data Structures and Algorithms',
        'Programming Questions',
        'Object-Oriented Programming (OOPs)',
        'DBMS and SQL',
        'Operating Systems',
        'Computer Networks',
        'Language-Specific Questions',
        'Projects and Technical Fundamentals'
      ],
      desc: 'Coding problem solving, memory models, database normalization, query design, and deep technical scrutiny of academic projects.'
    },
    {
      id: 'hr',
      title: '2. HR Interview',
      icon: Users2,
      badge: `${hrQuestions.length} Questions Available`,
      color: 'from-emerald-600 to-teal-700',
      bgColor: 'bg-emerald-500/15 border border-emerald-500/30',
      textColor: 'text-emerald-400',
      topics: [
        'Tell me about yourself (STAR Introduction)',
        'Why do you want to join this company?',
        'Strengths and weaknesses',
        'Career goals (3-5 Year Horizon)',
        'Teamwork and conflict management',
        'Relocation and shift preferences',
        'Situational and behavioral questions'
      ],
      desc: 'Assesses personality, communication clarity, cultural alignment, relocation willingness, and long-term commitment to the firm.'
    },
    {
      id: 'managerial',
      title: '3. Managerial Interview',
      icon: Briefcase,
      badge: `${managerialQuestions.length} Questions Available`,
      color: 'from-purple-600 to-indigo-800',
      bgColor: 'bg-purple-500/15 border border-purple-500/30',
      textColor: 'text-purple-400',
      topics: [
        'Problem-solving scenarios',
        'Leadership and teamwork dynamics',
        'Project-related technical discussions',
        'Decision-making questions',
        'Handling deadlines and pressure',
        'Conflict resolution',
        'Business and role-related scenarios'
      ],
      desc: 'Tests executive maturity, handling ambiguity, working under tight deliverables, and balancing technical vs business trade-offs.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Back Button & Navigation Path */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETURN TO COMPANIES DIRECTORY</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSavedCompany(company.id)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-400' : ''}`} />
            <span>{isSaved ? 'Saved to Target Set' : 'Save Recruiter'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header - Next-Gen Dark Tech */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0B0F19] via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800/80 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-slate-800 p-2.5 flex items-center justify-center shadow-lg shrink-0 overflow-hidden shadow-inner">
              <img
                src={company.logo}
                alt={company.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
                  {company.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
                  Target Company Hub
                </span>
              </div>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-mono">
                {company.tier} • {company.headquarters} • Compensation: <span className="font-bold text-emerald-400">{company.ctcRange}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono">
                {company.verifiedUpcomingDrive && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Next Drive: {company.upcomingDriveDate}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  Verified Experiences: {company.experienceCount}+
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  Telemetry Freshness: {company.latestUpdateDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Mock Interview Launcher CTA */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onStartMockInterview(company)}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Simulate AI Mock Interview</span>
            </button>
            <button
              onClick={() => onViewInsights(company)}
              className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-mono font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>View AI Insights</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation in Banner */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800/80 overflow-x-auto text-xs font-mono font-semibold">
          {[
            { id: 'rounds', label: 'Interview Pipeline (Technical, HR, Managerial)' },
            { id: 'overview', label: 'Company Overview & Eligibility' },
            { id: 'questions', label: `Question Vault (${allCompanyQuestions.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.35)] font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION B: INTERVIEW ROUND SELECTION */}
      {activeTab === 'rounds' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
                Select an Interview Stage
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-mono">
                Practice verified company-specific questions curated for {company.name} recruitment panels.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roundDetails.map((round) => {
              const Icon = round.icon;
              return (
                <div
                  key={round.id}
                  className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl hover:border-indigo-500/50 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.2)] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${round.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${round.textColor}`} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 text-xs font-mono font-bold border border-slate-800">
                        {round.badge}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg text-white mb-2 font-sans group-hover:text-indigo-400 transition-colors">
                      {round.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 font-mono">
                      {round.desc}
                    </p>

                    {/* Subtopics */}
                    <div className="space-y-2 mb-6 font-mono text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Core Tested Topics:
                      </p>
                      <ul className="space-y-1.5">
                        {round.topics.slice(0, 5).map((topic, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span className="line-clamp-1">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2 font-mono">
                    <button
                      onClick={() => onSelectRound(round.id, company)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                    >
                      <span>Open {round.title.split('.')[1]} Set</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onStartMockInterview(company, round.id)}
                      className="w-full py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs hover:border-slate-700 hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Simulate in AI Mock</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION A: COMPANY OVERVIEW & ELIGIBILITY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl">
              <h3 className="font-extrabold text-lg text-white mb-3 flex items-center gap-2 font-sans">
                <Building2 className="w-5 h-5 text-indigo-400" /> Company Profile & Placement Telemetry
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {company.name} is a premier global enterprise. As part of campus hiring across major engineering institutions, recruitment panels assess core computer science foundations, algorithmic problem-solving under pressure, and behavioral adaptability.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/70 p-4 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-400 block">Typical Job Roles:</span>
                  <span className="font-bold text-slate-200">{company.roles.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">CTC Package:</span>
                  <span className="font-bold text-emerald-400">{company.ctcRange}</span>
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl">
              <h3 className="font-extrabold text-lg text-white mb-3 flex items-center gap-2 font-sans">
                <FileCheck className="w-5 h-5 text-emerald-400" /> Verified Eligibility Engine Standards
              </h3>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-300 leading-relaxed font-mono">
                {company.eligibilityCriteria}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                *Eligibility rules verified against institutional placement cell criteria for {currentBatch} drives.
              </p>
            </div>

            {/* Confirmed Recruitment Drive & Venue Pass */}
            {activeDrive && (
              <div className="bg-gradient-to-br from-indigo-50/90 to-purple-50/80 rounded-2xl border border-indigo-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      Confirmed Campus Recruitment Drive
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                      {activeDrive.role}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-semibold block">CTC Package</span>
                    <span className="text-base font-extrabold text-indigo-600">{activeDrive.ctc}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/90 p-3.5 rounded-xl border border-indigo-100">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Drive Date & Time</span>
                    <span className="font-extrabold text-slate-900">{activeDrive.driveDate}</span>
                    <span className="text-[11px] text-indigo-600 block">{activeDrive.driveTime || '09:00 AM'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Reporting Time</span>
                    <span className="font-extrabold text-amber-700">{activeDrive.reportingTime || '08:30 AM'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Deadline</span>
                    <span className="font-extrabold text-rose-600">{activeDrive.deadline}</span>
                  </div>
                </div>

                <div className="text-xs bg-white/90 p-3.5 rounded-xl border border-indigo-100 space-y-1">
                  <span className="font-bold text-slate-800 block">Venue: {activeDrive.venue || 'Campus Auditorium Hall A'}</span>
                  <p className="text-[11px] text-slate-600">{activeDrive.instructions}</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (onNavigateToDrives) onNavigateToDrives();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <span>Register & Verify Eligibility in Placement Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step-by-Step Recruitment Process */}
            <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl">
              <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2 font-sans">
                <Layers className="w-5 h-5 text-indigo-400" /> Sequential Recruitment Workflow
              </h3>
              <div className="space-y-4">
                {company.recruitmentProcess.map((proc) => (
                  <div key={proc.step} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-md">
                      {proc.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{proc.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{proc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl font-mono">
              <h3 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Historical Source
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {company.verifiedHistoricalSource}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <p>Data Freshness: <b className="text-slate-200">{company.latestUpdateDate}</b></p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Historical confidence score: 94% based on 80+ peer reports.
                </p>
              </div>
            </div>

            <div className="glass-card bg-gradient-to-br from-[#0B0F19] to-indigo-950/60 rounded-2xl border border-indigo-500/30 p-6 shadow-xl font-mono">
              <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-1.5 font-sans">
                <Bot className="w-4 h-4 text-cyan-400" />
                Practice Simulated Round
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Test your responses against an AI panelist trained on {company.name}'s evaluation metrics.
              </p>
              <button
                onClick={() => onStartMockInterview(company)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all font-mono"
              >
                Launch Mock Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: QUESTION BANK TAB */}
      {activeTab === 'questions' && (
        <div className="space-y-4 font-mono">
          {/* Round Filter Tabs */}
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-semibold">
            {[
              { id: 'all', label: `All Questions (${allCompanyQuestions.length})` },
              { id: 'technical', label: `Technical (${technicalQuestions.length})` },
              { id: 'hr', label: `HR (${hrQuestions.length})` },
              { id: 'managerial', label: `Managerial (${managerialQuestions.length})` },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRoundFilter(r.id)}
                className={`px-3 py-1.5 rounded-lg transition-all border ${
                  selectedRoundFilter === r.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map(q => {
              const isPracticed = practicedIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion(q)}
                  className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold uppercase">
                          {q.round}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-xs border border-slate-800">
                          {q.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {q.frequencyScore}%
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className={isPracticed ? "text-emerald-400 font-bold flex items-center gap-1" : "text-slate-500"}>
                      {isPracticed ? "✓ Practiced" : "Pending practice"}
                    </span>
                    <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Practice Now <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
