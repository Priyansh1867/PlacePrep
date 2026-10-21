// PlacePrep - Unified Workflow Dataset (Institute, Placement & Super Admin)
// Grounded in the multi-branch architecture:
// Institute (Teacher, HOD, Students)
// Placement (HR, Director, TPO, Placement Coordinator)
// Super Admin (CRUD all the things)

export const PORTAL_ROLES = {
  INSTITUTE: [
    { id: 'student', label: 'Student', group: 'Institute', description: 'Access academic records, drives, CRT & class attendance, ATS resume, and internships.' },
    { id: 'teacher', label: 'Teacher / Faculty', group: 'Institute', description: 'Monitor class attendance, student CRT performance, and verify ATS resumes.' },
    { id: 'hod', label: 'Head of Department (HOD)', group: 'Institute', description: 'Department-level placement statistics, academic oversight, and student approvals.' }
  ],
  PLACEMENT: [
    { id: 'tpo', label: 'Training & Placement Officer (TPO)', group: 'Placement', description: 'Organize campus drives, publish eligibility criteria, broadcast live sessions & notifications.' },
    { id: 'coordinator', label: 'Placement Coordinator', group: 'Placement', description: 'Coordinate round schedules, verify shortlisted candidates, and manage logistics.' },
    { id: 'hr', label: 'HR / Corporate Recruiter', group: 'Placement', description: 'Post drive openings, conduct candidate evaluations, and submit recruiter feedback.' },
    { id: 'director', label: 'Director / Management', group: 'Placement', description: 'Executive placement analytics, high-level corporate relations, and policy oversight.' }
  ],
  ADMIN: [
    { id: 'super_admin', label: 'Super Admin', group: 'Admin', description: 'Complete Create, Read, Update, Delete (CRUD) authority across all institute and placement data.' }
  ]
};

// 1. CRT (Campus Recruitment Training) Sessions & Attendance
export const INITIAL_CRT_SESSIONS = [
  {
    id: 'crt-01',
    title: 'Quantitative Aptitude & Speed Math Masterclass',
    trainer: 'Prof. Alok Verma (Aptitude Specialist)',
    date: '2026-10-22',
    time: '10:00 AM - 12:00 PM',
    venue: 'Seminar Hall 1 / Online Hybrid',
    module: 'Quantitative Aptitude',
    attendedCount: 184,
    totalEnrolled: 210,
    attendanceRate: 87.6,
    status: 'Upcoming',
    minAttendanceRequired: 75
  },
  {
    id: 'crt-02',
    title: 'Data Structures & Algorithms - Dynamic Programming & Trees',
    trainer: 'Dr. Radhika Sen (Ex-Amazon SDE)',
    date: '2026-10-19',
    time: '02:00 PM - 05:00 PM',
    venue: 'Computer Center Lab 4',
    module: 'Technical Coding',
    attendedCount: 196,
    totalEnrolled: 210,
    attendanceRate: 93.3,
    status: 'Completed',
    minAttendanceRequired: 75
  },
  {
    id: 'crt-03',
    title: 'Mock HR & STAR Method Behavioral Coaching',
    trainer: 'Ms. Sunita Kapoor (Corporate HR Consultant)',
    date: '2026-10-15',
    time: '11:00 AM - 01:00 PM',
    venue: 'Auditorium 2',
    module: 'Soft Skills & Behavioral',
    attendedCount: 172,
    totalEnrolled: 210,
    attendanceRate: 81.9,
    status: 'Completed',
    minAttendanceRequired: 75
  },
  {
    id: 'crt-04',
    title: 'SQL, Indexing & ACID Transactions Deep Dive',
    trainer: 'Prof. Tarun Gupta',
    date: '2026-10-12',
    time: '03:00 PM - 05:00 PM',
    venue: 'Lab 2',
    module: 'Database Engineering',
    attendedCount: 188,
    totalEnrolled: 210,
    attendanceRate: 89.5,
    status: 'Completed',
    minAttendanceRequired: 75
  }
];

export const INITIAL_STUDENT_CRT_ATTENDANCE = {
  studentId: 'user-demo-01',
  studentName: 'Priyansh Jain',
  rollNumber: '2024/CSE/084',
  totalClassesHeld: 24,
  attendedClasses: 21,
  percentage: 87.5,
  eligibilityStatus: 'Eligible for Campus Drives', // >= 75%
  warningIssued: false,
  records: [
    { sessionId: 'crt-02', title: 'Data Structures & Algorithms', date: '2026-10-19', status: 'Present' },
    { sessionId: 'crt-03', title: 'Mock HR & STAR Method', date: '2026-10-15', status: 'Present' },
    { sessionId: 'crt-04', title: 'SQL & Database Engineering', date: '2026-10-12', status: 'Present' },
    { sessionId: 'crt-05', title: 'Verbal Ability & Comprehension', date: '2026-10-08', status: 'Absent' },
    { sessionId: 'crt-06', title: 'System Design Fundamentals', date: '2026-10-04', status: 'Present' }
  ]
};

// 2. Class Attendance (Academic Subjects)
export const INITIAL_CLASS_ATTENDANCE = [
  { subjectCode: 'CS207', subjectName: 'Database Management Systems', teacher: 'Dr. Neha Sharma', totalClasses: 36, attended: 32, percentage: 88.9, status: 'Good' },
  { subjectCode: 'CS208', subjectName: 'Operating Systems & System Programming', teacher: 'Prof. R. K. Mukherjee', totalClasses: 34, attended: 29, percentage: 85.3, status: 'Good' },
  { subjectCode: 'CS206', subjectName: 'Design & Analysis of Algorithms', teacher: 'Dr. Vivek Anand', totalClasses: 40, attended: 36, percentage: 90.0, status: 'Excellent' },
  { subjectCode: 'CS202', subjectName: 'Object Oriented Programming with Java', teacher: 'Prof. S. Mehra', totalClasses: 38, attended: 35, percentage: 92.1, status: 'Excellent' },
  { subjectCode: 'CS209', subjectName: 'Computer Networks', teacher: 'Dr. Ananya Roy', totalClasses: 32, attended: 25, percentage: 78.1, status: 'Average' }
];

// 3. Resume & ATS Review System
export const INITIAL_RESUME_STATUS = {
  studentId: 'user-demo-01',
  studentName: 'Priyansh Jain',
  fileName: 'Priyansh_Jain_Resume_2026.pdf',
  uploadedAt: '2026-10-16T11:20:00Z',
  atsScore: 88, // out of 100
  verdict: 'Excellent - Placement Ready',
  verificationStatus: 'Verified by TPO Cell', // 'Pending Review', 'Verified by TPO Cell', 'Revision Required'
  matchedKeywords: [
    'Java', 'Spring Boot', 'REST APIs', 'SQL', 'Data Structures & Algorithms',
    'Microservices', 'Git', 'Maven', 'B-Tree Indexing', 'Docker'
  ],
  missingKeywords: [
    'CI/CD Pipelines', 'AWS / Cloud Deployment', 'Unit Testing (JUnit/Mockito)'
  ],
  sectionsScore: {
    contactInfo: 100,
    education: 95,
    technicalSkills: 90,
    projects: 88,
    workExperience: 82,
    formatting: 92
  },
  tpoFeedback: 'Strong impact verbs and clear GitHub project links. Adding quantifiable metrics (e.g. % performance increase) will push your ATS score above 92.'
};

// 4. Student Round-Wise Live Progress
export const INITIAL_STUDENT_ROUNDS = [
  {
    companyId: 'hcltech',
    companyName: 'HCLTech',
    role: 'Graduate Engineer Trainee',
    currentStage: 'Round 2: Technical Interview',
    overallStatus: 'In Progress',
    stages: [
      { name: 'Online Aptitude & Coding', status: 'Cleared', score: '92%', date: '14 Oct 2026', feedback: 'Top 5 percentile in Speed Math and Bitwise coding.' },
      { name: 'Technical Interview', status: 'Scheduled', slot: '23 Oct 2026, 11:30 AM', meetingLink: 'https://meet.google.com/hcl-prep-slot', panel: 'Vikram Mehta (Tech Lead)' },
      { name: 'Managerial Round', status: 'Pending', slot: 'To be announced' },
      { name: 'HR & Final Verification', status: 'Pending', slot: 'To be announced' }
    ]
  },
  {
    companyId: 'tcs',
    companyName: 'TCS',
    role: 'TCS Digital / Prime',
    currentStage: 'Round 3: Managerial Interview',
    overallStatus: 'Advanced',
    stages: [
      { name: 'TCS NQT Cognitive & Coding', status: 'Cleared', score: '88%', date: '10 Oct 2026', feedback: 'Qualified for Digital Track.' },
      { name: 'Technical Interview', status: 'Cleared', score: '85%', date: '18 Oct 2026', feedback: 'Proficient in Java Multithreading and SQL Joins.' },
      { name: 'Managerial Round', status: 'Scheduled', slot: '24 Oct 2026, 02:30 PM', meetingLink: 'https://tcs.webex.com/meet/tcs-managerial', panel: 'Rajesh Nair (Delivery Head)' },
      { name: 'HR Discussion', status: 'Pending', slot: 'To be announced' }
    ]
  }
];

// 5. Upcoming Hackathons
export const INITIAL_HACKATHONS = [
  {
    id: 'hack-01',
    title: 'Smart India Hackathon (SIH 2026)',
    organizer: 'Ministry of Education & AICTE',
    theme: 'Smart Automation, Healthcare & Fintech',
    mode: 'Hybrid (Campus Round + Grand Finale)',
    teamSize: '6 Members (At least 1 Female member mandatory)',
    registrationDeadline: '2026-11-05',
    eventDates: '28-29 Nov 2026',
    prizePool: '₹1,00,000 per problem statement',
    eligibleBatches: ['2025', '2026', '2027', '2028'],
    registrationUrl: 'https://sih.gov.in',
    status: 'Registrations Open',
    featured: true
  },
  {
    id: 'hack-02',
    title: 'Google Solution Challenge 2027',
    organizer: 'Google Developer Student Clubs (GDSC)',
    theme: 'United Nations 17 Sustainable Development Goals',
    mode: 'Online Global',
    teamSize: '1 to 4 Members',
    registrationDeadline: '2026-11-20',
    eventDates: 'Dec 2026 - Jan 2027',
    prizePool: '$4,000 + Google Mentorship',
    eligibleBatches: ['2026', '2027', '2028', '2029'],
    registrationUrl: 'https://developers.google.com/community/gdsc-solution-challenge',
    status: 'Registrations Open',
    featured: true
  },
  {
    id: 'hack-03',
    title: 'Flipkart GRiD 7.0 - Robotics & Software Track',
    organizer: 'Flipkart Campus Hiring',
    theme: 'High Scale E-Commerce & Autonomous Fulfillment',
    mode: 'Online CodeSprint + National Finale',
    teamSize: '2 to 3 Members',
    registrationDeadline: '2026-10-30',
    eventDates: '15 Nov 2026',
    prizePool: '₹5,00,000 + Direct PPI Interview Calls',
    eligibleBatches: ['2026', '2027', '2028'],
    registrationUrl: 'https://unstop.com/hackathons/flipkart-grid',
    status: 'Closing Soon',
    featured: false
  }
];

// 6. Upcoming Internships
export const INITIAL_INTERNSHIPS = [
  {
    id: 'intern-01',
    companyName: 'Microsoft',
    role: 'Software Engineering Intern (Summer 2027)',
    stipend: '₹1,25,000 / month',
    duration: '2 Months (May - July)',
    location: 'Hyderabad / Bengaluru / Remote',
    eligibleBatches: ['2027', '2028'],
    minCgpa: 8.0,
    branches: ['CSE', 'IT', 'ECE'],
    deadline: '2026-11-15',
    ppoOpportunity: 'Yes - High PPO Conversion Rate (>85%)',
    applicationUrl: 'https://careers.microsoft.com',
    status: 'Actively Hiring'
  },
  {
    id: 'intern-02',
    companyName: 'Goldman Sachs',
    role: 'Summer Analyst - Global Markets & Engineering',
    stipend: '₹1,00,000 / month',
    duration: '8 Weeks',
    location: 'Bengaluru',
    eligibleBatches: ['2027', '2028'],
    minCgpa: 8.0,
    branches: ['CSE', 'IT', 'ECE', 'EEE'],
    deadline: '2026-11-10',
    ppoOpportunity: 'Yes - Pre-Placement Interview (PPI) guaranteed on rating 4+',
    applicationUrl: 'https://goldmansachs.com/careers',
    status: 'Actively Hiring'
  },
  {
    id: 'intern-03',
    companyName: 'DRDO (Centre for AI & Robotics)',
    role: 'Research & Project Intern',
    stipend: '₹25,000 / month (Govt Fellowship)',
    duration: '6 Months',
    location: 'New Delhi / Bengaluru',
    eligibleBatches: ['2026', '2027'],
    minCgpa: 7.5,
    branches: ['CSE', 'IT', 'ECE'],
    deadline: '2026-10-28',
    ppoOpportunity: 'Scientific Project Certificate + Direct Scientist B Screening',
    applicationUrl: 'https://drdo.gov.in',
    status: 'Closing Soon'
  }
];

// 7. Off-Campus Companies (Strictly restricted to Final Year Students)
export const INITIAL_OFF_CAMPUS_COMPANIES = [
  {
    id: 'off-01',
    companyName: 'TCS Off-Campus Pan-India NQT',
    role: 'Systems Engineer & Digital Specialist',
    ctc: '₹3.6 - ₹7.5 LPA',
    batchEligibility: ['2025', '2026'], // Strictly Final Year / Immediate Passout
    isFinalYearOnly: true,
    minCgpa: 6.0,
    allowedBacklogs: 0,
    examDate: '12-14 Nov 2026',
    applicationDeadline: '2026-11-02',
    applyLink: 'https://learning.tcsionhub.in/hub/national-qualifier-test/',
    description: 'National recruitment drive for graduating students across India. Qualifying test scores accepted by 300+ corporate recruiters.',
    status: 'Active'
  },
  {
    id: 'off-02',
    companyName: 'Accenture Off-Campus Drive (Pan-India)',
    role: 'Associate Software Engineer (ASE) & Advanced ASE',
    ctc: '₹4.5 - ₹6.5 LPA',
    batchEligibility: ['2025', '2026'],
    isFinalYearOnly: true,
    minCgpa: 6.5,
    allowedBacklogs: 0,
    examDate: '20-22 Nov 2026',
    applicationDeadline: '2026-11-08',
    applyLink: 'https://indiacampus.accenture.com',
    description: 'Direct entry off-campus hiring for final year BE / B.Tech / MCA candidates with joining in Q1 2027.',
    status: 'Active'
  },
  {
    id: 'off-03',
    companyName: 'Zoho Corporation Off-Campus Hiring',
    role: 'Software Developer (Product Engineering)',
    ctc: '₹6.0 - ₹8.4 LPA',
    batchEligibility: ['2025', '2026'],
    isFinalYearOnly: true,
    minCgpa: 0, // No CGPA cutoff!
    allowedBacklogs: 2,
    examDate: '07 Nov 2026',
    applicationDeadline: '2026-10-31',
    applyLink: 'https://zohocorp.com/careers',
    description: 'Skill-first off-campus programming evaluation. Evaluates raw algorithmic thinking without 10th/12th/CGPA barriers.',
    status: 'Active'
  }
];

// 8. Company-Wise Eligibility Criteria Matrix (Placement Pillar)
export const INITIAL_ELIGIBILITY_CRITERIA_MATRIX = [
  {
    companyId: 'hcltech',
    companyName: 'HCLTech',
    role: 'Graduate Engineer Trainee',
    min10th: 65,
    min12th: 65,
    minCgpa: 6.5,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    gapYearsAllowed: 1,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
    eligibleBatches: ['2026', '2027'],
    bondPeriod: '18 Months Service Agreement'
  },
  {
    companyId: 'tcs',
    companyName: 'TCS',
    role: 'TCS Ninja & Digital Cadre',
    min10th: 60,
    min12th: 60,
    minCgpa: 6.0,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    gapYearsAllowed: 2,
    eligibleBranches: ['All Engineering Branches', 'MCA'],
    eligibleBatches: ['2026'],
    bondPeriod: '12 Months'
  },
  {
    companyId: 'infosys',
    companyName: 'Infosys',
    role: 'Systems Engineer & Specialist Programmer',
    min10th: 60,
    min12th: 60,
    minCgpa: 6.0,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    gapYearsAllowed: 1,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE'],
    eligibleBatches: ['2026', '2027'],
    bondPeriod: '12 Months'
  },
  {
    companyId: 'deloitte',
    companyName: 'Deloitte',
    role: 'Analyst - Technology Consulting',
    min10th: 65,
    min12th: 65,
    minCgpa: 7.0,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    gapYearsAllowed: 0,
    eligibleBranches: ['CSE', 'IT', 'ECE'],
    eligibleBatches: ['2026'],
    bondPeriod: 'None'
  }
];

// 9. Live Pre-Placement & Corporate Sessions (Placement Pillar)
export const INITIAL_LIVE_SESSIONS = [
  {
    id: 'live-01',
    companyName: 'HCLTech',
    title: 'Pre-Placement Talk (PPT) & Technical Expectations Briefing',
    speaker: 'Mr. Arvind Saxena (Senior Director - Talent Acquisition)',
    date: '2026-10-22',
    time: '04:00 PM - 05:30 PM',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/hcl-campus-ppt-2026',
    eligibleBatches: ['2026', '2027', '2028'],
    rsvpsCount: 248,
    isLiveNow: false,
    status: 'Scheduled',
    agenda: 'Overview of HCLTech Engineering services, salary structure, round 1 syllabus, and live Q&A.'
  },
  {
    id: 'live-02',
    companyName: 'TCS',
    title: 'Mastering TCS Digital: Advanced Coding & System Scenarios',
    speaker: 'Er. Deepak Verma (Principal Architect, TCS Digital)',
    date: '2026-10-24',
    time: '06:00 PM - 07:30 PM',
    platform: 'MS Teams',
    joinUrl: 'https://teams.microsoft.com/l/meetup-join/tcs-digital-webinar',
    eligibleBatches: ['2026', '2027'],
    rsvpsCount: 312,
    isLiveNow: false,
    status: 'Scheduled',
    agenda: 'Live demonstration of competitive coding challenges, edge test cases, and managerial round nuances.'
  },
  {
    id: 'live-03',
    companyName: 'Deloitte',
    title: 'Consulting Case Studies & STAR Interview Strategy',
    speaker: 'Ms. Malini Iyer (Consulting Lead, Deloitte USI)',
    date: '2026-10-26',
    time: '03:00 PM - 04:30 PM',
    platform: 'Zoom Video',
    joinUrl: 'https://zoom.us/j/deloitte-case-study-masterclass',
    eligibleBatches: ['2026'],
    rsvpsCount: 195,
    isLiveNow: false,
    status: 'Scheduled',
    agenda: 'Case study solving technique, business communication, and interview dos & don\'ts.'
  }
];

// 10. Push Notifications System (Placement & TPO broadcast)
export const INITIAL_PUSH_NOTIFICATIONS = [
  {
    id: 'notif-01',
    title: 'HCLTech Round 2 Technical Slots Released',
    message: 'Shortlisted candidates for HCLTech have been allotted interview slots for Oct 23. Check your Round Details tab.',
    category: 'Drive Update',
    priority: 'High',
    targetAudience: 'Shortlisted Students',
    timestamp: '10 mins ago',
    date: '2026-10-21',
    read: false,
    actionRoute: 'workflow'
  },
  {
    id: 'notif-02',
    title: 'Mandatory CRT Attendance Warning',
    message: 'Students with CRT attendance below 75% will not be nominated for upcoming Deloitte & TCS drives. Attend tomorrow\'s session.',
    category: 'Attendance Alert',
    priority: 'Urgent',
    targetAudience: 'All Final & Pre-Final Students',
    timestamp: '2 hours ago',
    date: '2026-10-21',
    read: false,
    actionRoute: 'institute-crt'
  },
  {
    id: 'notif-03',
    title: 'Smart India Hackathon (SIH 2026) Internal Screening',
    message: 'Internal college team registration closes in 5 days. Form teams of 6 and submit synopses via the Institute Hackathons tab.',
    category: 'Hackathon',
    priority: 'Medium',
    targetAudience: 'All Engineering Batches',
    timestamp: 'Yesterday',
    date: '2026-10-20',
    read: true,
    actionRoute: 'institute-hackathons'
  },
  {
    id: 'notif-04',
    title: 'Pre-Placement Talk Today at 04:00 PM',
    message: 'HCLTech Corporate Leadership PPT will commence at 4:00 PM on Google Meet. Joining link is active in Live Sessions.',
    category: 'Live Session',
    priority: 'High',
    targetAudience: 'Eligible Students',
    timestamp: '1 day ago',
    date: '2026-10-20',
    read: true,
    actionRoute: 'placement-live'
  }
];

// 11. Feedback Loop (Student -> TPO -> Company)
export const INITIAL_FEEDBACK_LOOP = [
  {
    id: 'fbl-01',
    companyName: 'HCLTech',
    driveDate: 'October 2026',
    studentRatingAvg: 4.6,
    studentFeedbackSummary: 'Questions were strictly focused on Data Structures, OOP, and Spring Boot. Evaluators were supportive and provided helpful hints.',
    tpoAssessment: 'Smooth logistics. 84% candidate turnout. Code test platform worked without glitches.',
    companyRecruiterRating: 4.8,
    companyRecruiterComments: 'Candidates demonstrated exceptional clarity on JVM memory concepts and practical SQL joins. Recommending higher intake quota next season.',
    status: 'Shared with Recruiter & Dean'
  },
  {
    id: 'fbl-02',
    companyName: 'TCS',
    driveDate: 'September 2026',
    studentRatingAvg: 4.2,
    studentFeedbackSummary: 'Aptitude section was time-constrained. Advanced coding questions required strong dynamic programming skills.',
    tpoAssessment: 'Recommended students take extra CRT speed-math drills before next TCS cycle.',
    companyRecruiterRating: 4.5,
    companyRecruiterComments: 'Strong foundational skills. Soft skills in managerial round could be polished with more mock interviews.',
    status: 'Shared with TPO Committee'
  }
];
