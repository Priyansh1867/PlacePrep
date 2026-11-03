import React, { useState, useEffect } from 'react';
import {
  Binary,
  Database,
  Cpu,
  Network,
  Code2,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  HelpCircle,
  ShieldCheck,
  Search,
  Filter,
  Flame,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { QuestionApi, UserApi } from '../services/api';
import { getInterviewQuestions, getRevisionList, toggleRevisionQuestion } from '../services/storage';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';

const CORE_SUBJECTS = [
  {
    id: 'dbms',
    title: 'Database Management (DBMS)',
    shortName: 'DBMS',
    icon: Database,
    color: 'from-blue-600 to-indigo-700',
    lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'SQL Joins, Indexing, ACID Properties, Normalization, Transactions, and Concurrency.',
    stats: '84% interview recurrence in IT & Fintech drives',
    highYieldTopics: [
      { name: 'SQL Joins (Inner, Left, Right, Full, Self)', importance: 'Very High', note: 'Writing second highest salary & Nth row without limit' },
      { name: 'ACID Properties & Transactions', importance: 'Universal', note: 'Atomicity, Consistency, Isolation levels, Durability in banking systems' },
      { name: 'Indexing (B-Tree, B+ Tree, Hash Indexing)', importance: 'High', note: 'Why B+ Trees are preferred for disk block storage' },
      { name: 'Normalization (1NF, 2NF, 3NF, BCNF)', importance: 'High', note: 'Eliminating update, insertion, and deletion anomalies' },
      { name: 'Deadlock & Concurrency Control (2PL, Timestamp)', importance: 'Medium', note: 'Shared vs Exclusive locks and lock starvation prevention' }
    ]
  },
  {
    id: 'oop',
    title: 'Object-Oriented Programming (OOP)',
    shortName: 'OOPs',
    icon: Code2,
    color: 'from-indigo-600 to-violet-700',
    lightBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    desc: 'Encapsulation, Polymorphism, Abstraction, Inheritance, SOLID Principles, and Design Patterns.',
    stats: '92% recurrence across all technical screening rounds',
    highYieldTopics: [
      { name: 'Polymorphism & Dynamic Method Dispatch', importance: 'Very High', note: 'Compile-time (overloading) vs Run-time (overriding, vtable)' },
      { name: 'Abstract Classes vs. Interfaces', importance: 'Universal', note: 'Java 8 default/static methods and multiple inheritance resolution' },
      { name: 'SOLID Design Principles', importance: 'High', note: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion' },
      { name: 'Gang of Four (GoF) Design Patterns', importance: 'High', note: 'Singleton (thread-safe double-checked locking), Factory, and Observer' },
      { name: 'Memory Layout (Stack vs Heap, Garbage Collection)', importance: 'High', note: 'Pass-by-value vs pass-by-reference semantics and memory leaks' }
    ]
  },
  {
    id: 'os',
    title: 'Operating Systems (OS)',
    shortName: 'OS',
    icon: Cpu,
    color: 'from-amber-600 to-orange-700',
    lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: 'Processes, Threads, CPU Scheduling, Deadlocks, Virtual Memory, and Paging.',
    stats: '78% recurrence in product and tier-1 service panels',
    highYieldTopics: [
      { name: 'Process vs. Thread Architecture', importance: 'Very High', note: 'PCB vs TCB, context switching overhead, shared address space' },
      { name: 'Process Synchronization & Critical Section', importance: 'Universal', note: 'Mutex vs Counting Semaphores, Peterson algorithm, race conditions' },
      { name: 'Deadlock Conditions & Banker Algorithm', importance: 'High', note: 'Mutual exclusion, hold & wait, no preemption, circular wait' },
      { name: 'Virtual Memory & Demand Paging', importance: 'High', note: 'Page fault handling, Translation Lookaside Buffer (TLB), Thrashing' },
      { name: 'Page Replacement Algorithms', importance: 'High', note: 'LRU (Least Recently Used), FIFO, Optimal, Belady anomaly' }
    ]
  },
  {
    id: 'cn',
    title: 'Computer Networks (CN)',
    shortName: 'Networks',
    icon: Network,
    color: 'from-emerald-600 to-teal-700',
    lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'OSI Model, TCP/IP, 3-Way Handshake, DNS, HTTP/HTTPS, and Congestion Control.',
    stats: '75% recurrence in backend, cloud, and systems roles',
    highYieldTopics: [
      { name: 'OSI 7-Layer Model vs. TCP/IP Architecture', importance: 'Universal', note: 'Roles, protocols, and data units at each layer (Frame, Packet, Segment)' },
      { name: 'TCP 3-Way Handshake & Connection Termination', importance: 'Very High', note: 'SYN, SYN-ACK, ACK sequence and 4-way FIN teardown with TIME_WAIT' },
      { name: 'TCP vs. UDP Protocol Comparison', importance: 'High', note: 'Reliable byte-stream vs connectionless datagram, header sizes' },
      { name: 'What happens when you type a URL in browser?', importance: 'High', note: 'DNS resolution, TCP socket, TLS handshake, HTTP GET, rendering' },
      { name: 'HTTP vs. HTTPS & TLS Handshake', importance: 'High', note: 'Symmetric vs Asymmetric encryption, Certificate Authorities (CA)' }
    ]
  }
];

export default function CoreCsPage({ onSelectQuestion, onNavigate }) {
  const [activeSubjectId, setActiveSubjectId] = useState('dbms');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [revisionIds, setRevisionIds] = useState(() => getRevisionList());

  const activeSubject = CORE_SUBJECTS.find(s => s.id === activeSubjectId) || CORE_SUBJECTS[0];

  // Fetch subject-specific questions from backend REST API
  useEffect(() => {
    let isMounted = true;
    async function loadQuestions() {
      setLoading(true);
      try {
        const res = await QuestionApi.getAll();
        if (isMounted && Array.isArray(res)) {
          setQuestions(res);
        }
      } catch (err) {
        console.warn('Backend question fetch error, fallback active:', err);
        const local = getInterviewQuestions();
        if (isMounted) setQuestions(local);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadQuestions();
    return () => { isMounted = false; };
  }, []);

  // Filter questions for active subject
  const allSubjectQuestions = questions.filter(q => {
    const cat = (q.category || '').toLowerCase();
    const text = (q.questionText || q.question || '').toLowerCase();

    if (activeSubjectId === 'dbms') {
      return cat.includes('dbms') || cat.includes('database') || cat.includes('sql') || text.includes('sql') || text.includes('join');
    } else if (activeSubjectId === 'oop') {
      return cat.includes('oop') || cat.includes('object') || cat.includes('java') || text.includes('polymorphism') || text.includes('interface');
    } else if (activeSubjectId === 'os') {
      return cat.includes('operating') || cat.includes('os') || text.includes('thread') || text.includes('process') || text.includes('deadlock') || text.includes('paging');
    } else if (activeSubjectId === 'cn') {
      return cat.includes('network') || cat.includes('cn') || text.includes('tcp') || text.includes('osi') || text.includes('http');
    }
    return true;
  });

  const subjectQuestions = allSubjectQuestions.filter(q => {
    const cat = (q.category || '').toLowerCase();
    const text = (q.questionText || q.question || '').toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return text.includes(query) || cat.includes(query);
  });

  const handleToggleRevision = async (questionId) => {
    toggleRevisionQuestion(questionId);
    setRevisionIds(getRevisionList());
    try {
      await UserApi.toggleRevisionQuestion(questionId);
    } catch (e) {
      // Offline fallback
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200 mb-3">
            <Binary className="w-3.5 h-3.5 text-indigo-300" />
            <span>Core Computer Science Foundation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-300">Curated Placement Syllabus</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Core CS Technical Interview Studio
          </h1>

          <p className="mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed">
            Master the 4 fundamental pillars scrutinized in every technical round: DBMS, Object-Oriented Design, Operating Systems, and Computer Networks. High-yield cheat sheets, placement frequencies, and verified questions.
          </p>
        </div>

        {/* Quick Subject Tabs in Header */}
        <div className="mt-6 flex flex-wrap gap-2 text-xs relative z-10">
          {CORE_SUBJECTS.map(subj => {
            const isSelected = activeSubjectId === subj.id;
            const Icon = subj.icon;
            return (
              <button
                key={subj.id}
                onClick={() => setActiveSubjectId(subj.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-950 shadow-lg font-black scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{subj.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Subject Focus Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeSubject.color} text-white flex items-center justify-center shadow-md shrink-0`}>
            {React.createElement(activeSubject.icon, { className: 'w-7 h-7' })}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{activeSubject.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{activeSubject.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200">
            {activeSubject.stats}
          </span>
        </div>
      </div>

      {/* 2-Column Studio Grid: High-Yield Cheat Sheet vs Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: High-Yield Concept Cheat Sheet (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Must-Know Placement Concepts</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Frequent</span>
            </div>

            <p className="text-xs text-slate-500">
              The exact theoretical scenarios and trade-offs interviewer panels focus on in technical discussions.
            </p>

            <div className="space-y-3 pt-2">
              {activeSubject.highYieldTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-extrabold text-slate-900">{topic.name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      topic.importance === 'Universal' ? 'bg-rose-100 text-rose-800' :
                      topic.importance === 'Very High' ? 'bg-amber-100 text-amber-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {topic.importance}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    <b>Key Focus:</b> {topic.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Mock Practice Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Simulate Real Technical Round</span>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Test your ability to articulate {activeSubject.shortName} concepts out loud with real-time feedback and answer scoring.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('mock-interview')}
              className="w-full py-2.5 rounded-xl bg-white text-indigo-950 font-extrabold text-xs hover:bg-indigo-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Start Technical Round Mock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Curated Interview Question Bank (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            
            {/* Search and Question Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <span>Verified Interview Questions</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Displaying <b>{subjectQuestions.length}</b> verified {activeSubject.shortName} interview questions
                </p>
              </div>

              <div className="w-full sm:w-72">
                <SearchBar
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  placeholder={`Search ${activeSubject.shortName} questions...`}
                  resultCount={subjectQuestions.length}
                  totalCount={allSubjectQuestions.length}
                  size="sm"
                  ariaLabel={`Search ${activeSubject.shortName} questions`}
                />
              </div>
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : subjectQuestions.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-slate-50 rounded-xl border border-slate-200">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No questions found matching "{searchQuery.trim()}".</p>
                <p className="text-[11px] text-slate-400">Clear search filter to display all {activeSubject.shortName} questions.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {subjectQuestions.map((q, idx) => {
                  const qId = q.questionId || q.id || `cs-q-${idx}`;
                  const isSavedRevision = revisionIds.includes(qId);
                  const questionText = q.questionText || q.question;

                  return (
                    <div
                      key={qId}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase">
                              {q.category || activeSubject.shortName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px]">
                              {q.difficulty || 'Medium'}
                            </span>
                            {q.frequencyScore && (
                              <span className="text-[10px] font-bold text-emerald-600">
                                {q.frequencyScore}% Recurrence
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleRevision(qId)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSavedRevision 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'text-slate-400 hover:text-amber-600 hover:bg-slate-200'
                            }`}
                            title={isSavedRevision ? 'Marked for Revision' : 'Flag for Active Recall Revision'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSavedRevision ? 'fill-amber-600' : ''}`} />
                          </button>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {questionText}
                        </h4>

                        {q.approach && (
                          <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2">
                            <b>Approach:</b> {q.approach}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <span className="text-[11px] text-slate-400">
                          {q.round ? `${q.round} Round` : 'Technical Interview'}
                        </span>

                        <button
                          onClick={() => {
                            if (onSelectQuestion) onSelectQuestion(q);
                            if (onNavigate) onNavigate('prep');
                          }}
                          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <span>Detailed Solution & Model Answer</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
