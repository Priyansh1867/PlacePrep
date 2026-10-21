import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Code2,
  Binary,
  GraduationCap,
  HelpCircle,
  Bot,
  Briefcase,
  FileCheck2,
  MessageSquare,
  Sparkles,
  BookmarkCheck,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Layers,
  LogOut,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import PlacePrepLogo from './PlacePrepLogo';
import Badge from './ui/Badge';

export default function Sidebar({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  user,
  batch,
  onOpenBatchModal,
  onLogout,
  onOpenAuthModal
}) {
  const isAdmin = user?.role === 'admin';

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Prepare',
      items: [
        { id: 'companies', label: 'Company Hubs', icon: Building2 },
        { id: 'dsa', label: 'DSA & Coding', icon: Code2, badge: 'New' },
        { id: 'core-cs', label: 'Core CS Subjects', icon: Binary },
        { id: 'aptitude', label: 'Aptitude & Reasoning', icon: BookOpen },
        { id: 'prep', label: 'Question Bank', icon: HelpCircle },
        { id: 'mock-interview', label: 'AI Mock Coach', icon: Bot, isPill: true }
      ]
    },
    {
      title: 'Placement',
      items: [
        { id: 'drives', label: 'Placement Drives', icon: Briefcase },
        { id: 'applications', label: 'My Applications', icon: FileCheck2 },
        { id: 'experiences', label: 'Peer Experiences', icon: MessageSquare },
        { id: 'workflow', label: 'Candidate Pipeline', icon: ClipboardCheck }
      ]
    },
    {
      title: 'Progress',
      items: [
        { id: 'ai-insights', label: 'Readiness Analytics', icon: Sparkles },
        { id: 'revision', label: 'Revision Workspace', icon: RotateCcw }
      ]
    }
  ];

  if (isAdmin) {
    navGroups.push({
      title: 'Administration',
      items: [
        { id: 'admin', label: 'Admin Console', icon: ShieldCheck, badge: 'Admin' }
      ]
    });
  }

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 sticky top-0 h-screen select-none z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 focus:outline-none group overflow-hidden"
          title="PlacePrep Home"
        >
          <PlacePrepLogo className="w-9 h-9 shrink-0 group-hover:scale-105 transition-transform" />
          {!isCollapsed && (
            <div className="text-left animate-in fade-in duration-200">
              <span className="font-extrabold text-base tracking-tight text-[#0F172A] block leading-none">
                Place<span className="text-[#4F46E5]">Prep</span>
              </span>
              <span className="text-[10px] text-[#64748B] font-semibold tracking-wider uppercase mt-1 block">
                Placement Suite
              </span>
            </div>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Graduation Batch Chip */}
      {!isCollapsed ? (
        <div className="p-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] font-medium flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#4F46E5]" />
              Target Batch:
            </span>
            <button
              onClick={onOpenBatchModal}
              className="font-bold text-[#4F46E5] hover:underline px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100"
            >
              Batch {batch}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-slate-100 flex justify-center">
          <button
            onClick={onOpenBatchModal}
            title={`Batch ${batch}`}
            className="p-2 rounded-lg bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentRoute === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 relative ${
                      isActive
                        ? 'bg-indigo-50 text-[#4F46E5] font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <Badge variant={item.badge === 'Admin' ? 'danger' : 'primary'} size="sm">
                        {item.badge}
                      </Badge>
                    )}
                    {!isCollapsed && item.isPill && (
                      <span className="px-1.5 py-0.2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] rounded-full font-bold">
                        AI
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#4F46E5] rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
        {user ? (
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-[#0F172A] truncate group-hover:text-indigo-600 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-[#64748B] capitalize truncate">
                    {user.role} • Batch {batch}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            {!isCollapsed ? (
              <button
                onClick={onOpenAuthModal}
                className="w-full py-2 px-3 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                title="Sign In"
                className="p-2 rounded-xl bg-[#4F46E5] text-white hover:bg-indigo-700 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
