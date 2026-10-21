import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  Menu, 
  X, 
  Building2, 
  Briefcase, 
  BookOpen, 
  MessageSquare, 
  Bot, 
  ShieldCheck, 
  ChevronDown, 
  LogOut, 
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  Calendar,
  Layers
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
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [batch, setBatch] = useState(getGraduationBatch());

  const userDropdownRef = useRef(null);
  const moreDropdownRef = useRef(null);

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
    { id: 'academic-records', label: 'Academic Records', icon: GraduationCap },
  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary navigation items (focused, high-frequency)
  const primaryNavLinks = [
    { id: 'drives', label: 'Placement Drives', icon: Briefcase },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'prep', label: 'Question Bank', icon: BookOpen },
    { id: 'mock-interview', label: 'AI Mock Interview', icon: Bot, isNew: true },
    { id: 'workflow', label: 'Pipeline Workflow', icon: ClipboardCheck },
  ];

  // Secondary items grouped into clean "Resources" dropdown
  const secondaryNavLinks = [
    { id: 'experiences', label: 'Interview Experiences', description: 'Real candidate transcripts & tips', icon: MessageSquare },
    { id: 'ai-insights', label: 'Company Intelligence', description: 'Data-driven hiring trends & patterns', icon: Sparkles },
    { id: 'admin', label: 'Placement Cell (Admin)', description: 'TPO drives, rounds & verification', icon: ShieldCheck },
  ];

  const handleNavigate = (routeId) => {
    setCurrentRoute(routeId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSecondaryActive = secondaryNavLinks.some(link => link.id === currentRoute);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleNavigate('home')} 
              className="flex items-center text-left focus:outline-none"
              title="PlacePrep Home"
            >
              <PlacePrepLogo />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {primaryNavLinks.map((item) => {
                const active = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      active 
                        ? 'text-indigo-600 bg-indigo-50 font-semibold' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.isNew && (
                      <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[10px] rounded font-semibold">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Resources Dropdown */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isSecondaryActive 
                      ? 'text-indigo-600 bg-indigo-50 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>More Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50">
                    {secondaryNavLinks.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const active = currentRoute === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleNavigate(subItem.id)}
                          className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                            active ? 'bg-indigo-50/70 text-indigo-900' : 'text-slate-700'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <div>
                            <div className="text-sm font-medium text-slate-900">{subItem.label}</div>
                            <div className="text-xs text-slate-500 leading-snug">{subItem.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Quick Search, Batch Switcher, User Menu */}
          <div className="flex items-center gap-2.5">
            
            {/* Quick Search Button (Cmd+K) */}
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-3 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Search companies, questions, or drives (Ctrl+K)"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search everything...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-white text-slate-500 border border-slate-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Batch Selector Pill */}
            <button
              onClick={onOpenBatchModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Change Graduation Batch"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Batch {batch}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* User Profile / Dashboard Menu */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => {
                  if (!user) {
                    onOpenAuthModal();
                  } else {
                    setUserDropdownOpen(!userDropdownOpen);
                  }
                }}
                className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  user 
                    ? 'border-slate-200 hover:bg-slate-50 text-slate-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-xs'
                }`}
              >
                {user ? (
                  <>
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <span className="hidden md:inline font-medium text-slate-800">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* User Account Dropdown */}
              {userDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-500">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email || user.college}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] rounded font-medium">
                      {user.role === 'admin' ? 'Placement Admin / TPO' : `Student • ${batch} Batch`}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Placement Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('academic-records')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      Student Academic Records
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenBatchModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      onClick={() => handleNavigate('drives')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Registered Drive Passes</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('admin')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Placement Cell Controls</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        localStorage.removeItem('placeprep_current_user');
                        setUser(null);
                        setUserDropdownOpen(false);
                        window.location.reload();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { onOpenSearch(); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg mb-2"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search companies, questions, or drives...</span>
          </button>

          <div className="space-y-1">
            {[...primaryNavLinks, ...secondaryNavLinks].map((item) => {
              const active = currentRoute === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
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
