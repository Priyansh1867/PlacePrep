import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Building2, 
  GraduationCap, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { setCurrentUser, getGraduationBatch } from '../services/storage';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, triggerBatchModal }) {
  const currentBatch = getGraduationBatch();
  const [tab, setTab] = useState('signin'); // 'signin' or 'signup'
  
  // Form states
  const [name, setName] = useState('Priyansh Jain');
  const [email, setEmail] = useState('priyansh.jain@example.edu');
  const [college, setCollege] = useState('Delhi Technological University (DTU)');
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [graduationBatch, setGraduationBatch] = useState(currentBatch);
  const [password, setPassword] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please provide a valid name and college email.');
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      college: college.trim(),
      branch: branch.trim(),
      graduationBatch,
      role: email.includes('admin') || email.includes('tpo') ? 'admin' : 'student',
      signedInAt: new Date().toISOString()
    };

    setCurrentUser(userData);
    setErrorMsg('');
    if (onAuthSuccess) onAuthSuccess(userData);
    onClose();
  };

  const handleDemoSignIn = (roleType) => {
    let demoUser;
    if (roleType === 'student') {
      demoUser = {
        name: 'Priyansh Jain',
        email: 'priyansh.jain@dtu.ac.in',
        college: 'Delhi Technological University (DTU)',
        branch: 'Computer Science and Engineering',
        graduationBatch: currentBatch,
        cgpa: 8.85,
        tenthPercentage: 92.4,
        twelfthPercentage: 89.6,
        activeBacklogs: 0,
        role: 'student',
        signedInAt: new Date().toISOString()
      };
    } else {
      demoUser = {
        name: 'Dr. R. K. Sharma',
        email: 'tpo.head@dtu.ac.in',
        college: 'Delhi Technological University (DTU)',
        branch: 'Placement & Career Services Office',
        graduationBatch: 'All Batches',
        role: 'admin',
        signedInAt: new Date().toISOString()
      };
    }

    setCurrentUser(demoUser);
    if (onAuthSuccess) onAuthSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">
                {tab === 'signin' ? 'Sign in to PlacePrep' : 'Create Student Profile'}
              </h3>
              <p className="text-xs text-slate-500">
                Access verified campus drives, conflict detector & question bank.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3">
          <div className="segmented-control w-full grid grid-cols-2 text-center text-xs">
            <button
              onClick={() => setTab('signin')}
              className={`py-1.5 rounded-md font-medium transition-colors ${
                tab === 'signin' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`py-1.5 rounded-md font-medium transition-colors ${
                tab === 'signup' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              New Student Registration
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus-ring"
              placeholder="e.g. Priyansh Jain"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">College Email ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus-ring"
              placeholder="e.g. student@college.edu"
              required
            />
          </div>

          {tab === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">University / College</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus-ring"
                  placeholder="e.g. DTU, VIT, NIT"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus-ring"
                    placeholder="e.g. CSE"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Graduation Batch</label>
                  <select
                    value={graduationBatch}
                    onChange={(e) => setGraduationBatch(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus-ring"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors"
          >
            {tab === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration'}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            1-Click Instant Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoSignIn('student')}
              className="px-2.5 py-1.5 text-xs text-left bg-white border border-slate-200 hover:border-slate-300 rounded-lg"
            >
              <div className="font-semibold text-slate-800">Student Profile</div>
              <div className="text-[10px] text-slate-500">Priyansh Jain (2026)</div>
            </button>
            <button
              onClick={() => handleDemoSignIn('admin')}
              className="px-2.5 py-1.5 text-xs text-left bg-white border border-slate-200 hover:border-slate-300 rounded-lg"
            >
              <div className="font-semibold text-slate-800">TPO / Admin Profile</div>
              <div className="text-[10px] text-slate-500">Placement Officer</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
