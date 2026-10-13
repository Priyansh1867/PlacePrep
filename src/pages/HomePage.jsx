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
  FileText
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

  // Highlighted Top Frequently Asked Questions
  const topQuestions = [...questions].sort((a, b) => b.frequencyScore - a.frequencyScore).slice(0, 4);

  // Success Stories Data
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
    <div className="space-y-16 sm:space-y-24">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 bg-gradient-to-b from-indigo-50/60 via-white to-[#F8FAFC]">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Personalized Batch Greeting Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200/80 shadow-sm text-xs font-semibold text-indigo-700 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span>Personalized for <span className="font-extrabold text-indigo-900">{currentBatch} Graduation Batch</span></span>
              <span className="text-slate-300">•</span>
              <button 
                onClick={() => onNavigate('drives')}
                className="hover:underline text-indigo-600 flex items-center gap-1 font-bold"
              >
                <span>View Drives</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Your Placement Journey <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
                Starts Here.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Prepare smarter, explore company-specific interview experiences, and get AI-powered insights to crack your dream placement.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => onNavigate('drives')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Explore Placement Drives</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('companies')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Start Preparing by Company</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 backdrop-blur-xs">
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900">8+ Top</p>
                <p className="text-xs text-slate-500 font-medium">Recruiters Configured</p>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 backdrop-blur-xs">
                <p className="text-xl sm:text-2xl font-extrabold text-indigo-600">350+</p>
                <p className="text-xs text-slate-500 font-medium">Verified Historical Logs</p>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 backdrop-blur-xs">
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">100%</p>
                <p className="text-xs text-slate-500 font-medium">Grounded Interview Data</p>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60 backdrop-blur-xs">
                <p className="text-xl sm:text-2xl font-extrabold text-purple-600">AI Mock</p>
                <p className="text-xs text-slate-500 font-medium">Interactive Evaluator</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 1: UPCOMING PLACEMENT DRIVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Campus Recruitment Calendar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Upcoming Placement Drives
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Verified campus hiring schedules with confirmed dates and batch eligibility.
            </p>
          </div>

          <button
            onClick={() => onNavigate('drives')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 group"
          >
            <span>View All Drives</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.slice(0, 3).map((drive) => {
            const isEligible = drive.eligibleBatches.includes(currentBatch);
            return (
              <div
                key={drive.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg text-slate-900">{drive.companyName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      {drive.status}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-700 mb-2">{drive.role}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">CTC Package:</span>
                      <span className="font-bold text-slate-800">{drive.ctc}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Drive Date:</span>
                      <span className="font-semibold text-indigo-600">{drive.driveDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deadline:</span>
                      <span className="font-semibold text-rose-600">{drive.deadline}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {drive.rounds.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isEligible ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isEligible ? `✓ Batch ${currentBatch} Eligible` : `Batches: ${drive.eligibleBatches.join(', ')}`}
                  </span>

                  <button
                    onClick={() => {
                      const comp = companies.find(c => c.id === drive.companyId);
                      if (comp) onSelectCompany(comp);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
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

      {/* SECTION 2: POPULAR COMPANIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Target Companies</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Recruiters for Batch {currentBatch}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore dedicated preparation hubs for companies actively hiring on campus.
            </p>
          </div>

          <button
            onClick={() => onNavigate('companies')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 group"
          >
            <span>Explore All {companies.length} Companies</span>
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
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Peer Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recently Added Interview Experiences
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Authentic candidate debriefs, question patterns, and firsthand interview tips.
            </p>
          </div>

          <button
            onClick={() => onNavigate('experiences')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 group"
          >
            <span>View All Experiences</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.slice(0, 2).map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">{exp.companyName}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-600">{exp.role}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exp.studentName} • {exp.college} ({exp.batch} Batch)
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {exp.outcome}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs font-bold text-slate-700 mb-1">Questions Encountered:</p>
                <ul className="space-y-1">
                  {exp.questionsEncountered.slice(0, 2).map((q, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span className="line-clamp-1">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic mb-4">
                "{exp.tips}"
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-700">{exp.overallRating} / 5</span>
                  <span className="text-slate-400">({exp.difficulty} Difficulty)</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">{exp.interviewDate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: MOST FREQUENTLY ASKED INTERVIEW QUESTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Question Bank Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Most Frequently Asked Interview Questions
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Identified through repetition frequency across recent campus interviews.
            </p>
          </div>

          <button
            onClick={() => onNavigate('prep')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 group"
          >
            <span>Explore All Questions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold uppercase">
                      {q.companyId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                      {q.category}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Flame className="w-3 h-3" />
                    {q.frequencyScore}% Frequency
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                  {q.question}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Reported {q.timesReported} times ({q.lastReportedDate})
                </span>
                <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Practice Answer <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: AI-POWERED INTERVIEW INSIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-300 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Historical Intelligence</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              How PlacePrep AI Differs From Normal Question Banks
            </h2>

            <p className="mt-4 text-sm sm:text-base text-indigo-100 leading-relaxed">
              We don't invent questions or claim psychic predictions. PlacePrep AI analyzes verified historical interview transcripts, tracking topic trends, question repetitions, and recency shifts between 2024 and 2026 drives.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <TrendingUp className="w-6 h-6 text-indigo-400 mb-2" />
              <h3 className="font-bold text-white text-base">Emerging Topic Detection</h3>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                Highlights rising topics like SQL index optimization (+28%) and RESTful architecture (+42%) in latest 2026 drives.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Award className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="font-bold text-white text-base">Preparation Priority Matrix</h3>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                Categorizes preparation into High Priority (Must-Do), Medium Priority, and Additional Practice to optimize student study time.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Bot className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-bold text-white text-base">AI Simulated Mock Interview</h3>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                Practice simulated 1-on-1 interviews with real-time evaluation of correctness, clarity, and STAR structure.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Latest recruitment intelligence update: October 2026</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('ai-insights')}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-md"
              >
                Explore AI Insights Dashboard
              </button>
              <button
                onClick={() => onNavigate('mock-interview')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors border border-indigo-400/40 shadow-md"
              >
                Launch AI Mock Interview
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: STUDENT SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Campus Placed Hall of Fame</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Success Stories
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Read how seniors cracked dream placement drives using PlacePrep AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{story.name}</h3>
                    <p className="text-xs text-slate-500">{story.college}</p>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {story.batch}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{story.company}</span>
                    <span className="text-emerald-600">{story.package}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5 text-[11px]">{story.role}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{story.quote}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span className="text-slate-400 ml-1 font-semibold text-[11px]">Verified Placement</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: PLACEMENT PREPARATION RESOURCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Curated Learning Guides</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Placement Preparation Resources
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Handcrafted cheat sheets and structured roadmaps for campus placement preparation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
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
            },
            {
              title: 'SQL & Query Optimization',
              desc: 'Nth highest salary, correlated subqueries, indexing mechanics, and window function cheat sheets.',
              tag: 'Database',
              route: 'prep'
            },
            {
              title: 'Live AI Mock Simulator',
              desc: 'Simulate full rounds for HCLTech, TCS, and Accenture with immediate scoring feedback.',
              tag: 'Interactive Tool',
              route: 'mock-interview'
            }
          ].map((res, i) => (
            <div
              key={i}
              onClick={() => onNavigate(res.route)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                  {res.tag}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-3 group-hover:text-indigo-600 transition-colors">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {res.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
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
