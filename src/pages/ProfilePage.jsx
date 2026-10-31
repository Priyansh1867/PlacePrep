import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Settings,
  Bell,
  CheckCircle2,
  Edit2,
  Plus,
  Home,
  Briefcase,
  User as UserIcon,
  Video,
  FileCheck2,
  Calendar,
  Trophy,
  FileText,
  Rocket,
  HelpCircle,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Lock,
  ExternalLink,
  Code2,
  Award,
  Layers,
  Heart,
  BookOpen,
  X,
  Check,
  AlertTriangle,
  Globe,
  Share2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, saveRegisteredUser, findRegisteredUser, getPushNotifications } from '../services/storage';
import { UserApi } from '../services/api';
import { calculateProfileCompletion, REQUIRED_PROFILE_FIELDS } from '../utils/profileCompletion';
import PlacePrepLogo from '../components/PlacePrepLogo';

export default function ProfilePage({ onNavigate, onBack, onOpenSettings, onOpenNotifications }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState('basic-details');
  const [unreadNotifCount, setUnreadNotifCount] = useState(2);

  // Edit Field Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editField, setEditField] = useState('fullName');
  const [editLabel, setEditLabel] = useState('Full Name');
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');

  // Complex Item Modals (Internship, Project, Skill)
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [internshipForm, setInternshipForm] = useState({ company: '', role: '', duration: '', description: '' });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', techStack: '', description: '' });

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [educationForm, setEducationForm] = useState({
    college: '',
    branch: '',
    graduationBatch: '',
    cgpa: '',
    tenthPercentage: '',
    tenthBoard: '',
    tenthSchool: '',
    tenthYear: '',
    twelfthPercentage: '',
    twelfthBoard: '',
    twelfthSchool: '',
    twelfthYear: ''
  });

  const [changeRequests, setChangeRequests] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Synchronize on mount with backend and local storage
  useEffect(() => {
    const syncUser = async () => {
      const active = getCurrentUser();
      if (!active) return;
      try {
        const remote = await UserApi.getMe();
        if (remote && remote.email) {
          const merged = { ...active, ...remote };
          setUser(merged);
          setCurrentUser(merged);
          return;
        }
      } catch {
        // Fallback to registered users store
      }

      if (active.email) {
        const saved = findRegisteredUser(active.email);
        if (saved) {
          setUser(saved);
        }
      }
    };
    syncUser();
  }, []);

  useEffect(() => {
    const handleUserUpdate = (e) => {
      if (e.detail) setUser(e.detail);
    };
    window.addEventListener('user-changed', handleUserUpdate);
    return () => window.removeEventListener('user-changed', handleUserUpdate);
  }, []);

  useEffect(() => {
    const notifs = getPushNotifications();
    setUnreadNotifCount(notifs.filter(n => !n.read).length);
  }, []);

  // Dynamic Profile Completion Calculation based purely on genuine saved data
  const completion = useMemo(() => {
    return calculateProfileCompletion(user);
  }, [user]);

  // Modal Opener for individual field edit
  const openFieldModal = (fieldName, label, currentValue) => {
    setEditField(fieldName);
    setEditLabel(label);
    setEditValue(currentValue && currentValue !== 'Not provided' && currentValue !== 'Not specified' ? currentValue : '');
    setEditReason('');
    setIsModalOpen(true);
  };

  // Handler for "Complete My Profile" button
  const handleCompleteProfileClick = () => {
    if (completion.isComplete) return;
    const target = completion.firstMissingField;
    if (!target) return;

    setActiveTab(target.section);
    if (target.section === 'education-details') {
      openEducationModal();
    } else {
      openFieldModal(target.key, target.label, user?.[target.key]);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Save single field update
  const handleSaveField = async (e) => {
    e.preventDefault();
    if (!editField) return;

    const updatedUser = {
      ...(user || {}),
      [editField]: editValue.trim()
    };

    if (editField === 'fullName') {
      updatedUser.name = editValue.trim();
    } else if (editField === 'rollNumber') {
      if (!updatedUser.supersetId) {
        updatedUser.supersetId = editValue.trim();
      }
    }

    // Persist to state and storage
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    saveRegisteredUser(updatedUser);

    // Try backend persistence if user has ID
    if (updatedUser.id) {
      try {
        await UserApi.updateProfile(updatedUser);
      } catch (err) {
        console.warn('Backend profile update deferred:', err);
      }
    }

    // Add audit change request entry
    const newReq = {
      id: `req-${Date.now()}`,
      field: editLabel,
      newValue: editValue.trim() || 'Cleared',
      reason: editReason || 'Student direct profile update',
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Updated & Saved'
    };
    setChangeRequests(prev => [newReq, ...prev]);

    setIsModalOpen(false);
    showToast(`Profile ${editLabel} saved successfully!`);
  };

  // Education Modal Handlers
  const openEducationModal = () => {
    setEducationForm({
      college: user?.college || '',
      branch: user?.branch || '',
      graduationBatch: user?.graduationBatch || '',
      cgpa: user?.cgpa || '',
      tenthPercentage: user?.tenthPercentage || '',
      tenthBoard: user?.class10Board || '',
      tenthSchool: user?.class10School || '',
      tenthYear: user?.class10Year || '',
      twelfthPercentage: user?.twelfthPercentage || '',
      twelfthBoard: user?.class12Board || '',
      twelfthSchool: user?.class12School || '',
      twelfthYear: user?.class12Year || ''
    });
    setIsEducationModalOpen(true);
  };

  const handleSaveEducation = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...(user || {}),
      college: educationForm.college.trim(),
      branch: educationForm.branch.trim(),
      graduationBatch: educationForm.graduationBatch.trim() || user?.graduationBatch || '2028',
      cgpa: educationForm.cgpa.trim(),
      tenthPercentage: educationForm.tenthPercentage.trim(),
      class10Percentage: educationForm.tenthPercentage.trim(),
      class10Board: educationForm.tenthBoard.trim(),
      class10School: educationForm.tenthSchool.trim(),
      class10Year: educationForm.tenthYear.trim(),
      twelfthPercentage: educationForm.twelfthPercentage.trim(),
      class12Percentage: educationForm.twelfthPercentage.trim(),
      class12Board: educationForm.twelfthBoard.trim(),
      class12School: educationForm.twelfthSchool.trim(),
      class12Year: educationForm.twelfthYear.trim()
    };

    setUser(updatedUser);
    setCurrentUser(updatedUser);
    saveRegisteredUser(updatedUser);
    setIsEducationModalOpen(false);
    showToast('Education details updated successfully!');
  };

  // Internship Handlers
  const handleSaveInternship = (e) => {
    e.preventDefault();
    if (!internshipForm.company || !internshipForm.role) return;

    const currentList = Array.isArray(user?.internships) ? [...user.internships] : [];
    const newEntry = {
      id: `intern-${Date.now()}`,
      company: internshipForm.company.trim(),
      role: internshipForm.role.trim(),
      duration: internshipForm.duration.trim() || 'Duration not specified',
      description: internshipForm.description.trim() || ''
    };
    currentList.push(newEntry);

    const updatedUser = { ...(user || {}), internships: currentList };
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    saveRegisteredUser(updatedUser);
    setInternshipForm({ company: '', role: '', duration: '', description: '' });
    setIsInternshipModalOpen(false);
    showToast('Internship record added successfully!');
  };

  const handleDeleteInternship = (id) => {
    const currentList = Array.isArray(user?.internships) ? user.internships.filter(i => i.id !== id) : [];
    const updatedUser = { ...(user || {}), internships: currentList };
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    saveRegisteredUser(updatedUser);
    showToast('Internship record removed.');
  };

  // Project Handlers
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectForm.title) return;

    const currentList = Array.isArray(user?.projects) ? [...user.projects] : [];
    const newEntry = {
      id: `proj-${Date.now()}`,
      title: projectForm.title.trim(),
      techStack: projectForm.techStack.trim() || 'Software Development',
      description: projectForm.description.trim() || ''
    };
    currentList.push(newEntry);

    const updatedUser = { ...(user || {}), projects: currentList };
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    saveRegisteredUser(updatedUser);
    setProjectForm({ title: '', techStack: '', description: '' });
    setIsProjectModalOpen(false);
    showToast('Project added successfully!');
  };

  const handleDeleteProject = (id) => {
    const currentList = Array.isArray(user?.projects) ? user.projects.filter(p => p.id !== id) : [];
    const updatedUser = { ...(user || {}), projects: currentList };
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    saveRegisteredUser(updatedUser);
    showToast('Project record removed.');
  };

  // Skill Handlers
  const handleAddSkills = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;

    const rawList = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    const existing = Array.isArray(user?.skills) ? [...user.skills] : [];
    const combined = Array.from(new Set([...existing, ...rawList]));

    const updatedUser = { ...(user || {}), skills: combined };
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    saveRegisteredUser(updatedUser);
    setSkillInput('');
    setIsSkillModalOpen(false);
    showToast('Technical skills updated!');
  };

  const handleDeleteSkill = (skillToDelete) => {
    const existing = Array.isArray(user?.skills) ? user.skills.filter(s => s !== skillToDelete) : [];
    const updatedUser = { ...(user || {}), skills: existing };
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    saveRegisteredUser(updatedUser);
    showToast(`Removed skill "${skillToDelete}".`);
  };

  const sidebarMenuItems = [
    { id: 'basic-details', label: 'Basic Details' },
    { id: 'education-details', label: 'Education Details' },
    { id: 'internship', label: 'Internship & Work Ex' },
    { id: 'skills', label: 'Skills, Subjects & Languages' },
    { id: 'responsibilities', label: 'Position of Responsibilities' },
    { id: 'projects', label: 'Projects' },
    { id: 'accomplishments', label: 'Accomplishments', hasNew: false },
    { id: 'volunteering', label: 'Volunteering' },
    { id: 'extra-curricular', label: 'Extra-curricular Activities' },
    { id: 'resume-docs', label: 'Resume, Docs & Write-ups' },
  ];

  const appNavRail = [
    { id: 'home', icon: Home, label: 'Home', action: () => onNavigate?.('gateway') },
    { id: 'job-profiles', icon: Briefcase, label: 'Job Profiles', action: () => onNavigate?.('companies') },
    { id: 'profile', icon: UserIcon, label: 'My Profile', active: true },
    { id: 'interviews', icon: Video, label: 'Interviews', action: () => onNavigate?.('mock-interview') },
    { id: 'assessments', icon: FileCheck2, label: 'Assessments', action: () => onNavigate?.('prep') },
    { id: 'events', icon: Calendar, label: 'Events', action: () => onNavigate?.('drives') },
    { id: 'competitions', icon: Trophy, label: 'Competitions', action: () => onNavigate?.('workflow') },
    { id: 'resume', icon: FileText, label: 'Resume', action: () => onNavigate?.('institute-portal') },
    { id: 'launchpad', icon: Rocket, label: 'Launchpad', isNew: true, action: () => onNavigate?.('landing') },
    { id: 'help', icon: HelpCircle, label: 'Help', action: () => onNavigate?.('gateway') },
  ];

  // Genuine student data accessors (Strictly NO fake demo fallbacks)
  const userDisplayName = user?.fullName || user?.name || 'Not provided';
  const userSupersetId = user?.supersetId || user?.rollNumber || 'Not provided';
  const userRollNumber = user?.rollNumber || 'Not provided';
  const userGraduationBatch = user?.graduationBatch ? `${user.graduationBatch} Batch` : 'Not provided';
  const userDob = user?.dateOfBirth || 'Not provided';
  const userGender = user?.gender || 'Not provided';
  const userBloodGroup = user?.bloodGroup || 'Not provided';
  const userCategory = user?.category || user?.quota || 'Not provided';
  const userDifferentlyAbled = user?.differentlyAbled || 'Not provided';
  const userNationality = user?.nationality || 'Not provided';
  const userCollege = user?.college || 'Not provided';
  const userBranch = user?.branch || 'Not provided';
  const userPhone = user?.phone || user?.mobileNumber || 'Not provided';
  const userAltPhone = user?.altPhone || user?.alternateContact || 'Not provided';
  const userEmail = user?.email || 'Not provided';
  const userCurrentAddress = user?.currentAddress || user?.address || 'Not provided';
  const userPermanentAddress = user?.permanentAddress || 'Not provided';
  const userHometown = user?.hometown || 'Not provided';
  const userPincode = user?.pincode || 'Not provided';
  const userLinkedin = user?.linkedin || 'Not provided';
  const userGithub = user?.github || 'Not provided';
  const userPortfolio = user?.portfolio || 'Not provided';
  const userAvatar = user?.avatar;

  const renderValueCell = (value, fieldKey, label) => {
    const isMissing = !value || value === 'Not provided' || value === 'Not specified';
    return (
      <div className="flex items-center gap-3">
        <span className={`font-semibold ${isMissing ? 'text-slate-400 italic' : 'text-slate-800'}`}>
          {value || 'Not provided'}
        </span>
        <button
          type="button"
          onClick={() => openFieldModal(fieldKey, label, value)}
          className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer transition text-[11px]"
        >
          <Edit2 className="w-3 h-3" />
          <span>{isMissing ? 'Add' : 'Edit'}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111439] flex flex-col font-sans">
      
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        
        {/* Left: Previous Page Arrow + PlacePrep Logo + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#111439] font-semibold text-xs shadow-xs transition group cursor-pointer"
            title="Go to previous page"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate?.('gateway')}>
            <PlacePrepLogo className="w-6 h-6" theme="light" />
            <span className="font-bold text-base tracking-tight text-[#111439]">Placement & Student Profile</span>
          </div>
        </div>

        {/* Right side: [Settings] [Notifications] [Profile Avatar] */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:text-[#111439] hover:bg-slate-100 transition cursor-pointer"
            title="Account Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 hover:text-[#111439] hover:bg-slate-100 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          <div 
            onClick={() => setActiveTab('basic-details')} 
            className="flex items-center gap-2 pl-1 cursor-pointer group"
            title={`${userDisplayName} (${userSupersetId})`}
          >
            <div className="relative">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userDisplayName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-600 transition shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-500/20 shadow-xs">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. BODY LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Far-Left Thin Navigation Rail */}
        <nav className="w-16 bg-white border-r border-slate-200/80 flex flex-col items-center py-4 space-y-4 shrink-0 hidden md:flex">
          {appNavRail.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`relative flex flex-col items-center justify-center w-12 py-2 rounded-xl transition cursor-pointer group ${
                  item.active
                    ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={item.label}
              >
                {item.active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
                )}
                <Icon className="w-4 h-4" />
                <span className="text-[9px] mt-1 text-center truncate w-full px-1">{item.label}</span>
                {item.isNew && (
                  <span className="absolute -top-1 right-1 text-[8px] font-bold px-1 bg-emerald-600 text-white rounded-full">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Sidebar */}
        <aside className="w-64 sm:w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col shrink-0 overflow-y-auto">
          
          {/* User Profile Card */}
          <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
            <div className="relative mb-3">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userDisplayName}
                  className="w-20 h-20 rounded-full object-cover shadow-sm ring-4 ring-indigo-50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-sm ring-4 ring-indigo-50">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-1 right-1 p-1 bg-emerald-600 text-white rounded-full ring-2 ring-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 justify-center">
              <h2 className="font-bold text-base text-[#111439]">{userDisplayName}</h2>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            </div>

            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Roll / ID: <span className="text-slate-700 font-semibold">{userRollNumber}</span>
            </p>
          </div>

          {/* Navigation Items */}
          <div className="py-4 space-y-1">
            {sidebarMenuItems.map((menu) => {
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{menu.label}</span>
                  {menu.hasNew && (
                    <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 text-center space-y-2">
            <button
              onClick={() => onNavigate?.('mock-interview')}
              className="w-full py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Mock Interview (LIVE)</span>
            </button>
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 font-semibold text-xs transition cursor-pointer"
            >
              Open Student Dashboard
            </button>
          </div>
        </aside>

        {/* 3. MAIN CONTENT PANE */}
        <main className="flex-1 bg-white overflow-y-auto p-6 sm:p-10">
          
          {/* Top Banner Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Previous Page</span>
            </button>

            <span className="text-xs font-semibold text-slate-400">
              Placement Profile • Season 2026-2027
            </span>
          </div>

          {/* REQUIREMENT 3: INCOMPLETE PROFILE ALERT OR PROFILE COMPLETE STATUS */}
          {!completion.isComplete ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 shadow-sm space-y-3 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 mt-0.5 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-amber-900">Profile Incomplete</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-200/80 text-amber-800">
                        {completion.percentage}% Completed
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                      Your profile currently contains only initial registration details. Please complete your contact, demographic, and educational records to become eligible for verified placement drives.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteProfileClick}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Complete My Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Progress Bar based on actual persisted data */}
              <div className="space-y-1 pt-1 border-t border-amber-200/60">
                <div className="w-full bg-amber-200/70 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-amber-800 font-medium">
                  <span>{completion.completedRequiredCount} of {completion.totalRequiredCount} required profile fields completed</span>
                  <span>{completion.percentage}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm flex items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-emerald-900">Profile Complete</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-200 text-emerald-800">
                      100% Completed
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    All required placement profile records are filled and ready for verified campus drives.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0">
                <Check className="w-4 h-4" />
                <span>Verified Ready</span>
              </div>
            </div>
          )}

          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic-details' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in duration-200">
              
              <div>
                <h1 className="text-2xl font-black text-[#111439] tracking-tight">Basic Details</h1>
                <p className="text-xs text-slate-500 mt-1">
                  View and update your personal, academic identification, contact, and professional social profiles.
                </p>
              </div>

              {/* Section 1: Personal & Demographic Information */}
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-[#111439] uppercase tracking-wide">
                    Personal & Demographic Information
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">Official Identification</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Full Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Full Name :</span>
                    {renderValueCell(userDisplayName, 'fullName', 'Full Name')}
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Date of Birth :</span>
                    {renderValueCell(userDob, 'dateOfBirth', 'Date of Birth')}
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Gender :</span>
                    {renderValueCell(userGender, 'gender', 'Gender')}
                  </div>

                  {/* Blood Group */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Blood Group :</span>
                    {renderValueCell(userBloodGroup, 'bloodGroup', 'Blood Group')}
                  </div>

                  {/* Category / Quota */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Category / Quota :</span>
                    {renderValueCell(userCategory, 'category', 'Category / Quota')}
                  </div>

                  {/* Differently Abled (PwD) */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Differently Abled (PwD) :</span>
                    {renderValueCell(userDifferentlyAbled, 'differentlyAbled', 'Differently Abled (PwD)')}
                  </div>

                  {/* Nationality */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Nationality :</span>
                    {renderValueCell(userNationality, 'nationality', 'Nationality')}
                  </div>
                </div>
              </div>

              {/* Section 2: Institution & Academic Records */}
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-[#111439] uppercase tracking-wide">
                    Academic Registration Details
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">Campus Enrollment</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* College */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">College / University :</span>
                    {renderValueCell(userCollege, 'college', 'College / University')}
                  </div>

                  {/* Branch */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Branch / Department :</span>
                    {renderValueCell(userBranch, 'branch', 'Branch / Department')}
                  </div>

                  {/* Roll Number */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Roll Number :</span>
                    {renderValueCell(userRollNumber, 'rollNumber', 'Roll Number')}
                  </div>

                  {/* Graduation Batch */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Graduation Batch :</span>
                    {renderValueCell(userGraduationBatch, 'graduationBatch', 'Graduation Batch')}
                  </div>

                  {/* Superset ID */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Superset ID :</span>
                    {renderValueCell(userSupersetId, 'supersetId', 'Superset ID')}
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Residential Details */}
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-[#111439] uppercase tracking-wide">
                    Contact & Residential Details
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">Communication Channels</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Email */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Official University Email :</span>
                    {renderValueCell(userEmail, 'email', 'Official University Email')}
                  </div>

                  {/* Primary Mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Primary Mobile Number :</span>
                    {renderValueCell(userPhone, 'phone', 'Primary Mobile Number')}
                  </div>

                  {/* Alternate Contact */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Alternate Mobile :</span>
                    {renderValueCell(userAltPhone, 'altPhone', 'Alternate Mobile')}
                  </div>

                  {/* Current / Hostel Address */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Current / Hostel Address :</span>
                    {renderValueCell(userCurrentAddress, 'currentAddress', 'Current Address')}
                  </div>

                  {/* Permanent Residential Address */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Permanent Address :</span>
                    {renderValueCell(userPermanentAddress, 'permanentAddress', 'Permanent Address')}
                  </div>

                  {/* Hometown & State */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Hometown & State :</span>
                    {renderValueCell(userHometown, 'hometown', 'Hometown & State')}
                  </div>

                  {/* Pincode */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Pincode :</span>
                    {renderValueCell(userPincode, 'pincode', 'Pincode')}
                  </div>
                </div>
              </div>

              {/* Section 4: Social & Professional Profiles */}
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-[#111439] uppercase tracking-wide">
                    Social & Professional Profiles
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">Recruiter Visibility</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* LinkedIn */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">LinkedIn Profile :</span>
                    {renderValueCell(userLinkedin, 'linkedin', 'LinkedIn Profile')}
                  </div>

                  {/* GitHub */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">GitHub Profile :</span>
                    {renderValueCell(userGithub, 'github', 'GitHub Profile')}
                  </div>

                  {/* Portfolio */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-52 text-slate-500 font-medium">Portfolio / Website :</span>
                    {renderValueCell(userPortfolio, 'portfolio', 'Portfolio Website')}
                  </div>
                </div>
              </div>

              {/* Section 5: Change Requests & History */}
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-[#111439] uppercase tracking-wide">
                    Change Requests & Audit Log
                  </h2>
                  <button
                    onClick={() => openFieldModal('fullName', 'Full Name', userDisplayName)}
                    className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New change request</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
                  <p className="text-slate-500">
                    Profile updates are validated and stored against your verified student record.
                  </p>
                  {changeRequests.length === 0 ? (
                    <p className="text-slate-400 italic">No historical change requests logged.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {changeRequests.map((req) => (
                        <div key={req.id} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{req.field}:</span>{' '}
                            <span className="text-indigo-600 font-medium">{req.newValue}</span>
                            <p className="text-[11px] text-slate-500">{req.reason}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EDUCATION DETAILS */}
          {activeTab === 'education-details' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#111439] tracking-tight">Education Details</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Your verified 10th, 12th/Diploma, and undergraduate academic records.
                  </p>
                </div>
                <button
                  onClick={openEducationModal}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Academic Records</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Undergraduate Record */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#111439]">
                        Bachelor of Technology (B.Tech) - {user?.branch || 'Engineering'}
                      </h3>
                      <p className="text-xs text-slate-500">{userCollege}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                      CGPA: {user?.cgpa ? `${user.cgpa} / 10` : 'Not provided'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block">Graduation Batch</span>
                      <span className="font-semibold">{user?.graduationBatch || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Roll / Reg Number</span>
                      <span className="font-semibold">{userRollNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Academic Standing</span>
                      <span className="font-semibold text-emerald-600">Active</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Degree Level</span>
                      <span className="font-semibold text-indigo-600">Undergraduate</span>
                    </div>
                  </div>
                </div>

                {/* Class XII Record */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#111439]">Class XII (Senior Secondary) / Diploma</h3>
                      <p className="text-xs text-slate-500">
                        {user?.class12Board ? `${user.class12Board} • ${user.class12School || ''}` : 'Board / School not provided'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
                      Aggregate: {user?.twelfthPercentage ? `${user.twelfthPercentage}%` : 'Not provided'}
                    </span>
                  </div>
                  {user?.class12Year && (
                    <p className="text-xs text-slate-400">Passing Year: {user.class12Year}</p>
                  )}
                </div>

                {/* Class X Record */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#111439]">Class X (Secondary Examination)</h3>
                      <p className="text-xs text-slate-500">
                        {user?.class10Board ? `${user.class10Board} • ${user.class10School || ''}` : 'Board / School not provided'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
                      Aggregate: {user?.tenthPercentage ? `${user.tenthPercentage}%` : 'Not provided'}
                    </span>
                  </div>
                  {user?.class10Year && (
                    <p className="text-xs text-slate-400">Passing Year: {user.class10Year}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERNSHIP & WORK EX */}
          {activeTab === 'internship' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#111439] tracking-tight">Internship & Work Experience</h1>
                  <p className="text-xs text-slate-500 mt-1">Industry internships, apprenticeships, and research roles.</p>
                </div>
                <button
                  onClick={() => setIsInternshipModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Internship</span>
                </button>
              </div>

              {Array.isArray(user?.internships) && user.internships.length > 0 ? (
                <div className="space-y-4">
                  {user.internships.map((intern) => (
                    <div key={intern.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[#111439]">{intern.role} • {intern.company}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{intern.duration}</span>
                          <button
                            onClick={() => handleDeleteInternship(intern.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete internship"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {intern.description && (
                        <p className="text-slate-600 leading-relaxed">{intern.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700 text-sm">No Internship Records Provided</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have not added any internship or industry experience yet. Click "Add Internship" to document your work.
                  </p>
                  <button
                    onClick={() => setIsInternshipModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs transition hover:bg-indigo-100 cursor-pointer"
                  >
                    Add My First Internship
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SKILLS & SUBJECTS */}
          {activeTab === 'skills' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#111439] tracking-tight">Skills, Subjects & Languages</h1>
                  <p className="text-xs text-slate-500 mt-1">Technical competencies, computer science fundamentals, and spoken languages.</p>
                </div>
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skills</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Technical Skills */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-[#111439]">Technical Skills</h3>
                  {Array.isArray(user?.skills) && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {user.skills.map(s => (
                        <span key={s} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 flex items-center gap-1.5">
                          <span>{s}</span>
                          <button
                            onClick={() => handleDeleteSkill(s)}
                            className="text-indigo-400 hover:text-rose-600"
                            title="Remove skill"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-slate-400 italic">
                      No technical skills listed yet. Click "Add Skills" to specify programming languages and frameworks.
                    </div>
                  )}
                </div>

                {/* Core Computer Science Subjects */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-[#111439]">Core Computer Science Subjects</h3>
                  {Array.isArray(user?.subjects) && user.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {user.subjects.map(s => (
                        <span key={s} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-slate-400 italic">
                      No core subjects listed yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-[#111439] tracking-tight">Projects</h1>
                  <p className="text-xs text-slate-500 mt-1">Academic, independent, and hackathon project portfolio.</p>
                </div>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {Array.isArray(user?.projects) && user.projects.length > 0 ? (
                <div className="space-y-4">
                  {user.projects.map((proj) => (
                    <div key={proj.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[#111439]">{proj.title}</h3>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-600">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.techStack.split(',').map((t, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                  <Rocket className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700 text-sm">No Projects Documented</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have not documented any engineering or development projects yet. Click "Add Project" to showcase your work to recruiters.
                  </p>
                  <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs transition hover:bg-indigo-100 cursor-pointer"
                  >
                    Add Project
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OTHER TABS */}
          {['responsibilities', 'accomplishments', 'volunteering', 'extra-curricular', 'resume-docs'].includes(activeTab) && (
            <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
              <h1 className="text-2xl font-black text-[#111439] tracking-tight capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
                <Award className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm capitalize">
                  No {activeTab.replace('-', ' ')} Records Added
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You have not added any verified credentials or submissions under this section yet.
                </p>
                <button
                  onClick={() => openFieldModal(activeTab, activeTab.replace('-', ' '), '')}
                  className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs transition hover:bg-indigo-100 cursor-pointer"
                >
                  Add Record
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 4. MODALS */}

      {/* Individual Field Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#111439]">Update {editLabel}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Field</label>
                <input
                  type="text"
                  value={editLabel}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Value</label>
                {editField === 'dateOfBirth' ? (
                  <input
                    type="date"
                    required
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                  />
                ) : editField === 'gender' ? (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : editField === 'bloodGroup' ? (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                ) : editField === 'category' ? (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                  >
                    <option value="">Select Category</option>
                    {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : editField === 'differentlyAbled' ? (
                  <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                  >
                    <option value="">Select PwD Status</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`Enter ${editLabel}`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Note (Optional)</label>
                <textarea
                  rows="2"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Correcting official spelling or contact info"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Education Modal */}
      {isEducationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#111439]">Update Academic & Education Details</h3>
              <button onClick={() => setIsEducationModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEducation} className="space-y-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 border-b pb-1">Undergraduate B.Tech Record</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">College / University</label>
                    <input
                      type="text"
                      value={educationForm.college}
                      onChange={(e) => setEducationForm({ ...educationForm, college: e.target.value })}
                      placeholder="e.g. DTU, Delhi"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Branch / Department</label>
                    <input
                      type="text"
                      value={educationForm.branch}
                      onChange={(e) => setEducationForm({ ...educationForm, branch: e.target.value })}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Graduation Batch</label>
                    <input
                      type="text"
                      value={educationForm.graduationBatch}
                      onChange={(e) => setEducationForm({ ...educationForm, graduationBatch: e.target.value })}
                      placeholder="e.g. 2028"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Cumulative CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={educationForm.cgpa}
                      onChange={(e) => setEducationForm({ ...educationForm, cgpa: e.target.value })}
                      placeholder="e.g. 8.65"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <h4 className="font-bold text-slate-800 border-b pb-1">Class XII / Senior Secondary / Diploma</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Percentage / Aggregate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={educationForm.twelfthPercentage}
                      onChange={(e) => setEducationForm({ ...educationForm, twelfthPercentage: e.target.value })}
                      placeholder="e.g. 92.5"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Board / University</label>
                    <input
                      type="text"
                      value={educationForm.twelfthBoard}
                      onChange={(e) => setEducationForm({ ...educationForm, twelfthBoard: e.target.value })}
                      placeholder="e.g. CBSE / State Board"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <h4 className="font-bold text-slate-800 border-b pb-1">Class X / Secondary Record</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Percentage / Aggregate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={educationForm.tenthPercentage}
                      onChange={(e) => setEducationForm({ ...educationForm, tenthPercentage: e.target.value })}
                      placeholder="e.g. 95.0"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Board</label>
                    <input
                      type="text"
                      value={educationForm.tenthBoard}
                      onChange={(e) => setEducationForm({ ...educationForm, tenthBoard: e.target.value })}
                      placeholder="e.g. CBSE / ICSE"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEducationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Academic Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internship Modal */}
      {isInternshipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#111439]">Add Internship Experience</h3>
              <button onClick={() => setIsInternshipModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveInternship} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={internshipForm.company}
                  onChange={(e) => setInternshipForm({ ...internshipForm, company: e.target.value })}
                  placeholder="e.g. Google, Microsoft, Startup"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={internshipForm.role}
                  onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })}
                  placeholder="e.g. Software Engineer Intern"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={internshipForm.duration}
                  onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                  placeholder="e.g. Jun 2025 - Aug 2025"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={internshipForm.description}
                  onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                  placeholder="Key responsibilities, technologies utilized, and impact."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInternshipModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Add Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skills Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#111439]">Add Technical Skills</h3>
              <button onClick={() => setIsSkillModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSkills} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. Java, Python, React, SQL, Docker"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">Separate multiple skills with a comma.</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Skills
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#111439]">Add Project Record</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. Distributed Task Scheduler"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                  placeholder="e.g. Go, Redis, Docker"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Overview</label>
                <textarea
                  rows="3"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Architecture, implementation highlights, and outcomes."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
