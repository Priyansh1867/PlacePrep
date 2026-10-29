import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import cardDrivesOrange from '../assets/images/card_drives_orange.jpg';
import cardReportsOrange from '../assets/images/card_reports_orange.jpg';
import cardEligibilityOrange from '../assets/images/card_eligibility_orange.jpg';
import cardLiveOrange from '../assets/images/card_live_orange.jpg';
import cardShortlistsOrange from '../assets/images/card_shortlists_orange.jpg';
import cardInternshipsOrange from '../assets/images/card_internships_orange.jpg';
import cardFeedbackOrange from '../assets/images/card_feedback_orange.jpg';
import cardOffcampusOrange from '../assets/images/card_offcampus_orange.jpg';
import cardNotificationsOrange from '../assets/images/card_notifications_orange.jpg';
import cardDsaOrange from '../assets/images/card_dsa_orange.jpg';
import cardQuestionBankOrange from '../assets/images/card_questionbank_orange.jpg';
import cardCrtOrange from '../assets/images/card_crt_orange.jpg';

const CARD_IMAGE_MAP = {
  // Placement Portal mappings (Light Orange Matched 3D Dioramas)
  'drives': cardDrivesOrange,
  'reports-exporter': cardReportsOrange,
  'eligibility-criteria': cardEligibilityOrange,
  'live-sessions': cardLiveOrange,
  'shortlisted': cardShortlistsOrange,
  'internships': cardInternshipsOrange,
  'feedback-loop': cardFeedbackOrange,
  'off-campus': cardOffcampusOrange,
  'push-notifications': cardNotificationsOrange,
  'faculty-monitoring': cardReportsOrange,

  // Institute Portal mappings (Light Orange Matched 3D Dioramas)
  'student-data': cardEligibilityOrange,
  'curriculum-governance': cardReportsOrange,
  'upcoming-drives': cardDrivesOrange,
  'question-bank': cardQuestionBankOrange,
  'dsa-studio': cardDsaOrange,
  'crt-attendance': cardCrtOrange,
  'class-attendance': cardLiveOrange,
  'resume-ats': cardReportsOrange,
  'round-details': cardShortlistsOrange,
  'hackathons': cardDsaOrange
};

// Unified Light Orange Theme Palette matching both cards and 3D illustrations
const LIGHT_ORANGE_THEME = {
  accent: 'orange',
  cardHoverBg: 'hover:bg-orange-50/25',
  activeRing: 'ring-2 ring-orange-500 border-orange-500 shadow-lg shadow-orange-500/15',
  borderHover: 'hover:border-orange-300',
  iconBox: 'bg-orange-50 text-orange-600 border border-orange-200/80 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500',
  iconActive: 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25',
  titleHover: 'group-hover:text-orange-600',
  arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500',
  arrowActive: 'bg-orange-500 text-white shadow-md shadow-orange-500/20',
  badgeTone: 'border-orange-200 text-orange-800 bg-orange-50/95 shadow-2xs font-bold',
  glowGradient: 'from-orange-400/20 via-amber-300/10 to-transparent'
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
        const cardImg = item.image || CARD_IMAGE_MAP[item.id] || cardDrivesOrange;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            className={`group relative text-left w-full h-52 sm:h-56 rounded-3xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none cursor-pointer shadow-sm hover:shadow-xl bg-white ${
              isActive
                ? `${theme.activeRing}`
                : `border-slate-200/90 ${theme.borderHover} ${theme.cardHoverBg}`
            }`}
          >
            {/* Background 3D Graphic (Light Orange Matched, Crisp & Balanced) */}
            <img
              src={cardImg}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />

            {/* Subtle Gradient Floor for Peak Bottom Typography Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/45 to-transparent transition-opacity duration-300" />
            
            {/* Soft Ambient Light Orange Glow from Bottom Right */}
            <div className={`absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-gradient-to-br ${theme.glowGradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            {/* Active Subtle Orange Accent Border */}
            {isActive && (
              <div className="absolute inset-0 border-2 border-orange-500/30 rounded-3xl pointer-events-none" />
            )}

            {/* Content Container (Razor-Sharp High-Contrast Typography & Light Orange Accents) */}
            <div className="relative z-10 h-full p-5 flex flex-col justify-between text-slate-900">
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
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-slate-950 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                      <span>Active</span>
                    </span>
                  )}
                  {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide backdrop-blur-md border ${
                      String(item.badge).includes('Restricted') || String(item.badge).includes('❌')
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
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
                    <h4 className={`text-base sm:text-lg font-black tracking-tight text-slate-900 transition-colors duration-200 truncate ${theme.titleHover}`}>
                      {item.label}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-semibold">
                      {item.description || (item.badge ? `Status: ${item.badge}` : 'Click to jump to section')}
                    </p>
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-slate-200/80 transition-all duration-300 shadow-xs ${
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
