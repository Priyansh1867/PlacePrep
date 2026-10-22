import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  Trash2,
  Zap,
  Target
} from 'lucide-react';
import { ResumeAtsApi } from '../services/api';
import { getCompanies } from '../services/storage';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: 'hcltech-get',
    company: 'HCLTech',
    role: 'Graduate Engineer Trainee - Software',
    text: 'HCLTech is seeking passionate Graduate Engineer Trainees to develop and maintain enterprise backend applications. Key requirements include proficiency in Java, Spring Boot, Microservices, and REST APIs. Experience with SQL databases (MySQL/PostgreSQL), Hibernate, and Git version control is essential. Familiarity with Docker, Kubernetes, CI/CD pipelines, and cloud platforms (AWS or Azure) is strongly preferred. Strong foundation in Data Structures, Algorithms, Object-Oriented Programming (OOP), and unit testing with JUnit and Mockito.'
  },
  {
    id: 'tcs-digital',
    company: 'TCS',
    role: 'Digital Software Engineer',
    text: 'Tata Consultancy Services is hiring Digital Cadre Software Engineers. Responsibilities include building scalable web applications using Java or Python, RESTful Web Services, and modern front-end frameworks (React or Angular). Candidates should have solid knowledge of DBMS, complex SQL queries, Operating Systems concepts, and Computer Networks. Hands-on exposure to Agile Scrum workflows, JIRA, Docker containerization, and automated testing is advantageous.'
  },
  {
    id: 'infosys-sp',
    company: 'Infosys',
    role: 'Specialist Programmer',
    text: 'Infosys is hiring Specialist Programmers and System Engineers. Role involves full-stack software development, architectural design, and cloud-native solutions. Required technical skills: Java, Spring Framework, REST APIs, Microservices, PostgreSQL, and Redis caching. Candidate must possess deep knowledge of Data Structures, Algorithms, Distributed Systems, Docker, and CI/CD pipelines. Knowledge of clean code principles and Unit Testing.'
  },
  {
    id: 'google-swe',
    company: 'Google',
    role: 'Software Engineer - Campus Graduate',
    text: 'Google Software Engineers develop next-generation technologies that change how billions of users connect and interact. Minimum qualifications: BS/MS in Computer Science or related technical field. Experience with one or more general-purpose programming languages including Java, C++, Python, or Go. Strong command of Data Structures, Algorithms, System Design, Multithreading, Concurrency, and Operating Systems. Experience building distributed systems, cloud services, and microservices.'
  }
];

export default function ResumeAtsCheckerPage({ onNavigate, onSelectCompany }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);

  const [company, setCompany] = useState('HCLTech');
  const [customCompany, setCustomCompany] = useState('');
  const [role, setRole] = useState('Software Engineer - Java / Cloud');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTIONS[0].text);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const [sampleJds, setSampleJds] = useState(SAMPLE_JOB_DESCRIPTIONS);
  const [companiesList] = useState(() => {
    try {
      const stored = getCompanies();
      return stored && stored.length > 0 ? stored : [];
    } catch {
      return [];
    }
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    ResumeAtsApi.getSampleJds()
      .then(data => {
        if (data && data.length > 0) {
          const mapped = data.map((d, i) => ({
            id: d.companyId || `sample-${i}`,
            company: d.companyName,
            role: d.role,
            text: d.jobDescription
          }));
          setSampleJds(mapped);
        }
      })
      .catch(() => {
        // preserved static fallback
      });
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateAndSetFile = (file) => {
    setFileError(null);
    setAnalysisError(null);

    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf');
    const isDocx = lowerName.endsWith('.docx');
    const isDoc = lowerName.endsWith('.doc');

    if (!isPdf && !isDocx && !isDoc) {
      setFileError('Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx, .doc).');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setFileError(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB maximum limit.`);
      return;
    }

    if (file.size === 0) {
      setFileError('The selected file is empty (0 bytes). Please select a valid resume document.');
      return;
    }

    setSelectedFile(file);
  };

  // Drag & drop handlers
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
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load sample JD
  const handleSelectSample = (sample) => {
    setCompany(sample.company);
    setRole(sample.role);
    setJobDescription(sample.text);
  };

  // Run ATS Analysis
  const handleAnalyzeResume = async (e) => {
    if (e) e.preventDefault();

    if (!selectedFile) {
      setFileError('Please upload a resume file before analyzing.');
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      setAnalysisError('Please enter a target job description (minimum 20 characters) to analyze keyword compatibility.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    const activeCompany = company === 'custom' ? (customCompany || 'Target Recruiter') : company;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('company', activeCompany);
      formData.append('role', role);
      formData.append('jobDescription', jobDescription.trim());

      const result = await ResumeAtsApi.analyze(formData);
      setAnalysisResult(result);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err) {
      console.error('ATS Analysis Error:', err);
      setAnalysisError(err.message || 'Failed to complete ATS keyword analysis. Please verify your document is not password protected and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const isApproved = analysisResult && analysisResult.approvalStatus === 'APPROVED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Breadcrumb Navigation */}
      {onNavigate && (
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Student Dashboard</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">PlacePrep / ATS Resume Checker</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                ATS Compatibility Engine
              </span>
              <Badge variant="success" size="sm">
                Deterministic Matcher (75% Benchmark)
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Resume Status & ATS Keyword Auditor
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Upload your resume (.pdf or .docx) and evaluate it against your target company's job description. 
              Our parser analyzes technical competencies, identifies missing skills, and checks if your resume clears the 75% campus recruitment shortlist benchmark.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 text-white shrink-0 lg:max-w-xs shadow-lg space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Campus Benchmark</span>
            </div>
            <p className="text-xl font-black text-white">75% Shortlist Target</p>
            <p className="text-[11px] text-slate-300 leading-tight">
              Top recruiters (HCLTech, TCS, Infosys) prioritize resumes with ≥75% keyword relevance on technical ATS screening filters.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Configuration Form (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          
          <form onSubmit={handleAnalyzeResume} className="space-y-6">
            
            {/* 1. Resume Upload Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 font-sans">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-mono font-bold text-xs flex items-center justify-center border border-indigo-200">1</span>
                    Upload Candidate Resume
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supports text-based PDF (.pdf) and Microsoft Word (.docx, .doc) up to 10MB.
                  </p>
                </div>
                {selectedFile && (
                  <Badge variant="primary" size="sm">
                    File Selected
                  </Badge>
                )}
              </div>

              {/* Drag and Drop Box */}
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    dragActive 
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-slate-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-file-input"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Drag & drop your resume here, or <span className="text-indigo-600 underline decoration-indigo-300">browse file</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      PDF, DOCX, or DOC (Max 10MB) • Processed in-memory for privacy
                    </p>
                  </div>
                </div>
              ) : (
                /* Selected File Pill Card */
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {formatFileSize(selectedFile.size)} • {selectedFile.name.split('.').pop().toUpperCase()} Document
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100/60 transition cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-100/60 transition cursor-pointer"
                      title="Remove File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {fileError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>

            {/* 2. Target Company & Role Selection Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div>
                <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 font-sans">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-mono font-bold text-xs flex items-center justify-center border border-indigo-200">2</span>
                  Target Recruiter & Role
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the campus recruiter and target role for ATS alignment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {Array.from(new Set([
                      'HCLTech', 'TCS', 'Infosys', 'Google', 'Microsoft', 'Amazon', 'Accenture', 'Cognizant', 'Wipro', 'Deloitte',
                      ...companiesList.map(c => c.name || c.companyName).filter(Boolean)
                    ])).map(cName => (
                      <option key={cName} value={cName}>{cName}</option>
                    ))}
                    <option value="custom">Other (Custom Company)...</option>
                  </select>
                </div>

                {/* Role Input / Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Java Developer"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {company === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Custom Company Name
                  </label>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="e.g. Adobe, Atlassian, Cisco"
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* 3. Job Description Editor Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 font-sans">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-mono font-bold text-xs flex items-center justify-center border border-indigo-200">3</span>
                    Job Description (Required for Matching)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste the target job description or click a sample campus JD below.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400 self-start sm:self-center">
                  {jobDescription.length} characters
                </span>
              </div>

              {/* Sample JD Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Sample Campus JDs (Click to load):
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleJds.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition text-slate-700 cursor-pointer"
                    >
                      {sample.company}: {sample.role.split('-')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* JD Textarea */}
              <div>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description, required technical skills, qualifications, and responsibilities here..."
                  className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 leading-relaxed transition"
                />
              </div>

              {analysisError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isAnalyzing || !selectedFile}
                  icon={isAnalyzing ? RefreshCw : Sparkles}
                  className="w-full py-3.5 shadow-md text-sm font-extrabold cursor-pointer"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Parsing Resume & Auditing Keywords...
                    </span>
                  ) : (
                    <span>Analyze Resume ATS Compatibility</span>
                  )}
                </Button>
              </div>

            </div>

          </form>

        </div>

        {/* Right Column: ATS Compatibility Analysis Dashboard (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. Empty Pre-Analysis State */}
          {!analysisResult && !isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                <FileCheck className="w-8 h-8" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 font-sans">
                  Awaiting Resume Analysis
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your resume on the left and click <strong>Analyze Resume ATS Compatibility</strong> to receive an instant keyword match score, missing skills breakdown, and recommendations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  How our ATS Keyword Auditor Works:
                </h4>
                <ul className="text-[11px] text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>In-Memory Text Extraction:</strong> Extracts raw text from PDF & Word without uploading files to disk.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Phrase-Aware Matching:</strong> Detects multi-word tech terms (Spring Boot, REST APIs, CI/CD).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span><strong>Recruiter Benchmark:</strong> Evaluates if you clear the 75% shortlist threshold for placement drives.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* B. Loading Micro-Animation State */}
          {isAnalyzing && (
            <div className="bg-white rounded-2xl border border-indigo-200 p-8 shadow-md text-center space-y-5 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center animate-spin">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900 font-sans">
                  Auditing Resume Keywords
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Extracting document structure, filtering stop words, and benchmarking against {company}'s requirements...
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full animate-pulse w-3/4 mx-auto" />
              </div>
            </div>
          )}

          {/* C. Results State */}
          {analysisResult && !isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header with Reset */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    ATS Audit Report
                  </span>
                  <h3 className="text-lg font-black text-slate-900 font-sans mt-0.5">
                    {analysisResult.company}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {analysisResult.role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetAnalysis}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Run Another Check"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-check</span>
                </button>
              </div>

              {/* Match Score & Status Banner */}
              <div className={`p-5 rounded-2xl border text-center space-y-3 ${
                isApproved 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Match Relevance
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    isApproved 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-amber-600 text-white'
                  }`}>
                    {analysisResult.approvalStatus === 'APPROVED' ? '✓ APPROVED' : '⚠ NEEDS REVISION'}
                  </span>
                </div>

                {/* Big Score Display */}
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-5xl sm:text-6xl font-black tracking-tight ${
                    isApproved ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {analysisResult.matchScore}%
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 100</span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-black/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-700 ${
                      isApproved ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${analysisResult.matchScore}%` }}
                  />
                </div>

                {/* Rule explanation */}
                <p className="text-xs font-medium text-slate-600 leading-snug">
                  {isApproved ? (
                    <span>
                      Exceeds the <strong>{analysisResult.approvalThreshold}%</strong> campus shortlisting threshold! Your resume exhibits solid technical alignment for {analysisResult.company}.
                    </span>
                  ) : (
                    <span>
                      Below the <strong>{analysisResult.approvalThreshold}%</strong> target threshold. Review the missing keywords below to strengthen your resume before applying.
                    </span>
                  )}
                </p>
              </div>

              {/* Keyword Statistics Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">TOTAL REQ</span>
                  <span className="text-base font-black text-slate-800">{analysisResult.totalKeywordsCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block font-bold">MATCHED</span>
                  <span className="text-base font-black text-emerald-800">{analysisResult.matchedCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-700 block font-bold">MISSING</span>
                  <span className="text-base font-black text-amber-800">{analysisResult.missingCount}</span>
                </div>
              </div>

              {/* Matched Keywords Cloud */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matched Technical Keywords ({analysisResult.matchedKeywords.length})
                  </span>
                </h4>
                {analysisResult.matchedKeywords.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No direct keyword matches found in resume.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.matchedKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 font-semibold text-xs border border-emerald-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Keywords Cloud */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Missing Important Keywords ({analysisResult.missingKeywords.length})
                  </span>
                </h4>
                {analysisResult.missingKeywords.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete keyword coverage achieved!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-semibold text-xs border border-rose-200 flex items-center gap-1"
                      >
                        <span className="text-rose-500 font-bold">+</span>
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Improvement Recommendations */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Actionable Recommendations
                </h4>
                <div className="space-y-2">
                  {analysisResult.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Targeted Prep Link */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-xs font-bold text-indigo-950">Targeted {analysisResult.company} Preparation</p>
                  <p className="text-[11px] text-indigo-700">Practice verified interview questions tailored for {analysisResult.company}</p>
                </div>
                {onNavigate && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => {
                      if (onSelectCompany) {
                        onSelectCompany(analysisResult.company.toLowerCase());
                      }
                      onNavigate('prep');
                    }}
                    className="shrink-0 text-xs font-bold cursor-pointer"
                  >
                    Practice Questions
                  </Button>
                )}
              </div>

              {/* Document Metadata & Disclaimer */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Audited File:</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[180px]">{analysisResult.fileName}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>File Format:</span>
                  <span className="text-slate-700 font-semibold">{analysisResult.fileType}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200/60 mt-1">
                  {analysisResult.disclaimer}
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
