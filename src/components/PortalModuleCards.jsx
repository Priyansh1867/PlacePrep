import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import cardDrives from '../assets/images/card_drives.jpg';
import cardReports from '../assets/images/card_reports.jpg';
import cardEligibility from '../assets/images/card_eligibility.jpg';
import cardLive from '../assets/images/card_live.jpg';
import cardShortlists from '../assets/images/card_shortlists.jpg';
import cardInternships from '../assets/images/card_internships.jpg';
import cardFeedback from '../assets/images/card_feedback.jpg';
import cardOffcampus from '../assets/images/card_offcampus.jpg';
import cardNotifications from '../assets/images/card_notifications.jpg';
import cardDsa from '../assets/images/card_dsa.jpg';
import cardQuestionBank from '../assets/images/card_questionbank.jpg';
import cardCrt from '../assets/images/card_crt.jpg';

const CARD_IMAGE_MAP = {
  // Placement Portal mappings (Dark, highly-professional 3D images)
  'drives': cardDrives,
  'reports-exporter': cardReports,
  'eligibility-criteria': cardEligibility,
  'live-sessions': cardLive,
  'shortlisted': cardShortlists,
  'internships': cardInternships,
  'feedback-loop': cardFeedback,
  'off-campus': cardOffcampus,
  'push-notifications': cardNotifications,
  'faculty-monitoring': cardReports,

  // Institute Portal mappings (Dark, highly-professional 3D images)
  'student-data': cardShortlists,
  'curriculum-governance': cardReports,
  'upcoming-drives': cardDrives,
  'question-bank': cardQuestionBank || cardEligibility,
  'dsa-studio': cardDsa || cardDrives,
  'crt-attendance': cardCrt || cardFeedback,
  'class-attendance': cardLive,
  'resume-ats': cardInternships,
  'round-details': cardShortlists,
  'hackathons': cardDsa || cardEligibility
};

// Unified Light Orange Theme Palette across all cards for seamless cohesion
const LIGHT_ORANGE_THEME = {
  accent: 'orange',
  cardHoverBg: 'hover:bg-orange-500/5',
  activeRing: 'ring-2 ring-orange-500 border-orange-500 shadow-xl shadow-orange-500/25',
  borderHover: 'hover:border-orange-400/70',
  iconBox: 'bg-orange-500/15 text-orange-400 border border-orange-400/30 group-hover:bg-orange-500 group-hover:text-slate-950 group-hover:border-orange-400 group-hover:shadow-md group-hover:shadow-orange-500/30',
  iconActive: 'bg-orange-500 text-slate-950 border-orange-300 shadow-md shadow-orange-500/30',
  titleHover: 'group-hover:text-orange-300',
  arrowBtn: 'bg-white/10 text-orange-400 border border-orange-400/30 group-hover:bg-orange-500 group-hover:text-slate-950 group-hover:border-orange-400',
  arrowActive: 'bg-orange-500 text-slate-950 border-orange-300 shadow-md shadow-orange-500/30',
  badgeTone: 'border-orange-400/30 text-orange-300 bg-orange-500/15 shadow-2xs',
  glowGradient: 'from-orange-500/25 via-amber-400/10 to-transparent'
};

export default function PortalModuleCards({ items, activeId, onSelect }) {
  const handleClick = (itemId) => {
    if (onSelect) {
      onSelect(itemId);
    }
  };

  const theme = LIGHT_ORANGE_THEME;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        const cardImg = item.image || CARD_IMAGE_MAP[item.id] || cardDrives;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            className={`group relative text-left w-full h-52 sm:h-56 rounded-3xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none cursor-pointer shadow-lg hover:shadow-2xl bg-[#090D1A] ${
              isActive
                ? `${theme.activeRing}`
                : `border-white/10 ${theme.borderHover} ${theme.cardHoverBg}`
            }`}
          >
            {/* Background 3D Graphic (Dark, High-Contrast Presentation) */}
            <img
              src={cardImg}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-100"
            />

            {/* Deep Obsidian Gradient Floor for Razor-Sharp Bottom Typography Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B18] via-[#070B18]/70 to-transparent transition-opacity duration-300" />
            
            {/* Soft Ambient Light Orange Glow from Bottom Right */}
            <div className={`absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-gradient-to-br ${theme.glowGradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            {/* Active Subtle Orange Accent Border */}
            {isActive && (
              <div className="absolute inset-0 border-2 border-orange-500/40 rounded-3xl pointer-events-none" />
            )}

            {/* Content Container (Razor-Sharp High-Contrast Typography & Light Orange Accents) */}
            <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
              {/* Top Row: Icon Box and Status Pill */}
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs ${
                  isActive
                    ? theme.iconActive
                    : theme.iconBox
                }`}>
                  <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </div>

                <div className="flex items-center gap-2">
                  {isActive && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-slate-950 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                      <span>Active</span>
                    </span>
                  )}
                  {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide backdrop-blur-md border ${
                      String(item.badge).includes('Restricted') || String(item.badge).includes('❌')
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                        : theme.badgeTone
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
                    <h4 className={`text-base sm:text-lg font-black tracking-tight text-white transition-colors duration-200 truncate ${theme.titleHover}`}>
                      {item.label}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-medium drop-shadow-xs">
                      {item.description || (item.badge ? `Status: ${item.badge}` : 'Click to jump to section')}
                    </p>
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-md transition-all duration-300 shadow-xs ${
                    isActive
                      ? `${theme.arrowActive} scale-110`
                      : `${theme.arrowBtn} group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`
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
  );
}
