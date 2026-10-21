import React from 'react';
import { 
  ArrowRight, 
  Briefcase, 
  Building2, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  Users, 
  ChevronRight, 
  Star, 
  Bot, 
  Clock, 
  GraduationCap, 
  ShieldCheck, 
  Search, 
  ArrowUpRight, 
  MapPin,
  Sliders,
  AlertTriangle
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

  // Student reviews
  const successStories = [
    {
      name: 'Aditya Verma',
      college: 'SRM Institute of Science & Tech',
      company: 'HCLTech',
      role: 'Software Engineer (GET)',
      batch: '2026 Batch',
      package: '₹8.5 LPA',
      quote: 'The HCLTech specific questions on DBMS and the simulated mock interview gave me the exact confidence needed. The interviewer asked the exact linked-list cycle question I practiced here.'
    },
    {
      name: 'Pooja Sundaram',
      college: 'Anna University',
      company: 'TCS',
      role: 'TCS Digital Engineer',
      batch: '2026 Batch',
      package: '₹7.2 LPA',
      quote: 'PlacePrep helped me focus on modern cloud and microservice questions instead of outdated syntax. Cleared both technical and managerial rounds on day one.'
    },
    {
      name: 'Kunal Deshmukh',
      college: 'Pune Institute of Computer Tech',
      company: 'Deloitte',
      role: 'Analyst - Technology Consulting',
      batch: '2026 Batch',
      package: '₹11.5 LPA',
      quote: 'The managerial STAR framework practice from PlacePrep sharpened my scenario explanations. The partner round was completely focused on conflict resolution, exactly as prepared.'
    }
  ];

  return (
    <div className="space-y-16 py-8">
      
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="surface-panel p-8 sm:p-12 border-slate-200/90 relative overflow-hidden bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-3xl">
            
            {/* Batch Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Batch of {currentBatch} Recruitment Season Active</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Standardized campus placement preparation & drive management.
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Direct company interview pipelines, automated academic eligibility verification, conflict-free scheduling, and verified questions for university students.
            </p>

            {/* Primary Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('drives')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-xs transition-colors"
              >
                <span>View Upcoming Drives</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('companies')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-sm shadow-xs transition-colors"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Explore Companies</span>
              </button>

              <button
                onClick={() => onNavigate('mock-interview')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 text-sm font-medium transition-colors"
              >
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>Start AI Mock Interview</span>
              </button>
            </div>

          </div>

          {/* Telemetry Strip inside Hero */}
          <div className="mt-10 pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <div className="text-2xl font-bold text-slate-900 font-sans">{companies.length}</div>
              <div className="text-xs text-slate-500">Verified Recruiters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 font-sans">{drives.length}</div>
              <div className="text-xs text-slate-500">Upcoming Campus Drives</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 font-sans">{questions.length}+</div>
              <div className="text-xs text-slate-500">Interview Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 font-sans">100%</div>
              <div className="text-xs text-slate-500">Conflict Schedule Protection</div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 1: CONFIRMED PLACEMENT DRIVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upcoming Placement Drives</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified campus schedules, reporting timings, venue details, and registration passes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('drives')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>All Placement Drives</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drives.slice(0, 2).map((drive) => {
            const isEligible = drive.eligibleBatches?.includes(currentBatch);
            return (
              <div
                key={drive.id}
                className="surface-card p-5 surface-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-base text-slate-900">{drive.companyName}</h3>
                      <p className="text-xs text-slate-500">{drive.role}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {drive.ctc}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block font-medium">DRIVE DATE</span>
                      <span className="font-semibold text-slate-800">{drive.driveDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">REPORTING TIME</span>
                      <span className="font-semibold text-slate-800">{drive.reportingTime || '09:00 AM'}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{drive.venue || 'Campus Auditorium'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[11px] font-medium ${
                    isEligible ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200' : 'text-slate-500'
                  }`}>
                    {isEligible ? `Batch ${currentBatch} Eligible` : `Batches: ${drive.eligibleBatches.join(', ')}`}
                  </span>

                  <button
                    onClick={() => onNavigate('drives')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>View Guidelines & Register</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: POPULAR RECRUITERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Recruiter Hubs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore recruitment patterns, selection rounds, and company-specific question archives.
            </p>
          </div>
          <button
            onClick={() => onNavigate('companies')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Recruiters</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

      {/* SECTION 3: HIGH-YIELD QUESTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="surface-card p-6 border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Frequently Asked Interview Questions</h2>
              <p className="text-xs text-slate-500">
                Ranked by recurrence in recent university placement interviews.
              </p>
            </div>
            <button
              onClick={() => onNavigate('prep')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Browse All Questions →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topQuestions.map((q) => {
              const matchedCompany = companies.find(c => c.id === q.companyId);
              return (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion(q)}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 hover:text-indigo-600">
                        {q.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{matchedCompany?.name || 'Recruiter'}</span>
                      <span>•</span>
                      <span>{q.topic}</span>
                      <span>•</span>
                      <span className="capitalize">{q.round} Round</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {q.difficulty}
                    </span>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                      Solve →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: PLATFORM WORKFLOW MODULES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Placement Support Modules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end tooling designed for both candidate preparation and TPO coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="surface-card p-6 space-y-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-slate-900">Automated Eligibility Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time audit of student CGPA, 10th/12th percentages, active backlogs, and branch criteria before application registration.
            </p>
            <button
              onClick={() => onNavigate('drives')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
            >
              <span>Test Eligibility Checker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="surface-card p-6 space-y-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 w-fit border border-amber-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-slate-900">Schedule Conflict Radar</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects overlapping interview slots and campus assessments across recruiters to prevent student double-booking.
            </p>
            <button
              onClick={() => onNavigate('drives')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
            >
              <span>View Conflict Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="surface-card p-6 space-y-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 w-fit border border-emerald-100">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-slate-900">AI Simulated Mock Interviews</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Realistic technical and managerial interview sessions with immediate accuracy scoring, depth analysis, and STAR feedback.
            </p>
            <button
              onClick={() => onNavigate('mock-interview')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
            >
              <span>Launch Mock Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: STUDENT SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Placement Success Stories</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified candidate reports from recent campus recruitment rounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {successStories.map((s, idx) => (
            <div key={idx} className="surface-card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">{s.name}</h4>
                    <p className="text-xs text-slate-500">{s.college}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {s.package}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-700">
                  {s.company} — <span className="text-slate-500 font-normal">{s.role}</span>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "{s.quote}"
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                {s.batch} Recruited
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
