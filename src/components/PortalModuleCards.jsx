import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import cardDrivesLight from '../assets/images/card_drives_light.jpg';
import cardDrives from '../assets/images/card_drives.jpg';
import cardReportsLight from '../assets/images/card_reports_light.jpg';
import cardReports from '../assets/images/card_reports.jpg';
import cardEligibilityLight from '../assets/images/card_eligibility_light.jpg';
import cardEligibility from '../assets/images/card_eligibility.jpg';
import cardLiveLight from '../assets/images/card_live_light.jpg';
import cardLive from '../assets/images/card_live.jpg';
import cardShortlistsLight from '../assets/images/card_shortlists_light.jpg';
import cardShortlists from '../assets/images/card_shortlists.jpg';
import cardInternshipsLight from '../assets/images/card_internships_light.jpg';
import cardInternships from '../assets/images/card_internships.jpg';
import cardFeedbackLight from '../assets/images/card_feedback_light.jpg';
import cardFeedback from '../assets/images/card_feedback.jpg';
import cardOffcampusLight from '../assets/images/card_offcampus_light.jpg';
import cardOffcampus from '../assets/images/card_offcampus.jpg';
import cardNotificationsLight from '../assets/images/card_notifications_light.jpg';
import cardNotifications from '../assets/images/card_notifications.jpg';

const CARD_IMAGE_MAP = {
  // Placement Portal mappings
  'drives': cardDrivesLight || cardDrives,
  'reports-exporter': cardReportsLight || cardReports,
  'eligibility-criteria': cardEligibilityLight || cardEligibility,
  'live-sessions': cardLiveLight || cardLive,
  'shortlisted': cardShortlistsLight || cardShortlists,
  'internships': cardInternshipsLight || cardInternships,
  'feedback-loop': cardFeedbackLight || cardFeedback,
  'off-campus': cardOffcampusLight || cardOffcampus,
  'push-notifications': cardNotificationsLight || cardNotifications,
  'faculty-monitoring': cardReportsLight || cardReports,

  // Institute Portal mappings
  'student-data': cardShortlistsLight || cardShortlists,
  'curriculum-governance': cardReportsLight || cardReports,
  'upcoming-drives': cardDrivesLight || cardDrives,
  'question-bank': cardEligibilityLight || cardEligibility,
  'crt-attendance': cardFeedbackLight || cardFeedback,
  'class-attendance': cardLiveLight || cardLive,
  'resume-ats': cardInternshipsLight || cardInternships,
  'round-details': cardNotificationsLight || cardNotifications,
  'hackathons': cardEligibilityLight || cardEligibility
};

// Clean Light Theme Triad System: Crisp White Base + Dark High-Contrast Text + Vibrant 3rd Accents
const MODULE_THEMES = {
  // 1. Upcoming Drives (Mint Emerald)
  'drives': {
    accent: 'emerald',
    cardHoverBg: 'hover:bg-emerald-50/25',
    activeRing: 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/10',
    borderHover: 'hover:border-emerald-300',
    iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
    iconActive: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
    titleHover: 'group-hover:text-emerald-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
    arrowActive: 'bg-emerald-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-emerald-400/20 via-teal-300/10 to-transparent'
  },
  // 2. Reports Exporter (Tech Cyan)
  'reports-exporter': {
    accent: 'cyan',
    cardHoverBg: 'hover:bg-cyan-50/25',
    activeRing: 'ring-2 ring-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/10',
    borderHover: 'hover:border-cyan-300',
    iconBox: 'bg-cyan-50 text-cyan-600 border border-cyan-200/80 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600',
    iconActive: 'bg-cyan-600 text-white border-cyan-600 shadow-md',
    titleHover: 'group-hover:text-cyan-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600',
    arrowActive: 'bg-cyan-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-cyan-400/20 via-sky-300/10 to-transparent'
  },
  // 3. Eligibility Check (Electric Indigo)
  'eligibility-criteria': {
    accent: 'indigo',
    cardHoverBg: 'hover:bg-indigo-50/25',
    activeRing: 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/10',
    borderHover: 'hover:border-indigo-300',
    iconBox: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
    iconActive: 'bg-indigo-600 text-white border-indigo-600 shadow-md',
    titleHover: 'group-hover:text-indigo-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
    arrowActive: 'bg-indigo-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-indigo-400/20 via-blue-300/10 to-transparent'
  },
  // 4. Live Sessions (Neon Violet)
  'live-sessions': {
    accent: 'violet',
    cardHoverBg: 'hover:bg-violet-50/25',
    activeRing: 'ring-2 ring-violet-500 border-violet-500 shadow-lg shadow-violet-500/10',
    borderHover: 'hover:border-violet-300',
    iconBox: 'bg-violet-50 text-violet-600 border border-violet-200/80 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600',
    iconActive: 'bg-violet-600 text-white border-violet-600 shadow-md',
    titleHover: 'group-hover:text-violet-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600',
    arrowActive: 'bg-violet-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-violet-400/20 via-purple-300/10 to-transparent'
  },
  // 5. Shortlist Status (Radiant Amber Gold)
  'shortlisted': {
    accent: 'amber',
    cardHoverBg: 'hover:bg-amber-50/25',
    activeRing: 'ring-2 ring-amber-500 border-amber-500 shadow-lg shadow-amber-500/10',
    borderHover: 'hover:border-amber-300',
    iconBox: 'bg-amber-50 text-amber-700 border border-amber-200/80 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500',
    iconActive: 'bg-amber-500 text-slate-950 border-amber-500 shadow-md',
    titleHover: 'group-hover:text-amber-800',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500',
    arrowActive: 'bg-amber-500 text-slate-950 shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-amber-400/20 via-yellow-300/10 to-transparent'
  },
  // 6. Internship Details (Luminous Teal)
  'internships': {
    accent: 'teal',
    cardHoverBg: 'hover:bg-teal-50/25',
    activeRing: 'ring-2 ring-teal-500 border-teal-500 shadow-lg shadow-teal-500/10',
    borderHover: 'hover:border-teal-300',
    iconBox: 'bg-teal-50 text-teal-600 border border-teal-200/80 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600',
    iconActive: 'bg-teal-600 text-white border-teal-600 shadow-md',
    titleHover: 'group-hover:text-teal-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600',
    arrowActive: 'bg-teal-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-teal-400/20 via-emerald-300/10 to-transparent'
  },
  // 7. Feedback TPO (Coral Rose)
  'feedback-loop': {
    accent: 'rose',
    cardHoverBg: 'hover:bg-rose-50/25',
    activeRing: 'ring-2 ring-rose-500 border-rose-500 shadow-lg shadow-rose-500/10',
    borderHover: 'hover:border-rose-300',
    iconBox: 'bg-rose-50 text-rose-600 border border-rose-200/80 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    iconActive: 'bg-rose-600 text-white border-rose-300 shadow-md',
    titleHover: 'group-hover:text-rose-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    arrowActive: 'bg-rose-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-rose-400/20 via-pink-300/10 to-transparent'
  },
  // 8. Off-Campus (Sky Blue)
  'off-campus': {
    accent: 'sky',
    cardHoverBg: 'hover:bg-sky-50/25',
    activeRing: 'ring-2 ring-sky-500 border-sky-500 shadow-lg shadow-sky-500/10',
    borderHover: 'hover:border-sky-300',
    iconBox: 'bg-sky-50 text-sky-600 border border-sky-200/80 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
    iconActive: 'bg-sky-600 text-white border-sky-600 shadow-md',
    titleHover: 'group-hover:text-sky-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
    arrowActive: 'bg-sky-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-sky-400/20 via-cyan-300/10 to-transparent'
  },
  // 9. Push Notifications (Sunset Orange)
  'push-notifications': {
    accent: 'orange',
    cardHoverBg: 'hover:bg-orange-50/25',
    activeRing: 'ring-2 ring-orange-500 border-orange-500 shadow-lg shadow-orange-500/10',
    borderHover: 'hover:border-orange-300',
    iconBox: 'bg-orange-50 text-orange-600 border border-orange-200/80 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
    iconActive: 'bg-orange-600 text-white border-orange-600 shadow-md',
    titleHover: 'group-hover:text-orange-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
    arrowActive: 'bg-orange-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-orange-400/20 via-amber-300/10 to-transparent'
  },

  // Institute Portal Module Mappings
  'student-data': {
    accent: 'indigo',
    cardHoverBg: 'hover:bg-indigo-50/25',
    activeRing: 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/10',
    borderHover: 'hover:border-indigo-300',
    iconBox: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
    iconActive: 'bg-indigo-600 text-white border-indigo-600 shadow-md',
    titleHover: 'group-hover:text-indigo-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
    arrowActive: 'bg-indigo-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-indigo-400/20 via-blue-300/10 to-transparent'
  },
  'curriculum-governance': {
    accent: 'violet',
    cardHoverBg: 'hover:bg-violet-50/25',
    activeRing: 'ring-2 ring-violet-500 border-violet-500 shadow-lg shadow-violet-500/10',
    borderHover: 'hover:border-violet-300',
    iconBox: 'bg-violet-50 text-violet-600 border border-violet-200/80 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600',
    iconActive: 'bg-violet-600 text-white border-violet-600 shadow-md',
    titleHover: 'group-hover:text-violet-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600',
    arrowActive: 'bg-violet-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-violet-400/20 via-purple-300/10 to-transparent'
  },
  'upcoming-drives': {
    accent: 'emerald',
    cardHoverBg: 'hover:bg-emerald-50/25',
    activeRing: 'ring-2 ring-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/10',
    borderHover: 'hover:border-emerald-300',
    iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
    iconActive: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
    titleHover: 'group-hover:text-emerald-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
    arrowActive: 'bg-emerald-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-emerald-400/20 via-teal-300/10 to-transparent'
  },
  'question-bank': {
    accent: 'cyan',
    cardHoverBg: 'hover:bg-cyan-50/25',
    activeRing: 'ring-2 ring-cyan-500 border-cyan-500 shadow-lg shadow-cyan-500/10',
    borderHover: 'hover:border-cyan-300',
    iconBox: 'bg-cyan-50 text-cyan-600 border border-cyan-200/80 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600',
    iconActive: 'bg-cyan-600 text-white border-cyan-600 shadow-md',
    titleHover: 'group-hover:text-cyan-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600',
    arrowActive: 'bg-cyan-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-cyan-400/20 via-sky-300/10 to-transparent'
  },
  'crt-attendance': {
    accent: 'amber',
    cardHoverBg: 'hover:bg-amber-50/25',
    activeRing: 'ring-2 ring-amber-500 border-amber-500 shadow-lg shadow-amber-500/10',
    borderHover: 'hover:border-amber-300',
    iconBox: 'bg-amber-50 text-amber-700 border border-amber-200/80 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500',
    iconActive: 'bg-amber-500 text-slate-950 border-amber-500 shadow-md',
    titleHover: 'group-hover:text-amber-800',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500',
    arrowActive: 'bg-amber-500 text-slate-950 shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-amber-400/20 via-orange-300/10 to-transparent'
  },
  'class-attendance': {
    accent: 'teal',
    cardHoverBg: 'hover:bg-teal-50/25',
    activeRing: 'ring-2 ring-teal-500 border-teal-500 shadow-lg shadow-teal-500/10',
    borderHover: 'hover:border-teal-300',
    iconBox: 'bg-teal-50 text-teal-600 border border-teal-200/80 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600',
    iconActive: 'bg-teal-600 text-white border-teal-600 shadow-md',
    titleHover: 'group-hover:text-teal-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600',
    arrowActive: 'bg-teal-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-teal-400/20 via-emerald-300/10 to-transparent'
  },
  'resume-ats': {
    accent: 'rose',
    cardHoverBg: 'hover:bg-rose-50/25',
    activeRing: 'ring-2 ring-rose-500 border-rose-500 shadow-lg shadow-rose-500/10',
    borderHover: 'hover:border-rose-300',
    iconBox: 'bg-rose-50 text-rose-600 border border-rose-200/80 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    iconActive: 'bg-rose-600 text-white border-rose-600 shadow-md',
    titleHover: 'group-hover:text-rose-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
    arrowActive: 'bg-rose-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-rose-400/20 via-pink-300/10 to-transparent'
  },
  'round-details': {
    accent: 'orange',
    cardHoverBg: 'hover:bg-orange-50/25',
    activeRing: 'ring-2 ring-orange-500 border-orange-500 shadow-lg shadow-orange-500/10',
    borderHover: 'hover:border-orange-300',
    iconBox: 'bg-orange-50 text-orange-600 border border-orange-200/80 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
    iconActive: 'bg-orange-600 text-white border-orange-600 shadow-md',
    titleHover: 'group-hover:text-orange-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600',
    arrowActive: 'bg-orange-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-orange-400/20 via-amber-300/10 to-transparent'
  },
  'hackathons': {
    accent: 'purple',
    cardHoverBg: 'hover:bg-purple-50/25',
    activeRing: 'ring-2 ring-purple-500 border-purple-500 shadow-lg shadow-purple-500/10',
    borderHover: 'hover:border-purple-300',
    iconBox: 'bg-purple-50 text-purple-600 border border-purple-200/80 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600',
    iconActive: 'bg-purple-600 text-white border-purple-600 shadow-md',
    titleHover: 'group-hover:text-purple-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600',
    arrowActive: 'bg-purple-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-purple-400/20 via-indigo-300/10 to-transparent'
  },
  'faculty-monitoring': {
    accent: 'sky',
    cardHoverBg: 'hover:bg-sky-50/25',
    activeRing: 'ring-2 ring-sky-500 border-sky-500 shadow-lg shadow-sky-500/10',
    borderHover: 'hover:border-sky-300',
    iconBox: 'bg-sky-50 text-sky-600 border border-sky-200/80 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
    iconActive: 'bg-sky-600 text-white border-sky-600 shadow-md',
    titleHover: 'group-hover:text-sky-700',
    arrowBtn: 'bg-slate-100 text-slate-600 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
    arrowActive: 'bg-sky-600 text-white shadow-md',
    badgeTone: 'border-slate-200 text-slate-700 bg-white/95 shadow-2xs',
    glowGradient: 'from-sky-400/20 via-cyan-300/10 to-transparent'
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
            className={`group relative text-left w-full h-52 sm:h-56 rounded-3xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none cursor-pointer shadow-sm hover:shadow-xl bg-white ${
              isActive
                ? `${theme.activeRing}`
                : `border-slate-200/90 ${theme.borderHover} ${theme.cardHoverBg}`
            }`}
          >
            {/* Background 3D Graphic (Light Harmonized Overlay) */}
            <img
              src={cardImg}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 opacity-75"
            />

            {/* Radiant Light Theme Gradients for Peak Legibility & Bright Aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/35 transition-opacity duration-300" />
            
            {/* Soft Ambient Pastel Glow from Bottom Right */}
            <div className={`absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-gradient-to-br ${theme.glowGradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

            {/* Active Subtle Accent Border */}
            {isActive && (
              <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-3xl pointer-events-none" />
            )}

            {/* Content Container (Razor-Sharp High-Contrast Light Theme Typography) */}
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
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      <span>Active</span>
                    </span>
                  )}
                  {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md border ${
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
