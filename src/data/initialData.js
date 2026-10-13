// PlacePrep AI - Comprehensive Historical & Placement Dataset

export const INITIAL_BATCHES = [
  { id: '2026', label: '2026 Batch', status: 'Graduating Soon / Immediate Drives', desc: 'Final year students targeting campus & off-campus hiring' },
  { id: '2027', label: '2027 Batch', status: 'Pre-Final Year / Internships & Early Drives', desc: 'Eligible for summer internships & early fast-track placement drives' },
  { id: '2028', label: '2028 Batch', status: 'Sophomore / Foundational & Foundation Drives', desc: 'Eligible for national hackathons, mentorship drives & talent programs' },
  { id: '2029', label: '2029 Batch', status: 'Freshers / Exploration & Basics', desc: 'Building fundamentals in DSA, Core CS, and communication' },
  { id: 'Other', label: 'Other / Alumni', status: 'Lateral & Off-Campus Hiring', desc: 'Specialized drives, pool campus & experienced tracks' },
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
    deadline: 'Nov 10, 2026',
    eligibleBatches: ['2026', '2027', '2028'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Noida', 'Bengaluru', 'Chennai', 'Pune', 'Hyderabad'],
    rounds: ['Online Assessment', 'Technical Round', 'Managerial Round', 'HR Round'],
    verifiedBadge: true
  },
  {
    id: 'drv-tcs-2026',
    companyId: 'tcs',
    companyName: 'TCS',
    role: 'TCS Ninja / Digital / Prime',
    ctc: '₹3.6 - ₹9.0 LPA',
    driveDate: 'Dec 05, 2026',
    deadline: 'Nov 25, 2026',
    eligibleBatches: ['2026', '2027'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Pan-India (Virtual & In-Person)'],
    rounds: ['NQT Cognitive & Coding', 'Technical Interview', 'Managerial + HR'],
    verifiedBadge: true
  },
  {
    id: 'drv-accenture-2026',
    companyId: 'accenture',
    companyName: 'Accenture',
    role: 'Associate Software Engineer (ASE)',
    ctc: '₹4.5 - ₹6.5 LPA',
    driveDate: 'Nov 22, 2026',
    deadline: 'Nov 14, 2026',
    eligibleBatches: ['2026', '2027', '2028'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Bengaluru', 'Gurugram', 'Hyderabad', 'Pune'],
    rounds: ['Cognitive Assessment', 'Coding Round', 'Communication Assessment', 'Virtual Panel'],
    verifiedBadge: true
  },
  {
    id: 'drv-deloitte-2026',
    companyId: 'deloitte',
    companyName: 'Deloitte',
    role: 'Analyst - Technology Consulting',
    ctc: '₹7.6 - ₹11.5 LPA',
    driveDate: 'Dec 12, 2026',
    deadline: 'Nov 30, 2026',
    eligibleBatches: ['2026', '2027'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Hyderabad', 'Bengaluru', 'Mumbai', 'Gurugram'],
    rounds: ['Online Aptitude', 'Group Case Discussion', 'Technical Interview', 'Partner Round'],
    verifiedBadge: true
  },
  {
    id: 'drv-cognizant-2026',
    companyId: 'cognizant',
    companyName: 'Cognizant',
    role: 'GenC & GenC Next',
    ctc: '₹4.0 - ₹9.0 LPA',
    driveDate: 'Nov 30, 2026',
    deadline: 'Nov 20, 2026',
    eligibleBatches: ['2026', '2027'],
    status: 'Verified Upcoming Drive',
    registrationLink: '#',
    locations: ['Chennai', 'Coimbatore', 'Kolkata', 'Pune'],
    rounds: ['Aptitude Test', 'Skill Coding Assessment', 'Technical Round', 'HR Round'],
    verifiedBadge: true
  }
];

export const INITIAL_QUESTIONS = [
  // HCLTech Technical Questions
  {
    id: 'hcl-tech-01',
    companyId: 'hcltech',
    round: 'technical',
    category: 'DBMS and SQL',
    difficulty: 'Medium',
    question: 'What is the difference between WHERE and HAVING clause in SQL? Write a query using both.',
    frequencyScore: 92,
    recencyRating: 'High',
    timesReported: 28,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['SQL', 'DBMS', 'Group By', 'Data Aggregation'],
    approach: 'Define WHERE (row-level filtering before aggregation) and HAVING (group-level filtering after GROUP BY). Then provide an executive query example showing a department-wise average salary filter.',
    suggestedAnswer: `WHERE filters individual records BEFORE aggregation occurs, whereas HAVING filters groups of aggregated records AFTER the GROUP BY clause has executed. WHERE cannot operate directly on aggregate functions like COUNT(), SUM(), AVG(), while HAVING is explicitly designed for them.

Example Query:
SELECT department_id, AVG(salary) AS avg_sal, COUNT(*) AS emp_count
FROM employees
WHERE status = 'Active'
GROUP BY department_id
HAVING AVG(salary) > 50000;`,
    followUps: [
      'Can HAVING clause be used without a GROUP BY clause in SQL?',
      'How does the SQL query execution order differ from the written order of keywords?'
    ]
  },
  {
    id: 'hcl-tech-02',
    companyId: 'hcltech',
    round: 'technical',
    category: 'Data Structures and Algorithms',
    difficulty: 'Medium',
    question: 'How do you detect and remove a loop in a Singly Linked List? Explain Floyd\'s Cycle Detection algorithm.',
    frequencyScore: 89,
    recencyRating: 'High',
    timesReported: 24,
    lastReportedDate: 'September 2026',
    verifiedHistorical: true,
    skills: ['Pointers', 'Linked Lists', 'Floyd Cycle Algorithm', 'Time Complexity'],
    approach: 'Use two pointers: slow (1 step) and fast (2 steps). When they meet, a cycle exists. To find the loop start, reset slow to head, advance both 1 step at a time until they meet.',
    suggestedAnswer: `Floyd's Cycle-Finding Algorithm (Tortoise and Hare) operates in O(N) time and O(1) auxiliary space:
1. Initialize two pointers: slow and fast at head.
2. Advance slow by 1 step (slow = slow.next) and fast by 2 steps (fast = fast.next.next).
3. If fast or fast.next is NULL, no cycle exists.
4. If slow and fast meet, a cycle is confirmed.
5. To find starting node of the loop: Keep fast at the meeting node, move slow back to head. Now advance both 1 node at a time. The point where they meet is the start of the loop!
6. To remove: Trace the last node of the cycle and set its next pointer to NULL.`,
    sampleCode: `// Java / C++ Implementation Concept
boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) return false;
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
    followUps: [
      'What is the mathematical proof behind why resetting slow to head finds the starting node?',
      'Can you detect a cycle using a HashSet and what are its trade-offs?'
    ]
  },
  {
    id: 'hcl-tech-03',
    companyId: 'hcltech',
    round: 'technical',
    category: 'Object-Oriented Programming',
    difficulty: 'Easy',
    question: 'What are the 4 fundamental pillars of OOP? How does Abstraction differ from Encapsulation?',
    frequencyScore: 95,
    recencyRating: 'High',
    timesReported: 35,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['OOPs', 'Encapsulation', 'Abstraction', 'Polymorphism', 'Inheritance'],
    approach: 'State the four pillars briefly (Encapsulation, Abstraction, Inheritance, Polymorphism). Use the real-world car accelerator or ATM machine example to clearly contrast hiding data (Encapsulation) vs hiding complexity (Abstraction).',
    suggestedAnswer: `The 4 pillars are:
1. Encapsulation: Binding data (variables) and methods operating on that data into a single unit (class), protecting internal state with access modifiers (private/protected) and getters/setters.
2. Abstraction: Showing only essential features to the outside world while hiding implementation complexities (e.g., via abstract classes or interfaces).
3. Inheritance: Reusing code where a child class acquires fields and methods of a parent class.
4. Polymorphism: Ability of an object or method to take many forms (Compile-time via overloading, Run-time via overriding).

Difference:
- Encapsulation is about Data Hiding ("How is it stored/protected?").
- Abstraction is about Implementation Hiding ("What does it do, not how it does it?").
Example: In a Car, you press the gas pedal (Abstraction - you don't need to know combustion mechanics). The fuel tank is locked and accessed only through designated valves (Encapsulation).`,
    followUps: [
      'Can an abstract class have constructors in Java or C++?',
      'Can an interface contain method implementations in Java 8+?'
    ]
  },
  {
    id: 'hcl-tech-04',
    companyId: 'hcltech',
    round: 'technical',
    category: 'Operating Systems',
    difficulty: 'Medium',
    question: 'What is a Deadlock? What are the four Coffman conditions necessary for a deadlock to occur?',
    frequencyScore: 84,
    recencyRating: 'Medium',
    timesReported: 19,
    lastReportedDate: 'August 2026',
    verifiedHistorical: true,
    skills: ['OS', 'Concurrency', 'Deadlocks', 'Resource Allocation'],
    approach: 'Define deadlock as a state where a set of processes are blocked because each holds a resource needed by another. Detail the 4 Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
    suggestedAnswer: `A deadlock occurs in multi-programming environments when two or more processes are permanently blocked because each is waiting for a resource that the other process is holding.

The 4 Coffman conditions:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must currently hold at least one resource and be waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be forcibly seized from a process; they can only be released voluntarily.
4. Circular Wait: A closed chain of processes exists such that P0 waits for a resource held by P1, P1 waits for P2, and Pn waits for P0.

Deadlock Prevention works by invalidating at least one of these 4 conditions.`,
    followUps: [
      'How does the Banker\'s Algorithm work for deadlock avoidance?',
      'What is the difference between Deadlock and Starvation?'
    ]
  },

  // HCLTech HR Questions
  {
    id: 'hcl-hr-01',
    companyId: 'hcltech',
    round: 'hr',
    category: 'HR Interview',
    difficulty: 'Easy',
    question: 'Tell me about yourself. Walk me through your academic and technical background.',
    frequencyScore: 99,
    recencyRating: 'High',
    timesReported: 45,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Self Introduction', 'Communication', 'STAR Structure', 'Professionalism'],
    approach: 'Use the Present-Past-Future framework: 1. Present role/degree and college. 2. Key projects, technical competencies & milestones. 3. Why you are eager to contribute to HCLTech.',
    suggestedAnswer: `Good morning/afternoon, sir/ma'am. I am Priyansh Jain, currently pursuing my B.Tech in Computer Science and Engineering. 

Throughout my college journey, I have built a strong foundation in core computer science, particularly Data Structures, Object-Oriented Programming, and Full Stack Web Technologies. Recently, I developed an automated placement preparation portal that leverages data analytics to categorize interview experiences for college peers. This taught me not just coding, but end-to-end problem solving, database design, and working under strict deadlines.

Beyond academics, I enjoy participating in technical hackathons and competitive coding, which has helped me hone my logical thinking and adaptability.

HCLTech is globally renowned for its culture of Ideapreneurship and technological innovation. As I step into the corporate world, I am eager to start my career with HCLTech where I can contribute proactively to real-world software solutions and continuously learn from industry experts.`,
    followUps: [
      'What is the single proudest achievement mentioned on your resume?',
      'If you could change one decision in your college journey, what would it be?'
    ]
  },
  {
    id: 'hcl-hr-02',
    companyId: 'hcltech',
    round: 'hr',
    category: 'HR Interview',
    difficulty: 'Medium',
    question: 'Why HCLTech? What sets HCLTech apart from other IT consulting firms?',
    frequencyScore: 93,
    recencyRating: 'High',
    timesReported: 32,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Company Research', 'Motivation', 'Culture Alignment'],
    approach: 'Mention specific initiatives: HCLTech\'s unique "Ideapreneurship" philosophy where grassroots innovation is rewarded, its deep engineering roots, global client base, and robust continuous learning programs like HCLTech Talent Academy.',
    suggestedAnswer: `I admire HCLTech for three distinct reasons:
First is its unique philosophy of 'Ideapreneurship'—putting innovation in the hands of grassroots engineers. It empowers entry-level engineers like myself to propose solutions directly improving client outcomes.
Second, HCLTech has deep roots in core engineering and R&D services, spanning digital engineering, cloud transformation, and AI, which provides fresh graduates an extraordinary breadth of technical exposure.
Third, my seniors working at HCLTech have consistently spoken about the supportive learning culture and mentorship programs. Joining HCLTech means learning in an environment that prioritizes employee growth while solving mission-critical business problems.`,
    followUps: [
      'Are you open to relocating to any HCLTech delivery center across India (Noida, Chennai, Bengaluru, Pune)?',
      'Are you comfortable working in rotating shifts or supporting global clients?'
    ]
  },
  {
    id: 'hcl-hr-03',
    companyId: 'hcltech',
    round: 'hr',
    category: 'HR Interview',
    difficulty: 'Medium',
    question: 'Where do you see yourself in the next 3 to 5 years?',
    frequencyScore: 88,
    recencyRating: 'High',
    timesReported: 27,
    lastReportedDate: 'September 2026',
    verifiedHistorical: true,
    skills: ['Career Goals', 'Commitment', 'Ambition', 'Stability'],
    approach: 'Balance short-term mastery with long-term value addition. Year 1-2: Master tech stack, deliver reliable code. Year 3-5: Take technical ownership, mentor juniors, contribute to architectural choices.',
    suggestedAnswer: `In the initial 1 to 2 years, my priority is to master the technologies and domain assigned to me, complete internal certifications, and become a dependable contributor who delivers high-quality code with minimal supervision.

By years 3 to 5, I see myself growing into a Senior Developer or Module Lead role within HCLTech. I want to take ownership of complex technical modules, interface directly with clients to solve technical roadblocks, and mentor fresh inductees just as my seniors will mentor me today. My long-term goal is to build deep domain expertise while staying loyal to the organization that groomed me.`,
    followUps: [
      'What will you do if the technology assigned to you is not your preferred tech stack (e.g., Mainframe or Support)?',
      'Are you planning on pursuing higher studies (M.Tech / MBA) in the near future?'
    ]
  },

  // HCLTech Managerial Questions
  {
    id: 'hcl-mgr-01',
    companyId: 'hcltech',
    round: 'managerial',
    category: 'Managerial Interview',
    difficulty: 'Hard',
    question: 'Describe a situation where you had a major disagreement with a teammate during a college project. How did you resolve it?',
    frequencyScore: 91,
    recencyRating: 'High',
    timesReported: 26,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Conflict Management', 'STAR Framework', 'Teamwork', 'Maturity'],
    approach: 'Use the STAR method (Situation, Task, Action, Result). Focus on keeping discussions objective, data-driven, client/project goal focused, rather than personal.',
    suggestedAnswer: `Situation: During our final semester project, our 4-person team had a dispute over choosing between PostgreSQL (relational) vs MongoDB (NoSQL) for storing user profiles and transaction history.
Task: Two teammates strongly favored MongoDB for flexibility, while I advocated for PostgreSQL due to strict ACID compliance requirements for simulated payment logs.
Action: Instead of continuing verbal arguments, I suggested we spend 3 hours building a quick prototype benchmark. I wrote down the key requirements: relational integrity, ACID guarantees, and complex query joins. We tested both against sample data. My teammates saw how MongoDB required manual application-level transaction handling for our specific schema, while PostgreSQL handled foreign key constraints effortlessly. We also compromised by using JSONB columns in PostgreSQL for flexible metadata!
Result: The team unanimously agreed on the hybrid PostgreSQL approach. We submitted the project 4 days ahead of deadline and received an 'A' grade from the evaluating panel.`,
    followUps: [
      'What would you do if the teammate still refused to agree despite technical data?',
      'How do you handle a teammate who does not complete their assigned portion before the deadline?'
    ]
  },
  {
    id: 'hcl-mgr-02',
    companyId: 'hcltech',
    round: 'managerial',
    category: 'Managerial Interview',
    difficulty: 'Hard',
    question: 'Suppose your manager gives you a project in a completely unfamiliar technology with a tight deadline of two weeks. How do you approach this?',
    frequencyScore: 87,
    recencyRating: 'High',
    timesReported: 22,
    lastReportedDate: 'September 2026',
    verifiedHistorical: true,
    skills: ['Handling Pressure', 'Rapid Learning', 'Prioritization', 'Communication'],
    approach: '1. Deconstruct the requirements. 2. Identify core minimal viable features. 3. Fast-track fundamentals using official docs and team repositories. 4. Communicate transparently with regular progress demos.',
    suggestedAnswer: `I would tackle this systematically in four phases:
1. Scope Clarification: First, I would spend the first morning clarifying the acceptance criteria with my manager or tech lead to distinguish between the 'Must-Have' core features and 'Nice-to-Have' enhancements.
2. Rapid Targeted Learning: Rather than reading an entire 500-page book, I would inspect existing production codebases in our team to observe coding standards and architectural patterns, combined with official quick-start documentation.
3. Modular Milestones: I would divide the two-week timeline into 3-day milestones. By Day 4, I aim to have a functional skeleton/proof of concept.
4. Proactive Communication: I would provide short daily updates to my manager. If I hit an unexpected blocker that exceeds 2-3 hours of self-debugging, I would summarize my attempted solutions and seek guidance from a senior teammate without stalling the project.`,
    followUps: [
      'If by day 10 you realize you will miss the deadline by 2 days, at what point do you escalate it and to whom?'
    ]
  },

  // TCS Questions
  {
    id: 'tcs-tech-01',
    companyId: 'tcs',
    round: 'technical',
    category: 'Programming Questions',
    difficulty: 'Medium',
    question: 'How do you reverse a string without using built-in reverse functions? How would you reverse words in a sentence?',
    frequencyScore: 94,
    recencyRating: 'High',
    timesReported: 52,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Strings', 'Two Pointers', 'Array Manipulation'],
    approach: 'Two pointers from start and end swapping characters until they meet. For reversing words: reverse the entire string, then reverse each word individually.',
    suggestedAnswer: `To reverse a string in-place:
1. Convert string to character array.
2. Set pointer 'left = 0' and 'right = length - 1'.
3. While left < right, swap char[left] and char[right], then increment left and decrement right.
Time Complexity: O(N), Space Complexity: O(1) in-place.

To reverse words in "the sky is blue" to "blue is sky the":
Step 1: Reverse the entire string: "eulb si yks eht"
Step 2: Reverse each individual word delimited by space: "blue is sky the".
This avoids extra memory allocation!`,
    sampleCode: `public static String reverseWords(String s) {
    String[] words = s.trim().split("\\\\s+");
    StringBuilder sb = new StringBuilder();
    for (int i = words.length - 1; i >= 0; i--) {
        sb.append(words[i]);
        if (i > 0) sb.append(" ");
    }
    return sb.toString();
}`,
    followUps: [
      'What is String immutability in Java and why is it implemented using a String Constant Pool?',
      'What is the difference between String, StringBuilder, and StringBuffer?'
    ]
  },
  {
    id: 'tcs-tech-02',
    companyId: 'tcs',
    round: 'technical',
    category: 'DBMS and SQL',
    difficulty: 'Medium',
    question: 'What are ACID properties in a Database Management System? Explain with a banking transfer example.',
    frequencyScore: 96,
    recencyRating: 'High',
    timesReported: 48,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['DBMS', 'Transactions', 'ACID Properties', 'Data Integrity'],
    approach: 'Define Atomicity, Consistency, Isolation, and Durability. Use Account A transferring ₹5,000 to Account B to explain how each property prevents errors.',
    suggestedAnswer: `ACID guarantees reliable processing of database transactions:
1. Atomicity ('All or Nothing'): If Account A is debited ₹5,000, Account B must be credited ₹5,000. If the server crashes midway, the transaction aborts and rolls back completely.
2. Consistency ('Valid States'): The database state must satisfy all constraints. Total money (Balance A + Balance B) before the transfer must equal total money after the transfer.
3. Isolation ('Concurrent execution'): If Account A transfers money while another process is checking Account A's balance, the check will see either the pre-transfer or post-transfer balance, never an intermediate inconsistent state.
4. Durability ('Permanence'): Once a transaction is committed, changes persist even in the event of power outage or hardware failure (ensured via Write-Ahead Logging/WAL).`,
    followUps: [
      'What are the different Transaction Isolation Levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable)?',
      'What is a Dirty Read and a Phantom Read?'
    ]
  },
  {
    id: 'tcs-hr-01',
    companyId: 'tcs',
    round: 'hr',
    category: 'HR Interview',
    difficulty: 'Easy',
    question: 'Are you comfortable signing a service agreement / bond and working in shifts?',
    frequencyScore: 90,
    recencyRating: 'High',
    timesReported: 42,
    lastReportedDate: 'September 2026',
    verifiedHistorical: true,
    skills: ['Policy Adherence', 'Flexibility', 'Commitment'],
    approach: 'Acknowledge the policy positively. State that you view the agreement as mutual commitment and that shift work is a normal part of global IT delivery.',
    suggestedAnswer: `Yes, absolutely. I understand that the service agreement exists to protect the organization's substantial investment in training fresh graduates and onboarding them onto live client accounts. I am looking for long-term career growth and stability, so staying committed to TCS is fully aligned with my own goals.

Regarding shifts, IT services operate across global time zones (US, Europe, APAC). As a fresher, I am fully prepared and flexible to work in rotational shifts or weekend on-call rotations whenever project deliverables require it.`,
    followUps: [
      'What if you are assigned to a client support project instead of software development?'
    ]
  },

  // Infosys Questions
  {
    id: 'infy-tech-01',
    companyId: 'infosys',
    round: 'technical',
    category: 'Data Structures and Algorithms',
    difficulty: 'Hard',
    question: 'How do you find the longest substring without repeating characters in an optimal way?',
    frequencyScore: 88,
    recencyRating: 'High',
    timesReported: 31,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Sliding Window', 'HashMap', 'Strings', 'Optimization'],
    approach: 'Explain the Sliding Window technique with a HashMap storing last seen indices of characters. Maintain window left pointer and max length.',
    suggestedAnswer: `Using the Sliding Window + Hash Map approach achieves optimal O(N) time and O(min(m, n)) space complexity:
1. Maintain two pointers: 'left' and 'right' defining the current window, and 'maxLength = 0'.
2. Use a HashMap to store each character alongside its most recent 0-based index.
3. Traverse string with 'right' pointer:
   - If character is already in map and its index >= left, update 'left = map.get(char) + 1' (skipping past duplicate).
   - Update character's index in the map to 'right'.
   - Calculate 'maxLength = max(maxLength, right - left + 1)'.
4. Return 'maxLength'.`,
    sampleCode: `public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> map = new HashMap<>();
    int maxLen = 0, left = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (map.containsKey(c) && map.get(c) >= left) {
            left = map.get(c) + 1;
        }
        map.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    followUps: [
      'How does this differ from the Longest Palindromic Substring problem?',
      'Can you optimize space further if the character set is restricted to ASCII 128?'
    ]
  },
  {
    id: 'infy-tech-02',
    companyId: 'infosys',
    round: 'technical',
    category: 'Object-Oriented Programming',
    difficulty: 'Medium',
    question: 'What is the difference between Method Overloading and Method Overriding? Give real-world examples.',
    frequencyScore: 96,
    recencyRating: 'High',
    timesReported: 44,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Polymorphism', 'Compile Time', 'Run Time', 'Java/C++'],
    approach: 'Contrast compile-time vs run-time polymorphism, signature requirements, inheritance necessity, and return types.',
    suggestedAnswer: `Method Overloading:
- Concept: Multiple methods in the same class have the same name but different parameter lists (count, types, or order).
- Polymorphism Type: Compile-time (Static binding).
- Inheritance: Not required.
- Example: A PaymentGateway class with pay(creditCard), pay(upiId), pay(netBankingCredentials).

Method Overriding:
- Concept: A subclass provides a specific implementation for a method already declared in its parent class with identical name, parameter list, and return type.
- Polymorphism Type: Run-time (Dynamic method dispatch).
- Inheritance: Strictly required.
- Example: Parent class Shape with draw(), overridden by Circle (draws circle) and Square (draws square).`,
    followUps: [
      'Can we override private or static methods in Java?',
      'What is covariant return typing in method overriding?'
    ]
  },

  // Accenture Questions
  {
    id: 'acn-tech-01',
    companyId: 'accenture',
    round: 'technical',
    category: 'Computer Networks',
    difficulty: 'Medium',
    question: 'Explain the difference between TCP and UDP. When is UDP preferred over TCP in modern enterprise systems?',
    frequencyScore: 91,
    recencyRating: 'High',
    timesReported: 33,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Computer Networks', 'TCP/IP', 'UDP', 'Protocols'],
    approach: 'Compare connection-oriented vs connectionless, reliability, overhead, header size, speed. Highlight real-time streaming, VoIP, DNS, and online gaming for UDP.',
    suggestedAnswer: `TCP (Transmission Control Protocol):
- Connection-oriented: Establishes a 3-way handshake (SYN, SYN-ACK, ACK) before data transfer.
- Reliable: Employs acknowledgments, sequence numbers, checksums, and retransmission of lost packets.
- Flow & Congestion Control: Uses sliding window algorithms.
- Overhead: 20-60 byte header.
- Use Cases: Web browsing (HTTP/HTTPS), File Transfer (FTP), Email (SMTP).

UDP (User Datagram Protocol):
- Connectionless: Sends packets ('fire and forget') without prior handshake.
- Unreliable: Packets may arrive out of order, get duplicated, or drop completely.
- Overhead: Lightweight 8-byte header, zero retransmission delay.
- Use Cases: Real-time video conferencing (Zoom/Teams), Online multiplayer games, DNS lookups, Live sports streaming.`,
    followUps: [
      'What happens during the TCP 4-way termination handshake (FIN-ACK)?',
      'What is QUIC protocol used by HTTP/3 and why is it built on UDP?'
    ]
  },

  // Deloitte Questions
  {
    id: 'del-mgr-01',
    companyId: 'deloitte',
    round: 'managerial',
    category: 'Managerial Interview',
    difficulty: 'Hard',
    question: 'You discover that a senior colleague made a critical calculation error in a client presentation scheduled for tomorrow morning. What do you do?',
    frequencyScore: 93,
    recencyRating: 'High',
    timesReported: 24,
    lastReportedDate: 'October 2026',
    verifiedHistorical: true,
    skills: ['Ethics', 'Discretion', 'Client Focus', 'Diplomacy'],
    approach: 'Show respect, verify facts first, approach privately and constructively, prioritize client accuracy without humiliating the colleague.',
    suggestedAnswer: `I would handle this with tact, urgency, and discretion:
1. Double Check My Own Math: Before raising any alert, I would independently re-verify the numbers and data sources to ensure 100% certainty that it is indeed an error.
2. Private, Respectful Communication: I would speak to the senior colleague privately (via direct call or private meeting) rather than broadcasting it in a group email or team meeting.
3. Solution-Oriented Framing: I would frame it collaboratively: "While reviewing slide 14, I noticed the margin computation shows 18% instead of 24% according to our baseline dataset. Could you review this with me to ensure we are aligned before tomorrow's client presentation?"
4. Provide the Ready Fix: I would come prepared with the corrected calculation and updated graphic so the colleague can implement the fix immediately without panic.
This protects client trust, supports the colleague, and ensures our firm delivers flawless deliverables.`,
    followUps: [
      'What if the colleague dismisses your observation and insists on presenting the wrong numbers?'
    ]
  }
];

export const INITIAL_EXPERIENCES = [
  {
    id: 'exp-01',
    companyId: 'hcltech',
    companyName: 'HCLTech',
    studentName: 'Aman Sharma',
    batch: '2026',
    role: 'Graduate Engineer Trainee',
    interviewDate: 'September 2026',
    college: 'Vellore Institute of Technology',
    branch: 'B.Tech CSE',
    overallRating: 5,
    outcome: 'Selected',
    roundsFaced: ['Online Assessment', 'Technical Interview', 'Managerial Round', 'HR Round'],
    questionsEncountered: [
      'Difference between Abstract class and Interface in Java 8',
      'SQL Query: Find second highest salary with and without subquery',
      'Detect loop in linked list and print the node',
      'Why HCLTech and willingness to relocate to Chennai or Noida?'
    ],
    difficulty: 'Medium',
    tips: 'Focus heavily on OOPs concepts and SQL joins. The technical interviewer asked me to share my screen and write queries on MySQL Workbench live. In HR, be confident about relocation and shift timings!',
    verified: true,
    helpfulVotes: 48,
    isAnonymous: false
  },
  {
    id: 'exp-02',
    companyId: 'tcs',
    companyName: 'TCS',
    studentName: 'Sneha Patel',
    batch: '2026',
    role: 'TCS Digital',
    interviewDate: 'August 2026',
    college: 'SRM Institute of Science & Tech',
    branch: 'B.Tech IT',
    overallRating: 4,
    outcome: 'Selected',
    roundsFaced: ['TCS NQT (Advanced Track)', 'Technical Panel', 'HR Round'],
    questionsEncountered: [
      'Explain microservices architecture compared to monolithic',
      'Reverse words in a sentence without using split() function in C++',
      'Deadlock conditions and prevention strategies in Linux',
      'Are you open to signing the 1-year service agreement?'
    ],
    difficulty: 'Medium-Hard',
    tips: 'For TCS Digital, cognitive section matters for qualification, but coding round determines whether you get Ninja vs Digital. Brush up on cloud concepts and DSA up to Dynamic Programming.',
    verified: true,
    helpfulVotes: 64,
    isAnonymous: false
  },
  {
    id: 'exp-03',
    companyId: 'hcltech',
    companyName: 'HCLTech',
    studentName: 'Candidate (Anonymous)',
    batch: '2028',
    role: 'Accelerated Summer Intern / Tech Trainee',
    interviewDate: 'October 2026',
    college: 'Thapar University',
    branch: 'B.Tech CSE',
    overallRating: 5,
    outcome: 'Selected',
    roundsFaced: ['Aptitude + Coding Test', 'Technical Round'],
    questionsEncountered: [
      'Explain ACID properties with an ATM transaction scenario',
      'Write a function to check if a binary tree is balanced',
      'What are indexes in SQL and why do they speed up lookups?'
    ],
    difficulty: 'Medium',
    tips: 'For the 2028 batch internship drive, interviewers were very supportive. They tested fundamental problem solving and basic database logic rather than obscure algorithms.',
    verified: true,
    helpfulVotes: 37,
    isAnonymous: true
  },
  {
    id: 'exp-04',
    companyId: 'deloitte',
    companyName: 'Deloitte',
    studentName: 'Rohan Mehra',
    batch: '2026',
    role: 'Analyst - Tech Consulting',
    interviewDate: 'September 2026',
    college: 'BITS Pilani',
    branch: 'B.E. Computer Science',
    overallRating: 5,
    outcome: 'Selected',
    roundsFaced: ['Aptitude', 'Group Discussion', 'Technical Interview', 'Partner Round'],
    questionsEncountered: [
      'Case study: Designing an inventory management system for a retail chain',
      'Normalization up to BCNF with practical anomalies',
      'How to handle conflict between business logic and tech constraints?'
    ],
    difficulty: 'Hard',
    tips: 'Deloitte places huge emphasis on communication and structuring thoughts. In the technical round, walk them through your thought process before writing a single line of pseudocode.',
    verified: true,
    helpfulVotes: 52,
    isAnonymous: false
  }
];

export const INITIAL_AI_INSIGHTS = {
  hcltech: {
    companyId: 'hcltech',
    dataFreshness: 'October 2026',
    totalSamplesAnalyzed: 84,
    confidenceScore: '94%',
    verifiedSourcesBadge: 'Verified Historical Records (2024-2026 Drives)',
    frequentQuestions: [
      { question: 'SQL Joins & Finding Nth Highest Salary', frequency: '38% of interviews', trend: '+12% this year', category: 'DBMS' },
      { question: 'Difference between Abstract Class & Interface (Java 8+)', frequency: '34% of interviews', trend: 'Consistent', category: 'OOP' },
      { question: 'Detect & Remove Cycle in Linked List', frequency: '29% of interviews', trend: '+8% this year', category: 'DSA' },
      { question: 'Tell me about yourself (STAR format project overview)', frequency: '96% of HR rounds', trend: 'Universal', category: 'HR' }
    ],
    trendingTopics: [
      { topic: 'REST APIs & Web Services Architecture', change: '+42% increase in 2026 drives', reason: 'Rising enterprise demand for cloud-connected backend developers' },
      { topic: 'SQL Performance Tuning & Indexing', change: '+28% increase', reason: 'Shift from basic syntax to practical data operations' },
      { topic: 'Git Version Control & Agile/Scrum Workflow', change: '+35% increase', reason: 'Assess candidates readiness for immediate sprint onboarding' },
      { topic: 'Exception Handling & Clean Code Principles', change: '+18% increase', reason: 'Evaluating maintainable code practices' }
    ],
    historicalVsRecentAnalysis: {
      olderTrends: '2023-2024 interviews heavily focused on basic C/C++ pointer manipulation, static sorting algorithms, and standard definition-based questions.',
      recentTrends: '2025-2026 interviews emphasize real-world project code walkthroughs, API integration, database indexing, and situational problem-solving in managerial rounds.',
      keyTakeaway: 'Prepare to explain your resume projects line-by-line rather than just reciting theory.'
    },
    preparationPriority: [
      { priority: 'High Priority (Must-Do)', topics: ['DBMS & Complex SQL Queries', 'OOPs in Java/C++', 'Arrays, Linked Lists, Trees', 'Core Resume Project Explanations'] },
      { priority: 'Medium Priority (Concept Reinforcement)', topics: ['Operating Systems (Threads, Deadlocks, Paging)', 'Computer Networks (OSI, TCP/IP, DNS)', 'STAR Method Behavioral Responses'] },
      { priority: 'Additional Practice', topics: ['Dynamic Programming (Memoization)', 'System Design High-Level Overview', 'Cloud Computing (AWS/Azure fundamentals)'] }
    ],
    disclaimer: 'Note: AI insights are grounded strictly in historical campus recruitment records and feedback transcripts. They reflect statistical recurring patterns and do not claim that any specific question is guaranteed in upcoming drives.'
  },
  tcs: {
    companyId: 'tcs',
    dataFreshness: 'October 2026',
    totalSamplesAnalyzed: 142,
    confidenceScore: '96%',
    verifiedSourcesBadge: 'Verified TCS NQT & Prime Archives',
    frequentQuestions: [
      { question: 'String manipulation without built-in library functions', frequency: '44% of coding tests', trend: '+15% recency', category: 'Coding' },
      { question: 'ACID Properties with Real-Life Banking Example', frequency: '39% of technical rounds', trend: 'Universal', category: 'DBMS' },
      { question: 'SDLC Phases vs Agile Scrum Ceremonies', frequency: '31% of technical rounds', trend: '+20%', category: 'Software Eng' },
      { question: 'Why TCS over competitors and bond willingness', frequency: '92% of HR interviews', trend: 'Standard', category: 'HR' }
    ],
    trendingTopics: [
      { topic: 'Cloud Fundamentals (AWS/Azure/GCP Basics)', change: '+50% in Prime & Digital tracks', reason: 'High demand for cloud migration projects' },
      { topic: 'Full Stack Integration (React + Spring/Node)', change: '+34%', reason: 'Evaluates project depth' }
    ],
    historicalVsRecentAnalysis: {
      olderTrends: 'Ninja round focused predominantly on quantitative MCQs and basic C loops.',
      recentTrends: 'Significant rise in multi-language coding questions and scenario-based questions evaluating production readiness.',
      keyTakeaway: 'Focus on writing bug-free code handling corner test cases under time limits.'
    },
    preparationPriority: [
      { priority: 'High Priority (Must-Do)', topics: ['Cognitive Reasoning & Numerical Aptitude', 'String & Array Algorithms', 'DBMS & SQL', 'Agile Principles'] },
      { priority: 'Medium Priority (Concept Reinforcement)', topics: ['OOPs Architecture', 'Operating Systems Virtual Memory', 'Company Values (Tata Code of Conduct)'] },
      { priority: 'Additional Practice', topics: ['Graph Traversal (BFS/DFS)', 'Microservices Architecture', 'Cybersecurity basics'] }
    ],
    disclaimer: 'Note: Grounded in historical TCS NQT candidate reports. Does not guarantee future question appearance.'
  }
};
