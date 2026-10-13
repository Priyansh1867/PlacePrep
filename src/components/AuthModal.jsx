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
  Sparkles
} from 'lucide-react';
import { setCurrentUser, setGraduationBatch } from '../services/storage';
import PlacePrepLogo from './PlacePrepLogo';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, triggerBatchModal }) {
  const [tab, setTab] = useState('login'); // 'login', 'signup', 'forgot'
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
    graduationBatch: '2028',
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
      college: 'Demo University',
      branch: 'Computer Science',
      graduationBatch: '2028',
      role: 'student'
    };

    setCurrentUser(loggedUser);
    setSuccessMsg('Logged in successfully! Redirecting...');
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
    setSuccessMsg('Account created successfully! Welcome to PlacePrep AI.');

    setTimeout(() => {
      onAuthSuccess?.(newUser);
      onClose();
      if (!formData.graduationBatch) {
        triggerBatchModal?.();
      }
    }, 700);
  };

  const handleDemoLogin = (role = 'student', batch = '2028') => {
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
    setSuccessMsg(`Logged in as ${role === 'admin' ? 'Admin' : `Student (${batch} Batch)`}!`);
    setTimeout(() => {
      onAuthSuccess?.(demoUser);
      onClose();
    }, 500);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    setSuccessMsg('Password reset instructions sent to ' + formData.email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <div className="mb-1">
              <PlacePrepLogo className="w-8 h-8" subtitle={null} />
            </div>
            <p className="text-xs text-indigo-200">
              {tab === 'login' && 'Sign in to access personalized placement preparation'}
              {tab === 'signup' && 'Create your free student placement account'}
              {tab === 'forgot' && 'Reset your password'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-2.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-indigo-900">⚡ 1-Click Demo Access:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student', '2028')}
              className="px-2.5 py-1 rounded bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold shadow-xs transition-all"
            >
              Student (2028)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin', '2026')}
              className="px-2.5 py-1 rounded bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold shadow-xs transition-all"
            >
              Admin Mode
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tab !== 'forgot' && (
          <div className="flex border-b border-slate-200 text-sm font-semibold">
            <button
              onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                tab === 'login'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                tab === 'signup'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up (Student Registration)
            </button>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-xs text-indigo-600 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all"
              >
                Sign In
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Priyansh Jain"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      placeholder="e.g. DTU / VIT / IIT"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="B.Tech Computer Science"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Batch *</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    name="graduationBatch"
                    value={formData.graduationBatch}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 chars"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-type password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
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
              <p className="text-xs text-slate-600">
                Enter your email address and we'll send a secure link to reset your account credentials.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@college.edu"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all"
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => setTab('login')}
                className="w-full text-center text-xs text-indigo-600 hover:underline font-semibold"
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
