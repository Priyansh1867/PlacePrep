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
export const INITIAL_STUDENT_RECORDS = [];

// Initial Backlogs Data linked to student and semester
export const INITIAL_BACKLOG_RECORDS = [];
