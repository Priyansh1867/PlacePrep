import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import artDrives from '../assets/images/module-illustrations/drives-v1.png';
import artQuestionBank from '../assets/images/module-illustrations/question-bank-v1.png';
import artDsaStudio from '../assets/images/module-illustrations/dsa-studio-v1.png';
import artCrtAttendance from '../assets/images/module-illustrations/crt-attendance-v1.png';
import artClassAttendance from '../assets/images/module-illustrations/class-attendance-v1.png';
import artResumeAts from '../assets/images/module-illustrations/resume-ats-v1.png';
import artReportsExporter from '../assets/images/module-illustrations/reports-exporter-v1.png';
import artEligibilityCriteria from '../assets/images/module-illustrations/eligibility-criteria-v1.png';
import artLiveSessions from '../assets/images/module-illustrations/live-sessions-v1.png';
import artShortlisted from '../assets/images/module-illustrations/shortlisted-v1.png';
import artInternships from '../assets/images/module-illustrations/internships-v1.png';
import artFeedbackLoop from '../assets/images/module-illustrations/feedback-loop-v1.png';
import artOffCampus from '../assets/images/module-illustrations/off-campus-v1.png';
import artPushNotifications from '../assets/images/module-illustrations/push-notifications-v1.png';
import artStudentData from '../assets/images/module-illustrations/student-data-v1.png';
import artCurriculumGovernance from '../assets/images/module-illustrations/curriculum-governance-v1.png';
import artRoundDetails from '../assets/images/module-illustrations/round-details-v1.png';
import artHackathons from '../assets/images/module-illustrations/hackathons-v1.png';
import artFacultyMonitoring from '../assets/images/module-illustrations/faculty-monitoring-v1.png';

const CARD_IMAGE_MAP = {
  'drives': artDrives,
  'question-bank': artQuestionBank,
  'dsa-studio': artDsaStudio,
  'crt-attendance': artCrtAttendance,
  'class-attendance': artClassAttendance,
  'resume-ats': artResumeAts,
  'reports-exporter': artReportsExporter,
  'eligibility-criteria': artEligibilityCriteria,
  'live-sessions': artLiveSessions,
  'shortlisted': artShortlisted,
  'internships': artInternships,
  'feedback-loop': artFeedbackLoop,
  'off-campus': artOffCampus,
  'push-notifications': artPushNotifications,
  'student-data': artStudentData,
  'curriculum-governance': artCurriculumGovernance,
  'round-details': artRoundDetails,
  'hackathons': artHackathons,
  'faculty-monitoring': artFacultyMonitoring,
  'upcoming-drives': artDrives,
};

const CARD_TONES = {
  drives: { accent: '#2563eb', rgb: '37, 99, 235', soft: '#eff6ff' },
  'reports-exporter': { accent: '#7c3aed', rgb: '124, 58, 237', soft: '#f5f3ff' },
  'eligibility-criteria': { accent: '#059669', rgb: '5, 150, 105', soft: '#ecfdf5' },
  'live-sessions': { accent: '#ea580c', rgb: '234, 88, 12', soft: '#fff7ed' },
  shortlisted: { accent: '#db2777', rgb: '219, 39, 119', soft: '#fdf2f8' },
  internships: { accent: '#0f766e', rgb: '15, 118, 110', soft: '#f0fdfa' },
  'feedback-loop': { accent: '#e11d48', rgb: '225, 29, 72', soft: '#fff1f2' },
  'off-campus': { accent: '#4f46e5', rgb: '79, 70, 229', soft: '#eef2ff' },
  'push-notifications': { accent: '#ca8a04', rgb: '202, 138, 4', soft: '#fefce8' },
  'student-data': { accent: '#4f46e5', rgb: '79, 70, 229', soft: '#eef2ff' },
  'curriculum-governance': { accent: '#7c3aed', rgb: '124, 58, 237', soft: '#f5f3ff' },
  'upcoming-drives': { accent: '#2563eb', rgb: '37, 99, 235', soft: '#eff6ff' },
  'question-bank': { accent: '#0891b2', rgb: '8, 145, 178', soft: '#ecfeff' },
  'dsa-studio': { accent: '#9333ea', rgb: '147, 51, 234', soft: '#faf5ff' },
  'crt-attendance': { accent: '#ea580c', rgb: '234, 88, 12', soft: '#fff7ed' },
  'class-attendance': { accent: '#059669', rgb: '5, 150, 105', soft: '#ecfdf5' },
  'resume-ats': { accent: '#0f766e', rgb: '15, 118, 110', soft: '#f0fdfa' },
  'round-details': { accent: '#db2777', rgb: '219, 39, 119', soft: '#fdf2f8' },
  hackathons: { accent: '#c2410c', rgb: '194, 65, 12', soft: '#fff7ed' },
};

const PORTAL_DEFAULTS = {
  emerald: { accent: '#059669', rgb: '5, 150, 105', soft: '#ecfdf5' },
  indigo: { accent: '#4f46e5', rgb: '79, 70, 229', soft: '#eef2ff' },
  teal: { accent: '#0f766e', rgb: '15, 118, 110', soft: '#f0fdfa' },
};

export default function PortalModuleCards({ items, activeId, onSelect, tone = 'indigo' }) {
  const handleClick = (itemId) => {
    if (onSelect) {
      onSelect(itemId);
    }
  };

  return (
    <section className="portal-module-section">
      <div className="portal-module-section__lead">
        <div>
          <p className="portal-module-section__eyebrow">Workspace shortcuts</p>
          <p className="portal-module-section__copy">Your most relevant actions, each with a distinct visual status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        const cardImg = CARD_IMAGE_MAP[item.id] || item.image || artDrives;
        const cardTone = CARD_TONES[item.id] || PORTAL_DEFAULTS[tone] || PORTAL_DEFAULTS.indigo;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`portal-workspace-card group ${isActive ? 'is-active' : ''}`}
            style={{
              '--portal-accent': cardTone.accent,
              '--portal-accent-rgb': cardTone.rgb,
              '--portal-soft': cardTone.soft,
            }}
          >
            <img
              src={cardImg}
              alt=""
              loading="lazy"
              decoding="async"
              width={1536}
              height={1024}
              className="portal-workspace-card__image"
            />

            <span className="portal-workspace-card__veil" />
            <span className="portal-workspace-card__orb" />

            <span className="portal-workspace-card__content">
              <span className="portal-workspace-card__topline">
                <span className="portal-workspace-card__icon">
                  <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                </span>

                <span className="portal-workspace-card__badges">
                  {isActive && (
                    <span className="portal-workspace-card__active-badge">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Active</span>
                    </span>
                  )}
                  {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                    <span className={`portal-workspace-card__badge ${
                      String(item.badge).includes('Restricted') || String(item.badge).includes('❌')
                        ? 'is-restricted'
                        : ''
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </span>
              </span>

              <span className="portal-workspace-card__bottom">
                <span className="portal-workspace-card__copy">
                    <span className="portal-workspace-card__eyebrow">Workspace module</span>
                    <h4 className="portal-workspace-card__title">
                      {item.label}
                    </h4>
                    <span className="portal-workspace-card__description">
                      {item.description || (item.badge ? `Status: ${item.badge}` : 'Click to jump to section')}
                    </span>
                </span>
                <span className="portal-workspace-card__arrow">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </span>
            </span>
          </button>
        );
      })}
      </div>
    </section>
  );
}
