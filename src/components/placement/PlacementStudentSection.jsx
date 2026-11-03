import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  LayoutDashboard,
  UserCheck,
  FileCheck2,
  Lock
} from 'lucide-react';
import PlacementSevenStepWizard from './PlacementSevenStepWizard';
import PlacementStudentProfileView from './PlacementStudentProfileView';
import { PlacementProfileApi } from '../../services/api';
import {
  getCurrentUser,
  getPlacementStudentProfile,
  savePlacementStudentProfile,
  isPlacementProfileCompleted
} from '../../services/storage';

export default function PlacementStudentSection({ onNavigate }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(() => getPlacementStudentProfile(getCurrentUser()));
  const [showWizard, setShowWizard] = useState(() => !isPlacementProfileCompleted(getCurrentUser()));
  const [completionSuccessModal, setCompletionSuccessModal] = useState(false);

  const rawRole = (currentUser?.role || '').toLowerCase();
  const isEligibleStudent = rawRole === 'student';

  // Load placement profile dynamically from backend with instant storage fallback
  const loadProfile = async () => {
    setLoading(true);
    const user = getCurrentUser();
    setCurrentUser(user);

    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Get initial local record
    const local = getPlacementStudentProfile(user);
    setProfile(local);

    // 2. Query Spring Boot backend dynamically
    if (user.email) {
      try {
        const remote = await PlacementProfileApi.getProfile(user.email, user.id);
        if (remote && remote.email) {
          // Parse and merge remote with local
          let merged = { ...local };
          if (remote.fullDataJson) {
            try {
              const parsed = JSON.parse(remote.fullDataJson);
              merged = { ...merged, ...parsed };
            } catch {}
          }
          if (remote.isCompleted !== undefined) {
            merged.isCompleted = Boolean(remote.isCompleted);
          }
          if (remote.currentStep !== undefined) {
            merged.currentStep = remote.currentStep;
          }
          if (merged.isCompleted) {
            setShowWizard(false);
          } else {
            setShowWizard(true);
          }
          setProfile(merged);
          savePlacementStudentProfile(merged, user);
        }
      } catch (err) {
        console.warn('Backend dynamic sync note:', err);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfile();

    const handleProfileSync = () => {
      const active = getCurrentUser();
      setCurrentUser(active);
      const updated = getPlacementStudentProfile(active);
      setProfile(updated);
    };

    window.addEventListener('placement-profile-updated', handleProfileSync);
    window.addEventListener('profile-updated', handleProfileSync);
    window.addEventListener('user-changed', handleProfileSync);

    return () => {
      window.removeEventListener('placement-profile-updated', handleProfileSync);
      window.removeEventListener('profile-updated', handleProfileSync);
      window.removeEventListener('user-changed', handleProfileSync);
    };
  }, []);

  // Check if profile is completed
  const isCompleted = Boolean(profile?.isCompleted);

  // Handle wizard completion
  const handleWizardComplete = (submittedData) => {
    setProfile(submittedData);
    setShowWizard(false);
    setCompletionSuccessModal(true);
  };

  if (!isEligibleStudent) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm max-w-2xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Placement Student Section Restricted</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The 7-step Placement Profile Registration and Student Profile section is specifically reserved for authenticated student accounts. Logged-in role: <strong>{currentUser?.role || 'Guest'}</strong>.
        </p>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('gateway')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
        >
          Return to Portal Gateway
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Incomplete Prompt Banner - displayed only if profile is not completed */}
      {!isCompleted && !showWizard && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300 text-amber-950 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-amber-950">
                  Placement Profile Incomplete (Action Required)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                  Step {profile?.currentStep || 1} of 7 Pending
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 max-w-2xl leading-relaxed">
                To participate in upcoming campus placement drives and corporate interviews for Placement Season 2026-2027, you must complete your verified 7-step Placement Profile registration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{profile?.currentStep && profile.currentStep > 1 ? `Resume Registration (Step ${profile.currentStep})` : 'Start 7-Step Registration'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Completion Alert Banner - when profile is completed */}
      {isCompleted && !showWizard && (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm text-emerald-950">
                  Placement Profile Verified & Synchronized
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase">
                  Season 2026-2027 Enrolled
                </span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">
                All 7 registration sections are submitted and synchronized with the university placement database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Go to Student Dashboard</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN VIEW: Either 7-Step Wizard OR Comprehensive Student Profile View */}
      {showWizard ? (
        <PlacementSevenStepWizard
          initialProfile={profile}
          currentUser={currentUser}
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      ) : (
        <PlacementStudentProfileView
          profile={profile}
          currentUser={currentUser}
          onReopenWizard={() => setShowWizard(true)}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}

      {/* Post-Registration Success Modal */}
      {completionSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-2">
                Placement Registration Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900">
                You are Enrolled for 2026-2027 Placements!
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                All submitted academic, contact, experience, and document details have been saved to the database. You are now eligible to apply for on-campus corporate recruitment drives.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCompletionSuccessModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>View My Student Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCompletionSuccessModal(false);
                  window.dispatchEvent(new CustomEvent('switch-portal-tab', { detail: 'drives' }));
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Go to Placement Portal & Upcoming Drives</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
