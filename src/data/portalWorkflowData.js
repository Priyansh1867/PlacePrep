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
export const INITIAL_LIVE_SESSIONS = [];

// 10. Push Notifications System (Placement & TPO broadcast)
export const INITIAL_PUSH_NOTIFICATIONS = [];

// 11. Feedback Loop (Student -> TPO -> Company)
export const INITIAL_FEEDBACK_LOOP = [];
