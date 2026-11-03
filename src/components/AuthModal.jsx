import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AuthApi } from '../services/api';
import { setCurrentUser, setGraduationBatch } from '../services/storage';
import { isCollegeEmail } from '../pages/AuthPortalPage';
import PlacePrepLogo from './PlacePrepLogo';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { INITIAL_BRANCHES } from '../data/initialAcademicRecords';
import { DEMO_AUTOFILL_ACCOUNTS, autofillLoginFields } from '../data/demoAutofillAccounts';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, triggerBatchModal }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    branch: '',
    graduationBatch: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleAutofillModal = (account) => {
    setFormData((current) => autofillLoginFields(current, account));
    setErrorMsg('');
    setSuccessMsg(`Email filled for ${account.label}. Enter your password to sign in.`);
  };

  const handleLogin = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const emailTrim = formData.email.trim().toLowerCase();
      const res = await AuthApi.login({
        email: emailTrim,
        password: formData.password
      });
      if (!res?.user) {
        throw new Error('Backend login did not return a user session.');
      }
      const userObj = { ...res.user, authenticatedAt: new Date().toISOString() };

      setCurrentUser(userObj);
      setSuccessMsg(`Welcome back, ${userObj.name}!`);
      setTimeout(() => {
        onAuthSuccess?.(userObj);
        onClose();
      }, 200);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.branch) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }
    if (!isCollegeEmail(formData.email)) {
      setErrorMsg('Please enter an official college email address (.edu, .ac.in, or .edu.in).');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await AuthApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        graduationBatch: formData.graduationBatch
      });

      if (!res?.user || String(res.user.role).toLowerCase() !== 'student') {
        throw new Error('Student registration did not return a student account.');
      }
      setCurrentUser(res.user);
      setGraduationBatch(formData.graduationBatch);
      setSuccessMsg('Account created successfully! Welcome to PlacePrep.');
      setTimeout(() => {
        onAuthSuccess?.(res.user);
        onClose();
      }, 250);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative p-6 pb-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <PlacePrepLogo className="w-8 h-8" />
            <span className="font-extrabold text-lg text-white">PlacePrep Account</span>
          </div>
          <p className="text-xs text-indigo-200 leading-relaxed">
            {tab === 'login'
              ? 'Sign in to access your saved questions, personalized drives, and mock history.'
              : 'Create a student profile to track eligibility and company preparation.'}
          </p>

          {/* Tab selector */}
          <div className="flex rounded-xl bg-white/10 p-1 mt-4 gap-1">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tab === 'login' ? 'bg-white text-indigo-950 shadow-xs' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tab === 'signup' ? 'bg-white text-indigo-950 shadow-xs' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC2626] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#16A34A] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <div className="space-y-3.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-orange-50 via-slate-50 to-indigo-50/60 border border-orange-200/70">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Autofill account email</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEMO_AUTOFILL_ACCOUNTS.map((account) => (
                    <button key={account.role} type="button" onClick={() => handleAutofillModal(account)}
                      title={`Fill email for ${account.label}`}
                      className="p-1.5 rounded-lg bg-white border border-slate-200/90 hover:border-orange-500 text-left cursor-pointer transition shadow-2xs">
                      <span className="block text-[11px] font-bold text-slate-800">{account.label}</span>
                      <span className="block text-[9px] text-slate-500 truncate">{account.email}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">Use an existing backend account and enter its password.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3.5">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@college.edu"
                  icon={Mail}
                  required
                />
                {formData.email && (
                  <div className="text-[11px] font-semibold flex items-center gap-1 mt-1 text-left">
                    {isCollegeEmail(formData.email) ? (
                      <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> College domain verified (.edu / .ac.in / .edu.in)</span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> College email recommended (.edu, .ac.in, .edu.in)</span>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-[#0F172A]">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" loading={loading} className="w-full">
                    Sign In
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                icon={UserIcon}
                required
              />

              <Input
                label="College Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@dtu.ac.in"
                icon={Mail}
                required
              />
              {formData.email && (
                <div className="text-[11px] font-semibold flex items-center gap-1 mt-1 text-left">
                  {isCollegeEmail(formData.email) ? (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> College domain verified (.edu / .ac.in / .edu.in)</span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-rose-500" /> College email required (.edu, .ac.in, .edu.in)</span>
                  )}
                </div>
              )}

              <Select
                label="Branch / specialization"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Select your branch' },
                  ...INITIAL_BRANCHES.map((branch) => ({ value: branch, label: branch }))
                ]}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="College / University"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="DTU, Delhi"
                  icon={Building}
                />
                <Select
                  label="Graduation Batch"
                  name="graduationBatch"
                  value={formData.graduationBatch}
                  onChange={handleChange}
                  options={[
                    { value: '2026', label: '2026 Batch' },
                    { value: '2027', label: '2027 Batch' },
                    { value: '2028', label: '2028 Batch' },
                    { value: '2029', label: '2029 Batch' }
                  ]}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#0F172A]">Password (min 6 chars)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />

              <div className="pt-2">
                <Button type="submit" loading={loading} className="w-full">
                  Create Student Account
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
