import React from 'react';
import { 
  Building2, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Calendar,
  Layers,
  Flame,
  Bookmark
} from 'lucide-react';
import { getInterviewQuestions, getPracticedQuestions, getSavedCompanies, toggleSavedCompany } from '../services/storage';

export default function CompanyCard({ company, currentBatch, onExplore }) {
  const allQuestions = getInterviewQuestions().filter(q => q.companyId === company.id);
  const practiced = getPracticedQuestions();
  const savedCompanies = getSavedCompanies();
  const isSaved = savedCompanies.includes(company.id);

  const practicedCount = allQuestions.filter(q => practiced.includes(q.id)).length;
  const isBatchEligible = company.eligibleBatches?.includes(currentBatch);

  return (
    <div className="glass-card bg-[#0B0F19]/90 rounded-2xl border border-slate-800/90 shadow-xl hover:border-indigo-500/50 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.25)] transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Banner / Header */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 group-hover:border-indigo-500/40 transition-all shadow-inner">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <Building2 className="w-6 h-6 text-indigo-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-base text-white group-hover:text-indigo-400 transition-colors">
                  {company.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {company.tier} • {company.headquarters}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSavedCompany(company.id);
            }}
            title={isSaved ? "Saved to profile" : "Save company"}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved 
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                : 'border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-slate-700 bg-slate-900/60'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Batch Eligibility & Drive Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {company.verifiedUpcomingDrive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Verified: {company.upcomingDriveDate}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 text-[11px] font-mono border border-slate-800">
              <Calendar className="w-3 h-3 text-slate-400" />
              {company.driveStatus}
            </span>
          )}

          {isBatchEligible ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold border border-indigo-500/30">
              Batch {currentBatch}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/30">
              Batch {currentBatch} Pending
            </span>
          )}
        </div>

        {/* Roles & Package */}
        <div className="text-xs text-slate-300 space-y-1 mb-3.5 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">CTC Package:</span>
            <span className="font-bold text-emerald-400">{company.ctcRange}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Verified Logs:</span>
            <span className="text-slate-300">{company.experienceCount}+ candidate submissions</span>
          </div>
        </div>

        {/* Frequently Asked Interview Topics */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> High-Yield Focus:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {company.frequentTopics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded-md text-[11px] font-mono border border-slate-800"
              >
                {topic}
              </span>
            ))}
            {company.frequentTopics.length > 3 && (
              <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-mono">
                +{company.frequentTopics.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preparation Status & Action */}
      <div className="p-5 sm:p-6 pt-3 bg-slate-950/60 border-t border-slate-800/80">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-[11px] font-mono mb-1.5">
            <span className="text-slate-400">Preparation Velocity:</span>
            <span className="font-bold text-indigo-400">
              {practicedCount} / {allQuestions.length} Done
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${allQuestions.length > 0 ? (practicedCount / allQuestions.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onExplore(company)}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm transition-all flex items-center justify-center gap-2 group-hover:border-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
        >
          <span>Explore Company Hub</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
