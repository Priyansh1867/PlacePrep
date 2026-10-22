import React from 'react';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import PlacePrepLogo from '../components/PlacePrepLogo';
import instituteImage from '../assets/images/institute_hero.jpg';
import placementImage from '../assets/images/placement_hero.jpg';
import collegeBg from '../assets/images/college_campus_main.webp';
import Institute3DAnimation from '../components/animations/Institute3DAnimation';
import Placement3DAnimation from '../components/animations/Placement3DAnimation';
import UserProfileMenu from '../components/UserProfileMenu';

const portals = [
  {
    id: 'institute',
    label: 'Institute',
    eyebrow: 'ACADEMIC & STUDENT EXPERIENCE',
    title: 'Institute',
    description: 'A focused workspace for students, faculty, and HODs — academics, attendance, interview preparation, and career readiness.',
    image: instituteImage,
    icon: GraduationCap,
    points: ['Student records & registration', 'Question bank & round prep', 'CRT, class & ATS tracking'],
    action: 'Continue to Institute',
    tone: 'indigo',
    AnimationComponent: Institute3DAnimation,
  },
  {
    id: 'placement',
    label: 'Placement',
    eyebrow: 'CORPORATE HIRING & OPERATIONS',
    title: 'Placement',
    description: 'A connected command centre for TPOs, coordinators, recruiters, and directors to run every hiring touchpoint.',
    image: placementImage,
    icon: BriefcaseBusiness,
    points: ['Upcoming drives & eligibility', 'Live sessions & shortlists', 'Feedback, internships & alerts'],
    action: 'Continue to Placement',
    tone: 'emerald',
    AnimationComponent: Placement3DAnimation,
  },
];

export default function PortalGatewayPage({ onSelectPortal, onNavigateAuth }) {
  return (
    <div className="relative w-full h-screen max-h-screen overflow-hidden text-white flex flex-col justify-between select-none">
      
      {/* 1. Main College Campus Photo Background (User's Brick University Image) */}
      <img
        src={collegeBg}
        alt="University Campus"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 scale-105 pointer-events-none"
      />

      {/* Cinematic Deep Dark Gradient & Blur Overlay for Pristine Contrast */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/92 backdrop-blur-[1.5px]" />

      {/* Foreground Content Container - Exactly Fits Screen Height */}
      <div className="relative z-10 w-full h-full max-w-[1340px] mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col justify-between">
        
        {/* Header Bar with Logo and Right Upper Corner User Profile */}
        <header className="flex items-center justify-between px-1 shrink-0 py-1">
          <PlacePrepLogo className="h-8 sm:h-9 w-auto" theme="dark" />
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-sm sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              SECURE INSTITUTION ACCESS
            </span>
            <UserProfileMenu
              onNavigate={(route) => {
                if (route === 'gateway') onSelectPortal('gateway');
                else if (route === 'institute-portal') onSelectPortal('institute');
                else if (route === 'placement-portal') onSelectPortal('placement');
                else window.location.hash = `#${route}`;
              }}
              onOpenAuthModal={() => onNavigateAuth && onNavigateAuth('institute')}
              theme="dark"
            />
          </div>
        </header>

        {/* Main Hero Header */}
        <main className="flex-1 flex flex-col justify-center py-0.5 text-center my-auto">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 backdrop-blur-md px-3 py-0.5 text-[10px] font-bold tracking-[0.12em] text-indigo-200 shadow-sm mx-auto">
            <Sparkles className="h-3 w-3 text-indigo-300" />
            PLACEPREP ACCESS PORTAL
          </div>

          {/* Heading */}
          <h1 className="mx-auto mt-1 max-w-4xl text-2xl sm:text-4xl lg:text-[2.65rem] font-black tracking-[-0.045em] text-white drop-shadow-md leading-[1.08]">
            Choose your workspace.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-0.5 max-w-xl text-xs sm:text-sm leading-snug text-slate-200 font-medium drop-shadow-sm mb-2.5 sm:mb-3">
            Start with the area you belong to. Your role-specific sign in and only the relevant tools will follow.
          </p>

          {/* 2 Portal Cards: Institute vs Placement */}
          <div className="mx-auto grid max-w-4xl gap-4 text-left lg:grid-cols-2 lg:gap-5 w-full">
            {portals.map((portal) => {
              const Icon = portal.icon;
              const Animation = portal.AnimationComponent;
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => {
                    if (onSelectPortal) {
                      onSelectPortal(portal.id);
                    } else if (onNavigateAuth) {
                      onNavigateAuth(portal.id);
                    }
                  }}
                  className={`gateway-portal-card gateway-portal-card--${portal.tone} group text-left w-full cursor-pointer`}
                >
                  <img src={portal.image} alt="" className="gateway-portal-card__image" />
                  <span className="gateway-portal-card__overlay" />
                  
                  <span className="gateway-portal-card__content">
                    {/* Top Row: Icon and Tag */}
                    <div className="flex items-center justify-between w-full">
                      <span className="gateway-portal-card__icon">
                        <Icon className="h-4 w-4 text-white" />
                      </span>
                      <span className="gateway-portal-card__eyebrow">
                        {portal.eyebrow}
                      </span>
                    </div>

                    {/* Title: Institute / Placement */}
                    <span className="gateway-portal-card__title">
                      {portal.title}
                    </span>

                    {/* Description */}
                    <span className="gateway-portal-card__description">
                      {portal.description}
                    </span>

                    {/* 3D Animated Visual tailored to each card */}
                    <Animation />

                    {/* Feature points */}
                    <span className="gateway-portal-card__list">
                      {portal.points.map((point) => (
                        <span key={point}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          {point}
                        </span>
                      ))}
                    </span>

                    {/* Action Button */}
                    <span className="gateway-portal-card__action">
                      {portal.action}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </main>

        {/* Footer note */}
        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-medium text-slate-300/80 py-1 shrink-0">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          Role-based access is applied after authentication.
        </p>

      </div>
    </div>
  );
}
