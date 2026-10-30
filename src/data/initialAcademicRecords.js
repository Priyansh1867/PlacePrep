// PlacePrep AI - Team 2: Institute Support
// Initial Seed Data for Student Academic Records

export const INITIAL_BRANCHES = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

export const INITIAL_COURSES = [
  'B.Tech (Bachelor of Technology)',
  'B.E. (Bachelor of Engineering)',
  'BCA (Bachelor of Computer Applications)',
  'Diploma in Engineering'
];

export const GRADING_SYSTEM = [
  { grade: 'O', points: 10, minMarks: 90, maxMarks: 100, label: 'Outstanding' },
  { grade: 'A+', points: 9, minMarks: 80, maxMarks: 89, label: 'Excellent' },
  { grade: 'A', points: 8, minMarks: 70, maxMarks: 79, label: 'Very Good' },
  { grade: 'B+', points: 7, minMarks: 60, maxMarks: 69, label: 'Good' },
  { grade: 'B', points: 6, minMarks: 50, maxMarks: 59, label: 'Above Average' },
  { grade: 'C', points: 5, minMarks: 40, maxMarks: 49, label: 'Pass' },
  { grade: 'F', points: 0, minMarks: 0, maxMarks: 39, label: 'Fail / Backlog' }
];

export const BRANCH_SEMESTER_SUBJECTS = {
  'Computer Science and Engineering': {
    1: [
      { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100 },
      { code: 'PH101', name: 'Engineering Physics', credits: 4, maxMarks: 100 },
      { code: 'CS101', name: 'Problem Solving & Python Programming', credits: 4, maxMarks: 100 },
      { code: 'ME101', name: 'Engineering Graphics & Design', credits: 3, maxMarks: 100 },
      { code: 'EN101', name: 'Technical English & Communication', credits: 2, maxMarks: 100 }
    ],
    2: [
      { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100 },
      { code: 'CH102', name: 'Engineering Chemistry', credits: 4, maxMarks: 100 },
      { code: 'CS102', name: 'Programming in C & Data Structures Basics', credits: 4, maxMarks: 100 },
      { code: 'EE102', name: 'Basic Electrical & Electronics', credits: 3, maxMarks: 100 },
      { code: 'CS102P', name: 'Computing Lab Workshop', credits: 2, maxMarks: 100 }
    ],
    3: [
      { code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, maxMarks: 100 },
      { code: 'CS202', name: 'Object Oriented Programming with Java', credits: 4, maxMarks: 100 },
      { code: 'CS203', name: 'Discrete Mathematics', credits: 4, maxMarks: 100 },
      { code: 'CS204', name: 'Digital Logic and Computer Architecture', credits: 3, maxMarks: 100 },
      { code: 'CS205', name: 'Data Structures Laboratory', credits: 2, maxMarks: 100 }
    ],
    4: [
      { code: 'CS206', name: 'Design and Analysis of Algorithms', credits: 4, maxMarks: 100 },
      { code: 'CS207', name: 'Database Management Systems', credits: 4, maxMarks: 100 },
      { code: 'CS208', name: 'Operating Systems & System Programming', credits: 4, maxMarks: 100 },
      { code: 'CS209', name: 'Theory of Computation & Automata', credits: 3, maxMarks: 100 },
      { code: 'CS210', name: 'DBMS & SQL Laboratory', credits: 2, maxMarks: 100 }
    ],
    5: [
      { code: 'CS301', name: 'Computer Networks and Protocols', credits: 4, maxMarks: 100 },
      { code: 'CS302', name: 'Software Engineering & Agile Methodologies', credits: 4, maxMarks: 100 },
      { code: 'CS303', name: 'Web Technologies & REST APIs', credits: 4, maxMarks: 100 },
      { code: 'CS304', name: 'Compiler Design', credits: 3, maxMarks: 100 },
      { code: 'CS305', name: 'Networking and Web Tech Lab', credits: 2, maxMarks: 100 }
    ],
    6: [
      { code: 'CS306', name: 'Machine Learning & Pattern Recognition', credits: 4, maxMarks: 100 },
      { code: 'CS307', name: 'Information Security & Cryptography', credits: 4, maxMarks: 100 },
      { code: 'CS308', name: 'Cloud Computing & Microservices', credits: 4, maxMarks: 100 },
      { code: 'CS309', name: 'Professional Elective I (Big Data / NLP)', credits: 3, maxMarks: 100 },
      { code: 'CS310', name: 'AI & Machine Learning Lab', credits: 2, maxMarks: 100 }
    ],
    7: [
      { code: 'CS401', name: 'Deep Learning & Neural Networks', credits: 4, maxMarks: 100 },
      { code: 'CS402', name: 'Distributed Systems & Blockchains', credits: 4, maxMarks: 100 },
      { code: 'CS403', name: 'Open Elective II (Cyber Law & Ethics)', credits: 3, maxMarks: 100 },
      { code: 'CS404', name: 'Major Capstone Project Phase I', credits: 4, maxMarks: 100 }
    ],
    8: [
      { code: 'CS405', name: 'Industrial Internship & Practice', credits: 8, maxMarks: 100 },
      { code: 'CS406', name: 'Major Capstone Project Phase II & Viva', credits: 8, maxMarks: 100 }
    ]
  },
  'Information Technology': {
    1: [
      { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100 },
      { code: 'PH101', name: 'Engineering Physics', credits: 4, maxMarks: 100 },
      { code: 'IT101', name: 'Fundamentals of Computing & Logic', credits: 4, maxMarks: 100 },
      { code: 'ME101', name: 'Engineering Graphics', credits: 3, maxMarks: 100 },
      { code: 'EN101', name: 'Communication Skills', credits: 2, maxMarks: 100 }
    ],
    2: [
      { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100 },
      { code: 'CH102', name: 'Environmental Science & Chemistry', credits: 4, maxMarks: 100 },
      { code: 'IT102', name: 'Object Oriented Programming with C++', credits: 4, maxMarks: 100 },
      { code: 'EE102', name: 'Basic Electrical Engineering', credits: 3, maxMarks: 100 },
      { code: 'IT102P', name: 'C++ Programming Lab', credits: 2, maxMarks: 100 }
    ],
    3: [
      { code: 'IT201', name: 'Data Structures and Algorithms', credits: 4, maxMarks: 100 },
      { code: 'IT202', name: 'Computer Organization & Architecture', credits: 4, maxMarks: 100 },
      { code: 'IT203', name: 'Discrete Computational Mathematics', credits: 4, maxMarks: 100 },
      { code: 'IT204', name: 'Web Application Development', credits: 3, maxMarks: 100 },
      { code: 'IT205', name: 'Data Structures Lab', credits: 2, maxMarks: 100 }
    ],
    4: [
      { code: 'IT206', name: 'Database Engineering', credits: 4, maxMarks: 100 },
      { code: 'IT207', name: 'Operating Systems Principles', credits: 4, maxMarks: 100 },
      { code: 'IT208', name: 'Formal Language & Automata Theory', credits: 3, maxMarks: 100 },
      { code: 'IT209', name: 'Software Engineering Fundamentals', credits: 4, maxMarks: 100 },
      { code: 'IT210', name: 'Database Systems Lab', credits: 2, maxMarks: 100 }
    ],
    5: [
      { code: 'IT301', name: 'Computer Networks & Internetworking', credits: 4, maxMarks: 100 },
      { code: 'IT302', name: 'Information Security Management', credits: 4, maxMarks: 100 },
      { code: 'IT303', name: 'Full Stack Web Architecture', credits: 4, maxMarks: 100 },
      { code: 'IT304', name: 'Artificial Intelligence & Search', credits: 3, maxMarks: 100 },
      { code: 'IT305', name: 'Web & Network Security Lab', credits: 2, maxMarks: 100 }
    ],
    6: [
      { code: 'IT306', name: 'Cloud Computing and DevOps', credits: 4, maxMarks: 100 },
      { code: 'IT307', name: 'Data Mining and Business Intelligence', credits: 4, maxMarks: 100 },
      { code: 'IT308', name: 'Mobile Application Engineering', credits: 4, maxMarks: 100 },
      { code: 'IT309', name: 'Professional Elective (IoT / Big Data)', credits: 3, maxMarks: 100 },
      { code: 'IT310', name: 'Cloud & DevOps Lab', credits: 2, maxMarks: 100 }
    ],
    7: [
      { code: 'IT401', name: 'Enterprise Computing & Microservices', credits: 4, maxMarks: 100 },
      { code: 'IT402', name: 'Software Quality Testing & Automation', credits: 4, maxMarks: 100 },
      { code: 'IT403', name: 'Project Work Phase I', credits: 4, maxMarks: 100 },
      { code: 'IT404', name: 'Cyber Security Auditing', credits: 3, maxMarks: 100 }
    ],
    8: [
      { code: 'IT405', name: 'Industrial Capstone Project Phase II', credits: 8, maxMarks: 100 },
      { code: 'IT406', name: 'Technical Seminar & Viva Voce', credits: 8, maxMarks: 100 }
    ]
  },
  'Electronics and Communication Engineering': {
    1: [
      { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100 },
      { code: 'PH101', name: 'Applied Physics for Engineers', credits: 4, maxMarks: 100 },
      { code: 'EC101', name: 'Basic Electronics & Devices', credits: 4, maxMarks: 100 },
      { code: 'ME101', name: 'Engineering Workshop', credits: 3, maxMarks: 100 },
      { code: 'EN101', name: 'Communication English', credits: 2, maxMarks: 100 }
    ],
    2: [
      { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100 },
      { code: 'CH102', name: 'Materials Science & Chemistry', credits: 4, maxMarks: 100 },
      { code: 'EC102', name: 'Network Analysis & Synthesis', credits: 4, maxMarks: 100 },
      { code: 'CS102', name: 'C Programming for Electronics', credits: 3, maxMarks: 100 },
      { code: 'EC102P', name: 'Circuits & Simulation Lab', credits: 2, maxMarks: 100 }
    ],
    3: [
      { code: 'EC201', name: 'Electronic Circuit Analysis', credits: 4, maxMarks: 100 },
      { code: 'EC202', name: 'Digital Electronics & Verilog', credits: 4, maxMarks: 100 },
      { code: 'EC203', name: 'Signals and Systems', credits: 4, maxMarks: 100 },
      { code: 'EC204', name: 'Electromagnetic Field Theory', credits: 3, maxMarks: 100 },
      { code: 'EC205', name: 'Analog Circuits Laboratory', credits: 2, maxMarks: 100 }
    ],
    4: [
      { code: 'EC206', name: 'Analog Communication Systems', credits: 4, maxMarks: 100 },
      { code: 'EC207', name: 'Linear Integrated Circuits & Op-Amps', credits: 4, maxMarks: 100 },
      { code: 'EC208', name: 'Microprocessors and Microcontrollers (8086/ARM)', credits: 4, maxMarks: 100 },
      { code: 'EC209', name: 'Control Systems Engineering', credits: 3, maxMarks: 100 },
      { code: 'EC210', name: 'Microcontroller Lab', credits: 2, maxMarks: 100 }
    ],
    5: [
      { code: 'EC301', name: 'Digital Signal Processing (DSP)', credits: 4, maxMarks: 100 },
      { code: 'EC302', name: 'Digital Communication Techniques', credits: 4, maxMarks: 100 },
      { code: 'EC303', name: 'VLSI Design & CMOS Circuits', credits: 4, maxMarks: 100 },
      { code: 'EC304', name: 'Transmission Lines & Antennas', credits: 3, maxMarks: 100 },
      { code: 'EC305', name: 'DSP & VLSI Lab', credits: 2, maxMarks: 100 }
    ],
    6: [
      { code: 'EC306', name: 'Wireless & Cellular Communications', credits: 4, maxMarks: 100 },
      { code: 'EC307', name: 'Embedded Systems & Real-Time OS', credits: 4, maxMarks: 100 },
      { code: 'EC308', name: 'Optical Fiber Communications', credits: 4, maxMarks: 100 },
      { code: 'EC309', name: 'Professional Elective (IoT & Sensors)', credits: 3, maxMarks: 100 },
      { code: 'EC310', name: 'Embedded Systems Lab', credits: 2, maxMarks: 100 }
    ],
    7: [
      { code: 'EC401', name: 'RF & Microwave Engineering', credits: 4, maxMarks: 100 },
      { code: 'EC402', name: 'Satellite & Radar Systems', credits: 4, maxMarks: 100 },
      { code: 'EC403', name: 'Capstone Engineering Project Phase I', credits: 4, maxMarks: 100 },
      { code: 'EC404', name: 'Robotics & Computer Vision', credits: 3, maxMarks: 100 }
    ],
    8: [
      { code: 'EC405', name: 'Industrial Internship & Field Training', credits: 8, maxMarks: 100 },
      { code: 'EC406', name: 'Project Phase II Presentation & Viva', credits: 8, maxMarks: 100 }
    ]
  }
};

// Helper to determine letter grade and points from marks
export function calculateGradeAndPoints(marks, maxMarks = 100) {
  if (marks === null || marks === undefined || isNaN(marks)) {
    return { grade: '-', points: null, result: 'Pending', isBacklog: false };
  }
  const percentage = (marks / maxMarks) * 100;
  for (const scale of GRADING_SYSTEM) {
    if (percentage >= scale.minMarks && percentage <= scale.maxMarks) {
      return {
        grade: scale.grade,
        points: scale.points,
        result: scale.grade === 'F' ? 'Fail' : 'Pass',
        isBacklog: scale.grade === 'F'
      };
    }
  }
  return { grade: 'F', points: 0, result: 'Fail', isBacklog: true };
}

// Helper to calculate age from DOB
export function calculateAgeFromDOB(dobString) {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
}

// Seed Students with full academic history
export const INITIAL_STUDENT_RECORDS = [
  {
    id: 'STU-2026-001',
    fullName: 'Priyansh Jain',
    rollNumber: '22CS0101',
    registrationNumber: 'REG-2022-CSE-0101',
    collegeName: 'Delhi Technological University (DTU)',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2026',
    admissionYear: '2022',
    currentSemester: 6,
    admissionType: 'Regular Entry',
    dateOfBirth: '2004-05-18',
    age: 22,
    gender: 'Male',
    email: 'priyansh.jain@example.edu',
    mobileNumber: '+91 98765 43210',
    alternateContact: '+91 98765 43211',
    currentAddress: 'Sector 17, Rohini, New Delhi, 110085',
    permanentAddress: 'Sector 17, Rohini, New Delhi, 110085',
    sameAsCurrentAddress: true,
    class10: {
      boardName: 'CBSE',
      schoolName: 'Delhi Public School, R.K. Puram',
      passingYear: '2020',
      maxMarks: 500,
      obtainedMarks: 472,
      percentage: 94.4,
      rollNumber: '10-CBSE-48912'
    },
    class12: {
      boardName: 'CBSE',
      schoolName: 'Delhi Public School, R.K. Puram',
      stream: 'Science',
      passingYear: '2022',
      maxMarks: 500,
      obtainedMarks: 461,
      percentage: 92.2,
      rollNumber: '12-CBSE-78193'
    },
    diploma: null,
    cumulativeCgpa: 8.84,
    activeBacklogsCount: 0,
    clearedBacklogsCount: 0,
    updatedAt: '2026-10-18T10:30:00Z',
    semesters: [
      {
        semester: 1,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 8.75,
        cgpa: 8.75,
        maxMarks: 500,
        obtainedMarks: 442,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2023',
        subjects: [
          { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'PH101', name: 'Engineering Physics', credits: 4, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS101', name: 'Problem Solving & Python Programming', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'ME101', name: 'Engineering Graphics & Design', credits: 3, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EN101', name: 'Technical English & Communication', credits: 2, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 2,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 8.90,
        cgpa: 8.82,
        maxMarks: 500,
        obtainedMarks: 449,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2023',
        subjects: [
          { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100, obtainedMarks: 85, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CH102', name: 'Engineering Chemistry', credits: 4, maxMarks: 100, obtainedMarks: 87, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS102', name: 'Programming in C & Data Structures Basics', credits: 4, maxMarks: 100, obtainedMarks: 95, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'EE102', name: 'Basic Electrical & Electronics', credits: 3, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS102P', name: 'Computing Lab Workshop', credits: 2, maxMarks: 100, obtainedMarks: 98, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 3,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 9.12,
        cgpa: 8.92,
        maxMarks: 500,
        obtainedMarks: 458,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2024',
        subjects: [
          { code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS202', name: 'Object Oriented Programming with Java', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS203', name: 'Discrete Mathematics', credits: 4, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS204', name: 'Digital Logic and Computer Architecture', credits: 3, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS205', name: 'Data Structures Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 4,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 8.80,
        cgpa: 8.89,
        maxMarks: 500,
        obtainedMarks: 446,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2024',
        subjects: [
          { code: 'CS206', name: 'Design and Analysis of Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 91, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS207', name: 'Database Management Systems', credits: 4, maxMarks: 100, obtainedMarks: 93, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS208', name: 'Operating Systems & System Programming', credits: 4, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS209', name: 'Theory of Computation & Automata', credits: 3, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS210', name: 'DBMS & SQL Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 5,
        academicYear: '2024-2025',
        status: 'Completed',
        sgpa: 8.65,
        cgpa: 8.84,
        maxMarks: 500,
        obtainedMarks: 438,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2025',
        subjects: [
          { code: 'CS301', name: 'Computer Networks and Protocols', credits: 4, maxMarks: 100, obtainedMarks: 89, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS302', name: 'Software Engineering & Agile Methodologies', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS303', name: 'Web Technologies & REST APIs', credits: 4, maxMarks: 100, obtainedMarks: 91, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS304', name: 'Compiler Design', credits: 3, maxMarks: 100, obtainedMarks: 76, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'CS305', name: 'Networking and Web Tech Lab', credits: 2, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 6,
        academicYear: '2024-2025',
        status: 'In Progress',
        sgpa: null,
        cgpa: null,
        maxMarks: 500,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: 'Pending Exams (Jun 2025)',
        subjects: [
          { code: 'CS306', name: 'Machine Learning & Pattern Recognition', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS307', name: 'Information Security & Cryptography', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS308', name: 'Cloud Computing & Microservices', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS309', name: 'Professional Elective I (Big Data / NLP)', credits: 3, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS310', name: 'AI & Machine Learning Lab', credits: 2, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      },
      {
        semester: 7,
        academicYear: '2025-2026',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 400,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: [
          { code: 'CS401', name: 'Deep Learning & Neural Networks', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS402', name: 'Distributed Systems & Blockchains', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS403', name: 'Open Elective II (Cyber Law & Ethics)', credits: 3, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS404', name: 'Major Capstone Project Phase I', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      },
      {
        semester: 8,
        academicYear: '2025-2026',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 200,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: [
          { code: 'CS405', name: 'Industrial Internship & Practice', credits: 8, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS406', name: 'Major Capstone Project Phase II & Viva', credits: 8, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      }
    ]
  },
  {
    id: 'STU-2026-002',
    fullName: 'Ananya Sharma',
    rollNumber: '22IT0142',
    registrationNumber: 'REG-2022-IT-0142',
    collegeName: 'Delhi Technological University (DTU)',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Information Technology',
    graduationBatch: '2026',
    admissionYear: '2022',
    currentSemester: 6,
    admissionType: 'Regular Entry',
    dateOfBirth: '2004-09-12',
    age: 22,
    gender: 'Female',
    email: 'ananya.sharma@example.edu',
    mobileNumber: '+91 98112 34567',
    alternateContact: '+91 98112 34568',
    currentAddress: 'Flat 402, Mayur Vihar Phase 1, Delhi 110091',
    permanentAddress: 'Flat 402, Mayur Vihar Phase 1, Delhi 110091',
    sameAsCurrentAddress: true,
    class10: {
      boardName: 'ICSE',
      schoolName: 'St. Thomas School, Mandir Marg',
      passingYear: '2020',
      maxMarks: 600,
      obtainedMarks: 564,
      percentage: 94.0,
      rollNumber: '10-ICSE-22910'
    },
    class12: {
      boardName: 'CBSE',
      schoolName: 'Modern School, Barakhamba Road',
      stream: 'Science',
      passingYear: '2022',
      maxMarks: 500,
      obtainedMarks: 470,
      percentage: 94.0,
      rollNumber: '12-CBSE-99120'
    },
    diploma: null,
    cumulativeCgpa: 9.08,
    activeBacklogsCount: 0,
    clearedBacklogsCount: 0,
    updatedAt: '2026-10-18T11:15:00Z',
    semesters: [
      {
        semester: 1,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 9.20,
        cgpa: 9.20,
        maxMarks: 500,
        obtainedMarks: 462,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2023',
        subjects: [
          { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'PH101', name: 'Engineering Physics', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT101', name: 'Fundamentals of Computing & Logic', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'ME101', name: 'Engineering Graphics', credits: 3, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EN101', name: 'Communication Skills', credits: 2, maxMarks: 100, obtainedMarks: 98, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 2,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 9.05,
        cgpa: 9.12,
        maxMarks: 500,
        obtainedMarks: 455,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2023',
        subjects: [
          { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100, obtainedMarks: 89, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CH102', name: 'Environmental Science & Chemistry', credits: 4, maxMarks: 100, obtainedMarks: 91, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT102', name: 'Object Oriented Programming with C++', credits: 4, maxMarks: 100, obtainedMarks: 93, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'EE102', name: 'Basic Electrical Engineering', credits: 3, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'IT102P', name: 'C++ Programming Lab', credits: 2, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 3,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 9.15,
        cgpa: 9.13,
        maxMarks: 500,
        obtainedMarks: 460,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2024',
        subjects: [
          { code: 'IT201', name: 'Data Structures and Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 95, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT202', name: 'Computer Organization & Architecture', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'IT203', name: 'Discrete Computational Mathematics', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT204', name: 'Web Application Development', credits: 3, maxMarks: 100, obtainedMarks: 91, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT205', name: 'Data Structures Lab', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 4,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 8.95,
        cgpa: 9.09,
        maxMarks: 500,
        obtainedMarks: 450,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2024',
        subjects: [
          { code: 'IT206', name: 'Database Engineering', credits: 4, maxMarks: 100, obtainedMarks: 93, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT207', name: 'Operating Systems Principles', credits: 4, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'IT208', name: 'Formal Language & Automata Theory', credits: 3, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'IT209', name: 'Software Engineering Fundamentals', credits: 4, maxMarks: 100, obtainedMarks: 91, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT210', name: 'Database Systems Lab', credits: 2, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 5,
        academicYear: '2024-2025',
        status: 'Completed',
        sgpa: 9.05,
        cgpa: 9.08,
        maxMarks: 500,
        obtainedMarks: 454,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2025',
        subjects: [
          { code: 'IT301', name: 'Computer Networks & Internetworking', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT302', name: 'Information Security Management', credits: 4, maxMarks: 100, obtainedMarks: 89, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'IT303', name: 'Full Stack Web Architecture', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'IT304', name: 'Artificial Intelligence & Search', credits: 3, maxMarks: 100, obtainedMarks: 87, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'IT305', name: 'Web & Network Security Lab', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 6,
        academicYear: '2024-2025',
        status: 'In Progress',
        sgpa: null,
        cgpa: null,
        maxMarks: 500,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: 'Jun 2025',
        subjects: [
          { code: 'IT306', name: 'Cloud Computing and DevOps', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'IT307', name: 'Data Mining and Business Intelligence', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'IT308', name: 'Mobile Application Engineering', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'IT309', name: 'Professional Elective (IoT / Big Data)', credits: 3, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'IT310', name: 'Cloud & DevOps Lab', credits: 2, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      },
      {
        semester: 7,
        academicYear: '2025-2026',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 400,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: []
      },
      {
        semester: 8,
        academicYear: '2025-2026',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 200,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: []
      }
    ]
  },
  {
    id: 'STU-2026-003',
    fullName: 'Rohan Kulkarni',
    rollNumber: '22EC0188',
    registrationNumber: 'REG-2022-ECE-0188',
    collegeName: 'Delhi Technological University (DTU)',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Electronics and Communication Engineering',
    graduationBatch: '2026',
    admissionYear: '2022',
    currentSemester: 6,
    admissionType: 'Diploma / Lateral Entry',
    dateOfBirth: '2003-11-25',
    age: 22,
    gender: 'Male',
    email: 'rohan.kulkarni@example.edu',
    mobileNumber: '+91 97654 32109',
    alternateContact: null,
    currentAddress: 'Hostel 3, Room 214, DTU Campus, Delhi 110042',
    permanentAddress: 'Kothrud, Pune, Maharashtra 411038',
    sameAsCurrentAddress: false,
    class10: {
      boardName: 'Maharashtra State Board',
      schoolName: 'Balmohan Vidyamandir, Pune',
      passingYear: '2019',
      maxMarks: 500,
      obtainedMarks: 440,
      percentage: 88.0,
      rollNumber: '10-MH-77123'
    },
    class12: null,
    diploma: {
      diplomaQualification: 'Diploma in Electronics & Telecommunication',
      instituteName: 'Government Polytechnic, Pune',
      specialization: 'Electronics and Telecommunication',
      boardOrUniversity: 'MSBTE (Maharashtra State Board of Technical Education)',
      passingYear: '2022',
      maxMarks: 1800,
      obtainedMarks: 1620,
      percentageOrCgpa: '90.0% (First Class with Distinction)'
    },
    cumulativeCgpa: 7.68,
    activeBacklogsCount: 1,
    clearedBacklogsCount: 1,
    updatedAt: '2026-10-18T12:00:00Z',
    semesters: [
      {
        semester: 1,
        academicYear: '2021-2022',
        status: 'Completed',
        sgpa: 8.00,
        cgpa: 8.00,
        maxMarks: 500,
        obtainedMarks: 400,
        resultStatus: 'Pass',
        publicationDate: 'Lateral Credit Transfer (Equivalent)',
        subjects: [
          { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100, obtainedMarks: 80, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'PH101', name: 'Applied Physics for Engineers', credits: 4, maxMarks: 100, obtainedMarks: 78, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC101', name: 'Basic Electronics & Devices', credits: 4, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'ME101', name: 'Engineering Workshop', credits: 3, maxMarks: 100, obtainedMarks: 75, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EN101', name: 'Communication English', credits: 2, maxMarks: 100, obtainedMarks: 85, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 2,
        academicYear: '2021-2022',
        status: 'Completed',
        sgpa: 8.10,
        cgpa: 8.05,
        maxMarks: 500,
        obtainedMarks: 405,
        resultStatus: 'Pass',
        publicationDate: 'Lateral Credit Transfer (Equivalent)',
        subjects: [
          { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100, obtainedMarks: 76, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'CH102', name: 'Materials Science & Chemistry', credits: 4, maxMarks: 100, obtainedMarks: 80, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EC102', name: 'Network Analysis & Synthesis', credits: 4, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS102', name: 'C Programming for Electronics', credits: 3, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EC102P', name: 'Circuits & Simulation Lab', credits: 2, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 3,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 7.82,
        cgpa: 7.97,
        maxMarks: 500,
        obtainedMarks: 388,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2023',
        subjects: [
          { code: 'EC201', name: 'Electronic Circuit Analysis', credits: 4, maxMarks: 100, obtainedMarks: 72, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC202', name: 'Digital Electronics & Verilog', credits: 4, maxMarks: 100, obtainedMarks: 85, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EC203', name: 'Signals and Systems', credits: 4, maxMarks: 100, obtainedMarks: 70, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC204', name: 'Electromagnetic Field Theory', credits: 3, maxMarks: 100, obtainedMarks: 71, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC205', name: 'Analog Circuits Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 4,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 6.90,
        cgpa: 7.70,
        maxMarks: 500,
        obtainedMarks: 345,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2024',
        subjects: [
          { code: 'EC206', name: 'Analog Communication Systems', credits: 4, maxMarks: 100, obtainedMarks: 74, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC207', name: 'Linear Integrated Circuits & Op-Amps', credits: 4, maxMarks: 100, obtainedMarks: 78, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC208', name: 'Microprocessors and Microcontrollers (8086/ARM)', credits: 4, maxMarks: 100, obtainedMarks: 70, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC209', name: 'Control Systems Engineering', credits: 3, maxMarks: 100, obtainedMarks: 58, grade: 'B', gradePoints: 6, result: 'Pass', isBacklog: false },
          { code: 'EC210', name: 'Microcontroller Lab', credits: 2, maxMarks: 100, obtainedMarks: 85, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 5,
        academicYear: '2024-2025',
        status: 'Completed',
        sgpa: 6.45,
        cgpa: 7.68,
        maxMarks: 500,
        obtainedMarks: 320,
        resultStatus: 'Fail',
        publicationDate: 'Jan 2025',
        subjects: [
          { code: 'EC301', name: 'Digital Signal Processing (DSP)', credits: 4, maxMarks: 100, obtainedMarks: 72, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC302', name: 'Digital Communication Techniques', credits: 4, maxMarks: 100, obtainedMarks: 65, grade: 'B+', gradePoints: 7, result: 'Pass', isBacklog: false },
          { code: 'EC303', name: 'VLSI Design & CMOS Circuits', credits: 4, maxMarks: 100, obtainedMarks: 71, grade: 'A', gradePoints: 8, result: 'Pass', isBacklog: false },
          { code: 'EC304', name: 'Transmission Lines & Antennas', credits: 3, maxMarks: 100, obtainedMarks: 28, grade: 'F', gradePoints: 0, result: 'Fail', isBacklog: true },
          { code: 'EC305', name: 'DSP & VLSI Lab', credits: 2, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 6,
        academicYear: '2024-2025',
        status: 'In Progress',
        sgpa: null,
        cgpa: null,
        maxMarks: 500,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: 'Jun 2025',
        subjects: [
          { code: 'EC306', name: 'Wireless & Cellular Communications', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'EC307', name: 'Embedded Systems & Real-Time OS', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'EC308', name: 'Optical Fiber Communications', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'EC309', name: 'Professional Elective (IoT & Sensors)', credits: 3, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'EC310', name: 'Embedded Systems Lab', credits: 2, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      },
      {
        semester: 7,
        academicYear: '2025-2026',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 400,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: []
      },
      {
        semester: 8,
        academicYear: '2025-2026',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 200,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: []
      }
    ]
  },
  {
    id: 'STU-2027-004',
    fullName: 'Siddharth Nair',
    rollNumber: '23CS0215',
    registrationNumber: 'REG-2023-CSE-0215',
    collegeName: 'Delhi Technological University (DTU)',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2027',
    admissionYear: '2023',
    currentSemester: 4,
    admissionType: 'Regular Entry',
    dateOfBirth: '2005-02-14',
    age: 21,
    gender: 'Male',
    email: 'siddharth.nair@example.edu',
    mobileNumber: '+91 94471 23456',
    alternateContact: null,
    currentAddress: 'Sector 14, Dwarka, New Delhi 110078',
    permanentAddress: 'Panampilly Nagar, Kochi, Kerala 682036',
    sameAsCurrentAddress: false,
    class10: {
      boardName: 'Kerala State Board',
      schoolName: 'Bhavans Vidya Mandir, Kochi',
      passingYear: '2021',
      maxMarks: 500,
      obtainedMarks: 485,
      percentage: 97.0,
      rollNumber: '10-KB-11094'
    },
    class12: {
      boardName: 'CBSE',
      schoolName: 'Bhavans Vidya Mandir, Kochi',
      stream: 'Science',
      passingYear: '2023',
      maxMarks: 500,
      obtainedMarks: 478,
      percentage: 95.6,
      rollNumber: '12-CBSE-55410'
    },
    diploma: null,
    cumulativeCgpa: 9.35,
    activeBacklogsCount: 0,
    clearedBacklogsCount: 0,
    updatedAt: '2026-10-18T13:45:00Z',
    semesters: [
      {
        semester: 1,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 9.40,
        cgpa: 9.40,
        maxMarks: 500,
        obtainedMarks: 470,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2024',
        subjects: [
          { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100, obtainedMarks: 95, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'PH101', name: 'Engineering Physics', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS101', name: 'Problem Solving & Python Programming', credits: 4, maxMarks: 100, obtainedMarks: 98, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'ME101', name: 'Engineering Graphics & Design', credits: 3, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EN101', name: 'Technical English & Communication', credits: 2, maxMarks: 100, obtainedMarks: 97, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 2,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 9.30,
        cgpa: 9.35,
        maxMarks: 500,
        obtainedMarks: 466,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2024',
        subjects: [
          { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100, obtainedMarks: 91, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CH102', name: 'Engineering Chemistry', credits: 4, maxMarks: 100, obtainedMarks: 93, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS102', name: 'Programming in C & Data Structures Basics', credits: 4, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'EE102', name: 'Basic Electrical & Electronics', credits: 3, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS102P', name: 'Computing Lab Workshop', credits: 2, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 3,
        academicYear: '2024-2025',
        status: 'Completed',
        sgpa: 9.35,
        cgpa: 9.35,
        maxMarks: 500,
        obtainedMarks: 468,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2025',
        subjects: [
          { code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 98, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS202', name: 'Object Oriented Programming with Java', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS203', name: 'Discrete Mathematics', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS204', name: 'Digital Logic and Computer Architecture', credits: 3, maxMarks: 100, obtainedMarks: 89, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS205', name: 'Data Structures Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 97, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 4,
        academicYear: '2024-2025',
        status: 'In Progress',
        sgpa: null,
        cgpa: null,
        maxMarks: 500,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: 'Jun 2025',
        subjects: [
          { code: 'CS206', name: 'Design and Analysis of Algorithms', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS207', name: 'Database Management Systems', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS208', name: 'Operating Systems & System Programming', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS209', name: 'Theory of Computation & Automata', credits: 3, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS210', name: 'DBMS & SQL Laboratory', credits: 2, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      },
      {
        semester: 5,
        academicYear: '2025-2026',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 500,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: []
      },
      {
        semester: 6,
        academicYear: '2025-2026',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 500,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: []
      },
      {
        semester: 7,
        academicYear: '2026-2027',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 400,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: []
      },
      {
        semester: 8,
        academicYear: '2026-2027',
        status: 'Not Started',
        sgpa: null,
        cgpa: null,
        maxMarks: 200,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: null,
        subjects: []
      }
    ]
  },
  {
    id: 'STU-2025-005',
    fullName: 'Meera Venkat',
    rollNumber: '21CS0089',
    registrationNumber: 'REG-2021-CSE-0089',
    collegeName: 'Delhi Technological University (DTU)',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2025',
    admissionYear: '2021',
    currentSemester: 8,
    admissionType: 'Regular Entry',
    dateOfBirth: '2003-08-30',
    age: 23,
    gender: 'Female',
    email: 'meera.venkat@example.edu',
    mobileNumber: '+91 99887 76655',
    alternateContact: null,
    currentAddress: 'Indirapuram, Ghaziabad, UP 201014',
    permanentAddress: 'Indirapuram, Ghaziabad, UP 201014',
    sameAsCurrentAddress: true,
    class10: {
      boardName: 'CBSE',
      schoolName: 'DPS Indirapuram',
      passingYear: '2019',
      maxMarks: 500,
      obtainedMarks: 465,
      percentage: 93.0,
      rollNumber: '10-CBSE-33819'
    },
    class12: {
      boardName: 'CBSE',
      schoolName: 'DPS Indirapuram',
      stream: 'Science',
      passingYear: '2021',
      maxMarks: 500,
      obtainedMarks: 455,
      percentage: 91.0,
      rollNumber: '12-CBSE-88219'
    },
    diploma: null,
    cumulativeCgpa: 8.92,
    activeBacklogsCount: 0,
    clearedBacklogsCount: 0,
    updatedAt: '2026-10-18T14:10:00Z',
    semesters: [
      {
        semester: 1,
        academicYear: '2021-2022',
        status: 'Completed',
        sgpa: 8.80,
        cgpa: 8.80,
        maxMarks: 500,
        obtainedMarks: 440,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2022',
        subjects: [
          { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'PH101', name: 'Engineering Physics', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS101', name: 'Problem Solving & Python Programming', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'ME101', name: 'Engineering Graphics & Design', credits: 3, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EN101', name: 'Technical English & Communication', credits: 2, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 2,
        academicYear: '2021-2022',
        status: 'Completed',
        sgpa: 8.90,
        cgpa: 8.85,
        maxMarks: 500,
        obtainedMarks: 445,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2022',
        subjects: [
          { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100, obtainedMarks: 87, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CH102', name: 'Engineering Chemistry', credits: 4, maxMarks: 100, obtainedMarks: 89, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS102', name: 'Programming in C & Data Structures Basics', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'EE102', name: 'Basic Electrical & Electronics', credits: 3, maxMarks: 100, obtainedMarks: 83, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS102P', name: 'Computing Lab Workshop', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 3,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 9.00,
        cgpa: 8.90,
        maxMarks: 500,
        obtainedMarks: 450,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2023',
        subjects: [
          { code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS202', name: 'Object Oriented Programming with Java', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS203', name: 'Discrete Mathematics', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS204', name: 'Digital Logic and Computer Architecture', credits: 3, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS205', name: 'Data Structures Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 4,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 8.85,
        cgpa: 8.89,
        maxMarks: 500,
        obtainedMarks: 442,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2023',
        subjects: [
          { code: 'CS206', name: 'Design and Analysis of Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS207', name: 'Database Management Systems', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS208', name: 'Operating Systems & System Programming', credits: 4, maxMarks: 100, obtainedMarks: 85, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS209', name: 'Theory of Computation & Automata', credits: 3, maxMarks: 100, obtainedMarks: 81, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS210', name: 'DBMS & SQL Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 5,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 9.10,
        cgpa: 8.93,
        maxMarks: 500,
        obtainedMarks: 455,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2024',
        subjects: [
          { code: 'CS301', name: 'Computer Networks and Protocols', credits: 4, maxMarks: 100, obtainedMarks: 91, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS302', name: 'Software Engineering & Agile Methodologies', credits: 4, maxMarks: 100, obtainedMarks: 93, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS303', name: 'Web Technologies & REST APIs', credits: 4, maxMarks: 100, obtainedMarks: 95, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS304', name: 'Compiler Design', credits: 3, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS305', name: 'Networking and Web Tech Lab', credits: 2, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 6,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 8.95,
        cgpa: 8.93,
        maxMarks: 500,
        obtainedMarks: 448,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2024',
        subjects: [
          { code: 'CS306', name: 'Machine Learning & Pattern Recognition', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS307', name: 'Information Security & Cryptography', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS308', name: 'Cloud Computing & Microservices', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS309', name: 'Professional Elective I (Big Data / NLP)', credits: 3, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS310', name: 'AI & Machine Learning Lab', credits: 2, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 7,
        academicYear: '2024-2025',
        status: 'Completed',
        sgpa: 8.90,
        cgpa: 8.92,
        maxMarks: 400,
        obtainedMarks: 356,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2025',
        subjects: [
          { code: 'CS401', name: 'Deep Learning & Neural Networks', credits: 4, maxMarks: 100, obtainedMarks: 89, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS402', name: 'Distributed Systems & Blockchains', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS403', name: 'Open Elective II (Cyber Law & Ethics)', credits: 3, maxMarks: 100, obtainedMarks: 87, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS404', name: 'Major Capstone Project Phase I', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 8,
        academicYear: '2024-2025',
        status: 'In Progress',
        sgpa: null,
        cgpa: null,
        maxMarks: 200,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: 'May 2025 (Final Viva)',
        subjects: [
          { code: 'CS405', name: 'Industrial Internship & Practice', credits: 8, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS406', name: 'Major Capstone Project Phase II & Viva', credits: 8, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      }
    ]
  },
  {
    id: 'STU-2026-006',
    fullName: 'Priya Sharma',
    rollNumber: '22CS0110',
    registrationNumber: 'REG-2022-CSE-0110',
    collegeName: 'Delhi Technological University (DTU)',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2026',
    admissionYear: '2022',
    currentSemester: 6,
    admissionType: 'Regular Entry',
    dateOfBirth: '2004-03-12',
    age: 22,
    gender: 'Female',
    email: 'priya.sharma@example.edu',
    mobileNumber: '+91 98112 34567',
    alternateContact: null,
    currentAddress: 'Pitampura, New Delhi, 110034',
    permanentAddress: 'Pitampura, New Delhi, 110034',
    sameAsCurrentAddress: true,
    class10: {
      boardName: 'CBSE',
      schoolName: 'Bal Bharati Public School, Pitampura',
      passingYear: '2020',
      maxMarks: 500,
      obtainedMarks: 458,
      percentage: 91.6,
      rollNumber: '10-CBSE-55219'
    },
    class12: {
      boardName: 'CBSE',
      schoolName: 'Bal Bharati Public School, Pitampura',
      stream: 'Science',
      passingYear: '2022',
      maxMarks: 500,
      obtainedMarks: 450,
      percentage: 90.0,
      rollNumber: '12-CBSE-88321'
    },
    diploma: null,
    cumulativeCgpa: 8.90,
    activeBacklogsCount: 0,
    clearedBacklogsCount: 0,
    updatedAt: '2026-10-18T14:30:00Z',
    semesters: [
      {
        semester: 1,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 8.70,
        cgpa: 8.70,
        maxMarks: 500,
        obtainedMarks: 438,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2023',
        subjects: [
          { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100, obtainedMarks: 85, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'PH101', name: 'Engineering Physics', credits: 4, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS101', name: 'Problem Solving & Python Programming', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'ME101', name: 'Engineering Graphics & Design', credits: 3, maxMarks: 100, obtainedMarks: 81, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EN101', name: 'Technical English & Communication', credits: 2, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 2,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 8.85,
        cgpa: 8.78,
        maxMarks: 500,
        obtainedMarks: 445,
        resultStatus: 'Pass',
        publicationDate: 'Jul 2023',
        subjects: [
          { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CH102', name: 'Engineering Chemistry', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS102', name: 'Programming in C & Data Structures Basics', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'EE102', name: 'Basic Electrical & Electronics', credits: 3, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS102P', name: 'Computing Lab Workshop', credits: 2, maxMarks: 100, obtainedMarks: 95, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 3,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 8.90,
        cgpa: 8.82,
        maxMarks: 500,
        obtainedMarks: 448,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2024',
        subjects: [
          { code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 93, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS202', name: 'Object Oriented Programming with Java', credits: 4, maxMarks: 100, obtainedMarks: 91, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS203', name: 'Discrete Mathematics', credits: 4, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS204', name: 'Digital Logic and Computer Architecture', credits: 3, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS205', name: 'Data Structures Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 98, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 4,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 9.00,
        cgpa: 8.87,
        maxMarks: 500,
        obtainedMarks: 452,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2024',
        subjects: [
          { code: 'CS206', name: 'Design and Analysis of Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS207', name: 'Database Management Systems', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS208', name: 'Operating Systems & System Programming', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS209', name: 'Theory of Computation & Automata', credits: 3, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS210', name: 'DBMS & SQL Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 5,
        academicYear: '2024-2025',
        status: 'Completed',
        sgpa: 8.95,
        cgpa: 8.89,
        maxMarks: 500,
        obtainedMarks: 449,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2025',
        subjects: [
          { code: 'CS301', name: 'Computer Networks and Protocols', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS302', name: 'Software Engineering & Agile Methodologies', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS303', name: 'Web Technologies & REST APIs', credits: 4, maxMarks: 100, obtainedMarks: 95, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS304', name: 'Compiler Design', credits: 3, maxMarks: 100, obtainedMarks: 82, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS305', name: 'Networking and Web Tech Lab', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 6,
        academicYear: '2024-2025',
        status: 'In Progress',
        sgpa: 9.00,
        cgpa: 8.90,
        maxMarks: 500,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: 'Jun 2025',
        subjects: [
          { code: 'CS306', name: 'Machine Learning & Pattern Recognition', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS307', name: 'Information Security & Cryptography', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS308', name: 'Cloud Computing & Microservices', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS309', name: 'Professional Elective I (Big Data / NLP)', credits: 3, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS310', name: 'AI & Machine Learning Lab', credits: 2, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      }
    ]
  },
  {
    id: 'STU-2026-007',
    fullName: 'Sahil Pratap Singh',
    rollNumber: '22CS0111',
    registrationNumber: 'REG-2022-CSE-0111',
    collegeName: 'Delhi Technological University (DTU)',
    course: 'B.Tech (Bachelor of Technology)',
    branch: 'Computer Science and Engineering',
    graduationBatch: '2026',
    admissionYear: '2022',
    currentSemester: 6,
    admissionType: 'Regular Entry',
    dateOfBirth: '2004-01-20',
    age: 22,
    gender: 'Male',
    email: 'sahil.singh@example.edu',
    mobileNumber: '+91 98223 45678',
    alternateContact: null,
    currentAddress: 'Model Town, New Delhi, 110009',
    permanentAddress: 'Model Town, New Delhi, 110009',
    sameAsCurrentAddress: true,
    class10: {
      boardName: 'CBSE',
      schoolName: 'Delhi Public School, Mathura Road',
      passingYear: '2020',
      maxMarks: 500,
      obtainedMarks: 469,
      percentage: 93.8,
      rollNumber: '10-CBSE-66312'
    },
    class12: {
      boardName: 'CBSE',
      schoolName: 'Delhi Public School, Mathura Road',
      stream: 'Science',
      passingYear: '2022',
      maxMarks: 500,
      obtainedMarks: 456,
      percentage: 91.2,
      rollNumber: '12-CBSE-99412'
    },
    diploma: null,
    cumulativeCgpa: 9.20,
    activeBacklogsCount: 0,
    clearedBacklogsCount: 0,
    updatedAt: '2026-10-18T14:35:00Z',
    semesters: [
      {
        semester: 1,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 9.10,
        cgpa: 9.10,
        maxMarks: 500,
        obtainedMarks: 455,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2023',
        subjects: [
          { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'PH101', name: 'Engineering Physics', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS101', name: 'Problem Solving & Python Programming', credits: 4, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'ME101', name: 'Engineering Graphics & Design', credits: 3, maxMarks: 100, obtainedMarks: 85, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'EN101', name: 'Technical English & Communication', credits: 2, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 2,
        academicYear: '2022-2023',
        status: 'Completed',
        sgpa: 9.15,
        cgpa: 9.12,
        maxMarks: 500,
        obtainedMarks: 458,
        resultStatus: 'Pass',
        publicationDate: 'Jul 2023',
        subjects: [
          { code: 'MA102', name: 'Engineering Mathematics II', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CH102', name: 'Engineering Chemistry', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS102', name: 'Programming in C & Data Structures Basics', credits: 4, maxMarks: 100, obtainedMarks: 98, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'EE102', name: 'Basic Electrical & Electronics', credits: 3, maxMarks: 100, obtainedMarks: 84, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS102P', name: 'Computing Lab Workshop', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 3,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 9.25,
        cgpa: 9.17,
        maxMarks: 500,
        obtainedMarks: 462,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2024',
        subjects: [
          { code: 'CS201', name: 'Data Structures and Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS202', name: 'Object Oriented Programming with Java', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS203', name: 'Discrete Mathematics', credits: 4, maxMarks: 100, obtainedMarks: 88, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS204', name: 'Digital Logic and Computer Architecture', credits: 3, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS205', name: 'Data Structures Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 98, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 4,
        academicYear: '2023-2024',
        status: 'Completed',
        sgpa: 9.20,
        cgpa: 9.18,
        maxMarks: 500,
        obtainedMarks: 460,
        resultStatus: 'Pass',
        publicationDate: 'Jun 2024',
        subjects: [
          { code: 'CS206', name: 'Design and Analysis of Algorithms', credits: 4, maxMarks: 100, obtainedMarks: 95, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS207', name: 'Database Management Systems', credits: 4, maxMarks: 100, obtainedMarks: 96, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS208', name: 'Operating Systems & System Programming', credits: 4, maxMarks: 100, obtainedMarks: 90, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS209', name: 'Theory of Computation & Automata', credits: 3, maxMarks: 100, obtainedMarks: 85, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS210', name: 'DBMS & SQL Laboratory', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 5,
        academicYear: '2024-2025',
        status: 'Completed',
        sgpa: 9.25,
        cgpa: 9.19,
        maxMarks: 500,
        obtainedMarks: 464,
        resultStatus: 'Pass',
        publicationDate: 'Jan 2025',
        subjects: [
          { code: 'CS301', name: 'Computer Networks and Protocols', credits: 4, maxMarks: 100, obtainedMarks: 92, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS302', name: 'Software Engineering & Agile Methodologies', credits: 4, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS303', name: 'Web Technologies & REST APIs', credits: 4, maxMarks: 100, obtainedMarks: 98, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false },
          { code: 'CS304', name: 'Compiler Design', credits: 3, maxMarks: 100, obtainedMarks: 86, grade: 'A+', gradePoints: 9, result: 'Pass', isBacklog: false },
          { code: 'CS305', name: 'Networking and Web Tech Lab', credits: 2, maxMarks: 100, obtainedMarks: 94, grade: 'O', gradePoints: 10, result: 'Pass', isBacklog: false }
        ]
      },
      {
        semester: 6,
        academicYear: '2024-2025',
        status: 'In Progress',
        sgpa: 9.25,
        cgpa: 9.20,
        maxMarks: 500,
        obtainedMarks: null,
        resultStatus: 'Pending',
        publicationDate: 'Jun 2025',
        subjects: [
          { code: 'CS306', name: 'Machine Learning & Pattern Recognition', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS307', name: 'Information Security & Cryptography', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS308', name: 'Cloud Computing & Microservices', credits: 4, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS309', name: 'Professional Elective I (Big Data / NLP)', credits: 3, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false },
          { code: 'CS310', name: 'AI & Machine Learning Lab', credits: 2, maxMarks: 100, obtainedMarks: null, grade: '-', gradePoints: null, result: 'Pending', isBacklog: false }
        ]
      }
    ]
  }
];

// Initial Backlogs Data linked to student and semester
export const INITIAL_BACKLOG_RECORDS = [
  {
    id: 'BKL-001',
    studentId: 'STU-2026-003',
    studentName: 'Rohan Kulkarni',
    rollNumber: '22EC0188',
    branch: 'Electronics and Communication Engineering',
    course: 'B.Tech (Bachelor of Technology)',
    subjectCode: 'EC304',
    subjectName: 'Transmission Lines & Antennas',
    originalSemester: 5,
    attemptNumber: 1,
    status: 'Active',
    attemptDate: 'Dec 2024',
    clearedSemester: null,
    latestResult: 'Fail (Marks: 28/100, Grade F)',
    reExamDate: 'May 2025',
    remarks: 'Needs supplementary examination registration.'
  },
  {
    id: 'BKL-002',
    studentId: 'STU-2026-003',
    studentName: 'Rohan Kulkarni',
    rollNumber: '22EC0188',
    branch: 'Electronics and Communication Engineering',
    course: 'B.Tech (Bachelor of Technology)',
    subjectCode: 'EC209',
    subjectName: 'Control Systems Engineering',
    originalSemester: 4,
    attemptNumber: 2,
    status: 'Cleared',
    attemptDate: 'Nov 2024',
    clearedSemester: 5,
    latestResult: 'Pass (Marks: 58/100, Grade B)',
    reExamDate: 'Nov 2024',
    remarks: 'Successfully cleared in Winter 2024 Special Drive.'
  }
];
