package com.placeprep.config;

import com.placeprep.model.*;
import com.placeprep.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private InterviewQuestionRepository questionRepository;

    @Autowired
    private InterviewExperienceRepository experienceRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCompanies();
        seedDrives();
        seedQuestions();
        seedExperiences();
        seedCandidates();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            // Seed Admin
            User admin = new User();
            admin.setName("Placement Officer (Admin)");
            admin.setEmail("admin@placeprep.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setCollege("University Training & Placement Cell");
            admin.setBranch("Directorate of Placements");
            admin.setGraduationBatch("Faculty");
            admin.setRole("admin");
            admin.setOnboardingCompleted(true);
            userRepository.save(admin);

            // Seed Student
            User student = new User();
            student.setName("Priyansh Jain");
            student.setEmail("student@placeprep.com");
            student.setPassword(passwordEncoder.encode("Student@123"));
            student.setCollege("Delhi Technological University (DTU)");
            student.setBranch("Computer Science and Engineering");
            student.setGraduationBatch("2028");
            student.setRole("student");
            student.setOnboardingCompleted(true);
            student.setSavedCompanyIds(new ArrayList<>(Arrays.asList("hcltech", "tcs", "deloitte")));
            student.setSavedQuestionIds(new ArrayList<>(Arrays.asList("hcl-tech-01", "tcs-tech-01", "core-dbms-01")));
            student.setPracticedQuestionIds(new ArrayList<>(Arrays.asList("dsa-ll-01", "core-oop-01")));
            student.setRevisionQuestionIds(new ArrayList<>(Arrays.asList("core-os-01")));
            userRepository.save(student);
        }
    }

    private void seedCompanies() {
        if (companyRepository.count() == 0) {
            companyRepository.save(new Company(
                    null,
                    "hcltech",
                    "HCLTech",
                    "hcltech",
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
                    "Tier 1 IT Services",
                    "Noida, India",
                    "Information Technology & Consulting",
                    "₹4.25 LPA - ₹8.50 LPA",
                    true,
                    "November 18, 2026",
                    "Registration Open",
                    "B.Tech/B.E/M.Tech (CS, IT, ECE, EE), MCA. Minimum 65% or 6.5 CGPA in 10th, 12th & Graduation. Max 1 active backlog permitted at application time.",
                    "[{\"step\":1,\"title\":\"Online Assessment\",\"desc\":\"90 mins: Aptitude, Logical & 2 Coding Problems\"},{\"step\":2,\"title\":\"Technical Interview\",\"desc\":\"45-60 mins: Core CS, DSA, Live Coding\"},{\"step\":3,\"title\":\"Managerial Round\",\"desc\":\"30 mins: Behavioral scenarios & project scrutiny\"},{\"step\":4,\"title\":\"HR Round\",\"desc\":\"20 mins: Cultural alignment & communication\"}]",
                    84,
                    96,
                    "October 10, 2026",
                    "Verified from 84 verified candidate experiences across 2024-2026 drives",
                    Arrays.asList("2026", "2027", "2028"),
                    Arrays.asList("Graduate Engineer Trainee (GET)", "Software Engineer", "Specialist Programmer"),
                    Arrays.asList("SQL Joins & Indexing", "Java OOP & Streams", "Binary Trees & Graphs", "REST APIs", "Cloud Basics")
            ));

            companyRepository.save(new Company(
                    null,
                    "tcs",
                    "TCS (Tata Consultancy Services)",
                    "tcs",
                    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=128&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
                    "Global Tech Giant",
                    "Mumbai, India",
                    "IT Services, Digital Transformation",
                    "₹3.60 LPA - ₹9.00 LPA",
                    true,
                    "December 05, 2026",
                    "Upcoming National Qualifier (NQT)",
                    "Minimum 60% or 6.0 CGPA throughout 10th, 12th, Diploma, Under-Graduation. Up to 1 active backlog allowed at time of test.",
                    "[{\"step\":1,\"title\":\"TCS National Qualifier Test (NQT)\",\"desc\":\"Cognitive Test + Advanced Coding (Python, C++, Java)\"},{\"step\":2,\"title\":\"Technical Interview\",\"desc\":\"DSA, SQL, OOP, System Fundamentals\"},{\"step\":3,\"title\":\"Managerial + HR Round\",\"desc\":\"Situational, team dynamics, TCS core values\"}]",
                    142,
                    98,
                    "October 12, 2026",
                    "Verified from TCS NQT Digital & Ninja drive archives 2024-2026",
                    Arrays.asList("2026", "2027"),
                    Arrays.asList("TCS Ninja (₹3.6 LPA)", "TCS Digital (₹7.2 LPA)", "TCS Prime (₹9.0 LPA)"),
                    Arrays.asList("Recursion & Arrays", "Normalization & SQL", "SDLC & Agile", "Cloud Microservices", "Star Pattern / String Manipulation")
            ));

            companyRepository.save(new Company(
                    null,
                    "infosys",
                    "Infosys",
                    "infosys",
                    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80",
                    "Tier 1 IT Services",
                    "Bengaluru, India",
                    "Consulting & Information Technology",
                    "₹3.60 LPA - ₹9.50 LPA",
                    true,
                    "November 28, 2026",
                    "HackWithInfy & On-Campus",
                    "All Engineering branches eligible. 60% or 6.0 CGPA minimum with no active backlogs.",
                    "[{\"step\":1,\"title\":\"Online Assessment\",\"desc\":\"Reasoning, Mathematical Ability, Hands-on Coding\"},{\"step\":2,\"title\":\"Technical Interview\",\"desc\":\"Problem solving, OOPs, Database design\"},{\"step\":3,\"title\":\"HR Round\",\"desc\":\"Resume validation, personality test, communication\"}]",
                    110,
                    94,
                    "October 08, 2026",
                    "InfyTQ & On-Campus Drive Records (2024-2026)",
                    Arrays.asList("2026", "2027", "2028"),
                    Arrays.asList("Systems Engineer (SE)", "Digital Specialist Engineer (DSE)", "Specialist Programmer (SP)"),
                    Arrays.asList("Dynamic Programming Basics", "Polymorphism & Inheritance", "DBMS ACID properties", "Exception Handling", "REST APIs")
            ));

            companyRepository.save(new Company(
                    null,
                    "deloitte",
                    "Deloitte",
                    "deloitte",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200&auto=format&fit=crop&q=80",
                    "Big 4 Professional Services",
                    "London / Hyderabad",
                    "Management & Technology Consulting",
                    "₹7.60 LPA - ₹11.50 LPA",
                    true,
                    "January 15, 2027",
                    "Applications Closing Soon",
                    "Minimum 65% aggregate with zero active backlogs. High analytical and verbal reasoning aptitude required.",
                    "[{\"step\":1,\"title\":\"Online Cognitive & Versant Test\",\"desc\":\"Aptitude, Business English & Coding Assessment\"},{\"step\":2,\"title\":\"Technical Assessment\",\"desc\":\"Architecture, Cloud, SQL, Data modeling\"},{\"step\":3,\"title\":\"Partner / Leadership Interview\",\"desc\":\"Case scenarios, leadership under ambiguity, client management\"}]",
                    78,
                    95,
                    "October 14, 2026",
                    "Verified from Deloitte USI Campus Drives 2025-2026",
                    Arrays.asList("2026", "2027"),
                    Arrays.asList("Analyst - Technology Consulting", "Associate Analyst - Cyber Risk", "Cloud Engineering Consultant"),
                    Arrays.asList("System Architecture Basics", "SQL Complex Queries", "Behavioral STAR Scenarios", "Cloud Fundamentals", "Agile Methodology")
            ));

            companyRepository.save(new Company(
                    null,
                    "accenture",
                    "Accenture",
                    "accenture",
                    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=128&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop&q=80",
                    "Global Strategy & Consulting",
                    "Dublin / Bengaluru",
                    "Technology Consulting & Cloud Solutions",
                    "₹4.50 LPA - ₹12.00 LPA",
                    true,
                    "December 18, 2026",
                    "Campus Drive Announced",
                    "All B.Tech streams with 65% or 6.5 CGPA. Up to 1 backlog permitted at registration.",
                    "[{\"step\":1,\"title\":\"Cognitive & Technical Assessment\",\"desc\":\"Aptitude, Technical MCQs & 2 Coding Questions\"},{\"step\":2,\"title\":\"Coding Assessment\",\"desc\":\"Hands-on Algorithmic Problem Solving\"},{\"step\":3,\"title\":\"Interview Round\",\"desc\":\"One-on-one Technical + Behavioral discussion\"}]",
                    92,
                    93,
                    "October 15, 2026",
                    "Accenture On-Campus Hiring Records 2024-2026",
                    Arrays.asList("2026", "2027", "2028"),
                    Arrays.asList("Associate Software Engineer (ASE)", "Advanced ASE (₹6.5 LPA)", "Digital Engineer"),
                    Arrays.asList("Data Structures (Arrays, HashMaps)", "Cloud Infrastructure", "Spring Boot & Java", "Database Indexing")
            ));

            companyRepository.save(new Company(
                    null,
                    "wipro",
                    "Wipro",
                    "wipro",
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80",
                    "Tier 1 IT Services",
                    "Bengaluru, India",
                    "Consulting & Digital Operations",
                    "₹3.50 LPA - ₹6.50 LPA",
                    false,
                    "Dates Pending Announcement",
                    "Annual Elite National Talent Hunt",
                    "60% in 10th, 12th, and Under-Graduation. Up to 1 active backlog permitted.",
                    "[{\"step\":1,\"title\":\"Wipro Elite NTH Test\",\"desc\":\"Aptitude, Written Communication, Coding\"},{\"step\":2,\"title\":\"Technical Interview\",\"desc\":\"Core Java/C++, DBMS, Project Scrutiny\"},{\"step\":3,\"title\":\"HR Round\",\"desc\":\"Relocation, shifts, personality fit\"}]",
                    64,
                    88,
                    "September 25, 2026",
                    "Wipro Elite NTH Archives",
                    Arrays.asList("2026", "2027"),
                    Arrays.asList("Project Engineer", "Turbo Candidate"),
                    Arrays.asList("C/C++ Pointers & Memory", "Basic Data Structures", "SQL CRUD Operations", "OS Processes")
            ));
        }
    }

    private void seedDrives() {
        if (driveRepository.count() == 0) {
            driveRepository.save(new PlacementDrive(
                    null,
                    "drive-hcl-2026",
                    "hcltech",
                    "HCLTech",
                    "Software Engineer (GET)",
                    "₹4.25 - ₹8.50 LPA",
                    "November 18, 2026",
                    "November 10, 2026",
                    "Open for Registration",
                    true,
                    "https://www.hcltech.com/careers/early-careers",
                    Arrays.asList("2026", "2027", "2028"),
                    Arrays.asList("Noida", "Bengaluru", "Chennai", "Pune", "Hyderabad"),
                    Arrays.asList("Online Assessment (HCL CAT)", "Technical Interview", "Managerial Round", "HR Round")
            ));

            driveRepository.save(new PlacementDrive(
                    null,
                    "drive-tcs-2026",
                    "tcs",
                    "TCS (Tata Consultancy Services)",
                    "TCS Digital & Prime Engineer",
                    "₹7.20 - ₹9.00 LPA",
                    "December 05, 2026",
                    "November 25, 2026",
                    "Registration Open (NQT Portal)",
                    true,
                    "https://www.tcs.com/careers/entry-level",
                    Arrays.asList("2026", "2027"),
                    Arrays.asList("Pan India (Multiple Centers)"),
                    Arrays.asList("National Qualifier Test (NQT)", "Technical Interview", "Managerial & HR Panel")
            ));

            driveRepository.save(new PlacementDrive(
                    null,
                    "drive-deloitte-2027",
                    "deloitte",
                    "Deloitte",
                    "Technology Analyst (USI)",
                    "₹7.60 - ₹11.50 LPA",
                    "January 15, 2027",
                    "December 20, 2026",
                    "Early Campus Shortlisting",
                    true,
                    "https://jobs2.deloitte.com",
                    Arrays.asList("2026", "2027"),
                    Arrays.asList("Hyderabad", "Bengaluru", "Gurugram", "Mumbai"),
                    Arrays.asList("Versant & Aptitude Test", "Technical Assessment", "Partner Round")
            ));

            driveRepository.save(new PlacementDrive(
                    null,
                    "drive-infosys-2026",
                    "infosys",
                    "Infosys",
                    "Digital Specialist Engineer (DSE)",
                    "₹6.25 - ₹9.50 LPA",
                    "November 28, 2026",
                    "November 15, 2026",
                    "Registration Closing Soon",
                    true,
                    "https://career.infosys.com",
                    Arrays.asList("2026", "2027", "2028"),
                    Arrays.asList("Bengaluru", "Pune", "Hyderabad", "Mysuru"),
                    Arrays.asList("Online Coding Assessment", "Technical Interview", "HR Round")
            ));

            driveRepository.save(new PlacementDrive(
                    null,
                    "drive-accenture-2026",
                    "accenture",
                    "Accenture",
                    "Advanced Associate Software Engineer",
                    "₹6.50 - ₹12.00 LPA",
                    "December 18, 2026",
                    "December 05, 2026",
                    "Upcoming Campus Drive",
                    true,
                    "https://www.accenture.com/in-en/careers",
                    Arrays.asList("2026", "2027", "2028"),
                    Arrays.asList("Bengaluru", "Gurugram", "Hyderabad", "Pune", "Chennai"),
                    Arrays.asList("Cognitive Assessment", "Technical Assessment", "Interview")
            ));
        }
    }

    private void seedQuestions() {
        if (questionRepository.count() == 0) {
            // 1. DSA - Linked List Cycle (HCLTech & General)
            questionRepository.save(new InterviewQuestion(
                    null,
                    "hcl-tech-01",
                    "hcltech",
                    "technical",
                    "Data Structures and Algorithms",
                    "Medium",
                    "How do you detect a cycle in a singly linked list, and how do you find the node where the cycle begins?",
                    "Use Floyd's Cycle-Finding Algorithm (Tortoise and Hare). Step 1: Use slow and fast pointers. If they meet, a cycle exists. Step 2: Reset slow to head while keeping fast at meeting point, and advance both 1 step at a time until they meet at cycle origin.",
                    "To detect a cycle, initialize two pointers: slow moving 1 step and fast moving 2 steps. If fast or fast.next reaches null, no cycle exists. If slow == fast, a cycle is confirmed. To find the entrance node of the cycle, reset slow to head, then advance both slow and fast by 1 step simultaneously. The node where they meet is mathematically proven to be the start of the loop.",
                    "public ListNode detectCycle(ListNode head) {\n    if (head == null || head.next == null) return null;\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) {\n            ListNode entry = head;\n            while (entry != slow) {\n                entry = entry.next;\n                slow = slow.next;\n            }\n            return entry;\n        }\n    }\n    return null;\n}",
                    92,
                    "High",
                    24,
                    "October 2026",
                    true,
                    Arrays.asList("Linked List", "Two Pointers", "Floyd Algorithm", "Memory Pointers"),
                    Arrays.asList("What is the time and space complexity? (O(N) time, O(1) auxiliary space)", "Can you solve this without modifying the linked list node values?", "How does Floyd's mathematical proof guarantee entry node discovery?")
            ));

            // 2. DBMS - SQL Joins (HCLTech & TCS)
            questionRepository.save(new InterviewQuestion(
                    null,
                    "hcl-tech-02",
                    "hcltech",
                    "technical",
                    "DBMS and SQL",
                    "Medium",
                    "Explain the difference between INNER JOIN, LEFT OUTER JOIN, and FULL OUTER JOIN with real-world examples. How does SQL indexing impact join performance?",
                    "Define join logic using relational set theory. INNER JOIN returns only records with matches in both tables. LEFT JOIN returns all left table records and matched right records. Explain how B-Tree indexes on foreign keys prevent costly full table scans.",
                    "An INNER JOIN returns only intersecting records where the join predicate matches in both tables. A LEFT OUTER JOIN preserves every row from the primary (left) table, populating right-table fields with NULL when no join match is found. A FULL OUTER JOIN combines both sets. Indexing foreign key columns drastically boosts query performance by allowing the optimizer to perform an Index Scan or Hash Join instead of quadratic O(N*M) nested loop full table scans.",
                    "-- Finding employees and their departments (including departmentless employees)\nSELECT e.emp_id, e.name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id\nWHERE e.is_active = 1;\n\n-- Create index to optimize join\nCREATE INDEX idx_emp_dept ON employees(dept_id);",
                    88,
                    "High",
                    29,
                    "October 2026",
                    true,
                    Arrays.asList("SQL", "Database Joins", "B-Tree Indexing", "Query Optimization"),
                    Arrays.asList("What happens when an unindexed column is used in an ON clause with 10M rows?", "What is the difference between WHERE clause and ON clause in a LEFT JOIN?")
            ));

            // 3. Core CS - OOP Polymorphism
            questionRepository.save(new InterviewQuestion(
                    null,
                    "core-oop-01",
                    "tcs",
                    "technical",
                    "Object-Oriented Programming",
                    "Easy",
                    "Explain Compile-time Polymorphism vs Run-time Polymorphism in Java/C++. How does dynamic method dispatch work under the hood?",
                    "Compile-time polymorphism is achieved through method overloading (same name, distinct signatures, resolved at compilation). Runtime polymorphism is achieved via method overriding (subclass implements superclass method, resolved via vtable/dynamic method dispatch during execution).",
                    "In Java, method overloading is resolved statically by the compiler based on reference type and argument signatures (static binding). Runtime polymorphism occurs when an overridden method is called through a parent class reference; the JVM uses the object's actual class vtable (virtual method table) in the method area to dynamically dispatch the call to the child implementation at runtime.",
                    "class Payment {\n    void process() { System.out.println(\"Processing generic payment\"); }\n}\nclass UpiPayment extends Payment {\n    @Override\n    void process() { System.out.println(\"Processing UPI payment via NPCI gateway\"); }\n}\n\nPayment p = new UpiPayment();\np.process(); // Dispatches to UpiPayment at runtime",
                    90,
                    "High",
                    38,
                    "October 2026",
                    true,
                    Arrays.asList("Java", "Polymorphism", "JVM Internals", "vtable"),
                    Arrays.asList("Can static or private methods be overridden in Java? Why not?", "How does the 'final' keyword prevent runtime polymorphism?")
            ));

            // 4. DSA - Two Pointers / Kadane's
            questionRepository.save(new InterviewQuestion(
                    null,
                    "dsa-arr-01",
                    "infosys",
                    "technical",
                    "Data Structures and Algorithms",
                    "Medium",
                    "Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum (Kadane's Algorithm).",
                    "Iterate through the array maintaining currentSum and maxSoFar. If currentSum becomes negative, discard it and restart at 0.",
                    "Kadane's Algorithm computes the maximum subarray sum in O(N) time with O(1) space. At each element, we determine whether to add the current element to our existing subarray or begin a new subarray starting at the current element. If currentSum drops below zero, keeping it would only penalize future elements, so we reset currentSum to 0.",
                    "public int maxSubArray(int[] nums) {\n    int maxSoFar = nums[0];\n    int currentSum = 0;\n    for (int num : nums) {\n        currentSum += num;\n        if (currentSum > maxSoFar) maxSoFar = currentSum;\n        if (currentSum < 0) currentSum = 0;\n    }\n    return maxSoFar;\n}",
                    95,
                    "High",
                    42,
                    "October 2026",
                    true,
                    Arrays.asList("Arrays", "Dynamic Programming", "Kadane's Algorithm", "Optimization"),
                    Arrays.asList("How does this algorithm adapt when all numbers in the array are negative?", "Can you reconstruct the start and end indices of the maximal subarray?")
            ));

            // 5. Operating Systems - Process vs Thread
            questionRepository.save(new InterviewQuestion(
                    null,
                    "core-os-01",
                    "deloitte",
                    "technical",
                    "Operating Systems",
                    "Medium",
                    "What is the fundamental difference between a Process and a Thread? Explain context switching overhead and memory isolation.",
                    "A process is an executing instance of a program with its own dedicated memory space (Code, Data, Heap, Stack). A thread is a lightweight execution unit within a process that shares the heap, data, and code segments while maintaining its own program counter and stack.",
                    "A Process is an independent execution unit allocated its own private virtual address space managed by the MMU, making IPC (Inter-Process Communication) necessary and inter-process context switching costly (invalidating TLB caches). Threads share the parent process's memory address space, heap, and open file descriptors, making thread context switching orders of magnitude faster. However, threads require synchronization (mutexes, semaphores) to prevent race conditions on shared memory.",
                    "// Thread creation in Java sharing memory\npublic class SharedCounter {\n    private int count = 0;\n    public synchronized void increment() { count++; }\n}",
                    86,
                    "High",
                    26,
                    "October 2026",
                    true,
                    Arrays.asList("Operating Systems", "Concurrency", "Context Switch", "Memory Management"),
                    Arrays.asList("What is a race condition and how does a critical section prevent it?", "What causes Deadlock and what are the 4 Coffman conditions?")
            ));

            // 6. Computer Networks - URL Flow
            questionRepository.save(new InterviewQuestion(
                    null,
                    "core-cn-01",
                    "accenture",
                    "technical",
                    "Computer Networks",
                    "Medium",
                    "What happens step-by-step when you type https://www.google.com in your browser and press Enter?",
                    "Walk through: 1. URL Parsing & DNS resolution (Browser cache, OS cache, Recursive resolver). 2. TCP 3-way handshake (SYN, SYN-ACK, ACK). 3. TLS/SSL Handshake (Cipher negotiation & certificate validation). 4. HTTP GET request. 5. Server response & Browser rendering.",
                    "1. DNS Lookup: Browser checks local cache, hosts file, then queries DNS recursive resolver to convert google.com into an IP address.\n2. TCP Connection: Browser initiates a 3-way handshake (SYN -> SYN/ACK -> ACK) with the server on port 443.\n3. TLS Handshake: Client and server exchange cipher suites, verify Google's SSL certificate, and establish symmetric session keys.\n4. HTTP Request: Browser transmits 'GET / HTTP/1.1' or HTTP/2 frames.\n5. Rendering: Server responds with HTML/CSS/JS, which the browser engine parses into DOM and CSSOM to render the page.",
                    "// High level TCP 3-way handshake representation\nClient --- SYN ---> Server\nClient <--- SYN-ACK --- Server\nClient --- ACK ---> Server\n[Connection Established on Port 443]",
                    91,
                    "High",
                    35,
                    "October 2026",
                    true,
                    Arrays.asList("Networking", "DNS", "TCP/IP", "TLS/SSL", "HTTP/2"),
                    Arrays.asList("Why does HTTPS use symmetric encryption for payload after asymmetric handshake?", "What is DNS TTL and how does caching prevent DDoS attacks?")
            ));

            // 7. HR - Behavioral STAR Framework
            questionRepository.save(new InterviewQuestion(
                    null,
                    "hr-star-01",
                    "hcltech",
                    "hr",
                    "Behavioral and HR",
                    "Easy",
                    "Tell me about a time when you had a disagreement with a team member during a technical project. How did you resolve it?",
                    "Structure using STAR: Situation (College capstone project), Task (Delivering database schema on deadline), Action (Listened objectively, prototyped both solutions with benchmarks), Result (Agreed on hybrid approach, project scored an A).",
                    "During our final year microservices capstone project, my teammate and I disagreed on whether to use MongoDB or PostgreSQL for our user audit log. My teammate advocated for MongoDB for schema flexibility, while I preferred PostgreSQL for ACID compliance. Instead of debating theoretically, I organized a 30-minute sync where we listed our system invariants. We ran a benchmark on concurrent transactions, which revealed PostgreSQL provided stricter integrity for our payment module. We adopted PostgreSQL for transactions and Redis for transient cache, delivering the project on time with an 'A' grade.",
                    "// STAR Framework Checklist:\n// S: Context & project details\n// T: The objective or core friction\n// A: Objective action, active listening, benchmarks\n// R: Measurable resolution & team harmony",
                    89,
                    "High",
                    52,
                    "October 2026",
                    true,
                    Arrays.asList("STAR Method", "Conflict Resolution", "Teamwork", "Emotional Intelligence"),
                    Arrays.asList("What would you do if your technical lead insisted on an approach you knew had a flaw?", "How do you handle negative feedback from peers?")
            ));

            // 8. Managerial - Project Deadline Scenarios
            questionRepository.save(new InterviewQuestion(
                    null,
                    "hcl-mgr-01",
                    "hcltech",
                    "managerial",
                    "Managerial Round",
                    "Medium",
                    "You are leading a 4-person sprint. Two days before client demo, a critical API integration fails because an external vendor changed their schema. How do you respond?",
                    "Demonstrate calm crisis leadership: 1. Assess blast radius. 2. Communicate immediately with stakeholders. 3. Triage features (MVP demo vs full feature). 4. Implement adapter/mock pattern for demo while engineering hotfix.",
                    "First, I would immediately gather the team for a 15-minute emergency standup to map the exact breakage points and verify if the vendor provides documentation for the schema revision. Second, I would communicate proactively with our project manager to present transparent options: demonstrating our core workflow using a temporary mock adapter for the external service, while having one senior engineer write the schema transformation adapter. I would protect team morale by focusing on solutions rather than finger-pointing, and follow up post-demo with integration contract testing to prevent recurrence.",
                    "// Crisis Management Sequence:\n// 1. Triage & Impact Assessment\n// 2. Proactive Stakeholder Transparency\n// 3. Fallback / Adapter Strategy\n// 4. Post-Mortem & Contract Testing",
                    87,
                    "High",
                    21,
                    "October 2026",
                    true,
                    Arrays.asList("Leadership", "Crisis Handling", "Stakeholder Communication", "Adapter Pattern"),
                    Arrays.asList("How do you manage client expectations when a deadline must be renegotiated?", "What is an architectural contract test?")
            ));
        }
    }

    private void seedExperiences() {
        if (experienceRepository.count() == 0) {
            experienceRepository.save(new InterviewExperience(
                    null,
                    "exp-hcl-01",
                    "hcltech",
                    "HCLTech",
                    "Aditya Sharma",
                    "2026",
                    "Software Engineer (GET)",
                    "October 2026",
                    "Delhi Technological University",
                    "Computer Science",
                    5,
                    "Selected",
                    "Medium",
                    "Focus deeply on Java OOP principles, SQL joins, and Floyd's cycle detection. The technical interviewer asked me to share my screen and code the cycle node logic from scratch without an IDE compiler.",
                    true,
                    34,
                    false,
                    Arrays.asList("Online Assessment", "Technical Interview", "Managerial Round", "HR Round"),
                    Arrays.asList("Detect cycle in linked list and identify entry point", "Explain difference between Left Join and Inner Join with NULL behavior", "Explain Garbage Collection in Java", "Describe a time you handled conflict in a team")
            ));

            experienceRepository.save(new InterviewExperience(
                    null,
                    "exp-tcs-01",
                    "tcs",
                    "TCS (Tata Consultancy Services)",
                    "Sneha Kulkarni",
                    "2026",
                    "TCS Digital Engineer (₹7.2 LPA)",
                    "September 2026",
                    "Pune Institute of Computer Technology",
                    "Information Technology",
                    5,
                    "Selected",
                    "Medium",
                    "TCS NQT coding problems were focused on recursion and Kadane's algorithm. In the technical round, the interviewer asked for detailed memory allocation of Java objects and real-world database indexing examples.",
                    true,
                    42,
                    false,
                    Arrays.asList("TCS NQT Cognitive + Advanced Coding", "Technical Interview", "HR Round"),
                    Arrays.asList("Kadane's algorithm maximum contiguous subarray", "Polymorphism and Dynamic Method Dispatch vtable", "ACID properties in banking applications", "Willingness to relocate to Chennai or Bengaluru")
            ));

            experienceRepository.save(new InterviewExperience(
                    null,
                    "exp-del-01",
                    "deloitte",
                    "Deloitte",
                    "Rohan Mehra",
                    "2026",
                    "Analyst - Technology Consulting (USI)",
                    "October 2026",
                    "National Institute of Technology, Kurukshetra",
                    "Electronics and Communication",
                    5,
                    "Selected",
                    "Hard",
                    "Deloitte puts huge emphasis on communication and the STAR method in both the technical and partner rounds. Be ready to explain your projects with architectural trade-offs rather than just reciting code.",
                    true,
                    28,
                    false,
                    Arrays.asList("Versant English + Coding Test", "Technical Assessment", "Partner Round"),
                    Arrays.asList("Difference between Process and Thread in memory footprint", "Design a relational schema for a hospital booking system", "Tell me about a project where you missed a milestone and how you handled it", "Why Deloitte over pure product companies?")
            ));

            experienceRepository.save(new InterviewExperience(
                    null,
                    "exp-inf-01",
                    "infosys",
                    "Infosys",
                    "Candidate (Anonymous)",
                    "2026",
                    "Digital Specialist Engineer",
                    "October 2026",
                    "Protected Institution",
                    "Computer Science",
                    4,
                    "Selected",
                    "Medium",
                    "InfyTQ test had tough algorithmic problems on DP and trees. Technical round covered SQL queries with GROUP BY and HAVING clauses, plus REST API status codes.",
                    true,
                    19,
                    true,
                    Arrays.asList("InfyTQ Online Assessment", "Technical Interview", "HR Round"),
                    Arrays.asList("Find Second Highest Salary using subquery", "Explain REST API idempotent methods", "Binary Tree Level Order Traversal", "Career goals in the next 3 years")
            ));
        }
    }

    private void seedCandidates() {
        if (candidateRepository.count() == 0) {
            candidateRepository.save(new Candidate(
                    "cand-001",
                    "Aarav Sharma",
                    "aarav.sharma@dtu.ac.in",
                    "Delhi Technological University",
                    "Computer Science",
                    "2028",
                    "hcltech",
                    "HCLTech",
                    "Technical Interview",
                    "ACTIVE",
                    88,
                    9,
                    9,
                    8,
                    "Excellent command of DSA and SQL. Solved cycle detection in O(N) cleanly."
            ));

            candidateRepository.save(new Candidate(
                    "cand-002",
                    "Diya Patel",
                    "diya.patel@nitt.edu",
                    "National Institute of Technology, Trichy",
                    "Information Technology",
                    "2028",
                    "hcltech",
                    "HCLTech",
                    "Managerial Round",
                    "ADVANCED",
                    92,
                    9,
                    9,
                    9,
                    "Strong STAR communication. Clearly articulated cloud architecture project."
            ));

            candidateRepository.save(new Candidate(
                    "cand-003",
                    "Rohan Nair",
                    "rohan.nair@coep.ac.in",
                    "COEP Pune",
                    "Electronics and Telecomm",
                    "2028",
                    "hcltech",
                    "HCLTech",
                    "Selected / Offer Extended",
                    "SELECTED",
                    95,
                    10,
                    9,
                    9,
                    "Offered GET Specialist Track (₹8.5 LPA). Cleared all 4 rounds with distinction."
            ));

            candidateRepository.save(new Candidate(
                    "cand-004",
                    "Kavya Singh",
                    "kavya.singh@iitbhu.ac.in",
                    "IIT BHU",
                    "Computer Science",
                    "2028",
                    "tcs",
                    "TCS (Tata Consultancy Services)",
                    "Technical Interview",
                    "ACTIVE",
                    85,
                    8,
                    9,
                    8,
                    "Cleared NQT with 94 percentile. Strong in Java Spring and microservices."
            ));
        }
    }
}
