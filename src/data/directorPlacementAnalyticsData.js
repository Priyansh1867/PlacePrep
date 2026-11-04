// PlacePrep - Director Placement Analytics Dataset
// Company-wise & Round-wise Placement Funnel Tracking
// Clearly distinguished as analytical demo/monitoring dataset

export const RECRUITMENT_ROUNDS = [
  { roundNumber: 1, name: 'Registration / Application', key: 'registration' },
  { roundNumber: 2, name: 'Online Assessment', key: 'assessment' },
  { roundNumber: 3, name: 'Technical Interview – Round 1', key: 'tech1' },
  { roundNumber: 4, name: 'Technical Interview – Round 2', key: 'tech2' },
  { roundNumber: 5, name: 'HR Interview', key: 'hr' },
  { roundNumber: 6, name: 'Final Selection', key: 'final' }
];

export const DIRECTOR_COMPANY_ANALYTICS = [
  {
    id: 'tcs',
    companyName: 'Tata Consultancy Services',
    role: 'Ninja & Digital SDE',
    ctc: '₹3.60 - ₹7.20 LPA',
    batch: '2025',
    driveDate: '2025-03-12',
    status: 'Completed',
    totalRegistered: 220,
    appeared: 220,
    selected: 34,
    rejected: 170,
    inProcess: 16,
    finalSelected: 34,
    rounds: [
      {
        roundNumber: 1,
        name: 'Registration / Application',
        appeared: 220,
        selectedNextRound: 165,
        rejected: 50,
        pending: 5,
        selectionRate: 75.0,
        rejectionRate: 22.7
      },
      {
        roundNumber: 2,
        name: 'Online Assessment',
        appeared: 165,
        selectedNextRound: 95,
        rejected: 65,
        pending: 5,
        selectionRate: 57.6,
        rejectionRate: 39.4
      },
      {
        roundNumber: 3,
        name: 'Technical Interview – Round 1',
        appeared: 95,
        selectedNextRound: 60,
        rejected: 32,
        pending: 3,
        selectionRate: 63.2,
        rejectionRate: 33.7
      },
      {
        roundNumber: 4,
        name: 'Technical Interview – Round 2',
        appeared: 60,
        selectedNextRound: 42,
        rejected: 16,
        pending: 2,
        selectionRate: 70.0,
        rejectionRate: 26.7
      },
      {
        roundNumber: 5,
        name: 'HR Interview',
        appeared: 42,
        selectedNextRound: 36,
        rejected: 5,
        pending: 1,
        selectionRate: 85.7,
        rejectionRate: 11.9
      },
      {
        roundNumber: 6,
        name: 'Final Selection',
        appeared: 36,
        selectedNextRound: 34,
        rejected: 2,
        pending: 0,
        selectionRate: 94.4,
        rejectionRate: 5.6
      }
    ]
  },
  {
    id: 'infosys',
    companyName: 'Infosys',
    role: 'Specialist Programmer & SE',
    ctc: '₹9.50 LPA',
    batch: '2025',
    driveDate: '2025-03-18',
    status: 'Completed',
    totalRegistered: 180,
    appeared: 180,
    selected: 22,
    rejected: 142,
    inProcess: 16,
    finalSelected: 22,
    rounds: [
      {
        roundNumber: 1,
        name: 'Registration / Application',
        appeared: 180,
        selectedNextRound: 130,
        rejected: 45,
        pending: 5,
        selectionRate: 72.2,
        rejectionRate: 25.0
      },
      {
        roundNumber: 2,
        name: 'Online Assessment',
        appeared: 130,
        selectedNextRound: 70,
        rejected: 55,
        pending: 5,
        selectionRate: 53.8,
        rejectionRate: 42.3
      },
      {
        roundNumber: 3,
        name: 'Technical Interview – Round 1',
        appeared: 70,
        selectedNextRound: 42,
        rejected: 25,
        pending: 3,
        selectionRate: 60.0,
        rejectionRate: 35.7
      },
      {
        roundNumber: 4,
        name: 'Technical Interview – Round 2',
        appeared: 42,
        selectedNextRound: 28,
        rejected: 12,
        pending: 2,
        selectionRate: 66.7,
        rejectionRate: 28.6
      },
      {
        roundNumber: 5,
        name: 'HR Interview',
        appeared: 28,
        selectedNextRound: 24,
        rejected: 3,
        pending: 1,
        selectionRate: 85.7,
        rejectionRate: 10.7
      },
      {
        roundNumber: 6,
        name: 'Final Selection',
        appeared: 24,
        selectedNextRound: 22,
        rejected: 2,
        pending: 0,
        selectionRate: 91.7,
        rejectionRate: 8.3
      }
    ]
  },
  {
    id: 'wipro',
    companyName: 'Wipro',
    role: 'Turbo & Elite Developer',
    ctc: '₹6.50 LPA',
    batch: '2025',
    driveDate: '2025-03-22',
    status: 'In Progress',
    totalRegistered: 160,
    appeared: 160,
    selected: 19,
    rejected: 123,
    inProcess: 18,
    finalSelected: 19,
    rounds: [
      {
        roundNumber: 1,
        name: 'Registration / Application',
        appeared: 160,
        selectedNextRound: 120,
        rejected: 35,
        pending: 5,
        selectionRate: 75.0,
        rejectionRate: 21.9
      },
      {
        roundNumber: 2,
        name: 'Online Assessment',
        appeared: 120,
        selectedNextRound: 64,
        rejected: 50,
        pending: 6,
        selectionRate: 53.3,
        rejectionRate: 41.7
      },
      {
        roundNumber: 3,
        name: 'Technical Interview – Round 1',
        appeared: 64,
        selectedNextRound: 38,
        rejected: 22,
        pending: 4,
        selectionRate: 59.4,
        rejectionRate: 34.4
      },
      {
        roundNumber: 4,
        name: 'Technical Interview – Round 2',
        appeared: 38,
        selectedNextRound: 26,
        rejected: 10,
        pending: 2,
        selectionRate: 68.4,
        rejectionRate: 26.3
      },
      {
        roundNumber: 5,
        name: 'HR Interview',
        appeared: 26,
        selectedNextRound: 20,
        rejected: 5,
        pending: 1,
        selectionRate: 76.9,
        rejectionRate: 19.2
      },
      {
        roundNumber: 6,
        name: 'Final Selection',
        appeared: 20,
        selectedNextRound: 19,
        rejected: 1,
        pending: 0,
        selectionRate: 95.0,
        rejectionRate: 5.0
      }
    ]
  },
  {
    id: 'accenture',
    companyName: 'Accenture',
    role: 'Advanced App Engineering Analyst',
    ctc: '₹4.50 - ₹6.50 LPA',
    batch: '2025',
    driveDate: '2025-03-25',
    status: 'Completed',
    totalRegistered: 240,
    appeared: 240,
    selected: 40,
    rejected: 183,
    inProcess: 17,
    finalSelected: 40,
    rounds: [
      {
        roundNumber: 1,
        name: 'Registration / Application',
        appeared: 240,
        selectedNextRound: 180,
        rejected: 55,
        pending: 5,
        selectionRate: 75.0,
        rejectionRate: 22.9
      },
      {
        roundNumber: 2,
        name: 'Online Assessment',
        appeared: 180,
        selectedNextRound: 105,
        rejected: 70,
        pending: 5,
        selectionRate: 58.3,
        rejectionRate: 38.9
      },
      {
        roundNumber: 3,
        name: 'Technical Interview – Round 1',
        appeared: 105,
        selectedNextRound: 68,
        rejected: 33,
        pending: 4,
        selectionRate: 64.8,
        rejectionRate: 31.4
      },
      {
        roundNumber: 4,
        name: 'Technical Interview – Round 2',
        appeared: 68,
        selectedNextRound: 48,
        rejected: 18,
        pending: 2,
        selectionRate: 70.6,
        rejectionRate: 26.5
      },
      {
        roundNumber: 5,
        name: 'HR Interview',
        appeared: 48,
        selectedNextRound: 42,
        rejected: 5,
        pending: 1,
        selectionRate: 87.5,
        rejectionRate: 10.4
      },
      {
        roundNumber: 6,
        name: 'Final Selection',
        appeared: 42,
        selectedNextRound: 40,
        rejected: 2,
        pending: 0,
        selectionRate: 95.2,
        rejectionRate: 4.8
      }
    ]
  },
  {
    id: 'capgemini',
    companyName: 'Capgemini',
    role: 'Senior Analyst & Cloud Engineer',
    ctc: '₹7.50 LPA',
    batch: '2025',
    driveDate: '2025-04-02',
    status: 'In Progress',
    totalRegistered: 150,
    appeared: 150,
    selected: 18,
    rejected: 117,
    inProcess: 15,
    finalSelected: 18,
    rounds: [
      {
        roundNumber: 1,
        name: 'Registration / Application',
        appeared: 150,
        selectedNextRound: 110,
        rejected: 36,
        pending: 4,
        selectionRate: 73.3,
        rejectionRate: 24.0
      },
      {
        roundNumber: 2,
        name: 'Online Assessment',
        appeared: 110,
        selectedNextRound: 60,
        rejected: 45,
        pending: 5,
        selectionRate: 54.5,
        rejectionRate: 40.9
      },
      {
        roundNumber: 3,
        name: 'Technical Interview – Round 1',
        appeared: 60,
        selectedNextRound: 36,
        rejected: 21,
        pending: 3,
        selectionRate: 60.0,
        rejectionRate: 35.0
      },
      {
        roundNumber: 4,
        name: 'Technical Interview – Round 2',
        appeared: 36,
        selectedNextRound: 24,
        rejected: 10,
        pending: 2,
        selectionRate: 66.7,
        rejectionRate: 27.8
      },
      {
        roundNumber: 5,
        name: 'HR Interview',
        appeared: 24,
        selectedNextRound: 20,
        rejected: 3,
        pending: 1,
        selectionRate: 83.3,
        rejectionRate: 12.5
      },
      {
        roundNumber: 6,
        name: 'Final Selection',
        appeared: 20,
        selectedNextRound: 18,
        rejected: 2,
        pending: 0,
        selectionRate: 90.0,
        rejectionRate: 10.0
      }
    ]
  },
  {
    id: 'cognizant',
    companyName: 'Cognizant',
    role: 'GenC Elevate & Next SDE',
    ctc: '₹6.75 LPA',
    batch: '2025',
    driveDate: '2025-04-08',
    status: 'In Progress',
    totalRegistered: 175,
    appeared: 175,
    selected: 24,
    rejected: 134,
    inProcess: 17,
    finalSelected: 24,
    rounds: [
      {
        roundNumber: 1,
        name: 'Registration / Application',
        appeared: 175,
        selectedNextRound: 125,
        rejected: 44,
        pending: 6,
        selectionRate: 71.4,
        rejectionRate: 25.1
      },
      {
        roundNumber: 2,
        name: 'Online Assessment',
        appeared: 125,
        selectedNextRound: 72,
        rejected: 48,
        pending: 5,
        selectionRate: 57.6,
        rejectionRate: 38.4
      },
      {
        roundNumber: 3,
        name: 'Technical Interview – Round 1',
        appeared: 72,
        selectedNextRound: 44,
        rejected: 25,
        pending: 3,
        selectionRate: 61.1,
        rejectionRate: 34.7
      },
      {
        roundNumber: 4,
        name: 'Technical Interview – Round 2',
        appeared: 44,
        selectedNextRound: 30,
        rejected: 12,
        pending: 2,
        selectionRate: 68.2,
        rejectionRate: 27.3
      },
      {
        roundNumber: 5,
        name: 'HR Interview',
        appeared: 30,
        selectedNextRound: 25,
        rejected: 4,
        pending: 1,
        selectionRate: 83.3,
        rejectionRate: 13.3
      },
      {
        roundNumber: 6,
        name: 'Final Selection',
        appeared: 25,
        selectedNextRound: 24,
        rejected: 1,
        pending: 0,
        selectionRate: 96.0,
        rejectionRate: 4.0
      }
    ]
  },
  {
    id: 'hcltech',
    companyName: 'HCLTech',
    role: 'Software Engineer Graduate',
    ctc: '₹5.50 LPA',
    batch: '2025',
    driveDate: '2025-04-14',
    status: 'In Progress',
    totalRegistered: 140,
    appeared: 140,
    selected: 16,
    rejected: 108,
    inProcess: 16,
    finalSelected: 16,
    rounds: [
      {
        roundNumber: 1,
        name: 'Registration / Application',
        appeared: 140,
        selectedNextRound: 100,
        rejected: 35,
        pending: 5,
        selectionRate: 71.4,
        rejectionRate: 25.0
      },
      {
        roundNumber: 2,
        name: 'Online Assessment',
        appeared: 100,
        selectedNextRound: 55,
        rejected: 40,
        pending: 5,
        selectionRate: 55.0,
        rejectionRate: 40.0
      },
      {
        roundNumber: 3,
        name: 'Technical Interview – Round 1',
        appeared: 55,
        selectedNextRound: 32,
        rejected: 20,
        pending: 3,
        selectionRate: 58.2,
        rejectionRate: 36.4
      },
      {
        roundNumber: 4,
        name: 'Technical Interview – Round 2',
        appeared: 32,
        selectedNextRound: 22,
        rejected: 8,
        pending: 2,
        selectionRate: 68.8,
        rejectionRate: 25.0
      },
      {
        roundNumber: 5,
        name: 'HR Interview',
        appeared: 22,
        selectedNextRound: 17,
        rejected: 4,
        pending: 1,
        selectionRate: 77.3,
        rejectionRate: 18.2
      },
      {
        roundNumber: 6,
        name: 'Final Selection',
        appeared: 17,
        selectedNextRound: 16,
        rejected: 1,
        pending: 0,
        selectionRate: 94.1,
        rejectionRate: 5.9
      }
    ]
  },
  {
    id: 'deloitte',
    companyName: 'Deloitte',
    role: 'Associate Solution Advisor',
    ctc: '₹8.50 LPA',
    batch: '2025',
    driveDate: '2025-04-20',
    status: 'Active Evaluation',
    totalRegistered: 190,
    appeared: 190,
    selected: 23,
    rejected: 150,
    inProcess: 17,
    finalSelected: 23,
    rounds: [
      {
        roundNumber: 1,
        name: 'Registration / Application',
        appeared: 190,
        selectedNextRound: 135,
        rejected: 50,
        pending: 5,
        selectionRate: 71.1,
        rejectionRate: 26.3
      },
      {
        roundNumber: 2,
        name: 'Online Assessment',
        appeared: 135,
        selectedNextRound: 75,
        rejected: 54,
        pending: 6,
        selectionRate: 55.6,
        rejectionRate: 40.0
      },
      {
        roundNumber: 3,
        name: 'Technical Interview – Round 1',
        appeared: 75,
        selectedNextRound: 45,
        rejected: 27,
        pending: 3,
        selectionRate: 60.0,
        rejectionRate: 36.0
      },
      {
        roundNumber: 4,
        name: 'Technical Interview – Round 2',
        appeared: 45,
        selectedNextRound: 30,
        rejected: 13,
        pending: 2,
        selectionRate: 66.7,
        rejectionRate: 28.9
      },
      {
        roundNumber: 5,
        name: 'HR Interview',
        appeared: 30,
        selectedNextRound: 25,
        rejected: 4,
        pending: 1,
        selectionRate: 83.3,
        rejectionRate: 13.3
      },
      {
        roundNumber: 6,
        name: 'Final Selection',
        appeared: 25,
        selectedNextRound: 23,
        rejected: 2,
        pending: 0,
        selectionRate: 92.0,
        rejectionRate: 8.0
      }
    ]
  }
];

// Sample candidates across companies for detailed modal drilldown
export const ANALYTICS_CANDIDATE_DETAILS = [
  // TCS Candidates
  {
    id: 'cand-tcs-001',
    studentName: 'Aarav Sharma',
    rollNumber: '2025/CSE/042',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services',
    role: 'Ninja & Digital SDE',
    currentRound: 'Final Selection',
    scores: { assessment: 92, technical: 88, hr: 95 },
    status: 'Selected',
    remarks: 'Exceptional DSA coding & system design. Recommended for Digital profile offer.'
  },
  {
    id: 'cand-tcs-002',
    studentName: 'Ananya Verma',
    rollNumber: '2025/IT/018',
    branch: 'Information Technology',
    batch: '2025',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services',
    role: 'Ninja & Digital SDE',
    currentRound: 'Final Selection',
    scores: { assessment: 85, technical: 82, hr: 90 },
    status: 'Selected',
    remarks: 'Strong cloud architecture understanding, clear verbal articulation.'
  },
  {
    id: 'cand-tcs-003',
    studentName: 'Rohan Gupta',
    rollNumber: '2025/ECE/077',
    branch: 'Electronics and Communication',
    batch: '2025',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services',
    role: 'Ninja & Digital SDE',
    currentRound: 'Technical Interview – Round 2',
    scores: { assessment: 78, technical: 70, hr: null },
    status: 'In Process',
    remarks: 'Cleared Tech 1 smoothly; Tech 2 interview panel feedback pending submission.'
  },
  {
    id: 'cand-tcs-004',
    studentName: 'Priya Nair',
    rollNumber: '2025/CSE/104',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services',
    role: 'Ninja & Digital SDE',
    currentRound: 'Online Assessment',
    scores: { assessment: 58, technical: null, hr: null },
    status: 'Rejected',
    remarks: 'Did not meet the mandatory 70% threshold in advanced coding module.'
  },

  // Infosys Candidates
  {
    id: 'cand-inf-001',
    studentName: 'Devansh Kulkarni',
    rollNumber: '2025/CSE/011',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'infosys',
    companyName: 'Infosys',
    role: 'Specialist Programmer & SE',
    currentRound: 'Final Selection',
    scores: { assessment: 96, technical: 94, hr: 92 },
    status: 'Selected',
    remarks: 'Ranked top 1% in InfyTQ coding challenge. Outstanding algorithms depth.'
  },
  {
    id: 'cand-inf-002',
    studentName: 'Sneha Patel',
    rollNumber: '2025/IT/045',
    branch: 'Information Technology',
    batch: '2025',
    companyId: 'infosys',
    companyName: 'Infosys',
    role: 'Specialist Programmer & SE',
    currentRound: 'HR Interview',
    scores: { assessment: 88, technical: 84, hr: 80 },
    status: 'In Process',
    remarks: 'Strong technical presentation; HR verification in progress.'
  },
  {
    id: 'cand-inf-003',
    studentName: 'Aditya Deshmukh',
    rollNumber: '2025/EE/032',
    branch: 'Electrical and Electronics',
    batch: '2025',
    companyId: 'infosys',
    companyName: 'Infosys',
    role: 'Specialist Programmer & SE',
    currentRound: 'Technical Interview – Round 1',
    scores: { assessment: 80, technical: 52, hr: null },
    status: 'Rejected',
    remarks: 'Struggled with tree traversal algorithms and OOP design patterns.'
  },

  // Wipro Candidates
  {
    id: 'cand-wip-001',
    studentName: 'Kavita Sundaram',
    rollNumber: '2025/CSE/056',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'wipro',
    companyName: 'Wipro',
    role: 'Turbo & Elite Developer',
    currentRound: 'Final Selection',
    scores: { assessment: 89, technical: 86, hr: 88 },
    status: 'Selected',
    remarks: 'Selected for Elite Developer track with premium project deployment.'
  },
  {
    id: 'cand-wip-002',
    studentName: 'Vikram Joshi',
    rollNumber: '2025/IT/029',
    branch: 'Information Technology',
    batch: '2025',
    companyId: 'wipro',
    companyName: 'Wipro',
    role: 'Turbo & Elite Developer',
    currentRound: 'Technical Interview – Round 2',
    scores: { assessment: 82, technical: 79, hr: null },
    status: 'In Process',
    remarks: 'Managerial tech evaluation underway. Demonstrated strong REST API experience.'
  },
  {
    id: 'cand-wip-003',
    studentName: 'Meera Menon',
    rollNumber: '2025/ECE/014',
    branch: 'Electronics and Communication',
    batch: '2025',
    companyId: 'wipro',
    companyName: 'Wipro',
    role: 'Turbo & Elite Developer',
    currentRound: 'Online Assessment',
    scores: { assessment: 61, technical: null, hr: null },
    status: 'Rejected',
    remarks: 'Aptitude quantitative cutoff not attained.'
  },

  // Accenture Candidates
  {
    id: 'cand-acc-001',
    studentName: 'Rahul Singhania',
    rollNumber: '2025/CSE/007',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'accenture',
    companyName: 'Accenture',
    role: 'Advanced App Engineering Analyst',
    currentRound: 'Final Selection',
    scores: { assessment: 94, technical: 91, hr: 90 },
    status: 'Selected',
    remarks: 'Advanced App Engineering role confirmed. Strong full-stack expertise.'
  },
  {
    id: 'cand-acc-002',
    studentName: 'Pooja Bhatnagar',
    rollNumber: '2025/IT/062',
    branch: 'Information Technology',
    batch: '2025',
    companyId: 'accenture',
    companyName: 'Accenture',
    role: 'Advanced App Engineering Analyst',
    currentRound: 'Final Selection',
    scores: { assessment: 88, technical: 85, hr: 89 },
    status: 'Selected',
    remarks: 'Cleared with distinction in behavioral and agile methodology rounds.'
  },
  {
    id: 'cand-acc-003',
    studentName: 'Harsh Vardhan',
    rollNumber: '2025/ME/040',
    branch: 'Mechanical Engineering',
    batch: '2025',
    companyId: 'accenture',
    companyName: 'Accenture',
    role: 'Advanced App Engineering Analyst',
    currentRound: 'Technical Interview – Round 1',
    scores: { assessment: 79, technical: 72, hr: null },
    status: 'In Process',
    remarks: 'Eligible non-CS candidate; evaluated well on analytical logic.'
  },

  // Capgemini Candidates
  {
    id: 'cand-cap-001',
    studentName: 'Tanvi Saxena',
    rollNumber: '2025/CSE/089',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'capgemini',
    companyName: 'Capgemini',
    role: 'Senior Analyst & Cloud Engineer',
    currentRound: 'Final Selection',
    scores: { assessment: 91, technical: 88, hr: 94 },
    status: 'Selected',
    remarks: 'Offered Senior Analyst Cloud track. High marks in pseudo-code & AWS fundamentals.'
  },
  {
    id: 'cand-cap-002',
    studentName: 'Nikhil Rathi',
    rollNumber: '2025/ECE/052',
    branch: 'Electronics and Communication',
    batch: '2025',
    companyId: 'capgemini',
    companyName: 'Capgemini',
    role: 'Senior Analyst & Cloud Engineer',
    currentRound: 'HR Interview',
    scores: { assessment: 84, technical: 80, hr: 78 },
    status: 'In Process',
    remarks: 'HR documentation review pending final offer rollout.'
  },

  // Cognizant Candidates
  {
    id: 'cand-cog-001',
    studentName: 'Isha Reddy',
    rollNumber: '2025/CSE/023',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'cognizant',
    companyName: 'Cognizant',
    role: 'GenC Elevate & Next SDE',
    currentRound: 'Final Selection',
    scores: { assessment: 93, technical: 89, hr: 92 },
    status: 'Selected',
    remarks: 'Elevate tier offer verified. Excellent capability in Spring Boot & Microservices.'
  },
  {
    id: 'cand-cog-002',
    studentName: 'Siddharth Sen',
    rollNumber: '2025/IT/038',
    branch: 'Information Technology',
    batch: '2025',
    companyId: 'cognizant',
    companyName: 'Cognizant',
    role: 'GenC Elevate & Next SDE',
    currentRound: 'Technical Interview – Round 2',
    scores: { assessment: 82, technical: 76, hr: null },
    status: 'In Process',
    remarks: 'Passed live coding; awaiting architectural assessment results.'
  },

  // HCLTech Candidates
  {
    id: 'cand-hcl-001',
    studentName: 'Ritika Basu',
    rollNumber: '2025/CSE/065',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'hcltech',
    companyName: 'HCLTech',
    role: 'Software Engineer Graduate',
    currentRound: 'Final Selection',
    scores: { assessment: 87, technical: 84, hr: 90 },
    status: 'Selected',
    remarks: 'Strong domain expertise in database normalization and SQL optimization.'
  },
  {
    id: 'cand-hcl-002',
    studentName: 'Ayush Trivedi',
    rollNumber: '2025/EE/019',
    branch: 'Electrical and Electronics',
    batch: '2025',
    companyId: 'hcltech',
    companyName: 'HCLTech',
    role: 'Software Engineer Graduate',
    currentRound: 'Technical Interview – Round 1',
    scores: { assessment: 76, technical: 58, hr: null },
    status: 'Rejected',
    remarks: 'Did not clear basic data structures recursion requirements.'
  },

  // Deloitte Candidates
  {
    id: 'cand-del-001',
    studentName: 'Shreya Mukherjee',
    rollNumber: '2025/CSE/003',
    branch: 'Computer Science and Engineering',
    batch: '2025',
    companyId: 'deloitte',
    companyName: 'Deloitte',
    role: 'Associate Solution Advisor',
    currentRound: 'Final Selection',
    scores: { assessment: 95, technical: 92, hr: 96 },
    status: 'Selected',
    remarks: 'Highest composite score in campus drive. Exceptional presentation and case study analysis.'
  },
  {
    id: 'cand-del-002',
    studentName: 'Varun Chopra',
    rollNumber: '2025/IT/051',
    branch: 'Information Technology',
    batch: '2025',
    companyId: 'deloitte',
    companyName: 'Deloitte',
    role: 'Associate Solution Advisor',
    currentRound: 'Final Selection',
    scores: { assessment: 89, technical: 87, hr: 91 },
    status: 'Selected',
    remarks: 'Clear strategic thinker with enterprise tech architecture experience.'
  },
  {
    id: 'cand-del-003',
    studentName: 'Simran Ahuja',
    rollNumber: '2025/ECE/034',
    branch: 'Electronics and Communication',
    batch: '2025',
    companyId: 'deloitte',
    companyName: 'Deloitte',
    role: 'Associate Solution Advisor',
    currentRound: 'HR Interview',
    scores: { assessment: 86, technical: 83, hr: 85 },
    status: 'In Process',
    remarks: 'Final partner interview scheduled.'
  }
];

// Helper to compute summary across all companies
export function getDirectorAnalyticsSummary() {
  const totalCompanies = DIRECTOR_COMPANY_ANALYTICS.length;
  const totalRegistered = DIRECTOR_COMPANY_ANALYTICS.reduce((sum, c) => sum + c.totalRegistered, 0);
  const totalFinallySelected = DIRECTOR_COMPANY_ANALYTICS.reduce((sum, c) => sum + c.finalSelected, 0);
  const totalRejected = DIRECTOR_COMPANY_ANALYTICS.reduce((sum, c) => sum + c.rejected, 0);
  const totalInProcess = DIRECTOR_COMPANY_ANALYTICS.reduce((sum, c) => sum + c.inProcess, 0);
  const overallSelectionRate = totalRegistered > 0
    ? ((totalFinallySelected / totalRegistered) * 100).toFixed(1)
    : '0.0';

  return {
    totalCompanies,
    totalRegistered,
    totalFinallySelected,
    totalRejected,
    totalInProcess,
    overallSelectionRate: `${overallSelectionRate}%`,
    isDemoData: true
  };
}

export function getCompanyPlacementStats(companyId) {
  if (!companyId || companyId === 'ALL') {
    return DIRECTOR_COMPANY_ANALYTICS;
  }
  return DIRECTOR_COMPANY_ANALYTICS.filter(c => c.id === companyId);
}

export function getCompanyDetails(companyId) {
  return DIRECTOR_COMPANY_ANALYTICS.find(c => c.id === companyId) || null;
}

export function getCandidatesForCompany(companyId) {
  if (!companyId || companyId === 'ALL') {
    return ANALYTICS_CANDIDATE_DETAILS;
  }
  return ANALYTICS_CANDIDATE_DETAILS.filter(cand => cand.companyId === companyId);
}
