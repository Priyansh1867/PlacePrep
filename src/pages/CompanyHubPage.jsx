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
  Bookmark,
  Terminal,
  Activity,
  Zap
} from 'lucide-react';
import { QuestionApi } from '../services/api';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [allCompanyQuestions, setAllCompanyQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const currentBatch = getGraduationBatch();
  const savedCompanies = getSavedCompanies();
  const [isSaved, setIsSaved] = useState(savedCompanies.includes(company?.companyId || company?.id));

  const activeDrive = getUpcomingDrives().find(d => d.companyId === (company?.companyId || company?.id));

  useEffect(() => {
    let isMounted = true;
    const fetchCompanyQuestions = async () => {
      setLoadingQuestions(true);
      const targetId = company?.companyId || company?.id;
      try {
        const data = await QuestionApi.getAll({ companyId: targetId });
        if (isMounted) {
          if (data && data.length > 0) {
            setAllCompanyQuestions(data);
          } else {
            setAllCompanyQuestions(getInterviewQuestions().filter(q => q.companyId === targetId));
          }
        }
      } catch (e) {
        if (isMounted) {
          setAllCompanyQuestions(getInterviewQuestions().filter(q => q.companyId === targetId));
        }
      } finally {
        if (isMounted) setLoadingQuestions(false);
      }
    };
    if (company?.companyId || company?.id) {
      fetchCompanyQuestions();
    }
    return () => { isMounted = false; };
  }, [company]);

  const practicedIds = getPracticedQuestions();

  const technicalQuestions = allCompanyQuestions.filter(q => q.round === 'technical');
  const hrQuestions = allCompanyQuestions.filter(q => q.round === 'hr');
  const managerialQuestions = allCompanyQuestions.filter(q => q.round === 'managerial');

  const filteredQuestions = React.useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return allCompanyQuestions.filter(item => {
      const matchRound = selectedRoundFilter === 'all' || item.round === selectedRoundFilter;
      const questionText = (item.questionText || item.question || '').toLowerCase();
      const categoryText = (item.category || '').toLowerCase();
      const skillsMatch = (item.skills || []).some(s => s.toLowerCase().includes(q));
      const matchSearch = !q || questionText.includes(q) || categoryText.includes(q) || skillsMatch;
      return matchRound && matchSearch;
    });
  }, [allCompanyQuestions, selectedRoundFilter, searchQuery]);

  const handleToggleSave = () => {
    toggleSavedCompany(company?.companyId || company?.id);
    setIsSaved(prev => !prev);
  };

  const roundDetails = [
    {
      id: 'technical',
      title: '1. Technical Interview',
      icon: Code2,
      badge: `${technicalQuestions.length} Questions Available`,
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-indigo-50 border border-indigo-200',
      textColor: 'text-indigo-600',
      topics: [
        'Data Structures and Algorithms',
        'Programming Questions',
        'Operating Systems',
        'Database Management Systems',
        'Object-Oriented Programming (OOP)',
        'Computer Networks',
        'System Design & Architecture'
      ],
      description: 'Rigorous technical evaluation testing problem solving, time complexity, and core computer science fundamentals.'
    },
    {
      id: 'hr',
      title: '2. HR Interview',
      icon: Users2,
      badge: `${hrQuestions.length} Questions Available`,
      color: 'from-purple-600 to-pink-700',
      bgColor: 'bg-purple-50 border border-purple-200',
      textColor: 'text-purple-600',
      topics: [
        'Behavioral Questions (STAR Method)',
        'Situational Leadership & Team Scenarios',
        'Company Culture & Values Alignment',
        'Career Goals & Self-Awareness'
      ],
      description: 'Evaluates communication clarity, cultural fit, adaptability, and emotional intelligence in workplace situations.'
    },
    {
      id: 'managerial',
      title: '3. Managerial Round',
      icon: Briefcase,
      badge: `${managerialQuestions.length} Questions Available`,
      color: 'from-emerald-600 to-teal-700',
      bgColor: 'bg-emerald-50 border border-emerald-200',
      textColor: 'text-emerald-600',
      topics: [
        'Project Deep-Dives & Trade-offs',
        'Scenario Handling & Priority Conflicts',
        'Decision Making Under Ambiguity',
        'Team Dynamics & Cross-Functional Work'
      ],
      description: 'Senior leadership interview testing project ownership, problem breakdown, and engineering judgment.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Back Button & Navigation Path */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETURN TO COMPANIES DIRECTORY</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSaved
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />
            <span>{isSaved ? 'Saved to Target Set' : 'Save Recruiter'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header - Next-Gen Dark Tech */}
      <div className="relative surface-card p-6 sm:p-8 border-slate-200 overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-slate-200 p-2.5 flex items-center justify-center shadow-lg shrink-0 overflow-hidden shadow-inner">
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
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                  {company.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200">
                  Target Company Hub
                </span>
              </div>

              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-mono">
                {company.tier} • {company.headquarters} • Compensation: <span className="font-bold text-emerald-700">{company.ctcRange}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono">
                {company.verifiedUpcomingDrive && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Next Drive: {company.upcomingDriveDate}
                  </span>
                )}
                {activeDrive && onNavigateToDrives && (
                  <button
                    onClick={onNavigateToDrives}
                    className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" /> View Active Drive Schedule
                  </button>
                )}
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Verified Experiences: {company.experienceCount || 'Not available'}+
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Telemetry Freshness: {company.latestUpdateDate || 'October 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Mock Interview Launcher CTA */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onStartMockInterview && onStartMockInterview(company)}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-cyan-200" />
              <span>Simulate AI Mock Interview</span>
            </button>
            <button
              onClick={() => onViewInsights && onViewInsights(company)}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-mono font-bold text-xs border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>View AI Insights</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation in Banner */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-200 overflow-x-auto text-xs font-mono font-semibold">
          {[
            { id: 'rounds', label: 'Interview Pipeline (Technical, HR, Managerial)' },
            { id: 'overview', label: 'Company Overview & Eligibility' },
            { id: 'questions', label: `Question Vault (${allCompanyQuestions.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap border cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
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
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                Select an Interview Stage
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-mono">
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
                  className="surface-card p-6 shadow-xl hover:border-indigo-500/50 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.2)] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${round.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${round.textColor}`} />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700">
                        {round.badge}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-lg text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors font-sans">
                      {round.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed font-mono">
                      {round.description}
                    </p>

                    {/* Verified Syllabus Topics */}
                    <div className="space-y-2 mb-6 pt-4 border-t border-slate-200">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        Assessed Syllabus & Concepts
                      </span>
                      <ul className="space-y-1.5">
                        {round.topics.map((t, idx) => (
                          <li key={idx} className="text-xs text-slate-700 font-mono flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={() => onSelectRound(round.id)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 group-hover:gap-2 cursor-pointer"
                  >
                    <span>Practice {round.title.split('. ')[1]} Questions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION B2: COMPANY OVERVIEW & ELIGIBILITY TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-card p-6 border-slate-200 space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 font-sans">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Eligibility Criteria & Policies
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {company.eligibilityCriteria}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Drive Status</span>
                  <span className="text-xs font-bold text-emerald-700 mt-0.5 block">{company.driveStatus}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Eligible Cohorts</span>
                  <span className="text-xs font-bold text-indigo-700 mt-0.5 block">
                    {company.eligibleBatches?.join(', ')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Target Roles</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                    {company.roles?.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="surface-card p-6 border-slate-200 space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 font-sans">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                Actual Selection Process Workflow
              </h3>
              <div className="space-y-3">
                {company.recruitmentProcess?.map((step) => (
                  <div key={step.step} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {step.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 font-sans">{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-card p-6 border-slate-200 space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 font-sans">
                <Flame className="w-5 h-5 text-amber-500" />
                Frequent Technical Topics
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {company.frequentTopics?.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:border-indigo-300 transition-colors"
                  >
                    #{topic}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <span className="text-[11px] text-slate-400 block mb-1">Source Transparency</span>
                <p className="text-xs text-slate-500 leading-snug">
                  {company.verifiedHistoricalSource}
                </p>
              </div>
            </div>

            <div className="surface-card bg-gradient-to-br from-[#0B0F19] to-indigo-950/60 rounded-2xl border border-indigo-200 p-6 shadow-xl font-mono text-white">
              <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-1.5 font-sans">
                <Bot className="w-4 h-4 text-cyan-400" />
                Practice Simulated Round
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Test your responses against an AI panelist trained on {company.name}'s evaluation metrics.
              </p>
              <button
                onClick={() => onStartMockInterview && onStartMockInterview(company)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all font-mono cursor-pointer"
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
          {/* Controls: Round Filter Tabs & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="w-full md:w-80">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search questions, categories, skills..."
                size="sm"
                resultCount={filteredQuestions.length}
                totalCount={allCompanyQuestions.length}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1 md:pb-0">
              {[
                { id: 'all', label: `All (${allCompanyQuestions.length})` },
                { id: 'technical', label: `Tech (${technicalQuestions.length})` },
                { id: 'hr', label: `HR (${hrQuestions.length})` },
                { id: 'managerial', label: `Managerial (${managerialQuestions.length})` },
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoundFilter(r.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all border whitespace-nowrap cursor-pointer ${
                    selectedRoundFilter === r.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No questions found"
              description={
                searchQuery.trim()
                  ? `No questions matched "${searchQuery.trim()}". Try searching another topic or reset filters.`
                  : 'No questions available for this round filter.'
              }
              actionLabel="Clear Search"
              onAction={() => {
                setSearchQuery('');
                setSelectedRoundFilter('all');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuestions.map(q => {
                const isPracticed = practicedIds.includes(q.questionId || q.id);
                return (
                  <div
                    key={q.questionId || q.id}
                    onClick={() => onSelectQuestion && onSelectQuestion(q)}
                    className="surface-card p-5 shadow-xl hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-bold uppercase">
                            {q.round}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">
                            {q.category}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> {q.frequencyScore || 'Not available'}%
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                        {q.questionText || q.question}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className={isPracticed ? "text-emerald-700 font-bold flex items-center gap-1" : "text-slate-500"}>
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
          )}
        </div>
      )}

    </div>
  );
}
