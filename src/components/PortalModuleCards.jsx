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
  'drives': cardDrives,
  'reports-exporter': cardReports,
  'eligibility-criteria': cardEligibility,
  'live-sessions': cardLive,
  'shortlisted': cardShortlists,
  'internships': cardInternships,
  'feedback-loop': cardFeedback,
  'off-campus': cardOffcampus,
  'push-notifications': cardNotifications,
  'faculty-monitoring': cardReports
};

export default function PortalModuleCards({ items, activeId, onSelect, tone = 'emerald' }) {
  const handleClick = (itemId) => {
    if (onSelect) {
      onSelect(itemId);
    }
  };

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
            className={`group relative text-left w-full h-48 sm:h-52 rounded-3xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none cursor-pointer ${
              isActive
                ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl shadow-emerald-950/30'
                : 'border-slate-200/80 hover:border-emerald-400/80 shadow-md hover:shadow-xl'
            }`}
          >
            {/* Background 3D Themed Graphic Image */}
            <img
              src={cardImg}
              alt={item.label}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
            />

            {/* Gradient Overlays for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-900/30 transition-opacity duration-300" />
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              isActive
                ? 'bg-emerald-950/30 border-2 border-emerald-400/80 rounded-3xl'
                : 'bg-transparent group-hover:bg-emerald-950/15'
            }`} />

            {/* Content Container */}
            <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
              {/* Top Row: Icon Box and Status Pill */}
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                    : 'bg-white/15 text-emerald-300 border-white/20 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-emerald-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  {isActive && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                  {item.badge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md border ${
                      item.badge.includes('Restricted') || item.badge.includes('❌')
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                        : 'bg-white/15 text-white border-white/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Title, Description & Arrow */}
              <div>
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors drop-shadow-sm truncate">
                      {item.label}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 font-medium">
                      {item.description || (item.badge ? `Status: ${item.badge}` : 'Click to jump to section')}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isActive
                      ? 'bg-emerald-400 text-slate-950 scale-110'
                      : 'bg-white/10 text-slate-200 group-hover:bg-emerald-400 group-hover:text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                  }`}>
                    <ArrowUpRight className="w-4 h-4" />
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
