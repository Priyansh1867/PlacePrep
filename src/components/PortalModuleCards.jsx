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

const CARD_IMAGE_MAP = {
  // Placement Portal mappings
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

  // Institute Portal mappings
  'student-data': cardShortlists,
  'curriculum-governance': cardReports,
  'upcoming-drives': cardDrives,
  'question-bank': cardEligibility,
  'crt-attendance': cardFeedback,
  'class-attendance': cardLive,
  'resume-ats': cardInternships,
  'round-details': cardNotifications,
  'hackathons': cardEligibility
};

// Triad Palette system: Deep obsidian dark + Crisp white frost + Distinct Vibrant 3rd Accents
const MODULE_THEMES = {
  // 1. Upcoming Drives (Mint Emerald - Career Growth)
  'drives': {
    accent: 'emerald',
    textAccent: 'text-emerald-300',
    titleHover: 'group-hover:text-emerald-300',
    activeRing: 'ring-2 ring-emerald-400 border-emerald-400 shadow-xl shadow-emerald-950/40',
    borderHover: 'hover:border-emerald-400/80',
    iconActive: 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/30',
    iconHover: 'group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-emerald-300',
    arrowActive: 'bg-emerald-400 text-slate-950',
    arrowHover: 'group-hover:bg-emerald-400 group-hover:text-slate-950',
    glowGradient: 'from-emerald-500/25 via-teal-500/10 to-transparent',
    badgeTone: 'border-emerald-400/40 text-emerald-200 bg-emerald-950/60'
  },
  // 2. Reports Exporter (Tech Cyan - Institutional Audit)
  'reports-exporter': {
    accent: 'cyan',
    textAccent: 'text-cyan-300',
    titleHover: 'group-hover:text-cyan-300',
    activeRing: 'ring-2 ring-cyan-400 border-cyan-400 shadow-xl shadow-cyan-950/40',
    borderHover: 'hover:border-cyan-400/80',
    iconActive: 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/30',
    iconHover: 'group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-300',
    arrowActive: 'bg-cyan-400 text-slate-950',
    arrowHover: 'group-hover:bg-cyan-400 group-hover:text-slate-950',
    glowGradient: 'from-cyan-500/25 via-sky-500/10 to-transparent',
    badgeTone: 'border-cyan-400/40 text-cyan-200 bg-cyan-950/60'
  },
  // 3. Eligibility Check (Electric Indigo - Academic Verification)
  'eligibility-criteria': {
    accent: 'indigo',
    textAccent: 'text-indigo-300',
    titleHover: 'group-hover:text-indigo-300',
    activeRing: 'ring-2 ring-indigo-400 border-indigo-400 shadow-xl shadow-indigo-950/40',
    borderHover: 'hover:border-indigo-400/80',
    iconActive: 'bg-indigo-600 text-white border-indigo-300 shadow-lg shadow-indigo-500/30',
    iconHover: 'group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-300',
    arrowActive: 'bg-indigo-500 text-white',
    arrowHover: 'group-hover:bg-indigo-500 group-hover:text-white',
    glowGradient: 'from-indigo-500/25 via-blue-500/10 to-transparent',
    badgeTone: 'border-indigo-400/40 text-indigo-200 bg-indigo-950/60'
  },
  // 4. Live Sessions (Neon Violet - Interactive Media)
  'live-sessions': {
    accent: 'violet',
    textAccent: 'text-violet-300',
    titleHover: 'group-hover:text-violet-300',
    activeRing: 'ring-2 ring-violet-400 border-violet-400 shadow-xl shadow-violet-950/40',
    borderHover: 'hover:border-violet-400/80',
    iconActive: 'bg-violet-600 text-white border-violet-300 shadow-lg shadow-violet-500/30',
    iconHover: 'group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-300',
    arrowActive: 'bg-violet-500 text-white',
    arrowHover: 'group-hover:bg-violet-500 group-hover:text-white',
    glowGradient: 'from-violet-500/25 via-purple-500/10 to-transparent',
    badgeTone: 'border-violet-400/40 text-violet-200 bg-violet-950/60'
  },
  // 5. Shortlist Status (Radiant Amber Gold - Achievement & Funnel)
  'shortlisted': {
    accent: 'amber',
    textAccent: 'text-amber-300',
    titleHover: 'group-hover:text-amber-300',
    activeRing: 'ring-2 ring-amber-400 border-amber-400 shadow-xl shadow-amber-950/40',
    borderHover: 'hover:border-amber-400/80',
    iconActive: 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30',
    iconHover: 'group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-300',
    arrowActive: 'bg-amber-400 text-slate-950',
    arrowHover: 'group-hover:bg-amber-400 group-hover:text-slate-950',
    glowGradient: 'from-amber-500/25 via-yellow-500/10 to-transparent',
    badgeTone: 'border-amber-400/40 text-amber-200 bg-amber-950/60'
  },
  // 6. Internship Details (Luminous Teal - Early Career)
  'internships': {
    accent: 'teal',
    textAccent: 'text-teal-300',
    titleHover: 'group-hover:text-teal-300',
    activeRing: 'ring-2 ring-teal-400 border-teal-400 shadow-xl shadow-teal-950/40',
    borderHover: 'hover:border-teal-400/80',
    iconActive: 'bg-teal-500 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/30',
    iconHover: 'group-hover:bg-teal-500 group-hover:text-slate-950 group-hover:border-teal-300',
    arrowActive: 'bg-teal-400 text-slate-950',
    arrowHover: 'group-hover:bg-teal-400 group-hover:text-slate-950',
    glowGradient: 'from-teal-500/25 via-emerald-500/10 to-transparent',
    badgeTone: 'border-teal-400/40 text-teal-200 bg-teal-950/60'
  },
  // 7. Feedback TPO (Coral Rose - Quality & Communication)
  'feedback-loop': {
    accent: 'rose',
    textAccent: 'text-rose-300',
    titleHover: 'group-hover:text-rose-300',
    activeRing: 'ring-2 ring-rose-400 border-rose-400 shadow-xl shadow-rose-950/40',
    borderHover: 'hover:border-rose-400/80',
    iconActive: 'bg-rose-500 text-white border-rose-300 shadow-lg shadow-rose-500/30',
    iconHover: 'group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-300',
    arrowActive: 'bg-rose-400 text-white',
    arrowHover: 'group-hover:bg-rose-400 group-hover:text-white',
    glowGradient: 'from-rose-500/25 via-pink-500/10 to-transparent',
    badgeTone: 'border-rose-400/40 text-rose-200 bg-rose-950/60'
  },
  // 8. Off-Campus (Sky Blue - Global External Careers)
  'off-campus': {
    accent: 'sky',
    textAccent: 'text-sky-300',
    titleHover: 'group-hover:text-sky-300',
    activeRing: 'ring-2 ring-sky-400 border-sky-400 shadow-xl shadow-sky-950/40',
    borderHover: 'hover:border-sky-400/80',
    iconActive: 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg shadow-sky-500/30',
    iconHover: 'group-hover:bg-sky-500 group-hover:text-slate-950 group-hover:border-sky-300',
    arrowActive: 'bg-sky-400 text-slate-950',
    arrowHover: 'group-hover:bg-sky-400 group-hover:text-slate-950',
    glowGradient: 'from-sky-500/25 via-cyan-500/10 to-transparent',
    badgeTone: 'border-sky-400/40 text-sky-200 bg-sky-950/60'
  },
  // 9. Push Notifications (Sunset Orange - Alerts)
  'push-notifications': {
    accent: 'orange',
    textAccent: 'text-orange-300',
    titleHover: 'group-hover:text-orange-300',
    activeRing: 'ring-2 ring-orange-400 border-orange-400 shadow-xl shadow-orange-950/40',
    borderHover: 'hover:border-orange-400/80',
    iconActive: 'bg-orange-500 text-slate-950 border-orange-300 shadow-lg shadow-orange-500/30',
    iconHover: 'group-hover:bg-orange-500 group-hover:text-slate-950 group-hover:border-orange-300',
    arrowActive: 'bg-orange-400 text-slate-950',
    arrowHover: 'group-hover:bg-orange-400 group-hover:text-slate-950',
    glowGradient: 'from-orange-500/25 via-amber-500/10 to-transparent',
    badgeTone: 'border-orange-400/40 text-orange-200 bg-orange-950/60'
  },

  // Institute Portal Module Mappings
  'student-data': {
    accent: 'indigo',
    textAccent: 'text-indigo-300',
    titleHover: 'group-hover:text-indigo-300',
    activeRing: 'ring-2 ring-indigo-400 border-indigo-400 shadow-xl shadow-indigo-950/40',
    borderHover: 'hover:border-indigo-400/80',
    iconActive: 'bg-indigo-600 text-white border-indigo-300 shadow-lg shadow-indigo-500/30',
    iconHover: 'group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-300',
    arrowActive: 'bg-indigo-500 text-white',
    arrowHover: 'group-hover:bg-indigo-500 group-hover:text-white',
    glowGradient: 'from-indigo-500/25 via-blue-500/10 to-transparent',
    badgeTone: 'border-indigo-400/40 text-indigo-200 bg-indigo-950/60'
  },
  'curriculum-governance': {
    accent: 'violet',
    textAccent: 'text-violet-300',
    titleHover: 'group-hover:text-violet-300',
    activeRing: 'ring-2 ring-violet-400 border-violet-400 shadow-xl shadow-violet-950/40',
    borderHover: 'hover:border-violet-400/80',
    iconActive: 'bg-violet-600 text-white border-violet-300 shadow-lg shadow-violet-500/30',
    iconHover: 'group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-300',
    arrowActive: 'bg-violet-500 text-white',
    arrowHover: 'group-hover:bg-violet-500 group-hover:text-white',
    glowGradient: 'from-violet-500/25 via-purple-500/10 to-transparent',
    badgeTone: 'border-violet-400/40 text-violet-200 bg-violet-950/60'
  },
  'upcoming-drives': {
    accent: 'emerald',
    textAccent: 'text-emerald-300',
    titleHover: 'group-hover:text-emerald-300',
    activeRing: 'ring-2 ring-emerald-400 border-emerald-400 shadow-xl shadow-emerald-950/40',
    borderHover: 'hover:border-emerald-400/80',
    iconActive: 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/30',
    iconHover: 'group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-emerald-300',
    arrowActive: 'bg-emerald-400 text-slate-950',
    arrowHover: 'group-hover:bg-emerald-400 group-hover:text-slate-950',
    glowGradient: 'from-emerald-500/25 via-teal-500/10 to-transparent',
    badgeTone: 'border-emerald-400/40 text-emerald-200 bg-emerald-950/60'
  },
  'question-bank': {
    accent: 'cyan',
    textAccent: 'text-cyan-300',
    titleHover: 'group-hover:text-cyan-300',
    activeRing: 'ring-2 ring-cyan-400 border-cyan-400 shadow-xl shadow-cyan-950/40',
    borderHover: 'hover:border-cyan-400/80',
    iconActive: 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/30',
    iconHover: 'group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-300',
    arrowActive: 'bg-cyan-400 text-slate-950',
    arrowHover: 'group-hover:bg-cyan-400 group-hover:text-slate-950',
    glowGradient: 'from-cyan-500/25 via-sky-500/10 to-transparent',
    badgeTone: 'border-cyan-400/40 text-cyan-200 bg-cyan-950/60'
  },
  'crt-attendance': {
    accent: 'amber',
    textAccent: 'text-amber-300',
    titleHover: 'group-hover:text-amber-300',
    activeRing: 'ring-2 ring-amber-400 border-amber-400 shadow-xl shadow-amber-950/40',
    borderHover: 'hover:border-amber-400/80',
    iconActive: 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30',
    iconHover: 'group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-300',
    arrowActive: 'bg-amber-400 text-slate-950',
    arrowHover: 'group-hover:bg-amber-400 group-hover:text-slate-950',
    glowGradient: 'from-amber-500/25 via-orange-500/10 to-transparent',
    badgeTone: 'border-amber-400/40 text-amber-200 bg-amber-950/60'
  },
  'class-attendance': {
    accent: 'teal',
    textAccent: 'text-teal-300',
    titleHover: 'group-hover:text-teal-300',
    activeRing: 'ring-2 ring-teal-400 border-teal-400 shadow-xl shadow-teal-950/40',
    borderHover: 'hover:border-teal-400/80',
    iconActive: 'bg-teal-500 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/30',
    iconHover: 'group-hover:bg-teal-500 group-hover:text-slate-950 group-hover:border-teal-300',
    arrowActive: 'bg-teal-400 text-slate-950',
    arrowHover: 'group-hover:bg-teal-400 group-hover:text-slate-950',
    glowGradient: 'from-teal-500/25 via-emerald-500/10 to-transparent',
    badgeTone: 'border-teal-400/40 text-teal-200 bg-teal-950/60'
  },
  'resume-ats': {
    accent: 'rose',
    textAccent: 'text-rose-300',
    titleHover: 'group-hover:text-rose-300',
    activeRing: 'ring-2 ring-rose-400 border-rose-400 shadow-xl shadow-rose-950/40',
    borderHover: 'hover:border-rose-400/80',
    iconActive: 'bg-rose-500 text-white border-rose-300 shadow-lg shadow-rose-500/30',
    iconHover: 'group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-300',
    arrowActive: 'bg-rose-400 text-white',
    arrowHover: 'group-hover:bg-rose-400 group-hover:text-white',
    glowGradient: 'from-rose-500/25 via-pink-500/10 to-transparent',
    badgeTone: 'border-rose-400/40 text-rose-200 bg-rose-950/60'
  },
  'round-details': {
    accent: 'orange',
    textAccent: 'text-orange-300',
    titleHover: 'group-hover:text-orange-300',
    activeRing: 'ring-2 ring-orange-400 border-orange-400 shadow-xl shadow-orange-950/40',
    borderHover: 'hover:border-orange-400/80',
    iconActive: 'bg-orange-500 text-slate-950 border-orange-300 shadow-lg shadow-orange-500/30',
    iconHover: 'group-hover:bg-orange-500 group-hover:text-slate-950 group-hover:border-orange-300',
    arrowActive: 'bg-orange-400 text-slate-950',
    arrowHover: 'group-hover:bg-orange-400 group-hover:text-slate-950',
    glowGradient: 'from-orange-500/25 via-amber-500/10 to-transparent',
    badgeTone: 'border-orange-400/40 text-orange-200 bg-orange-950/60'
  },
  'hackathons': {
    accent: 'purple',
    textAccent: 'text-purple-300',
    titleHover: 'group-hover:text-purple-300',
    activeRing: 'ring-2 ring-purple-400 border-purple-400 shadow-xl shadow-purple-950/40',
    borderHover: 'hover:border-purple-400/80',
    iconActive: 'bg-purple-600 text-white border-purple-300 shadow-lg shadow-purple-500/30',
    iconHover: 'group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-300',
    arrowActive: 'bg-purple-500 text-white',
    arrowHover: 'group-hover:bg-purple-500 group-hover:text-white',
    glowGradient: 'from-purple-500/25 via-indigo-500/10 to-transparent',
    badgeTone: 'border-purple-400/40 text-purple-200 bg-purple-950/60'
  },
  'faculty-monitoring': {
    accent: 'sky',
    textAccent: 'text-sky-300',
    titleHover: 'group-hover:text-sky-300',
    activeRing: 'ring-2 ring-sky-400 border-sky-400 shadow-xl shadow-sky-950/40',
    borderHover: 'hover:border-sky-400/80',
    iconActive: 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg shadow-sky-500/30',
    iconHover: 'group-hover:bg-sky-500 group-hover:text-slate-950 group-hover:border-sky-300',
    arrowActive: 'bg-sky-400 text-slate-950',
    arrowHover: 'group-hover:bg-sky-400 group-hover:text-slate-950',
    glowGradient: 'from-sky-500/25 via-cyan-500/10 to-transparent',
    badgeTone: 'border-sky-400/40 text-sky-200 bg-sky-950/60'
  }
};

export default function PortalModuleCards({ items, activeId, onSelect, tone = 'emerald' }) {
  const handleClick = (itemId) => {
    if (onSelect) {
      onSelect(itemId);
    }
  };

  const isIndigo = tone === 'indigo';
  const defaultTheme = isIndigo
    ? MODULE_THEMES['eligibility-criteria']
    : MODULE_THEMES['drives'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        const cardImg = item.image || CARD_IMAGE_MAP[item.id] || cardDrives;
        const theme = MODULE_THEMES[item.id] || defaultTheme;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            className={`group relative text-left w-full h-52 sm:h-56 rounded-3xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-2 focus:outline-none cursor-pointer shadow-lg hover:shadow-2xl ${
              isActive
                ? `${theme.activeRing} bg-slate-950`
                : `border-slate-200/90 ${theme.borderHover} bg-slate-950 hover:shadow-xl`
            }`}
          >
            {/* Background 3D Themed Graphic Image with smooth zoom */}
            <img
              src={cardImg}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            />

            {/* Gradient Overlays for High Legibility & Cinematic Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/35 transition-opacity duration-300" />
            
            {/* Ambient Radial Accent Glow from Bottom Right (The Enhancing 3rd Color) */}
            <div className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-gradient-to-br ${theme.glowGradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            {/* Active Highlight Rim */}
            {isActive && (
              <div className="absolute inset-0 border-2 border-white/20 rounded-3xl pointer-events-none" />
            )}

            {/* Content Container */}
            <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
              {/* Top Row: Icon Box and Status Pill */}
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all duration-300 shadow-md ${
                  isActive
                    ? theme.iconActive
                    : `bg-white/10 ${theme.textAccent} border-white/20 ${theme.iconHover}`
                }`}>
                  <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </div>

                <div className="flex items-center gap-2">
                  {isActive && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-slate-950 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Active</span>
                    </span>
                  )}
                  {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide backdrop-blur-md border shadow-xs transition-colors ${
                      String(item.badge).includes('Restricted') || String(item.badge).includes('❌')
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                        : theme.badgeTone
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Title, Description & Arrow */}
              <div>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-base sm:text-lg font-black tracking-tight text-white transition-colors duration-200 drop-shadow-sm truncate ${theme.titleHover}`}>
                      {item.label}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-1 font-medium drop-shadow-xs">
                      {item.description || (item.badge ? `Status: ${item.badge}` : 'Click to jump to section')}
                    </p>
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-md transition-all duration-300 shadow-md ${
                    isActive
                      ? `${theme.arrowActive} scale-110`
                      : `bg-white/10 text-white ${theme.arrowHover} group-hover:scale-110 group-hover:border-transparent group-hover:translate-x-0.5 group-hover:-translate-y-0.5`
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
