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
  AlertTriangle,
  MapPin
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
  getCompanies,
  getStudentApplications
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
  const myApplications = getStudentApplications();

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
      
      {/* Student Welcome Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
            {user?.name ? user.name[0].toUpperCase() : 'P'}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
                Batch {currentBatch} Candidate
              </span>
            </div>

            <p className="text-xs sm:text-sm text-indigo-200 mt-1">
              {user?.college || 'College of Engineering'} • {user?.branch || 'Computer Science'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-indigo-100 border border-white/15">
                Target Companies: {savedCompanies.map(c => c.name).join(', ') || 'HCLTech, TCS'}
              </span>
            </div>
          </div>
        </div>

        {/* Continue Preparation Resume CTA */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-white shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
            Resume Active Prep
          </span>
          <p className="text-sm font-extrabold text-white">
            Continue HCLTech Technical Round
          </p>
          <p className="text-[11px] text-indigo-200 mt-0.5 mb-3">
            Next: Linked List cycle detection & SQL Joins
          </p>
          <button
            onClick={() => {
              const hcl = companies.find(c => c.id === 'hcltech');
              if (hcl) onSelectCompany(hcl);
            }}
            className="w-full py-2 px-4 rounded-xl bg-indigo-600 text-white font-extrabold text-xs hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>Continue Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Progress Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Practiced</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{practicedQuestions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Questions completed</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saved</span>
            <Bookmark className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{savedQuestions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Bookmarked questions</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Revision List</span>
            <RotateCcw className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">{revisionQuestions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Flagged for revision</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">AI Mock Score</span>
            <Bot className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            {mockSessions.length > 0 ? `${mockSessions[0].score}%` : 'N/A'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Latest simulated interview</p>
        </div>
      </div>

      {/* SECTION: PREPARATION ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Category Mastery & Strengths */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Preparation Analytics & Progress
            </h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Overall Completion: {progressPercent}%
            </span>
          </div>

          {/* Technical vs HR vs Managerial Progress */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Technical Interview Practice (DSA, OOP, SQL, OS)</span>
                <span className="text-indigo-600">{technicalCount} Practiced</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(technicalCount * 25, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>HR Round Preparation (Intro, Culture, Motivation)</span>
                <span className="text-emerald-600">{hrCount} Practiced</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(hrCount * 33, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Managerial Round (Scenarios, Conflict, Leadership)</span>
                <span className="text-purple-600">{managerialCount} Practiced</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(managerialCount * 35, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Strong vs Weak Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="font-extrabold text-emerald-900 block mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Strong Topics (Verified Accurate):
              </span>
              <ul className="space-y-1.5 text-emerald-800 font-medium">
                <li>• DBMS Normalization & SQL Queries (88% Accuracy)</li>
                <li>• Floyd Cycle Detection & Linked Lists (85% Accuracy)</li>
                <li>• Self Introduction Present-Past-Future Structure</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <span className="font-extrabold text-amber-900 block mb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" /> Focus Needed (Recommended Practice):
              </span>
              <ul className="space-y-1.5 text-amber-800 font-medium">
                <li>• Deadlock Coffman Conditions in OS</li>
                <li>• Quantifying results in STAR behavioral responses</li>
                <li>• Dynamic Programming & Sliding Window optimizations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Mock Interview Session History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-indigo-600" />
              AI Mock Session History
            </h2>

            {mockSessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No mock sessions taken yet.</p>
            ) : (
              <div className="space-y-3">
                {mockSessions.map((session, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{session.companyName}</span>
                      <span className="text-indigo-600 font-extrabold">{session.score}%</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{session.round} • {session.date}</p>
                    <p className="text-slate-600 text-[11px] mt-2 italic line-clamp-2">
                      "{session.feedbackSummary}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('mock-interview')}
            className="w-full py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>Launch New Simulated Interview</span>
          </button>
        </div>

      </div>

      {/* SAVED & UPCOMING DRIVES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Saved Companies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              My Saved Companies ({savedCompanies.length})
            </h2>
            <button
              onClick={() => onNavigate('companies')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Browse All
            </button>
          </div>

          <div className="space-y-2.5">
            {savedCompanies.map(c => (
              <div
                key={c.id}
                onClick={() => onSelectCompany(c)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{c.ctcRange} • {c.experienceCount}+ experiences</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Drives for Batch */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Upcoming Drives for Batch {currentBatch}
            </h2>
            <button
              onClick={() => onNavigate('drives')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              View Calendar
            </button>
          </div>

          <div className="space-y-2.5">
            {batchDrives.slice(0, 3).map(drive => (
              <div
                key={drive.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{drive.companyName}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{drive.role} • CTC: {drive.ctc}</p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-indigo-600">{drive.driveDate}</span>
                  <span className="block text-[10px] text-slate-400">Deadline: {drive.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MY REGISTERED PLACEMENT DRIVES & INTERVIEW STATUS */}
      {myApplications.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                My Registered Placement Drives & Scheduled Passes ({myApplications.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active candidate registration passes, scheduled interview stages, and reporting guidelines.
              </p>
            </div>
            <button
              onClick={() => onNavigate('drives')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Manage in Placement Suite
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myApplications.map((app) => (
              <div
                key={app.applicationId}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{app.companyName}</h3>
                    <p className="text-xs text-slate-600">{app.role}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    app.status === 'INTERVIEW_SCHEDULED'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>

                {app.conflictFlagged && (
                  <div className="bg-amber-100/70 border border-amber-300 p-2.5 rounded-lg text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Schedule Conflict: Overlaps with another interview round.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-semibold">STAGE</span>
                    <span className="font-bold text-slate-800">{app.currentRound || 'Technical Round'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">SCHEDULED SLOT</span>
                    <span className="font-bold text-indigo-600">{app.scheduledDate} ({app.scheduledTime || '10:00 AM'})</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{app.venue || 'Campus Auditorium Hall A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAVED QUESTIONS & REVISION LIST */}
      {savedQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-600" />
            Bookmarked Revision Questions ({savedQuestions.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedQuestions.map(q => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded">
                      {q.companyId}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                    {q.question}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
