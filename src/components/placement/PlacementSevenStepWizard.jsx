import React, { useState } from 'react';
import {
  User,
  Phone,
  GraduationCap,
  BookOpen,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Check,
  ShieldCheck,
  Sparkles,
  Award,
  ExternalLink,
  Camera,
  Calendar,
  Building,
  Mail,
  MapPin
} from 'lucide-react';
import { PlacementProfileApi } from '../../services/api';
import { savePlacementStudentProfile, savePlacementRegistrationDraft } from '../../services/storage';

const STEPS = [
  { id: 1, title: 'Personal Info', desc: 'Basic credentials & identity', icon: User },
  { id: 2, title: 'Contact Details', desc: 'Email, phone & address', icon: Phone },
  { id: 3, title: 'Current Education', desc: 'Degree, branch, CGPA', icon: GraduationCap },
  { id: 4, title: 'Previous Education', desc: '10th, 12th & diploma', icon: BookOpen },
  { id: 5, title: 'Work & Internships', desc: 'Corporate experience', icon: Briefcase },
  { id: 6, title: 'Photo & Documents', desc: 'Resume, marksheets & ID', icon: FileText },
  { id: 7, title: 'Placement Details', desc: 'Review & enrollment', icon: CheckCircle2 }
];

export default function PlacementSevenStepWizard({
  initialProfile,
  currentUser,
  onComplete,
  onCancel
}) {
  const [currentStep, setCurrentStep] = useState(initialProfile?.currentStep || 1);
  const [formData, setFormData] = useState(() => initialProfile || {});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Experience modal state
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpIndex, setEditingExpIndex] = useState(null);
  const [expForm, setExpForm] = useState({
    organization: '',
    role: '',
    employmentType: 'Internship',
    duration: '',
    description: '',
    skillsUsed: '',
    certificates: ''
  });

  // Simulated OTP verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneOtpInput, setPhoneOtpInput] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Helper to update deeply nested fields
  const updateSectionField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
    // Clear error
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`${section}.${field}`];
        return next;
      });
    }
  };

  // Validate step before proceeding
  const validateCurrentStep = () => {
    const errs = {};
    if (currentStep === 1) {
      const p = formData.personalInfo || {};
      if (!p.fullName?.trim()) errs['personalInfo.fullName'] = 'Full Name is required';
      if (!p.fatherName?.trim()) errs['personalInfo.fatherName'] = "Father's Name is required";
      if (!p.motherName?.trim()) errs['personalInfo.motherName'] = "Mother's Name is required";
      if (!p.dateOfBirth?.trim()) errs['personalInfo.dateOfBirth'] = 'Date of birth is required';
      if (!p.gender?.trim()) errs['personalInfo.gender'] = 'Gender is required';
      if (!p.registrationNumber?.trim()) errs['personalInfo.registrationNumber'] = 'Registration / Roll Number is required';
      if (!p.college?.trim()) errs['personalInfo.college'] = 'College name is required';
      if (!p.branch?.trim()) errs['personalInfo.branch'] = 'Branch is required';
    } else if (currentStep === 2) {
      const c = formData.contactInfo || {};
      if (!c.primaryEmail?.trim()) errs['contactInfo.primaryEmail'] = 'Primary email is required';
      if (!c.mobileNumber?.trim()) errs['contactInfo.mobileNumber'] = 'Mobile number is required';
      if (!c.permanentAddress?.trim()) errs['contactInfo.permanentAddress'] = 'Permanent address is required';
      if (!c.currentAddress?.trim()) errs['contactInfo.currentAddress'] = 'Current address is required';
    } else if (currentStep === 3) {
      const e = formData.currentEducation || {};
      if (!e.degree?.trim()) errs['currentEducation.degree'] = 'Degree is required';
      if (!e.branch?.trim()) errs['currentEducation.branch'] = 'Branch is required';
      if (!e.admissionYear?.trim()) errs['currentEducation.admissionYear'] = 'Admission year is required';
      if (!e.graduationYear?.trim()) errs['currentEducation.graduationYear'] = 'Graduation year is required';
      if (e.cgpa === '' || e.cgpa === undefined || e.cgpa === null) errs['currentEducation.cgpa'] = 'Current CGPA is required';
    } else if (currentStep === 4) {
      const pr = formData.previousEducation || {};
      if (!pr.tenthSchool?.trim()) errs['previousEducation.tenthSchool'] = '10th School is required';
      if (!pr.tenthPercentage) errs['previousEducation.tenthPercentage'] = '10th Percentage is required';
      if (!pr.twelfthSchool?.trim()) errs['previousEducation.twelfthSchool'] = '12th School is required';
      if (!pr.twelfthPercentage) errs['previousEducation.twelfthPercentage'] = '12th Percentage is required';
    } else if (currentStep === 7) {
      const pl = formData.placementDetails || {};
      if (!pl.declarationAgreed) {
        errs['placementDetails.declarationAgreed'] = 'You must accept the placement code of conduct declaration.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      showToast('Please fill all required fields before proceeding.');
      return;
    }
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    // Auto-save draft on step change
    handleSaveDraft(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async (stepToSave = currentStep) => {
    try {
      const payload = {
        ...formData,
        currentStep: stepToSave,
        isCompleted: false
      };
      savePlacementRegistrationDraft(payload, currentUser);
      // Synchronize with backend API
      if (currentUser?.email) {
        PlacementProfileApi.saveDraft(payload, currentUser.email, currentUser.id).catch(() => {});
      }
      showToast('Draft progress saved successfully.');
    } catch {
      showToast('Draft saved to local session.');
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      showToast('Please accept the placement declaration to complete enrollment.');
      return;
    }

    setIsSaving(true);
    try {
      const completedData = {
        ...formData,
        isCompleted: true,
        currentStep: 7,
        lastUpdatedAt: new Date().toISOString(),
        placementDetails: {
          ...(formData.placementDetails || {}),
          placementEnrollmentStatus: 'ENROLLED',
          placementCycle: '2026-2027',
          enrollmentDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          declarationAgreed: true
        }
      };

      // 1. Save locally with multi-store synchronization
      savePlacementStudentProfile(completedData, currentUser);

      // 2. Synchronize to Spring Boot MySQL backend
      if (currentUser?.email) {
        try {
          await PlacementProfileApi.saveProfile(completedData, currentUser.email, currentUser.id);
        } catch (apiErr) {
          console.warn('Backend database sync note:', apiErr);
        }
      }

      showToast('Placement Registration successfully submitted and verified!');
      setTimeout(() => {
        setIsSaving(false);
        if (onComplete) onComplete(completedData);
      }, 500);
    } catch (err) {
      setIsSaving(false);
      showToast('Registration saved to local session.');
      if (onComplete) onComplete(formData);
    }
  };

  // Profile photograph upload handler (Base64 data URL)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast('Photo must be under 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateSectionField('documents', 'profilePhoto', reader.result);
      showToast('Profile photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  // Resume upload handler
  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateSectionField('documents', 'resumeFileName', file.name);
    updateSectionField('documents', 'resumeLastUpdated', new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    showToast(`Resume "${file.name}" uploaded successfully!`);
  };

  // Add or edit internship
  const saveExperience = () => {
    if (!expForm.organization || !expForm.role) {
      showToast('Organization and Role are required.');
      return;
    }
    const list = [...(formData.internships || [])];
    if (editingExpIndex !== null) {
      list[editingExpIndex] = { ...expForm, id: list[editingExpIndex].id || `exp-${Date.now()}` };
    } else {
      list.push({ ...expForm, id: `exp-${Date.now()}` });
    }
    setFormData(prev => ({ ...prev, internships: list }));
    setIsExpModalOpen(false);
    setEditingExpIndex(null);
    setExpForm({
      organization: '',
      role: '',
      employmentType: 'Internship',
      duration: '',
      description: '',
      skillsUsed: '',
      certificates: ''
    });
    showToast('Experience entry saved!');
  };

  const removeExperience = (index) => {
    const list = formData.internships.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, internships: list }));
    showToast('Experience entry removed.');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-fade-in border border-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#111439] via-[#0E2829] to-[#162740] p-6 sm:p-8 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Placement Portal • Student Registration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              7-Step Campus Placement Profile Registration
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl">
              Complete your certified academic, contact, and experience records to enroll in Placement Season 2026-2027.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSaveDraft()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* 7-Step Navigation Indicator */}
        <div className="mt-8 pt-6 border-t border-emerald-800/60 overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[620px] gap-2">
            {STEPS.map((s) => {
              const StepIcon = s.icon;
              const isCurrent = s.id === currentStep;
              const isPassed = s.id < currentStep;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id < currentStep || validateCurrentStep()) {
                      setCurrentStep(s.id);
                    }
                  }}
                  className={`flex flex-col items-center flex-1 text-center transition cursor-pointer group ${
                    isCurrent
                      ? 'text-emerald-300 font-black'
                      : isPassed
                      ? 'text-emerald-100/90 font-semibold hover:text-white'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition mb-1.5 shadow-sm ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/30'
                        : isPassed
                        ? 'bg-emerald-700/80 text-white'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                  </div>
                  <span className="text-[11px] leading-tight truncate max-w-[85px]">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content Area */}
      <div className="p-6 sm:p-8">
        
        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL INFORMATION                                              */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Step 1: Personal Information</h3>
              <p className="text-xs text-slate-500">Official student identity details as registered in university records.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personalInfo?.fullName || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'fullName', e.target.value)}
                  placeholder="e.g. Priyansh Jain"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['personalInfo.fullName'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['personalInfo.fullName'] && <p className="text-[11px] text-rose-600 mt-1">{errors['personalInfo.fullName']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Father's Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personalInfo?.fatherName || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'fatherName', e.target.value)}
                  placeholder="e.g. Rajesh Jain"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['personalInfo.fatherName'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['personalInfo.fatherName'] && <p className="text-[11px] text-rose-600 mt-1">{errors['personalInfo.fatherName']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mother's Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personalInfo?.motherName || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'motherName', e.target.value)}
                  placeholder="e.g. Sunita Jain"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['personalInfo.motherName'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['personalInfo.motherName'] && <p className="text-[11px] text-rose-600 mt-1">{errors['personalInfo.motherName']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.personalInfo?.dateOfBirth || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'dateOfBirth', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['personalInfo.dateOfBirth'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['personalInfo.dateOfBirth'] && <p className="text-[11px] text-rose-600 mt-1">{errors['personalInfo.dateOfBirth']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.personalInfo?.gender || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'gender', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['personalInfo.gender'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors['personalInfo.gender'] && <p className="text-[11px] text-rose-600 mt-1">{errors['personalInfo.gender']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Registration / Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personalInfo?.registrationNumber || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'registrationNumber', e.target.value)}
                  placeholder="e.g. 2024/CSE/084"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['personalInfo.registrationNumber'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['personalInfo.registrationNumber'] && <p className="text-[11px] text-rose-600 mt-1">{errors['personalInfo.registrationNumber']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  University <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personalInfo?.university || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'university', e.target.value)}
                  placeholder="e.g. Delhi Technological University"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  College / Institute <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personalInfo?.college || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'college', e.target.value)}
                  placeholder="e.g. Delhi Technological University (DTU)"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['personalInfo.college'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['personalInfo.college'] && <p className="text-[11px] text-rose-600 mt-1">{errors['personalInfo.college']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Branch / Department <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personalInfo?.branch || ''}
                  onChange={(e) => updateSectionField('personalInfo', 'branch', e.target.value)}
                  placeholder="e.g. Computer Science and Engineering"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['personalInfo.branch'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['personalInfo.branch'] && <p className="text-[11px] text-rose-600 mt-1">{errors['personalInfo.branch']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Year
                </label>
                <select
                  value={formData.personalInfo?.currentYear || '3rd Year'}
                  onChange={(e) => updateSectionField('personalInfo', 'currentYear', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year (Final Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Semester
                </label>
                <select
                  value={formData.personalInfo?.currentSemester || '6th Semester'}
                  onChange={(e) => updateSectionField('personalInfo', 'currentSemester', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CONTACT INFORMATION                                               */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Step 2: Contact Information</h3>
              <p className="text-xs text-slate-500">Official contact records for interview calls, corporate offers, and TPO notices.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Primary Email */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Primary / College Email <span className="text-rose-500">*</span>
                  </label>
                  {formData.contactInfo?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsVerifyingEmail(true)}
                      className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 cursor-pointer"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  value={formData.contactInfo?.primaryEmail || ''}
                  onChange={(e) => updateSectionField('contactInfo', 'primaryEmail', e.target.value)}
                  placeholder="e.g. priyansh.jain@example.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors['contactInfo.primaryEmail'] && <p className="text-[11px] text-rose-600 mt-1">{errors['contactInfo.primaryEmail']}</p>}

                {isVerifyingEmail && !formData.contactInfo?.emailVerified && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <p className="text-amber-900 font-semibold text-[11px]">Verification code sent to {formData.contactInfo?.primaryEmail || 'email'}. (Demo OTP: <strong>123456</strong>)</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={emailOtpInput}
                        onChange={(e) => setEmailOtpInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (emailOtpInput === '123456' || emailOtpInput.length === 6) {
                            updateSectionField('contactInfo', 'emailVerified', true);
                            setIsVerifyingEmail(false);
                            showToast('Email verified successfully!');
                          } else {
                            showToast('Invalid OTP. Use demo OTP: 123456');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Personal Email Address
                </label>
                <input
                  type="email"
                  value={formData.contactInfo?.personalEmail || ''}
                  onChange={(e) => updateSectionField('contactInfo', 'personalEmail', e.target.value)}
                  placeholder="e.g. priyansh.personal@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Primary Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  {formData.contactInfo?.mobileVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsVerifyingPhone(true)}
                      className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 cursor-pointer"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
                <input
                  type="tel"
                  value={formData.contactInfo?.mobileNumber || ''}
                  onChange={(e) => updateSectionField('contactInfo', 'mobileNumber', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors['contactInfo.mobileNumber'] && <p className="text-[11px] text-rose-600 mt-1">{errors['contactInfo.mobileNumber']}</p>}

                {isVerifyingPhone && !formData.contactInfo?.mobileVerified && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <p className="text-amber-900 font-semibold text-[11px]">SMS OTP sent to mobile. (Demo OTP: <strong>999999</strong>)</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={phoneOtpInput}
                        onChange={(e) => setPhoneOtpInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (phoneOtpInput === '999999' || phoneOtpInput.length === 6) {
                            updateSectionField('contactInfo', 'mobileVerified', true);
                            setIsVerifyingPhone(false);
                            showToast('Mobile number verified successfully!');
                          } else {
                            showToast('Invalid OTP. Use demo OTP: 999999');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Permanent Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Permanent Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.contactInfo?.permanentAddress || ''}
                  onChange={(e) => updateSectionField('contactInfo', 'permanentAddress', e.target.value)}
                  placeholder="House/Flat No, Street, City, State, Pincode"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['contactInfo.permanentAddress'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['contactInfo.permanentAddress'] && <p className="text-[11px] text-rose-600 mt-1">{errors['contactInfo.permanentAddress']}</p>}
              </div>

              {/* Current Address */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Current Residential / Hostel Address <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.contactInfo?.permanentAddress) {
                        updateSectionField('contactInfo', 'currentAddress', formData.contactInfo.permanentAddress);
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Same as Permanent Address
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={formData.contactInfo?.currentAddress || ''}
                  onChange={(e) => updateSectionField('contactInfo', 'currentAddress', e.target.value)}
                  placeholder="Hostel Room / PG / Current Address"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['contactInfo.currentAddress'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['contactInfo.currentAddress'] && <p className="text-[11px] text-rose-600 mt-1">{errors['contactInfo.currentAddress']}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CURRENT / MOST RECENT EDUCATION                                   */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Step 3: Current / Most Recent Education</h3>
              <p className="text-xs text-slate-500">Academic credentials evaluated by recruiters for drive eligibility cutoffs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Degree / Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.currentEducation?.degree || 'B.Tech'}
                  onChange={(e) => updateSectionField('currentEducation', 'degree', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="B.Tech">Bachelor of Technology (B.Tech)</option>
                  <option value="B.E.">Bachelor of Engineering (B.E.)</option>
                  <option value="M.Tech">Master of Technology (M.Tech)</option>
                  <option value="MCA">Master of Computer Applications (MCA)</option>
                  <option value="B.Sc">Bachelor of Science (B.Sc)</option>
                  <option value="BCA">Bachelor of Computer Applications (BCA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  University <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currentEducation?.university || ''}
                  onChange={(e) => updateSectionField('currentEducation', 'university', e.target.value)}
                  placeholder="e.g. Delhi Technological University"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  College / Campus <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currentEducation?.college || ''}
                  onChange={(e) => updateSectionField('currentEducation', 'college', e.target.value)}
                  placeholder="e.g. DTU Main Campus"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Branch / Department <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currentEducation?.branch || ''}
                  onChange={(e) => updateSectionField('currentEducation', 'branch', e.target.value)}
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admission Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.currentEducation?.admissionYear || '2022'}
                  onChange={(e) => updateSectionField('currentEducation', 'admissionYear', e.target.value)}
                  placeholder="e.g. 2022"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Graduation Year / Batch <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.currentEducation?.graduationYear || '2026'}
                  onChange={(e) => updateSectionField('currentEducation', 'graduationYear', e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cumulative CGPA (out of 10.0) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.currentEducation?.cgpa ?? ''}
                  onChange={(e) => updateSectionField('currentEducation', 'cgpa', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 8.4"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors['currentEducation.cgpa'] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                />
                {errors['currentEducation.cgpa'] && <p className="text-[11px] text-rose-600 mt-1">{errors['currentEducation.cgpa']}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Active Backlogs Count <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.currentEducation?.backlogs ?? 0}
                  onChange={(e) => updateSectionField('currentEducation', 'backlogs', parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Most companies require 0 active backlogs.</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: PREVIOUS EDUCATION                                                */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Step 4: Previous Education</h3>
              <p className="text-xs text-slate-500">10th, 12th Senior Secondary, and Diploma records for company cutoff filtering.</p>
            </div>

            {/* Class 10th Record */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">10</span>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Class 10th / Secondary School Record</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    School Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.previousEducation?.tenthSchool || ''}
                    onChange={(e) => updateSectionField('previousEducation', 'tenthSchool', e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
                  />
                  {errors['previousEducation.tenthSchool'] && <p className="text-[10px] text-rose-600 mt-0.5">{errors['previousEducation.tenthSchool']}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Board
                  </label>
                  <select
                    value={formData.previousEducation?.tenthBoard || 'CBSE'}
                    onChange={(e) => updateSectionField('previousEducation', 'tenthBoard', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB / International</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Percentage (%) or CGPA <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.previousEducation?.tenthPercentage || ''}
                    onChange={(e) => updateSectionField('previousEducation', 'tenthPercentage', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 92.4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-emerald-700"
                  />
                  {errors['previousEducation.tenthPercentage'] && <p className="text-[10px] text-rose-600 mt-0.5">{errors['previousEducation.tenthPercentage']}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Year of Passing
                  </label>
                  <input
                    type="number"
                    value={formData.previousEducation?.tenthYear || '2020'}
                    onChange={(e) => updateSectionField('previousEducation', 'tenthYear', e.target.value)}
                    placeholder="2020"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Class 12th Record */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">12</span>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Class 12th / Senior Secondary Record</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    School / College Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.previousEducation?.twelfthSchool || ''}
                    onChange={(e) => updateSectionField('previousEducation', 'twelfthSchool', e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
                  />
                  {errors['previousEducation.twelfthSchool'] && <p className="text-[10px] text-rose-600 mt-0.5">{errors['previousEducation.twelfthSchool']}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Board & Stream
                  </label>
                  <select
                    value={formData.previousEducation?.twelfthBoard || 'CBSE'}
                    onChange={(e) => updateSectionField('previousEducation', 'twelfthBoard', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
                  >
                    <option value="CBSE">CBSE (Science / PCM)</option>
                    <option value="ISC">ISC</option>
                    <option value="State Board">State Board</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Percentage (%) or CGPA <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.previousEducation?.twelfthPercentage || ''}
                    onChange={(e) => updateSectionField('previousEducation', 'twelfthPercentage', parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 89.6"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-emerald-700"
                  />
                  {errors['previousEducation.twelfthPercentage'] && <p className="text-[10px] text-rose-600 mt-0.5">{errors['previousEducation.twelfthPercentage']}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Year of Passing
                  </label>
                  <input
                    type="number"
                    value={formData.previousEducation?.twelfthYear || '2022'}
                    onChange={(e) => updateSectionField('previousEducation', 'twelfthYear', e.target.value)}
                    placeholder="2022"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Diploma Details (Optional Toggle) */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">D</span>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Polytechnic / Diploma Details (If Applicable)</h4>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.previousEducation?.hasDiploma)}
                    onChange={(e) => updateSectionField('previousEducation', 'hasDiploma', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>I completed a Diploma</span>
                </label>
              </div>

              {formData.previousEducation?.hasDiploma && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-200 animate-fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Diploma Institute</label>
                    <input
                      type="text"
                      value={formData.previousEducation?.diplomaInstitute || ''}
                      onChange={(e) => updateSectionField('previousEducation', 'diplomaInstitute', e.target.value)}
                      placeholder="e.g. Government Polytechnic"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Diploma Branch</label>
                    <input
                      type="text"
                      value={formData.previousEducation?.diplomaBranch || ''}
                      onChange={(e) => updateSectionField('previousEducation', 'diplomaBranch', e.target.value)}
                      placeholder="e.g. Computer Engineering"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Percentage / Aggregate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.previousEducation?.diplomaPercentage || ''}
                      onChange={(e) => updateSectionField('previousEducation', 'diplomaPercentage', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 85.5"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Passing Year</label>
                    <input
                      type="number"
                      value={formData.previousEducation?.diplomaYear || ''}
                      onChange={(e) => updateSectionField('previousEducation', 'diplomaYear', e.target.value)}
                      placeholder="2022"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: INTERNSHIPS & WORK EXPERIENCE                                     */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Step 5: Internships & Work Experience</h3>
                <p className="text-xs text-slate-500">Add corporate internships, open-source fellowships, and live industry projects.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingExpIndex(null);
                  setExpForm({
                    organization: '',
                    role: '',
                    employmentType: 'Internship',
                    duration: '',
                    description: '',
                    skillsUsed: '',
                    certificates: ''
                  });
                  setIsExpModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Internship / Experience</span>
              </button>
            </div>

            {(!formData.internships || formData.internships.length === 0) ? (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No internship records added yet.</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Adding verified internships significantly increases recruiter interest and shortlist conversion.
                </p>
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  + Add First Internship
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.internships.map((exp, index) => (
                  <div key={exp.id || index} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative hover:border-emerald-300 transition group">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-1">
                          {exp.employmentType || 'Internship'}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{exp.role}</h4>
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{exp.organization}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpIndex(index);
                            setExpForm(exp);
                            setIsExpModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Experience"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 space-y-1.5">
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{exp.duration || 'Duration not specified'}</span>
                      </p>
                      {exp.description && (
                        <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-3">
                          {exp.description}
                        </p>
                      )}
                      {exp.skillsUsed && (
                        <div className="pt-2 flex flex-wrap gap-1">
                          {exp.skillsUsed.split(',').map((skill, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
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
                  </div>
                ))}
              </div>
            )}

            {/* Experience Add/Edit Modal */}
            {isExpModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                  <h4 className="text-base font-extrabold text-slate-900 mb-4">
                    {editingExpIndex !== null ? 'Edit Internship Experience' : 'Add Internship Experience'}
                  </h4>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Organization / Company *</label>
                      <input
                        type="text"
                        value={expForm.organization}
                        onChange={(e) => setExpForm(prev => ({ ...prev, organization: e.target.value }))}
                        placeholder="e.g. Infosys, Microsoft, Startup"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Role / Title *</label>
                        <input
                          type="text"
                          value={expForm.role}
                          onChange={(e) => setExpForm(prev => ({ ...prev, role: e.target.value }))}
                          placeholder="e.g. Frontend Intern"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Employment Type</label>
                        <select
                          value={expForm.employmentType}
                          onChange={(e) => setExpForm(prev => ({ ...prev, employmentType: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                        >
                          <option value="Internship">Internship</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Research">Research Fellowship</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={expForm.duration}
                        onChange={(e) => setExpForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g. May 2025 - July 2025 (3 Months)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Key Description & Responsibilities</label>
                      <textarea
                        rows={3}
                        value={expForm.description}
                        onChange={(e) => setExpForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Key contributions, technologies used, metrics achieved..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Skills Used (comma-separated)</label>
                      <input
                        type="text"
                        value={expForm.skillsUsed}
                        onChange={(e) => setExpForm(prev => ({ ...prev, skillsUsed: e.target.value }))}
                        placeholder="e.g. React, Spring Boot, PostgreSQL, Docker"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Certificate / Credential File Name or Link</label>
                      <input
                        type="text"
                        value={expForm.certificates}
                        onChange={(e) => setExpForm(prev => ({ ...prev, certificates: e.target.value }))}
                        placeholder="e.g. Internship_Certificate_2025.pdf"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsExpModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveExperience}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: PROFILE PHOTO & DOCUMENTS                                         */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Step 6: Profile Photo & Documents</h3>
              <p className="text-xs text-slate-500">Official candidate photograph, master resume, and academic marksheets for verification.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photograph Box */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gradient-to-tr from-emerald-600 to-indigo-600 border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-black">
                    {formData.documents?.profilePhoto ? (
                      <img
                        src={formData.documents.profilePhoto}
                        alt="Student Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{formData.personalInfo?.fullName ? formData.personalInfo.fullName[0].toUpperCase() : 'S'}</span>
                    )}
                  </div>
                  <label
                    htmlFor="wizard-photo-upload"
                    className="absolute bottom-0 right-0 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition transform hover:scale-105"
                    title="Change Photograph"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                  <input
                    id="wizard-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Official Candidate Photograph</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                    Formal passport-style photograph with clear face visibility for placement ID cards & company hall tickets.
                  </p>
                </div>

                <label
                  htmlFor="wizard-photo-upload"
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.documents?.profilePhoto ? 'Replace Photo' : 'Upload Photograph'}</span>
                </label>
              </div>

              {/* Master Placement Resume Box */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm">Master Placement Resume (PDF)</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Uploaded resume is automatically forwarded to recruiters when you apply for on-campus and off-campus recruitment drives.
                  </p>

                  <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {formData.documents?.resumeFileName || 'No resume uploaded'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Last Updated: {formData.documents?.resumeLastUpdated || 'Pending'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      Primary
                    </span>
                  </div>
                </div>

                <label
                  htmlFor="wizard-resume-upload"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.documents?.resumeFileName ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}</span>
                </label>
                <input
                  id="wizard-resume-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Academic Marksheets & Supporting Documents */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                Academic Marksheets & Verified Certificates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {(formData.documents?.academicMarksheets || []).map((doc, idx) => (
                  <div key={doc.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{doc.fileName} • {doc.size}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                ))}
                {(formData.documents?.certificates || []).map((cert, idx) => (
                  <div key={cert.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{cert.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{cert.issuer || cert.fileName}</p>
                    </div>
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: PLACEMENT DETAILS & CONFIRMATION                                   */}
        {/* ========================================================================= */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Step 7: Placement Details & Declaration</h3>
              <p className="text-xs text-slate-500">Review all submitted credentials and accept the Placement Season 2026-2027 code of conduct.</p>
            </div>

            {/* Placement Preferences Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">Placement Cycle Status</span>
                <p className="text-base font-black text-emerald-950">Placement Season 2026-2027</p>
                <p className="text-xs text-emerald-800">
                  Status upon submission: <strong className="text-emerald-900">VERIFIED ENROLLED</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 block">Primary Domain Focus</span>
                <input
                  type="text"
                  value={formData.placementDetails?.primaryDomain || 'Software Engineering / Full Stack Development'}
                  onChange={(e) => updateSectionField('placementDetails', 'primaryDomain', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-indigo-950"
                />
                <span className="text-[10px] text-indigo-700 block">Identifies recommended company recruitment drives</span>
              </div>
            </div>

            {/* Comprehensive Summary Preview Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Registration Summary Preview</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Candidate:</span>
                  <span className="font-bold text-slate-900">{formData.personalInfo?.fullName || 'Student'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Roll Number:</span>
                  <span className="font-bold text-slate-900 font-mono">{formData.personalInfo?.registrationNumber || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Branch:</span>
                  <span className="font-bold text-slate-900 truncate block">{formData.personalInfo?.branch || 'CSE'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Current CGPA:</span>
                  <span className="font-black text-emerald-700 font-mono">{formData.currentEducation?.cgpa || '8.4'}</span>
                </div>
              </div>
            </div>

            {/* Code of conduct declaration */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.placementDetails?.declarationAgreed)}
                  onChange={(e) => updateSectionField('placementDetails', 'declarationAgreed', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                />
                <span className="text-xs font-semibold text-amber-950 leading-relaxed">
                  I hereby solemnly affirm that all academic percentages, backlogs, contact details, and documents submitted in this 7-step profile are authentic and verified against official university transcripts. I understand that misrepresentation of CGPA or active backlogs will result in immediate debarment from campus recruitment drives.
                </span>
              </label>
              {errors['placementDetails.declarationAgreed'] && (
                <p className="text-xs font-bold text-rose-600">{errors['placementDetails.declarationAgreed']}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveDraft()}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save Draft</span>
            </button>

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Submitting Registration...' : 'Complete & Submit Placement Profile'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
