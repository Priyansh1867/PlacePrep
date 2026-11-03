import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Plus,
  User,
  X,
  FileCheck2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, saveFullStudentProfile, getFullStudentProfile } from '../services/storage';
import { AuthApi, UserApi } from '../services/api';
import PlacePrepLogo from '../components/PlacePrepLogo';

const ONBOARDING_STEPS = [
  { id: 1, title: 'Basic Details', subtitle: "Let's get you started!" },
  { id: 2, title: 'Contact Details', subtitle: 'Fill in your contact details' },
  { id: 3, title: 'Current / Most Recent Education', subtitle: 'Provide details about your degree' },
  { id: 4, title: 'Previous Education', subtitle: 'Provide details about your 10th, 12th, etc.' },
  { id: 5, title: 'Internships and Work Experience', subtitle: 'Fill up your past experiences' },
  { id: 6, title: 'Profile Photo & Documents', subtitle: 'Upload profile photo & documents' },
  { id: 7, title: 'All Done!', subtitle: "All done, let's go!" }
];

export default function StudentOnboardingPage({ onComplete, onNavigateBack }) {
  const [user, setUserState] = useState(() => getCurrentUser() || {});
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Basic Details state
  const [step1Option, setStep1Option] = useState('apply_job'); // 'passphrase' | 'apply_job'
  const [passphrase, setPassphrase] = useState('');
  const [isVerifyingPassphrase, setIsVerifyingPassphrase] = useState(false);
  const [passphraseVerified, setPassphraseVerified] = useState(false);
  const [passphraseFeedback, setPassphraseFeedback] = useState(null);

  // Step 2: Contact Details state
  const [contactData, setContactData] = useState({
    mobileNumber: '',
    alternateMobileNumber: '',
    personalEmail: '',
    currentAddress: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Step 3: Current Education state
  const [currentEdu, setCurrentEdu] = useState({
    college: '',
    degree: 'B.Tech',
    branch: '',
    currentSemester: '6th Semester',
    rollNumber: '',
    enrollmentNumber: '',
    cgpa: '',
    educationStartYear: '2022',
    expectedGraduationYear: '2026',
    graduationBatch: '2026'
  });

  // Step 4: Previous Education state
  const [prevEdu, setPrevEdu] = useState({
    tenthSchool: '',
    tenthBoard: 'CBSE',
    tenthYear: '2020',
    tenthPercentage: '',
    twelfthSchool: '',
    twelfthBoard: 'CBSE',
    twelfthStream: 'Science (PCM)',
    twelfthYear: '2022',
    twelfthPercentage: ''
  });

  // Step 5: Internships & Work Experience state
  const [hasNoExperience, setHasNoExperience] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [currentExpForm, setCurrentExpForm] = useState({
    companyName: '',
    jobRole: '',
    startDate: '',
    endDate: '',
    description: '',
    skillsUsed: ''
  });
  const [isAddingExp, setIsAddingExp] = useState(false);

  // Step 6: Documents state
  const [documents, setDocuments] = useState({
    profilePhoto: null,
    resume: null,
    marksheet10: null,
    marksheet12: null,
    collegeId: null,
    otherDoc: null
  });
  const [uploadingDocType, setUploadingDocType] = useState(null);

  // Max completed step tracker
  const [highestStepCompleted, setHighestStepCompleted] = useState(0);

  // Synchronize on mount from backend and local storage
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      const active = getCurrentUser();
      if (!active) {
        if (isMounted) setIsLoading(false);
        return;
      }
      setUserState(active);

      // Initialize from local profile
      const localProfile = getFullStudentProfile(active);
      loadProfileIntoState(active, localProfile);

      // Check backend for latest profile and progress
      if (active.email) {
        try {
          const remote = await UserApi.getStudentFullProfile(active.email);
          if (remote && isMounted) {
            let parsed = remote;
            if (typeof remote === 'string') {
              try { parsed = JSON.parse(remote); } catch {}
            }
            if (parsed) {
              loadProfileIntoState(active, parsed);
            }
          }
        } catch (e) {
          console.warn('Could not fetch remote profile:', e);
        }
      }

      if (isMounted) {
        const resumeStep = active.currentOnboardingStep || 1;
        setActiveStep(Math.min(7, Math.max(1, resumeStep)));
        setHighestStepCompleted(Math.max(0, (active.currentOnboardingStep || 1) - 1));
        setIsLoading(false);
      }
    };

    fetchUserData();
    return () => { isMounted = false; };
  }, []);

  const loadProfileIntoState = (activeUser, profile) => {
    const basic = profile?.basicDetails || {};
    const edu = profile?.educationDetails || {};
    const docs = profile?.documents || {};

    if (profile?.onboardingOption) {
      setStep1Option(profile.onboardingOption);
    }
    if (activeUser?.passphrase || profile?.passphrase) {
      setPassphrase(activeUser.passphrase || profile.passphrase || '');
      setPassphraseVerified(activeUser.passphraseVerified || profile.passphraseVerified || false);
    }

    setContactData({
      mobileNumber: basic.phone || activeUser.phone || '',
      alternateMobileNumber: basic.alternatePhone || activeUser.alternatePhone || '',
      personalEmail: basic.personalEmail || activeUser.personalEmail || activeUser.email || '',
      currentAddress: basic.currentAddress || activeUser.currentAddress || '',
      city: basic.city || activeUser.city || '',
      state: basic.state || activeUser.state || '',
      pincode: basic.pincode || activeUser.pincode || ''
    });

    setCurrentEdu({
      college: edu.college || activeUser.college || 'Indian Institute of Technology',
      degree: edu.degree || activeUser.degree || 'B.Tech',
      branch: edu.branch || activeUser.branch || 'Computer Science and Engineering',
      currentSemester: edu.currentSemester || activeUser.currentSemester || '6th Semester',
      rollNumber: edu.rollNumber || activeUser.rollNumber || '',
      enrollmentNumber: edu.enrollmentNumber || activeUser.enrollmentNumber || activeUser.rollNumber || '',
      cgpa: edu.cgpa !== undefined && edu.cgpa !== null ? String(edu.cgpa) : (activeUser.cgpa !== undefined && activeUser.cgpa !== null ? String(activeUser.cgpa) : ''),
      educationStartYear: edu.educationStartYear ? String(edu.educationStartYear) : '2022',
      expectedGraduationYear: edu.expectedGraduationYear ? String(edu.expectedGraduationYear) : (activeUser.graduationBatch || '2026'),
      graduationBatch: edu.graduationBatch || activeUser.graduationBatch || '2026'
    });

    setPrevEdu({
      tenthSchool: edu.tenthSchool || activeUser.tenthSchool || '',
      tenthBoard: edu.tenthBoard || activeUser.tenthBoard || 'CBSE',
      tenthYear: edu.tenthYear || activeUser.tenthYear || '2020',
      tenthPercentage: edu.tenthPercentage ? String(edu.tenthPercentage) : '',
      twelfthSchool: edu.twelfthSchool || activeUser.twelfthSchool || '',
      twelfthBoard: edu.twelfthBoard || activeUser.twelfthBoard || 'CBSE',
      twelfthStream: edu.twelfthStream || activeUser.twelfthStream || 'Science (PCM)',
      twelfthYear: edu.twelfthYear || activeUser.twelfthYear || '2022',
      twelfthPercentage: edu.twelfthPercentage ? String(edu.twelfthPercentage) : ''
    });

    if (profile?.hasNoExperience) {
      setHasNoExperience(true);
    }
    if (Array.isArray(profile?.workExperiences) && profile.workExperiences.length > 0) {
      setExperiences(profile.workExperiences);
    }

    // Load documents
    const initialDocs = {};
    const docKeys = ['profilePhoto', 'resume', 'marksheet10', 'marksheet12', 'collegeId', 'otherDoc'];
    docKeys.forEach((key) => {
      if (docs[key]) {
        initialDocs[key] = docs[key];
      } else if (key === 'profilePhoto' && (activeUser.profilePhotoUrl || docs.profilePhotoUrl)) {
        initialDocs[key] = {
          fileName: 'profile_photo.jpg',
          fileUrl: activeUser.profilePhotoUrl || docs.profilePhotoUrl,
          previewUrl: activeUser.profilePhotoUrl || docs.profilePhotoUrl
        };
      } else if (key === 'resume' && (activeUser.resumeUrl || docs.resumeUrl || docs.resumeFileName)) {
        initialDocs[key] = {
          fileName: docs.resumeFileName || 'Resume.pdf',
          fileUrl: activeUser.resumeUrl || docs.resumeUrl || ''
        };
      }
    });
    setDocuments((prev) => ({ ...prev, ...initialDocs }));
  };

  // Passphrase verification
  const handleVerifyPassphrase = async () => {
    if (!passphrase.trim()) {
      setPassphraseFeedback({ valid: false, message: 'Please enter a passphrase' });
      return;
    }
    setIsVerifyingPassphrase(true);
    setPassphraseFeedback(null);
    try {
      const res = await AuthApi.verifyPassphrase(passphrase.trim());
      if (res && res.valid) {
        setPassphraseVerified(true);
        setPassphraseFeedback({
          valid: true,
          message: res.message || 'Passphrase verified! Placement cell access granted.'
        });
      } else {
        setPassphraseVerified(false);
        setPassphraseFeedback({
          valid: false,
          message: res?.error || 'Invalid passphrase. Contact your college TPO or select "I am here to apply for a job".'
        });
      }
    } catch (err) {
      setPassphraseVerified(false);
      setPassphraseFeedback({
        valid: false,
        message: err.message || 'Verification failed. Try again or select "I am here to apply for a job".'
      });
    } finally {
      setIsVerifyingPassphrase(false);
    }
  };

  // Validation helpers per step
  const validateCurrentStep = () => {
    setErrorMsg('');
    if (activeStep === 1) {
      if (step1Option === 'passphrase' && !passphrase.trim()) {
        setErrorMsg('Please enter your college placement cell passphrase or select "I am here to apply for a job".');
        return false;
      }
      return true;
    }

    if (activeStep === 2) {
      if (!contactData.mobileNumber.trim()) {
        setErrorMsg('Primary Mobile Number is required.');
        return false;
      }
      if (!/^\+?[0-9]{10,14}$/.test(contactData.mobileNumber.replace(/[\s-]/g, ''))) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!contactData.personalEmail.trim()) {
        setErrorMsg('Personal Email Address is required.');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.personalEmail.trim())) {
        setErrorMsg('Please enter a valid personal email address.');
        return false;
      }
      if (!contactData.currentAddress.trim()) {
        setErrorMsg('Current Address is required.');
        return false;
      }
      if (!contactData.city.trim()) {
        setErrorMsg('City is required.');
        return false;
      }
      if (!contactData.state.trim()) {
        setErrorMsg('State is required.');
        return false;
      }
      if (!contactData.pincode.trim()) {
        setErrorMsg('PIN Code is required.');
        return false;
      }
      if (!/^[0-9]{6}$/.test(contactData.pincode.trim())) {
        setErrorMsg('Please enter a valid 6-digit PIN code.');
        return false;
      }
      return true;
    }

    if (activeStep === 3) {
      if (!currentEdu.college.trim()) {
        setErrorMsg('College / University Name is required.');
        return false;
      }
      if (!currentEdu.branch.trim()) {
        setErrorMsg('Branch / Specialization is required.');
        return false;
      }
      if (!currentEdu.rollNumber.trim()) {
        setErrorMsg('Roll Number is required.');
        return false;
      }
      if (!currentEdu.cgpa.trim()) {
        setErrorMsg('CGPA / Percentage is required.');
        return false;
      }
      const cgpaNum = parseFloat(currentEdu.cgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 100) {
        setErrorMsg('Please enter a valid CGPA (0.0 - 10.0) or Percentage (0 - 100).');
        return false;
      }
      return true;
    }

    if (activeStep === 4) {
      if (!prevEdu.tenthSchool.trim()) {
        setErrorMsg('10th Standard School Name is required.');
        return false;
      }
      if (!prevEdu.tenthPercentage.trim()) {
        setErrorMsg('10th Standard Percentage / CGPA is required.');
        return false;
      }
      if (!prevEdu.twelfthSchool.trim()) {
        setErrorMsg('12th Standard / Diploma School or College Name is required.');
        return false;
      }
      if (!prevEdu.twelfthPercentage.trim()) {
        setErrorMsg('12th Standard / Diploma Percentage / CGPA is required.');
        return false;
      }
      return true;
    }

    if (activeStep === 5) {
      if (!hasNoExperience && experiences.length === 0) {
        setErrorMsg('Please add at least one internship/work experience, or check "I have no previous experience".');
        return false;
      }
      return true;
    }

    if (activeStep === 6) {
      // Step 6 document checks: Recommended to have Resume and College ID
      if (!documents.resume) {
        setErrorMsg('Please upload your Resume (PDF) to proceed.');
        return false;
      }
      return true;
    }

    return true;
  };

  // Step saving handler
  const handleSaveAndProceed = async () => {
    if (!validateCurrentStep()) return;

    setIsSaving(true);
    setErrorMsg('');

    try {
      let stepData = {};
      let isFinal = false;

      if (activeStep === 1) {
        stepData = {
          option: step1Option,
          passphrase: passphrase.trim(),
          passphraseVerified
        };
      } else if (activeStep === 2) {
        stepData = { ...contactData };
      } else if (activeStep === 3) {
        stepData = { ...currentEdu };
      } else if (activeStep === 4) {
        stepData = { ...prevEdu };
      } else if (activeStep === 5) {
        stepData = {
          hasNoExperience,
          experiences
        };
      } else if (activeStep === 6) {
        stepData = {
          profilePhotoUrl: documents.profilePhoto?.previewUrl || documents.profilePhoto?.fileUrl || '',
          resumeUrl: documents.resume?.fileUrl || '',
          documents
        };
      } else if (activeStep === 7) {
        isFinal = true;
      }

      // Persist step to backend database
      if (user.email) {
        try {
          const res = await UserApi.saveOnboardingStep(user.email, activeStep, stepData, isFinal);
          if (res?.user) {
            setUserState(res.user);
            setCurrentUser(res.user);
          }
        } catch (apiErr) {
          console.warn('Backend step save fallback to local storage:', apiErr);
        }
      }

      // Update local storage representation
      const updatedProfile = getFullStudentProfile(user);
      if (activeStep === 1) {
        updatedProfile.onboardingOption = step1Option;
        updatedProfile.passphrase = passphrase;
        updatedProfile.passphraseVerified = passphraseVerified;
      } else if (activeStep === 2) {
        updatedProfile.basicDetails = {
          ...updatedProfile.basicDetails,
          phone: contactData.mobileNumber,
          alternatePhone: contactData.alternateMobileNumber,
          personalEmail: contactData.personalEmail,
          currentAddress: contactData.currentAddress,
          city: contactData.city,
          state: contactData.state,
          pincode: contactData.pincode
        };
      } else if (activeStep === 3) {
        updatedProfile.educationDetails = {
          ...updatedProfile.educationDetails,
          college: currentEdu.college,
          degree: currentEdu.degree,
          branch: currentEdu.branch,
          currentSemester: currentEdu.currentSemester,
          rollNumber: currentEdu.rollNumber,
          enrollmentNumber: currentEdu.enrollmentNumber,
          cgpa: currentEdu.cgpa,
          educationStartYear: currentEdu.educationStartYear,
          expectedGraduationYear: currentEdu.expectedGraduationYear,
          graduationBatch: currentEdu.graduationBatch
        };
      } else if (activeStep === 4) {
        updatedProfile.educationDetails = {
          ...updatedProfile.educationDetails,
          tenthSchool: prevEdu.tenthSchool,
          tenthBoard: prevEdu.tenthBoard,
          tenthYear: prevEdu.tenthYear,
          tenthPercentage: prevEdu.tenthPercentage,
          twelfthSchool: prevEdu.twelfthSchool,
          twelfthBoard: prevEdu.twelfthBoard,
          twelfthStream: prevEdu.twelfthStream,
          twelfthYear: prevEdu.twelfthYear,
          twelfthPercentage: prevEdu.twelfthPercentage
        };
      } else if (activeStep === 5) {
        updatedProfile.hasNoExperience = hasNoExperience;
        updatedProfile.workExperiences = experiences;
      } else if (activeStep === 6) {
        updatedProfile.documents = {
          ...updatedProfile.documents,
          ...documents,
          profilePhotoUrl: documents.profilePhoto?.previewUrl || documents.profilePhoto?.fileUrl || '',
          resumeFileName: documents.resume?.fileName || '',
          resumeUrl: documents.resume?.fileUrl || ''
        };
      } else if (activeStep === 7) {
        updatedProfile.onboardingCompleted = true;
      }

      saveFullStudentProfile(updatedProfile, user);

      // Track completion
      setHighestStepCompleted((prev) => Math.max(prev, activeStep));

      if (activeStep < 7) {
        setActiveStep((prev) => prev + 1);
        setSuccessMsg(`Step ${activeStep} saved successfully!`);
        setTimeout(() => setSuccessMsg(''), 2500);
      } else {
        // Step 7 finished: Go to dashboard
        onComplete();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    setErrorMsg('');
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    } else {
      onNavigateBack();
    }
  };

  // Step 5: Add experience entry
  const handleAddExperience = () => {
    if (!currentExpForm.companyName.trim() || !currentExpForm.jobRole.trim()) {
      setErrorMsg('Company Name and Job Role are required to add an experience record.');
      return;
    }
    const newExp = {
      id: Date.now(),
      ...currentExpForm
    };
    setExperiences((prev) => [...prev, newExp]);
    setCurrentExpForm({
      companyName: '',
      jobRole: '',
      startDate: '',
      endDate: '',
      description: '',
      skillsUsed: ''
    });
    setIsAddingExp(false);
    setErrorMsg('');
  };

  const handleRemoveExperience = (id) => {
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Step 6: File upload handler
  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(`File ${file.name} exceeds 10MB limit.`);
      return;
    }

    setUploadingDocType(documentType);
    setErrorMsg('');

    try {
      // Upload to backend
      const res = await UserApi.uploadDocument(file, documentType, user.email);
      if (res && res.success) {
        setDocuments((prev) => ({
          ...prev,
          [documentType]: {
            fileName: res.fileName,
            fileSize: res.fileSize,
            fileUrl: res.fileUrl,
            previewUrl: res.previewUrl,
            uploadedAt: res.uploadedAt
          }
        }));
        setSuccessMsg(`${file.name} uploaded successfully!`);
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      console.warn('Backend upload failed, using client-side fallback:', err);
      // Client-side fallback with Object URL
      const localUrl = URL.createObjectURL(file);
      setDocuments((prev) => ({
        ...prev,
        [documentType]: {
          fileName: file.name,
          fileSize: file.size,
          fileUrl: localUrl,
          previewUrl: localUrl,
          uploadedAt: new Date().toISOString()
        }
      }));
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleRemoveDocument = (documentType) => {
    setDocuments((prev) => ({ ...prev, [documentType]: null }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-semibold">Loading your profile wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 lg:px-8 text-slate-800 antialiased">
      <div className="mx-auto w-full max-w-6xl my-auto">
        {/* Top Minimal Branding Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <PlacePrepLogo className="h-7 w-auto" theme="dark" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Placement Portal • Student Profile Completion</span>
          </div>
        </div>

        {/* Master Card Split Layout matching Screenshot 2 */}
        <div className="rounded-3xl border border-slate-800 bg-[#161922] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* A. LEFT SIDEBAR – PROGRESS TRACKER */}
          <aside className="lg:col-span-4 bg-[#161922] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 text-white">
            <div className="space-y-6 sm:space-y-7">
              {ONBOARDING_STEPS.map((step, idx) => {
                const isActive = activeStep === step.id;
                const isCompleted = activeStep > step.id || (step.id <= highestStepCompleted && !isActive);
                const isUpcoming = !isActive && !isCompleted;

                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      if (step.id <= highestStepCompleted + 1) {
                        setActiveStep(step.id);
                        setErrorMsg('');
                      }
                    }}
                    className={`flex items-start gap-4 transition-all duration-200 ${
                      step.id <= highestStepCompleted + 1 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    {/* Circular Progress Indicator */}
                    <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                          isActive
                            ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700/80 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                      </div>

                      {/* Vertical connector line */}
                      {idx < ONBOARDING_STEPS.length - 1 && (
                        <div
                          className={`absolute top-8 w-0.5 h-6 sm:h-7 -bottom-6 ${
                            isCompleted ? 'bg-emerald-500/60' : 'bg-slate-800'
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="min-w-0">
                      <h4
                        className={`text-sm sm:text-base font-bold tracking-tight transition-colors ${
                          isActive ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Student Cohort Tag */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                {(user?.name || 'Student').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 text-xs">
                <p className="font-bold text-slate-200 truncate">{user?.name || 'Student Candidate'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </aside>

          {/* B. RIGHT SIDE – DYNAMIC FORM CONTAINER */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-10 flex flex-col justify-between">
            <div className="w-full max-w-2xl mx-auto">
              {/* Feedback messages */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 1: BASIC DETAILS (Reference Screenshot 2)            */}
              {/* ======================================================== */}
              {activeStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Please select an option<span className="text-rose-500">*</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose how you are joining the PlacePrep campus placement ecosystem.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Radio Option 1: College Passphrase */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        step1Option === 'passphrase'
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="onboardingOption"
                        value="passphrase"
                        checked={step1Option === 'passphrase'}
                        onChange={() => setStep1Option('passphrase')}
                        className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-slate-800">
                          I have received a passphrase from my college placement cell.
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">
                          Unlocks verified institutional drives, automated attendance synchronization, and faculty governance.
                        </span>
                      </div>
                    </label>

                    {/* Additional Passphrase Field if Option 1 selected */}
                    {step1Option === 'passphrase' && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-indigo-200/80 space-y-3 ml-7 animate-in fade-in duration-200">
                        <label className="block">
                          <span className="block text-xs font-bold text-slate-700 mb-1">
                            College Placement Cell Passphrase<span className="text-rose-500">*</span>
                          </span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={passphrase}
                              onChange={(e) => {
                                setPassphrase(e.target.value);
                                setPassphraseVerified(false);
                                setPassphraseFeedback(null);
                              }}
                              placeholder="e.g. PLACEPREP2026 or CAMPUS2026"
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyPassphrase}
                              disabled={isVerifyingPassphrase || !passphrase.trim()}
                              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              {isVerifyingPassphrase && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              <span>Verify</span>
                            </button>
                          </div>
                        </label>

                        {passphraseFeedback && (
                          <div
                            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                              passphraseFeedback.valid
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {passphraseFeedback.valid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span>{passphraseFeedback.message}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Radio Option 2: General Job Application */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        step1Option === 'apply_job'
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="onboardingOption"
                        value="apply_job"
                        checked={step1Option === 'apply_job'}
                        onChange={() => setStep1Option('apply_job')}
                        className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-slate-800">
                          I am here to apply for a job.
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">
                          Standard direct candidate application workflow across national campus recruiting opportunities.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 2: CONTACT DETAILS                                  */}
              {/* ======================================================== */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Contact Details
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Provide contact information so college placement coordinators and recruiters can reach you.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Mobile Number<span className="text-rose-500">*</span>
                      </span>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={contactData.mobileNumber}
                          onChange={(e) => setContactData({ ...contactData, mobileNumber: e.target.value })}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        Alternate Mobile Number (Optional)
                      </span>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={contactData.alternateMobileNumber}
                          onChange={(e) => setContactData({ ...contactData, alternateMobileNumber: e.target.value })}
                          placeholder="e.g. 9123456780"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </label>
                  </div>

                  <label className="block">
                    <span className="block text-xs font-bold text-slate-700 mb-1">
                      Personal Email Address<span className="text-rose-500">*</span>
                    </span>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={contactData.personalEmail}
                        onChange={(e) => setContactData({ ...contactData, personalEmail: e.target.value })}
                        placeholder="e.g. personal@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="block text-xs font-bold text-slate-700 mb-1">
                      Current Address<span className="text-rose-500">*</span>
                    </span>
                    <textarea
                      rows={2}
                      value={contactData.currentAddress}
                      onChange={(e) => setContactData({ ...contactData, currentAddress: e.target.value })}
                      placeholder="Street address, hostel, or residential flat"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        City<span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        value={contactData.city}
                        onChange={(e) => setContactData({ ...contactData, city: e.target.value })}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        State<span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        value={contactData.state}
                        onChange={(e) => setContactData({ ...contactData, state: e.target.value })}
                        placeholder="e.g. Karnataka"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code<span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        maxLength={6}
                        value={contactData.pincode}
                        onChange={(e) => setContactData({ ...contactData, pincode: e.target.value })}
                        placeholder="e.g. 560001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 3: CURRENT / MOST RECENT EDUCATION                   */}
              {/* ======================================================== */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Current / Most Recent Education
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Academic details prefilled from your registration. You can edit them if necessary.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <label className="block sm:col-span-2">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        College / University Name<span className="text-rose-500">*</span>
                      </span>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={currentEdu.college}
                          onChange={(e) => setCurrentEdu({ ...currentEdu, college: e.target.value })}
                          placeholder="e.g. Indian Institute of Technology"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        Degree<span className="text-rose-500">*</span>
                      </span>
                      <select
                        value={currentEdu.degree}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                        <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                        <option value="M.Tech">M.Tech (Master of Technology)</option>
                        <option value="MCA">MCA (Master of Computer Applications)</option>
                        <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                        <option value="B.Sc">B.Sc (Computer Science / IT)</option>
                        <option value="M.Sc">M.Sc (Computer Science / IT)</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        Branch / Specialization<span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        value={currentEdu.branch}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, branch: e.target.value })}
                        placeholder="e.g. Computer Science and Engineering"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        Current Semester / Year<span className="text-rose-500">*</span>
                      </span>
                      <select
                        value={currentEdu.currentSemester}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, currentSemester: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="1st Semester">1st Semester (Year 1)</option>
                        <option value="2nd Semester">2nd Semester (Year 1)</option>
                        <option value="3rd Semester">3rd Semester (Year 2)</option>
                        <option value="4th Semester">4th Semester (Year 2)</option>
                        <option value="5th Semester">5th Semester (Year 3)</option>
                        <option value="6th Semester">6th Semester (Year 3)</option>
                        <option value="7th Semester">7th Semester (Year 4)</option>
                        <option value="8th Semester">8th Semester (Year 4)</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        Roll Number / Enrollment No.<span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        value={currentEdu.rollNumber}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, rollNumber: e.target.value, enrollmentNumber: e.target.value })}
                        placeholder="e.g. 2024/CSE/084"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        CGPA / Percentage<span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        value={currentEdu.cgpa}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, cgpa: e.target.value })}
                        placeholder="e.g. 8.84"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="block text-xs font-bold text-slate-700 mb-1">
                        Graduation Batch<span className="text-rose-500">*</span>
                      </span>
                      <select
                        value={currentEdu.graduationBatch}
                        onChange={(e) => setCurrentEdu({ ...currentEdu, graduationBatch: e.target.value, expectedGraduationYear: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {Array.from({ length: 6 }, (_, i) => String(2024 + i)).map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 4: PREVIOUS EDUCATION                               */}
              {/* ======================================================== */}
              {activeStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Previous Education
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Recruitment drives check mandatory cutoffs across 10th and 12th/Diploma qualifications.
                    </p>
                  </div>

                  {/* 10th Standard Section */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>10th Standard (Secondary School)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block sm:col-span-2">
                        <span className="block text-[11px] font-bold text-slate-700 mb-1">
                          School Name<span className="text-rose-500">*</span>
                        </span>
                        <input
                          type="text"
                          value={prevEdu.tenthSchool}
                          onChange={(e) => setPrevEdu({ ...prevEdu, tenthSchool: e.target.value })}
                          placeholder="e.g. St. Xavier's Senior Secondary School"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[11px] font-bold text-slate-700 mb-1">
                          Board<span className="text-rose-500">*</span>
                        </span>
                        <input
                          type="text"
                          value={prevEdu.tenthBoard}
                          onChange={(e) => setPrevEdu({ ...prevEdu, tenthBoard: e.target.value })}
                          placeholder="e.g. CBSE / ICSE / State Board"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">Passing Year</span>
                          <input
                            type="text"
                            maxLength={4}
                            value={prevEdu.tenthYear}
                            onChange={(e) => setPrevEdu({ ...prevEdu, tenthYear: e.target.value })}
                            placeholder="2020"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">
                            Percentage / CGPA<span className="text-rose-500">*</span>
                          </span>
                          <input
                            type="text"
                            value={prevEdu.tenthPercentage}
                            onChange={(e) => setPrevEdu({ ...prevEdu, tenthPercentage: e.target.value })}
                            placeholder="e.g. 91.4%"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            required
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 12th Standard / Diploma Section */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>12th Standard / Diploma</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="block sm:col-span-2">
                        <span className="block text-[11px] font-bold text-slate-700 mb-1">
                          School / College Name<span className="text-rose-500">*</span>
                        </span>
                        <input
                          type="text"
                          value={prevEdu.twelfthSchool}
                          onChange={(e) => setPrevEdu({ ...prevEdu, twelfthSchool: e.target.value })}
                          placeholder="e.g. Delhi Public School / Polytechnic College"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[11px] font-bold text-slate-700 mb-1">
                          Board / Council<span className="text-rose-500">*</span>
                        </span>
                        <input
                          type="text"
                          value={prevEdu.twelfthBoard}
                          onChange={(e) => setPrevEdu({ ...prevEdu, twelfthBoard: e.target.value })}
                          placeholder="e.g. CBSE / State Board"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[11px] font-bold text-slate-700 mb-1">Stream / Field</span>
                        <input
                          type="text"
                          value={prevEdu.twelfthStream}
                          onChange={(e) => setPrevEdu({ ...prevEdu, twelfthStream: e.target.value })}
                          placeholder="e.g. Science (PCM) / Computer Diploma"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                        <label className="block">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">Passing Year</span>
                          <input
                            type="text"
                            maxLength={4}
                            value={prevEdu.twelfthYear}
                            onChange={(e) => setPrevEdu({ ...prevEdu, twelfthYear: e.target.value })}
                            placeholder="2022"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">
                            Percentage / CGPA<span className="text-rose-500">*</span>
                          </span>
                          <input
                            type="text"
                            value={prevEdu.twelfthPercentage}
                            onChange={(e) => setPrevEdu({ ...prevEdu, twelfthPercentage: e.target.value })}
                            placeholder="e.g. 89.2%"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            required
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 5: INTERNSHIPS AND WORK EXPERIENCE                  */}
              {/* ======================================================== */}
              {activeStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Internships & Work Experience
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Add corporate internships, research apprenticeships, or project experience.
                    </p>
                  </div>

                  {/* Fresher / No Experience Checkbox */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasNoExperience}
                        onChange={(e) => {
                          setHasNoExperience(e.target.checked);
                          if (e.target.checked) setIsAddingExp(false);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        I have no previous experience (Fresher)
                      </span>
                    </label>
                    {hasNoExperience && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Ready to proceed
                      </span>
                    )}
                  </div>

                  {/* List of Added Experiences */}
                  {!hasNoExperience && experiences.length > 0 && (
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <div
                          key={exp.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                              <h4 className="text-sm font-bold text-slate-900 truncate">{exp.jobRole}</h4>
                              <span className="text-xs font-semibold text-slate-500">at {exp.companyName}</span>
                            </div>
                            {(exp.startDate || exp.endDate) && (
                              <p className="text-[11px] text-slate-500 font-mono">
                                {exp.startDate} - {exp.endDate || 'Present'}
                              </p>
                            )}
                            {exp.description && (
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1">{exp.description}</p>
                            )}
                            {exp.skillsUsed && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {exp.skillsUsed.split(',').map((s) => (
                                  <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                    {s.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Remove Experience"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Experience Modal/Drawer Form */}
                  {!hasNoExperience && isAddingExp && (
                    <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                          New Internship / Experience Record
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingExp(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">Company Name*</span>
                          <input
                            type="text"
                            value={currentExpForm.companyName}
                            onChange={(e) => setCurrentExpForm({ ...currentExpForm, companyName: e.target.value })}
                            placeholder="e.g. Amazon, Google, Startup"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">Job Role*</span>
                          <input
                            type="text"
                            value={currentExpForm.jobRole}
                            onChange={(e) => setCurrentExpForm({ ...currentExpForm, jobRole: e.target.value })}
                            placeholder="e.g. Software Engineering Intern"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">Start Date</span>
                          <input
                            type="text"
                            value={currentExpForm.startDate}
                            onChange={(e) => setCurrentExpForm({ ...currentExpForm, startDate: e.target.value })}
                            placeholder="e.g. May 2024"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">End Date</span>
                          <input
                            type="text"
                            value={currentExpForm.endDate}
                            onChange={(e) => setCurrentExpForm({ ...currentExpForm, endDate: e.target.value })}
                            placeholder="e.g. July 2024 (or Present)"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">Description</span>
                          <textarea
                            rows={2}
                            value={currentExpForm.description}
                            onChange={(e) => setCurrentExpForm({ ...currentExpForm, description: e.target.value })}
                            placeholder="Key contributions, architectures built, or achievements..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="block text-[11px] font-bold text-slate-700 mb-1">Skills Used</span>
                          <input
                            type="text"
                            value={currentExpForm.skillsUsed}
                            onChange={(e) => setCurrentExpForm({ ...currentExpForm, skillsUsed: e.target.value })}
                            placeholder="Comma-separated e.g. React, Spring Boot, MySQL, Docker"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingExp(false)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                        >
                          Add Record
                        </button>
                      </div>
                    </div>
                  )}

                  {!hasNoExperience && !isAddingExp && (
                    <button
                      type="button"
                      onClick={() => setIsAddingExp(true)}
                      className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-indigo-600 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Internship / Work Experience</span>
                    </button>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 6: PROFILE PHOTO & DOCUMENTS                        */}
              {/* ======================================================== */}
              {activeStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Profile Photo & Documents
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload your official resume, profile photo, and academic proof for recruiter evaluation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {/* 1. Profile Photo */}
                    <DocumentUploadCard
                      title="Profile Photo"
                      subtitle="JPG, PNG up to 5MB"
                      documentType="profilePhoto"
                      doc={documents.profilePhoto}
                      isUploading={uploadingDocType === 'profilePhoto'}
                      onUpload={(file) => handleFileUpload('profilePhoto', file)}
                      onRemove={() => handleRemoveDocument('profilePhoto')}
                      isImage
                    />

                    {/* 2. Resume (Required) */}
                    <DocumentUploadCard
                      title="Resume (PDF)*"
                      subtitle="Latest ATS-compliant PDF up to 10MB"
                      documentType="resume"
                      doc={documents.resume}
                      isUploading={uploadingDocType === 'resume'}
                      onUpload={(file) => handleFileUpload('resume', file)}
                      onRemove={() => handleRemoveDocument('resume')}
                      isRequired
                    />

                    {/* 3. 10th Marksheet */}
                    <DocumentUploadCard
                      title="10th Marksheet"
                      subtitle="PDF, JPG, PNG up to 5MB"
                      documentType="marksheet10"
                      doc={documents.marksheet10}
                      isUploading={uploadingDocType === 'marksheet10'}
                      onUpload={(file) => handleFileUpload('marksheet10', file)}
                      onRemove={() => handleRemoveDocument('marksheet10')}
                    />

                    {/* 4. 12th Marksheet */}
                    <DocumentUploadCard
                      title="12th Marksheet / Diploma"
                      subtitle="PDF, JPG, PNG up to 5MB"
                      documentType="marksheet12"
                      doc={documents.marksheet12}
                      isUploading={uploadingDocType === 'marksheet12'}
                      onUpload={(file) => handleFileUpload('marksheet12', file)}
                      onRemove={() => handleRemoveDocument('marksheet12')}
                    />

                    {/* 5. College ID */}
                    <DocumentUploadCard
                      title="College Student ID Card"
                      subtitle="PDF, JPG, PNG up to 5MB"
                      documentType="collegeId"
                      doc={documents.collegeId}
                      isUploading={uploadingDocType === 'collegeId'}
                      onUpload={(file) => handleFileUpload('collegeId', file)}
                      onRemove={() => handleRemoveDocument('collegeId')}
                    />

                    {/* 6. Other Supporting Documents */}
                    <DocumentUploadCard
                      title="Other Supporting Certificates"
                      subtitle="Certifications or recommendations (Optional)"
                      documentType="otherDoc"
                      doc={documents.otherDoc}
                      isUploading={uploadingDocType === 'otherDoc'}
                      onUpload={(file) => handleFileUpload('otherDoc', file)}
                      onRemove={() => handleRemoveDocument('otherDoc')}
                    />
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 7: ALL DONE!                                        */}
              {/* ======================================================== */}
              {activeStep === 7 && (
                <div className="text-center py-6 sm:py-8 space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Your Profile is Ready!
                    </h2>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Your student profile has been successfully completed. You are now ready to explore placement opportunities.
                    </p>
                  </div>

                  {/* Summary badge card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
                    <div className="flex justify-between pb-2 border-b border-slate-200/80">
                      <span className="text-slate-500">Student Name:</span>
                      <span className="font-bold text-slate-900">{user?.name || 'Verified Candidate'}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200/80">
                      <span className="text-slate-500">Branch & Batch:</span>
                      <span className="font-bold text-slate-900">{currentEdu.branch} ({currentEdu.graduationBatch})</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200/80">
                      <span className="text-slate-500">Academic Standing:</span>
                      <span className="font-bold text-emerald-600">CGPA {currentEdu.cgpa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Onboarding Status:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Check className="w-3.5 h-3.5" /> 100% Complete
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Form Actions (Go Back & Save and Proceed) */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleGoBack}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndProceed}
                disabled={isSaving}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : activeStep === 7 ? (
                  <>
                    <span>Go to Student Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Save and Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function DocumentUploadCard({ title, subtitle, documentType, doc, isUploading, onUpload, onRemove, isImage, isRequired }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate">
            {title}
            {isRequired && <span className="text-rose-500">*</span>}
          </h4>
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        </div>
        {doc && (
          <span className="shrink-0 p-1 rounded-full bg-emerald-100 text-emerald-700">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
      </div>

      {/* Uploaded state vs empty state */}
      {doc ? (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            {isImage && doc.previewUrl ? (
              <img
                src={doc.previewUrl}
                alt="Profile photo"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
              {doc.fileName || 'Uploaded Document'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 transition"
              title="Replace file"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
              title="Remove file"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 text-slate-600 hover:text-indigo-600 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Choose Document</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={
          isImage
            ? 'image/jpeg,image/png,image/jpg'
            : documentType === 'resume'
            ? 'application/pdf,.pdf,.doc,.docx'
            : 'application/pdf,image/jpeg,image/png,image/jpg'
        }
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
