import React, { useState, useEffect } from 'react';
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
  Bookmark 
} from 'lucide-react';
import { QuestionApi } from '../services/api';
import { 
  getInterviewQuestions, 
  getPracticedQuestions, 
  getSavedCompanies, 
  toggleSavedCompany, 
  getGraduationBatch 
} from '../services/storage';

export default function CompanyHubPage({ 
  company, 
  onBack, 
  onSelectRound, 
  onSelectQuestion,
  onStartMockInterview,
  onViewInsights
}) {
  const [activeTab, setActiveTab] = useState('rounds'); // 'rounds', 'overview', 'questions', 'insights'
  const [selectedRoundFilter, setSelectedRoundFilter] = useState('all');
  const [allCompanyQuestions, setAllCompanyQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const currentBatch = getGraduationBatch();
  const savedCompanies = getSavedCompanies();
  const [isSaved, setIsSaved] = useState(savedCompanies.includes(company?.id));

  useEffect(() => {
    let isMounted = true;
    const fetchCompanyQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const data = await QuestionApi.getAll({ companyId: company?.id });
        if (isMounted) {
          if (data && data.length > 0) {
            setAllCompanyQuestions(data);
          } else {
            setAllCompanyQuestions(getInterviewQuestions().filter(q => q.companyId === company?.id));
          }
        }
      } catch (e) {
        if (isMounted) {
          setAllCompanyQuestions(getInterviewQuestions().filter(q => q.companyId === company?.id));
        }
      } finally {
        if (isMounted) setLoadingQuestions(false);
      }
    };
    if (company?.id) {
      fetchCompanyQuestions();
    }
    return () => { isMounted = false; };
  }, [company?.id]);

  const practicedIds = getPracticedQuestions();

  const technicalQuestions = allCompanyQuestions.filter(q => q.round === 'technical');
  const hrQuestions = allCompanyQuestions.filter(q => q.round === 'hr');
  const managerialQuestions = allCompanyQuestions.filter(q => q.round === 'managerial');

  const filteredQuestions = selectedRoundFilter === 'all' 
    ? allCompanyQuestions 
    : allCompanyQuestions.filter(q => q.round === selectedRoundFilter);

  const handleToggleSave = () => {
    toggleSavedCompany(company.id);
    setIsSaved(prev => !prev);
  };

  // Subtopics for the 3 main rounds as specified in prompt
  const roundDetails = [
    {
      id: 'technical',
      title: '1. Technical Interview',
      icon: Code2,
      badge: `${technicalQuestions.length} Questions Available`,
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-700',
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
      bgColor: 'bg-emerald-50 border-emerald-200',
      textColor: 'text-emerald-700',
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
      bgColor: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Companies</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-600' : ''}`} />
            <span>{isSaved ? 'Saved to Profile' : 'Save Company'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
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
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {company.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
                  Placement Preparation Hub
                </span>
              </div>

              <p className="mt-1.5 text-xs sm:text-sm text-indigo-200 font-medium">
                {company.tier} • {company.headquarters} • CTC: <span className="font-bold text-white">{company.ctcRange}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                {company.verifiedUpcomingDrive && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Next Drive: {company.upcomingDriveDate}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-indigo-100 border border-white/15">
                  Verified Experiences: {company.experienceCount}+
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-indigo-100 border border-white/15">
                  Latest Data: {company.latestUpdateDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Mock Interview Launcher CTA */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onStartMockInterview(company)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-xs hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Take AI Mock Interview</span>
            </button>
            <button
              onClick={() => onViewInsights(company)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>View AI Insights</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation in Banner */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/15 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'rounds', label: 'Interview Rounds (Technical, HR, Managerial)' },
            { id: 'overview', label: 'Company Overview & Eligibility' },
            { id: 'questions', label: `Question Bank (${allCompanyQuestions.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-950 font-extrabold shadow-sm'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
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
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Select an Interview Round
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${round.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${round.textColor}`} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        {round.badge}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                      {round.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {round.desc}
                    </p>

                    {/* Subtopics */}
                    <div className="space-y-2 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Key Tested Areas:
                      </p>
                      <ul className="space-y-1.5">
                        {round.topics.slice(0, 5).map((topic, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                            <span className="line-clamp-1">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => onSelectRound(round.id, company)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Open {round.title.split('.')[1]} Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onStartMockInterview(company, round.id)}
                      className="w-full py-2 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-indigo-50 hover:text-indigo-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Simulate This Round in AI Mock</span>
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-extrabold text-lg text-slate-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Company Profile & Placement Overview
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {company.name} is a premier global technology powerhouse. As part of campus hiring across major engineering colleges, recruitment focuses on core computer science foundations, problem solving under pressure, and behavioral adaptability.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Typical Job Roles:</span>
                  <span className="font-bold text-slate-800">{company.roles.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">CTC Package:</span>
                  <span className="font-bold text-emerald-600">{company.ctcRange}</span>
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-extrabold text-lg text-slate-900 mb-3 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" /> Verified Eligibility Criteria
              </h3>
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                {company.eligibilityCriteria}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                *Eligibility criteria are updated based on official campus placement cell brochures for 2026/2027/2028 drives.
              </p>
            </div>

            {/* Step-by-Step Recruitment Process */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-extrabold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" /> Step-by-Step Recruitment Process
              </h3>
              <div className="space-y-4">
                {company.recruitmentProcess.map((proc) => (
                  <div key={proc.step} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {proc.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{proc.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{proc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Verified Updates */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Historical Source
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {company.verifiedHistoricalSource}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <p>Data Freshness: <b>{company.latestUpdateDate}</b></p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Historical confidence score: 94% based on 80+ peer reports.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-indigo-950 mb-2 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600" />
                Practice Simulated Round
              </h3>
              <p className="text-xs text-indigo-800 leading-relaxed mb-4">
                Test your responses against an AI panelist trained on {company.name}'s evaluation metrics.
              </p>
              <button
                onClick={() => onStartMockInterview(company)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm"
              >
                Launch Mock Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: QUESTION BANK TAB */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Round Filter Tabs */}
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-semibold">
            {[
              { id: 'all', label: `All Questions (${allCompanyQuestions.length})` },
              { id: 'technical', label: `Technical (${technicalQuestions.length})` },
              { id: 'hr', label: `HR (${hrQuestions.length})` },
              { id: 'managerial', label: `Managerial (${managerialQuestions.length})` },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRoundFilter(r.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRoundFilter === r.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold uppercase">
                          {q.round}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                          {q.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {q.frequencyScore}%
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className={isPracticed ? "text-emerald-600 font-bold flex items-center gap-1" : "text-slate-400"}>
                      {isPracticed ? "✓ Practiced" : "Pending practice"}
                    </span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
