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

export const INITIAL_CANDIDATES_PIPELINE = [
  {
    id: 'cand-101',
    name: 'Priyansh Jain',
    email: 'priyansh.jain@example.edu',
    college: 'Delhi Technological University (DTU)',
    branch: 'B.Tech CSE',
    batch: '2028',
    companyId: 'hcltech',
    companyName: 'HCLTech',
    currentRound: 'technical',
    status: 'Advanced', // 'Shortlisted', 'Advanced', 'Eliminated', 'Selected'
    scores: {
      aptitude: 92,
      technical: 88,
      managerial: null,
      hr: null
    },
    evaluator: 'Vikram Mehta (Tech Lead)',
    notes: 'Outstanding clarity on Floyd cycle detection and SQL indexing. Recommended for Managerial round.',
    lastUpdated: 'Today, 11:30 AM'
  },
  {
    id: 'cand-102',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.edu',
    college: 'Netaji Subhas University of Technology (NSUT)',
    branch: 'B.Tech IT',
    batch: '2026',
    companyId: 'tcs',
    companyName: 'TCS',
    currentRound: 'managerial',
    status: 'Advanced',
    scores: {
      aptitude: 88,
      technical: 90,
      managerial: 85,
      hr: null
    },
    evaluator: 'Rajesh Nair (Delivery Manager)',
    notes: 'Demonstrated strong leadership in capstone project. High emotional intelligence.',
    lastUpdated: 'Yesterday, 04:15 PM'
  },
  {
    id: 'cand-103',
    name: 'Rohan Mehra',
    email: 'rohan.mehra@example.edu',
    college: 'BITS Pilani',
    branch: 'B.E. Computer Science',
    batch: '2026',
    companyId: 'deloitte',
    companyName: 'Deloitte',
    currentRound: 'hr',
    status: 'Selected',
    scores: {
      aptitude: 94,
      technical: 91,
      managerial: 93,
      hr: 95
    },
    evaluator: 'Pooja Singhania (Talent Partner)',
    notes: 'Final Selection Approved. Offer letter dispatched for Analyst - Technology Consulting role.',
    lastUpdated: 'Oct 17, 2026'
  },
  {
    id: 'cand-104',
    name: 'Karan Verma',
    email: 'karan.verma@example.edu',
    college: 'Vellore Institute of Technology (VIT)',
    branch: 'B.Tech ECE',
    batch: '2026',
    companyId: 'accenture',
    companyName: 'Accenture',
    currentRound: 'aptitude',
    status: 'Eliminated',
    scores: {
      aptitude: 58,
      technical: null,
      managerial: null,
      hr: null
    },
    evaluator: 'Automated CAT Assessment',
    notes: 'Did not meet quantitative sectional cutoff (58% vs 70% required). Eligible for pool re-drive next quarter.',
    lastUpdated: 'Oct 15, 2026'
  },
  {
    id: 'cand-105',
    name: 'Sneha Rao',
    email: 'sneha.rao@example.edu',
    college: 'Indira Gandhi Delhi Technical University (IGDTUW)',
    branch: 'B.Tech CSE',
    batch: '2027',
    companyId: 'infosys',
    companyName: 'Infosys',
    currentRound: 'technical',
    status: 'Shortlisted',
    scores: {
      aptitude: 85,
      technical: null,
      managerial: null,
      hr: null
    },
    evaluator: 'Siddharth Iyer (Senior Architect)',
    notes: 'Cleared InfyTQ coding challenge. Technical slot scheduled for tomorrow morning.',
    lastUpdated: 'Today, 09:00 AM'
  },
  {
    id: 'cand-106',
    name: 'Devansh Gupta',
    email: 'devansh.g@example.edu',
    college: 'DTU',
    branch: 'B.Tech Software Engineering',
    batch: '2026',
    companyId: 'cognizant',
    companyName: 'Cognizant',
    currentRound: 'hr',
    status: 'Advanced',
    scores: {
      aptitude: 89,
      technical: 86,
      managerial: 88,
      hr: null
    },
    evaluator: 'Neha Kapoor (Campus Recruiter)',
    notes: 'Cleared GenC Next technical panel with flying colors. Awaiting final HR band clearance.',
    lastUpdated: 'Today, 12:45 PM'
  }
];

export const INITIAL_EVALUATOR_RECORDS = [
  {
    id: 'eval-1',
    candidateId: 'cand-101',
    candidateName: 'Priyansh Jain',
    companyName: 'HCLTech',
    round: 'Technical Interview',
    evaluatorName: 'Vikram Mehta (Tech Lead)',
    date: '2026-10-18',
    rubrics: {
      problemSolving: 9,
      technicalDepth: 9,
      communication: 8,
      culturalFit: 9
    },
    recommendation: 'Advance to Next Round',
    feedbackNotes: 'Candidate demonstrated exemplary understanding of Java Memory Management, Collections, and SQL window functions. Live coding solution for cycle detection was completed in 12 minutes with clean variable naming.'
  },
  {
    id: 'eval-2',
    candidateId: 'cand-102',
    candidateName: 'Ananya Sharma',
    companyName: 'TCS',
    round: 'Managerial Round',
    evaluatorName: 'Rajesh Nair (Delivery Manager)',
    date: '2026-10-17',
    rubrics: {
      problemSolving: 8,
      technicalDepth: 8,
      communication: 9,
      culturalFit: 9
    },
    recommendation: 'Advance to Next Round',
    feedbackNotes: 'Excellently structured response using STAR methodology when asked about project deadline roadblocks. High team maturity.'
  },
  {
    id: 'eval-3',
    candidateId: 'cand-104',
    candidateName: 'Karan Verma',
    companyName: 'Accenture',
    round: 'Aptitude Assessment',
    evaluatorName: 'System Scoring Engine',
    date: '2026-10-15',
    rubrics: {
      problemSolving: 5,
      technicalDepth: 6,
      communication: 6,
      culturalFit: 7
    },
    recommendation: 'Eliminate',
    feedbackNotes: 'Quantitative reasoning percentile: 52%. Verbal: 71%. Failed sectional cutoff threshold.'
  }
];

export const INITIAL_STAKEHOLDER_FEEDBACK = [
  {
    id: 'fb-role-1',
    role: 'Student',
    author: 'Priyansh Jain (2028 Batch)',
    companyName: 'HCLTech',
    driveName: 'Graduate Engineer Trainee 2026-28',
    rating: 5,
    roundDiscussed: 'Technical Interview',
    feedback: 'The live coding interface and interviewer were very fair. Focused heavily on core fundamentals rather than rote trivia. Having previous drive insights from PlacePrep helped me anticipate the SQL and OOP deep-dives.',
    date: '2026-10-18'
  },
  {
    id: 'fb-role-2',
    role: 'TPO',
    author: 'Dr. R.K. Swaminathan (Head - Placement Cell, DTU)',
    companyName: 'TCS & HCLTech',
    driveName: 'Campus Hiring Season 2026',
    rating: 5,
    roundDiscussed: 'Selection Workflow & Coordination',
    feedback: 'The round-wise candidate tracking and automated shortlisting engine has saved our placement cell over 15 hours of manual spreadsheet reconciliation per drive. Communication with company evaluators was seamless.',
    date: '2026-10-17'
  },
  {
    id: 'fb-role-3',
    role: 'Faculty',
    author: 'Prof. Sunita Deshmukh (Dept. of Computer Engineering)',
    companyName: 'All Companies',
    driveName: 'Curriculum & Pre-Placement Training',
    rating: 5,
    roundDiscussed: 'Aptitude & Technical Alignment',
    feedback: 'Incorporating the 5-Unit Java Fullstack syllabus directly into mock round assessments has drastically boosted student confidence. Students who practiced with the question bank had an 82% clearance rate in technical rounds.',
    date: '2026-10-16'
  },
  {
    id: 'fb-role-4',
    role: 'Company',
    author: 'Mark Henderson (Head of Campus Talent Acquisition, Accenture)',
    companyName: 'Accenture',
    driveName: 'National Talent Drive 2026',
    rating: 5,
    roundDiscussed: 'Candidate Quality & Evaluation Forms',
    feedback: 'The evaluation rubrics and structured candidate scorecards allowed our panel to complete managerial debriefs with zero ambiguity. The students showed remarkable preparation in cloud fundamentals and modern Java.',
    date: '2026-10-14'
  }
];

// Aptitude Questions to enrich the Question Bank knowledge base
export const INITIAL_APTITUDE_QUESTIONS = [
  {
    id: 'apt-01',
    companyId: 'hcltech',
    round: 'aptitude',
    category: 'Quantitative Aptitude',
    difficulty: 'Medium',
    question: 'A train 180 meters long running at 72 km/h crosses a platform in 20 seconds. What is the length of the platform?',
    frequencyScore: 94,
    recencyRating: 'High',
    timesReported: 38,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Speed, Time and Distance', 'Unit Conversion', 'Aptitude Screening'],
    approach: 'Convert speed from km/h to m/s by multiplying by (5/18). Total distance covered = Speed * Time. Total distance = Length of train + Length of platform.',
    suggestedAnswer: `Step 1: Convert speed to m/s:
72 * (5 / 18) = 20 m/s.

Step 2: Calculate total distance covered in 20 seconds:
Distance = Speed * Time = 20 m/s * 20 s = 400 meters.

Step 3: Distance = Length of Train (180m) + Length of Platform (P)
400 = 180 + P
P = 400 - 180 = 220 meters.

Answer: The platform is 220 meters long.`,
    followUps: [
      'How does the formula change if two trains are moving in opposite directions?',
      'What if the train crosses a standing man instead of a platform?'
    ]
  },
  {
    id: 'apt-02',
    companyId: 'tcs',
    round: 'aptitude',
    category: 'Logical Reasoning',
    difficulty: 'Medium',
    question: 'In a certain code, "SPRING" is written as "UNUFRH". How is "MOBILE" written in that same code language?',
    frequencyScore: 91,
    recencyRating: 'High',
    timesReported: 42,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Coding-Decoding', 'Alphabetical Patterns', 'Pattern Recognition'],
    approach: 'Determine character shift values: S (+2) -> U, P (-2) -> N, R (+3) -> U, I (-3) -> F, N (+4) -> R, G (-4) -> C/H. Alternate addition and subtraction increments.',
    suggestedAnswer: `Pattern analysis of S P R I N G:
S (19) + 2 = U (21)
P (16) - 2 = N (14)
R (18) + 3 = U (21)
I (9) - 3 = F (6)
N (14) + 4 = R (18)
G (7) + 1 = H (8)

Applying the identical alternating pattern to M O B I L E:
M (13) + 2 = O (15)
O (15) - 2 = M (13)
B (2) + 3 = E (5)
I (9) - 3 = F (6)
L (12) + 4 = P (16)
E (5) - 4 = A (1)

Result: "OMEFPA"`,
    followUps: [
      'What are common alternative patterns (e.g. reverse alphabetical or ASCII distance)?'
    ]
  }
];
