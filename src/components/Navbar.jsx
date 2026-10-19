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
  ClipboardCheck
} from 'lucide-react';
import { getCurrentUser, getGraduationBatch } from '../services/storage';
import PlacePrepLogo from './PlacePrepLogo';

export default function Navbar({ 
  currentRoute, 
  setCurrentRoute, 
  onOpenSearch, 
  onOpenBatchModal, 
  onOpenAuthModal 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [batch, setBatch] = useState(getGraduationBatch());

  useEffect(() => {
    const handleBatchChange = (e) => {
      setBatch(e.detail || getGraduationBatch());
    };
    window.addEventListener('batch-changed', handleBatchChange);
    return () => window.removeEventListener('batch-changed', handleBatchChange);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'workflow', label: 'Selection Workflow', icon: ClipboardCheck },
    { id: 'drives', label: 'Placement Drives', icon: Briefcase },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'prep', label: 'Interview Prep', icon: BookOpen },
    { id: 'experiences', label: 'Experiences', icon: MessageSquare },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
    { id: 'mock-interview', label: 'AI Mock', icon: Bot, isPill: true },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  const handleNavigate = (routeId) => {
    setCurrentRoute(routeId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNavigate('home')} 
              className="flex items-center text-left group focus:outline-none"
            >
              <PlacePrepLogo className="w-10 h-10" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const active = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    active 
                      ? 'text-indigo-600 bg-indigo-50/80 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.label}
                  {item.isPill && (
                    <span className="px-1.5 py-0.2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] rounded-full font-bold">
                      LIVE
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-white hover:border-slate-300 transition-all text-xs font-medium shadow-sm"
              title="Search companies, questions & drives (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="px-1.5 py-0.5 bg-slate-200/80 text-slate-600 rounded text-[10px] font-mono">⌘K</kbd>
            </button>

            {/* Batch Selector Badge */}
            <button
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all text-xs font-semibold shadow-sm"
              title="Change Graduation Batch"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Batch {batch}</span>
              <SlidersHorizontal className="w-3 h-3 text-indigo-500 opacity-70" />
            </button>

            {/* Student Profile / Auth */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-all focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {user?.name ? user.name[0].toUpperCase() : 'P'}
                </div>
                <span className="hidden md:inline font-semibold text-slate-800">
                  {user?.name?.split(' ')[0] || 'Student'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user?.name || 'Priyansh Jain'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'priyansh@example.com'}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      ✓ Active Student • {batch} Batch
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      My Placement Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenBatchModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      Change Graduation Batch
                    </button>
                    <button
                      onClick={() => handleNavigate('admin')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Admin Control Panel
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Switch Account / Re-login
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch();
            }}
            className="w-full mb-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search companies, questions & drives...</span>
          </button>

          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentRoute === item.id 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.isPill && (
                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full font-bold">
                  AI
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleNavigate('dashboard');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50/50 flex items-center gap-2 mt-2"
          >
            <User className="w-4 h-4" />
            <span>My Student Dashboard</span>
          </button>
        </div>
      )}
    </header>
  );
}
