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
export const INITIAL_CRT_SESSIONS = [];

export const INITIAL_STUDENT_CRT_ATTENDANCE = {"totalClassesHeld":0,"attendedClasses":0,"percentage":null,"eligibilityStatus":"No attendance records","warningIssued":false,"records":[]};

// 2. Class Attendance (Academic Subjects)
export const INITIAL_CLASS_ATTENDANCE = [];

// 3. Resume & ATS Review System
export const INITIAL_RESUME_STATUS = {"atsScore":null,"fileName":"","uploadedAt":null,"verdict":"Not assessed","verificationStatus":"Not submitted","matchedKeywords":[],"missingKeywords":[],"sectionsScore":{},"tpoFeedback":""};

// 4. Student Round-Wise Live Progress
export const INITIAL_STUDENT_ROUNDS = [];

// 5. Upcoming Hackathons
export const INITIAL_HACKATHONS = [];

// 6. Upcoming Internships
export const INITIAL_INTERNSHIPS = [];

// 7. Off-Campus Companies (Strictly restricted to Final Year Students)
export const INITIAL_OFF_CAMPUS_COMPANIES = [];

// 8. Company-Wise Eligibility Criteria Matrix (Placement Pillar)
export const INITIAL_ELIGIBILITY_CRITERIA_MATRIX = [];

// 9. Live Pre-Placement & Corporate Sessions (Placement Pillar)
export const INITIAL_LIVE_SESSIONS = [
  {
    id: 'live-seed-tcs-001',
    sessionId: 'live-seed-tcs-001',
    companyName: 'Tata Consultancy Services',
    title: 'TCS Digital & Prime Engineering Culture & System Design Expectations',
    driveId: 'tcs',
    driveTitle: 'TCS Ninja & Digital SDE Drive',
    sessionType: 'Pre-Placement Talk',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/tcs-ppt-2026',
    date: '2026-11-15',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    time: '11:00 AM – 12:00 PM',
    speaker: 'Karthik Ramanathan (Principal Engineering Director)',
    agenda: 'Overview of TCS Digital recruitment, compensation bands, coding evaluation criteria, and cloud rotation programs.',
    instructions: 'Join 5 minutes prior. Keep your college ID roll number ready for attendance.',
    status: 'Published',
    eligibleStudentsCount: 250,
    notifiedCount: 250,
    rsvpsCount: 148,
    hasRsvp: false,
    isLiveNow: false,
    createdBy: 'Director (Dr. Vikramaditya Sen)',
    createdAt: '2026-11-01 09:30',
    updatedAt: '2026-11-01 09:30',
    auditTrail: [
      {
        action: 'CREATED_AND_PUBLISHED',
        timestamp: '2026-11-01 09:30',
        actor: 'Director (Dr. Vikramaditya Sen)',
        details: 'Published Pre-Placement Talk for Tata Consultancy Services. Dispatched smart notifications to 250 eligible candidates.'
      }
    ]
  },
  {
    id: 'live-seed-inf-002',
    sessionId: 'live-seed-inf-002',
    companyName: 'Infosys',
    title: 'Specialist Programmer Track & Cloud Microservices Orientation',
    driveId: 'infosys',
    driveTitle: 'Infosys Specialist Programmer (₹9.5 LPA)',
    sessionType: 'Company Webinar',
    platform: 'Microsoft Teams',
    joinUrl: 'https://teams.microsoft.com/l/meetup-join/inf-ppt-2026',
    date: '2026-11-18',
    startTime: '02:30 PM',
    endTime: '03:45 PM',
    time: '02:30 PM – 03:45 PM',
    speaker: 'Megha Sen (Head of University Talent Engagement)',
    agenda: 'Interactive demonstration of advanced coding questions, system design interview format, and InfyTQ bridge.',
    instructions: 'Please ensure a stable broadband connection. Q&A session will open in the last 20 minutes.',
    status: 'Published',
    eligibleStudentsCount: 180,
    notifiedCount: 180,
    rsvpsCount: 115,
    hasRsvp: false,
    isLiveNow: false,
    createdBy: 'Director (Dr. Vikramaditya Sen)',
    createdAt: '2026-11-02 10:15',
    updatedAt: '2026-11-02 10:15',
    auditTrail: [
      {
        action: 'CREATED_AND_PUBLISHED',
        timestamp: '2026-11-02 10:15',
        actor: 'Director (Dr. Vikramaditya Sen)',
        details: 'Published Company Webinar for Infosys. Dispatched smart notifications to 180 eligible candidates.'
      }
    ]
  },
  {
    id: 'live-seed-acc-003',
    sessionId: 'live-seed-acc-003',
    companyName: 'Accenture',
    title: 'Advanced App Engineering Analyst Recruitment Walkthrough',
    driveId: 'accenture',
    driveTitle: 'Accenture Advanced App Engineering Analyst (₹6.5 LPA)',
    sessionType: 'Recruitment Orientation',
    platform: 'Zoom',
    joinUrl: 'https://zoom.us/j/9283746152',
    date: '2026-11-22',
    startTime: '10:00 AM',
    endTime: '11:15 AM',
    time: '10:00 AM – 11:15 AM',
    speaker: 'Siddharth Roy (Senior Managing Director, Campus Hiring)',
    agenda: 'Full stack engineering expectations, agile development at Accenture Technology, and case study round preparation.',
    instructions: 'Join via desktop client for live coding demonstration.',
    status: 'Published',
    eligibleStudentsCount: 240,
    notifiedCount: 240,
    rsvpsCount: 192,
    hasRsvp: false,
    isLiveNow: false,
    createdBy: 'Director (Dr. Vikramaditya Sen)',
    createdAt: '2026-11-02 14:00',
    updatedAt: '2026-11-02 14:00',
    auditTrail: [
      {
        action: 'CREATED_AND_PUBLISHED',
        timestamp: '2026-11-02 14:00',
        actor: 'Director (Dr. Vikramaditya Sen)',
        details: 'Published Recruitment Orientation for Accenture. Dispatched smart notifications to 240 eligible candidates.'
      }
    ]
  }
];

// 10. Push Notifications System (Placement & TPO broadcast)
export const INITIAL_PUSH_NOTIFICATIONS = [
  {
    id: 'notif-tcs-ppt-001',
    type: 'LIVE_SESSION_INVITE',
    category: 'Pre-Placement Talk',
    priority: 'High',
    companyName: 'TCS',
    sessionTitle: 'TCS Digital & Prime Engineering Culture & System Design Expectations',
    sessionType: 'Pre-Placement Talk',
    title: 'TCS – Pre-Placement Talk',
    message: 'TCS is conducting a Pre-Placement Talk for eligible candidates.',
    date: '15 November 2026',
    time: '11:00 AM – 12:00 PM',
    platform: 'Google Meet',
    joinUrl: 'https://meet.google.com/tcs-ppt-2026',
    agenda: 'Overview of TCS Digital recruitment, compensation bands, and coding evaluation criteria.',
    associatedDrive: 'TCS Ninja & Digital SDE Drive',
    driveId: 'tcs',
    timestamp: 'Just now',
    read: false,
    actionRoute: 'live-sessions'
  }
];

// 11. Feedback Loop (Student -> TPO -> Company)
export const INITIAL_FEEDBACK_LOOP = [];
