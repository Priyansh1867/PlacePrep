import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  ChevronDown, 
  LogOut, 
  LogIn, 
  School, 
  Briefcase, 
  LayoutDashboard, 
  ShieldCheck, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getCurrentUser, logoutUser, getGraduationBatch } from '../services/storage';

export default function UserProfileMenu({ 
  onNavigate, 
  onOpenAuthModal, 
  theme = 'light',
  className = ''
}) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [batch, setBatch] = useState(() => getGraduationBatch());
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleAuthChange = (e) => {
      setUser(e.detail || getCurrentUser());
    };
    const handleBatchChange = (e) => {
      setBatch(e.detail || getGraduationBatch());
    };

    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('batch-changed', handleBatchChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('batch-changed', handleBatchChange);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
    setToastMessage('Logged out successfully! Redirecting to Home...');
    
    setTimeout(() => {
      setToastMessage(null);
      if (onNavigate) {
        onNavigate('gateway');
      } else {
        window.location.hash = '#gateway';
      }
    }, 600);
  };

  const handleNavigateItem = (routeId) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(routeId);
    } else {
      window.location.hash = `#${routeId}`;
    }
  };

  const isLoggedIn = Boolean(user && user.isLoggedIn !== false && user.id !== 'guest');

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-top-3 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* When Logged In: Show Profile Avatar & Name */}
      {isLoggedIn ? (
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full border transition cursor-pointer shadow-xs ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-white hover:bg-slate-50 border-black/[0.08] text-slate-800'
            }`}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-indigo-400/50 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <div className="text-left hidden sm:block">
              <span className={`block font-bold text-xs leading-none ${theme === 'dark' ? 'text-white' : 'text-[#111439]'}`}>
                {user?.name || 'Payanshi Jain'}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider leading-tight ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-600'}`}>
                {user?.role || 'Student'}
              </span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-slate-300' : 'text-slate-400'}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2.5 w-72 rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2 z-50 animate-in fade-in-50 zoom-in-95 text-xs text-slate-800">
              
              {/* Dropdown User Info Card */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-t-3xl">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-extrabold text-slate-900 truncate">{user?.name || 'Payanshi Jain'}</p>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black shrink-0">
                      ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'payanshijain.ai27@jecrc.ac.in'}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                    {user?.role || 'STUDENT'} • Batch {batch}
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-1.5 space-y-0.5">
                <button
                  onClick={() => handleNavigateItem('profile')}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-700 flex items-center justify-between font-bold transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>My Profile (Superset)</span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">View</span>
                </button>

                <button
                  onClick={() => handleNavigateItem('institute-portal')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 font-medium transition cursor-pointer"
                >
                  <School className="w-4 h-4 text-indigo-600" />
                  <span>Institute Workspace</span>
                </button>

                <button
                  onClick={() => handleNavigateItem('placement-portal')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 font-medium transition cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Placement Operations</span>
                </button>

                <button
                  onClick={() => handleNavigateItem('dashboard')}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 font-medium transition cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-600" />
                  <span>Student Dashboard</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleNavigateItem('admin')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-2.5 font-medium transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Super Admin Panel</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: Switch Persona & Logout */}
              <div className="border-t border-slate-100 pt-1.5 pb-1 space-y-0.5">
                {onOpenAuthModal && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full text-left px-4 py-2 text-indigo-600 hover:bg-indigo-50/60 flex items-center gap-2.5 font-bold transition cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Switch Persona / Sign In</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 font-black transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout (Go to Home Page)</span>
                </button>
              </div>

            </div>
          )}
        </div>
      ) : (
        /* When Logged Out: Show Sign In Button */
        <button
          onClick={() => {
            if (onOpenAuthModal) onOpenAuthModal();
            else if (onNavigate) onNavigate('gateway');
            else window.location.hash = '#gateway';
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs shadow-sm transition cursor-pointer ${
            theme === 'dark'
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In / Login</span>
        </button>
      )}

    </div>
  );
}
