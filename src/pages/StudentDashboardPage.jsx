import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
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
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { UserApi, CompanyApi, DriveApi, QuestionApi, ApplicationApi, MockSessionApi } from '../services/api';
import { getCurrentUser, getGraduationBatch } from '../services/storage';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function StudentDashboardPage({ onNavigate, onSelectCompany, onSelectQuestion }) {
  const [user, setUser] = useState(getCurrentUser());
  const currentBatch = getGraduationBatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [mockSessions, setMockSessions] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    savedCount: 0,
    practicedCount: 0,
    revisionCount: 0,
    savedCompaniesCount: 0
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch from API
      const [compsRes, drivesRes, questionsRes, userRes] = await Promise.all([
        CompanyApi.getAll(currentBatch).catch(() => []),
        DriveApi.getAll(currentBatch).catch(() => []),
        QuestionApi.getAll().catch(() => []),
        UserApi.getMe().catch(() => null)
      ]);

      setCompanies(compsRes || []);
      setDrives(drivesRes || []);
      setQuestions(questionsRes || []);

      if (userRes) {
        setUser(userRes);
        setDashboardMetrics({
          savedCount: userRes.savedQuestionIds?.length || 0,
          practicedCount: userRes.practicedQuestionIds?.length || 0,
          revisionCount: userRes.revisionQuestionIds?.length || 0,
          savedCompaniesCount: userRes.savedCompanyIds?.length || 0
        });

        // Load applications & mock sessions for logged in student
        const [appsRes, mocksRes] = await Promise.all([
          ApplicationApi.getMyApplications().catch(() => []),
          MockSessionApi.getMySessions().catch(() => [])
        ]);
        setMyApplications(appsRes || []);
        setMockSessions(mocksRes || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Unable to load placement dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBatch]);

  // Derived metrics from genuine records
  const practicedIds = new Set(user?.practicedQuestionIds || []);
  const savedIds = new Set(user?.savedQuestionIds || []);
  const revisionIds = new Set(user?.revisionQuestionIds || []);
  const savedCompIds = new Set(user?.savedCompanyIds || []);

  const practicedQuestions = questions.filter(q => practicedIds.has(q.questionId || q.id));
  const savedQuestions = questions.filter(q => savedIds.has(q.questionId || q.id));
  const revisionQuestions = questions.filter(q => revisionIds.has(q.questionId || q.id));
  const targetCompanies = companies.filter(c => savedCompIds.has(c.companyId || c.id));

  // Category breakdown
  const technicalCount = practicedQuestions.filter(q => q.round === 'technical').length;
  const hrCount = practicedQuestions.filter(q => q.round === 'hr').length;
  const managerialCount = practicedQuestions.filter(q => q.round === 'managerial').length;

  // Transparent Placement Readiness Calculation Formula:
  // - Practiced Questions: up to 40 pts (4 pts per question, max 10)
  // - Target Companies Saved: up to 15 pts (5 pts per target company, max 3)
  // - Mock Interview Completed: up to 30 pts (based on latest mock score * 0.3)
  // - Applications Tracked: up to 15 pts (5 pts per active application, max 3)
  const questionPoints = Math.min(40, practicedQuestions.length * 4);
  const companyPoints = Math.min(15, targetCompanies.length * 5);
  const latestMockScore = mockSessions.length > 0 ? mockSessions[0].score : 0;
  const mockPoints = mockSessions.length > 0 ? Math.round(latestMockScore * 0.3) : 0;
  const applicationPoints = Math.min(15, myApplications.length * 5);

  const totalReadinessScore = questionPoints + companyPoints + mockPoints + applicationPoints;
  const hasPrepData = practicedQuestions.length > 0 || mockSessions.length > 0;

  // Upcoming eligible drives
  const eligibleDrives = drives.filter(d => !d.status?.toLowerCase().includes('closed')).slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-44 bg-slate-200 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          title="Dashboard Connection Issue"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Student Welcome Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 sm:p-10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600/90 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/20 shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <Badge variant="purple" size="sm">
                Batch {currentBatch} Candidate
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-indigo-200 mt-1">
              {user?.college || 'Engineering Institution'} • {user?.branch || 'Computer Science'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-indigo-100 border border-white/15">
                Target Companies: {targetCompanies.length > 0 ? targetCompanies.map(c => c.name).join(', ') : 'HCLTech, TCS, Infosys'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Card in Hero */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-white shrink-0 md:max-w-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
            Active Focus
          </span>
          <p className="text-sm font-extrabold text-white">
            Targeted Campus Preparation
          </p>
          <p className="text-[11px] text-indigo-200 mt-0.5 mb-3">
            {practicedQuestions.length} questions completed • {revisionQuestions.length} in revision queue
          </p>
          <Button
            size="sm"
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => onNavigate('prep')}
            className="w-full"
          >
            Practice Next Question
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Practiced</span>
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          </div>
          <p className="text-2xl font-black text-[#0F172A]">{practicedQuestions.length}</p>
          <p className="text-[11px] text-[#64748B] mt-1 font-medium">Verified questions solved</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Bookmarked</span>
            <Bookmark className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <p className="text-2xl font-black text-[#4F46E5]">{savedQuestions.length}</p>
          <p className="text-[11px] text-[#64748B] mt-1 font-medium">Saved for deep study</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Revision Queue</span>
            <RotateCcw className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600">{revisionQuestions.length}</p>
          <p className="text-[11px] text-[#64748B] mt-1 font-medium">Flagged for active revision</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Mock Interview</span>
            <Bot className="w-4 h-4 text-[#D97706]" />
          </div>
          <p className="text-2xl font-black text-[#D97706]">
            {mockSessions.length > 0 ? `${mockSessions[0].score}%` : 'Not Taken'}
          </p>
          <p className="text-[11px] text-[#64748B] mt-1 font-medium">
            {mockSessions.length > 0 ? `${mockSessions.length} session(s) recorded` : 'Run simulated panel'}
          </p>
        </div>
      </div>

      {/* Main Section: Readiness Breakdown & Target Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Placement Readiness Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-[#0F172A] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#4F46E5]" />
                Placement Readiness Assessment
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Calculated from genuine student practice history, mock scores, and drive tracking.
              </p>
            </div>
            <Badge variant={totalReadinessScore >= 60 ? 'success' : 'warning'}>
              Readiness: {totalReadinessScore}%
            </Badge>
          </div>

          {hasPrepData ? (
            <div className="space-y-4">
              <ProgressBar
                label="Technical Interview Mastery (DSA, OOP, SQL, OS)"
                value={questionPoints}
                max={40}
                showLabel
                color="primary"
              />
              <ProgressBar
                label="Mock Interview Simulated Evaluation Score"
                value={mockPoints}
                max={30}
                showLabel
                color="warning"
              />
              <ProgressBar
                label="Target Recruiters Alignment"
                value={companyPoints}
                max={15}
                showLabel
                color="purple"
              />
              <ProgressBar
                label="Campus Placement Applications Tracked"
                value={applicationPoints}
                max={15}
                showLabel
                color="success"
              />

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-[#64748B] space-y-1">
                <span className="font-bold text-[#0F172A] block">Readiness Scoring Methodology:</span>
                <p>
                  Questions Practiced ({questionPoints}/40 pts) • Mock Interview Benchmark ({mockPoints}/30 pts) • Company Alignment ({companyPoints}/15 pts) • Application Tracking ({applicationPoints}/15 pts).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#4F46E5] mx-auto" />
              <h3 className="text-sm font-bold text-[#0F172A]">Start Your Preparation Journey</h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                No simulated numbers are manufactured. Solve your first question or launch a mock interview to establish your authentic placement readiness score.
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <Button size="sm" onClick={() => onNavigate('prep')}>
                  Explore Question Bank
                </Button>
                <Button size="sm" variant="outline" onClick={() => onNavigate('mock-interview')}>
                  Launch Mock Interview
                </Button>
              </div>
            </div>
          )}

          {/* Topics Breakdown Pill Row */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A] mb-2.5">Topic-Level Practice Distribution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-[#64748B] block">Technical Questions</span>
                <span className="text-base font-extrabold text-indigo-700">{technicalCount} Solved</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-[#64748B] block">HR Round Scenarios</span>
                <span className="text-base font-extrabold text-emerald-700">{hrCount} Solved</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-[#64748B] block">Managerial & Conflict</span>
                <span className="text-base font-extrabold text-purple-700">{managerialCount} Solved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Target Recruiters & Weekly Tasks */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="w-4 h-4 text-[#4F46E5]" />
                  Target Recruiters
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => onNavigate('companies')}>
                  View All
                </Button>
              </div>
              <CardDescription>
                Companies customized for Batch {currentBatch}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {companies.slice(0, 4).map((comp) => (
                <div
                  key={comp.id || comp.companyId}
                  onClick={() => onSelectCompany(comp)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {comp.logo ? (
                        <img src={comp.logo} alt={comp.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                        {comp.name}
                      </p>
                      <p className="text-[10px] text-[#64748B] truncate">{comp.tier}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Revision Queue Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  Due for Revision
                </CardTitle>
                <Badge variant="purple" size="sm">
                  {revisionQuestions.length} Items
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {revisionQuestions.length > 0 ? (
                <div className="space-y-2">
                  {revisionQuestions.slice(0, 3).map((q) => (
                    <div
                      key={q.id || q.questionId}
                      onClick={() => onSelectQuestion(q)}
                      className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <p className="text-xs font-bold text-[#0F172A] line-clamp-1">{q.question}</p>
                      <span className="text-[10px] text-[#64748B]">{q.category}</span>
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => onNavigate('revision')} className="w-full mt-2">
                    Open Revision List
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-[#64748B] text-center py-4">
                  No questions currently flagged for revision. Mark challenging questions while practicing to populate this list.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Bottom Section: Upcoming Eligible Placement Drives */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg text-[#0F172A] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#4F46E5]" />
              Confirmed Placement Drives for Batch {currentBatch}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Verified campus qualifier schedules and registration deadlines.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate('drives')}>
            View All Drives ({drives.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eligibleDrives.map((drive) => (
            <Card key={drive.id || drive.driveId} hover onClick={() => onNavigate('drives')}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base truncate">{drive.companyName}</CardTitle>
                  <Badge variant="success" size="sm">
                    {drive.status || 'Active'}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-1 font-semibold text-indigo-700">
                  {drive.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Date: {drive.driveDate}
                  </span>
                  <span className="font-bold text-[#0F172A]">{drive.ctc}</span>
                </div>
                <p className="text-[11px] text-[#64748B] line-clamp-1">
                  Eligible Batches: {drive.eligibleBatches?.join(', ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
