import React, { useState, useEffect } from 'react';
import {
  School,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Search,
  Filter,
  FileText,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Upload,
  Download,
  ExternalLink,
  Code2,
  Briefcase,
  HelpCircle,
  FileCheck,
  CheckSquare,
  Flame,
  Plus
} from 'lucide-react';
import {
  getCurrentUser,
  getGraduationBatch,
  getCrtSessions,
  getStudentCrtAttendance,
  getClassAttendance,
  getResumeStatus,
  updateResumeStatus,
  getStudentRounds,
  getHackathons,
  getInternships,
  getOffCampusCompanies,
  getUpcomingDrives,
  getInterviewQuestions,
  broadcastPushNotification
} from '../services/storage';
import PortalModuleCards from '../components/PortalModuleCards';
import DailyAttendancePortalView from '../components/attendance/DailyAttendancePortalView';
import CrtAttendancePortalView from '../components/attendance/CrtAttendancePortalView';
import CsvDataImporterModal from '../components/data/CsvDataImporterModal';
import UserProfileMenu from '../components/UserProfileMenu';

export default function InstitutePortalPage({ onNavigate, onSelectCompany, onSelectQuestion }) {
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState(currentUser.role === 'student' ? 'upcoming-drives' : 'student-data'); 
  // 'student-data', 'upcoming-drives', 'question-bank', 'crt-attendance', 'class-attendance', 'resume-ats', 'round-details', 'hackathons', 'internships', 'off-campus'
  
  const studentBatch = getGraduationBatch();
  const isFinalYear = studentBatch === '2025' || studentBatch === '2026';

  // Datasets from storage
  const [crtSessions, setCrtSessions] = useState(getCrtSessions());
  const [studentCrt, setStudentCrt] = useState(getStudentCrtAttendance());
  const [classAttendance, setClassAttendance] = useState(getClassAttendance());
  const [resumeStatus, setResumeStatus] = useState(getResumeStatus());
  const [studentRounds, setStudentRounds] = useState(getStudentRounds());
  const [hackathons, setHackathons] = useState(getHackathons());
  const [internships, setInternships] = useState(getInternships());
  const [offCampusCompanies, setOffCampusCompanies] = useState(getOffCampusCompanies());
  const [upcomingDrives, setUpcomingDrives] = useState(getUpcomingDrives());
  const [questions, setQuestions] = useState(getInterviewQuestions());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState('All');

  // Resume Simulator State
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState('');

  // Student Registration Modal Form State
  const [isRegisterStudentModalOpen, setIsRegisterStudentModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvSuccessNotice, setCsvSuccessNotice] = useState(null);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    branch: 'Computer Science and Engineering',
    batch: '2028',
    cgpa: '8.5'
  });
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState('');

  const handleRegisterStudent = (e) => {
    e.preventDefault();
    setRegistrationSuccessMsg(`Student ${newStudentForm.name} (${newStudentForm.rollNumber}) registered successfully in Institute records!`);
    setIsRegisterStudentModalOpen(false);
    setTimeout(() => setRegistrationSuccessMsg(''), 5000);
  };

  const handleAnalyzeResume = () => {
    setIsAnalyzingResume(true);
    setTimeout(() => {
      const updated = updateResumeStatus({
        atsScore: 91,
        verdict: 'Excellent - High Match for Tech Roles',
        verificationStatus: 'Verified by TPO Cell',
        matchedKeywords: [
          'Java', 'Spring Boot', 'REST APIs', 'SQL', 'Data Structures & Algorithms',
          'Microservices', 'Git', 'Maven', 'B-Tree Indexing', 'Docker', 'AWS'
        ],
        missingKeywords: ['CI/CD Pipelines']
      });
      setResumeStatus(updated);
      setIsAnalyzingResume(false);
      setResumeSuccessMsg('ATS Analysis completed! Resume score increased to 91/100.');
      setTimeout(() => setResumeSuccessMsg(''), 4000);
    }, 1200);
  };

  const navTabs = [
    { id: 'student-data', label: 'Student Data', icon: Users, badge: 'Profile', roles: ['teacher', 'hod'] },
    { id: 'upcoming-drives', label: 'Upcoming Drives', icon: Briefcase, badge: `${upcomingDrives.length}` },
    { id: 'question-bank', label: 'Question Bank', icon: HelpCircle },
    { id: 'crt-attendance', label: 'CRT Attendance', icon: CheckSquare, badge: `${studentCrt.percentage}%` },
    { id: 'class-attendance', label: 'Class Attendance', icon: BookOpen },
    { id: 'resume-ats', label: 'Resume ATS Status', icon: FileCheck, badge: `${resumeStatus.atsScore}/100`, roles: ['student'] },
    { id: 'round-details', label: 'Round Details', icon: Layers, badge: 'Live' },
    { id: 'hackathons', label: 'Hackathons', icon: Code2 },
    { id: 'internships', label: 'Internships', icon: Award },
    { id: 'off-campus', label: 'Off-Campus (Final Year)', icon: ExternalLink, isSpecial: true }
  ];
  const visibleNavTabs = navTabs.filter((tab) => !tab.roles || tab.roles.includes(currentUser.role || 'student'));

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439] py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Top Banner & Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#111439] via-[#1A1E4F] to-[#282F74] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <School className="w-3.5 h-3.5" />
                <span>Institute Portal • Teacher, HOD, Students</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Academic & Training Operations Hub
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
                Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.role?.toUpperCase() || 'STUDENT'}) • Batch: <strong className="text-amber-300">{studentBatch}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRegisterStudentModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Student</span>
              </button>
              <button
                onClick={() => onNavigate('gateway')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Switch Portal</span>
              </button>
              <UserProfileMenu onNavigate={onNavigate} theme="dark" />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-800/60 text-xs">
            <div>
              <span className="text-indigo-300 block">CRT Attendance:</span>
              <span className={`font-black text-base ${studentCrt.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {studentCrt.percentage}% ({studentCrt.percentage >= 75 ? 'Eligible' : 'Warning'})
              </span>
            </div>
            <div>
              <span className="text-indigo-300 block">Class Attendance:</span>
              <span className="font-black text-base text-white">86.8% Average</span>
            </div>
            <div>
              <span className="text-indigo-300 block">Resume ATS Score:</span>
              <span className="font-black text-base text-emerald-400">{resumeStatus.atsScore} / 100</span>
            </div>
            <div>
              <span className="text-indigo-300 block">Active Drives:</span>
              <span className="font-black text-base text-amber-300">{upcomingDrives.length} Verified</span>
            </div>
          </div>
        </div>

        {registrationSuccessMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{registrationSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Image-first role-aware workspace cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <PortalModuleCards items={visibleNavTabs} activeId={activeTab} onSelect={setActiveTab} tone="indigo" />
      </div>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto">
        
        {/* TAB 1: STUDENT DATA */}
        {activeTab === 'student-data' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-xl">
                  {currentUser.name ? currentUser.name.charAt(0) : 'P'}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{currentUser.name}</h3>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase inline-block mt-1">
                    Roll: {currentUser.rollNumber || '2024/CSE/084'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">College:</span>
                  <span className="font-semibold text-slate-700">{currentUser.college || 'Delhi Technological University (DTU)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Branch:</span>
                  <span className="font-semibold text-slate-700">{currentUser.branch || 'Computer Science & Engineering'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Graduation Batch:</span>
                  <span className="font-bold text-indigo-600">{studentBatch}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Current CGPA:</span>
                  <span className="font-extrabold text-emerald-600">8.64 / 10.0</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Active Backlogs:</span>
                  <span className="font-bold text-slate-700">0 (Clear Standing)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">CRT Status:</span>
                  <span className="font-bold text-emerald-600">Eligible (87.5%)</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('academic-records')}
                className="w-full mt-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Semester Marksheets</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className="w-full mt-2.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-indigo-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Open Superset Student Profile</span>
              </button>
            </div>

            {/* Quick Summary Panels */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Registration & CSV Import Banner */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">New Student Enrollment & .CSV Data Ingestion</h4>
                  <p className="text-xs text-slate-600 mt-1">Batch import candidate rosters via .CSV or register candidates to verify drive credentials.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsCsvModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import .CSV</span>
                  </button>
                  <button
                    onClick={() => setIsRegisterStudentModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    Register Form
                  </button>
                </div>
              </div>

              {csvSuccessNotice && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{csvSuccessNotice}</span>
                </div>
              )}

              {/* Attendance & Training Checklist */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm mb-4">Mandatory Institute Pre-Requisites for Campus Placement</h4>
                
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <span className="font-bold text-slate-800 block">Campus Recruitment Training (CRT)</span>
                        <span className="text-slate-500">Requirement: Minimum 75% attendance in mock sessions.</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      87.5% - Cleared
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <span className="font-bold text-slate-800 block">Classroom Academic Attendance</span>
                        <span className="text-slate-500">Requirement: Minimum 75% per registered subject.</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      86.8% - Cleared
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <span className="font-bold text-slate-800 block">ATS Resume Verification</span>
                        <span className="text-slate-500">Requirement: Verified by Department Placement Coordinator.</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Score: 88/100
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: UPCOMING DRIVES (STUDENTS) */}
        {activeTab === 'upcoming-drives' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Upcoming Campus Recruitment Drives</h3>
                <p className="text-xs text-slate-500">Filtered for your batch ({studentBatch}) and academic branch ({currentUser.branch || 'CSE'}).</p>
              </div>
              <button
                onClick={() => onNavigate('drives')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <span>View Full Drive Calendar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingDrives.map(drive => {
                const isBatchEligible = drive.eligibleBatches?.includes(studentBatch);
                return (
                  <div
                    key={drive.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-xs text-slate-900">{drive.companyName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isBatchEligible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isBatchEligible ? 'Eligible for You' : 'Batch Ineligible'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base mb-1">{drive.role}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-4">
                        <span>CTC: {drive.ctc}</span>
                        <span>•</span>
                        <span className="text-slate-500 font-normal">Date: {drive.driveDate}</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 mb-4">
                        <div className="flex justify-between text-slate-500">
                          <span>Min CGPA:</span>
                          <span className="font-semibold text-slate-800">{drive.criteria?.cgpa || '6.5'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Batches:</span>
                          <span className="font-semibold text-slate-800">{drive.eligibleBatches?.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCompany && onSelectCompany({ id: drive.companyId, name: drive.companyName })}
                      className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition"
                    >
                      Prepare for {drive.companyName}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: QUESTION BANK (STUDENTS) */}
        {activeTab === 'question-bank' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Student Technical & Aptitude Question Bank</h3>
                <p className="text-xs text-slate-500">Curated high-yield interview questions verified across top campus recruiters.</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search JVM, SQL, Streams..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => onNavigate('prep')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                >
                  Full Hub
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions
                .filter(q => !searchQuery || q.question.toLowerCase().includes(searchQuery.toLowerCase()) || q.category.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 8)
                .map(q => (
                  <div
                    key={q.id}
                    onClick={() => onSelectQuestion && onSelectQuestion(q)}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                            {q.companyId}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            {q.category}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {q.frequencyScore}% freq
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                      <span>Practice Answer</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 4: CRT ATTENDANCE (Pre-Placement Training & Eligibility) */}
        {activeTab === 'crt-attendance' && (
          <CrtAttendancePortalView onNavigate={onNavigate} />
        )}

        {/* TAB 5: CLASS ATTENDANCE (Teacher & HOD Daily Class Attendance Portal) */}
        {activeTab === 'class-attendance' && (
          <DailyAttendancePortalView onNavigate={onNavigate} />
        )}

        {/* TAB 6: RESUME STATUS (ATS) */}
        {activeTab === 'resume-ats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {resumeStatus.verificationStatus}
                    </span>
                    <span className="text-xs text-slate-400">File: {resumeStatus.fileName}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">ATS Resume Evaluation & Keyword Auditor</h3>
                </div>

                <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                  <div className="text-right">
                    <span className="text-xs text-emerald-600 block font-semibold">Calculated ATS Score:</span>
                    <span className="text-3xl font-black text-emerald-700">{resumeStatus.atsScore} / 100</span>
                  </div>
                </div>
              </div>

              {resumeSuccessMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{resumeSuccessMsg}</span>
                </div>
              )}

              {/* Keyword Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Keywords Found ({resumeStatus.matchedKeywords.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeStatus.matchedKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 font-semibold text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Recommended Keywords to Add ({resumeStatus.missingKeywords.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeStatus.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-100/70 text-rose-800 font-semibold text-xs">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* TPO Feedback note */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 mb-8 text-xs text-indigo-900">
                <span className="font-bold block mb-1">TPO Reviewer Notes:</span>
                <p className="italic">"{resumeStatus.tpoFeedback}"</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzingResume}
                  className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAnalyzingResume ? 'Re-Running ATS Parser...' : 'Re-Run ATS Audit'}</span>
                </button>
                <button
                  onClick={() => alert('Resume template downloaded.')}
                  className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Optimized IIT/NIT LaTeX Template</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ROUND DETAILS (STUDENT LIVE TRACKER) */}
        {activeTab === 'round-details' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-1">Live Round Details & Interview Stage Tracker</h3>
              <p className="text-xs text-slate-500 mb-6">Track your real-time shortlisting status across active campus recruitment rounds.</p>

              <div className="space-y-6">
                {studentRounds.map((app, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
                      <div>
                        <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-bold uppercase">
                          {app.companyName}
                        </span>
                        <h4 className="font-black text-slate-900 text-lg mt-1">{app.role}</h4>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                        {app.currentStage}
                      </span>
                    </div>

                    {/* Step-by-step round progression */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      {app.stages.map((st, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl border ${
                            st.status === 'Cleared'
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                              : st.status === 'Scheduled'
                              ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">{st.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              st.status === 'Cleared' ? 'bg-emerald-200 text-emerald-900' :
                              st.status === 'Scheduled' ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {st.status}
                            </span>
                          </div>

                          {st.score && <p className="font-bold text-xs text-emerald-700">Score: {st.score}</p>}
                          {st.slot && <p className="font-semibold text-indigo-700">{st.slot}</p>}
                          {st.meetingLink && (
                            <a
                              href={st.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                            >
                              <span>Join Interview Room</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: UPCOMING HACKATHONS */}
        {activeTab === 'hackathons' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-1">National & Campus Hackathons</h3>
              <p className="text-xs text-slate-500 mb-6">Build real-world projects, win cash prizes, and secure direct PPI/PPO interview calls.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hackathons.map(hack => (
                  <div key={hack.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                          {hack.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">Deadline: {hack.registrationDeadline}</span>
                      </div>

                      <h4 className="font-black text-slate-900 text-base mb-1">{hack.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">{hack.organizer}</p>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Prize Pool:</span>
                          <span className="font-bold text-emerald-600">{hack.prizePool}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Team Size:</span>
                          <span className="font-semibold text-slate-800">{hack.teamSize}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={hack.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Register for Hackathon</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: UPCOMING INTERNSHIPS */}
        {activeTab === 'internships' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-1">Corporate Summer & Winter Internships</h3>
              <p className="text-xs text-slate-500 mb-6">Gain industry experience with high Pre-Placement Offer (PPO) conversion rates.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {internships.map(intern => (
                  <div key={intern.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-xs text-slate-900">{intern.companyName}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {intern.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mb-1">{intern.role}</h4>
                      <p className="text-xs font-black text-emerald-600 mb-3">{intern.stipend}</p>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duration:</span>
                          <span className="font-semibold text-slate-800">{intern.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Location:</span>
                          <span className="font-semibold text-slate-800">{intern.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">PPO Rate:</span>
                          <span className="font-bold text-indigo-600">High (&gt;85%)</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={intern.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Apply for Internship</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: OFF-CAMPUS COMPANIES (ONLY FOR FINAL YEAR STUDENTS) */}
        {activeTab === 'off-campus' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                      Only for Final Year Students
                    </span>
                    <span className="text-xs text-slate-500">Batches 2025 & 2026</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Verified Off-Campus Hiring Drives</h3>
                </div>

                <div className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isFinalYear ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {isFinalYear ? '✅ You are Eligible to Apply' : `ℹ️ Viewing in Advisory Mode (Batch ${studentBatch})`}
                </div>
              </div>

              {!isFinalYear && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Off-Campus Policy Restriction:</span>
                    <span>These opportunities are strictly reserved for graduating/final-year batches. Pre-final year students can review syllabus and pattern to prepare ahead.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offCampusCompanies.map(comp => (
                  <div key={comp.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-xs text-slate-900">{comp.companyName}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Final Year Only
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mb-1">{comp.role}</h4>
                      <p className="text-xs font-bold text-emerald-600 mb-3">{comp.ctc}</p>

                      <p className="text-xs text-slate-600 mb-4 leading-relaxed">{comp.description}</p>

                      <div className="space-y-1 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-100 mb-4">
                        <div className="flex justify-between">
                          <span>Exam Date:</span>
                          <span className="font-semibold text-slate-800">{comp.examDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deadline:</span>
                          <span className="font-semibold text-slate-800">{comp.applicationDeadline}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={comp.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full py-2.5 rounded-xl font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm ${
                        isFinalYear
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      <span>{isFinalYear ? 'Apply on Official Portal' : 'View Drive Syllabus'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* STUDENT REGISTRATION MODAL */}
      {isRegisterStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">Register New Student</h3>
            <p className="text-xs text-slate-500 mb-4">Add candidate to university database for automated placement eligibility verification.</p>

            <form onSubmit={handleRegisterStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">College Email Address *</label>
                <input
                  type="email"
                  required
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  placeholder="student@dtu.ac.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">University Roll No *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.rollNumber}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, rollNumber: e.target.value })}
                    placeholder="2024/CSE/102"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Graduation Batch *</label>
                  <select
                    value={newStudentForm.batch}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, batch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="2025">2025 (Final Year)</option>
                    <option value="2026">2026 (Final Year)</option>
                    <option value="2027">2027 (Pre-Final)</option>
                    <option value="2028">2028 Batch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch</label>
                  <input
                    type="text"
                    value={newStudentForm.branch}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, branch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStudentForm.cgpa}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, cgpa: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRegisterStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Data Ingestion Modal */}
      <CsvDataImporterModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={(records) => {
          setCsvSuccessNotice(`Successfully ingested ${records.length} candidate records from CSV into Institute system.`);
          setTimeout(() => setCsvSuccessNotice(null), 6000);
        }}
      />

    </div>
  );
}
