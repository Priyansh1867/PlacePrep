import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  Building2, 
  ArrowRight, 
  BarChart3, 
  Award, 
  RotateCcw, 
  Sparkles, 
  Bot, 
  TrendingUp, 
  Flame,
  Check,
  ChevronRight,
  BookOpen,
  Terminal,
  Activity,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { 
  getCurrentUser, 
  getGraduationBatch, 
  getSavedCompanies, 
  getSavedQuestions, 
  getPracticedQuestions, 
  getRevisionList, 
  getInterviewQuestions, 
  getUpcomingDrives, 
  getMockSessions, 
  getCompanies 
} from '../services/storage';

export default function StudentDashboardPage({ onNavigate, onSelectCompany, onSelectQuestion }) {
  const user = getCurrentUser();
  const currentBatch = getGraduationBatch();
  const companies = getCompanies();
  const allQuestions = getInterviewQuestions();
  const drives = getUpcomingDrives();

  const savedCompIds = getSavedCompanies();
  const savedQuestionIds = getSavedQuestions();
  const practicedQuestionIds = getPracticedQuestions();
  const revisionQuestionIds = getRevisionList();
  const mockSessions = getMockSessions();

  const savedCompanies = companies.filter(c => savedCompIds.includes(c.id));
  const savedQuestions = allQuestions.filter(q => savedQuestionIds.includes(q.id));
  const practicedQuestions = allQuestions.filter(q => practicedQuestionIds.includes(q.id));
  const revisionQuestions = allQuestions.filter(q => revisionQuestionIds.includes(q.id));

  // Category breakdown
  const technicalCount = practicedQuestions.filter(q => q.round === 'technical').length;
  const hrCount = practicedQuestions.filter(q => q.round === 'hr').length;
  const managerialCount = practicedQuestions.filter(q => q.round === 'managerial').length;

  const totalPossible = allQuestions.length || 1;
  const progressPercent = Math.min(Math.round((practicedQuestions.length / totalPossible) * 100), 100);

  // Relevant drives for current batch
  const batchDrives = drives.filter(d => d.eligibleBatches.includes(currentBatch));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Student Welcome Hero - Next-Gen Dark Tech */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B0F19] via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-500 text-white font-mono font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20 shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'P'}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                {user?.name || 'Priyansh Jain'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
                Batch {currentBatch} Candidate
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
              {user?.college || 'SRM Institute of Science & Tech'} • {user?.branch || 'Computer Science & Engineering'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-800 shadow-inner">
                Active Targets: {savedCompanies.map(c => c.name).join(', ') || 'HCLTech, TCS, Infosys'}
              </span>
            </div>
          </div>
        </div>

        {/* Continue Prep CTA */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5 text-white shrink-0 relative z-10 shadow-xl">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">
            Active Study Pipeline
          </span>
          <p className="text-sm font-extrabold text-white">
            HCLTech Specialist Track
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-3 font-mono">
            Next: Floyd Cycle detection & SQL Joins
          </p>
          <button
            onClick={() => {
              const hcl = companies.find(c => c.id === 'hcltech');
              if (hcl) onSelectCompany(hcl);
            }}
            className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Resume Module</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Progress Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Practiced</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{practicedQuestions.length}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Verified questions logged</p>
        </div>

        <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Bookmarked</span>
            <Bookmark className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400 font-mono">{savedQuestions.length}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">High-yield revision set</p>
        </div>

        <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Revision List</span>
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 font-mono">{revisionQuestions.length}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Flagged interview prompts</p>
        </div>

        <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">AI Mock Score</span>
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {mockSessions.length > 0 ? `${mockSessions[0].score}%` : '85%'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Latest rubric evaluation</p>
        </div>
      </div>

      {/* SECTION: PREPARATION ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Category Mastery & Strengths */}
        <div className="lg:col-span-2 glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-white flex items-center gap-2 font-sans">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Preparation Analytics & Mastery
            </h2>
            <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 rounded-full">
              Overall Readiness: {progressPercent}%
            </span>
          </div>

          {/* Technical vs HR vs Managerial Progress */}
          <div className="space-y-4 font-mono text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1.5">
                <span>Technical Interview Practice (DSA, OOP, SQL, OS)</span>
                <span className="text-indigo-400">{technicalCount} Practiced</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${Math.min(technicalCount * 25, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1.5">
                <span>HR Round Preparation (Intro, Culture, Motivation)</span>
                <span className="text-emerald-400">{hrCount} Practiced</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(hrCount * 33, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-300 mb-1.5">
                <span>Managerial Round (STAR Scenarios, Conflict Resolution)</span>
                <span className="text-purple-400">{managerialCount} Practiced</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" style={{ width: `${Math.min(managerialCount * 35, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Strong vs Weak Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="font-extrabold text-emerald-300 block mb-2 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Strong Topics (Verified Clear):
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                <li>• DBMS Normalization & SQL Queries (88% Accuracy)</li>
                <li>• Floyd Cycle Detection & Linked Lists (85% Accuracy)</li>
                <li>• Self Introduction Present-Past-Future Structure</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="font-extrabold text-amber-300 block mb-2 flex items-center gap-1.5 font-mono">
                <Flame className="w-4 h-4 text-amber-400" /> Priority Focus (High-Yield):
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                <li>• Deadlock Coffman Conditions in OS</li>
                <li>• Quantifying results in STAR behavioral responses</li>
                <li>• Dynamic Programming & Sliding Window optimizations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Mock Interview Session History */}
        <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-base text-white flex items-center gap-2 mb-3 font-sans">
              <Bot className="w-5 h-5 text-cyan-400" />
              AI Mock Session History
            </h2>

            {mockSessions.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono text-xs text-slate-400 my-4">
                No mock interviews logged yet. Run a simulated round to view performance feedback.
              </div>
            ) : (
              <div className="space-y-3">
                {mockSessions.map((session, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-mono">
                    <div className="flex justify-between font-bold text-white">
                      <span>{session.companyName}</span>
                      <span className="text-indigo-400 font-extrabold">{session.score}%</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{session.round} • {session.date}</p>
                    <p className="text-slate-300 text-[11px] mt-2 italic line-clamp-2">
                      "{session.feedbackSummary}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('mock-interview')}
            className="w-full py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Bot className="w-4 h-4" />
            <span>Launch New Simulated Round</span>
          </button>
        </div>

      </div>

      {/* SAVED & UPCOMING DRIVES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Saved Companies */}
        <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-white flex items-center gap-2 font-sans">
              <Building2 className="w-5 h-5 text-indigo-400" />
              My Saved Companies ({savedCompanies.length})
            </h2>
            <button
              onClick={() => onNavigate('companies')}
              className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300"
            >
              Browse All
            </button>
          </div>

          <div className="space-y-2.5">
            {savedCompanies.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectCompany(c)}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">{c.ctcRange} • {c.experienceCount}+ candidate logs</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Drives for Batch */}
        <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-white flex items-center gap-2 font-sans">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              Scheduled Drives for Batch {currentBatch}
            </h2>
            <button
              onClick={() => onNavigate('drives')}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
            >
              View Calendar
            </button>
          </div>

          <div className="space-y-2.5">
            {batchDrives.slice(0, 3).map(drive => (
              <div
                key={drive.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{drive.companyName}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">{drive.role} • CTC: {drive.ctc}</p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-indigo-400">{drive.driveDate}</span>
                  <span className="block text-[10px] text-slate-500">Closes: {drive.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SAVED QUESTIONS & REVISION LIST */}
      {savedQuestions.length > 0 && (
        <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl space-y-4">
          <h2 className="font-extrabold text-base text-white flex items-center gap-2 font-sans">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            Bookmarked Revision Vault ({savedQuestions.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedQuestions.map(q => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded">
                      {q.companyId}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {q.question}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
