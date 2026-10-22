import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Lock,
  Edit2,
  Plus,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Users,
  FolderGit2,
  FileText,
  HeartHandshake,
  Trophy,
  Sparkles,
  Settings,
  Bell,
  Check,
  X,
  Upload,
  Download,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Camera,
  Trash2
} from 'lucide-react';
import { getSupersetProfile, saveSupersetProfile, getCurrentUser } from '../services/storage';
import UserProfileMenu from '../components/UserProfileMenu';

export default function ProfilePage({ onNavigate }) {
  const [profile, setProfile] = useState(() => getSupersetProfile());
  const [activeTab, setActiveTab] = useState('basic');
  const [accomplishmentsDropdownOpen, setAccomplishmentsDropdownOpen] = useState(false);
  
  // Modals
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);
  const [changeRequestField, setChangeRequestField] = useState('Full Name');
  const [changeRequestNewValue, setChangeRequestNewValue] = useState('');
  const [changeRequestReason, setChangeRequestReason] = useState('');

  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    phone: profile.phone || '',
    personalEmail: profile.personalEmail || '',
    currentAddress: profile.currentAddress || '',
    permanentAddress: profile.permanentAddress || ''
  });

  const [isEditCollegeModalOpen, setIsEditCollegeModalOpen] = useState(false);
  const [collegeForm, setCollegeForm] = useState({
    college: profile.college || '',
    branch: profile.branch || '',
    batch: profile.batch || '2027',
    currentCgpa: profile.currentCgpa || 8.84
  });

  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState(false);
  const [createProfileForm, setCreateProfileForm] = useState({
    fullName: profile.fullName || '',
    supersetId: profile.supersetId || '',
    dateOfBirth: profile.dateOfBirth || '',
    gender: profile.gender || 'Female',
    college: profile.college || '',
    branch: profile.branch || '',
    batch: profile.batch || '2027',
    phone: profile.phone || '',
    primaryEmail: profile.primaryEmail || '',
    personalEmail: profile.personalEmail || ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    saveSupersetProfile(updatedProfile);
  };

  // Submit Change Request for locked items
  const handleSubmitChangeRequest = (e) => {
    e.preventDefault();
    if (!changeRequestNewValue.trim()) return;

    const newRequest = {
      id: `cr-${Date.now()}`,
      field: changeRequestField,
      currentValue: profile[changeRequestField === 'Full Name' ? 'fullName' : changeRequestField === 'Date of Birth' ? 'dateOfBirth' : 'gender'] || 'Current',
      requestedValue: changeRequestNewValue,
      reason: changeRequestReason || 'Correction of student master record',
      status: 'Under Review',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const updated = {
      ...profile,
      changeRequests: [newRequest, ...(profile.changeRequests || [])]
    };

    handleSaveProfile(updated);
    setIsChangeRequestModalOpen(false);
    setChangeRequestNewValue('');
    setChangeRequestReason('');
    showToast(`Change request for "${changeRequestField}" submitted to Placement Cell!`);
  };

  // Save Contact Details
  const handleSaveContactDetails = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      phone: contactForm.phone,
      personalEmail: contactForm.personalEmail,
      currentAddress: contactForm.currentAddress,
      permanentAddress: contactForm.permanentAddress
    };
    handleSaveProfile(updated);
    setIsEditContactModalOpen(false);
    showToast('Contact details successfully updated!');
  };

  // Save College & Academic Details
  const handleSaveCollegeDetails = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      college: collegeForm.college,
      branch: collegeForm.branch,
      batch: collegeForm.batch,
      currentCgpa: parseFloat(collegeForm.currentCgpa) || profile.currentCgpa
    };
    handleSaveProfile(updated);
    setIsEditCollegeModalOpen(false);
    showToast('College and Academic credentials updated!');
  };

  // Create or Reset Full Profile
  const handleCreateOrResetProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      fullName: createProfileForm.fullName || profile.fullName,
      supersetId: createProfileForm.supersetId || profile.supersetId,
      dateOfBirth: createProfileForm.dateOfBirth || profile.dateOfBirth,
      gender: createProfileForm.gender || profile.gender,
      college: createProfileForm.college || profile.college,
      branch: createProfileForm.branch || profile.branch,
      batch: createProfileForm.batch || profile.batch,
      phone: createProfileForm.phone || profile.phone,
      primaryEmail: createProfileForm.primaryEmail || profile.primaryEmail,
      personalEmail: createProfileForm.personalEmail || profile.personalEmail
    };
    handleSaveProfile(updated);
    setIsCreateProfileModalOpen(false);
    showToast('Student Profile successfully created & synchronized!');
  };

  const navMenuItems = [
    { id: 'basic', label: 'Basic Details' },
    { id: 'education', label: 'Education Details' },
    { id: 'internships', label: 'Internship & Work Ex' },
    { id: 'skills', label: 'Skills, Subjects & Languages' },
    { id: 'por', label: 'Position of Responsibilities' },
    { id: 'projects', label: 'Projects' },
    { id: 'accomplishments', label: 'Accomplishments', hasDropdown: true },
    { id: 'volunteering', label: 'Volunteering' },
    { id: 'extra', label: 'Extra-curricular Activities' },
    { id: 'resume', label: 'Resume, Docs & Write-ups' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-slate-800 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Superset Clean Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Superset folded logo icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profile</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCreateProfileModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit / Create Profile</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('gateway')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Portals</span>
              </button>
            )}

            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition cursor-pointer">
              <Settings className="w-4 h-4" />
            </button>

            {/* Notification Bell with 99+ badge */}
            <div className="relative">
              <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition cursor-pointer">
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full leading-tight">
                99+
              </span>
            </div>

            {/* User Profile Menu with Logout on Upper Right Corner */}
            <UserProfileMenu onNavigate={onNavigate} theme="light" />
          </div>
        </div>
      </header>

      {/* 2. Main Profile Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Profile Card & Vertical Menu (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
              {/* Profile Avatar with Verified Badge */}
              <div className="relative group mb-3">
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-full object-cover border-2 border-indigo-100 shadow-inner"
                />
                <button 
                  onClick={() => setIsCreateProfileModalOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-indigo-600 transition cursor-pointer"
                  title="Change Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Name + Green Verified Checkmark */}
              <div className="flex items-center gap-1.5 justify-center">
                <h2 className="text-lg font-black text-slate-900">{profile.fullName}</h2>
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>

              {/* Superset ID */}
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Superset ID: <span className="text-slate-700 font-bold">{profile.supersetId}</span>
              </p>
            </div>

            {/* Vertical Sub-Navigation Tabs */}
            <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm space-y-1">
              {navMenuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.hasDropdown) {
                        setAccomplishmentsDropdownOpen(!accomplishmentsDropdownOpen);
                      }
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#EEF2FF] text-indigo-700 font-black shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${accomplishmentsDropdownOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Fast Quick Links */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                Placement Drive Standing:
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Your profile is verified and authorized for Batch {profile.batch} on-campus drives.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: Tab Content Details (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ======================================================== */}
            {/* TAB 1: BASIC DETAILS (Exact visual match to user image)  */}
            {/* ======================================================== */}
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* 1. About Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  {/* About Header */}
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-base font-black text-slate-900">About</h3>
                    {/* Green checkmark badge */}
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    {/* Locked / Snowflake icon badge */}
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center" title="Profile Locked">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* About Details Rows */}
                  <div className="space-y-4 text-xs font-medium">
                    {/* Full Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-slate-50 gap-2">
                      <span className="w-48 text-slate-500 font-normal">Full Name :</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-bold">{profile.fullName}</span>
                        <button
                          onClick={() => {
                            setChangeRequestField('Full Name');
                            setChangeRequestNewValue(profile.fullName);
                            setIsChangeRequestModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Request change</span>
                        </button>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-slate-50 gap-2">
                      <span className="w-48 text-slate-500 font-normal">Date of Birth :</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-bold">{profile.dateOfBirth}</span>
                        <button
                          onClick={() => {
                            setChangeRequestField('Date of Birth');
                            setChangeRequestNewValue(profile.dateOfBirth);
                            setIsChangeRequestModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Request change</span>
                        </button>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-slate-50 gap-2">
                      <span className="w-48 text-slate-500 font-normal">Gender :</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-bold">{profile.gender}</span>
                        <button
                          onClick={() => {
                            setChangeRequestField('Gender');
                            setChangeRequestNewValue(profile.gender);
                            setIsChangeRequestModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Request change</span>
                        </button>
                      </div>
                    </div>

                    {/* Current/Latest College */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-2 gap-2">
                      <span className="w-48 text-slate-500 font-normal">Current/Latest College :</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-bold">{profile.college}</span>
                        <button
                          onClick={() => setIsEditCollegeModalOpen(true)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Change Requests Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-slate-900">Change requests</h3>
                    <button
                      onClick={() => setIsChangeRequestModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New request</span>
                      <ChevronDown className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">
                    Your profile is locked. To change a locked detail, send a request. Superset support or your placement cell reviews it.
                  </p>

                  {(!profile.changeRequests || profile.changeRequests.length === 0) ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      You have not sent any change requests.
                    </p>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {profile.changeRequests.map((cr) => (
                        <div key={cr.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{cr.field}</span>
                            <span className="text-slate-400 mx-2">→</span>
                            <span className="font-semibold text-indigo-700">{cr.requestedValue}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">Submitted: {cr.date} • {cr.reason}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                            {cr.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Contact Details Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-black text-slate-900">Contact Details</h3>
                    <button
                      onClick={() => setIsEditContactModalOpen(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Contact</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-medium">
                    {/* Phone Number */}
                    <div className="py-2 border-b border-slate-50">
                      <span className="text-slate-500 font-normal block mb-1">Phone Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold text-sm">{profile.phone}</span>
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                        <button
                          onClick={() => setIsEditContactModalOpen(true)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 ml-2 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Primary Email */}
                    <div className="py-2 border-b border-slate-50">
                      <span className="text-slate-500 font-normal block mb-1">Primary Email Address</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold text-sm">{profile.primaryEmail}</span>
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      </div>
                    </div>

                    {/* Personal Email */}
                    <div className="py-2 border-b border-slate-50">
                      <span className="text-slate-500 font-normal block mb-1">Personal Email Address</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold text-sm">{profile.personalEmail}</span>
                        <button
                          onClick={() => setIsEditContactModalOpen(true)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 ml-2 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-slate-500 font-normal block mb-1">Current Address</span>
                        <span className="text-slate-800 font-medium leading-relaxed block">{profile.currentAddress}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-normal block mb-1">Permanent Address</span>
                        <span className="text-slate-800 font-medium leading-relaxed block">{profile.permanentAddress}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: EDUCATION DETAILS                                 */}
            {/* ======================================================== */}
            {activeTab === 'education' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Academic Qualifications</h3>
                      <p className="text-xs text-slate-500">Class X, XII, and Undergraduate Degree records</p>
                    </div>
                    <button
                      onClick={() => setIsEditCollegeModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add / Edit Degree</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.education?.map((edu) => (
                      <div key={edu.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-200 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div>
                            <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">{edu.type}</span>
                            <h4 className="text-base font-bold text-slate-900 mt-0.5">{edu.institution}</h4>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs self-start sm:self-auto">
                            {edu.score}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60">
                          <div><span className="text-slate-400">Board/Univ:</span> <b>{edu.boardOrUniversity}</b></div>
                          <div><span className="text-slate-400">Stream:</span> <b>{edu.stream}</b></div>
                          <div><span className="text-slate-400">Duration:</span> <b>{edu.startYear} - {edu.endYear}</b></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Semester Breakdown Table */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 mb-3">Undergraduate Semester Grades</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {profile.semesters?.map((sem, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center">
                          <span className="text-xs font-bold text-indigo-600 uppercase">{sem.sem}</span>
                          <span className="text-xl font-black text-slate-900 block my-1">{sem.sgpa} SGPA</span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                            {sem.status} • {sem.credits} Credits
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: INTERNSHIP & WORK EX                              */}
            {/* ======================================================== */}
            {activeTab === 'internships' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Internship & Work Experience</h3>
                      <p className="text-xs text-slate-500">Corporate exposure and engineering internships</p>
                    </div>
                    <button
                      onClick={() => showToast('Internship added to draft roster!')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Experience</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.internships?.map((item) => (
                      <div key={item.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <h4 className="text-base font-bold text-slate-900">{item.role} @ {item.company}</h4>
                          <span className="text-xs font-bold text-indigo-600">{item.startDate} – {item.endDate} ({item.location})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                        {item.certificateUrl && (
                          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Offer / Completion Certificate:</span>
                            <span className="text-indigo-600 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                              <ExternalLink className="w-3 h-3" /> View Certificate
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: SKILLS, SUBJECTS & LANGUAGES                      */}
            {/* ======================================================== */}
            {activeTab === 'skills' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Skills, Core Subjects & Languages</h3>
                    <p className="text-xs text-slate-500">Verified core competencies evaluated during placement screenings</p>
                  </div>

                  {/* Technical Skills */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-indigo-700 tracking-wider mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.technical.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Core Subjects */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider mb-2">Core CS & Engineering Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.coreSubjects.map((sub, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider mb-2">Languages Known</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.languages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: POSITION OF RESPONSIBILITIES                      */}
            {/* ======================================================== */}
            {activeTab === 'por' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Positions of Responsibility</h3>
                      <p className="text-xs text-slate-500">Leadership and student coordination roles</p>
                    </div>
                    <button
                      onClick={() => showToast('New Responsibility draft created!')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Role</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.positionsOfResponsibility?.map((item) => (
                      <div key={item.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                          <span className="text-xs font-bold text-indigo-600">{item.tenure}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">{item.organization}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 6: PROJECTS                                          */}
            {/* ======================================================== */}
            {activeTab === 'projects' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Engineering & Capstone Projects</h3>
                      <p className="text-xs text-slate-500">Live deployments, source code repositories, and technical outcomes</p>
                    </div>
                    <button
                      onClick={() => showToast('New project slot initialized!')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.projects?.map((proj) => (
                      <div key={proj.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                          <span className="text-xs font-bold text-slate-500">{proj.duration}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {proj.techStack?.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700 text-[10px] font-bold">
                              {t}
                            </span>
                          ))}
                        </div>

                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                          {proj.highlights?.map((h, idx) => (
                            <li key={idx}>{h}</li>
                          ))}
                        </ul>

                        {(proj.githubUrl || proj.liveUrl) && (
                          <div className="flex items-center gap-4 pt-2 border-t border-slate-200 text-xs">
                            {proj.githubUrl && (
                              <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                                <Code2 className="w-3.5 h-3.5" /> GitHub Code
                              </a>
                            )}
                            {proj.liveUrl && (
                              <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold flex items-center gap-1 hover:underline">
                                <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 7: ACCOMPLISHMENTS                                   */}
            {/* ======================================================== */}
            {activeTab === 'accomplishments' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Honors & Accomplishments</h3>
                    <p className="text-xs text-slate-500">Competitive programming ranks, hackathon victories, and official recognitions</p>
                  </div>

                  <div className="space-y-4">
                    {profile.accomplishments?.map((acc) => (
                      <div key={acc.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-start gap-3">
                        <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{acc.title}</h4>
                            <span className="text-xs text-amber-700 font-bold">• {acc.year}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{acc.issuer} — {acc.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 8: VOLUNTEERING                                      */}
            {/* ======================================================== */}
            {activeTab === 'volunteering' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Community & Volunteering</h3>
                    <p className="text-xs text-slate-500">Social initiatives and community service contributions</p>
                  </div>

                  <div className="space-y-4">
                    {profile.volunteering?.map((vol) => (
                      <div key={vol.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900">{vol.role} @ {vol.organization}</h4>
                        <span className="text-xs text-indigo-600 font-semibold">{vol.duration}</span>
                        <p className="text-xs text-slate-600 mt-1">{vol.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 9: EXTRA-CURRICULAR ACTIVITIES                       */}
            {/* ======================================================== */}
            {activeTab === 'extra' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Extra-curricular Activities</h3>
                    <p className="text-xs text-slate-500">Debates, sports, cultural fests, and arts</p>
                  </div>

                  <div className="space-y-3">
                    {profile.extraCurricular?.map((ec) => (
                      <div key={ec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{ec.activity}</h4>
                          <span className="text-xs text-slate-500">{ec.year}</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                          {ec.position}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 10: RESUME, DOCS & WRITE-UPS                         */}
            {/* ======================================================== */}
            {activeTab === 'resume' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Documents, Resumes & Verified Proofs</h3>
                      <p className="text-xs text-slate-500">Official student records on file with college placement cell</p>
                    </div>
                    <button
                      onClick={() => showToast('File upload dropzone activated!')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Document</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {profile.documents?.map((doc) => (
                      <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                            <span className="text-xs text-slate-500">{doc.type} • {doc.size} • Uploaded {doc.uploadDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                            {doc.status}
                          </span>
                          <button 
                            onClick={() => showToast(`Downloading ${doc.name}...`)}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: REQUEST CHANGE FOR LOCKED FIELDS                */}
      {/* ======================================================== */}
      {isChangeRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Request Change on Locked Field</h3>
              </div>
              <button onClick={() => setIsChangeRequestModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitChangeRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Locked Field</label>
                <select
                  value={changeRequestField}
                  onChange={(e) => {
                    setChangeRequestField(e.target.value);
                    setChangeRequestNewValue(profile[e.target.value === 'Full Name' ? 'fullName' : e.target.value === 'Date of Birth' ? 'dateOfBirth' : 'gender'] || '');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Full Name">Full Name</option>
                  <option value="Date of Birth">Date of Birth</option>
                  <option value="Gender">Gender</option>
                  <option value="Superset ID">Superset ID / Registration ID</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requested New Value *</label>
                <input
                  type="text"
                  required
                  value={changeRequestNewValue}
                  onChange={(e) => setChangeRequestNewValue(e.target.value)}
                  placeholder="Enter the correct value"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Change Request *</label>
                <textarea
                  rows="3"
                  required
                  value={changeRequestReason}
                  onChange={(e) => setChangeRequestReason(e.target.value)}
                  placeholder="Explain why this correction is needed (e.g. spelling discrepancy matching 10th marksheet)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900">
                Note: Upon submission, your college placement officer and Superset administrators will cross-verify this with your uploaded government ID.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangeRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black cursor-pointer shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT CONTACT DETAILS                            */}
      {/* ======================================================== */}
      {isEditContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Edit Contact Information</h3>
              <button onClick={() => setIsEditContactModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContactDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personal Email Address *</label>
                <input
                  type="email"
                  required
                  value={contactForm.personalEmail}
                  onChange={(e) => setContactForm({ ...contactForm, personalEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Address</label>
                <input
                  type="text"
                  value={contactForm.currentAddress}
                  onChange={(e) => setContactForm({ ...contactForm, currentAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Permanent Address</label>
                <input
                  type="text"
                  value={contactForm.permanentAddress}
                  onChange={(e) => setContactForm({ ...contactForm, permanentAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EDIT COLLEGE & ACADEMIC DETAILS                 */}
      {/* ======================================================== */}
      {isEditCollegeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Edit College & Degree Info</h3>
              <button onClick={() => setIsEditCollegeModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollegeDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">College / University Name *</label>
                <input
                  type="text"
                  required
                  value={collegeForm.college}
                  onChange={(e) => setCollegeForm({ ...collegeForm, college: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch / Specialization *</label>
                <input
                  type="text"
                  required
                  value={collegeForm.branch}
                  onChange={(e) => setCollegeForm({ ...collegeForm, branch: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Year</label>
                  <input
                    type="text"
                    value={collegeForm.batch}
                    onChange={(e) => setCollegeForm({ ...collegeForm, batch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={collegeForm.currentCgpa}
                    onChange={(e) => setCollegeForm({ ...collegeForm, currentCgpa: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditCollegeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black cursor-pointer shadow-sm"
                >
                  Save Academic Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: FULL CREATE / CUSTOMIZE PROFILE WIZARD          */}
      {/* ======================================================== */}
      {isCreateProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Create / Customize Student Profile</h3>
                <p className="text-xs text-slate-500">Configure profile identity for PlacePrep and Superset synchronization</p>
              </div>
              <button onClick={() => setIsCreateProfileModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrResetProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    value={createProfileForm.fullName}
                    onChange={(e) => setCreateProfileForm({ ...createProfileForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Superset ID *</label>
                  <input
                    type="text"
                    required
                    value={createProfileForm.supersetId}
                    onChange={(e) => setCreateProfileForm({ ...createProfileForm, supersetId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={createProfileForm.dateOfBirth}
                    onChange={(e) => setCreateProfileForm({ ...createProfileForm, dateOfBirth: e.target.value })}
                    placeholder="10 May, 2006"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={createProfileForm.gender}
                    onChange={(e) => setCreateProfileForm({ ...createProfileForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">College Name *</label>
                <input
                  type="text"
                  required
                  value={createProfileForm.college}
                  onChange={(e) => setCreateProfileForm({ ...createProfileForm, college: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch / Degree</label>
                  <input
                    type="text"
                    value={createProfileForm.branch}
                    onChange={(e) => setCreateProfileForm({ ...createProfileForm, branch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Graduation Batch</label>
                  <select
                    value={createProfileForm.batch}
                    onChange={(e) => setCreateProfileForm({ ...createProfileForm, batch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Email (College Domain)</label>
                  <input
                    type="email"
                    value={createProfileForm.primaryEmail}
                    onChange={(e) => setCreateProfileForm({ ...createProfileForm, primaryEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createProfileForm.phone}
                    onChange={(e) => setCreateProfileForm({ ...createProfileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black cursor-pointer shadow-md"
                >
                  Save & Apply Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
