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
  Activity
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
    { id: 'workflow', label: 'Workflow', icon: ClipboardCheck },
    { id: 'drives', label: 'Drives', icon: Briefcase },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'prep', label: 'Questions', icon: BookOpen },
    { id: 'experiences', label: 'Experiences', icon: MessageSquare },
    { id: 'ai-insights', label: 'Insights', icon: Sparkles },
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
    <header className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNavigate('home')} 
              className="flex items-center text-left group focus:outline-none"
            >
              <PlacePrepLogo className="w-9 h-9" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60 backdrop-blur-md">
            {navLinks.map((item) => {
              const active = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    active 
                      ? 'text-white bg-indigo-500/20 border border-indigo-500/40 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.label}
                  {item.isPill && (
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] rounded-full font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]">
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
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-xs font-medium shadow-inner"
              title="Search companies, questions & drives (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800/80 text-slate-400 rounded text-[10px] font-mono border border-slate-700/60">⌘K</kbd>
            </button>

            {/* Batch Selector Badge */}
            <button
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 hover:border-indigo-400/50 transition-all text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.2)]"
              title="Change Graduation Batch"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Batch {batch}</span>
              <SlidersHorizontal className="w-3 h-3 text-indigo-400 opacity-70" />
            </button>

            {/* Student Profile / Auth */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-medium shadow-sm transition-all focus:outline-none hover:border-slate-700"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {user?.name ? user.name[0].toUpperCase() : 'P'}
                </div>
                <span className="hidden md:inline font-semibold text-slate-200">
                  {user?.name?.split(' ')[0] || 'Student'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0B0F19]/95 backdrop-blur-2xl border border-slate-800 shadow-2xl shadow-black py-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-slate-800/80">
                    <p className="text-xs font-semibold text-slate-100">{user?.name || 'Priyansh Jain'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'priyansh@example.com'}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active Student • {batch} Batch
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/70 hover:text-white flex items-center gap-2 font-medium transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      My Placement Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenBatchModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/70 hover:text-white flex items-center gap-2 font-medium transition-colors"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      Change Graduation Batch
                    </button>
                    <button
                      onClick={() => handleNavigate('admin')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/70 hover:text-white flex items-center gap-2 font-medium transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Admin Control Panel
                    </button>
                  </div>

                  <div className="border-t border-slate-800/80 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      Switch Account / Re-login
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#0B0F19]/95 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-1 shadow-2xl">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch();
            }}
            className="w-full mb-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 text-xs font-medium"
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
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold' 
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-slate-400" />
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
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2 mt-2"
          >
            <User className="w-4 h-4" />
            <span>My Student Dashboard</span>
          </button>
        </div>
      )}
    </header>
  );
}
