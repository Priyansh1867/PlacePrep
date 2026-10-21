import React from 'react';
import { 
  Building2, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Calendar,
  Bookmark,
  Layers
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
    <div className="surface-card surface-hover flex flex-col justify-between overflow-hidden group">
      
      {/* Card Header & Profile */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
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
                <Building2 className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                {company.name}
              </h3>
              <p className="text-xs text-slate-500">
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
            className={`p-1.5 rounded-md border text-xs transition-colors ${
              isSaved 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          {company.verifiedUpcomingDrive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/80">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Confirmed Drive: {company.upcomingDriveDate}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
              <Calendar className="w-3 h-3 text-slate-400" />
              {company.driveStatus}
            </span>
          )}

          {isBatchEligible ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-200/80">
              Batch {currentBatch} Eligible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
              Batch {currentBatch} Pending
            </span>
          )}
        </div>

        {/* Roles & Package */}
        <div className="space-y-1 mb-4 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-500 font-medium">Offered CTC:</span>
            <span className="font-semibold text-slate-900">{company.ctc}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-500 font-medium">Primary Roles:</span>
            <span className="font-medium text-slate-800 truncate max-w-[170px]" title={company.roles?.join(', ')}>
              {company.roles?.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>

        {/* Pipeline Rounds Overview */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Interview Rounds
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {company.rounds?.map((round, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium"
              >
                {round.name}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Card Footer: Practice Progress & Primary Action */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{allQuestions.length}</span> questions
          {practicedCount > 0 && (
            <span className="text-emerald-700 font-medium ml-1">({practicedCount} done)</span>
          )}
        </div>

        <button
          onClick={() => onExplore(company)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors"
        >
          <span>View Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
