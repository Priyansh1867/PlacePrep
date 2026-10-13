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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Banner / Header */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
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
                <Building2 className="w-6 h-6 text-indigo-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {company.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
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
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                : 'border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-slate-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Batch Eligibility & Drive Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {company.verifiedUpcomingDrive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified Drive: {company.upcomingDriveDate}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
              <Calendar className="w-3 h-3 text-slate-400" />
              {company.driveStatus}
            </span>
          )}

          {isBatchEligible ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
              Batch {currentBatch} Eligible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
              Batch {currentBatch} Info Pending
            </span>
          )}
        </div>

        {/* Roles & Package */}
        <div className="text-xs text-slate-600 space-y-1 mb-3.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-400">CTC Range:</span>
            <span className="font-bold text-slate-800">{company.ctcRange}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Verified Experiences:</span>
            <span className="font-semibold text-slate-700">{company.experienceCount}+ candidate logs</span>
          </div>
        </div>

        {/* Frequently Asked Interview Topics */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" /> High-Yield Topics:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {company.frequentTopics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium border border-slate-200/80"
              >
                {topic}
              </span>
            ))}
            {company.frequentTopics.length > 3 && (
              <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-semibold">
                +{company.frequentTopics.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preparation Status & Action */}
      <div className="p-5 sm:p-6 pt-3 bg-slate-50/50 border-t border-slate-100">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-[11px] font-medium mb-1">
            <span className="text-slate-500">Preparation Progress:</span>
            <span className="font-bold text-indigo-600">
              {practicedCount} / {allQuestions.length} Questions
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${allQuestions.length > 0 ? (practicedCount / allQuestions.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onExplore(company)}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-xs transition-all flex items-center justify-center gap-2 group-hover:border-indigo-400"
        >
          <span>Explore Company Hub</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
