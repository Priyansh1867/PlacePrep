import { PROGRESS_STATUSES } from '../../services/curriculumGovernanceService.js';
// Explicit test-only sample records. Never imported by the application.
import { calculateAgeFromDOB, calculateGradeAndPoints, BRANCH_SEMESTER_SUBJECTS } from '../../data/initialAcademicRecords.js';
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
  }
];
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
export const INITIAL_COMPANIES = [
  {
    id: 'hcltech',
    name: 'HCLTech',
    slug: 'hcltech',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    tier: 'Tier 1 IT Services',
    headquarters: 'Noida, India',
    industry: 'Information Technology & Consulting',
    roles: ['Graduate Engineer Trainee (GET)', 'Software Engineer', 'Specialist Programmer'],
    ctcRange: '₹4.25 LPA - ₹8.50 LPA',
    verifiedUpcomingDrive: true,
    upcomingDriveDate: 'November 18, 2026',
    eligibleBatches: ['2026', '2027', '2028'],
    driveStatus: 'Registration Open',
    eligibilityCriteria: 'B.Tech/B.E/M.Tech (CS, IT, ECE, EE), MCA. Minimum 65% or 6.5 CGPA in 10th, 12th & Graduation. Max 1 active backlog permitted at application time.',
    recruitmentProcess: [
      { step: 1, title: 'Online Assessment (HCL CAT)', desc: '90 mins: Quantitative Aptitude, Logical Reasoning, Verbal Ability & 2 Coding Problems.' },
      { step: 2, title: 'Technical Interview', desc: '45-60 mins: Core CS (OOPs, DBMS, OS), DSA, Project deep-dive, Live coding.' },
      { step: 3, title: 'Managerial Round', desc: '30 mins: Behavioral scenarios, problem-solving, project leadership, adaptability.' },
      { step: 4, title: 'HR Round', desc: '20 mins: Background verification, relocation willingness, communication, cultural fit.' }
    ],
    experienceCount: 84,
    frequentTopics: ['SQL Joins & Indexing', 'Java OOP & Streams', 'Binary Trees & Graphs', 'REST APIs', 'Cloud Basics'],
    latestUpdateDate: 'October 10, 2026',
    verifiedHistoricalSource: 'Verified from 84 verified candidate experiences across 2024-2026 drives',
    popularityScore: 96,
  },
  {
    id: 'tcs',
    name: 'TCS (Tata Consultancy Services)',
    slug: 'tcs',
    logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=128&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    tier: 'Global Tech Giant',
    headquarters: 'Mumbai, India',
    industry: 'IT Services, Digital Transformation',
    roles: ['TCS Ninja (₹3.6 LPA)', 'TCS Digital (₹7.2 LPA)', 'TCS Prime (₹9.0 LPA)'],
    ctcRange: '₹3.60 LPA - ₹9.00 LPA',
    verifiedUpcomingDrive: true,
    upcomingDriveDate: 'December 05, 2026',
    eligibleBatches: ['2026', '2027'],
    driveStatus: 'Upcoming National Qualifier (NQT)',
    eligibilityCriteria: 'Minimum 60% or 6.0 CGPA throughout 10th, 12th, Diploma, Under-Graduation. Up to 1 active backlog allowed at time of test.',
    recruitmentProcess: [
      { step: 1, title: 'TCS National Qualifier Test (NQT)', desc: 'Cognitive Test + Advanced Coding (Python, C++, Java).' },
      { step: 2, title: 'Technical Interview', desc: 'DSA, SQL, OOP, System Fundamentals, Cloud & Full Stack fundamentals.' },
      { step: 3, title: 'Managerial + HR Round', desc: 'Combined or sequential panel: Situational, team dynamics, TCS values.' }
    ],
    experienceCount: 142,
    frequentTopics: ['Recursion & Arrays', 'Normalization & SQL', 'SDLC & Agile', 'Cloud Microservices', 'Star Pattern / String Manipulation'],
    latestUpdateDate: 'October 12, 2026',
    verifiedHistoricalSource: 'Verified from TCS NQT Digital & Ninja drive archives 2024-2026',
    popularityScore: 98,
  },
  {
    id: 'infosys',
    name: 'Infosys',
    slug: 'infosys',
    logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
    tier: 'Tier 1 IT Services',
    headquarters: 'Bengaluru, India',
    industry: 'Consulting & Information Technology',
    roles: ['Systems Engineer (SE)', 'Digital Specialist Engineer (DSE)', 'Specialist Programmer (SP)'],
    ctcRange: '₹3.60 LPA - ₹9.50 LPA',
    verifiedUpcomingDrive: true,
    upcomingDriveDate: 'November 28, 2026',
    eligibleBatches: ['2026', '2027', '2028'],
    driveStatus: 'HackWithInfy & On-Campus',
    eligibilityCriteria: 'All Engineering branches eligible. 60% or 6.0 CGPA minimum with no active backlogs.',
    recruitmentProcess: [
      { step: 1, title: 'Online Test / InfyTQ / HackWithInfy', desc: 'Reasoning, Mathematical Ability, Verbal Ability, Hands-on Coding.' },
      { step: 2, title: 'Technical Interview', desc: 'Problem solving, OOPs with C++/Java, Database design, Web development.' },
      { step: 3, title: 'HR Round', desc: 'Resume validation, personality test, communication skills.' }
    ],
    experienceCount: 110,
    frequentTopics: ['Dynamic Programming Basics', 'Polymorphism & Inheritance', 'DBMS ACID properties', 'Exception Handling', 'REST APIs'],
    latestUpdateDate: 'October 08, 2026',
    verifiedHistoricalSource: 'InfyTQ & On-Campus Drive Records (2024-2026)',
    popularityScore: 94,
  },
  {
    id: 'wipro',
    name: 'Wipro',
    slug: 'wipro',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    tier: 'Tier 1 IT Services',
    headquarters: 'Bengaluru, India',
    industry: 'Consulting, IT & Business Process Services',
    roles: ['Project Engineer (Elite)', 'Turbo Developer (₹6.5 LPA)'],
    ctcRange: '₹3.50 LPA - ₹6.50 LPA',
    verifiedUpcomingDrive: false,
    upcomingDriveDate: 'January 15, 2027',
    eligibleBatches: ['2026', '2027'],
    driveStatus: 'Drive Announced',
    eligibilityCriteria: '60% throughout 10th, 12th, and Under-Graduation. 1 backlog permitted at registration, must be cleared before onboarding.',
    recruitmentProcess: [
      { step: 1, title: 'Wipro Elite National Talent Hunt (ENTH)', desc: 'Aptitude, Written English Test (Essay), 2 Coding Questions.' },
      { step: 2, title: 'Technical + HR Combined Interview', desc: '40 mins interview covering academic projects, basic DSA, behavioral fit.' }
    ],
    experienceCount: 76,
    frequentTopics: ['Pointers & Memory', 'Linked Lists', 'SQL Queries & Subqueries', 'STAR Behavioral', 'Project Architecture'],
    latestUpdateDate: 'September 28, 2026',
    verifiedHistoricalSource: 'Wipro Elite NTH Candidate Logs',
    popularityScore: 89,
  },
  {
    id: 'accenture',
    name: 'Accenture',
    slug: 'accenture',
    logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    tier: 'Global Management Consulting',
    headquarters: 'Dublin / India',
    industry: 'Technology Consulting & Digital Services',
    roles: ['Associate Software Engineer (ASE)', 'Advanced ASE (₹6.5 LPA)'],
    ctcRange: '₹4.50 LPA - ₹6.50 LPA',
    verifiedUpcomingDrive: true,
    upcomingDriveDate: 'November 22, 2026',
    eligibleBatches: ['2026', '2027', '2028'],
    driveStatus: 'Slots Open',
    eligibilityCriteria: 'All streams eligible. Minimum 6.5 CGPA or 65% with no active backlogs. Gap year up to 1 year allowed.',
    recruitmentProcess: [
      { step: 1, title: 'Cognitive & Technical Assessment', desc: 'Critical thinking, abstract reasoning, pseudocode, cloud fundamentals.' },
      { step: 2, title: 'Coding Assessment', desc: '45 mins: 2 programming problems in language of choice.' },
      { step: 3, title: 'Communication Assessment', desc: 'Automated AI voice tool assessing pronunciation, listening, fluency.' },
      { step: 4, title: 'Virtual Interview', desc: 'Technical & HR combo: situational, projects, agile methodology.' }
    ],
    experienceCount: 98,
    frequentTopics: ['Pseudocode Tracing', 'Agile/Scrum Basics', 'Cloud Computing Concepts', 'Arrays & Strings', 'Client Facing Scenarios'],
    latestUpdateDate: 'October 11, 2026',
    verifiedHistoricalSource: 'Accenture Campus Hiring Intelligence 2025-2026',
    popularityScore: 95,
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    slug: 'deloitte',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
    tier: 'Big 4 Professional Services',
    headquarters: 'London / Hyderabad, India',
    industry: 'Consulting, Cyber & Advisory',
    roles: ['Analyst - Technology Consulting', 'Cyber Risk Analyst', 'Software Engineer'],
    ctcRange: '₹7.60 LPA - ₹11.50 LPA',
    verifiedUpcomingDrive: true,
    upcomingDriveDate: 'December 12, 2026',
    eligibleBatches: ['2026', '2027'],
    driveStatus: 'Shortlisting In Progress',
    eligibilityCriteria: 'B.Tech/BE with 60% or 6.5 CGPA. Excellent verbal communication and analytical aptitude required.',
    recruitmentProcess: [
      { step: 1, title: 'Deloitte Online Assessment', desc: 'Quantitative, Logical, Verbal, and Domain specific MCQs.' },
      { step: 2, title: 'Group Discussion / Jam Session', desc: 'Case study discussion or extempore speaking test.' },
      { step: 3, title: 'Technical Interview', desc: 'In-depth project scrutiny, database normalization, system design fundamentals.' },
      { step: 4, title: 'Partner / HR Interview', desc: 'Ethics, case-handling, business scenario solving, leadership.' }
    ],
    experienceCount: 65,
    frequentTopics: ['Case Study Problem Solving', 'Database Design & ER Diagrams', 'Cybersecurity Fundamentals', 'Ethical Dilemmas', 'System Architecture'],
    latestUpdateDate: 'October 05, 2026',
    verifiedHistoricalSource: 'Deloitte USI Campus Drive Archive',
    popularityScore: 92,
  },
  {
    id: 'capgemini',
    name: 'Capgemini',
    slug: 'capgemini',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    tier: 'Multinational IT & Consulting',
    headquarters: 'Paris / Pune, India',
    industry: 'Information Technology Services',
    roles: ['Analyst (₹4.25 LPA)', 'Senior Analyst (₹7.5 LPA)'],
    ctcRange: '₹4.25 LPA - ₹7.50 LPA',
    verifiedUpcomingDrive: false,
    upcomingDriveDate: 'January 20, 2027',
    eligibleBatches: ['2026', '2027', '2028'],
    driveStatus: 'Drive Schedule Expected',
    eligibilityCriteria: 'Minimum 60% in 10th, 12th, and Diploma/Graduation. Only 1 year gap permitted.',
    recruitmentProcess: [
      { step: 1, title: 'Technical Assessment', desc: 'Pseudocode, Data Structures, Gaming-based cognitive assessment.' },
      { step: 2, title: 'English Communication Test', desc: 'Spoken, reading, grammar, and listening analysis.' },
      { step: 3, title: 'Coding Round', desc: 'Hands on algorithmic problem solving.' },
      { step: 4, title: 'HR & Technical Interview', desc: 'Combined round assessing core skills, cultural fit, and projects.' }
    ],
    experienceCount: 58,
    frequentTopics: ['Game-Based Cognitive Logic', 'Pseudocode Debugging', 'Strings & Hashes', 'Behavioral STAR Responses'],
    latestUpdateDate: 'September 24, 2026',
    verifiedHistoricalSource: 'Capgemini Exceller Drive Records',
    popularityScore: 88,
  },
  {
    id: 'cognizant',
    name: 'Cognizant',
    slug: 'cognizant',
    logo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=128&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    tier: 'Tier 1 IT & Digital Services',
    headquarters: 'New Jersey / Chennai, India',
    industry: 'Digital Engineering & IT',
    roles: ['GenC (₹4.0 LPA)', 'GenC Elevate (₹4.5 LPA)', 'GenC Next (₹6.75 - ₹9 LPA)'],
    ctcRange: '₹4.00 LPA - ₹9.00 LPA',
    verifiedUpcomingDrive: true,
    upcomingDriveDate: 'November 30, 2026',
    eligibleBatches: ['2026', '2027'],
    driveStatus: 'GenC Registrations Active',
    eligibilityCriteria: 'B.E / B.Tech / M.E / M.Tech / MCA. Minimum 60% with no standing arrears.',
    recruitmentProcess: [
      { step: 1, title: 'Aptitude & Communication Test', desc: 'Quantitative, Analytical & Verbal Reasoning.' },
      { step: 2, title: 'Skill-Based Coding Test', desc: 'GenC Next track test covering advanced algorithms and full stack.' },
      { step: 3, title: 'Technical Interview', desc: 'Java/Python, DBMS, Web Development, Final year capstone project.' },
      { step: 4, title: 'HR Interview', desc: 'Values, relocation, shift willingness, situational judgment.' }
    ],
    experienceCount: 72,
    frequentTopics: ['Array Manipulation', 'Java Collections Framework', 'SQL Queries & Group By', 'Communication and Fit'],
    latestUpdateDate: 'October 09, 2026',
    verifiedHistoricalSource: 'Cognizant GenC Campus Selection Archive',
    popularityScore: 90,
  }
];
export const INITIAL_UPCOMING_DRIVES = [
  {
    id: 'drv-hcl-2026',
    companyId: 'hcltech',
    companyName: 'HCLTech',
    role: 'Graduate Engineer Trainee (GET)',
    ctc: '₹4.25 - ₹8.5 LPA',
    driveDate: 'Nov 18, 2026',
    driveTime: '09:00 AM',
    deadline: 'Nov 10, 2026',
    eligibleBatches: ['2026', '2027', '2028'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Noida', 'Bengaluru', 'Chennai', 'Pune', 'Hyderabad'],
    venue: 'Auditorium Hall A & Tech Computing Labs 1-4, Main Campus',
    reportingTime: '08:15 AM (Strictly 45 mins prior)',
    instructions: 'Formal business attire mandatory. Carry: 3 printed resumes, 2 passport photos, College ID card, Govt Photo ID, and a fully-charged laptop with Wi-Fi capability for online coding.',
    minCgpa: 6.5,
    minTenthPercentage: 60.0,
    minTwelfthPercentage: 60.0,
    maxBacklogs: 0,
    allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical'],
    rounds: ['Online Assessment', 'Live Coding Test', 'Technical Round 1', 'Managerial Round', 'HR Round'],
    roundConfigs: [
      { roundNumber: 1, roundName: 'Online Assessment', roundType: 'Aptitude Assessment', durationMinutes: 75, cutoffScore: 70, mode: 'Online Proctored', scheduledTime: '09:30 AM - 10:45 AM', venueOrLink: 'Tech Computing Lab 1-4' },
      { roundNumber: 2, roundName: 'Live Coding Test', roundType: 'Coding Assessment', durationMinutes: 60, cutoffScore: 75, mode: 'Hands-on Coding', scheduledTime: '11:15 AM - 12:15 PM', venueOrLink: 'Tech Computing Lab 1' },
      { roundNumber: 3, roundName: 'Technical Round 1', roundType: 'Technical Interview', durationMinutes: 45, cutoffScore: 80, mode: 'In-Person Panel', scheduledTime: '01:30 PM - 03:00 PM', venueOrLink: 'Auditorium Panel Desk #4' },
      { roundNumber: 4, roundName: 'Managerial Round', roundType: 'Managerial Round', durationMinutes: 30, cutoffScore: 75, mode: 'In-Person Panel', scheduledTime: '03:15 PM - 04:00 PM', venueOrLink: 'Conference Room B' },
      { roundNumber: 5, roundName: 'HR & Final Selection', roundType: 'HR Round', durationMinutes: 20, cutoffScore: 80, mode: 'In-Person', scheduledTime: '04:15 PM - 05:00 PM', venueOrLink: 'TPO Placement Office' }
    ],
    verifiedBadge: true
  },
  {
    id: 'drv-tcs-2026',
    companyId: 'tcs',
    companyName: 'TCS',
    role: 'TCS Ninja / Digital / Prime',
    ctc: '₹3.6 - ₹9.0 LPA',
    driveDate: 'Dec 05, 2026',
    driveTime: '10:00 AM',
    deadline: 'Nov 25, 2026',
    eligibleBatches: ['2026', '2027'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Pan-India (Virtual & In-Person)'],
    venue: 'Central Seminar Complex & Online Proctoring Lab 2',
    reportingTime: '09:15 AM',
    instructions: 'Candidate must show TCS NQT Hall Ticket and College ID card at gate check-in. Smart watches and programmable devices strictly prohibited in assessment halls.',
    minCgpa: 6.0,
    minTenthPercentage: 60.0,
    minTwelfthPercentage: 60.0,
    maxBacklogs: 1,
    allowedBranches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'],
    rounds: ['NQT Cognitive & Coding', 'Technical Interview', 'Managerial + HR'],
    roundConfigs: [
      { roundNumber: 1, roundName: 'NQT Cognitive & Coding', roundType: 'Aptitude Assessment', durationMinutes: 120, cutoffScore: 65, mode: 'Online Proctoring', scheduledTime: '10:00 AM - 12:00 PM', venueOrLink: 'Online Proctoring Lab 2' },
      { roundNumber: 2, roundName: 'Technical Interview', roundType: 'Technical Interview', durationMinutes: 40, cutoffScore: 75, mode: 'In-Person Panel', scheduledTime: '01:30 PM - 03:00 PM', venueOrLink: 'Seminar Room 1' },
      { roundNumber: 3, roundName: 'Managerial + HR', roundType: 'Managerial & HR', durationMinutes: 30, cutoffScore: 80, mode: 'In-Person Panel', scheduledTime: '03:30 PM - 04:30 PM', venueOrLink: 'Seminar Room 2' }
    ],
    verifiedBadge: true
  },
  {
    id: 'drv-accenture-2026',
    companyId: 'accenture',
    companyName: 'Accenture',
    role: 'Associate Software Engineer (ASE)',
    ctc: '₹4.5 - ₹6.5 LPA',
    driveDate: 'Nov 18, 2026', // Intentionally set to Nov 18, 2026 to showcase the Schedule Conflict Engine!
    driveTime: '10:30 AM',
    deadline: 'Nov 14, 2026',
    eligibleBatches: ['2026', '2027', '2028'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Bengaluru', 'Gurugram', 'Hyderabad', 'Pune'],
    venue: 'Virtual MS Teams Panel & Examination Center Lab 5',
    reportingTime: '10:00 AM',
    instructions: 'Ensure high-speed stable internet, quiet room with background lighting, and working webcam/mic for automated AI voice & coding proctoring.',
    minCgpa: 6.5,
    minTenthPercentage: 65.0,
    minTwelfthPercentage: 65.0,
    maxBacklogs: 0,
    allowedBranches: ['All Engineering Branches'],
    rounds: ['Cognitive Assessment', 'Coding Round', 'Communication Assessment', 'Virtual Panel'],
    roundConfigs: [
      { roundNumber: 1, roundName: 'Cognitive Assessment', roundType: 'Aptitude Assessment', durationMinutes: 90, cutoffScore: 70, mode: 'Virtual Online', scheduledTime: '10:30 AM - 12:00 PM', venueOrLink: 'MS Teams Link A' },
      { roundNumber: 2, roundName: 'Coding Round', roundType: 'Coding Assessment', durationMinutes: 45, cutoffScore: 75, mode: 'Virtual Code IDE', scheduledTime: '01:00 PM - 01:45 PM', venueOrLink: 'HackerRank Environment' },
      { roundNumber: 3, roundName: 'Communication Assessment', roundType: 'Communication Test', durationMinutes: 30, cutoffScore: 70, mode: 'Automated AI Voice', scheduledTime: '02:00 PM - 02:30 PM', venueOrLink: 'Accenture Voice Bot' },
      { roundNumber: 4, roundName: 'Virtual Panel (Tech + HR)', roundType: 'Technical Interview', durationMinutes: 35, cutoffScore: 80, mode: 'Virtual Video Call', scheduledTime: '03:00 PM - 04:00 PM', venueOrLink: 'MS Teams Room 4' }
    ],
    verifiedBadge: true
  },
  {
    id: 'drv-deloitte-2026',
    companyId: 'deloitte',
    companyName: 'Deloitte',
    role: 'Analyst - Technology Consulting',
    ctc: '₹7.6 - ₹11.5 LPA',
    driveDate: 'Dec 12, 2026',
    driveTime: '09:30 AM',
    deadline: 'Nov 30, 2026',
    eligibleBatches: ['2026', '2027'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Hyderabad', 'Bengaluru', 'Mumbai', 'Gurugram'],
    venue: 'Executive MDP Hall & Virtual Zoom Interview Suites',
    reportingTime: '08:45 AM',
    instructions: 'Dress code: Formal Western Business Suite. Carry case study prep notes, printed portfolio, and academic certificates.',
    minCgpa: 7.0,
    minTenthPercentage: 70.0,
    minTwelfthPercentage: 70.0,
    maxBacklogs: 0,
    allowedBranches: ['Computer Science', 'Information Technology', 'Circuital Branches'],
    rounds: ['Online Aptitude', 'Group Case Discussion', 'Technical Interview', 'Partner Round'],
    roundConfigs: [
      { roundNumber: 1, roundName: 'Online Aptitude & Reasoning', roundType: 'Aptitude Assessment', durationMinutes: 60, cutoffScore: 75, mode: 'Online Proctoring', scheduledTime: '09:30 AM - 10:30 AM', venueOrLink: 'MDP Hall Room 1' },
      { roundNumber: 2, roundName: 'Group Case Discussion', roundType: 'Group Discussion', durationMinutes: 45, cutoffScore: 75, mode: 'In-Person GD Table', scheduledTime: '11:00 AM - 11:45 AM', venueOrLink: 'Conference Room 3' },
      { roundNumber: 3, roundName: 'Technical & Case Interview', roundType: 'Technical Interview', durationMinutes: 45, cutoffScore: 80, mode: 'In-Person Panel', scheduledTime: '01:30 PM - 02:45 PM', venueOrLink: 'Executive Suite 2' },
      { roundNumber: 4, roundName: 'Partner & Cultural Fit', roundType: 'HR & Partner Round', durationMinutes: 30, cutoffScore: 85, mode: 'In-Person Partner', scheduledTime: '03:30 PM - 04:30 PM', venueOrLink: 'Executive Suite 1' }
    ],
    verifiedBadge: true
  },
  {
    id: 'drv-cognizant-2026',
    companyId: 'cognizant',
    companyName: 'Cognizant',
    role: 'GenC & GenC Next',
    ctc: '₹4.0 - ₹9.0 LPA',
    driveDate: 'Nov 30, 2026',
    driveTime: '09:00 AM',
    deadline: 'Nov 20, 2026',
    eligibleBatches: ['2026', '2027'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Chennai', 'Coimbatore', 'Kolkata', 'Pune'],
    venue: 'Computer Science Lab Complex (Labs 6-9)',
    reportingTime: '08:15 AM',
    instructions: 'Report with College Identity Card and registration confirmation email. Calculators not permitted.',
    minCgpa: 6.0,
    minTenthPercentage: 60.0,
    minTwelfthPercentage: 60.0,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
    rounds: ['Aptitude Test', 'Skill Coding Assessment', 'Technical Round', 'HR Round'],
    roundConfigs: [
      { roundNumber: 1, roundName: 'Aptitude & Communication Test', roundType: 'Aptitude Assessment', durationMinutes: 80, cutoffScore: 65, mode: 'Online Proctored', scheduledTime: '09:00 AM - 10:20 AM', venueOrLink: 'Lab 6' },
      { roundNumber: 2, roundName: 'Skill Coding Assessment', roundType: 'Coding Assessment', durationMinutes: 60, cutoffScore: 70, mode: 'Hands-on Coding', scheduledTime: '11:00 AM - 12:00 PM', venueOrLink: 'Lab 7' },
      { roundNumber: 3, roundName: 'Technical Interview', roundType: 'Technical Interview', durationMinutes: 35, cutoffScore: 75, mode: 'In-Person Panel', scheduledTime: '01:30 PM - 02:45 PM', venueOrLink: 'Faculty Room 4' },
      { roundNumber: 4, roundName: 'HR Round', roundType: 'HR Round', durationMinutes: 20, cutoffScore: 80, mode: 'In-Person', scheduledTime: '03:00 PM - 04:00 PM', venueOrLink: 'Faculty Room 5' }
    ],
    verifiedBadge: true
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
export const SEED_ROSTERS = {
  CSE: [
    { studentId: 'priyansh.jain@example.edu', rollNumber: '22CS0101', name: 'Priyansh Jain', email: 'priyansh.jain@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'ananya.sharma@example.edu', rollNumber: '22CS0102', name: 'Ananya Sharma', email: 'ananya.sharma@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'rohan.kulkarni@example.edu', rollNumber: '22CS0103', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'siddharth.nair@example.edu', rollNumber: '22CS0104', name: 'Siddharth Nair', email: 'siddharth.nair@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'meera.venkat@example.edu', rollNumber: '22CS0105', name: 'Meera Venkat', email: 'meera.venkat@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'kabir.mehta@example.edu', rollNumber: '22CS0106', name: 'Kabir Mehta', email: 'kabir.mehta@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'divya.reddy@example.edu', rollNumber: '22CS0107', name: 'Divya Reddy', email: 'divya.reddy@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'aarav.gupta@example.edu', rollNumber: '22CS0108', name: 'Aarav Gupta', email: 'aarav.gupta@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'ishita.verma@example.edu', rollNumber: '22CS0109', name: 'Ishita Verma', email: 'ishita.verma@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'tanmay.deshmukh@example.edu', rollNumber: '22CS0110', name: 'Tanmay Deshmukh', email: 'tanmay.deshmukh@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'sneha.iyer@example.edu', rollNumber: '22CS0111', name: 'Sneha Iyer', email: 'sneha.iyer@example.edu', department: 'CSE', semester: '6' },
    { studentId: 'aditya.rawat@example.edu', rollNumber: '22CS0112', name: 'Aditya Rawat', email: 'aditya.rawat@example.edu', department: 'CSE', semester: '6' }
  ],
  IT: [
    { studentId: 'ananya.sharma@example.edu', rollNumber: '22IT0101', name: 'Ananya Sharma', email: 'ananya.sharma@example.edu', department: 'IT', semester: '6' },
    { studentId: 'rohit.gupta@example.edu', rollNumber: '22IT0102', name: 'Rohit Gupta', email: 'rohit.gupta@example.edu', department: 'IT', semester: '6' },
    { studentId: 'kavita.sen@example.edu', rollNumber: '22IT0103', name: 'Kavita Sen', email: 'kavita.sen@example.edu', department: 'IT', semester: '6' },
    { studentId: 'deepak.joshi@example.edu', rollNumber: '22IT0104', name: 'Deepak Joshi', email: 'deepak.joshi@example.edu', department: 'IT', semester: '6' },
    { studentId: 'pooja.verma@example.edu', rollNumber: '22IT0105', name: 'Pooja Verma', email: 'pooja.verma@example.edu', department: 'IT', semester: '6' },
    { studentId: 'manish.kumar@example.edu', rollNumber: '22IT0106', name: 'Manish Kumar', email: 'manish.kumar@example.edu', department: 'IT', semester: '6' }
  ],
  ECE: [
    { studentId: 'rohan.kulkarni@example.edu', rollNumber: '22EC0101', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@example.edu', department: 'ECE', semester: '6' },
    { studentId: 'neha.patil@example.edu', rollNumber: '22EC0102', name: 'Neha Patil', email: 'neha.patil@example.edu', department: 'ECE', semester: '6' },
    { studentId: 'vikram.singh@example.edu', rollNumber: '22EC0103', name: 'Vikram Singh', email: 'vikram.singh@example.edu', department: 'ECE', semester: '6' },
    { studentId: 'sonali.nair@example.edu', rollNumber: '22EC0104', name: 'Sonali Nair', email: 'sonali.nair@example.edu', department: 'ECE', semester: '6' }
  ]
};
export function getInitialSeedSessions() {
  return [
    {
      id: 101,
      department: 'CSE',
      semester: '6',
      subjectCode: 'CS306',
      subjectName: 'Cloud Computing & Distributed Systems',
      sessionDate: '2026-10-15',
      periodNumber: 2,
      section: 'A',
      facultyId: 'FAC-CSE-042',
      facultyName: 'Dr. Neha Sharma',
      createdAt: '2026-10-15 09:00'
    },
    {
      id: 102,
      department: 'CSE',
      semester: '6',
      subjectCode: 'CS306',
      subjectName: 'Cloud Computing & Distributed Systems',
      sessionDate: '2026-10-17',
      periodNumber: 3,
      section: 'A',
      facultyId: 'FAC-CSE-042',
      facultyName: 'Dr. Neha Sharma',
      createdAt: '2026-10-17 11:15'
    },
    {
      id: 103,
      department: 'CSE',
      semester: '6',
      subjectCode: 'CS306',
      subjectName: 'Cloud Computing & Distributed Systems',
      sessionDate: '2026-10-19',
      periodNumber: 1,
      section: 'A',
      facultyId: 'FAC-CSE-042',
      facultyName: 'Dr. Neha Sharma',
      createdAt: '2026-10-19 09:00'
    },
    {
      id: 104,
      department: 'CSE',
      semester: '6',
      subjectCode: 'CS306',
      subjectName: 'Cloud Computing & Distributed Systems',
      sessionDate: '2026-10-21',
      periodNumber: 4,
      section: 'A',
      facultyId: 'FAC-CSE-042',
      facultyName: 'Dr. Neha Sharma',
      createdAt: '2026-10-21 12:15'
    }
  ];
}
export function getInitialClassSeedRecords() {
  // Attendance records across 4 sessions (IDs 101, 102, 103, 104)
  // Demonstrating:
  // Priyansh: 4/4 = 100%
  // Ananya: 3/4 = 75.0% (EXACTLY 75% -> NO shortage warning)
  // Rohan: 2/4 = 50.0% (Below 75% -> SHORTAGE ALERT)
  // Siddharth: 4/4 = 100%
  // Meera: 1/4 = 25.0% (Below 75% -> SHORTAGE ALERT)
  // Kabir: 3/4 = 75.0% (EXACTLY 75% -> NO shortage warning)
  // Divya: 4/4 = 100%
  // Aarav: 2/4 = 50.0% (Below 75% -> SHORTAGE ALERT)
  const pattern = [
    { email: 'priyansh.jain@example.edu', roll: '22CS0101', name: 'Priyansh Jain', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'ananya.sharma@example.edu', roll: '22CS0102', name: 'Ananya Sharma', s1: 'PRESENT', s2: 'ABSENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'rohan.kulkarni@example.edu', roll: '22CS0103', name: 'Rohan Kulkarni', s1: 'ABSENT', s2: 'PRESENT', s3: 'ABSENT', s4: 'PRESENT' },
    { email: 'siddharth.nair@example.edu', roll: '22CS0104', name: 'Siddharth Nair', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'LATE' },
    { email: 'meera.venkat@example.edu', roll: '22CS0105', name: 'Meera Venkat', s1: 'ABSENT', s2: 'ABSENT', s3: 'ABSENT', s4: 'PRESENT' },
    { email: 'kabir.mehta@example.edu', roll: '22CS0106', name: 'Kabir Mehta', s1: 'PRESENT', s2: 'LATE', s3: 'ABSENT', s4: 'PRESENT' },
    { email: 'divya.reddy@example.edu', roll: '22CS0107', name: 'Divya Reddy', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'aarav.gupta@example.edu', roll: '22CS0108', name: 'Aarav Gupta', s1: 'PRESENT', s2: 'ABSENT', s3: 'ABSENT', s4: 'PRESENT' },
    { email: 'ishita.verma@example.edu', roll: '22CS0109', name: 'Ishita Verma', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'tanmay.deshmukh@example.edu', roll: '22CS0110', name: 'Tanmay Deshmukh', s1: 'PRESENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'ABSENT' },
    { email: 'sneha.iyer@example.edu', roll: '22CS0111', name: 'Sneha Iyer', s1: 'LATE', s2: 'PRESENT', s3: 'PRESENT', s4: 'PRESENT' },
    { email: 'aditya.rawat@example.edu', roll: '22CS0112', name: 'Aditya Rawat', s1: 'ABSENT', s2: 'PRESENT', s3: 'PRESENT', s4: 'ABSENT' }
  ];

  const records = [];
  const sessionIds = [101, 102, 103, 104];
  const dates = ['2026-10-15', '2026-10-17', '2026-10-19', '2026-10-21'];

  pattern.forEach(p => {
    const statuses = [p.s1, p.s2, p.s3, p.s4];
    sessionIds.forEach((sId, idx) => {
      records.push({
        id: `rec-${sId}-${p.roll}`,
        sessionId: sId,
        studentId: p.email,
        studentRollNumber: p.roll,
        studentName: p.name,
        status: statuses[idx],
        remarks: statuses[idx] === 'LATE' ? 'Late arrival (10 mins)' : '',
        recordedAt: `${dates[idx]} 09:15`
      });
    });
  });

  return records;
}
export const INITIAL_CRT_TRAINING_SESSIONS = [
  {
    id: 1001,
    topic: 'Quantitative Aptitude & Speed Math Masterclass',
    moduleType: 'Quantitative Ability',
    trainerName: 'Prof. Alok Verma',
    trainerOrganization: 'Placement Training Cell',
    scheduledDate: '2026-10-12',
    timeSlot: '10:00 AM - 12:00 PM',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    venue: 'Seminar Hall 1 / Online Hybrid',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Permutations, Combinations, Probability, and high-frequency company aptitude problem patterns.',
    status: 'COMPLETED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-10 09:00',
    updatedAt: '2026-10-12 12:30'
  },
  {
    id: 1002,
    topic: 'Data Structures & Algorithms - Dynamic Programming & Trees',
    moduleType: 'Coding & DSA',
    trainerName: 'Dr. Radhika Sen',
    trainerOrganization: 'Ex-Amazon SDE / Placement Mentor',
    scheduledDate: '2026-10-16',
    timeSlot: '02:00 PM - 05:00 PM',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    venue: 'Computer Center Lab 4',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Memoization, Tabulation, Knapsack variations, and Binary Tree traversals with live coding.',
    status: 'COMPLETED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-14 10:00',
    updatedAt: '2026-10-16 17:15'
  },
  {
    id: 1003,
    topic: 'Mock HR & STAR Method Behavioral Coaching',
    moduleType: 'Soft Skills & Behavioral',
    trainerName: 'Ms. Sunita Kapoor',
    trainerOrganization: 'Corporate HR Consultant',
    scheduledDate: '2026-10-19',
    timeSlot: '11:00 AM - 01:00 PM',
    startTime: '11:00 AM',
    endTime: '01:00 PM',
    venue: 'Auditorium 2',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Behavioral interview mastery: Situation, Task, Action, Result framing for corporate culture fit.',
    status: 'COMPLETED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-17 11:00',
    updatedAt: '2026-10-19 13:10'
  },
  {
    id: 1004,
    topic: 'SQL, Indexing & ACID Transactions Deep Dive',
    moduleType: 'Technical Interview Preparation',
    trainerName: 'Prof. Tarun Gupta',
    trainerOrganization: 'Database Architect',
    scheduledDate: '2026-10-21',
    timeSlot: '03:00 PM - 05:00 PM',
    startTime: '03:00 PM',
    endTime: '05:00 PM',
    venue: 'Lab 2',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Query optimization, execution plans, B-Tree indexes, and distributed transaction isolation.',
    status: 'COMPLETED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-18 14:00',
    updatedAt: '2026-10-21 17:05'
  },
  {
    id: 1005,
    topic: 'Full-Stack System Design & Microservices Architecture',
    moduleType: 'Technical Interview Preparation',
    trainerName: 'Er. Vikram Malhotra',
    trainerOrganization: 'Principal Architect @ CloudCorp',
    scheduledDate: '2026-10-25',
    timeSlot: '10:00 AM - 01:00 PM',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Central Auditorium & MS Teams Hybrid',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Load balancing, caching strategies (Redis), CDN, horizontal scaling, and CAP theorem trade-offs.',
    status: 'SCHEDULED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-20 10:00',
    updatedAt: '2026-10-20 10:00'
  },
  {
    id: 1006,
    topic: 'Campus Coding Marathon (Round 1 Rescheduled)',
    moduleType: 'Coding & DSA',
    trainerName: 'Internal TPO Team',
    trainerOrganization: 'Placement Cell',
    scheduledDate: '2026-10-14',
    timeSlot: '09:00 AM - 12:00 PM',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    venue: 'Online Assessment Lab',
    targetBatch: '2026',
    targetBranch: 'ALL',
    academicYear: '3rd Year',
    semester: '6',
    description: 'Rescheduled due to college mid-term examination week collision.',
    status: 'CANCELLED',
    createdBy: 'teacher@placeprep.com',
    createdAt: '2026-10-10 12:00',
    updatedAt: '2026-10-13 18:00'
  }
];
export const SEED_CRT_STUDENTS = [
  { studentId: 'priyansh.jain@example.edu', rollNumber: '22CS0101', name: 'Priyansh Jain', email: 'priyansh.jain@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'ananya.sharma@example.edu', rollNumber: '22CS0102', name: 'Ananya Sharma', email: 'ananya.sharma@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'rohan.kulkarni@example.edu', rollNumber: '22CS0103', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'siddharth.nair@example.edu', rollNumber: '22CS0104', name: 'Siddharth Nair', email: 'siddharth.nair@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'meera.venkat@example.edu', rollNumber: '22CS0105', name: 'Meera Venkat', email: 'meera.venkat@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'kabir.mehta@example.edu', rollNumber: '22CS0106', name: 'Kabir Mehta', email: 'kabir.mehta@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'divya.reddy@example.edu', rollNumber: '22CS0107', name: 'Divya Reddy', email: 'divya.reddy@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'aarav.gupta@example.edu', rollNumber: '22CS0108', name: 'Aarav Gupta', email: 'aarav.gupta@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'ishita.verma@example.edu', rollNumber: '22CS0109', name: 'Ishita Verma', email: 'ishita.verma@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'tanmay.deshmukh@example.edu', rollNumber: '22CS0110', name: 'Tanmay Deshmukh', email: 'tanmay.deshmukh@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'sneha.iyer@example.edu', rollNumber: '22CS0111', name: 'Sneha Iyer', email: 'sneha.iyer@example.edu', department: 'CSE', batch: '2026' },
  { studentId: 'aditya.rawat@example.edu', rollNumber: '22CS0112', name: 'Aditya Rawat', email: 'aditya.rawat@example.edu', department: 'CSE', batch: '2026' }
];
export function getInitialCrtSeedRecords() {
  const records = [];
  const matrix = {
    '22CS0101': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'], // 4/4 = 100% (Eligible)
    '22CS0102': ['PRESENT', 'ABSENT', 'PRESENT', 'PRESENT'],  // 3/4 = 75.0% (EXACTLY 75% -> Not shortage!)
    '22CS0103': ['ABSENT', 'PRESENT', 'ABSENT', 'PRESENT'],   // 2/4 = 50.0% (Shortage <75%)
    '22CS0104': ['PRESENT', 'LATE', 'PRESENT', 'ABSENT'],     // 3/4 = 75.0% (EXACTLY 75% -> Not shortage!)
    '22CS0105': ['ABSENT', 'ABSENT', 'ABSENT', 'PRESENT'],    // 1/4 = 25.0% (Shortage <75%)
    '22CS0106': ['PRESENT', 'PRESENT', 'LATE', 'PRESENT'],    // 4/4 = 100% (Eligible)
    '22CS0107': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'], // 4/4 = 100% (Eligible)
    '22CS0108': ['PRESENT', 'ABSENT', 'ABSENT', 'PRESENT'],   // 2/4 = 50.0% (Shortage <75%)
    '22CS0109': ['PRESENT', 'PRESENT', 'ABSENT', 'PRESENT'],  // 3/4 = 75.0% (EXACTLY 75% -> Not shortage!)
    '22CS0110': ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'], // 4/4 = 100% (Eligible)
    '22CS0111': ['ABSENT', 'ABSENT', 'PRESENT', 'PRESENT'],   // 2/4 = 50.0% (Shortage <75%)
    '22CS0112': ['PRESENT', 'LATE', 'PRESENT', 'PRESENT']     // 4/4 = 100% (Eligible)
  };

  const sessions = [1001, 1002, 1003, 1004];

  SEED_CRT_STUDENTS.forEach(stu => {
    const statuses = matrix[stu.rollNumber] || ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT'];
    sessions.forEach((sessId, idx) => {
      const st = statuses[idx];
      records.push({
        id: `crt-rec-${sessId}-${stu.rollNumber}`,
        crtSessionId: sessId,
        studentId: stu.email,
        studentRollNumber: stu.rollNumber,
        studentName: stu.name,
        department: stu.department,
        status: st,
        remarks: st === 'LATE' ? 'Reported 15 mins late after lab transit' : null,
        assessmentScore: st === 'PRESENT' ? 88.0 : st === 'LATE' ? 76.0 : null,
        recordedBy: 'Dr. Neha Sharma',
        recordedAt: '2026-10-21 17:15'
      });
    });
  });

  return records;
}
export const SEED_TARGETS = [
  {
    id: 'tgt-cse-6-cs306',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 6,
    subjectCode: 'CS306',
    subjectName: 'Machine Learning & Pattern Recognition',
    assignedFaculty: 'Dr. Neha Sharma',
    facultyDesignation: 'Associate Professor',
    totalUnits: 5,
    targetPercentage: 80,
    targetDate: '2026-11-15',
    plannedPercentage: 75,
    actualPercentage: 60, // 3/5 units = 60% (Behind schedule vs planned 75%)
    status: PROGRESS_STATUSES.BEHIND_SCHEDULE,
    units: [
      { unitNumber: 1, title: 'Introduction & Supervised Learning (Linear Regression, Logistic)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 2, title: 'Classification Models & Decision Trees, Random Forests', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Unsupervised Learning (K-Means, PCA, Hierarchical Clustering)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Neural Networks & Deep Learning Foundations', status: 'In Progress', topicsCount: 6, completedTopics: 0 },
      { unitNumber: 5, title: 'Model Evaluation, Bias-Variance, Ensemble Methods', status: 'Not Started', topicsCount: 4, completedTopics: 0 }
    ],
    updatedAt: '2026-10-21 16:30',
    updatedBy: 'Prof. Alok Verma (HOD)'
  },
  {
    id: 'tgt-cse-6-cs307',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 6,
    subjectCode: 'CS307',
    subjectName: 'Information Security & Cryptography',
    assignedFaculty: 'Prof. Alok Verma',
    facultyDesignation: 'Head of Department (HOD)',
    totalUnits: 5,
    targetPercentage: 85,
    targetDate: '2026-11-20',
    plannedPercentage: 80,
    actualPercentage: 80, // 4/5 units = 80% (On Track)
    status: PROGRESS_STATUSES.ON_TRACK,
    units: [
      { unitNumber: 1, title: 'Classical Encryption, Symmetric Ciphers (AES/DES)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 2, title: 'Asymmetric Cryptography, RSA, Diffie-Hellman Key Exchange', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Cryptographic Hash Functions, SHA-256, Digital Signatures', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Network Security Protocols (IPSec, SSL/TLS, Kerberos)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 5, title: 'Intrusion Detection, Firewalls & Zero Trust Architecture', status: 'In Progress', topicsCount: 5, completedTopics: 0 }
    ],
    updatedAt: '2026-10-22 11:15',
    updatedBy: 'Prof. Alok Verma (HOD)'
  },
  {
    id: 'tgt-cse-6-cs308',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 6,
    subjectCode: 'CS308',
    subjectName: 'Cloud Computing & Microservices',
    assignedFaculty: 'Dr. Radhika Sen',
    facultyDesignation: 'Assistant Professor & Cloud Lead',
    totalUnits: 5,
    targetPercentage: 80,
    targetDate: '2026-11-18',
    plannedPercentage: 75,
    actualPercentage: 80, // 4/5 units = 80% (On Track)
    status: PROGRESS_STATUSES.ON_TRACK,
    units: [
      { unitNumber: 1, title: 'Cloud Architecture Models (IaaS, PaaS, SaaS)', status: 'Completed', topicsCount: 4, completedTopics: 4 },
      { unitNumber: 2, title: 'Virtualization & Containerization with Docker', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Microservices Design Patterns & API Gateways', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Kubernetes Orchestration & Service Mesh', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 5, title: 'Cloud Security, Serverless & AWS/GCP Deployment', status: 'In Progress', topicsCount: 4, completedTopics: 0 }
    ],
    updatedAt: '2026-10-20 14:00',
    updatedBy: 'Dr. Radhika Sen'
  },
  {
    id: 'tgt-cse-6-cs309',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 6,
    subjectCode: 'CS309',
    subjectName: 'Professional Elective I (Big Data Analytics)',
    assignedFaculty: 'Prof. Suresh Gupta',
    facultyDesignation: 'Associate Professor',
    totalUnits: 5,
    targetPercentage: 75,
    targetDate: '2026-11-10',
    plannedPercentage: 70,
    actualPercentage: 60, // 3/5 = 60% (At Risk)
    status: PROGRESS_STATUSES.AT_RISK,
    units: [
      { unitNumber: 1, title: 'Big Data Ecosystem & HDFS Architecture', status: 'Completed', topicsCount: 4, completedTopics: 4 },
      { unitNumber: 2, title: 'MapReduce Paradigm & YARN Resource Management', status: 'Completed', topicsCount: 4, completedTopics: 4 },
      { unitNumber: 3, title: 'Apache Spark In-Memory Analytics & RDDs', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'NoSQL Databases (Cassandra, MongoDB) & Sharding', status: 'In Progress', topicsCount: 5, completedTopics: 0 },
      { unitNumber: 5, title: 'Stream Processing with Apache Kafka', status: 'Not Started', topicsCount: 4, completedTopics: 0 }
    ],
    updatedAt: '2026-10-19 18:20',
    updatedBy: 'Prof. Suresh Gupta'
  },
  {
    id: 'tgt-cse-4-cs206',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 4,
    subjectCode: 'CS206',
    subjectName: 'Design and Analysis of Algorithms',
    assignedFaculty: 'Prof. Alok Verma',
    facultyDesignation: 'Head of Department (HOD)',
    totalUnits: 5,
    targetPercentage: 85,
    targetDate: '2026-11-22',
    plannedPercentage: 80,
    actualPercentage: 80, // 4/5 = 80% (On Track)
    status: PROGRESS_STATUSES.ON_TRACK,
    units: [
      { unitNumber: 1, title: 'Asymptotic Analysis & Recurrences (Master Theorem)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 2, title: 'Divide & Conquer, Greedy Strategies (MST, Huffman)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Dynamic Programming (Knapsack, LCS, Matrix Chain)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Graph Algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 5, title: 'NP-Completeness, Backtracking & Branch and Bound', status: 'In Progress', topicsCount: 5, completedTopics: 0 }
    ],
    updatedAt: '2026-10-21 09:45',
    updatedBy: 'Prof. Alok Verma (HOD)'
  },
  {
    id: 'tgt-cse-4-cs207',
    department: 'CSE',
    academicYear: '2026-2027',
    semester: 4,
    subjectCode: 'CS207',
    subjectName: 'Database Management Systems',
    assignedFaculty: 'Dr. Neha Sharma',
    facultyDesignation: 'Associate Professor',
    totalUnits: 5,
    targetPercentage: 80,
    targetDate: '2026-11-12',
    plannedPercentage: 80,
    actualPercentage: 60, // 3/5 = 60% (Behind Schedule: 20% gap)
    status: PROGRESS_STATUSES.BEHIND_SCHEDULE,
    units: [
      { unitNumber: 1, title: 'Relational Model, Relational Algebra & Calculus', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 2, title: 'Advanced SQL, Views, Triggers & Stored Procedures', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 3, title: 'Schema Refinement & Normalization (1NF to BCNF, 4NF)', status: 'Completed', topicsCount: 5, completedTopics: 5 },
      { unitNumber: 4, title: 'Transaction Management, ACID Properties & Concurrency (2PL)', status: 'In Progress', topicsCount: 5, completedTopics: 0 },
      { unitNumber: 5, title: 'Indexing, B+ Trees & Database Recovery Techniques', status: 'Not Started', topicsCount: 5, completedTopics: 0 }
    ],
    updatedAt: '2026-10-18 15:10',
    updatedBy: 'Dr. Neha Sharma'
  }
];
export const SEED_LABS = [
  {
    id: 'lab-cse-6-cs310',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS310',
    labName: 'AI & Machine Learning Laboratory',
    assignedFaculty: 'Dr. Neha Sharma',
    totalPlannedSessions: 14,
    completedSessions: 9,
    pendingSessions: 5,
    targetDate: '2026-11-20',
    completionPercentage: 64.3,
    status: PROGRESS_STATUSES.BEHIND_SCHEDULE, // Behind weekly expectation of 11 sessions
    lastSessionDate: '2026-10-15',
    remarks: 'Session 10 rescheduled due to industrial visit conflict. Practical catch-up batch required.'
  },
  {
    id: 'lab-cse-6-cs305',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS305',
    labName: 'Networking and Web Tech Lab',
    assignedFaculty: 'Dr. Radhika Sen',
    totalPlannedSessions: 14,
    completedSessions: 12,
    pendingSessions: 2,
    targetDate: '2026-11-25',
    completionPercentage: 85.7,
    status: PROGRESS_STATUSES.ON_TRACK,
    lastSessionDate: '2026-10-20',
    remarks: 'Microservices containerization exercises completed on private cloud cluster.'
  },
  {
    id: 'lab-cse-4-cs210',
    department: 'CSE',
    semester: 4,
    subjectCode: 'CS210',
    labName: 'DBMS & SQL Laboratory',
    assignedFaculty: 'Prof. Suresh Gupta',
    totalPlannedSessions: 14,
    completedSessions: 11,
    pendingSessions: 3,
    targetDate: '2026-11-22',
    completionPercentage: 78.6,
    status: PROGRESS_STATUSES.ON_TRACK,
    lastSessionDate: '2026-10-19',
    remarks: 'PL/SQL procedures and complex join queries evaluated.'
  },
  {
    id: 'lab-cse-4-cs205',
    department: 'CSE',
    semester: 4,
    subjectCode: 'CS205',
    labName: 'Data Structures & Algorithms Lab',
    assignedFaculty: 'Prof. Alok Verma',
    totalPlannedSessions: 14,
    completedSessions: 12,
    pendingSessions: 2,
    targetDate: '2026-11-28',
    completionPercentage: 85.7,
    status: PROGRESS_STATUSES.ON_TRACK,
    lastSessionDate: '2026-10-21',
    remarks: 'Graph traversal (Dijkstra) and Dynamic Programming programs verified in lab notebooks.'
  }
];
export const SEED_ASSESSMENTS = [
  {
    id: 'asm-cse-6-mid1',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS306',
    subjectName: 'Machine Learning',
    assessmentType: 'Mid-Term 1',
    assessmentName: 'Mid-Semester Theory Examination 1',
    plannedDate: '2026-10-14',
    completionDate: '2026-10-14',
    deadline: '2026-10-18',
    maxMarks: 30,
    assignedFaculty: 'Dr. Neha Sharma',
    status: 'Completed',
    remarks: 'Evaluated and marks compiled.'
  },
  {
    id: 'asm-cse-6-mid2',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS306',
    subjectName: 'Machine Learning',
    assessmentType: 'Mid-Term 2',
    assessmentName: 'Mid-Semester Theory Examination 2',
    plannedDate: '2026-11-04',
    completionDate: null,
    deadline: '2026-11-08',
    maxMarks: 30,
    assignedFaculty: 'Dr. Neha Sharma',
    status: 'Planned',
    remarks: 'Question paper submitted to HOD office.'
  },
  {
    id: 'asm-cse-6-lab-int',
    department: 'CSE',
    semester: 6,
    subjectCode: 'CS310',
    subjectName: 'AI & ML Laboratory',
    assessmentType: 'Practical Internal',
    assessmentName: 'Mid-Semester Lab Viva & Practical Coding',
    plannedDate: '2026-10-17',
    completionDate: null,
    deadline: '2026-10-20',
    maxMarks: 25,
    assignedFaculty: 'Dr. Neha Sharma',
    status: 'Overdue', // Passed deadline without completion
    remarks: 'Rescheduled viva pending due to faculty training.'
  },
  {
    id: 'asm-cse-4-mid1',
    department: 'CSE',
    semester: 4,
    subjectCode: 'CS206',
    subjectName: 'Design and Analysis of Algorithms',
    assessmentType: 'Mid-Term 1',
    assessmentName: 'Mid-Semester Theory Exam 1',
    plannedDate: '2026-10-12',
    completionDate: '2026-10-12',
    deadline: '2026-10-16',
    maxMarks: 30,
    assignedFaculty: 'Prof. Alok Verma',
    status: 'Completed',
    remarks: 'Graded and paper review session conducted.'
  },
  {
    id: 'asm-cse-4-mid2',
    department: 'CSE',
    semester: 4,
    subjectCode: 'CS207',
    subjectName: 'Database Management Systems',
    assessmentType: 'Mid-Term 2',
    assessmentName: 'Mid-Semester Theory Exam 2',
    plannedDate: '2026-11-06',
    completionDate: null,
    deadline: '2026-11-10',
    maxMarks: 30,
    assignedFaculty: 'Dr. Neha Sharma',
    status: 'Planned',
    remarks: 'Drafting question bank on Normalization and Transactions.'
  }
];
export const SEED_DEADLINES = [
  {
    id: 'dl-1',
    department: 'CSE',
    title: 'Mid-Term 1 Marks Submission & Parent Intimation',
    category: 'Internal Assessment',
    targetDate: '2026-10-20',
    status: 'Overdue',
    relatedSubjectCode: 'CS310',
    priority: 'Critical',
    description: 'All faculty must upload mid-term marks to institute portal.'
  },
  {
    id: 'dl-2',
    department: 'CSE',
    title: '75% Theory Syllabus Coverage Cutoff',
    category: 'Syllabus',
    targetDate: '2026-11-15',
    status: 'Upcoming',
    relatedSubjectCode: 'CS306',
    priority: 'High',
    description: 'Mandatory completion of at least 4 units across all 4th and 6th semester theory subjects.'
  },
  {
    id: 'dl-3',
    department: 'CSE',
    title: 'Practical Lab Experiment Sign-off (12 Experiments)',
    category: 'Laboratory',
    targetDate: '2026-11-20',
    status: 'Upcoming',
    relatedSubjectCode: 'CS310',
    priority: 'High',
    description: 'Completion of 12 mandatory lab experiments with student lab records signed.'
  },
  {
    id: 'dl-4',
    department: 'CSE',
    title: 'Department Academic Council Mid-Term Review Meeting',
    category: 'Milestone',
    targetDate: '2026-10-28',
    status: 'Upcoming',
    relatedSubjectCode: 'ALL',
    priority: 'Medium',
    description: 'HOD review with subject coordinators on remedial classes and slow learner support.'
  },
  {
    id: 'dl-5',
    department: 'CSE',
    title: 'Course Outcomes (CO) Attainment Matrix Upload',
    category: 'Milestone',
    targetDate: '2026-10-10',
    status: 'Completed',
    relatedSubjectCode: 'ALL',
    priority: 'Medium',
    description: 'NBA accreditation alignment and CO-PO mapping submission.'
  }
];
export function seedTestRecords(type = 'academic') {
 const records={
  placeprep_student_academic_records: (type === 'attendance' ? Object.values(SEED_ROSTERS).flat() : type === 'crt' ? SEED_CRT_STUDENTS : INITIAL_STUDENT_RECORDS).map(student => ({...student, fullName: student.fullName || student.name, branchCode: student.department || (student.branch?.includes('Computer Science') ? 'CSE' : student.branch?.includes('Information Technology') ? 'IT' : student.branch?.includes('Electronics') ? 'ECE' : student.branch), semester: student.currentSemester || student.semester || 6, graduationBatch: student.graduationBatch || student.batch || '2026'})),
  placeprep_backlog_records:INITIAL_BACKLOG_RECORDS,
  placeprep_custom_companies:INITIAL_COMPANIES,
  placeprep_custom_drives:INITIAL_UPCOMING_DRIVES,
  placeprep_candidates_pipeline:INITIAL_CANDIDATES_PIPELINE,
  placeprep_attendance_sessions_v2:getInitialSeedSessions(),
  placeprep_attendance_records_v2:getInitialClassSeedRecords(),
  placeprep_crt_sessions_v3:INITIAL_CRT_TRAINING_SESSIONS,
  placeprep_crt_records_v3:getInitialCrtSeedRecords(),
  placeprep_curriculum_targets_v1:SEED_TARGETS,
  placeprep_curriculum_labs_v1:SEED_LABS,
  placeprep_curriculum_assessments_v1:SEED_ASSESSMENTS,
  placeprep_curriculum_deadlines_v1:SEED_DEADLINES
 };
 for (const [key,value]of Object.entries(records))localStorage.setItem(key,JSON.stringify(value));
}
