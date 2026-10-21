import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Star, 
  ShieldCheck, 
  Filter, 
  Search, 
  ThumbsUp, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  GraduationCap, 
  HelpCircle,
  X,
  Send,
  Flag
} from 'lucide-react';
import { 
  getInterviewExperiences, 
  addInterviewExperience, 
  getCompanies, 
  getGraduationBatch, 
  submitPlatformFeedback 
} from '../services/storage';

export default function ExperiencesPage() {
  const currentBatch = getGraduationBatch();
  const companies = getCompanies();
  const [experiences, setExperiences] = useState(getInterviewExperiences());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Experience Form State
  const [formCompany, setFormCompany] = useState('hcltech');
  const [formBatch, setFormBatch] = useState(currentBatch);
  const [formRole, setFormRole] = useState('Graduate Engineer Trainee');
  const [formDate, setFormDate] = useState('October 2026');
  const [formRound, setFormRound] = useState('Technical Interview');
  const [formQuestions, setFormQuestions] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('Medium');
  const [formOutcome, setFormOutcome] = useState('Selected');
  const [formTips, setFormTips] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [formStudentName, setFormStudentName] = useState('Priyansh Jain');
  const [formCollege, setFormCollege] = useState('Delhi Technological University');

  // Platform Feedback Form State
  const [fbCategory, setFbCategory] = useState('General Feedback');
  const [fbRating, setFbRating] = useState(5);
  const [fbText, setFbText] = useState('');

  const filtered = experiences.filter(exp => {
    const matchSearch = exp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        exp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        exp.tips.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCompany = companyFilter === 'all' || exp.companyId === companyFilter;
    const matchBatch = batchFilter === 'all' || exp.batch === batchFilter;
    return matchSearch && matchCompany && matchBatch;
  });

  const handleSubmitExperience = (e) => {
    e.preventDefault();
    const companyObj = companies.find(c => c.id === formCompany) || companies[0];

    const questionsArray = formQuestions
      .split('\n')
      .map(q => q.trim())
      .filter(Boolean);

    const newExp = {
      companyId: formCompany,
      companyName: companyObj.name,
      studentName: formAnonymous ? 'Candidate (Anonymous)' : (formStudentName || 'Verified Student'),
      batch: formBatch,
      role: formRole,
      interviewDate: formDate,
      college: formAnonymous ? 'Protected Institution' : formCollege,
      branch: 'Computer Science',
      overallRating: formRating,
      outcome: formOutcome,
      roundsFaced: [formRound],
      questionsEncountered: questionsArray.length > 0 ? questionsArray : ['Technical discussion on OOP and SQL queries.'],
      difficulty: formDifficulty,
      tips: formTips || 'Focus on core basics and maintain high confidence during the panel interview.',
      isAnonymous: formAnonymous,
      verified: true
    };

    const saved = addInterviewExperience(newExp);
    setExperiences(getInterviewExperiences());
    setIsSubmitModalOpen(false);
    setSuccessToast('Thank you! Your interview experience has been submitted and added to the peer intelligence bank.');
    setTimeout(() => setSuccessToast(''), 4000);

    // Reset fields
    setFormQuestions('');
    setFormTips('');
  };

  const handleSubmitPlatformFeedback = (e) => {
    e.preventDefault();
    submitPlatformFeedback({
      category: fbCategory,
      rating: fbRating,
      message: fbText,
      batch: currentBatch
    });
    setIsFeedbackModalOpen(false);
    setFbText('');
    setSuccessToast('Thank you! Your feedback helps calibrate the AI question bank.');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-lg bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-lg bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-8 sm:p-10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200 mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Peer Experience & Feedback Vault</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Interview Experiences & Feedback
          </h1>

          <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Read authentic question debriefs directly from students who appeared in campus placement drives. Share your own experience to help juniors prepare.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Interview Experience</span>
          </button>

          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <Flag className="w-3.5 h-3.5 text-indigo-300" />
            <span>Platform Feedback / Report</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences by company, role, or keywords..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto text-xs">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Company:
            </span>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <span className="text-slate-400 font-semibold ml-2 mr-1">Batch:</span>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Batches</option>
              <option value="2026">2026 Batch</option>
              <option value="2027">2027 Batch</option>
              <option value="2028">2028 Batch</option>
            </select>
          </div>

        </div>
      </div>

      {/* Experiences List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Displaying {filtered.length} verified interview experiences</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" /> Moderated & Quality Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base text-slate-900">{exp.companyName}</span>
                      <span className="text-xs font-semibold text-slate-500">• {exp.role}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {exp.studentName} {exp.college ? `• ${exp.college}` : ''} ({exp.batch} Batch)
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    exp.outcome === 'Selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    exp.outcome === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {exp.outcome}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {exp.roundsFaced.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      {r}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                    {exp.difficulty} Difficulty
                  </span>
                </div>

                {/* Questions Encountered */}
                <div className="mb-4 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-800 mb-1.5">Interview Questions Asked:</p>
                  <ul className="space-y-1">
                    {exp.questionsEncountered.map((q, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-indigo-600 font-semibold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <p className="text-xs text-slate-600 italic bg-amber-50/50 p-3 rounded-lg border border-amber-100 mb-4 leading-relaxed">
                  "{exp.tips}"
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(exp.overallRating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">{exp.interviewDate}</span>
                  <button className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-semibold">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{exp.helpfulVotes || 12}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBMIT EXPERIENCE MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-lg max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-white">Submit Interview Experience</h3>
                <p className="text-xs text-slate-400">Share questions and firsthand advice with your batchmates.</p>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExperience} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                  <select
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Graduation Batch *</label>
                  <select
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="2026">2026 Batch</option>
                    <option value="2027">2027 Batch</option>
                    <option value="2028">2028 Batch</option>
                    <option value="2029">2029 Batch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Role</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. Associate Software Engineer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interview Round</label>
                  <select
                    value={formRound}
                    onChange={(e) => setFormRound(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Technical Interview">Technical Round</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Managerial Round">Managerial Round</option>
                    <option value="Combined Panel">Combined Technical + HR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Questions Encountered (One per line) *
                </label>
                <textarea
                  rows={4}
                  value={formQuestions}
                  onChange={(e) => setFormQuestions(e.target.value)}
                  placeholder="What is normalization?&#10;Write a query for 2nd highest salary&#10;Tell me about a challenging team conflict"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Outcome</label>
                  <select
                    value={formOutcome}
                    onChange={(e) => setFormOutcome(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Selected">Selected</option>
                    <option value="Awaiting Result">Awaiting Result</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rating (1-5)</label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="5">5 - Excellent Experience</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Tough / Stressful</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preparation Tips for Juniors</label>
                <textarea
                  rows={2}
                  value={formTips}
                  onChange={(e) => setFormTips(e.target.value)}
                  placeholder="E.g., Revise SQL joins thoroughly, practice speaking out loud..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Submit Anonymously</span>
                  <span className="text-[11px] text-slate-400">Your name and personal details will be hidden publicly.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formAnonymous}
                  onChange={(e) => setFormAnonymous(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md transition-all"
              >
                Submit Interview Experience
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK & REPORT MODAL */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-white">Platform Feedback & Reporting</h3>
                <p className="text-xs text-slate-400">Help improve PlacePrep AI question quality.</p>
              </div>
              <button onClick={() => setIsFeedbackModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlatformFeedback} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Feedback Category</label>
                <select
                  value={fbCategory}
                  onChange={(e) => setFbCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="General Feedback">General Feedback & Suggestions</option>
                  <option value="Report Outdated Question">Report Outdated / Incorrect Question</option>
                  <option value="AI Explanation Quality">AI Explanation Feedback</option>
                  <option value="New Company Request">Request New Company Hub</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Feedback / Issue Details *</label>
                <textarea
                  rows={4}
                  value={fbText}
                  onChange={(e) => setFbText(e.target.value)}
                  placeholder="Share what worked well or what needs revision..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all"
              >
                Send Feedback
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
