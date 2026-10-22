import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  User, 
  Menu, 
  X, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  BookOpen, 
  MessageSquare, 
  Bot, 
  ShieldCheck,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  ClipboardCheck,
  School,
  Bell,
  Layers,
  LogIn,
  Compass,
  ArrowRight,
  UserCheck,
  Award
} from 'lucide-react';
import { getCurrentUser, getGraduationBatch, getPushNotifications } from '../services/storage';
import PlacePrepLogo from './PlacePrepLogo';

export default function Navbar({ 
  currentRoute, 
  setCurrentRoute, 
  onOpenSearch, 
  onOpenBatchModal, 
  onOpenAuthModal,
  onOpenNotifications,
  onNavigateAuth
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [batch, setBatch] = useState(getGraduationBatch());
  const [unreadNotifCount, setUnreadNotifCount] = useState(2);

  useEffect(() => {
    const handleBatchChange = (e) => {
      setBatch(e.detail || getGraduationBatch());
    };
    window.addEventListener('batch-changed', handleBatchChange);
    return () => window.removeEventListener('batch-changed', handleBatchChange);
  }, []);

  useEffect(() => {
    const handlePush = () => {
      const notifs = getPushNotifications();
      setUnreadNotifCount(notifs.filter(n => !n.read).length);
    };
    window.addEventListener('push-notification-broadcast', handlePush);
    return () => window.removeEventListener('push-notification-broadcast', handlePush);
  }, []);

  const handleNavigate = (routeId) => {
    setCurrentRoute(routeId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setExploreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const moreModules = [
    { id: 'attendance', label: 'Daily Class Attendance', desc: 'Teacher & HOD speed attendance marking portal', icon: UserCheck, isNew: true },
    { id: 'crt-attendance', label: 'CRT Training Attendance', desc: 'Pre-placement training, attendance & certificate eligibility', icon: Award, isNew: true },
    { id: 'landing', label: 'AI Manager Landing Page', desc: 'Dark theme Remii-inspired product landing page', icon: Sparkles, isNew: true },
    { id: 'workflow', label: 'Selection Workflow', desc: '4-Round candidate pipeline & evaluator rubrics', icon: ClipboardCheck },
    { id: 'academic-records', label: 'Academic Records', desc: 'Semester marksheets, CGPA & backlogs', icon: GraduationCap },
    { id: 'drives', label: 'Placement Drives', desc: 'Campus drive schedules, packages & criteria', icon: Briefcase },
    { id: 'prep', label: 'Question Bank', desc: 'Technical, Aptitude & Company rounds', icon: BookOpen },
    { id: 'experiences', label: 'Interview Experiences', desc: 'Senior student placement debriefs', icon: MessageSquare },
    { id: 'mock-interview', label: 'AI Mock Interview', desc: 'Real-time voice & text interview simulation', icon: Bot, isNew: true },
  ];

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-6 max-w-6xl mx-auto w-full transition-all">
      {/* Remii-Style Floating Glass Island Navbar */}
      <div className="rounded-2xl border border-black/[0.07] bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(17,20,57,0.06),0_2px_8px_rgba(17,20,57,0.03)] px-4 py-2.5 flex items-center justify-between">
        
        {/* Left: Official PlacePrep Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <button 
            onClick={() => handleNavigate('gateway')} 
            className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer hover:opacity-95 transition-opacity"
          >
            <PlacePrepLogo className="h-7 sm:h-8 w-auto" theme="light" />
          </button>
        </div>

        {/* Center: Remii-Style Minimalist Floating Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600">
          
          <button
            onClick={() => handleNavigate('gateway')}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              currentRoute === 'gateway' || currentRoute === 'home'
                ? 'bg-[#111439] text-white font-semibold shadow-xs'
                : 'hover:text-[#111439] hover:bg-black/[0.04]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => handleNavigate('institute-portal')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              currentRoute === 'institute-portal'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'hover:text-[#111439] hover:bg-black/[0.04]'
            }`}
          >
            <School className="w-3.5 h-3.5 text-indigo-500" />
            <span>Institute</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              Campus
            </span>
          </button>

          <button
            onClick={() => handleNavigate('placement-portal')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              currentRoute === 'placement-portal'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'hover:text-[#111439] hover:bg-black/[0.04]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
            <span>Placement</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              Corporate
            </span>
          </button>

          {/* More Modules Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                exploreDropdownOpen || ['workflow', 'academic-records', 'drives', 'prep', 'experiences', 'mock-interview'].includes(currentRoute)
                  ? 'bg-black/[0.06] text-[#111439] font-semibold'
                  : 'hover:text-[#111439] hover:bg-black/[0.04]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Modules</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {exploreDropdownOpen && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-[0_16px_40px_rgba(17,20,57,0.12)] p-2 z-50 animate-in fade-in-50 zoom-in-95"
                onMouseLeave={() => setExploreDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-black/[0.04] mb-1">
                  All Specialized Engines
                </div>
                <div className="space-y-1">
                  {moreModules.map(mod => {
                    const Icon = mod.icon;
                    const isActive = currentRoute === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleNavigate(mod.id)}
                        className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 cursor-pointer ${
                          isActive ? 'bg-indigo-50/80 text-indigo-900' : 'hover:bg-black/[0.03] text-slate-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#111439]">{mod.label}</span>
                            {mod.isNew && (
                              <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] font-bold rounded-full">
                                AI
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{mod.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavigate('admin')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
              currentRoute === 'admin'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'hover:text-[#111439] hover:bg-black/[0.04]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Right: Tools & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-black/[0.06] bg-black/[0.02] hover:bg-black/[0.05] text-slate-500 hover:text-[#111439] transition-all text-xs cursor-pointer"
            title="Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] text-slate-400 font-mono">⌘K</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative flex items-center justify-center w-8 h-8 rounded-xl border border-black/[0.06] bg-black/[0.02] hover:bg-black/[0.05] text-slate-600 hover:text-[#111439] transition cursor-pointer"
            title="Campus Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Batch Selector */}
          <button
            onClick={onOpenBatchModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/[0.02] border border-black/[0.06] text-[#111439] hover:bg-black/[0.05] transition text-xs font-semibold cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>{batch}</span>
          </button>

          {/* User Profile / Login Pill */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full border border-black/[0.08] bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#111439] text-white flex items-center justify-center font-bold text-[11px]">
                {user?.name ? user.name[0].toUpperCase() : 'P'}
              </div>
              <span className="hidden sm:inline font-semibold text-[#111439] text-xs">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-[0_16px_40px_rgba(17,20,57,0.12)] py-2 z-50 animate-in fade-in-50 zoom-in-95 text-xs">
                <div className="px-4 py-3 border-b border-black/[0.05]">
                  <p className="font-semibold text-[#111439]">{user?.name || 'Priyansh Jain'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'priyansh.jain@example.edu'}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold uppercase">
                    Role: {user?.role || 'STUDENT'} • {batch}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => handleNavigate('institute-portal')}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-black/[0.03] flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <School className="w-3.5 h-3.5 text-indigo-600" />
                    Institute Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigate('placement-portal')}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-black/[0.03] flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    Placement Dashboard
                  </button>
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-black/[0.03] flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    My Student Profile
                  </button>
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-black/[0.03] flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Super Admin Panel
                  </button>
                </div>

                <div className="border-t border-black/[0.05] pt-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigateAuth('institute');
                    }}
                    className="w-full text-left px-4 py-2 text-indigo-600 hover:bg-indigo-50/50 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Switch Persona / Sign In
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl text-slate-600 hover:text-[#111439] hover:bg-black/[0.04] focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl border border-black/[0.08] bg-white/95 backdrop-blur-xl p-4 shadow-xl text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavigate('gateway')}
              className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                currentRoute === 'gateway' ? 'bg-[#111439] text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleNavigate('institute-portal')}
              className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                currentRoute === 'institute-portal' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Institute</span>
            </button>
            <button
              onClick={() => handleNavigate('placement-portal')}
              className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                currentRoute === 'placement-portal' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Placement</span>
            </button>
            <button
              onClick={() => handleNavigate('admin')}
              className={`p-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                currentRoute === 'admin' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          <div className="pt-2 border-t border-black/[0.05] space-y-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase px-2 mb-1">More Engines</p>
            {moreModules.map(mod => (
              <button
                key={mod.id}
                onClick={() => handleNavigate(mod.id)}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-black/[0.03] flex items-center gap-2 font-medium"
              >
                <mod.icon className="w-4 h-4 text-indigo-500" />
                <span>{mod.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-black/[0.05]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAuth('institute');
              }}
              className="w-full text-center py-2.5 rounded-xl bg-[#111439] text-white font-semibold cursor-pointer"
            >
              Sign In / Switch Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
}