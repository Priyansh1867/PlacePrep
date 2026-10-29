import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  Users,
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
  TrendingUp,
  AlertTriangle,
  Upload,
  Download,
  ExternalLink,
  Code2,
  Video,
  Bell,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckSquare,
  Plus,
  FileSpreadsheet,
  Lock,
  Eye,
  GraduationCap,
  Sliders,
  HelpCircle,
  BookmarkCheck,
  PhoneCall,
  UserCheck,
  UserX,
  FileCheck,
  Building,
  Target,
  User,
  ChevronDown,
  LogOut,
  Compass,
  Mail,
  School
} from 'lucide-react';
import {
  getCurrentUser,
  setCurrentUser,
  setPortalRole,
  getGraduationBatch,
  getUpcomingDrives,
  getEligibilityMatrix,
  getLiveSessions,
  addLiveSession,
  rsvpLiveSession,
  getOffCampusCompanies,
  addOffCampusCompany,
  getPushNotifications,
  broadcastPushNotification,
  markNotificationAsRead,
  getFeedbackLoop,
  addFeedbackLoopEntry,
  getInternships,
  addInternship
} from '../services/storage';
import { INITIAL_CANDIDATES_PIPELINE } from '../data/selectionWorkflowData';
import SearchBar from '../components/ui/SearchBar';
import PortalModuleCards from '../components/PortalModuleCards';
import ReportsExporterPage from './ReportsExporterPage';
import UserProfileModal from '../components/profile/UserProfileModal';
import placementWorkflowHero from '../assets/images/placement-workflow-hero.png';

// Standard Role Metadata for labels
const ROLE_METAS = {
  tpo: { label: 'TPO Officer', icon: Building2, desc: 'Full placement operations & drive governance' },
  coordinator: { label: 'Coordinator', icon: Users, desc: 'Manage assigned drives & logistics' },
  hr: { label: 'Recruiter', icon: Briefcase, desc: 'Assigned company hiring & candidate shortlists' },
  recruiter: { label: 'Recruiter', icon: Briefcase, desc: 'Assigned company hiring & candidate shortlists' },
  director: { label: 'Director', icon: ShieldCheck, desc: 'Executive intelligence & aggregate statistics' },
  student: { label: 'Student', icon: GraduationCap, desc: 'Eligible drives, self-eligibility & applications' }
};

export default function PlacementPortalPage({ onNavigate, onSelectCompany, onSelectQuestion }) {
  // User profile strictly fixed based on authentic logged in session
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const rawRole = (currentUser?.role || 'tpo').toLowerCase();
  const activeRole = ['hr', 'recruiter'].includes(rawRole) ? 'hr' :
                     ['coordinator', 'student', 'director'].includes(rawRole) ? rawRole : 'tpo';

  const roleMeta = ROLE_METAS[activeRole] || ROLE_METAS.tpo;
  const isTPO = activeRole === 'tpo';
  const isCoordinator = activeRole === 'coordinator';
  const isRecruiter = activeRole === 'hr';
  const isDirector = activeRole === 'director';
  const isStudent = activeRole === 'student';

  const [activeTab, setActiveTab] = useState('drives');

  // Reset scroll to top on portal tab change so SearchBar and top content stay in view
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isFullProfileModalOpen, setIsFullProfileModalOpen] = useState(false);

  // Keep currentUser synced when profile is saved
  useEffect(() => {
    const handleProfileUpdate = () => {
      setCurrentUserState(getCurrentUser());
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  // State collections
  const [drives, setDrives] = useState(() => getUpcomingDrives());
  const [eligibilityMatrix, setEligibilityMatrix] = useState(() => getEligibilityMatrix());
  const [liveSessions, setLiveSessions] = useState(() => getLiveSessions());
  const [offCampus, setOffCampus] = useState(() => getOffCampusCompanies());
  const [notifications, setNotifications] = useState(() => getPushNotifications());
  const [feedbackLoop, setFeedbackLoop] = useState(() => getFeedbackLoop());
  const [internships, setInternships] = useState(() => getInternships());
  const [candidates, setCandidates] = useState(() => INITIAL_CANDIDATES_PIPELINE);

  // Student specific mock applications / tracking
  const [appliedDrives, setAppliedDrives] = useState({});
  const [portalDriveSearch, setPortalDriveSearch] = useState('');
  const [portalCriteriaSearch, setPortalCriteriaSearch] = useState('');
  const [portalCandidateSearch, setPortalCandidateSearch] = useState('');
  const [portalInternshipSearch, setPortalInternshipSearch] = useState('');
  const [portalOffCampusSearch, setPortalOffCampusSearch] = useState('');
  const [appliedInternships, setAppliedInternships] = useState({});
  const [studentOffCampusList, setStudentOffCampusList] = useState([
    {
      id: 'soc-1',
      companyName: 'Atlassian',
      role: 'Associate Software Engineer',
      ctc: '₹22.5 LPA',
      appliedDate: '2026-10-14',
      status: 'Interview Scheduled',
      link: 'https://atlassian.com/careers'
    },
    {
      id: 'soc-2',
      companyName: 'Zomato',
      role: 'Backend SDE Trainee',
      ctc: '₹14.0 LPA',
      appliedDate: '2026-10-18',
      status: 'Online Assessment Cleared',
      link: 'https://zomato.com/careers'
    }
  ]);

  // Student self-eligibility tester state
  const [studentProfile] = useState({
    name: currentUser?.name || 'Priyansh Jain',
    rollNumber: currentUser?.rollNumber || '2024/CSE/084',
    branch: currentUser?.branch || 'Computer Science and Engineering',
    batch: currentUser?.graduationBatch || '2028',
    cgpa: 8.4,
    backlogs: 0,
    tenthPercent: 88,
    twelfthPercent: 90
  });

  // Modals & Feedback form states
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveForm, setDriveForm] = useState({
    companyName: '',
    role: '',
    ctc: '',
    driveDate: '2026-11-28',
    venue: 'Auditorium Hall A & Online Labs',
    minCgpa: 6.5,
    maxBacklogs: 0,
    eligibleBatches: '2026, 2027, 2028',
    allowedBranches: 'CSE, IT, ECE, EEE'
  });

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    category: 'Drive Update',
    priority: 'High',
    targetAudience: isRecruiter ? 'Assigned Company Candidates' : isCoordinator ? 'Assigned Student Cohort' : 'All Final & Pre-Final Students'
  });

  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [liveForm, setLiveForm] = useState({
    companyName: isRecruiter ? (currentUser?.company || 'HCLTech') : 'TCS',
    title: '',
    speaker: '',
    date: '2026-10-29',
    time: '04:00 PM - 05:30 PM',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/campus-live-session',
    agenda: ''
  });

  const [isInternModalOpen, setIsInternModalOpen] = useState(false);
  const [internForm, setInternForm] = useState({
    companyName: isRecruiter ? (currentUser?.company || 'HCLTech') : '',
    role: '',
    stipend: '₹50,000 / month',
    duration: '2 Months (Summer 2027)',
    location: 'Bengaluru / Hybrid',
    minCgpa: 7.0,
    deadline: '2026-11-20'
  });

  const [isOffCampusModalOpen, setIsOffCampusModalOpen] = useState(false);
  const [offCampusForm, setOffCampusForm] = useState({
    companyName: '',
    role: '',
    ctc: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Application Submitted',
    link: ''
  });

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    companyName: 'HCLTech',
    rating: 5,
    difficulty: 'Moderate',
    comments: '',
    category: isStudent ? 'Student Feedback' : 'Recruiter Assessment'
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const getInitials = (name = 'User') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  };

  const handleSignOut = () => {
    localStorage.removeItem('placeprep_current_user');
    localStorage.removeItem('placeprep_portal_role');
    onNavigate('auth-portal');
  };

  // Tab definitions strictly mapped to user's RBAC matrix table:
  // - Student has âŒ on Reports Exporter -> Filtered out for student
  // - Recruiter has âŒ on Off-Campus Finder -> Filtered out for recruiter
  const allNavTabs = [
    {
      id: 'drives',
      label: '1. Upcoming Drives',
      icon: Briefcase,
      badge: `${drives.length} Drives`,
      description: isStudent ? 'Eligible corporate hiring drives & active applications' : 'Schedule, packages, parameters and company drives'
    },
    {
      id: 'reports-exporter',
      label: '2. Reports Exporter',
      icon: FileSpreadsheet,
      badge: 'Excel / CSV',
      description: 'Audit logs, placement census & eligible candidates report',
      roles: ['tpo', 'coordinator', 'director', 'hr', 'recruiter']
    },
    {
      id: 'eligibility-criteria',
      label: isStudent ? '3. My Eligibility Check' : '3. Company Eligibility',
      icon: CheckSquare,
      badge: isStudent ? 'Live Validator' : `${eligibilityMatrix.length} Cutoffs`,
      description: isStudent ? 'Real-time CGPA, 10th/12th & backlog cutoff check' : 'Cutoff criteria thresholds, bonds and academic criteria'
    },
    {
      id: 'live-sessions',
      label: '4. Live Sessions',
      icon: Video,
      badge: `${liveSessions.length} Webinars`,
      description: isStudent ? 'Attend corporate pre-placement talks & live webinars' : 'Schedule interactive pre-placement talks and video rooms'
    },
    {
      id: 'shortlisted',
      label: isStudent ? '5. My Shortlist Status' : '5. Shortlisted Students',
      icon: Users,
      badge: isStudent ? 'Pipeline' : `${candidates.length} Candidates`,
      description: isStudent ? 'Round-wise interview progress and evaluation scores' : 'Multi-round candidate evaluation and advancement funnel'
    },
    {
      id: 'internships',
      label: '6. Internship Details',
      icon: Award,
      badge: `${internships.length} Openings`,
      description: isStudent ? 'Apply for verified summer internships & PPO tracks' : 'Manage corporate internships, stipends and PPO conversions'
    },
    {
      id: 'feedback-loop',
      label: '7. Feedback (TPO)',
      icon: MessageSquare,
      badge: `${feedbackLoop.length} Reviews`,
      description: isStudent ? 'Share your interview and recruitment drive experience' : '3-way continuous quality feedback loop & ratings'
    },
    {
      id: 'off-campus',
      label: isStudent ? '8. My Off-Campus' : '8. Off-Campus Finder',
      icon: ExternalLink,
      badge: isStudent ? `${studentOffCampusList.length} Tracked` : `${offCampus.length} National`,
      description: isStudent ? 'Track your external applications and verify offers' : 'National corporate drives and external job opportunities',
      roles: ['tpo', 'coordinator', 'director', 'student']
    },
    {
      id: 'push-notifications',
      label: '9. Push Notifications',
      icon: Bell,
      badge: `${notifications.length} Alerts`,
      description: isStudent ? 'Real-time drive announcements and emergency alerts' : 'Broadcast priority notifications across student portals'
    }
  ];

  // Strictly filter tabs based on active role
  const visibleNavTabs = allNavTabs.filter(tab => {
    if (!tab.roles) return true;
    return tab.roles.includes(activeRole);
  });

  // Smooth scroll handler on card selection
  const handleCardSelect = (tabId) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const target = document.getElementById('placement-feature-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Action handlers
  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    const updated = broadcastPushNotification(broadcastForm);
    setNotifications(updated);
    setIsBroadcastModalOpen(false);
    setBroadcastForm({
      title: '',
      message: '',
      category: 'Drive Update',
      priority: 'High',
      targetAudience: isRecruiter ? 'Assigned Company Candidates' : 'All Final & Pre-Final Students'
    });
    showToast('Push alert dispatched successfully!');
  };

  const handleCreateLiveSession = (e) => {
    e.preventDefault();
    if (!liveForm.title || !liveForm.speaker) return;
    const newSession = {
      id: `live-${Date.now()}`,
      ...liveForm,
      rsvpsCount: 0,
      isLiveNow: false,
      status: 'Scheduled'
    };
    const updated = addLiveSession(newSession);
    setLiveSessions(updated);
    setIsLiveModalOpen(false);
    showToast(`Live session "${liveForm.title}" published!`);
  };

  const handleCreateDrive = (e) => {
    e.preventDefault();
    if (!driveForm.companyName || !driveForm.role) return;
    const newDrive = {
      id: `drv-${Date.now()}`,
      companyId: driveForm.companyName.toLowerCase().replace(/\s+/g, '-'),
      companyName: driveForm.companyName,
      role: driveForm.role,
      ctc: driveForm.ctc || '₹6.00 LPA - ₹10.00 LPA',
      driveDate: driveForm.driveDate,
      venue: driveForm.venue,
      status: 'Verified Upcoming Drive',
      minCgpa: parseFloat(driveForm.minCgpa) || 6.5,
      maxBacklogs: parseInt(driveForm.maxBacklogs, 10) || 0,
      eligibleBatches: driveForm.eligibleBatches.split(',').map(s => s.trim()),
      allowedBranches: driveForm.allowedBranches.split(',').map(s => s.trim())
    };
    setDrives([newDrive, ...drives]);
    setIsDriveModalOpen(false);
    showToast(`Drive for ${driveForm.companyName} created successfully!`);
  };

  const handleCreateInternship = (e) => {
    e.preventDefault();
    if (!internForm.companyName || !internForm.role) return;
    const newIntern = {
      id: `intern-${Date.now()}`,
      ...internForm,
      eligibleBatches: ['2027', '2028'],
      branches: ['CSE', 'IT', 'ECE'],
      status: 'Actively Hiring',
      applicationUrl: 'https://careers.google.com'
    };
    const updated = addInternship(newIntern);
    setInternships(updated);
    setIsInternModalOpen(false);
    showToast(`Internship opportunity for ${internForm.companyName} added!`);
  };

  const handleAddOffCampus = (e) => {
    e.preventDefault();
    if (!offCampusForm.companyName || !offCampusForm.role) return;
    const newEntry = {
      id: `soc-${Date.now()}`,
      ...offCampusForm
    };
    setStudentOffCampusList([newEntry, ...studentOffCampusList]);
    setIsOffCampusModalOpen(false);
    showToast(`Logged off-campus application for ${offCampusForm.companyName}!`);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackForm.comments) return;
    const newEntry = {
      companyName: feedbackForm.companyName,
      driveDate: new Date().toISOString().split('T')[0],
      status: 'Feedback Logged',
      studentRatingAvg: isStudent ? feedbackForm.rating : 4.8,
      studentFeedbackSummary: isStudent ? feedbackForm.comments : 'Candidate appreciated smooth coordination.',
      tpoAssessment: 'Acknowledged by TPO cell. Logged for quarterly placement review.',
      companyRecruiterRating: isRecruiter ? feedbackForm.rating : 4.5,
      companyRecruiterComments: isRecruiter ? feedbackForm.comments : 'Candidate aptitude was strong.'
    };
    const updated = addFeedbackLoopEntry(newEntry);
    setFeedbackLoop(updated);
    setIsFeedbackModalOpen(false);
    setFeedbackForm({ companyName: 'HCLTech', rating: 5, difficulty: 'Moderate', comments: '', category: isStudent ? 'Student Feedback' : 'Recruiter Assessment' });
    showToast('Feedback submitted and recorded into TPO intelligence loop!');
  };

  const handleRsvpSession = (sessionId) => {
    const updated = rsvpLiveSession(sessionId);
    setLiveSessions(updated);
    showToast('RSVP confirmed! Added to your student schedule.');
  };

  const handleApplyDrive = (driveId, companyName) => {
    setAppliedDrives(prev => ({ ...prev, [driveId]: true }));
    showToast(`Application successfully registered for ${companyName}!`);
  };

  const handleApplyInternship = (internId, companyName) => {
    setAppliedInternships(prev => ({ ...prev, [internId]: true }));
    showToast(`Applied for ${companyName} internship! Status: Under Review`);
  };

  const handleCandidateStatusChange = (candId, newStatus) => {
    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, status: newStatus } : c));
    showToast(`Updated candidate status to: ${newStatus}`);
  };

  // Filter drives for specific roles
  const displayedDrives = useMemo(() => {
    if (isRecruiter) {
      const recruiterCompany = (currentUser?.company || 'HCLTech').toLowerCase();
      const filtered = drives.filter(d => (d.companyName || '').toLowerCase().includes(recruiterCompany) || (d.companyId || '').toLowerCase().includes(recruiterCompany));
      return filtered.length > 0 ? filtered : drives.slice(0, 1);
    }
    if (isStudent) {
      return drives.filter(d => !d.eligibleBatches || d.eligibleBatches.includes('2028') || d.eligibleBatches.includes('all'));
    }
    return drives;
  }, [drives, isRecruiter, isStudent, currentUser]);

  // Recruiter candidate list (masked sensitive data)
  const displayedCandidates = useMemo(() => {
    if (isRecruiter) {
      const recruiterCompany = (currentUser?.company || 'HCLTech').toLowerCase();
      const matched = candidates.filter(c => (c.companyName || '').toLowerCase().includes(recruiterCompany));
      return matched.length > 0 ? matched : candidates.slice(0, 2);
    }
    if (isStudent) {
      return candidates.filter(c => c.name.toLowerCase().includes('priyansh') || c.id === 'cand-101');
    }
    return candidates;
  }, [candidates, isRecruiter, isStudent, currentUser]);

  return (
    <div className="min-h-screen bg-[#F8F8F9] text-[#111439] py-8 px-4 sm:px-6 lg:px-8">
      
      {/* 0. UPPER LEFT BACK BUTTON */}
      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('gateway')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-900 font-bold text-xs shadow-xs transition cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Portals</span>
        </button>

        {/* Workspace Mode Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Spring Boot Connected (:8082)</span>
        </div>
      </div>

      {/* 1. TOP HEADER BANNER WITH RIGHT-HAND PROFILE CARD (Dark + Light + Enhanced Triad Palette) */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="dashboard-hero dashboard-hero--placement bg-gradient-to-br from-[#070B19] via-[#0F172A] to-[#0A1828] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative backdrop-blur-xl">
          <img
            src={placementWorkflowHero}
            alt=""
            className="dashboard-hero__art"
          />
          <span className="dashboard-hero__wash" />
          {/* Tri-Color Ambient Lighting Orbs */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-16 w-72 h-72 bg-amber-500/12 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Workspace Heading & Right-side User Profile */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs backdrop-blur-md">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Placement Portal • {roleMeta.label} Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                Corporate Hiring & Placement Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium">
                Logged in as <strong className="text-white font-extrabold">{currentUser.name}</strong> • Role: <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold uppercase text-[11px]">{roleMeta.label}</span> • Placement Season 2026-2027
              </p>
            </div>

            {/* Right Side: Quick Action & Profile Component */}
            <div className="flex items-center gap-3 shrink-0">
              {isStudent && (
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="hidden sm:flex px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition cursor-pointer items-center gap-1.5 border border-emerald-300/40 active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Submit Drive Feedback</span>
                </button>
              )}

              {(isTPO || isCoordinator) && (
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(true)}
                  className="hidden sm:flex px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition cursor-pointer items-center gap-1.5 border border-indigo-300/40 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New Campus Drive</span>
                </button>
              )}

              {/* Dedicated Top-Right Profile Pill & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-2 pr-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition shadow-md group text-left cursor-pointer"
                  aria-label="User profile menu"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0 border border-white/25">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[130px]">{currentUser.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-semibold block truncate">
                      {roleMeta.label}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 group-hover:text-white transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Popup */}
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 z-50 text-slate-900 text-xs animate-in fade-in zoom-in-95 duration-150">
                      {/* Header info */}
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                          {getInitials(currentUser.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                            {roleMeta.label}
                          </span>
                        </div>
                      </div>

                      {/* Profile details */}
                      <div className="py-3 space-y-2 text-[11px] border-b border-slate-100">
                        <div className="flex justify-between text-slate-500">
                          <span>Institute:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[160px]">{currentUser.college || 'Delhi Technological University'}</span>
                        </div>
                        {isStudent && (
                          <>
                            <div className="flex justify-between text-slate-500">
                              <span>Roll Number:</span>
                              <span className="font-bold text-slate-800 font-mono">{currentUser.rollNumber || '2024/CSE/084'}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Branch & Batch:</span>
                              <span className="font-semibold text-slate-800">{currentUser.branch || 'CSE'} ({currentUser.graduationBatch || '2028'})</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Academic Standing:</span>
                              <span className="font-bold text-emerald-600">CGPA 8.4 • 0 Backlogs</span>
                            </div>
                          </>
                        )}
                        {isRecruiter && (
                          <div className="flex justify-between text-slate-500">
                            <span>Organization:</span>
                            <span className="font-bold text-slate-800">{currentUser.company || 'HCLTech'}</span>
                          </div>
                        )}
                        {(isTPO || isCoordinator || isDirector) && (
                          <div className="flex justify-between text-slate-500">
                            <span>Designation:</span>
                            <span className="font-semibold text-slate-800">{currentUser.designation || 'Placement Operations Lead'}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); setIsFullProfileModalOpen(true); }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-bold transition text-left cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>View Complete Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsProfileDropdownOpen(false); onNavigate('gateway'); }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition text-left cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-indigo-600" />
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

          {/* Quick Metrics Bar Adapting to Active User Role (Triad Bento Mini-Cards) */}
          <div className="pp-hero-stats relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-white/10 text-xs">
            {isStudent ? (
              <>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Eligible Drives</span>
                  <span className="font-black text-base sm:text-lg text-white mt-0.5 block">{displayedDrives.length} Ready to Apply</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Active verified cutoffs</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md">
                  <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-wider block">My Shortlists</span>
                  <span className="font-black text-base sm:text-lg text-emerald-300 mt-0.5 block">1 Advanced (HCLTech)</span>
                  <span className="text-[11px] text-emerald-400/80 mt-0.5 block">Round 2 scheduled</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-md">
                  <span className="text-amber-300 text-[11px] font-bold uppercase tracking-wider block">Off-Campus Tracked</span>
                  <span className="font-black text-base sm:text-lg text-amber-300 mt-0.5 block">{studentOffCampusList.length} In Progress</span>
                  <span className="text-[11px] text-amber-400/80 mt-0.5 block">External applications</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 backdrop-blur-md">
                  <span className="text-indigo-300 text-[11px] font-bold uppercase tracking-wider block">Verified Status</span>
                  <span className="font-black text-base sm:text-lg text-indigo-200 mt-0.5 block">CGPA 8.4 • 0 Backlogs</span>
                  <span className="text-[11px] text-indigo-300/80 mt-0.5 block">All cutoffs satisfied</span>
                </div>
              </>
            ) : isDirector ? (
              <>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Placement Rate</span>
                  <span className="font-black text-base sm:text-lg text-white mt-0.5 block">88.4% Placed</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Batch of 2026</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md">
                  <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-wider block">Average Package</span>
                  <span className="font-black text-base sm:text-lg text-emerald-300 mt-0.5 block">₹8.60 LPA</span>
                  <span className="text-[11px] text-emerald-400/80 mt-0.5 block">Across all branches</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-md">
                  <span className="text-amber-300 text-[11px] font-bold uppercase tracking-wider block">Highest Package</span>
                  <span className="font-black text-base sm:text-lg text-amber-300 mt-0.5 block">₹44.0 LPA</span>
                  <span className="text-[11px] text-amber-400/80 mt-0.5 block">Microsoft Redmond</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 backdrop-blur-md">
                  <span className="text-indigo-300 text-[11px] font-bold uppercase tracking-wider block">Corporate Partners</span>
                  <span className="font-black text-base sm:text-lg text-indigo-200 mt-0.5 block">52 Companies</span>
                  <span className="text-[11px] text-indigo-300/80 mt-0.5 block">Tier-1 & Core employers</span>
                </div>
              </>
            ) : isRecruiter ? (
              <>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Assigned Drives</span>
                  <span className="font-black text-base sm:text-lg text-white mt-0.5 block">{displayedDrives.length} Company Drives</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Active on campus</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md">
                  <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-wider block">Candidates</span>
                  <span className="font-black text-base sm:text-lg text-emerald-300 mt-0.5 block">{displayedCandidates.length} Shortlisted</span>
                  <span className="text-[11px] text-emerald-400/80 mt-0.5 block">Advancing to next stage</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-md">
                  <span className="text-amber-300 text-[11px] font-bold uppercase tracking-wider block">Data Privacy</span>
                  <span className="font-black text-base sm:text-lg text-amber-300 mt-0.5 block">PII Masked</span>
                  <span className="text-[11px] text-amber-400/80 mt-0.5 block">Compliance enforced</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 backdrop-blur-md">
                  <span className="text-indigo-300 text-[11px] font-bold uppercase tracking-wider block">Interviews</span>
                  <span className="font-black text-base sm:text-lg text-indigo-200 mt-0.5 block">Round 2 Active</span>
                  <span className="text-[11px] text-indigo-300/80 mt-0.5 block">Live video evaluation</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Upcoming Drives</span>
                  <span className="font-black text-base sm:text-lg text-white mt-0.5 block">{drives.length} Companies</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Scheduled drives</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-md">
                  <span className="text-emerald-300 text-[11px] font-bold uppercase tracking-wider block">Live Webinars</span>
                  <span className="font-black text-base sm:text-lg text-emerald-300 mt-0.5 block">{liveSessions.length} PPT Sessions</span>
                  <span className="text-[11px] text-emerald-400/80 mt-0.5 block">Interactive talks</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-md">
                  <span className="text-amber-300 text-[11px] font-bold uppercase tracking-wider block">Candidates</span>
                  <span className="font-black text-base sm:text-lg text-amber-300 mt-0.5 block">{candidates.length} In Pipeline</span>
                  <span className="text-[11px] text-amber-400/80 mt-0.5 block">Shortlist funnel</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 backdrop-blur-md">
                  <span className="text-indigo-300 text-[11px] font-bold uppercase tracking-wider block">TPO-Company Loops</span>
                  <span className="font-black text-base sm:text-lg text-indigo-200 mt-0.5 block">{feedbackLoop.length} Reviews</span>
                  <span className="text-[11px] text-indigo-300/80 mt-0.5 block">Continuous feedback</span>
                </div>
              </>
            )}
          </div>
        </div>

      {/* Toast / Notification feedback */}
        {toastMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage('')} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}
      </div>

      {/* 2. ROLE-FILTERED MODULE CARDS NAVIGATION */}
      <div className="max-w-7xl mx-auto mb-8">
        <PortalModuleCards items={visibleNavTabs} activeId={activeTab} onSelect={handleCardSelect} tone="emerald" />
      </div>

      {/* 3. TAB CONTENTS CORRESPONDING TO THE 9 MATRIX FEATURES */}
      <div id="placement-feature-content" className="max-w-7xl mx-auto scroll-mt-24">
        
        {/* ========================================================================= */}
        {/* FEATURE 1: UPCOMING DRIVES                                                */}
        {/* ========================================================================= */}
        {activeTab === 'drives' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-lg">
                    {isStudent ? 'Eligible Campus Recruitment Drives' :
                     isRecruiter ? 'Assigned Company Recruitment Drives' :
                     isDirector ? 'Institutional Recruitment Drives Executive Overview' :
                     'Campus Recruitment Drives Management'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {isTPO ? 'Full Edit Access' : isCoordinator ? 'Logistics Managed' : isRecruiter ? 'Recruiter Scoped' : isDirector ? 'Read-Only View' : 'Student Eligible'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isStudent ? 'Drives verified by TPO where your CGPA, batch, and academic profile meet mandatory cutoffs.' :
                   isRecruiter ? 'Drives specifically associated with your recruiting organization.' :
                   'Track verified corporate schedules, packages, eligibility cutoffs, and application stages.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {(isTPO || isCoordinator) && (
                  <button
                    onClick={() => setIsDriveModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Drive</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch { window.scrollTo(0, 0); }
                    if (typeof document !== 'undefined') {
                      if (document.documentElement) document.documentElement.scrollTop = 0;
                      if (document.body) document.body.scrollTop = 0;
                    }
                    onNavigate('drives');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>All Campus Drives</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drives Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedDrives.map(drive => {
                const isApplied = appliedDrives[drive.id];
                return (
                  <div
                    key={drive.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-sm text-slate-900">{drive.companyName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {drive.status || 'Verified Upcoming Drive'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-base mb-1">{drive.role}</h4>
                      <p className="text-xs font-bold text-emerald-600 mb-4">Package: {drive.ctc}</p>

                      <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 mb-4 border border-slate-100">
                        <div className="flex justify-between text-slate-500">
                          <span>Drive Date:</span>
                          <span className="font-semibold text-slate-800">{drive.driveDate}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Venue:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[170px]">{drive.venue || 'Campus Auditorium & Labs'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Eligible Batches:</span>
                          <span className="font-semibold text-slate-800">{drive.eligibleBatches?.join(', ') || 'All'}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Min CGPA Cutoff:</span>
                          <span className="font-bold text-emerald-600">{drive.minCgpa || 6.5} CGPA</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isStudent ? (
                        <>
                          <button
                            disabled={isApplied}
                            onClick={() => handleApplyDrive(drive.id, drive.companyName)}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                              isApplied
                                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Applied & Tracked</span>
                              </>
                            ) : (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5" />
                                <span>Apply for Drive</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => onSelectCompany && onSelectCompany({ id: drive.companyId, name: drive.companyName })}
                            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                          >
                            Prep Hub
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onSelectCompany && onSelectCompany({ id: drive.companyId, name: drive.companyName })}
                            className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition"
                          >
                            Company Hub
                          </button>
                          <button
                            onClick={() => onNavigate('workflow')}
                            className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                          >
                            {isRecruiter ? 'Candidate Pool' : isCoordinator ? 'Manage Logistics' : 'Shortlists'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE 2: REPORTS EXPORTER (HIDDEN FROM STUDENTS)                        */}
        {/* ========================================================================= */}
        {activeTab === 'reports-exporter' && (
          <div>
            {isStudent ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto my-6">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-600">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Restricted Access (RBAC Governance)</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
                  Per the institutional placement matrix, <strong>Student</strong> accounts do not have authorization to export college-wide placement or candidate reports.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('drives')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    View Eligible Drives
                  </button>
                </div>
              </div>
            ) : (
              <ReportsExporterPage onNavigate={onNavigate} />
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE 3: COMPANY ELIGIBILITY CRITERIA                                  */}
        {/* ========================================================================= */}
        {activeTab === 'eligibility-criteria' && (
          <div className="space-y-6">
            
            {/* Student Self-Eligibility Check Workspace */}
            {isStudent && (
              <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-emerald-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                      <Target className="w-3.5 h-3.5" />
                      <span>Live Academic Eligibility Validator</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">Your Placement Profile & Eligibility Status</h3>
                    <p className="text-xs text-emerald-200 mt-0.5">Automated verification against current corporate cutoff mandates.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                    <span className="text-emerald-300 block">Candidate Verification:</span>
                    <span className="font-bold text-white">{studentProfile.name} • {studentProfile.rollNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-emerald-300 block">Current CGPA:</span>
                    <span className="font-black text-lg text-white">{studentProfile.cgpa} / 10.0</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-emerald-300 block">Active Backlogs:</span>
                    <span className="font-black text-lg text-emerald-400">{studentProfile.backlogs} (Cleared)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-emerald-300 block">10th / 12th Marks:</span>
                    <span className="font-black text-lg text-white">{studentProfile.tenthPercent}% / {studentProfile.twelfthPercent}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-emerald-300 block">Degree / Cohort:</span>
                    <span className="font-bold text-xs text-white truncate">{studentProfile.branch} ({studentProfile.batch})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility Criteria Matrix Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Company-Wise Eligibility Criteria Matrix</h3>
                  <p className="text-xs text-slate-500">Official threshold cutoffs mandated by visiting corporate recruiting partners.</p>
                </div>
                {isTPO && (
                  <button
                    onClick={() => showToast('Eligibility parameter update modal enabled for TPO Officer.')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Manage Criteria</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Min 10th %</th>
                      <th className="p-3">Min 12th %</th>
                      <th className="p-3">Min CGPA</th>
                      <th className="p-3">Backlogs</th>
                      <th className="p-3">Bond</th>
                      {isStudent && <th className="p-3 text-right">Your Status</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibilityMatrix.filter(item => {
                      const q = portalCriteriaSearch.trim().toLowerCase();
                      return !q || (item.companyName || '').toLowerCase().includes(q) || (item.role || '').toLowerCase().includes(q);
                    }).map((item, idx) => {
                      const isEligible = studentProfile.cgpa >= item.minCgpa && studentProfile.backlogs <= item.maxActiveBacklogs;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/70 transition">
                          <td className="p-3 font-bold text-slate-900">{item.companyName}</td>
                          <td className="p-3 font-semibold text-slate-700">{item.role}</td>
                          <td className="p-3">{item.min10th}%</td>
                          <td className="p-3">{item.min12th}%</td>
                          <td className="p-3 font-bold text-emerald-600">{item.minCgpa} CGPA</td>
                          <td className="p-3 font-semibold text-slate-700">{item.maxActiveBacklogs === 0 ? 'Zero Backlogs' : `${item.maxActiveBacklogs} max`}</td>
                          <td className="p-3 text-slate-500">{item.bondPeriod || 'No Bond'}</td>
                          {isStudent && (
                            <td className="p-3 text-right">
                              {isEligible ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Eligible</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Cutoff Mismatch</span>
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE 4: LIVE SESSIONS (PPTS & WEBINARS)                                */}
        {/* ========================================================================= */}
        {activeTab === 'live-sessions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Pre-Placement Talks (PPT) & Corporate Webinars</h3>
                  <p className="text-xs text-slate-500 mt-1">Direct interactive sessions hosted by company tech leads, engineering heads, and campus recruiters.</p>
                </div>
                {(isTPO || isCoordinator || isRecruiter) && (
                  <button
                    onClick={() => setIsLiveModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRecruiter ? 'Schedule Company Webinar' : 'Schedule Live Session'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {liveSessions.map(session => (
                  <div key={session.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-xs text-slate-900">{session.companyName}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {session.platform}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mb-1">{session.title}</h4>
                      <p className="text-xs text-slate-600 mb-2">Speaker: {session.speaker}</p>
                      <p className="text-xs text-slate-500 mb-4 italic leading-relaxed">"{session.agenda}"</p>

                      <div className="space-y-1 text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-100 mb-4">
                        <div className="flex justify-between">
                          <span>Date & Time:</span>
                          <span className="font-semibold text-slate-800">{session.date} • {session.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Student RSVPs:</span>
                          <span className="font-bold text-emerald-600">{session.rsvpsCount || 42} Attending</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {isStudent && (
                        <button
                          onClick={() => handleRsvpSession(session.id)}
                          className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>{session.hasRsvp ? 'RSVP Confirmed' : 'RSVP / Count Me In'}</span>
                        </button>
                      )}
                      <a
                        href={session.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{isRecruiter ? 'Join as Presenter' : 'Join Live Video Room'}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE 5: SHORTLISTED STUDENTS                                           */}
        {/* ========================================================================= */}
        {activeTab === 'shortlisted' && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">
                    {isStudent ? 'My Interview Rounds & Shortlist Status' :
                     isRecruiter ? 'Assigned Company Shortlist Management' :
                     isDirector ? 'Campus Shortlist Conversion Intelligence' :
                     'Candidate Shortlisting & Selection Workflow Engine'}
                  </h3>
                  {isRecruiter && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Sensitive PII Masked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isStudent ? 'Live status of your progress across aptitude, technical, managerial, and HR rounds.' :
                   isRecruiter ? 'Review candidates registered for your corporate recruitment drive.' :
                   'Multi-round candidate advancement, evaluator ratings, and stage transitions.'}
                </p>
              </div>

              <button
                onClick={() => onNavigate('workflow')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shrink-0"
              >
                <span>Full Workflow Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Director Funnel Statistics */}
            {isDirector && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Total Registered:</span>
                  <span className="text-2xl font-black text-slate-900">520 Students</span>
                  <p className="text-[11px] text-slate-400 mt-1">100% of eligible cohort</p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Aptitude Cleared:</span>
                  <span className="text-2xl font-black text-indigo-600">240 Shortlisted</span>
                  <p className="text-[11px] text-slate-400 mt-1">46.1% passing rate</p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Technical Cleared:</span>
                  <span className="text-2xl font-black text-amber-600">110 Advanced</span>
                  <p className="text-[11px] text-slate-400 mt-1">21.2% selection rate</p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 block mb-1">Offers Extended:</span>
                  <span className="text-2xl font-black text-emerald-600">68 Final Selections</span>
                  <p className="text-[11px] text-slate-400 mt-1">Highest package: ₹44 LPA</p>
                </div>
              </div>
            )}

            {/* Candidates Pipeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCandidates.map(cand => (
                <div key={cand.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-xs text-slate-900">{cand.companyName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cand.status === 'Selected' ? 'bg-emerald-100 text-emerald-800' :
                        cand.status === 'Advanced' ? 'bg-indigo-100 text-indigo-800' :
                        cand.status === 'Eliminated' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {cand.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-0.5">{cand.name}</h4>
                    <p className="text-xs text-slate-500 mb-3">{cand.branch} • {cand.college}</p>

                    <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 mb-4 border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Current Round:</span>
                        <span className="font-bold text-slate-800 uppercase">{cand.currentRound} Round</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Aptitude Score:</span>
                        <span className="font-bold text-indigo-600">{cand.scores?.aptitude || 'N/A'}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Technical Score:</span>
                        <span className="font-bold text-emerald-600">{cand.scores?.technical || 'Under Review'}/100</span>
                      </div>
                      {isRecruiter ? (
                        <div className="flex justify-between text-amber-700 bg-amber-50 p-1.5 rounded-lg text-[11px]">
                          <span>Student Contact:</span>
                          <span className="font-mono">*** Masked for Privacy ***</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-slate-500">
                          <span>Email:</span>
                          <span className="font-mono text-slate-700 truncate max-w-[170px]">{cand.email}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 italic mb-4 leading-relaxed">"{cand.notes}"</p>
                  </div>

                  {/* Actions depending on role */}
                  <div className="flex gap-2">
                    {isRecruiter ? (
                      <>
                        <button
                          onClick={() => handleCandidateStatusChange(cand.id, 'Advanced')}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                        >
                          Advance Candidate
                        </button>
                        <button
                          onClick={() => handleCandidateStatusChange(cand.id, 'Eliminated')}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition"
                        >
                          Reject
                        </button>
                      </>
                    ) : (isTPO || isCoordinator) ? (
                      <>
                        <button
                          onClick={() => handleCandidateStatusChange(cand.id, 'Selected')}
                          className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleCandidateStatusChange(cand.id, 'Advanced')}
                          className="flex-1 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs transition"
                        >
                          Advance
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onNavigate('workflow')}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                      >
                        View Round Evaluation Sheet
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE 6: INTERNSHIP DETAILS                                             */}
        {/* ========================================================================= */}
        {activeTab === 'internships' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Corporate Internship & PPO Analytics</h3>
                  <p className="text-xs text-slate-500">Summer & winter internships, stipend payouts, and full-time conversion rates.</p>
                </div>
                {(isTPO || isCoordinator || isRecruiter) && (
                  <button
                    onClick={() => setIsInternModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Internship</span>
                  </button>
                )}
              </div>

              {/* High-level stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Total Active Interns:</span>
                  <span className="text-3xl font-black text-indigo-600">86 Students</span>
                  <p className="text-xs text-slate-500 mt-2">Engaged in Microsoft, Goldman Sachs, Amazon, and DRDO.</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Average Stipend:</span>
                  <span className="text-3xl font-black text-emerald-600">₹68,500 / mo</span>
                  <p className="text-xs text-slate-500 mt-2">Highest stipend recorded: ₹1,25,000 / mo (Microsoft).</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">PPO Conversion Rate:</span>
                  <span className="text-3xl font-black text-purple-600">82.4%</span>
                  <p className="text-xs text-slate-500 mt-2">71 students converted internships into full-time offers.</p>
                </div>
              </div>

              {/* Internship Openings List */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Active Internship Openings:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {internships.map(intern => {
                    const isApplied = appliedInternships[intern.id];
                    return (
                      <div key={intern.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-sm text-slate-900">{intern.companyName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              {intern.status}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-800 text-sm mb-1">{intern.role}</h5>
                          <p className="text-xs font-bold text-emerald-600 mb-3">{intern.stipend}</p>

                          <div className="p-3 bg-white rounded-xl text-xs space-y-1 text-slate-500 border border-slate-100 mb-4">
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span className="font-semibold text-slate-800">{intern.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Location:</span>
                              <span className="font-semibold text-slate-800">{intern.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Deadline:</span>
                              <span className="font-semibold text-rose-600">{intern.deadline}</span>
                            </div>
                          </div>
                        </div>

                        {isStudent ? (
                          <button
                            disabled={isApplied}
                            onClick={() => handleApplyInternship(intern.id, intern.companyName)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                              isApplied
                                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Applied for Review</span>
                              </>
                            ) : (
                              <>
                                <Award className="w-3.5 h-3.5" />
                                <span>Apply for Internship</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <a
                            href={intern.applicationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 rounded-xl bg-slate-800 text-white font-bold text-xs text-center hover:bg-slate-900 transition flex items-center justify-center gap-1.5"
                          >
                            <span>Manage Opportunity</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE 7: FEEDBACK (TPO â†” COMPANY â†” STUDENT)                            */}
        {/* ========================================================================= */}
        {activeTab === 'feedback-loop' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase">
                      Quality Intelligence Loop
                    </span>
                    <span className="text-xs text-slate-500">Student â†” TPO Cell â†” Company Recruiter</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">3-Way Campus Recruitment Feedback System</h3>
                </div>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isStudent ? 'Submit Student Feedback' : isRecruiter ? 'Submit Recruiter Review' : 'Add TPO Note'}</span>
                </button>
              </div>

              {/* Feedback cards */}
              <div className="space-y-6">
                {feedbackLoop.map((item, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h4 className="font-black text-slate-900 text-base">{item.companyName} Campus Drive Review</h4>
                        <span className="text-xs text-slate-500">Date: {item.driveDate}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                        <span className="font-bold text-indigo-600 block mb-1">1. Student Feedback (Rating: {item.studentRatingAvg}/5)</span>
                        <p className="text-slate-600 leading-relaxed italic">"{item.studentFeedbackSummary}"</p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                        <span className="font-bold text-emerald-600 block mb-1">2. TPO Cell Assessment</span>
                        <p className="text-slate-600 leading-relaxed italic">"{item.tpoAssessment}"</p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                        <span className="font-bold text-amber-600 block mb-1">3. Company Recruiter Rating ({item.companyRecruiterRating}/5)</span>
                        <p className="text-slate-600 leading-relaxed italic">"{item.companyRecruiterComments}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE 8: OFF-CAMPUS FINDER (RESTRICTED FOR RECRUITERS)                  */}
        {/* ========================================================================= */}
        {activeTab === 'off-campus' && (
          <div className="space-y-6">
            
            {/* Student personal off-campus tracker */}
            {isStudent && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">My Off-Campus Applications Tracker</h3>
                    <p className="text-xs text-slate-500">Record your national drives, referral links, and outcome milestones.</p>
                  </div>
                  <button
                    onClick={() => setIsOffCampusModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log New Application</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="p-3">Company</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Package (CTC)</th>
                        <th className="p-3">Applied Date</th>
                        <th className="p-3">Current Status</th>
                        <th className="p-3 text-right">Portal Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentOffCampusList.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-bold text-slate-900">{item.companyName}</td>
                          <td className="p-3 font-semibold text-slate-700">{item.role}</td>
                          <td className="p-3 font-bold text-emerald-600">{item.ctc}</td>
                          <td className="p-3 text-slate-500">{item.appliedDate}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <a href={item.link || '#'} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">
                              Careers Portal â†—
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* National Verified Off-Campus Catalog */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">National Off-Campus Drives & Contests</h3>
                  <p className="text-xs text-slate-500">Verified national drives (TCS NQT, Cognizant GenC, Infosys HackWithInfy) published for graduating cohorts.</p>
                </div>
                {(isTPO || isCoordinator) && (
                  <button
                    onClick={() => showToast('New off-campus listing publisher enabled for placement officers.')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Off-Campus Drive</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offCampus.map(comp => (
                  <div key={comp.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-900">{comp.companyName}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Final Year Verified
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{comp.role}</h4>
                      <p className="text-xs font-bold text-emerald-600 mb-2">{comp.ctc}</p>
                      <p className="text-xs text-slate-500 mb-3">{comp.description}</p>
                    </div>

                    <a
                      href={comp.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-xl bg-slate-800 text-white font-bold text-xs text-center hover:bg-slate-900 transition flex items-center justify-center gap-1.5"
                    >
                      <span>Direct Application</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEATURE 9: PUSH NOTIFICATIONS                                             */}
        {/* ========================================================================= */}
        {activeTab === 'push-notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Push Notifications & Alert Center</h3>
                  <p className="text-xs text-slate-500 mt-1">High-priority announcements, test links, schedule updates, and urgent alerts.</p>
                </div>
                {(isTPO || isCoordinator || isRecruiter) && (
                  <button
                    onClick={() => setIsBroadcastModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isRecruiter ? 'Send Candidate Update' : 'New Broadcast'}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 hover:border-emerald-300 transition">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                        notif.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{notif.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            notif.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {notif.priority}
                          </span>
                          <span className="text-[10px] text-slate-400">Audience: {notif.targetAudience}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">{notif.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL: COMPLETE USER PROFILE MANAGEMENT (11 SECTIONS)                     */}
      {/* ========================================================================= */}
      <UserProfileModal
        isOpen={isFullProfileModalOpen}
        onClose={() => setIsFullProfileModalOpen(false)}
        onProfileUpdated={() => setCurrentUserState(getCurrentUser())}
      />

      {/* ========================================================================= */}
      {/* MODAL: CREATE CAMPUS DRIVE (TPO / COORDINATOR)                            */}
      {/* ========================================================================= */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900 mb-1">Create New Campus Hiring Drive</h3>
            <p className="text-xs text-slate-500 mb-4">Publish a verified recruitment drive with packages and eligibility.</p>

            <form onSubmit={handleCreateDrive} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={driveForm.companyName}
                    onChange={(e) => setDriveForm({ ...driveForm, companyName: e.target.value })}
                    placeholder="e.g. Adobe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={driveForm.role}
                    onChange={(e) => setDriveForm({ ...driveForm, role: e.target.value })}
                    placeholder="e.g. Member of Technical Staff"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CTC Package</label>
                  <input
                    type="text"
                    value={driveForm.ctc}
                    onChange={(e) => setDriveForm({ ...driveForm, ctc: e.target.value })}
                    placeholder="e.g. ₹18.00 LPA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drive Date</label>
                  <input
                    type="date"
                    value={driveForm.driveDate}
                    onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue / Format</label>
                <input
                  type="text"
                  value={driveForm.venue}
                  onChange={(e) => setDriveForm({ ...driveForm, venue: e.target.value })}
                  placeholder="Auditorium Hall A & Tech Labs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={driveForm.minCgpa}
                    onChange={(e) => setDriveForm({ ...driveForm, minCgpa: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Active Backlogs</label>
                  <input
                    type="number"
                    value={driveForm.maxBacklogs}
                    onChange={(e) => setDriveForm({ ...driveForm, maxBacklogs: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Publish Campus Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BROADCAST NOTIFICATION                                             */}
      {/* ========================================================================= */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {isRecruiter ? 'Send Recruitment Update to Candidates' : 'Broadcast Push Alert'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isRecruiter ? 'Send test timings and interview schedules directly to registered candidates.' : 'Dispatch real-time announcements across the placement ecosystem.'}
            </p>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. TCS Digital Coding Round Instructions"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Body *</label>
                <textarea
                  rows="3"
                  required
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Provide schedule details, venue instructions, or test links..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={broadcastForm.targetAudience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All Final & Pre-Final Students">All Final & Pre-Final Students</option>
                    <option value="Shortlisted Candidates">Shortlisted Candidates Only</option>
                    <option value="Assigned Company Candidates">Assigned Company Candidates</option>
                    <option value="Placement Coordinators">Coordinators & Staff</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  Send Push Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE LIVE SESSION                                              */}
      {/* ========================================================================= */}
      {isLiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900 mb-1">Schedule Pre-Placement Talk / Webinar</h3>
            <p className="text-xs text-slate-500 mb-4">Set up an interactive video webinar session for campus students.</p>

            <form onSubmit={handleCreateLiveSession} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={liveForm.companyName}
                    onChange={(e) => setLiveForm({ ...liveForm, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Speaker & Title *</label>
                  <input
                    type="text"
                    required
                    value={liveForm.speaker}
                    onChange={(e) => setLiveForm({ ...liveForm, speaker: e.target.value })}
                    placeholder="e.g. SDE-3 Tech Lead"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Topic *</label>
                <input
                  type="text"
                  required
                  value={liveForm.title}
                  onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })}
                  placeholder="e.g. System Design Expectations & Engineering Culture"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={liveForm.date}
                    onChange={(e) => setLiveForm({ ...liveForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={liveForm.time}
                    onChange={(e) => setLiveForm({ ...liveForm, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting URL</label>
                <input
                  type="url"
                  value={liveForm.joinUrl}
                  onChange={(e) => setLiveForm({ ...liveForm, joinUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLiveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Publish Webinar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT PLACEMENT FEEDBACK                                          */}
      {/* ========================================================================= */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {isStudent ? 'Submit Student Placement Feedback' : isRecruiter ? 'Submit Recruiter Assessment' : 'Log Placement Feedback'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Your evaluation feeds directly into the continuous quality improvement loop.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Drive</label>
                  <select
                    value={feedbackForm.companyName}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HCLTech">HCLTech</option>
                    <option value="TCS">TCS</option>
                    <option value="Accenture">Accenture</option>
                    <option value="Deloitte">Deloitte</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Overall Rating (1 to 5)</label>
                  <select
                    value={feedbackForm.rating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value={5}>â­â­â­â­â­ (5 - Exceptional)</option>
                    <option value={4}>â­â­â­â­ (4 - Very Good)</option>
                    <option value={3}>â­â­â­ (3 - Average)</option>
                    <option value={2}>â­â­ (2 - Needs Improvement)</option>
                    <option value={1}>â­ (1 - Unsatisfactory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Remarks / Feedback *</label>
                <textarea
                  rows="4"
                  required
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  placeholder={isStudent ? 'Describe your online test experience, problem types, and interview atmosphere...' : 'Evaluate candidate depth, coding cleanliness, and soft skills...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Submit to TPO Loop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG OFF-CAMPUS APPLICATION (STUDENT)                               */}
      {/* ========================================================================= */}
      {isOffCampusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">Log Off-Campus Opportunity & Milestone</h3>
            <p className="text-xs text-slate-500 mb-4">Track non-college recruitment drives and update outcomes for TPO records.</p>

            <form onSubmit={handleAddOffCampus} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={offCampusForm.companyName}
                    onChange={(e) => setOffCampusForm({ ...offCampusForm, companyName: e.target.value })}
                    placeholder="e.g. Uber / Amazon"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={offCampusForm.role}
                    onChange={(e) => setOffCampusForm({ ...offCampusForm, role: e.target.value })}
                    placeholder="e.g. SDE-1 (Graduate)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Offered CTC / Band</label>
                  <input
                    type="text"
                    value={offCampusForm.ctc}
                    onChange={(e) => setOffCampusForm({ ...offCampusForm, ctc: e.target.value })}
                    placeholder="e.g. ₹16.0 LPA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Milestone</label>
                  <select
                    value={offCampusForm.status}
                    onChange={(e) => setOffCampusForm({ ...offCampusForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Application Submitted">Application Submitted</option>
                    <option value="Online Assessment Cleared">Online Assessment Cleared</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Offer Received">Offer Received ðŸŽ‰</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application / Job Link</label>
                <input
                  type="url"
                  value={offCampusForm.link}
                  onChange={(e) => setOffCampusForm({ ...offCampusForm, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOffCampusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: POST INTERNSHIP                                                    */}
      {/* ========================================================================= */}
      {isInternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">Post New Corporate Internship Opportunity</h3>
            <p className="text-xs text-slate-500 mb-4">Add a verified summer or winter internship opening for students.</p>

            <form onSubmit={handleCreateInternship} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={internForm.companyName}
                    onChange={(e) => setInternForm({ ...internForm, companyName: e.target.value })}
                    placeholder="e.g. Cisco"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internship Role *</label>
                  <input
                    type="text"
                    required
                    value={internForm.role}
                    onChange={(e) => setInternForm({ ...internForm, role: e.target.value })}
                    placeholder="e.g. Cloud Security Intern"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Stipend</label>
                  <input
                    type="text"
                    value={internForm.stipend}
                    onChange={(e) => setInternForm({ ...internForm, stipend: e.target.value })}
                    placeholder="₹60,000 / month"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={internForm.deadline}
                    onChange={(e) => setInternForm({ ...internForm, deadline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInternModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Post Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
