import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  ShieldCheck,
  FolderGit2,
  Trophy,
  HeartHandshake,
  Sparkles,
  FileText,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  ExternalLink,
  ChevronRight,
  Check,
  Copy,
  AlertCircle
} from 'lucide-react';
import { UserApi } from '../../services/api';
import {
  getCurrentUser,
  getFullStudentProfile,
  saveFullStudentProfile,
  generateUniqueStudentId
} from '../../services/storage';

const SECTIONS = [
  { id: 'basic', label: 'Basic Details', icon: User },
  { id: 'education', label: 'Education Details', icon: GraduationCap },
  { id: 'internship', label: 'Internship & Work Ex', icon: Briefcase },
  { id: 'skills', label: 'Skills, Subjects & Languages', icon: Code2 },
  { id: 'responsibilities', label: 'Position of Responsibilities', icon: ShieldCheck },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'accomplishments', label: 'Accomplishments', icon: Trophy },
  { id: 'volunteering', label: 'Volunteering', icon: HeartHandshake },
  { id: 'extracurricular', label: 'Extra-curricular Activities', icon: Sparkles },
  { id: 'resume_docs', label: 'Resume, Docs & Write-ups', icon: FileText },
  { id: 'guardians', label: 'Guardians', icon: Users }
];

export default function UserProfileModal({ isOpen, onClose, onProfileUpdated }) {

  const dialogRef = useRef(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState(() => getFullStudentProfile(getCurrentUser()));
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);


  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab') return;
      const items = [...(dialogRef.current?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || [])].filter(item => item.getClientRects().length);
      if (!items.length) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === items[0] || document.activeElement === dialogRef.current)) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown',handleKey); previousFocus?.focus?.(); };
  }, [isOpen,onClose]);

  // Temporary inputs for skills
  const [newTechSkill, setNewTechSkill] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // Re-sync with backend database and storage on mount
  useEffect(() => {
    if (!isOpen) return;
    const user = getCurrentUser();
    if (!user) return;
    const local = getFullStudentProfile(user);
    setProfile(local);

    if (user.email) {
      UserApi.getStudentFullProfile(user.email).then((remoteData) => {
        if (!remoteData) return;
        let parsed = null;
        if (typeof remoteData === 'string') {
          try { parsed = JSON.parse(remoteData); } catch {}
        } else if (remoteData && typeof remoteData === 'object') {
          if (remoteData.basicDetails) {
            parsed = remoteData;
          } else if (remoteData.user) {
            parsed = {
              ...local,
              basicDetails: {
                ...local.basicDetails,
                fullName: remoteData.user.name || local.basicDetails.fullName,
                email: remoteData.user.email || local.basicDetails.email,
                phone: remoteData.user.phone || local.basicDetails.phone,
              },
              educationDetails: {
                ...local.educationDetails,
                rollNumber: remoteData.user.rollNumber || local.educationDetails.rollNumber,
                college: remoteData.user.college || local.educationDetails.college,
                branch: remoteData.user.branch || local.educationDetails.branch,
                graduationBatch: remoteData.user.graduationBatch || local.educationDetails.graduationBatch,
              }
            };
          }
        }
        if (parsed && parsed.basicDetails) {
          setProfile(parsed);
          saveFullStudentProfile(parsed, user);
        }
      }).catch((err) => {
        console.warn('Failed to fetch remote profile from DB:', err);
      });
    }
  }, [isOpen]);

  const handleCopyId = () => {
    if (profile?.uniqueStudentId) {
      navigator.clipboard?.writeText(profile.uniqueStudentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const user = getCurrentUser();
    saveFullStudentProfile(profile, user);

    try {
      if (user?.email) {
        await UserApi.saveStudentFullProfile(profile, user.email);
      }
      setSaveSuccessMsg('Profile details synchronized with database successfully!');
    } catch (err) {
      console.warn('Backend profile save warning:', err);
      setSaveSuccessMsg('Saved on this device. Database sync failed; reconnect and save again.');
    } finally {
      setIsSaving(false);
      if (onProfileUpdated) onProfileUpdated(profile);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateBasic('profilePhoto', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Updaters for nested state
  const updateBasic = (field, val) => {
    setProfile(prev => ({
      ...prev,
      basicDetails: { ...prev.basicDetails, [field]: val }
    }));
  };

  const updateEducation = (field, val) => {
    setProfile(prev => ({
      ...prev,
      educationDetails: { ...prev.educationDetails, [field]: val }
    }));
  };

  const updateGuardians = (field, val) => {
    setProfile(prev => ({
      ...prev,
      guardians: { ...prev.guardians, [field]: val }
    }));
  };

  const updateDocuments = (field, val) => {
    setProfile(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: val }
    }));
  };

  // Skill Add / Remove
  const addTechSkill = () => {
    if (!newTechSkill.trim()) return;
    setProfile(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: [...(prev.skills?.technical || []), newTechSkill.trim()]
      }
    }));
    setNewTechSkill('');
  };

  const removeTechSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: prev.skills.technical.filter((_, i) => i !== index)
      }
    }));
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setProfile(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        coreSubjects: [...(prev.skills?.coreSubjects || []), newSubject.trim()]
      }
    }));
    setNewSubject('');
  };

  const removeSubject = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        coreSubjects: prev.skills.coreSubjects.filter((_, i) => i !== index)
      }
    }));
  };

  // Work Ex Add / Delete
  const addWorkEx = () => {
    const newItem = {
      id: `work-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      currentlyWorking: true,
      stipend: '',
      description: ''
    };
    setProfile(prev => ({
      ...prev,
      workExperiences: [newItem, ...(prev.workExperiences || [])]
    }));
  };

  const updateWorkEx = (index, field, val) => {
    setProfile(prev => {
      const copy = [...(prev.workExperiences || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, workExperiences: copy };
    });
  };

  const deleteWorkEx = (index) => {
    setProfile(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index)
    }));
  };

  // Projects Add / Delete
  const addProject = () => {
    const newItem = {
      id: `proj-${Date.now()}`,
      title: '',
      techStack: '',
      liveUrl: '',
      githubUrl: '',
      duration: '',
      description: ''
    };
    setProfile(prev => ({
      ...prev,
      projects: [newItem, ...(prev.projects || [])]
    }));
  };

  const updateProject = (index, field, val) => {
    setProfile(prev => {
      const copy = [...(prev.projects || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, projects: copy };
    });
  };

  const deleteProject = (index) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Responsibilities Add / Delete
  const addResponsibility = () => {
    const newItem = {
      id: `por-${Date.now()}`,
      title: '',
      organization: '',
      duration: '',
      description: ''
    };
    setProfile(prev => ({
      ...prev,
      responsibilities: [newItem, ...(prev.responsibilities || [])]
    }));
  };

  const updateResponsibility = (index, field, val) => {
    setProfile(prev => {
      const copy = [...(prev.responsibilities || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, responsibilities: copy };
    });
  };

  const deleteResponsibility = (index) => {
    setProfile(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  // Accomplishments Add / Delete
  const addAccomplishment = () => {
    const newItem = {
      id: `acc-${Date.now()}`,
      title: '',
      category: '',
      issuedBy: '',
      year: '',
      description: ''
    };
    setProfile(prev => ({
      ...prev,
      accomplishments: [newItem, ...(prev.accomplishments || [])]
    }));
  };

  const updateAccomplishment = (index, field, val) => {
    setProfile(prev => {
      const copy = [...(prev.accomplishments || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, accomplishments: copy };
    });
  };

  const deleteAccomplishment = (index) => {
    setProfile(prev => ({
      ...prev,
      accomplishments: prev.accomplishments.filter((_, i) => i !== index)
    }));
  };

  // Volunteering Add / Delete
  const addVolunteering = () => {
    const newItem = {
      id: `vol-${Date.now()}`,
      organization: '',
      role: '',
      duration: '',
      description: ''
    };
    setProfile(prev => ({
      ...prev,
      volunteering: [newItem, ...(prev.volunteering || [])]
    }));
  };

  const updateVolunteering = (index, field, val) => {
    setProfile(prev => {
      const copy = [...(prev.volunteering || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, volunteering: copy };
    });
  };

  const deleteVolunteering = (index) => {
    setProfile(prev => ({
      ...prev,
      volunteering: prev.volunteering.filter((_, i) => i !== index)
    }));
  };

  // Extra-curricular Add / Delete
  const addExtraCurricular = () => {
    const newItem = {
      id: `ec-${Date.now()}`,
      activity: '',
      role: '',
      year: '',
      description: ''
    };
    setProfile(prev => ({
      ...prev,
      extraCurricular: [newItem, ...(prev.extraCurricular || [])]
    }));
  };

  const updateExtraCurricular = (index, field, val) => {
    setProfile(prev => {
      const copy = [...(prev.extraCurricular || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, extraCurricular: copy };
    });
  };

  const deleteExtraCurricular = (index) => {
    setProfile(prev => ({
      ...prev,
      extraCurricular: prev.extraCurricular.filter((_, i) => i !== index)
    }));
  };

  const completionFields = [profile.basicDetails?.fullName, profile.basicDetails?.email, profile.basicDetails?.phone, profile.basicDetails?.dateOfBirth, profile.educationDetails?.college, profile.educationDetails?.branch, profile.educationDetails?.graduationBatch, profile.educationDetails?.rollNumber];
  const profileCompletion = Math.round(completionFields.filter(value => value != null && String(value).trim() !== '').length / completionFields.length * 100);

  if (!isOpen) return null;

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Your profile" tabIndex={-1} className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full h-[94vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-900 animate-scale-in">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              PP
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Placement & Student Profile
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  {profile.verified ? 'Verified Candidate' : 'Profile details'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                Manage all your personal information, academic credentials, and placement verification records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccessMsg && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner Mobile */}
        {saveSuccessMsg && (
          <div className="sm:hidden px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Main Body: Left Sidebar + Right Content Pane */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR (Matching the screenshot provided by user)    */}
          {/* ========================================================= */}
          <div className="w-full md:w-72 lg:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
            
            {/* User Avatar & Identity Card */}
            <div className="p-6 flex flex-col items-center text-center border-b border-slate-100 bg-gradient-to-b from-indigo-50/30 to-white">
              {/* Generated Tech Avatar (No Superset ID and No Private Photo as instructed) */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-violet-500 to-emerald-400 shadow-md">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-black uppercase overflow-hidden border-2 border-white">
                    {profile.basicDetails?.profilePhoto ? (
                      <img src={profile.basicDetails.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : profile.basicDetails?.fullName ? (
                      profile.basicDetails.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
                    ) : (
                      'PJ'
                    )}
                  </div>
                </div>
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition" title="Upload / Change Reference Profile Photo">
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" />
                </label>
              </div>

              {/* User Name with Green Verified Badge */}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  {profile.basicDetails?.fullName || getCurrentUser()?.name || 'Student'}
                </h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-500 text-white shrink-0" />
              </div>

              {/* Unique ID Generator Display (Replacing Superset ID as instructed) */}
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium">PlacePrep ID:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {profile.uniqueStudentId || 'Not assigned'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                  title="Copy Unique ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Navigation List - 11 Sections matching screenshot */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveTab(sec.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs border-l-4 border-indigo-600 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="truncate">{sec.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Completion Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Profile Readiness</span>
                <span className="text-emerald-600 font-bold">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANE: SELECTED SECTION CONTENT & INTERACTIVE FORM   */}
          {/* ========================================================= */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-50/30">
            
            {/* 1. BASIC DETAILS */}
            {activeTab === 'basic' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Basic Details</h3>
                    <p className="text-xs text-slate-500">
                      Primary candidate contact info, personal demographics, and social handles
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="self-start px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Basic Details</span>
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Personal Demographics</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profile.basicDetails?.fullName || ''}
                        onChange={(e) => updateBasic('fullName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Official University Email</label>
                      <input
                        type="email"
                        value={profile.basicDetails?.email || ''}
                        onChange={(e) => updateBasic('email', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Primary Mobile Number</label>
                      <input
                        type="tel"
                        value={profile.basicDetails?.phone || ''}
                        onChange={(e) => updateBasic('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={profile.basicDetails?.dateOfBirth || ''}
                        onChange={(e) => updateBasic('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gender</label>
                      <select
                        value={profile.basicDetails?.gender || ''}
                        onChange={(e) => updateBasic('gender', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                      ><option value="">Select an option</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={profile.basicDetails?.bloodGroup || ''}
                        onChange={(e) => updateBasic('bloodGroup', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category / Quota</label>
                      <select
                        value={profile.basicDetails?.category || ''}
                        onChange={(e) => updateBasic('category', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                      ><option value="">Select an option</option>
                        <option value="General">General (UR)</option>
                        <option value="OBC">OBC (Non-Creamy)</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">Economically Weaker Section (EWS)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Differently Abled (PwD)</label>
                      <select
                        value={profile.basicDetails?.differentlyAbled || ''}
                        onChange={(e) => updateBasic('differentlyAbled', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                      ><option value="">Select an option</option>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nationality</label>
                      <input
                        type="text"
                        value={profile.basicDetails?.nationality || ''}
                        onChange={(e) => updateBasic('nationality', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Residential Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Current / Hostel Address</label>
                      <textarea
                        rows={2}
                        value={profile.basicDetails?.currentAddress || ''}
                        onChange={(e) => updateBasic('currentAddress', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Permanent Residential Address</label>
                      <textarea
                        rows={2}
                        value={profile.basicDetails?.permanentAddress || ''}
                        onChange={(e) => updateBasic('permanentAddress', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hometown & State</label>
                      <input
                        type="text"
                        value={[profile.basicDetails?.hometown, profile.basicDetails?.state].filter(Boolean).join(', ')}
                        onChange={(e) => {
                          const parts = e.target.value.split(',');
                          updateBasic('hometown', parts[0]?.trim() || '');
                          if (parts[1]) updateBasic('state', parts[1]?.trim() || '');
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={profile.basicDetails?.pincode || ''}
                        onChange={(e) => updateBasic('pincode', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Online & Social Profiles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={profile.basicDetails?.linkedIn || ''}
                        onChange={(e) => updateBasic('linkedIn', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">GitHub Profile URL</label>
                      <input
                        type="url"
                        value={profile.basicDetails?.github || ''}
                        onChange={(e) => updateBasic('github', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Portfolio Website</label>
                      <input
                        type="url"
                        value={profile.basicDetails?.portfolio || ''}
                        onChange={(e) => updateBasic('portfolio', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        placeholder="https://yourname.dev"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">LeetCode / Coding Profile</label>
                      <input
                        type="url"
                        value={profile.basicDetails?.leetCode || ''}
                        onChange={(e) => updateBasic('leetCode', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        placeholder="https://leetcode.com/username"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. EDUCATION DETAILS */}
            {activeTab === 'education' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Education Details</h3>
                    <p className="text-xs text-slate-500">
                      Undergraduate degree, current CGPA, 10th & 12th board records used for corporate cutoffs
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="self-start px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Education</span>
                  </button>
                </div>

                {/* College / University Degree */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Current Degree / Graduation</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      Primary Placement Record
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">University / College Name</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.college || ''}
                        onChange={(e) => updateEducation('college', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Degree Program</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.degree || ''}
                        onChange={(e) => updateEducation('degree', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Discipline / Branch</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.branch || ''}
                        onChange={(e) => updateEducation('branch', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Graduation Batch Year</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.graduationBatch || ''}
                        onChange={(e) => updateEducation('graduationBatch', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">University Roll Number</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.rollNumber || ''}
                        onChange={(e) => updateEducation('rollNumber', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cumulative CGPA (out of 10.0)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={profile.educationDetails?.cgpa ?? ''}
                        onChange={(e) => updateEducation('cgpa', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-black text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Active Backlogs Count</label>
                      <input
                        type="number"
                        min="0"
                        value={profile.educationDetails?.activeBacklogs ?? ''}
                        onChange={(e) => updateEducation('activeBacklogs', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Total Academic Credits</label>
                      <input
                        type="number"
                        value={profile.educationDetails?.totalCreditsEarned || ''}
                        onChange={(e) => updateEducation('totalCreditsEarned', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Class XII / Intermediate */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Class XII / Higher Secondary (10+2)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">School / Junior College Name</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.twelfthSchool || ''}
                        onChange={(e) => updateEducation('twelfthSchool', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Board (CBSE / ICSE / State)</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.twelfthBoard || ''}
                        onChange={(e) => updateEducation('twelfthBoard', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Stream / Specialization</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.twelfthStream || ''}
                        onChange={(e) => updateEducation('twelfthStream', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Class XII Percentage (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={profile.educationDetails?.twelfthPercentage ?? ''}
                        onChange={(e) => updateEducation('twelfthPercentage', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Year of Passing</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.twelfthYear || ''}
                        onChange={(e) => updateEducation('twelfthYear', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Class X / Secondary */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Class X / Secondary School</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">School Name</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.tenthSchool || ''}
                        onChange={(e) => updateEducation('tenthSchool', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Class X Percentage / CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        value={profile.educationDetails?.tenthPercentage ?? ''}
                        onChange={(e) => updateEducation('tenthPercentage', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Year of Passing</label>
                      <input
                        type="text"
                        value={profile.educationDetails?.tenthYear || ''}
                        onChange={(e) => updateEducation('tenthYear', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. INTERNSHIP & WORK EX */}
            {activeTab === 'internship' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Internship & Work Experience</h3>
                    <p className="text-xs text-slate-500">
                      Corporate internships, industrial trainings, freelance contracts, and startup engagements
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addWorkEx}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Experience</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                {(!profile.workExperiences || profile.workExperiences.length === 0) ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No internship records added yet</p>
                    <p className="text-xs text-slate-500">Highlight your industry experience to strengthen your placement shortlisting.</p>
                    <button
                      type="button"
                      onClick={addWorkEx}
                      className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-indigo-100 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Internship</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.workExperiences.map((item, idx) => (
                      <div key={item.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            Experience #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteWorkEx(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Remove Experience"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Company / Organization</label>
                            <input
                              type="text"
                              value={item.company || ''}
                              onChange={(e) => updateWorkEx(idx, 'company', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Job Role / Designation</label>
                            <input
                              type="text"
                              value={item.role || ''}
                              onChange={(e) => updateWorkEx(idx, 'role', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Location / Work Mode</label>
                            <input
                              type="text"
                              value={item.location || ''}
                              onChange={(e) => updateWorkEx(idx, 'location', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                            <input
                              type="text"
                              value={item.startDate || ''}
                              onChange={(e) => updateWorkEx(idx, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g. May 2025"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">End Date</label>
                            <input
                              type="text"
                              value={item.endDate || ''}
                              onChange={(e) => updateWorkEx(idx, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g. July 2025 or Present"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Stipend / Compensation</label>
                            <input
                              type="text"
                              value={item.stipend || ''}
                              onChange={(e) => updateWorkEx(idx, 'stipend', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g. ₹35,000 / month"
                            />
                          </div>
                          <div className="sm:col-span-2 md:col-span-3">
                            <label className="block font-bold text-slate-700 mb-1">Key Responsibilities & Deliverables</label>
                            <textarea
                              rows={3}
                              value={item.description || ''}
                              onChange={(e) => updateWorkEx(idx, 'description', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                              placeholder="Bullet points on technologies used, impact created, metrics..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SKILLS, SUBJECTS & LANGUAGES */}
            {activeTab === 'skills' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Skills, Subjects & Languages</h3>
                    <p className="text-xs text-slate-500">
                      Programming stack, core computer science coursework, and spoken language proficiencies
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="self-start px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Skills</span>
                  </button>
                </div>

                {/* Technical Skills */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Technical Skills & Frameworks</h4>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTechSkill}
                      onChange={(e) => setNewTechSkill(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechSkill(); } }}
                      placeholder="Add skill (e.g. Java, Docker, Next.js, Kubernetes) & press enter"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={addTechSkill}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(profile.skills?.technical || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeTechSkill(idx)}
                          className="hover:text-rose-600 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Core Coursework */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Core CS Subjects & Coursework</h4>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
                      placeholder="Add subject (e.g. Operating Systems, System Design, DBMS) & press enter"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={addSubject}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(profile.skills?.coreSubjects || []).map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => removeSubject(idx)}
                          className="hover:text-rose-600 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Spoken Languages */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Languages Known & Proficiency</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {(profile.skills?.languages || []).map((langItem, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{langItem.language}</span>
                          <span className="text-slate-500 text-[11px]">{langItem.proficiency}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Added by you
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. POSITION OF RESPONSIBILITIES */}
            {activeTab === 'responsibilities' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Positions of Responsibility</h3>
                    <p className="text-xs text-slate-500">
                      Leadership roles in placement cells, technical societies, college festivals, and student councils
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addResponsibility}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Role</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(profile.responsibilities || []).map((item, idx) => (
                    <div key={item.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Responsibility #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteResponsibility(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Designation / Role Title</label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => updateResponsibility(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Club / Organization Name</label>
                          <input
                            type="text"
                            value={item.organization || ''}
                            onChange={(e) => updateResponsibility(idx, 'organization', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tenure / Duration</label>
                          <input
                            type="text"
                            value={item.duration || ''}
                            onChange={(e) => updateResponsibility(idx, 'duration', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">Key Impact & Tasks Handled</label>
                          <textarea
                            rows={2}
                            value={item.description || ''}
                            onChange={(e) => updateResponsibility(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Projects</h3>
                    <p className="text-xs text-slate-500">
                      Showcase software, hardware, and research initiatives with live demos and source code links
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addProject}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(profile.projects || []).map((proj, idx) => (
                    <div key={proj.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Project #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteProject(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Project Title</label>
                          <input
                            type="text"
                            value={proj.title || ''}
                            onChange={(e) => updateProject(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Duration / Timeline</label>
                          <input
                            type="text"
                            value={proj.duration || ''}
                            onChange={(e) => updateProject(idx, 'duration', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">Tech Stack Used</label>
                          <input
                            type="text"
                            value={proj.techStack || ''}
                            onChange={(e) => updateProject(idx, 'techStack', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. React, Spring Boot, MySQL, Docker"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Live Demo URL</label>
                          <input
                            type="url"
                            value={proj.liveUrl || ''}
                            onChange={(e) => updateProject(idx, 'liveUrl', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">GitHub / Code Repository</label>
                          <input
                            type="url"
                            value={proj.githubUrl || ''}
                            onChange={(e) => updateProject(idx, 'githubUrl', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://github.com/..."
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">Key Description & Highlights</label>
                          <textarea
                            rows={3}
                            value={proj.description || ''}
                            onChange={(e) => updateProject(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            placeholder="Explain the problem solved, architecture, and results..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. ACCOMPLISHMENTS */}
            {activeTab === 'accomplishments' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Accomplishments & Honors</h3>
                    <p className="text-xs text-slate-500">
                      National hackathons, competitive programming milestones, cloud certifications, and awards
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addAccomplishment}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Honor</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(profile.accomplishments || []).map((acc, idx) => (
                    <div key={acc.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Accomplishment #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteAccomplishment(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Title / Honor</label>
                          <input
                            type="text"
                            value={acc.title || ''}
                            onChange={(e) => updateAccomplishment(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Category</label>
                          <input
                            type="text"
                            value={acc.category || ''}
                            onChange={(e) => updateAccomplishment(idx, 'category', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            placeholder="Hackathon / CP / Certificate"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Year / Date</label>
                          <input
                            type="text"
                            value={acc.year || ''}
                            onChange={(e) => updateAccomplishment(idx, 'year', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="block font-bold text-slate-700 mb-1">Issuing Organization / Summary</label>
                          <textarea
                            rows={2}
                            value={acc.description || ''}
                            onChange={(e) => updateAccomplishment(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. VOLUNTEERING */}
            {activeTab === 'volunteering' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Volunteering & Social Service</h3>
                    <p className="text-xs text-slate-500">
                      Community service, NGO partnerships, literacy drives, and environmental initiatives
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addVolunteering}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Volunteer Record</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(profile.volunteering || []).map((vol, idx) => (
                    <div key={vol.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Volunteering #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteVolunteering(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Organization / NGO</label>
                          <input
                            type="text"
                            value={vol.organization || ''}
                            onChange={(e) => updateVolunteering(idx, 'organization', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Role / Initiative</label>
                          <input
                            type="text"
                            value={vol.role || ''}
                            onChange={(e) => updateVolunteering(idx, 'role', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={vol.duration || ''}
                            onChange={(e) => updateVolunteering(idx, 'duration', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">Summary of Contribution</label>
                          <textarea
                            rows={2}
                            value={vol.description || ''}
                            onChange={(e) => updateVolunteering(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. EXTRA-CURRICULAR ACTIVITIES */}
            {activeTab === 'extracurricular' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Extra-curricular Activities</h3>
                    <p className="text-xs text-slate-500">
                      Sports, cultural arts, debates, music, dramatics, and competitive club participations
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addExtraCurricular}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Activity</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(profile.extraCurricular || []).map((ec, idx) => (
                    <div key={ec.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Activity #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteExtraCurricular(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Activity / Sport / Club</label>
                          <input
                            type="text"
                            value={ec.activity || ''}
                            onChange={(e) => updateExtraCurricular(idx, 'activity', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Role / Position</label>
                          <input
                            type="text"
                            value={ec.role || ''}
                            onChange={(e) => updateExtraCurricular(idx, 'role', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Year</label>
                          <input
                            type="text"
                            value={ec.year || ''}
                            onChange={(e) => updateExtraCurricular(idx, 'year', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">Key Highlights</label>
                          <textarea
                            rows={2}
                            value={ec.description || ''}
                            onChange={(e) => updateExtraCurricular(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. RESUME, DOCS & WRITE-UPS */}
            {activeTab === 'resume_docs' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Resume, Docs & Write-ups</h3>
                    <p className="text-xs text-slate-500">
                      Primary placement resume PDF, statement of purpose, and verified identity documents
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="self-start px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Documents</span>
                  </button>
                </div>

                {/* Primary Resume File */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Primary Placement Resume</h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">
                          {profile.documents?.resumeFileName || 'No resume uploaded'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Last Updated: {profile.documents?.resumeLastUpdated || 'Not uploaded'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newName = prompt('Enter new resume file name:', profile.documents?.resumeFileName || 'Updated_Resume.pdf');
                          if (newName) updateDocuments('resumeFileName', newName);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Update File</span>
                      </button>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Statement of Purpose / About Me */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Candidate Summary & Pitch (About Me)</h4>
                  <p className="text-xs text-slate-500">
                    This executive summary is shared with visiting corporate recruiters on placement brochures and applicant tracking systems.
                  </p>
                  <textarea
                    rows={4}
                    value={profile.documents?.aboutMe || ''}
                    onChange={(e) => updateDocuments('aboutMe', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                {/* Verified Identity & Transcripts */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Verified University Credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-slate-900 block">Semester Grade Cards</span>
                          <span className="text-[11px] text-slate-500">Sem 1 to Sem 4 Marksheets</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{profile.verified ? 'Verified' : 'Not verified'}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-slate-900 block">College ID Card & Aadhaar</span>
                          <span className="text-[11px] text-slate-500">Government Identity Proof</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{profile.verified ? 'Verified' : 'Not verified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. GUARDIANS */}
            {activeTab === 'guardians' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Guardians Details</h3>
                    <p className="text-xs text-slate-500">
                      Parent details and emergency contact contacts for university administration & corporate background verification
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="self-start px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Guardians</span>
                  </button>
                </div>

                {/* Father Details */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Father's Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Father's Full Name</label>
                      <input
                        type="text"
                        value={profile.guardians?.fatherName || ''}
                        onChange={(e) => updateGuardians('fatherName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Occupation / Profession</label>
                      <input
                        type="text"
                        value={profile.guardians?.fatherOccupation || ''}
                        onChange={(e) => updateGuardians('fatherOccupation', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Contact</label>
                      <input
                        type="tel"
                        value={profile.guardians?.fatherPhone || ''}
                        onChange={(e) => updateGuardians('fatherPhone', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mother Details */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Mother's Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mother's Full Name</label>
                      <input
                        type="text"
                        value={profile.guardians?.motherName || ''}
                        onChange={(e) => updateGuardians('motherName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Occupation / Profession</label>
                      <input
                        type="text"
                        value={profile.guardians?.motherOccupation || ''}
                        onChange={(e) => updateGuardians('motherOccupation', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Contact</label>
                      <input
                        type="tel"
                        value={profile.guardians?.motherPhone || ''}
                        onChange={(e) => updateGuardians('motherPhone', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Designated Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                      <input
                        type="text"
                        value={profile.guardians?.emergencyContactName || ''}
                        onChange={(e) => updateGuardians('emergencyContactName', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                      <input
                        type="text"
                        value={profile.guardians?.emergencyRelation || ''}
                        onChange={(e) => updateGuardians('emergencyRelation', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Emergency Phone Number</label>
                      <input
                        type="tel"
                        value={profile.guardians?.emergencyPhone || ''}
                        onChange={(e) => updateGuardians('emergencyPhone', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  , document.body);
}
