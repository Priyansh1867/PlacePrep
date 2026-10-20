import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Briefcase, 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  Users, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  Award, 
  Bot, 
  Clock, 
  GraduationCap, 
  ShieldCheck, 
  Search, 
  ArrowUpRight, 
  Flame, 
  FileText,
  Terminal,
  Activity,
  Zap,
  Cpu
} from 'lucide-react';
import CompanyCard from '../components/CompanyCard';
import { 
  getCompanies, 
  getUpcomingDrives, 
  getInterviewQuestions, 
  getInterviewExperiences, 
  getGraduationBatch 
} from '../services/storage';

export default function HomePage({ onNavigate, onSelectCompany, onSelectQuestion }) {
  const currentBatch = getGraduationBatch();
  const companies = getCompanies();
  const drives = getUpcomingDrives();
  const questions = getInterviewQuestions();
  const experiences = getInterviewExperiences();

  // Top Frequently Asked Questions
  const topQuestions = [...questions].sort((a, b) => b.frequencyScore - a.frequencyScore).slice(0, 4);

  // Success Stories
  const successStories = [
    {
      name: 'Aditya Verma',
      college: 'SRM Institute of Science & Tech',
      company: 'HCLTech',
      role: 'Software Engineer (GET)',
      batch: '2026 Batch',
      package: '₹8.5 LPA (Specialist Track)',
      quote: 'The HCLTech specific questions on DBMS and the simulated AI mock interview gave me the exact confidence needed. The interviewer asked the exact Floyd cycle question I practiced here!',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=128&auto=format&fit=crop&q=80'
    },
    {
      name: 'Pooja Sundaram',
      college: 'Anna University',
      company: 'TCS',
      role: 'TCS Digital Engineer',
      batch: '2026 Batch',
      package: '₹7.2 LPA',
      quote: 'PlacePrep AI\'s comparison of older vs newer NQT trends helped me avoid outdated C syntax and master modern cloud & Python microservice concepts. Cleared both rounds on day one.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80'
    },
    {
      name: 'Kunal Deshmukh',
      college: 'Pune Institute of Computer Tech',
      company: 'Deloitte',
      role: 'Analyst - Technology Consulting',
      batch: '2026 Batch',
      package: '₹11.5 LPA',
      quote: 'The managerial STAR framework feedback from PlacePrep AI sharpened my scenario explanations. The partner round was 100% focused on how I handled conflicts, exactly as predicted.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24">
        {/* Ambient Dark Tech Light Blooms */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 left-1/3 w-72 h-72 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Personalized Batch Pill */}
          <div className="flex justify-center mb-7">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
              </span>
              <span>SYSTEM READY • <span className="text-white font-bold">{currentBatch} RECRUITMENT RADAR</span></span>
              <span className="text-slate-700">•</span>
              <button 
                onClick={() => onNavigate('drives')}
                className="hover:text-indigo-400 text-indigo-400 flex items-center gap-1 font-semibold transition-colors"
              >
                <span>Live Drives</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Engineered For Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Dream Placement Offer.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
              Company-specific recruitment intelligence, automated schedule conflict shields, real-time eligibility evaluation, and simulated AI technical interviews.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <button
                onClick={() => onNavigate('drives')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 group border border-indigo-400/30"
              >
                <Briefcase className="w-4 h-4 text-indigo-200" />
                <span>Explore Placement Drives</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('mock-interview')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Launch AI Mock Interview</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] border border-cyan-500/30">v2.5</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
                <p className="text-xl sm:text-2xl font-extrabold text-white font-mono">8+ Top</p>
                <p className="text-xs text-slate-400 font-medium">Recruiters Configured</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
                <p className="text-xl sm:text-2xl font-extrabold text-indigo-400 font-mono">350+</p>
                <p className="text-xs text-slate-400 font-medium">Verified Historical Logs</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">100%</p>
                <p className="text-xs text-slate-400 font-medium">Grounded Placement Data</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
                <p className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">Shield</p>
                <p className="text-xs text-slate-400 font-medium">Conflict Auto-Detection</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 1: UPCOMING PLACEMENT DRIVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xs uppercase tracking-wider mb-1.5">
              <Calendar className="w-4 h-4" />
              <span>Campus Recruitment Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Upcoming Placement Drives
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Verified campus hiring schedules with venue reporting times and round configurations.
            </p>
          </div>

          <button
            onClick={() => onNavigate('drives')}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 group"
          >
            <span>VIEW ALL SCHEDULED DRIVES</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.slice(0, 3).map((drive) => {
            const isEligible = drive.eligibleBatches.includes(currentBatch);
            return (
              <div
                key={drive.id}
                className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl hover:border-indigo-500/50 hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.2)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{drive.companyName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                      {drive.status}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-300 mb-3">{drive.role}</p>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-900/70 p-3 rounded-xl border border-slate-800 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">CTC Package:</span>
                      <span className="font-bold text-emerald-400">{drive.ctc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Drive Date:</span>
                      <span className="font-semibold text-indigo-400">{drive.driveDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Registration Closes:</span>
                      <span className="font-semibold text-rose-400">{drive.deadline}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {drive.rounds.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px] font-mono border border-slate-800">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isEligible 
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {isEligible ? `✓ Batch ${currentBatch} Eligible` : `Batches: ${drive.eligibleBatches.join(', ')}`}
                  </span>

                  <button
                    onClick={() => {
                      const comp = companies.find(c => c.id === drive.companyId);
                      if (comp) onSelectCompany(comp);
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Prepare Now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: POPULAR RECRUITERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider mb-1.5">
              <Building2 className="w-4 h-4" />
              <span>Target Companies</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Popular Recruiters for Batch {currentBatch}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Explore dedicated preparation hubs for companies actively hiring on campus.
            </p>
          </div>

          <button
            onClick={() => onNavigate('companies')}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 group"
          >
            <span>ALL {companies.length} RECRUITERS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.slice(0, 3).map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              currentBatch={currentBatch}
              onExplore={onSelectCompany}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: RECENTLY ADDED INTERVIEW EXPERIENCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xs uppercase tracking-wider mb-1.5">
              <Users className="w-4 h-4" />
              <span>Peer Intelligence Logs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recently Added Interview Experiences
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Authentic candidate debriefs, question patterns, and firsthand interview tips.
            </p>
          </div>

          <button
            onClick={() => onNavigate('experiences')}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 group"
          >
            <span>VIEW ALL LOGS</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.slice(0, 2).map((exp) => (
            <div
              key={exp.id}
              className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-white">{exp.companyName}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs font-mono font-semibold text-slate-300">{exp.role}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {exp.studentName} • {exp.college} ({exp.batch} Batch)
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                  {exp.outcome}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs font-mono font-bold text-slate-400 mb-1">Questions Encountered:</p>
                <ul className="space-y-1">
                  {exp.questionsEncountered.slice(0, 2).map((q, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span className="line-clamp-1">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 italic mb-4">
                "{exp.tips}"
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800 font-mono">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-200">{exp.overallRating} / 5</span>
                  <span className="text-slate-500">({exp.difficulty} Difficulty)</span>
                </div>
                <span className="text-[11px] text-slate-500">{exp.interviewDate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: FREQUENT INTERVIEW QUESTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider mb-1.5">
              <Flame className="w-4 h-4" />
              <span>High-Yield Question Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Most Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Identified through repetition frequency across recent campus technical rounds.
            </p>
          </div>

          <button
            onClick={() => onNavigate('prep')}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 group"
          >
            <span>QUESTION VAULT</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="glass-card p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold uppercase">
                      {q.companyId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-xs font-mono border border-slate-800">
                      {q.category}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <Flame className="w-3 h-3" />
                    {q.frequencyScore}% Repetition
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm group-hover:text-indigo-400 transition-colors leading-snug">
                  {q.question}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  Reported {q.timesReported} times ({q.lastReportedDate})
                </span>
                <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Practice Answer <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: AI-POWERED PLATFORM ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#0B0F19] via-slate-900 to-indigo-950/70 text-white p-8 sm:p-12 shadow-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Historical Intelligence</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Real-World Placement Intelligence & Conflict Prevention
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              PlacePrep evaluates verified historical recruitment transcripts, real-time schedule overlap clashes, and company specific cutoffs to ensure zero missed opportunities.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <TrendingUp className="w-6 h-6 text-indigo-400 mb-2" />
              <h3 className="font-bold text-white text-base">Emerging Topic Radar</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Highlights rising topics like SQL index optimization (+28%) and RESTful architecture (+42%) in latest 2026 drives.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-bold text-white text-base">Schedule Conflict Shield</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Algorithmic radar detecting overlapping interview slots and minimum buffer violations between recruitment drives.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <Bot className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-bold text-white text-base">Interactive AI Mock Evaluator</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Simulated 1-on-1 rounds with instant rubric evaluation on technical correctness, STAR framework, and communication clarity.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Telemetry Version: 2026.10-LTS • Operational</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('ai-insights')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 font-bold text-xs hover:bg-slate-800 hover:text-white transition-all shadow-md font-mono"
              >
                AI Insights Engine
              </button>
              <button
                onClick={() => onNavigate('mock-interview')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all border border-indigo-400/30 font-mono"
              >
                Launch Mock Interview
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: STUDENT SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2 border border-indigo-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Campus Placed Hall of Fame</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Success Stories
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real outcomes from students who used PlacePrep to prepare for campus hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, idx) => (
            <div
              key={idx}
              className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/40"
                  />
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{story.name}</h3>
                    <p className="text-xs text-slate-400">{story.college}</p>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-indigo-500/30">
                      {story.batch}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 mb-4 text-xs font-mono">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-200">{story.company}</span>
                    <span className="text-emerald-400">{story.package}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5 text-[11px]">{story.role}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{story.quote}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1 text-amber-400 text-xs font-bold font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-slate-500 ml-1 font-semibold text-[11px]">Verified Placement</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: PLACEMENT PREPARATION RESOURCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider mb-1.5">
              <FileText className="w-4 h-4" />
              <span>Curated Learning Guides</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Placement Preparation Resources
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Handcrafted cheat sheets and structured roadmaps for campus placement preparation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Selection Workflow & Pipeline',
              desc: 'Round-by-round selection engine (Aptitude, Tech, Managerial, HR), shortlisting, rubrics, and feedback.',
              tag: 'Placement Support',
              route: 'workflow'
            },
            {
              title: 'Technical Question Bank',
              desc: 'High-yield technical questions: JVM internals, Collections, Streams API, Concurrency, Git, Maven, and SQL ACID transactions.',
              tag: 'Technical Track',
              route: 'prep'
            },
            {
              title: 'Core CS 100 Checklist',
              desc: 'High-frequency OS, DBMS, OOP, and Networks questions asked across all mass & differential drives.',
              tag: 'Fundamentals',
              route: 'prep'
            },
            {
              title: 'STAR Method Playbook',
              desc: 'Proven structured frameworks to articulate behavioral & managerial answers convincingly.',
              tag: 'HR & Managerial',
              route: 'prep'
            }
          ].map((res, i) => (
            <div
              key={i}
              onClick={() => onNavigate(res.route)}
              className="glass-card p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {res.tag}
                </span>
                <h3 className="font-extrabold text-white text-base mt-3 group-hover:text-cyan-300 transition-colors">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {res.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-mono font-bold">
                <span>Access Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
