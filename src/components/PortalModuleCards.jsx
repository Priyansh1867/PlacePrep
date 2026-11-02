import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

// Crystal-clear high-resolution 3D isometric diorama illustrations
import artDrives from '../assets/images/module-illustrations/drives-v1.png';
import artReports from '../assets/images/module-illustrations/reports-exporter-v1.png';
import artEligibility from '../assets/images/module-illustrations/eligibility-criteria-v1.png';
import artLive from '../assets/images/module-illustrations/live-sessions-v1.png';
import artShortlisted from '../assets/images/module-illustrations/shortlisted-v1.png';
import artInternships from '../assets/images/module-illustrations/internships-v1.png';
import artFeedback from '../assets/images/module-illustrations/feedback-loop-v1.png';
import artOffCampus from '../assets/images/module-illustrations/off-campus-v1.png';
import artNotifications from '../assets/images/module-illustrations/push-notifications-v1.png';
import artQuestionBank from '../assets/images/module-illustrations/question-bank-v1.png';
import artDsa from '../assets/images/module-illustrations/dsa-studio-v1.png';
import artCrt from '../assets/images/module-illustrations/crt-attendance-v1.png';
import artClassAttendance from '../assets/images/module-illustrations/class-attendance-v1.png';
import artResumeAts from '../assets/images/module-illustrations/resume-ats-v1.png';
import artStudentData from '../assets/images/module-illustrations/student-data-v1.png';
import artCurriculum from '../assets/images/module-illustrations/curriculum-governance-v1.png';
import artRoundDetails from '../assets/images/module-illustrations/round-details-v1.png';
import artHackathons from '../assets/images/module-illustrations/hackathons-v1.png';
import artFaculty from '../assets/images/module-illustrations/faculty-monitoring-v1.png';

const CARD_IMAGE_MAP = {
  // Placement Portal mappings
  'drives': artDrives,
  'reports-exporter': artReports,
  'eligibility-criteria': artEligibility,
  'live-sessions': artLive,
  'shortlisted': artShortlisted,
  'internships': artInternships,
  'feedback-loop': artFeedback,
  'off-campus': artOffCampus,
  'push-notifications': artNotifications,

  // Institute Portal mappings
  'student-data': artStudentData,
  'curriculum-governance': artCurriculum,
  'faculty-monitoring': artFaculty,
  'upcoming-drives': artDrives,
  'question-bank': artQuestionBank,
  'dsa-studio': artDsa,
  'crt-attendance': artCrt,
  'mock-interview': artLive,
  'class-attendance': artClassAttendance,
  'resume-ats': artResumeAts,
  'round-details': artRoundDetails,
  'hackathons': artHackathons,

  // Management Portal mappings
  'overview': artReports,
  'master-timetable': artDrives,
  'institute-profile': artStudentData,
  'manage-location': artDrives,
  'geofence': artEligibility,
  'attendance-overview': artCrt,
  'attendance-sessions': artClassAttendance,
  'location-history': artReports,

  // Selection Workflow mappings
  'pipeline': artShortlisted,
  'engine': artEligibility,
  'evaluations': artReports,
  'feedback': artFeedback,
  'questions': artQuestionBank
};

export default function PortalModuleCards({ items, activeId, onSelect }) {
  const handleClick = (itemId) => {
    if (onSelect) {
      onSelect(itemId);
    }
  };

  return (
    <section className="portal-module-section w-full">
      <div className="mb-4">
        <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-orange-600">Workspace Shortcuts</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Your most relevant actions, each with a distinct visual status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          const cardImg = item.image || CARD_IMAGE_MAP[item.id] || artDrives;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              className={`group relative text-left w-full h-52 sm:h-56 rounded-3xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none cursor-pointer shadow-sm hover:shadow-xl bg-white ${
                isActive
                  ? 'ring-2 ring-orange-500 border-orange-500 shadow-lg shadow-orange-500/15'
                  : 'border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/10'
              }`}
            >
              {/* High-Contrast Full-Clarity 3D Isometric Art (No heavy wash/veil) */}
              <img
                src={cardImg}
                alt={item.label}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 opacity-95 group-hover:opacity-100"
              />

              {/* Localized Bottom Gradient Floor (leaves top 65% of 3D diorama crystal clear) */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none transition-opacity duration-300" />
              
              {/* Soft Ambient Warm Orange Glow on Hover (Bottom-Right) */}
              <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-gradient-to-br from-orange-400/20 via-amber-300/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Active Subtle Orange Accent Border */}
              {isActive && (
                <div className="absolute inset-0 border-2 border-orange-500/40 rounded-3xl pointer-events-none" />
              )}

              {/* Content Container (Razor-Sharp High-Contrast Typography & Subtle Orange Hover Accents) */}
              <div className="relative z-10 h-full p-5 flex flex-col justify-between text-slate-900">
                {/* Top Row: Icon Box and Status Pill */}
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xs backdrop-blur-md ${
                    isActive
                      ? 'bg-orange-500 text-white border border-orange-500 shadow-md shadow-orange-500/25'
                      : 'bg-white/95 text-slate-700 border border-slate-200/80 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 group-hover:shadow-md group-hover:shadow-orange-500/25'
                  }`}>
                    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-slate-950 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                        <span>Active</span>
                      </span>
                    )}
                    {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide backdrop-blur-md border transition-colors duration-200 ${
                        String(item.badge).includes('Restricted') || String(item.badge).includes('❌')
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-white/95 text-slate-700 border-slate-200/80 shadow-2xs group-hover:border-orange-200 group-hover:text-orange-950'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Title, Description & Arrow Button */}
                <div>
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-900 transition-colors duration-200 truncate group-hover:text-orange-600">
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-semibold">
                        {item.description || (item.badge ? `Status: ${item.badge}` : 'Click to jump to section')}
                      </p>
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 shadow-2xs backdrop-blur-md ${
                      isActive
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-110'
                        : 'bg-white/90 text-slate-600 border-slate-200/80 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                    }`}>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
