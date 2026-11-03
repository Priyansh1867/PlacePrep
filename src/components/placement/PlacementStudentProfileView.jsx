import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  GraduationCap,
  BookOpen,
  Briefcase,
  FileText,
  CheckCircle2,
  Edit2,
  Plus,
  Trash2,
  Upload,
  Camera,
  Check,
  Building,
  Mail,
  MapPin,
  Calendar,
  Award,
  Sparkles,
  ExternalLink,
  Copy,
  Download,
  AlertCircle,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { PlacementProfileApi } from '../../services/api';
import { savePlacementStudentProfile, getPlacementStudentProfile } from '../../services/storage';

export default function PlacementStudentProfileView({
  profile,
  currentUser,
  onReopenWizard,
  onProfileUpdated
}) {
  const [profileData, setProfileData] = useState(() => profile || getPlacementStudentProfile(currentUser));
  const [toastMsg, setToastMsg] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Active Section Editing State
  const [editingSection, setEditingSection] = useState(null); // 'personal', 'contact', 'currentEdu', 'prevEdu', 'internships', 'documents', 'placement'
  const [editFormData, setEditFormData] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Sync when profile prop changes
  useEffect(() => {
    if (profile) setProfileData(profile);
  }, [profile]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const copyStudentId = () => {
    const id = profileData.uniqueStudentId || 'PP-STUDENT';
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    showToast('Copied Student Placement ID to clipboard!');
  };

  // Profile photograph upload & replace
  const handlePhotoReplace = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast('Photo must be under 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const updated = {
        ...profileData,
        documents: {
          ...(profileData.documents || {}),
          profilePhoto: reader.result
        }
      };
      setProfileData(updated);
      savePlacementStudentProfile(updated, currentUser);
      if (currentUser?.email) {
        PlacementProfileApi.saveProfile(updated, currentUser.email, currentUser.id).catch(() => {});
      }
      showToast('Profile photograph replaced successfully!');
      if (onProfileUpdated) onProfileUpdated(updated);
    };
    reader.readAsDataURL(file);
  };

  // Resume upload & replace
  const handleResumeReplace = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const updated = {
      ...profileData,
      documents: {
        ...(profileData.documents || {}),
        resumeFileName: file.name,
        resumeLastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    };
    setProfileData(updated);
    savePlacementStudentProfile(updated, currentUser);
    if (currentUser?.email) {
      PlacementProfileApi.saveProfile(updated, currentUser.email, currentUser.id).catch(() => {});
    }
    showToast(`Resume replaced with "${file.name}"!`);
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  // Open Edit Section Modal
  const openEditSection = (sectionKey) => {
    setEditingSection(sectionKey);
    if (sectionKey === 'personal') {
      setEditFormData({ ...(profileData.personalInfo || {}) });
    } else if (sectionKey === 'contact') {
      setEditFormData({ ...(profileData.contactInfo || {}) });
    } else if (sectionKey === 'currentEdu') {
      setEditFormData({ ...(profileData.currentEducation || {}) });
    } else if (sectionKey === 'prevEdu') {
      setEditFormData({ ...(profileData.previousEducation || {}) });
    } else if (sectionKey === 'placement') {
      setEditFormData({ ...(profileData.placementDetails || {}) });
    } else if (sectionKey === 'internships') {
      setEditFormData({ internships: [...(profileData.internships || [])] });
    }
  };

  // Save Edit Section Changes to Storage & Database
  const saveSectionChanges = async () => {
    setIsSavingEdit(true);
    try {
      let updated = { ...profileData, lastUpdatedAt: new Date().toISOString() };

      if (editingSection === 'personal') {
        updated.personalInfo = { ...(updated.personalInfo || {}), ...editFormData };
      } else if (editingSection === 'contact') {
        // If email or mobile changed, follow verification rule
        const oldEmail = profileData.contactInfo?.primaryEmail;
        const oldPhone = profileData.contactInfo?.mobileNumber;
        const emailChanged = editFormData.primaryEmail && editFormData.primaryEmail !== oldEmail;
        const phoneChanged = editFormData.mobileNumber && editFormData.mobileNumber !== oldPhone;

        updated.contactInfo = {
          ...(updated.contactInfo || {}),
          ...editFormData,
          emailVerified: emailChanged ? false : (editFormData.emailVerified ?? true),
          mobileVerified: phoneChanged ? false : (editFormData.mobileVerified ?? true)
        };
      } else if (editingSection === 'currentEdu') {
        updated.currentEducation = { ...(updated.currentEducation || {}), ...editFormData };
      } else if (editingSection === 'prevEdu') {
        updated.previousEducation = { ...(updated.previousEducation || {}), ...editFormData };
      } else if (editingSection === 'placement') {
        updated.placementDetails = { ...(updated.placementDetails || {}), ...editFormData };
      } else if (editingSection === 'internships') {
        updated.internships = editFormData.internships || [];
      }

      setProfileData(updated);
      savePlacementStudentProfile(updated, currentUser);

      // Backend Database Sync
      if (currentUser?.email) {
        try {
          await PlacementProfileApi.saveProfile(updated, currentUser.email, currentUser.id);
        } catch (apiErr) {
          console.warn('Backend database note:', apiErr);
        }
      }

      setIsSavingEdit(false);
      setEditingSection(null);
      showToast('Section changes saved and synchronized!');
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch {
      setIsSavingEdit(false);
      setEditingSection(null);
      showToast('Saved changes to current session.');
    }
  };

  // Fast internship add/delete inside view
  const deleteInternship = async (index) => {
    const list = profileData.internships.filter((_, i) => i !== index);
    const updated = { ...profileData, internships: list };
    setProfileData(updated);
    savePlacementStudentProfile(updated, currentUser);
    if (currentUser?.email) {
      PlacementProfileApi.saveProfile(updated, currentUser.email, currentUser.id).catch(() => {});
    }
    showToast('Internship record removed.');
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  const p = profileData.personalInfo || {};
  const c = profileData.contactInfo || {};
  const e = profileData.currentEducation || {};
  const pr = profileData.previousEducation || {};
  const d = profileData.documents || {};
  const pl = profileData.placementDetails || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-fade-in border border-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. MASTER PROFILE IDENTITY CARD */}
      <div className="bg-gradient-to-r from-[#111439] via-[#0E2829] to-[#162740] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Candidate Photograph */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-tr from-emerald-600 to-indigo-600 border-4 border-white/20 shadow-xl flex items-center justify-center text-white text-3xl font-black">
                {d.profilePhoto ? (
                  <img src={d.profilePhoto} alt={p.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{p.fullName ? p.fullName[0].toUpperCase() : 'S'}</span>
                )}
              </div>
              <label
                htmlFor="profile-replace-photo"
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer transition transform hover:scale-110 border border-white/30"
                title="Replace Photograph"
              >
                <Camera className="w-3.5 h-3.5" />
              </label>
              <input
                id="profile-replace-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoReplace}
                className="hidden"
              />
            </div>

            {/* Candidate Credentials */}
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl sm:text-3xl font-black text-white">{p.fullName || 'Student'}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {pl.placementEnrollmentStatus || 'ENROLLED'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                {e.degree || 'B.Tech'} in {p.branch || 'Computer Science and Engineering'} • {p.currentYear || '3rd Year'}
              </p>

              <p className="text-xs text-slate-300 font-mono">
                {p.college || 'Delhi Technological University (DTU)'}
              </p>

              {/* Unique Student ID Pill */}
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-xs">
                <span className="text-[11px] text-emerald-300/90 font-mono bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  Placement ID: <strong className="text-white">{profileData.uniqueStudentId || 'PP-STUDENT'}</strong>
                </span>
                <button
                  type="button"
                  onClick={copyStudentId}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy Student Placement ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Master Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openEditSection('personal')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            {onReopenWizard && (
              <button
                type="button"
                onClick={onReopenWizard}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-white/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Launch 7-Step Wizard</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-emerald-800/60 text-xs">
          <div>
            <span className="text-emerald-300 block text-[11px]">Academic CGPA:</span>
            <span className="font-black text-base text-white font-mono">{e.cgpa || '8.4'} / 10.0</span>
          </div>
          <div>
            <span className="text-emerald-300 block text-[11px]">Active Backlogs:</span>
            <span className="font-black text-base text-emerald-300">{e.backlogs || 0} Backlogs</span>
          </div>
          <div>
            <span className="text-emerald-300 block text-[11px]">Placement Cycle:</span>
            <span className="font-black text-base text-amber-300">{pl.placementCycle || '2026-2027'}</span>
          </div>
          <div>
            <span className="text-emerald-300 block text-[11px]">Internships Completed:</span>
            <span className="font-black text-base text-white">{profileData.internships?.length || 0} Experiences</span>
          </div>
        </div>
      </div>

      {/* 2. ORGANIZED SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ========================================================================= */}
        {/* SECTION 1: PERSONAL INFORMATION                                           */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Personal Information</h3>
            </div>
            <button
              type="button"
              onClick={() => openEditSection('personal')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="font-bold text-slate-900">{p.fullName || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Father's Name</span>
              <span className="font-bold text-slate-900">{p.fatherName || 'Rajesh Jain'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Mother's Name</span>
              <span className="font-bold text-slate-900">{p.motherName || 'Sunita Jain'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Date of Birth</span>
              <span className="font-bold text-slate-900 font-mono">{p.dateOfBirth || '2004-05-18'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Gender</span>
              <span className="font-bold text-slate-900">{p.gender || 'Male'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Registration Number</span>
              <span className="font-bold text-slate-900 font-mono">{p.registrationNumber || '2024/CSE/084'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">University</span>
              <span className="font-bold text-slate-900">{p.university || 'Delhi Technological University'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">College</span>
              <span className="font-bold text-slate-900">{p.college || 'Delhi Technological University (DTU)'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Branch</span>
              <span className="font-bold text-slate-900">{p.branch || 'Computer Science and Engineering'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Current Year & Semester</span>
              <span className="font-bold text-emerald-700">{p.currentYear || '3rd Year'} • {p.currentSemester || '6th Semester'}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: CONTACT INFORMATION                                            */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Contact Information</h3>
            </div>
            <button
              type="button"
              onClick={() => openEditSection('contact')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary / College Email</span>
                <span className="font-bold text-slate-900 font-mono">{c.primaryEmail || currentUser?.email}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" /> Verified
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Personal Email</span>
                <span className="font-bold text-slate-900 font-mono">{c.personalEmail || 'priyansh.personal@gmail.com'}</span>
              </div>
              <span className="text-[10px] text-slate-500">Secondary</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Mobile Number</span>
                <span className="font-bold text-slate-900 font-mono">{c.mobileNumber || '+91 98765 43210'}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" /> Verified
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Permanent Address</span>
              <p className="font-medium text-slate-800 leading-relaxed">
                {c.permanentAddress || 'Flat 402, Block B, Silver Palms, Rohini Sector 14, Delhi - 110085'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Current Address</span>
              <p className="font-medium text-slate-800 leading-relaxed">
                {c.currentAddress || 'Aryabhatta Hostel, Room 314, DTU Campus, Shahbad Daulatpur, Delhi - 110042'}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: CURRENT / MOST RECENT EDUCATION                                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Current / Most Recent Education</h3>
            </div>
            <button
              type="button"
              onClick={() => openEditSection('currentEdu')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-teal-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Degree Program</span>
              <span className="font-bold text-slate-900">{e.degree || 'B.Tech'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">University</span>
              <span className="font-bold text-slate-900">{e.university || 'Delhi Technological University'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">College</span>
              <span className="font-bold text-slate-900">{e.college || 'Delhi Technological University (DTU)'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Branch</span>
              <span className="font-bold text-slate-900">{e.branch || 'Computer Science and Engineering'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Admission Year</span>
              <span className="font-bold text-slate-900 font-mono">{e.admissionYear || '2022'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Graduation Year</span>
              <span className="font-bold text-slate-900 font-mono">{e.graduationYear || '2026'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Cumulative CGPA</span>
              <span className="font-black text-emerald-600 text-sm font-mono">{e.cgpa || '8.4'} / 10.0</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Active Backlogs</span>
              <span className="font-bold text-slate-900">{e.backlogs ?? 0} Backlogs</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: PREVIOUS EDUCATION                                              */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Previous Education</h3>
            </div>
            <button
              type="button"
              onClick={() => openEditSection('prevEdu')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-amber-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* 10th Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-900">Class 10th Record ({pr.tenthBoard || 'CBSE'})</span>
                <span className="font-black text-emerald-600 font-mono">{pr.tenthPercentage || '92.4'}%</span>
              </div>
              <p className="text-[11px] text-slate-600">{pr.tenthSchool || 'Delhi Public School'} • Year of Passing: {pr.tenthYear || '2020'}</p>
            </div>

            {/* 12th Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-900">Class 12th Record ({pr.twelfthBoard || 'CBSE'} - {pr.twelfthStream || 'Science PCM'})</span>
                <span className="font-black text-emerald-600 font-mono">{pr.twelfthPercentage || '89.6'}%</span>
              </div>
              <p className="text-[11px] text-slate-600">{pr.twelfthSchool || 'Delhi Public School'} • Year of Passing: {pr.twelfthYear || '2022'}</p>
            </div>

            {/* Diploma if applicable */}
            {pr.hasDiploma && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">Diploma ({pr.diplomaBranch || 'Computer Engineering'})</span>
                  <span className="font-black text-emerald-600 font-mono">{pr.diplomaPercentage || '85.0'}%</span>
                </div>
                <p className="text-[11px] text-slate-600">{pr.diplomaInstitute || 'Polytechnic Institute'} • Year: {pr.diplomaYear || '2022'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: INTERNSHIPS & WORK EXPERIENCE                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Internships & Work Experience</h3>
              <p className="text-xs text-slate-500">Corporate work history, responsibilities, and verified internship credentials.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openEditSection('internships')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Internships</span>
          </button>
        </div>

        {(!profileData.internships || profileData.internships.length === 0) ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-semibold">No internships listed. Click "Manage Internships" to add.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.internships.map((exp, idx) => (
              <div key={exp.id || idx} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2 relative group hover:border-emerald-300 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-1">
                      {exp.employmentType || 'Internship'}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{exp.role}</h4>
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{exp.organization}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteInternship(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove Internship"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>{exp.duration || 'Duration not specified'}</span>
                </p>

                {exp.description && (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {exp.skillsUsed && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    {exp.skillsUsed.split(',').map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-medium">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {exp.certificates && (
                  <div className="pt-2 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>Certificate: {exp.certificates}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: PROFILE PHOTO & DOCUMENTS                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Profile Photo & Uploaded Documents</h3>
              <p className="text-xs text-slate-500">Verified placement credentials, master resume, and academic marksheets.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="upload-doc-resume"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Replace Resume</span>
            </label>
            <input
              id="upload-doc-resume"
              type="file"
              accept=".pdf,.docx"
              onChange={handleResumeReplace}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Master Resume Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">Primary Resume</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs truncate">{d.resumeFileName || 'Priyansh_Jain_Resume.pdf'}</h4>
              <p className="text-[11px] text-slate-500 mt-1">Updated: {d.resumeLastUpdated || 'Nov 2026'}</p>
            </div>
            <label
              htmlFor="upload-doc-resume"
              className="w-full py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-[11px] font-bold text-center cursor-pointer block"
            >
              Upload / Replace
            </label>
          </div>

          {/* Marksheets list */}
          {(d.academicMarksheets || []).slice(0, 2).map((m, idx) => (
            <div key={m.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">Marksheet</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs truncate">{m.title}</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-1">{m.fileName} • {m.size || '1.2 MB'}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified by Dean Office
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 7: PLACEMENT DETAILS                                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Placement Enrollment & Preferences</h3>
              <p className="text-xs text-slate-500">Official placement drive enrollment standing and corporate preferences.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openEditSection('placement')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Enrollment Status</span>
            <span className="font-black text-emerald-700 text-sm">{pl.placementEnrollmentStatus || 'ENROLLED'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Placement Cycle</span>
            <span className="font-bold text-slate-900 text-sm font-mono">{pl.placementCycle || '2026-2027'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Enrollment Date</span>
            <span className="font-bold text-slate-900">{pl.enrollmentDate || 'Nov 3, 2026'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Relocation Readiness</span>
            <span className="font-bold text-emerald-700">{pl.willingToRelocate ? 'Yes, Open to Relocate' : 'Preferred City Only'}</span>
          </div>
          <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Primary Domain Focus</span>
            <span className="font-bold text-slate-900">{pl.primaryDomain || 'Software Engineering / Full Stack Development'}</span>
          </div>
          <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Preferred Locations</span>
            <span className="font-bold text-slate-900">
              {Array.isArray(pl.preferredLocations) ? pl.preferredLocations.join(', ') : (pl.preferredLocations || 'Bengaluru, Delhi NCR, Hyderabad')}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION EDITING MODAL                                                     */}
      {/* ========================================================================= */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Edit {editingSection === 'personal' ? 'Personal Information' :
                      editingSection === 'contact' ? 'Contact Details' :
                      editingSection === 'currentEdu' ? 'Current Education' :
                      editingSection === 'prevEdu' ? 'Previous Education' :
                      editingSection === 'placement' ? 'Placement Preferences' : 'Section Details'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Editing Personal Info */}
            {editingSection === 'personal' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.fullName || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father's Name</label>
                    <input
                      type="text"
                      value={editFormData.fatherName || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      value={editFormData.motherName || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, motherName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editFormData.dateOfBirth || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editFormData.gender || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration / Roll Number</label>
                  <input
                    type="text"
                    value={editFormData.registrationNumber || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">College</label>
                    <input
                      type="text"
                      value={editFormData.college || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, college: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Branch</label>
                    <input
                      type="text"
                      value={editFormData.branch || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, branch: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Editing Contact Info */}
            {editingSection === 'contact' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Email</label>
                  <input
                    type="email"
                    value={editFormData.primaryEmail || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, primaryEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Personal Email</label>
                  <input
                    type="email"
                    value={editFormData.personalEmail || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, personalEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={editFormData.mobileNumber || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Permanent Address</label>
                  <textarea
                    rows={2}
                    value={editFormData.permanentAddress || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Address</label>
                  <textarea
                    rows={2}
                    value={editFormData.currentAddress || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Editing Current Education */}
            {editingSection === 'currentEdu' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Degree</label>
                    <input
                      type="text"
                      value={editFormData.degree || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, degree: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Branch</label>
                    <input
                      type="text"
                      value={editFormData.branch || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, branch: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.cgpa || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, cgpa: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Backlogs</label>
                    <input
                      type="number"
                      value={editFormData.backlogs ?? 0}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, backlogs: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Editing Previous Education */}
            {editingSection === 'prevEdu' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">10th Percentage (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.tenthPercentage || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, tenthPercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">12th Percentage (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.twelfthPercentage || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, twelfthPercentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Editing Placement */}
            {editingSection === 'placement' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Domain Focus</label>
                  <input
                    type="text"
                    value={editFormData.primaryDomain || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, primaryDomain: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Locations</label>
                  <input
                    type="text"
                    value={Array.isArray(editFormData.preferredLocations) ? editFormData.preferredLocations.join(', ') : (editFormData.preferredLocations || '')}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, preferredLocations: e.target.value.split(',').map(s => s.trim()) }))}
                    placeholder="Bengaluru, Delhi NCR, Hyderabad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSectionChanges}
                disabled={isSavingEdit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? 'Saving...' : 'Save & Sync'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
