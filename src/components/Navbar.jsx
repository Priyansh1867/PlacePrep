import React, { useState, useEffect } from 'react';
import {
  Search,
  Menu,
  X,
  GraduationCap,
  ChevronDown,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  LayoutDashboard,
  Building2,
  Code2,
  Binary,
  Briefcase,
  FileCheck2,
  MessageSquare,
  Bot,
  RotateCcw,
  ClipboardCheck,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import PlacePrepLogo from './PlacePrepLogo';
import Badge from './ui/Badge';

export default function Navbar({
  currentRoute,
  setCurrentRoute,
  onOpenSearch,
  onOpenBatchModal,
  onOpenAuthModal,
  user,
  batch,
  onLogout,
  onDemoLogin
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#user-profile-menu')) {
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNavigate = (routeId) => {
    setCurrentRoute(routeId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mobileNavLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'dsa', label: 'DSA Practice', icon: Code2 },
    { id: 'core-cs', label: 'Core CS', icon: Binary },
    { id: 'aptitude', label: 'Aptitude & Reasoning', icon: BookOpen },
    { id: 'prep', label: 'Question Bank', icon: HelpCircle },
    { id: 'mock-interview', label: 'AI Mock Coach', icon: Bot },
    { id: 'drives', label: 'Placement Drives', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileCheck2 },
    { id: 'experiences', label: 'Experiences', icon: MessageSquare },
    { id: 'workflow', label: 'Candidate Pipeline', icon: ClipboardCheck },
    { id: 'ai-insights', label: 'Readiness Analytics', icon: Sparkles },
    { id: 'revision', label: 'Revision List', icon: RotateCcw }
  ];

  if (user?.role === 'admin') {
    mobileNavLinks.push({ id: 'admin', label: 'Admin Console', icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2 text-left group focus:outline-none lg:hidden"
            >
              <PlacePrepLogo className="w-8 h-8" />
              <span className="font-extrabold text-base text-[#0F172A]">
                Place<span className="text-[#4F46E5]">Prep</span>
              </span>
            </button>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 text-xs text-slate-400 transition-all shadow-2xs group focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span className="truncate">Search companies, questions, drives...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-[10px] font-mono text-slate-500">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right: Batch Pill, Demo Switcher & User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Batch Selector Badge */}
            <button
              onClick={onOpenBatchModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-[#0F172A] hover:text-[#4F46E5] text-xs font-bold transition-all border border-slate-200/80"
              title="Change target graduation batch"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Batch {batch}</span>
            </button>

            {/* User Profile or Sign In */}
            {user ? (
              <div id="user-profile-menu" className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] hidden md:inline truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge variant={user.role === 'admin' ? 'danger' : 'primary'} size="sm">
                          {user.role === 'admin' ? 'Admin / Officer' : 'Student'}
                        </Badge>
                        <span className="text-[11px] text-slate-400">Batch {batch}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavigate('dashboard')}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Student Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleNavigate('applications')}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
                      >
                        <FileCheck2 className="w-4 h-4 text-slate-400" />
                        <span>My Applications</span>
                      </button>
                      <button
                        onClick={onOpenBatchModal}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
                      >
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>Change Graduation Batch</span>
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleNavigate('admin')}
                          className="w-full px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 flex items-center gap-2 text-left"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-600" />
                          <span>Admin Console</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Demo Role
                      </div>
                      <button
                        onClick={() => {
                          onDemoLogin('student');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50 text-left"
                      >
                        Login as Demo Student
                      </button>
                      <button
                        onClick={() => {
                          onDemoLogin('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50 text-left"
                      >
                        Login as Placement Officer (Admin)
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                onOpenBatchModal();
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Batch {batch}</span>
            </button>
            <button
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Search</span>
            </button>
          </div>

          <div className="space-y-1">
            {mobileNavLinks.map((item) => {
              const isActive = currentRoute === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-[#4F46E5] font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
