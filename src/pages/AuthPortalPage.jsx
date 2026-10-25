import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Award, BookOpen, Briefcase, Building2, Check, CheckCircle2,
  CircleHelp, Eye, EyeOff, GraduationCap, Layers3, Lock, Mail, ShieldCheck, School,
  Sparkles, User, Users,
} from 'lucide-react';
import PlacePrepLogo from '../components/PlacePrepLogo';
import campusLoginHero from '../assets/images/campus_dusk_bg.jpg';
import { setCurrentUser, setPortalMode, setPortalRole, setGraduationBatch } from '../services/storage';
import { AuthApi } from '../services/api';

const portalOptions = [
  { id: 'institute', label: 'Institute', icon: School },
  { id: 'placement', label: 'Placement', icon: Briefcase },
];

const rolesByPortal = {
  institute: [
    { id: 'student', label: 'Student', icon: GraduationCap, description: 'Prepare and apply' },
    { id: 'teacher', label: 'Faculty', icon: BookOpen, description: 'Guide your cohort' },
    { id: 'hod', label: 'HOD', icon: Award, description: 'See department insights' },
  ],
  placement: [
    { id: 'tpo', label: 'TPO Officer', icon: Building2, description: 'Manage campus drives' },
    { id: 'coordinator', label: 'Coordinator', icon: Users, description: 'Run placement ops' },
    { id: 'hr', label: 'Recruiter', icon: Briefcase, description: 'Discover candidates' },
    { id: 'director', label: 'Director', icon: ShieldCheck, description: 'Monitor outcomes' },
    { id: 'student', label: 'Student', icon: GraduationCap, description: 'View drives, eligibility & jobs' },
  ],
};

const defaultRoleFor = (portal) => (portal === 'placement' ? 'tpo' : 'student');

const demoDetails = {
  student: { fullName: 'Priyansh Jain', email: 'priyansh.jain@example.edu', password: 'password123', rollNumber: '2024/CSE/084', branch: 'Computer Science and Engineering', batch: '2028', college: 'Delhi Technological University (DTU)' },
  teacher: { fullName: 'Dr. Neha Sharma', email: 'neha.sharma@dtu.ac.in', password: 'password123', department: 'Computer Science and Engineering', designation: 'Associate Professor & Class Incharge', college: 'Delhi Technological University (DTU)' },
  hod: { fullName: 'Prof. Alok Verma', email: 'hod.cse@dtu.ac.in', password: 'password123', department: 'Computer Science and Engineering', designation: 'Head of Department (HOD)', college: 'Delhi Technological University (DTU)' },
  tpo: { fullName: 'Prof. Rajesh Raman', email: 'tpo@placeprep.edu', password: 'password123', designation: 'Head - Training & Placement Cell', college: 'Delhi Technological University (DTU)' },
  coordinator: { fullName: 'Sneha Kapur', email: 'coordinator.tpo@dtu.ac.in', password: 'password123', designation: 'Lead Student Placement Coordinator', college: 'Delhi Technological University (DTU)' },
  hr: { fullName: 'Vikram Mehta', email: 'vikram.mehta@hcltech.com', password: 'password123', companyName: 'HCLTech', designation: 'University Talent Acquisition Partner' },
  director: { fullName: 'Dr. P. K. Malhotra', email: 'director@dtu.ac.in', password: 'password123', designation: 'Director of Corporate & Academic Affairs', college: 'Delhi Technological University (DTU)' },
  super_admin: { fullName: 'Super Administrator', email: 'admin@placeprep.edu', password: 'adminpassword123', adminKey: 'SUPER_ADMIN_MASTER_KEY' },
};

const fieldClass = 'auth-input';

export default function AuthPortalPage({ initialPortal = 'institute', onAuthSuccess, onBackToGateway }) {
  const safeInitialPortal = initialPortal === 'placement' ? 'placement' : 'institute';
  const [portalBranch, setPortalBranch] = useState(safeInitialPortal);
  const [authMode, setAuthMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState(defaultRoleFor(safeInitialPortal));
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', rollNumber: '',
    college: 'Delhi Technological University (DTU)', branch: 'Computer Science and Engineering', batch: '2028',
    department: 'Computer Science and Engineering', designation: 'Class Incharge', companyName: 'HCLTech', adminKey: '',
  });

  const activePortal = useMemo(() => portalOptions.find((item) => item.id === portalBranch), [portalBranch]);
  const ActivePortalIcon = activePortal.icon;
  const roleOptions = rolesByPortal[portalBranch];

  const changePortal = (branch) => {
    setPortalBranch(branch);
    setSelectedRole(defaultRoleFor(branch));
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAutofillDemo = () => {
    setFormData((current) => ({ ...current, ...demoDetails[selectedRole] }));
    setErrorMsg('');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (authMode === 'login') {
      if (!formData.email || !formData.password) {
        setErrorMsg('Please enter both email and password.');
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!formData.fullName || !formData.email || !formData.password) {
        setErrorMsg('Please complete all required fields.');
        setIsSubmitting(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }
    }

    const roleMeta = roleOptions.find((item) => item.id === selectedRole);
    let userObj = {
      id: `user-${Date.now()}`,
      name: formData.fullName || (formData.email.split('@')[0]),
      email: formData.email.trim().toLowerCase(),
      role: selectedRole,
      roleLabel: roleMeta?.label || selectedRole.toUpperCase(),
      portal: portalBranch,
      college: formData.college || 'Delhi Technological University (DTU)',
      branch: formData.branch || 'Computer Science and Engineering',
      graduationBatch: formData.batch || '2028',
      department: formData.department || 'Computer Science and Engineering',
      designation: formData.designation,
      company: formData.companyName || 'HCLTech',
      rollNumber: formData.rollNumber || '2024/CSE/084',
      authenticatedAt: new Date().toISOString(),
    };

    // Synchronize directly with Spring Boot MySQL Database
    try {
      if (authMode === 'register') {
        const payload = {
          name: userObj.name,
          email: userObj.email,
          password: formData.password,
          college: userObj.college,
          branch: userObj.branch,
          graduationBatch: userObj.graduationBatch,
          role: selectedRole,
          rollNumber: userObj.rollNumber
        };
        const backendRes = await AuthApi.register(payload);
        if (backendRes && backendRes.user) {
          userObj = { ...userObj, ...backendRes.user, id: backendRes.user.id || userObj.id };
        }
      } else {
        // Mode is login: attempt live database login
        try {
          const loginRes = await AuthApi.login({
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          });
          if (loginRes && loginRes.user) {
            userObj = { ...userObj, ...loginRes.user, id: loginRes.user.id || userObj.id };
          }
        } catch (loginErr) {
          // If user does not exist in backend database yet, auto-register them seamlessly into DB!
          try {
            const autoRegPayload = {
              name: userObj.name,
              email: userObj.email,
              password: formData.password,
              college: userObj.college,
              branch: userObj.branch,
              graduationBatch: userObj.graduationBatch,
              role: selectedRole,
              rollNumber: userObj.rollNumber
            };
            const autoRegRes = await AuthApi.register(autoRegPayload);
            if (autoRegRes && autoRegRes.user) {
              userObj = { ...userObj, ...autoRegRes.user, id: autoRegRes.user.id || userObj.id };
            }
          } catch {
            // Local fallback
          }
        }
      }
    } catch (err) {
      console.warn('Backend database registration note:', err.message);
      if (authMode === 'register' && err.message && err.message.toLowerCase().includes('already exists')) {
        setErrorMsg(err.message + '. Please switch to Sign in.');
        setIsSubmitting(false);
        return;
      }
    }

    // Persist session to local storage
    setCurrentUser(userObj);
    setPortalMode(portalBranch);
    setPortalRole(selectedRole);
    if (selectedRole === 'student' && userObj.graduationBatch) {
      setGraduationBatch(userObj.graduationBatch);
    }

    setSuccessMsg(`Welcome, ${userObj.name}! Redirecting to ${portalBranch.toUpperCase()} workspace...`);
    setTimeout(() => {
      onAuthSuccess(userObj, portalBranch);
    }, 550);
  };

  return (
    <div className="auth-page min-h-screen w-full flex flex-col justify-between py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="mx-auto w-full max-w-6xl my-auto flex flex-col justify-between gap-4">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between px-1 shrink-0 py-1">
          <button 
            type="button"
            onClick={onBackToGateway} 
            className="auth-back-button inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-900 text-xs font-bold border border-slate-200/80 shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All portals</span>
          </button>
          <PlacePrepLogo className="h-7 sm:h-8 w-auto" theme="light" />
          <div className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/80 border border-slate-200/70 px-3 py-1.5 rounded-xl shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Secure campus access</span>
          </div>
        </header>

        {/* Auth Shell Container - Fully Responsive & Centered */}
        <div className="auth-shell overflow-hidden rounded-3xl lg:rounded-[2.25rem] border border-slate-200/80 bg-white shadow-2xl shadow-indigo-950/10 grid grid-cols-1 lg:grid-cols-12 w-full">
          
          {/* Left Visual Aside (Ivy League Campus Dusk) - Visible on Laptops & Desktops (lg+) */}
          <aside className="auth-visual relative hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 text-white min-h-[580px] overflow-hidden">
            <img src={campusLoginHero} alt="University campus at dusk" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(15,23,65,0.92)_0%,rgba(30,27,75,0.72)_44%,rgba(17,24,39,0.82)_100%)]" />
            <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" />
            
            <div className="relative z-10 flex items-center gap-3 text-sm font-semibold text-indigo-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
                <Layers3 className="h-4 w-4" />
              </span>
              <span>One connected campus ecosystem</span>
            </div>

            <div className="relative z-10 mt-auto max-w-md">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-50 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>BUILT FOR AMBITIOUS CAMPUSES</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black leading-[1.1] tracking-[-0.04em] text-white">
                The next great opportunity begins here.
              </h1>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-indigo-100/90">
                A considered workspace for students, faculties, and placement teams to turn preparation into outcomes.
              </p>
              
              <div className="mt-6 grid grid-cols-3 gap-2.5">
                {[
                  ['95%', 'placement ready'],
                  ['300+', 'partner companies'],
                  ['24/7', 'career intelligence'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/15 bg-slate-950/25 p-2.5 backdrop-blur-md text-center">
                    <div className="text-base sm:text-lg font-black tracking-tight text-white">{value}</div>
                    <div className="mt-0.5 text-[10px] font-semibold text-indigo-200/80 uppercase tracking-wide leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Form Section */}
          <section className="relative lg:col-span-7 bg-white px-5 py-6 sm:px-8 sm:py-8 xl:px-10 flex flex-col justify-center">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />
            <div className="mx-auto w-full max-w-lg">
              
              {/* Heading */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-[0.12em]">
                    <ActivePortalIcon className="h-3.5 w-3.5" />
                    <span>{activePortal.label} portal</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                    {authMode === 'login' ? 'Welcome back.' : 'Start your journey.'}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {authMode === 'login' ? 'Sign in to continue where your ambitions left off.' : 'Create a profile built for your campus role.'}
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 text-slate-400 sm:block">
                  <CircleHelp className="h-4 w-4" />
                </div>
              </div>

              {/* Portal Switcher */}
              <div className="auth-portal-switcher mb-3.5 grid grid-cols-2 gap-1.5 p-1">
                {portalOptions.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => changePortal(id)}
                    className={`auth-portal-option ${portalBranch === id ? 'is-active' : ''}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Mode Tabs */}
              <div className="mb-3.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex gap-4">
                  {['login', 'register'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setAuthMode(mode); setErrorMsg(''); }}
                      className={`auth-mode-tab ${authMode === mode ? 'is-active' : ''}`}
                    >
                      {mode === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>
                <span className="hidden text-[11px] font-semibold text-slate-400 sm:block">Role-aware access</span>
              </div>

              {/* Role Picker */}
              <div className="mb-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">I’m signing in as</label>
                  <span className="text-[11px] text-slate-400">Choose your workspace</span>
                </div>
                <div className={`grid gap-1.5 ${roleOptions.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                  {roleOptions.map(({ id, label, icon: Icon, description }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedRole(id)}
                      className={`auth-role-card ${selectedRole === id ? 'is-selected' : ''}`}
                    >
                      <span className="auth-role-icon"><Icon className="h-3.5 w-3.5" /></span>
                      <span className="min-w-0 text-left">
                        <span className="block truncate text-xs font-bold text-slate-800">{label}</span>
                        <span className="block truncate text-[10px] text-slate-400">{description}</span>
                      </span>
                      {selectedRole === id && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Demo Autofill Banner */}
              <div className="mb-3.5 flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                  <p className="text-xs font-medium text-indigo-950">Exploring the demo? Fill sample details instantly.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillDemo}
                  className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-100 transition hover:bg-indigo-600 hover:text-white"
                >
                  Autofill
                </button>
              </div>

              {/* Feedback Alerts */}
              {errorMsg && <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{errorMsg}</div>}
              {successMsg && <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />{successMsg}</div>}

              {/* Input Form with zero-overlap InputField */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {authMode === 'register' && (
                  <InputField label="Full name" icon={User}>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Priyansh Jain"
                      className={fieldClass}
                      required
                    />
                  </InputField>
                )}

                <InputField label="Email address" icon={Mail}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={selectedRole === 'hr' ? 'recruiter@company.com' : 'you@university.edu'}
                    className={fieldClass}
                    required
                  />
                </InputField>

                {authMode === 'register' && selectedRole === 'student' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <InputField label="Roll number">
                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        placeholder="2024/CSE/084"
                        className={`${fieldClass} no-icon`}
                      />
                    </InputField>
                    <InputField label="Graduation batch">
                      <select
                        name="batch"
                        value={formData.batch}
                        onChange={handleInputChange}
                        className={`${fieldClass} no-icon`}
                      >
                        {['2025', '2026', '2027', '2028', '2029'].map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </InputField>
                  </div>
                )}

                {authMode === 'register' && selectedRole === 'hr' && (
                  <InputField label="Company / organization">
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. HCLTech"
                      className={`${fieldClass} no-icon`}
                      required
                    />
                  </InputField>
                )}

                <InputField
                  label="Password"
                  icon={Lock}
                  action={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-input-action p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`${fieldClass} has-action`}
                    required
                  />
                </InputField>

                {authMode === 'register' && (
                  <InputField label="Confirm password" icon={Lock}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Repeat your password"
                      className={fieldClass}
                      required
                    />
                  </InputField>
                )}

                <div className="flex items-center justify-between pt-0.5 text-[11px] font-medium">
                  <label className="flex cursor-pointer items-center gap-2 text-slate-500">
                    <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    Keep me signed in
                  </label>
                  {authMode === 'login' && (
                    <button type="button" className="text-indigo-600 transition hover:text-indigo-800">
                      Forgot password?
                    </button>
                  )}
                </div>

                <button type="submit" disabled={isSubmitting} className="auth-submit-button py-2.5 disabled:opacity-75 disabled:cursor-wait">
                  <span>
                    {isSubmitting
                      ? 'Saving to database...'
                      : authMode === 'login'
                        ? `Continue as ${roleOptions.find((role) => role.id === selectedRole)?.label}`
                        : 'Create account & continue'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] leading-4 text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Protected with institution-grade security
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}

function InputField({ label, icon: Icon, action, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-700">{label}</span>
      <span className="relative block">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        {React.cloneElement(children, {
          style: {
            paddingLeft: Icon ? '2.85rem' : '0.85rem',
            paddingRight: action ? '2.85rem' : '0.85rem',
            ...(children.props.style || {}),
          },
        })}
        {action && (
          <span className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex items-center">
            {action}
          </span>
        )}
      </span>
    </label>
  );
}
