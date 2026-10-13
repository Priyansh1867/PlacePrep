import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Flame, 
  History, 
  CheckCircle2, 
  ShieldCheck, 
  Bot, 
  Award, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  Calendar,
  Building2
} from 'lucide-react';
import { getCompanies, getAiInsights } from '../services/storage';

export default function AiInsightsPage({ initialCompanyId, onSelectQuestion, onLaunchMock }) {
  const companies = getCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId || 'hcltech');

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];
  const insights = getAiInsights(selectedCompany.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 sm:p-10 shadow-xl overflow-hidden relative">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Historical Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Interview Intelligence Dashboard
          </h1>

          <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Data-backed statistical insights synthesized from authentic campus placement transcripts. Compare historical patterns with recent 2026 drive changes.
          </p>
        </div>

        {/* Company Switcher in Header */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-indigo-200 font-semibold mr-1">Select Company:</span>
          {companies.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCompanyId(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCompanyId === c.id
                  ? 'bg-white text-indigo-950 shadow-md font-extrabold'
                  : 'bg-white/10 text-indigo-100 hover:bg-white/20'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Trust and Grounding Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-emerald-900 text-sm">
              Grounded Historical Data for {selectedCompany.name}
            </p>
            <p className="text-emerald-700 mt-0.5">
              Based on {insights.totalSamplesAnalyzed} candidate records. Latest drive data recorded: <b>{insights.dataFreshness}</b>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-bold text-emerald-800">
          <span className="px-2.5 py-1 bg-white rounded-lg border border-emerald-200">
            Confidence: {insights.confidenceScore}
          </span>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Frequently Asked Questions with Actual Frequency */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Frequently Repeated Questions
            </h2>
            <span className="text-xs text-slate-400 font-medium">Historical Frequency</span>
          </div>

          <p className="text-xs text-slate-500">
            Topics and questions that have repeatedly appeared across multiple interview panels for {selectedCompany.name}.
          </p>

          <div className="space-y-3 pt-2">
            {insights.frequentQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {q.category}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      {q.trend}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">{q.question}</h3>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold border border-amber-200 whitespace-nowrap">
                  {q.frequency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Trending Topics (Emerging Patterns) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Trending Topics in Recent Drives
            </h2>
            <span className="text-xs text-indigo-600 font-bold">2025 - 2026 Shift</span>
          </div>

          <p className="text-xs text-slate-500">
            Technical areas witnessing increased question frequency compared to earlier hiring seasons.
          </p>

          <div className="space-y-3 pt-2">
            {insights.trendingTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-slate-900">{topic.topic}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                    {topic.change}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  <b>Industry Driver:</b> {topic.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Historical vs Recent Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          <h2 className="font-extrabold text-lg text-slate-900">
            Previous vs. Recent Interview Analysis for {selectedCompany.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Older Drive Observations (2023 - 2024):
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {insights.historicalVsRecentAnalysis.olderTrends}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Current 2025 - 2026 Drive Patterns:
            </span>
            <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
              {insights.historicalVsRecentAnalysis.recentTrends}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 font-semibold flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <span><b>Key Takeaway for Candidates:</b> {insights.historicalVsRecentAnalysis.keyTakeaway}</span>
        </div>
      </div>

      {/* 4. Preparation Priority Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Preparation Priority Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Optimized study plan prioritized by statistical recurrence in {selectedCompany.name} drives.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.preparationPriority.map((tier, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border-2 flex flex-col justify-between ${
                idx === 0 ? 'border-rose-400 bg-rose-50/30' :
                idx === 1 ? 'border-amber-400 bg-amber-50/30' :
                'border-slate-300 bg-slate-50/50'
              }`}
            >
              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-block mb-3 ${
                  idx === 0 ? 'bg-rose-100 text-rose-800' :
                  idx === 1 ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {tier.priority}
                </span>

                <ul className="space-y-2 mt-2">
                  {tier.topics.map((item, i) => (
                    <li key={i} className="text-xs text-slate-800 font-medium flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grounding Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{insights.disclaimer}</span>
      </div>

      {/* CTA To Mock Interview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-white">
            Ready to test yourself against {selectedCompany.name}'s interview format?
          </h3>
          <p className="text-xs text-indigo-200 mt-1">
            Simulate a full Technical, HR, or Managerial round with instant AI scoring.
          </p>
        </div>

        <button
          onClick={() => onLaunchMock(selectedCompany)}
          className="px-6 py-2.5 rounded-xl bg-white text-indigo-900 font-extrabold text-xs hover:bg-indigo-50 transition-colors shadow-md shrink-0"
        >
          Launch AI Mock Interview
        </button>
      </div>

    </div>
  );
}
