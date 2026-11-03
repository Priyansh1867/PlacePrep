// PlacePrep - Interview Rounds & Selection Workflow Engine Dataset
// Complete Placement Support System covering Aptitude, Technical, Managerial, and HR rounds.

export const SELECTION_ROUNDS = [
  {
    id: 'aptitude',
    name: 'Aptitude Assessment',
    roundNumber: 1,
    badge: 'Round 1: Screening',
    color: 'blue',
    description: 'Initial online screening assessing Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Core Pseudocode / Coding fundamentals.',
    duration: '90 mins',
    cutoffScore: '70%',
    eliminationRate: '60% candidates eliminated',
    evaluatorRole: 'Automated AI / Proctoring Panel',
    criteria: [
      'Quantitative & Numerical Ability (Speed Math, Probability, Permutations, Profit/Loss)',
      'Logical & Critical Reasoning (Syllogisms, Blood Relations, Puzzles, Series)',
      'Verbal Ability & Grammar (Reading Comprehension, Sentence Correction)',
      'Coding & Pseudocode Tracing (Basic Syntax, Recursion, Bitwise operators)'
    ]
  },
  {
    id: 'technical',
    name: 'Technical Interview',
    roundNumber: 2,
    badge: 'Round 2: Core Engineering',
    color: 'indigo',
    description: 'In-depth evaluation of Data Structures, Algorithms, Core Computer Science (DBMS, OS, Networks, OOP), Live Coding, and Resume Projects.',
    duration: '45-60 mins',
    cutoffScore: '75%',
    eliminationRate: '50% candidates eliminated',
    evaluatorRole: 'Senior Technical Lead / SDE-2/3',
    criteria: [
      'Data Structures & Algorithm Problem Solving (Time/Space Complexity, Edge cases)',
      'Core CS Fundamentals (DBMS Normalization, ACID, OOPs, Memory/GC)',
      'Project Architecture & Code Scrutiny (Frameworks, DB schema, API design)',
      'Live Coding & Clean Code Practices (Variable naming, modularity, debugging)'
    ]
  },
  {
    id: 'managerial',
    name: 'Managerial Round',
    roundNumber: 3,
    badge: 'Round 3: Problem Solving & Fit',
    color: 'amber',
    description: 'Evaluates situational judgment, conflict resolution, leadership, deadline handling, decision-making under ambiguity, and client handling.',
    duration: '30-45 mins',
    cutoffScore: '80%',
    eliminationRate: '35% candidates eliminated',
    evaluatorRole: 'Engineering Manager / Delivery Head',
    criteria: [
      'Situational & Behavioral Judgement (STAR framework delivery)',
      'Conflict Resolution & Team Collaboration',
      'Handling Unfamiliar Technologies & Tight Deadlines',
      'Client-Facing Communication & Ownership Mindset'
    ]
  },
  {
    id: 'hr',
    name: 'HR & Final Selection',
    roundNumber: 4,
    badge: 'Round 4: Cultural Fit & Offer',
    color: 'emerald',
    description: 'Final alignment on company culture, ethics, relocation willingness, shift flexibility, academic background verification, and compensation.',
    duration: '20-30 mins',
    cutoffScore: '85%',
    eliminationRate: '15% candidates eliminated',
    evaluatorRole: 'Human Resources Director / Talent Partner',
    criteria: [
      'Company Value Alignment & Long-Term Motivation',
      'Relocation & Shift Flexibility',
      'Background & Academic Credentials Verification',
      'Service Agreement / Bond Understanding & Professional Ethics'
    ]
  }
];

export const INITIAL_CANDIDATES_PIPELINE = [];

export const INITIAL_EVALUATOR_RECORDS = [];

export const INITIAL_STAKEHOLDER_FEEDBACK = [];

// Aptitude Questions to enrich the Question Bank knowledge base
export const INITIAL_APTITUDE_QUESTIONS = [];
