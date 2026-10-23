import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  Sparkles,
  RefreshCw,
  Trash2,
  Info,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  ChevronDown,
  Layers,
  Award,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { ResumeAtsApi } from '../services/api';
import { getCompanies, updateResumeStatus, getResumeStatus } from '../services/storage';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const PRESET_SAMPLE_JDS = [
  {
    id: 'tcs',
    company: 'TCS',
    role: 'Software Engineer (Digital Cadre)',
    label: 'TCS Digital',
    description: 'TCS Digital is hiring passionate Software Engineers proficient in Java, Spring Boot, REST APIs, and modern web frameworks like React. The candidate must possess solid foundations in Data Structures, Algorithms, Object Oriented Programming, and Relational Database management with SQL Queries. Familiarity with Docker Containers, CI/CD pipelines, and Cloud Computing concepts is a plus.'
  },
  {
    id: 'infosys',
    company: 'Infosys',
    role: 'Specialist Programmer (Power Programmer)',
    label: 'Infosys Specialist',
    description: 'We are seeking high-caliber problem solvers for the Specialist Programmer role. Key competencies: advanced Data Structures, dynamic programming, Graph algorithms, Microservices Architecture, Python, or Java. Experience with distributed caching, Docker, Kubernetes, Unit Testing, and AWS Cloud services will give candidates an edge.'
  },
  {
    id: 'amazon',
    company: 'Amazon',
    role: 'Software Development Engineer I (SDE-1)',
    label: 'Amazon SDE-1',
    description: 'Amazon is seeking ambitious SDE 1 candidates. You will design, build, and deploy high-throughput distributed systems. Required: exceptional mastery of Object Oriented Programming in Java, C++, or Go; deep understanding of System Design, multi-threading, REST APIs, and database indexing. You should have hands-on experience with Unit Testing, Test Driven Development, Version Control with Git GitHub, and Cloud Computing on AWS.'
  },
  {
    id: 'atlassian',
    company: 'Atlassian',
    role: 'Associate Software Engineer',
    label: 'Atlassian ASE',
    description: 'Join our engineering team to build world-class collaborative developer tools. We require strong skills in React, TypeScript, JavaScript, Java, and Spring Boot. You must write Clean Code with high unit test coverage, design scalable REST APIs, and participate in Agile Methodology sprints. Understanding of Docker, CI/CD, and Microservices Architecture is strongly valued.'
  }
];

export default function ResumeAtsCheckerPage({ onNavigate, onSelectCompany }) {
  // Existing data options
  const existingCompanies = getCompanies();

  // Form State
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(existingCompanies[0]?.name || 'TCS');
  const [customCompany, setCustomCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('Software Engineer (SDE-1)');
  const [jobDescription, setJobDescription] = useState(PRESET_SAMPLE_JDS[0].description);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // File input ref
  const fileInputRef = useRef(null);

  // Supported extensions
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setValidationError(null);
    if (!selectedFile) return;

    const lowerName = selectedFile.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));

    if (!hasValidExt) {
      setValidationError(`Unsupported file extension. Please select a PDF (.pdf) or Word document (.docx, .doc).`);
      return;
    }

    if (selectedFile.size === 0) {
      setValidationError('The selected file is empty. Please select a valid resume document.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 10MB.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleJd = (preset) => {
    setSelectedCompany(preset.company);
    setSelectedRole(preset.role);
    setJobDescription(preset.description);
    setValidationError(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!file) {
      setValidationError('Please upload your resume file (PDF, DOCX, or DOC).');
      return;
    }

    const effectiveCompany = selectedCompany === 'custom' ? customCompany.trim() : selectedCompany;
    if (!effectiveCompany) {
      setValidationError('Please provide or select a target company.');
      return;
    }

    if (!selectedRole || !selectedRole.trim()) {
      setValidationError('Please provide the target job role.');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      setValidationError('Please paste a meaningful job description (minimum 20 characters).');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgressStep('Uploading document securely to memory...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company', effectiveCompany);
      formData.append('role', selectedRole.trim());
      formData.append('jobDescription', jobDescription.trim());

      setAnalysisProgressStep('Extracting text in-memory and parsing document structure...');

      const response = await ResumeAtsApi.analyze(formData);

      setAnalysisProgressStep('Scoring keyword competencies and computing match status...');

      // Small delay for smooth transition
      await new Promise(r => setTimeout(r, 400));

      setAnalysisResult(response);

      // Also persist to PlacePrep state so other pages reflect the verified score
      try {
        updateResumeStatus({
          fileName: file.name,
          atsScore: response.matchScore,
          verificationStatus: response.approvalStatus === 'APPROVED' ? 'ATS Verified' : 'Revision Required',
          matchedKeywords: response.matchedKeywords || [],
          missingKeywords: response.missingKeywords || []
        });
      } catch (err) {
        console.warn('Could not update stored resume status:', err);
      }

    } catch (err) {
      console.error('ATS Analysis Error:', err);
      setValidationError(err.message || 'Failed to analyze resume. Please verify the document is not corrupt and try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgressStep('');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    handleRemoveFile();
    setValidationError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI RECRUITER SIMULATOR • REAL-TIME ATS AUDIT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            Resume Status & ATS Compatibility Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-mono">
            Verify keyword density, evaluate role-specific competencies against recruiter job descriptions, and audit your shortlisting approval status.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => onNavigate('dashboard')}
          >
            Student Dashboard
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigate('drives')}
          >
            Browse Active Drives
          </Button>
        </div>
      </div>

      {/* Main Two-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Document Upload (5 Cols or Full width when idle) */}
        <div className="lg:col-span-5 space-y-6">
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  1. Upload Resume Document
                </CardTitle>
                <Badge variant="neutral" size="sm">PDF, DOCX, DOC</Badge>
              </div>
              <CardDescription>
                Processed in-memory. Documents are never permanently stored or shared.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              
              {/* Drag and Drop Zone */}
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                      : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Drop your resume here, or <span className="text-indigo-600 underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Supports PDF, DOCX, DOC up to 10MB
                  </p>
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {(file.size / 1024).toFixed(1)} KB • {file.name.split('.').pop()?.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-100/50 transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Target Company & Role Selection */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Company Select */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      Target Company
                    </label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {existingCompanies.map((c) => (
                        <option key={c.id || c.companyId} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="custom">Other / Custom Company</option>
                    </select>
                  </div>

                  {/* Target Role Input */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      Target Role
                    </label>
                    <input
                      type="text"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      placeholder="e.g. SDE-1, Backend Engineer"
                      className="w-full text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                </div>

                {selectedCompany === 'custom' && (
                  <div>
                    <input
                      type="text"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      placeholder="Enter company name..."
                      className="w-full text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Job Description Text Area */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Target Job Description
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {jobDescription.length} characters
                  </span>
                </div>

                {/* Sample JD Quick Fill Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Quick Sample:
                  </span>
                  {PRESET_SAMPLE_JDS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleLoadSampleJd(preset)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the employer's official job description or required skills here..."
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 p-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Validation Error Message */}
              {validationError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="primary"
                onClick={handleAnalyze}
                loading={isAnalyzing}
                disabled={isAnalyzing}
                className="w-full py-2.5 text-sm font-bold shadow-md shadow-indigo-600/20"
                icon={Sparkles}
              >
                {isAnalyzing ? 'Running ATS Analysis...' : 'Analyze Resume Compatibility'}
              </Button>

              {isAnalyzing && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center space-y-1 animate-pulse">
                  <p className="text-xs font-bold text-indigo-900">{analysisProgressStep}</p>
                  <p className="text-[10px] text-indigo-600 font-mono">Evaluating keyword matches and scoring...</p>
                </div>
              )}

            </CardContent>
          </Card>

        </div>

        {/* Right Column: ATS Compatibility Results & Recommendations (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {!analysisResult ? (
            /* Empty / Idle State */
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <FileCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">
                  Ready for In-Depth ATS Evaluation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">
                  Upload your resume on the left and select a target job description. The engine extracts technical competencies in-memory and audits compatibility against recruiter shortlisting standards.
                </p>
              </div>

              {/* Workflow Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-4 border-t border-slate-100 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">1. Multi-Format</span>
                  <p className="text-[11px] text-slate-500">Supports PDF, DOCX, and DOC documents with header magic-byte verification.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">2. Transparent Score</span>
                  <p className="text-[11px] text-slate-500">Deterministic keyword extraction with stopword filtering and phrase matching.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">3. Recruiter Feedback</span>
                  <p className="text-[11px] text-slate-500">Instant missing keywords identification and actionable STAR improvement tips.</p>
                </div>
              </div>
            </div>
          ) : (
            /* Result Dashboard */
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Primary Score & Verdict Card */}
              <div className={`rounded-3xl p-6 sm:p-8 border shadow-md transition-all ${
                analysisResult.approvalStatus === 'APPROVED'
                  ? 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border-emerald-200'
                  : 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border-amber-200'
              }`}>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-black/[0.06]">
                  
                  {/* Left: Candidate & Role context */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        analysisResult.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                          : 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                      }`}>
                        {analysisResult.approvalStatus === 'APPROVED' ? '✓ APPROVED FOR SHORTLIST' : '⚠ NEEDS REVISION'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        File: {analysisResult.fileName}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                      {analysisResult.role}
                    </h2>
                    <p className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 font-mono">
                      <Building2 className="w-3.5 h-3.5" />
                      Target Recruiter: {analysisResult.company}
                    </p>
                  </div>

                  {/* Right: Big Score Gauge */}
                  <div className={`p-5 rounded-2xl border text-center shrink-0 min-w-[140px] shadow-sm ${
                    analysisResult.approvalStatus === 'APPROVED'
                      ? 'bg-white border-emerald-300 text-emerald-800'
                      : 'bg-white border-amber-300 text-amber-800'
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      ATS Match Score
                    </span>
                    <span className="text-4xl font-black tracking-tight block my-0.5">
                      {analysisResult.matchScore}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Threshold: {analysisResult.approvalThreshold}%
                    </span>
                  </div>

                </div>

                {/* Score Summary description */}
                <p className="text-xs sm:text-sm text-slate-700 font-medium pt-4 leading-relaxed">
                  {analysisResult.summary}
                </p>

                {/* Metrics Breakdown Bar */}
                <div className="grid grid-cols-3 gap-3 pt-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Matched Skills</span>
                    <span className="text-base font-black text-emerald-700">{analysisResult.matchedCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Missing Skills</span>
                    <span className="text-base font-black text-rose-600">{analysisResult.missingCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total In Job</span>
                    <span className="text-base font-black text-slate-800">{analysisResult.totalJobKeywords}</span>
                  </div>
                </div>

              </div>

              {/* Matched Keywords Found */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matched Competencies Found ({analysisResult.matchedKeywords?.length || 0})
                  </h3>
                  <Badge variant="success" size="sm">Verified in Resume</Badge>
                </div>

                {analysisResult.matchedKeywords && analysisResult.matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {analysisResult.matchedKeywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-mono italic">
                    No exact technical matches detected against the target job requirements.
                  </p>
                )}
              </div>

              {/* Missing Keywords To Incorporate */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Recommended Keywords to Add ({analysisResult.missingKeywords?.length || 0})
                  </h3>
                  <Badge variant="danger" size="sm">High Yield for ATS</Badge>
                </div>

                {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {analysisResult.missingKeywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <span className="font-mono text-rose-600 font-bold">+</span>
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-mono font-medium">
                    ✓ Outstanding coverage! No critical keywords missing from the job specification.
                  </p>
                )}
              </div>

              {/* Actionable Engineering Recommendations */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Actionable Recruiter Recommendations
                </h3>

                <ul className="space-y-2.5 text-xs text-slate-700 font-mono">
                  {analysisResult.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Educational Disclaimer Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-mono flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-700">Educational Estimate Notice: </strong>
                  {analysisResult.disclaimer}
                </p>
              </div>

              {/* Re-analyze Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  icon={RefreshCw}
                  onClick={handleReset}
                  className="font-bold"
                >
                  Analyze Another Resume or Job Description
                </Button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
