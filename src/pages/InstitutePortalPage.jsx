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
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  Upload,
  Download,
  ExternalLink,
  Code2,
  HelpCircle,
  FileCheck,
  CheckSquare,
  Flame,
  Plus,
  Briefcase,
  FileSpreadsheet,
  LogOut,
  UserCheck,
  Compass,
  Radio,
  RefreshCw
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
import { DriveApi, AttendanceApi, QuestionApi, UserApi, AuthApi } from '../services/api';
import SearchBar from '../components/ui/SearchBar';
import PortalModuleCards from '../components/PortalModuleCards';
import DailyAttendancePortalView from '../components/attendance/DailyAttendancePortalView';
import CrtAttendancePortalView from '../components/attendance/CrtAttendancePortalView';
import BulkImportModal from '../components/BulkImportModal';
import ReportsExporterPage from './ReportsExporterPage';
import CurriculumGovernanceView from '../components/curriculum/CurriculumGovernanceView';
import DsaPracticePage from './DsaPracticePage';
import { registerSingleStudent } from '../services/studentRegistrationService';
import UserProfileModal from '../components/profile/UserProfileModal';
import StudentGpsAttendanceWidget from '../components/attendance/StudentGpsAttendanceWidget';

export default function InstitutePortalPage({ onNavigate, onSelectCompany, onSelectQuestion }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser() || {});

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUser(getCurrentUser() || {});
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);
  const [activeTab, setActiveTab] = useState(() => {
    if (currentUser?.role === 'student') return 'upcoming-drives';
    if (currentUser?.role === 'hod') return 'curriculum-governance';
    return 'student-data';
  }); 
  // 'student-data', 'curriculum-governance', 'reports-exporter', 'upcoming-drives', 'question-bank', 'crt-attendance', 'class-attendance', 'resume-ats', 'round-details', 'hackathons', 'internships', 'off-campus'
  
  const studentBatch = getGraduationBatch() || '2028';
  const isFinalYear = studentBatch === '2025' || studentBatch === '2026';

  // Datasets from storage
  const [crtSessions, setCrtSessions] = useState(() => getCrtSessions() || []);
  const [studentCrt, setStudentCrt] = useState(() => getStudentCrtAttendance() || { percentage: 80 });
  const [classAttendance, setClassAttendance] = useState(() => getClassAttendance() || []);
  const [resumeStatus, setResumeStatus] = useState(() => getResumeStatus() || { atsScore: 85 });
  const [studentRounds, setStudentRounds] = useState(() => getStudentRounds() || []);
  const [hackathons, setHackathons] = useState(() => getHackathons() || []);
  const [internships, setInternships] = useState(() => getInternships() || []);
  const [offCampusCompanies, setOffCampusCompanies] = useState(() => getOffCampusCompanies() || []);
  const [upcomingDrives, setUpcomingDrives] = useState(() => getUpcomingDrives() || []);
  const [questions, setQuestions] = useState(() => getInterviewQuestions() || []);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [hackathonSearchQuery, setHackathonSearchQuery] = useState('');
  const [internshipSearchQuery, setInternshipSearchQuery] = useState('');
  const [offCampusSearchQuery, setOffCampusSearchQuery] = useState('');
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState('All');

  // Resume Simulator State
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState('');

  // Top-Right Profile & Backend Connection States
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isFullProfileModalOpen, setIsFullProfileModalOpen] = useState(false);

  // Reset scroll to top on tab change so SearchBar is directly visible
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (typeof document !== 'undefined') {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeTab]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [databaseUsers, setDatabaseUsers] = useState([]);

  const refreshDatabaseUsers = () => {
    if (AuthApi?.getAllUsers) {
      AuthApi.getAllUsers()
        .then((users) => {
          if (Array.isArray(users)) {
            setDatabaseUsers(users);
          }
        })
        .catch((err) => console.log('Backend users fetch note:', err?.message));
    }
  };

  // Sync with Spring Boot Backend (:8082)
  useEffect(() => {
    // 1. Fetch drives from Spring Boot
    if (DriveApi?.getAll) {
      DriveApi.getAll()
        .then((liveDrives) => {
          if (Array.isArray(liveDrives) && liveDrives.length > 0) {
            setUpcomingDrives(liveDrives);
            setIsBackendConnected(true);
          }
        })
        .catch((err) => console.log('Backend drives fallback to local:', err?.message));
    }

    // 2. Fetch CRT training sessions from Spring Boot
    if (AttendanceApi?.getCrtSessions) {
      AttendanceApi.getCrtSessions()
        .then((liveSessions) => {
          if (Array.isArray(liveSessions) && liveSessions.length > 0) {
            setCrtSessions(liveSessions);
            setIsBackendConnected(true);
          }
        })
        .catch((err) => console.log('Backend CRT fallback to local:', err?.message));
    }

    // 3. Fetch interview questions from Spring Boot
    if (QuestionApi?.getAll) {
      QuestionApi.getAll()
        .then((liveQuestions) => {
          if (Array.isArray(liveQuestions) && liveQuestions.length > 0) {
            setQuestions(liveQuestions);
            setIsBackendConnected(true);
          }
        })
        .catch((err) => console.log('Backend questions fallback to local:', err?.message));
    }

    // 4. Fetch registered database users from Spring Boot
    refreshDatabaseUsers();
  }, []);

  const getInitials = (name = 'User') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  };

  const handleSignOut = () => {
    localStorage.removeItem('placeprep_current_user');
    localStorage.removeItem('placeprep_portal_role');
    onNavigate('auth-portal');
  };

  // Smooth scroll handler on card selection
  const handleCardSelect = (tabId) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const target = document.getElementById('institute-feature-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Student Registration Modal Form State
  const [isRegisterStudentModalOpen, setIsRegisterStudentModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    branch: 'Computer Science and Engineering',
    batch: '2028',
    cgpa: '8.5'
  });
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState('');
  const [registrationErrorMsg, setRegistrationErrorMsg] = useState('');

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    setRegistrationErrorMsg('');

    // 1. Sync directly to Spring Boot backend database
    try {
      await AuthApi.register({
        name: newStudentForm.name,
        email: newStudentForm.email.trim().toLowerCase(),
        password: 'password123',
        college: currentUser?.college || 'Delhi Technological University (DTU)',
        branch: newStudentForm.branch,
        graduationBatch: newStudentForm.batch,
        role: 'student',
        rollNumber: newStudentForm.rollNumber
      });
    } catch (backendErr) {
      console.log('Spring Boot backend user sync note:', backendErr.message);
    }

    refreshDatabaseUsers();

    // 2. Also register in local storage / academic records
    const res = registerSingleStudent(newStudentForm, currentUser);
    if (res.success) {
      setRegistrationSuccessMsg(`Student ${newStudentForm.name} (${newStudentForm.rollNumber}) registered successfully in database & Institute records!`);
      setIsRegisterStudentModalOpen(false);
      setNewStudentForm({
        name: '',
        email: '',
        rollNumber: '',
        branch: 'Computer Science and Engineering',
        batch: '2028',
        cgpa: '8.5'
      });
      setTimeout(() => setRegistrationSuccessMsg(''), 5000);
    } else {
      setRegistrationErrorMsg(res.errors ? res.errors.join('. ') : 'Failed to register student.');
    }
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
    { id: 'curriculum-governance', label: 'Curriculum & Syllabus Governance', icon: GraduationCap, badge: 'Department Academic Progress', roles: ['hod'] },
    { id: 'reports-exporter', label: 'Reports Exporter', icon: FileSpreadsheet, badge: 'Excel/CSV', roles: ['teacher', 'hod'] },
    { id: 'upcoming-drives', label: 'Upcoming Drives', icon: Briefcase, badge: `${upcomingDrives?.length || 0}` },
    { id: 'question-bank', label: 'Question Bank', icon: HelpCircle },
    { id: 'dsa-studio', label: 'DSA & Coding Practice', icon: Code2, badge: 'Studio', roles: ['student'] },
    { id: 'crt-attendance', label: 'CRT Attendance', icon: CheckSquare, badge: `${studentCrt?.percentage ?? 80}%` },
    { id: 'class-attendance', label: 'Class Attendance', icon: BookOpen },
    { id: 'resume-ats', label: 'Resume ATS Status', icon: FileCheck, badge: `${resumeStatus?.atsScore || 85}/100`, roles: ['student'] },
    { id: 'round-details', label: 'Round Details', icon: Layers, badge: 'Live' },
    { id: 'hackathons', label: 'Hackathons', icon: Code2, excludedRoles: ['teacher', 'hod'] },
    { id: 'internships', label: 'Internships', icon: Award, excludedRoles: ['teacher', 'hod'] },
    { id: 'off-campus', label: 'Off-Campus (Final Year)', icon: ExternalLink, isSpecial: true, excludedRoles: ['teacher', 'hod'] }
  ];

  const userRole = currentUser?.role || 'student';
  const visibleNavTabs = navTabs.filter((tab) => {
    if (tab.excludedRoles && tab.excludedRoles.includes(userRole)) {
      return false;
    }
    if (tab.roles && !tab.roles.includes(userRole)) {
      return false;
    }
    return true;
  });

  // Guard activeTab against unauthorized/hidden tabs for current role
  useEffect(() => {
    const isAllowed = visibleNavTabs.some((tab) => tab.id === activeTab);
    if (!isAllowed && visibleNavTabs.length > 0) {
      setActiveTab(visibleNavTabs[0].id);
    }
  }, [userRole, visibleNavTabs, activeTab]);

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439] py-8 px-4 sm:px-6 lg:px-8">
      
      {/* 1. UPPER LEFT BACK BUTTON & SYSTEM STATUS */}
      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('gateway')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-900 font-bold text-xs shadow-xs transition cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Portals</span>
        </button>

        {/* Backend Connection Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-xs">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isBackendConnected ? 'Spring Boot Connected (:8082)' : 'Local Storage Mode'}</span>
        </div>
      </div>

      {/* 2. TOP BANNER & RIGHT-SIDE PROFILE DROPDOWN */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#111439] via-[#1A1E4F] to-[#282F74] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative">
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <School className="w-3.5 h-3.5" />
                <span>Institute Portal • {currentUser.role?.toUpperCase() || 'STUDENT'} Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Academic & Training Operations Hub
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
                Logged in as <strong className="text-white">{currentUser.name}</strong> • Role: <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-100 font-bold uppercase text-[11px]">{currentUser.role || 'STUDENT'}</span> • Batch: <strong className="text-amber-300">{studentBatch}</strong>
              </p>
            </div>

            {/* Right Side: Quick Action & Profile Component */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsRegisterStudentModalOpen(true)}
                className="hidden sm:flex px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition items-center gap-1.5 cursor-pointer border border-indigo-400/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Student</span>
              </button>
              {currentUser.role !== 'student' && (
                <button
                  type="button"
                  onClick={() => setIsBulkImportModalOpen(true)}
                  className="hidden sm:flex px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 shadow-md transition items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bulk Import</span>
                </button>
              )}

              {/* Dedicated Top-Right Profile Pill & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-2 pr-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition shadow-md group text-left cursor-pointer"
                  aria-label="User profile menu"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0 border border-white/20">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[130px]">{currentUser.name}</span>
                    </div>
                    <span className="text-[10px] text-indigo-300 font-semibold block truncate uppercase">
                      {currentUser.role || 'STUDENT'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-indigo-300 group-hover:text-white transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Popup (Non-clipped) */}
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 text-slate-900 text-xs animate-in fade-in zoom-in-95 duration-150">
                      {/* Header info */}
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                          {getInitials(currentUser.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                            {currentUser.role?.toUpperCase() || 'STUDENT'} Workspace
                          </span>
                        </div>
                      </div>

                      {/* Profile details */}
                      <div className="py-3 space-y-2 text-[11px] border-b border-slate-100">
                        <div className="flex justify-between text-slate-500">
                          <span>Institute:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[160px]">{currentUser.college || 'Delhi Technological University'}</span>
                        </div>
                        {currentUser.role === 'student' ? (
                          <>
                            <div className="flex justify-between text-slate-500">
                              <span>Roll Number:</span>
                              <span className="font-bold text-slate-800 font-mono">{currentUser.rollNumber || '2024/CSE/084'}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Branch & Batch:</span>
                              <span className="font-semibold text-slate-800">{currentUser.branch || 'CSE'} ({studentBatch || '2028'})</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Academic Standing:</span>
                              <span className="font-bold text-emerald-600">Active • 0 Backlogs</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-slate-500">
                              <span>Department:</span>
                              <span className="font-semibold text-slate-800">{currentUser.department || 'Computer Science & Engineering'}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Designation:</span>
                              <span className="font-semibold text-slate-800">{currentUser.designation || (currentUser.role === 'hod' ? 'Head of Department (HOD)' : 'Faculty & Class Incharge')}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); setIsFullProfileModalOpen(true); }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-bold transition text-left cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          <span>View Complete Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); onNavigate('gateway'); }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition text-left cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-emerald-600" />
                          <span>Switch Portal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); handleSignOut(); }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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

      {/* 3. MODULE CARDS WITH SMOOTH SCROLLING */}
      <div className="max-w-7xl mx-auto mb-8">
        <PortalModuleCards items={visibleNavTabs} activeId={activeTab} onSelect={handleCardSelect} tone="indigo" />
      </div>

      {/* 4. TAB CONTENTS WITH SCROLL TARGET ANCHOR */}
      <div id="institute-feature-content" className="max-w-7xl mx-auto scroll-mt-6">
        
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
                className="w-full mt-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>View Full Semester Marksheets</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Panels */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Registration Form Banner */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">New Student Enrollment & Data Ingestion</h4>
                  <p className="text-xs text-slate-600 mt-1">Register new candidates to verify credentials for on-campus and off-campus drive eligibility.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsRegisterStudentModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    Register Form
                  </button>
                  <button
                    onClick={() => setIsBulkImportModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Bulk Import (.xlsx / .csv)</span>
                  </button>
                </div>
              </div>

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

              {/* Enrolled Students & Database Users Table */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Registered Candidates in Database ({databaseUsers.length})</h4>
                    <p className="text-xs text-slate-500">Live records synced with Spring Boot MySQL database.</p>
                  </div>
                  <button
                    type="button"
                    onClick={refreshDatabaseUsers}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Refresh List
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px]">
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Roll No</th>
                        <th className="py-2.5 px-3">Branch & Batch</th>
                        <th className="py-2.5 px-3">Database Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {databaseUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>{user.name}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{user.email}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{user.rollNumber || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{user.branch || 'CSE'} ({user.graduationBatch || '2028'})</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Synced in DB
                            </span>
                          </td>
                        </tr>
                      ))}
                      {databaseUsers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-slate-400">
                            No students registered yet. Click 'Register Form' to add candidates.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                <div className="w-full md:w-72">
                  <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    placeholder="Search questions by topic or keyword..."
                    size="sm"
                  />
                </div>
                {currentUser.role === 'student' && (
                  <button
                    onClick={() => setActiveTab('dsa-studio')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>DSA Studio</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigate('prep')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition shrink-0"
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

        {/* TAB: DSA & CODING PRACTICE STUDIO (STUDENT ONLY) */}
        {activeTab === 'dsa-studio' && (
          <div className="space-y-6">
            <DsaPracticePage
              onNavigate={onNavigate}
              onSelectGlobalQuestion={onSelectQuestion}
            />
          </div>
        )}

        {/* TAB 4: CRT ATTENDANCE (Campus Recruitment Training Attendance Portal) */}
        {activeTab === 'crt-attendance' && (
          <div className="space-y-6">
            {userRole === 'student' && (
              <StudentGpsAttendanceWidget sessionTitle="Campus Recruitment Training (CRT)" sessionType="CRT" />
            )}
            <CrtAttendancePortalView onNavigate={onNavigate} />
          </div>
        )}

        {/* TAB 5: CLASS ATTENDANCE (Teacher & HOD Daily Class Attendance Portal) */}
        {activeTab === 'class-attendance' && (
          <div className="space-y-6">
            {userRole === 'student' && (
              <StudentGpsAttendanceWidget sessionTitle="Regular Classroom Academic Attendance" sessionType="CLASS" />
            )}
            <DailyAttendancePortalView onNavigate={onNavigate} />
          </div>
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
                  onClick={() => onNavigate && onNavigate('resume-ats')}
                  className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Live ATS Resume Checker & Auditor</span>
                </button>
                <button
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzingResume}
                  className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalyzingResume ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzingResume ? 'Re-Running ATS Parser...' : 'Re-Run Quick Audit'}</span>
                </button>
                <button
                  onClick={() => alert('Resume template downloaded.')}
                  className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
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

        {/* TAB: REPORTS EXPORTER */}
        {activeTab === 'reports-exporter' && (
          <ReportsExporterPage onNavigate={onNavigate} />
        )}

        {/* TAB: CURRICULUM & SYLLABUS GOVERNANCE (HOD ONLY) */}
        {activeTab === 'curriculum-governance' && (
          <CurriculumGovernanceView onNavigate={onNavigate} />
        )}

      </div>

      {/* STUDENT REGISTRATION MODAL */}
      {isRegisterStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">Register New Student</h3>
            <p className="text-xs text-slate-500 mb-3">Add candidate to university database for automated placement eligibility verification.</p>

            {/* Quick Bulk Import Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-slate-700 font-medium">Need to enroll multiple students?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterStudentModalOpen(false);
                  setIsBulkImportModalOpen(true);
                }}
                className="font-bold text-indigo-700 hover:text-indigo-900 underline text-xs shrink-0 cursor-pointer"
              >
                Bulk Import Spreadsheet
              </button>
            </div>

            {registrationErrorMsg && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{registrationErrorMsg}</span>
              </div>
            )}

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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImportSuccess={(count) => {
          setRegistrationSuccessMsg(`Successfully registered ${count} students into university database!`);
          setTimeout(() => setRegistrationSuccessMsg(''), 5000);
        }}
      />

      {/* 5. COMPLETE PROFILE MODAL */}
      <UserProfileModal
        isOpen={isFullProfileModalOpen}
        onClose={() => setIsFullProfileModalOpen(false)}
        onProfileUpdated={() => setCurrentUser(getCurrentUser() || {})}
      />

    </div>
  );
}
