import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap
} from 'lucide-react';
import { setCurrentUser, setGraduationBatch } from '../services/storage';
import PlacePrepLogo from './PlacePrepLogo';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, triggerBatchModal }) {
  const [tab, setTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    branch: '',
    graduationBatch: '2026',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const loggedUser = {
      id: 'usr-' + Date.now(),
      name: formData.email.split('@')[0],
      email: formData.email,
      college: 'Delhi Technological University (DTU)',
      branch: 'Computer Science',
      graduationBatch: '2026',
      role: 'student'
    };

    setCurrentUser(loggedUser);
    setSuccessMsg('Authentication successful! Initializing placement session...');
    setTimeout(() => {
      onAuthSuccess?.(loggedUser);
      onClose();
    }, 600);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: formData.fullName,
      email: formData.email,
      college: formData.collegeName || 'National Institute of Technology',
      branch: formData.branch || 'Computer Science & Engineering',
      graduationBatch: formData.graduationBatch,
      role: 'student'
    };

    setCurrentUser(newUser);
    setGraduationBatch(formData.graduationBatch);
    setSuccessMsg('Account registered successfully! Welcome to PlacePrep.');

    setTimeout(() => {
      onAuthSuccess?.(newUser);
      onClose();
      if (!formData.graduationBatch) {
        triggerBatchModal?.();
      }
    }, 700);
  };

  const handleDemoLogin = (role = 'student', batch = '2026') => {
    const demoUser = {
      id: role === 'admin' ? 'admin-01' : 'student-demo',
      name: role === 'admin' ? 'Placement Director' : 'Priyansh Jain',
      email: role === 'admin' ? 'admin@placeprep.ai' : 'priyansh.jain@example.edu',
      college: 'Delhi Technological University (DTU)',
      branch: 'Computer Science and Engineering',
      graduationBatch: batch,
      role: role
    };

    setCurrentUser(demoUser);
    setGraduationBatch(batch);
    setSuccessMsg(`Logged in as ${role === 'admin' ? 'Admin' : `Student (${batch} Cohort)`}!`);
    setTimeout(() => {
      onAuthSuccess?.(demoUser);
      onClose();
    }, 500);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrorMsg('Please enter your registered institutional email.');
      return;
    }
    setSuccessMsg('Reset instructions dispatched to ' + formData.email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 text-white">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-[#0B0F19] via-slate-900 to-indigo-950/70 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="mb-1">
              <PlacePrepLogo className="w-8 h-8" subtitle={null} />
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {tab === 'login' && 'Sign in to access personalized placement intelligence'}
              {tab === 'signup' && 'Create institutional candidate placement credentials'}
              {tab === 'forgot' && 'Reset account access credentials'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Demo Presets:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student', '2026')}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-bold shadow-xs transition-all text-[11px]"
            >
              Student (2026)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin', '2026')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold shadow-xs transition-all text-[11px]"
            >
              Admin Mode
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tab !== 'forgot' && (
          <div className="flex border-b border-slate-800 text-xs font-mono font-semibold bg-slate-950/50">
            <button
              onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                tab === 'login'
                  ? 'border-indigo-500 text-white bg-indigo-500/10 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                tab === 'signup'
                  ? 'border-indigo-500 text-white bg-indigo-500/10 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Student Registration
            </button>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all shadow-inner font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-xs text-indigo-400 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all shadow-inner font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold text-xs shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all border border-indigo-400/30"
              >
                Sign In to Platform
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Priyansh Jain"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Institutional Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">College Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      placeholder="e.g. DTU / VIT / IIT"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Degree / Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="B.Tech Computer Science"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Graduation Cohort *</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    name="graduationBatch"
                    value={formData.graduationBatch}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  >
                    <option value="2026">2026 Batch (Final Year)</option>
                    <option value="2027">2027 Batch (Pre-Final Year)</option>
                    <option value="2028">2028 Batch (Sophomore)</option>
                    <option value="2029">2029 Batch (Fresher)</option>
                    <option value="Other">Other / Alumni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 chars"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-type password"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold text-xs shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
                >
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-slate-400">
                Enter your institutional email address to receive secure reset credentials.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@college.edu"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold text-xs shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all"
              >
                Dispatch Reset Link
              </button>

              <button
                type="button"
                onClick={() => setTab('login')}
                className="w-full text-center text-xs text-indigo-400 hover:underline font-semibold font-mono"
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
