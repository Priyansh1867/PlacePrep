package com.placeprep.config;

import com.placeprep.model.Candidate;
import com.placeprep.repository.CandidateRepository;
import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.Subject;
import com.placeprep.model.StudentSubjectEnrollment;
import com.placeprep.repository.SubjectRepository;
import com.placeprep.repository.StudentSubjectEnrollmentRepository;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.Company;
import com.placeprep.model.CrtAttendanceRecord;
import com.placeprep.model.CrtTrainingSession;
import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.model.User;
import com.placeprep.repository.ClassAttendanceRecordRepository;
import com.placeprep.repository.ClassAttendanceSessionRepository;
import com.placeprep.repository.CompanyRepository;
import com.placeprep.repository.CrtAttendanceRecordRepository;
import com.placeprep.repository.CrtTrainingSessionRepository;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.StudentApplicationRepository;
import com.placeprep.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(
            CompanyRepository companyRepository,
            PlacementDriveRepository driveRepository,
            StudentApplicationRepository applicationRepository,
            UserRepository userRepository,
            ClassAttendanceSessionRepository classSessionRepository,
            ClassAttendanceRecordRepository classRecordRepository,
            CrtTrainingSessionRepository crtSessionRepository,
            CrtAttendanceRecordRepository crtRecordRepository,
            SubjectRepository subjectRepository,
            StudentSubjectEnrollmentRepository enrollmentRepository,
            CandidateRepository candidateRepository
    ) {
        return args -> {
            if (userRepository.count() == 0) {
                User demoUser = new User();
                demoUser.setName("Priyansh Jain");
                demoUser.setEmail("priyansh.jain@example.edu");
                demoUser.setPassword("password123");
                demoUser.setCollege("Delhi Technological University (DTU)");
                demoUser.setBranch("Computer Science and Engineering");
                demoUser.setGraduationBatch("2028");
                demoUser.setRole("student");
                demoUser.setRollNumber("22CS0101");
                demoUser.setOnboardingCompleted(true);
                userRepository.save(demoUser);
            }

            // Seed faculty users if not existing
            if (userRepository.findByEmail("teacher@placeprep.com").isEmpty()) {
                User teacher = new User();
                teacher.setName("Dr. Neha Sharma");
                teacher.setEmail("teacher@placeprep.com");
                teacher.setPassword("demo123");
                teacher.setCollege("Delhi Technological University (DTU)");
                teacher.setBranch("Computer Science and Engineering");
                teacher.setGraduationBatch("2026");
                teacher.setRole("teacher");
                teacher.setRollNumber("FAC-CSE-042");
                teacher.setOnboardingCompleted(true);
                userRepository.save(teacher);
            }

            if (userRepository.findByEmail("hod@placeprep.com").isEmpty()) {
                User hod = new User();
                hod.setName("Prof. Alok Verma");
                hod.setEmail("hod@placeprep.com");
                hod.setPassword("demo123");
                hod.setCollege("Delhi Technological University (DTU)");
                hod.setBranch("Computer Science and Engineering");
                hod.setGraduationBatch("2026");
                hod.setRole("hod");
                hod.setRollNumber("HOD-CSE-001");
                hod.setOnboardingCompleted(true);
                userRepository.save(hod);
            }

            if (userRepository.findByEmail("management@placeprep.com").isEmpty()) {
                User mgmt = new User();
                mgmt.setName("Dr. Ramesh Gupta");
                mgmt.setEmail("management@placeprep.com");
                mgmt.setPassword("demo123");
                mgmt.setCollege("Delhi Technological University (DTU)");
                mgmt.setBranch("Institute Administration");
                mgmt.setGraduationBatch("2026");
                mgmt.setRole("management");
                mgmt.setRollNumber("MGMT-DTU-001");
                mgmt.setOnboardingCompleted(true);
                userRepository.save(mgmt);
            }

            if (companyRepository.count() == 0) {
                Company hcl = new Company();
                hcl.setCompanyId("hcltech");
                hcl.setName("HCLTech");
                hcl.setSlug("hcltech");
                hcl.setTier("Tier 1 IT Services");
                hcl.setHeadquarters("Noida, India");
                hcl.setIndustry("Information Technology & Consulting");
                hcl.setCtcRange("₹4.25 LPA - ₹8.50 LPA");
                hcl.setVerifiedUpcomingDrive(true);
                hcl.setUpcomingDriveDate("November 18, 2026");
                hcl.setDriveStatus("Registrations Active");
                hcl.setEligibilityCriteria("Minimum 65% or 6.5 CGPA in B.Tech/M.Tech. No active backlogs permitted at the time of recruitment.");
                hcl.setEligibleBatches(Arrays.asList("2026", "2027", "2028"));
                hcl.setRoles(Arrays.asList("Graduate Engineer Trainee (GET)", "Software Engineer"));
                hcl.setPopularityScore(96);
                companyRepository.save(hcl);

                Company tcs = new Company();
                tcs.setCompanyId("tcs");
                tcs.setName("TCS");
                tcs.setSlug("tcs");
                tcs.setTier("Tier 1 IT Giant");
                tcs.setHeadquarters("Mumbai, India");
                tcs.setIndustry("IT Services & Business Solutions");
                tcs.setCtcRange("₹3.60 LPA - ₹9.00 LPA");
                tcs.setVerifiedUpcomingDrive(true);
                tcs.setUpcomingDriveDate("December 05, 2026");
                tcs.setDriveStatus("Drive Announced");
                tcs.setEligibilityCriteria("Minimum 60% or 6.0 CGPA throughout 10th, 12th, and Degree. Max 1 active backlog permitted.");
                tcs.setEligibleBatches(Arrays.asList("2026", "2027"));
                tcs.setRoles(Arrays.asList("TCS Ninja", "TCS Digital", "TCS Prime"));
                tcs.setPopularityScore(98);
                companyRepository.save(tcs);

                Company acc = new Company();
                acc.setCompanyId("accenture");
                acc.setName("Accenture");
                acc.setSlug("accenture");
                acc.setTier("Global Management Consulting");
                acc.setHeadquarters("Dublin / Bengaluru, India");
                acc.setIndustry("Technology Consulting & Digital Services");
                acc.setCtcRange("₹4.50 LPA - ₹6.50 LPA");
                acc.setVerifiedUpcomingDrive(true);
                acc.setUpcomingDriveDate("November 22, 2026");
                acc.setDriveStatus("Slots Open");
                acc.setEligibilityCriteria("Minimum 6.5 CGPA or 65% with no active backlogs. All engineering branches eligible.");
                acc.setEligibleBatches(Arrays.asList("2026", "2027", "2028"));
                acc.setRoles(Arrays.asList("Associate Software Engineer (ASE)", "Advanced ASE"));
                acc.setPopularityScore(95);
                companyRepository.save(acc);
            }

            if (driveRepository.count() == 0) {
                PlacementDrive hclDrive = new PlacementDrive();
                hclDrive.setDriveId("drv-hcl-2026");
                hclDrive.setCompanyId("hcltech");
                hclDrive.setCompanyName("HCLTech");
                hclDrive.setRole("Graduate Engineer Trainee (GET)");
                hclDrive.setCtc("₹4.25 - ₹8.5 LPA");
                hclDrive.setDriveDate("2026-11-18");
                hclDrive.setDriveTime("09:00 AM");
                hclDrive.setDeadline("2026-11-10");
                hclDrive.setStatus("Verified Upcoming Drive");
                hclDrive.setVerifiedBadge(true);
                hclDrive.setVenue("Auditorium Hall A & Tech Computing Labs 1-4, Main Campus");
                hclDrive.setReportingTime("08:15 AM (Strictly 45 mins prior)");
                hclDrive.setInstructions("Formal business attire is mandatory. Please carry: 3 hard copies of updated resume, 2 passport size photographs, College ID card, Government Photo ID, and a fully-charged laptop with Wi-Fi capability for online coding rounds.");
                hclDrive.setMinCgpa(6.5);
                hclDrive.setMinTenthPercentage(60.0);
                hclDrive.setMinTwelfthPercentage(60.0);
                hclDrive.setMaxBacklogs(0);
                hclDrive.setEligibleBatches(Arrays.asList("2026", "2027", "2028"));
                hclDrive.setLocations(Arrays.asList("Noida", "Bengaluru", "Chennai", "Pune", "Hyderabad"));
                hclDrive.setAllowedBranches(Arrays.asList("Computer Science", "Information Technology", "Electronics & Communication", "Electrical"));
                hclDrive.setRounds(Arrays.asList("Aptitude & Technical MCQ Assessment", "Live Coding & Algorithm Test", "Technical Interview Round 1", "Managerial & Problem Solving", "HR & Culture Alignment"));
                driveRepository.save(hclDrive);

                PlacementDrive tcsDrive = new PlacementDrive();
                tcsDrive.setDriveId("drv-tcs-2026");
                tcsDrive.setCompanyId("tcs");
                tcsDrive.setCompanyName("TCS");
                tcsDrive.setRole("TCS Ninja / Digital / Prime");
                tcsDrive.setCtc("₹3.6 - ₹9.0 LPA");
                tcsDrive.setDriveDate("2026-12-05");
                tcsDrive.setDriveTime("10:00 AM");
                tcsDrive.setDeadline("2026-11-25");
                tcsDrive.setStatus("Verified Upcoming Drive");
                tcsDrive.setVerifiedBadge(true);
                tcsDrive.setVenue("Central Seminar Complex & Online Proctoring Lab 2");
                tcsDrive.setReportingTime("09:15 AM");
                tcsDrive.setInstructions("Candidate must show TCS NQT Hall Ticket and College ID card at gate check-in. Mobile phones and smart watches strictly prohibited in assessment halls.");
                tcsDrive.setMinCgpa(6.0);
                tcsDrive.setMinTenthPercentage(60.0);
                tcsDrive.setMinTwelfthPercentage(60.0);
                tcsDrive.setMaxBacklogs(1);
                tcsDrive.setEligibleBatches(Arrays.asList("2026", "2027"));
                tcsDrive.setLocations(Arrays.asList("Pan-India (Virtual & In-Person)"));
                tcsDrive.setAllowedBranches(Arrays.asList("CSE", "IT", "ECE", "EEE", "Mechanical", "Civil"));
                tcsDrive.setRounds(Arrays.asList("NQT Cognitive Assessment", "Advanced Coding Test", "Technical Interview", "Managerial + HR Round"));
                driveRepository.save(tcsDrive);

                PlacementDrive accDrive = new PlacementDrive();
                accDrive.setDriveId("drv-accenture-2026");
                accDrive.setCompanyId("accenture");
                accDrive.setCompanyName("Accenture");
                accDrive.setRole("Associate Software Engineer (ASE)");
                accDrive.setCtc("₹4.5 - ₹6.5 LPA");
                accDrive.setDriveDate("2026-11-18"); // Same date as HCL to showcase schedule conflict detection!
                accDrive.setDriveTime("10:30 AM");
                accDrive.setDeadline("2026-11-14");
                accDrive.setStatus("Verified Upcoming Drive");
                accDrive.setVerifiedBadge(true);
                accDrive.setVenue("Virtual MS Teams Panel & Examination Center Lab 5");
                accDrive.setReportingTime("10:00 AM");
                accDrive.setInstructions("Ensure high-speed stable internet, quiet room with background lighting, and working webcam/microphone for automated AI proctoring.");
                accDrive.setMinCgpa(6.5);
                accDrive.setMinTenthPercentage(65.0);
                accDrive.setMinTwelfthPercentage(65.0);
                accDrive.setMaxBacklogs(0);
                accDrive.setEligibleBatches(Arrays.asList("2026", "2027", "2028"));
                accDrive.setLocations(Arrays.asList("Bengaluru", "Gurugram", "Hyderabad", "Pune"));
                accDrive.setAllowedBranches(Arrays.asList("All Engineering Branches"));
                accDrive.setRounds(Arrays.asList("Cognitive Assessment", "Technical & Coding Assessment", "Communication Assessment", "Virtual Technical + HR Interview"));
                driveRepository.save(accDrive);
            }

            if (applicationRepository.count() == 0) {
                StudentApplication app1 = new StudentApplication();
                app1.setApplicationId("APP-HCL-101");
                app1.setStudentId("user-demo-01");
                app1.setStudentName("Priyansh Jain");
                app1.setStudentEmail("priyansh.jain@example.edu");
                app1.setCollege("Delhi Technological University (DTU)");
                app1.setBranch("Computer Science and Engineering");
                app1.setGraduationBatch("2028");
                app1.setCgpa(8.85);
                app1.setTenthPercentage(92.4);
                app1.setTwelfthPercentage(89.6);
                app1.setActiveBacklogs(0);
                app1.setDriveId("drv-hcl-2026");
                app1.setCompanyId("hcltech");
                app1.setCompanyName("HCLTech");
                app1.setRole("Graduate Engineer Trainee (GET)");
                app1.setAppliedAt("2026-10-14 10:15");
                app1.setStatus("INTERVIEW_SCHEDULED");
                app1.setEligibilityStatus("ELIGIBLE");
                app1.setEligibilityRemarks("Candidate meets all academic and backlog thresholds (CGPA 8.85 >= 6.5, Backlogs 0 <= 0).");
                app1.setCurrentRound("Round 2: Technical Interview");
                app1.setScheduledDate("2026-11-18");
                app1.setScheduledTime("10:00 AM");
                app1.setScheduledEndTime("11:00 AM");
                app1.setVenue("Auditorium Hall A, Panel Desk #4");
                app1.setReportingTime("09:30 AM");
                app1.setCandidateInstructions("Bring printed resume and coding project portfolio on laptop.");
                app1.setConflictFlagged(true);
                app1.setConflictReason("Schedule collision detected: Overlaps with Accenture Virtual Assessment slot on 2026-11-18.");
                applicationRepository.save(app1);
            }

            if (candidateRepository.findByCandidateId("cand-001").isEmpty()) {
                Candidate cand1 = new Candidate();
                cand1.setCandidateId("cand-001");
                cand1.setName("Priyansh Jain");
                cand1.setEmail("priyansh.jain@example.edu");
                cand1.setCollege("Delhi Technological University (DTU)");
                cand1.setBranch("Computer Science and Engineering");
                cand1.setGraduationBatch("2028");
                cand1.setCompanyId("hcltech");
                cand1.setCompanyName("HCLTech");
                cand1.setCurrentRound("Technical Interview");
                cand1.setStatus("ACTIVE");
                cand1.setOverallScore(82);
                cand1.setTechnicalDepth(85);
                cand1.setProblemSolving(80);
                cand1.setCommunication(82);
                cand1.setEvaluatorNotes("Strong algorithmic problem solving with solid communication.");
                cand1.setUpdatedAt(java.time.LocalDateTime.now().toString());
                candidateRepository.save(cand1);
            }

            if (candidateRepository.findByCandidateId("cand-002").isEmpty()) {
                Candidate cand2 = new Candidate();
                cand2.setCandidateId("cand-002");
                cand2.setName("Ananya Sharma");
                cand2.setEmail("ananya.sharma@example.edu");
                cand2.setCollege("Delhi Technological University (DTU)");
                cand2.setBranch("Computer Science and Engineering");
                cand2.setGraduationBatch("2028");
                cand2.setCompanyId("hcltech");
                cand2.setCompanyName("HCLTech");
                cand2.setCurrentRound("Technical Interview");
                cand2.setStatus("ACTIVE");
                cand2.setOverallScore(85);
                cand2.setTechnicalDepth(88);
                cand2.setProblemSolving(85);
                cand2.setCommunication(90);
                cand2.setEvaluatorNotes("Exceptional problem solver.");
                cand2.setUpdatedAt(java.time.LocalDateTime.now().toString());
                candidateRepository.save(cand2);
            }

            if (classSessionRepository.count() == 0) {
                String[][] sampleSessions = {
                    {"2026-10-15", "2", "Cloud Computing Architectures"},
                    {"2026-10-17", "3", "Virtualization & Containerization with Docker"},
                    {"2026-10-19", "1", "Microservices & Kubernetes Orchestration"},
                    {"2026-10-21", "4", "Serverless Computing & Cloud Storage Security"}
                };

                String[][] rosterData = {
                    {"22CS0101", "Priyansh Jain", "priyansh.jain@example.edu", "PRESENT", "PRESENT", "PRESENT", "PRESENT"},
                    {"22CS0102", "Ananya Sharma", "ananya.sharma@example.edu", "PRESENT", "ABSENT", "PRESENT", "PRESENT"},
                    {"22CS0103", "Rohan Kulkarni", "rohan.kulkarni@example.edu", "ABSENT", "PRESENT", "ABSENT", "PRESENT"},
                    {"22CS0104", "Siddharth Nair", "siddharth.nair@example.edu", "PRESENT", "PRESENT", "PRESENT", "LATE"},
                    {"22CS0105", "Meera Venkat", "meera.venkat@example.edu", "ABSENT", "ABSENT", "ABSENT", "PRESENT"},
                    {"22CS0106", "Kabir Mehta", "kabir.mehta@example.edu", "PRESENT", "LATE", "ABSENT", "PRESENT"},
                    {"22CS0107", "Divya Reddy", "divya.reddy@example.edu", "PRESENT", "PRESENT", "PRESENT", "PRESENT"},
                    {"22CS0108", "Aarav Gupta", "aarav.gupta@example.edu", "PRESENT", "ABSENT", "ABSENT", "PRESENT"}
                };

                for (int sIdx = 0; sIdx < sampleSessions.length; sIdx++) {
                    ClassAttendanceSession sess = new ClassAttendanceSession();
                    sess.setDepartment("CSE");
                    sess.setSemester("6");
                    sess.setSubjectCode("CS306");
                    sess.setSubjectName("Cloud Computing & Distributed Systems");
                    sess.setSection("A");
                    sess.setSessionDate(sampleSessions[sIdx][0]);
                    sess.setPeriodNumber(Integer.parseInt(sampleSessions[sIdx][1]));
                    sess.setFacultyId("FAC-CSE-042");
                    sess.setFacultyName("Dr. Neha Sharma");
                    sess.setCreatedAt(sampleSessions[sIdx][0] + " 09:00");
                    ClassAttendanceSession savedSession = classSessionRepository.save(sess);

                    for (String[] stu : rosterData) {
                        ClassAttendanceRecord rec = new ClassAttendanceRecord();
                        rec.setSessionId(savedSession.getId());
                        rec.setStudentId(stu[2]);
                        rec.setStudentRollNumber(stu[0]);
                        rec.setStudentName(stu[1]);
                        rec.setStatus(stu[3 + sIdx]);
                        rec.setRemarks("LATE".equalsIgnoreCase(stu[3 + sIdx]) ? "Arrived 10 mins late" : null);
                        rec.setRecordedAt(sampleSessions[sIdx][0] + " 09:15");
                        classRecordRepository.save(rec);
                    }
                }
            }

            
            // ==========================================
            // SEED SUBJECTS, ENROLLMENTS & LECTURE SESSIONS
            // ==========================================
            if (subjectRepository.count() == 0 || subjectRepository.findByCode("CS310").isEmpty()) {
                // Ensure all 5 curriculum subjects from Semester 6 are present:
                // 1. CS306 - Cloud Computing & Distributed Systems
                // 2. CS302 - Operating Systems & System Programming
                // 3. CS304 - Database Management Systems
                // 4. CS308 - Compiler Design & Theory
                // 5. CS310 - Artificial Intelligence & Machine Learning

                Subject s1 = subjectRepository.findByCode("CS306").orElseGet(() -> subjectRepository.save(Subject.builder()
                        .code("CS306")
                        .name("Cloud Computing & Distributed Systems")
                        .department("CSE")
                        .semester("6")
                        .facultyName("Dr. Neha Sharma")
                        .facultyEmail("teacher@placeprep.com")
                        .credits(4)
                        .minAttendancePercentage(75.0)
                        .description("Virtualization, containerization, microservices, and distributed cloud computing.")
                        .build()));

                Subject s2 = subjectRepository.findByCode("CS302").orElseGet(() -> subjectRepository.save(Subject.builder()
                        .code("CS302")
                        .name("Operating Systems & System Programming")
                        .department("CSE")
                        .semester("6")
                        .facultyName("Prof. Alok Verma")
                        .facultyEmail("hod@placeprep.com")
                        .credits(4)
                        .minAttendancePercentage(75.0)
                        .description("Process scheduling, concurrency, deadlocks, memory virtualization, and file systems.")
                        .build()));

                Subject s3 = subjectRepository.findByCode("CS304").orElseGet(() -> subjectRepository.save(Subject.builder()
                        .code("CS304")
                        .name("Database Management Systems")
                        .department("CSE")
                        .semester("6")
                        .facultyName("Dr. Vikram Malhotra")
                        .facultyEmail("teacher@placeprep.com")
                        .credits(4)
                        .minAttendancePercentage(75.0)
                        .description("Relational data model, SQL optimization, B+ Tree indexing, and ACID concurrency.")
                        .build()));

                Subject s4 = subjectRepository.findByCode("CS308").orElseGet(() -> subjectRepository.save(Subject.builder()
                        .code("CS308")
                        .name("Compiler Design & Theory")
                        .department("CSE")
                        .semester("6")
                        .facultyName("Dr. Anjali Joshi")
                        .facultyEmail("teacher@placeprep.com")
                        .credits(4)
                        .minAttendancePercentage(75.0)
                        .description("Lexical analysis, syntax parsing, syntax-directed translation, and code generation.")
                        .build()));

                Subject s5 = subjectRepository.findByCode("CS310").orElseGet(() -> subjectRepository.save(Subject.builder()
                        .code("CS310")
                        .name("Artificial Intelligence & Machine Learning")
                        .department("CSE")
                        .semester("6")
                        .facultyName("Prof. Sanjay Saxena")
                        .facultyEmail("teacher@placeprep.com")
                        .credits(4)
                        .minAttendancePercentage(75.0)
                        .description("Search algorithms, heuristics, neural networks, supervised & unsupervised machine learning.")
                        .build()));

                // Auto-enroll students into all 5 subjects
                String[] enrolledStudentEmails = {
                    "priyansh.jain@example.edu", "ananya.sharma@example.edu", "rohan.kulkarni@example.edu",
                    "siddharth.nair@example.edu", "meera.venkat@example.edu", "kabir.mehta@example.edu",
                    "divya.reddy@example.edu", "aarav.gupta@example.edu"
                };

                String[] curriculumCodes = {"CS306", "CS302", "CS304", "CS308", "CS310"};
                for (String email : enrolledStudentEmails) {
                    for (String code : curriculumCodes) {
                        if (!enrollmentRepository.existsByStudentEmailAndSubjectCode(email, code)) {
                            StudentSubjectEnrollment en = StudentSubjectEnrollment.builder()
                                    .studentEmail(email)
                                    .subjectCode(code)
                                    .enrolledAt("2026-08-01 09:00")
                                    .build();
                            enrollmentRepository.save(en);
                        }
                    }
                }

                // Seed lectures and open sessions for CS304 (DBMS) if not present
                if (classSessionRepository.findBySubjectCodeOrderBySessionDateDesc("CS304").isEmpty()) {
                    seedSubjectLectures(
                            classSessionRepository, classRecordRepository,
                            "CS304", "Database Management Systems", "Dr. Vikram Malhotra", "FAC-CSE-018",
                            new String[][]{
                                    {"1", "Relational Algebra & Tuple Calculus", "2026-10-10", "09:00 AM", "10:00 AM", "COMPLETED"},
                                    {"2", "Advanced SQL Joins & Subqueries", "2026-10-12", "10:00 AM", "11:00 AM", "COMPLETED"},
                                    {"3", "Database Normalization (1NF to BCNF)", "2026-10-16", "11:15 AM", "12:15 PM", "COMPLETED"},
                                    {"4", "B+ Tree Indexing & Hash Indices", "2026-10-20", "02:00 PM", "03:00 PM", "COMPLETED"},
                                    {"5", "ACID Transactions & Two-Phase Locking", "2026-10-24", "09:00 AM", "10:00 AM", "COMPLETED"},
                                    {"6", "Query Optimization & Execution Tuning", "2026-10-29", "11:15 AM", "12:15 PM", "OPEN"}
                            },
                            new String[]{"PRESENT", "PRESENT", "PRESENT", "PRESENT", "PRESENT", null}
                    );
                }

                // Seed lectures and open sessions for CS310 (AI & ML) if not present
                if (classSessionRepository.findBySubjectCodeOrderBySessionDateDesc("CS310").isEmpty()) {
                    seedSubjectLectures(
                            classSessionRepository, classRecordRepository,
                            "CS310", "Artificial Intelligence & Machine Learning", "Prof. Sanjay Saxena", "FAC-CSE-052",
                            new String[][]{
                                    {"1", "State Space Search & A* Heuristic Search", "2026-10-09", "10:00 AM", "11:00 AM", "COMPLETED"},
                                    {"2", "Constraint Satisfaction & Adversarial Search", "2026-10-13", "11:15 AM", "12:15 PM", "COMPLETED"},
                                    {"3", "Supervised Learning: Linear & Logistic Regression", "2026-10-17", "02:00 PM", "03:00 PM", "COMPLETED"},
                                    {"4", "Decision Trees & Random Forests Ensemble", "2026-10-21", "09:00 AM", "10:00 AM", "COMPLETED"},
                                    {"5", "Deep Neural Networks & Backpropagation", "2026-10-29", "03:00 PM", "04:00 PM", "OPEN"}
                            },
                            new String[]{"PRESENT", "PRESENT", "PRESENT", "PRESENT", null}
                    );
                }

                // Ensure an OPEN lecture exists for CS306 as well so attendance can be marked right now
                List<ClassAttendanceSession> cs306Sessions = classSessionRepository.findBySubjectCodeAndStatus("CS306", "OPEN");
                if (cs306Sessions.isEmpty()) {
                    ClassAttendanceSession openSess = ClassAttendanceSession.builder()
                            .department("CSE")
                            .semester("6")
                            .section("A")
                            .subjectCode("CS306")
                            .subjectName("Cloud Computing & Distributed Systems")
                            .facultyName("Dr. Neha Sharma")
                            .facultyId("FAC-CSE-042")
                            .sessionDate("2026-10-29")
                            .periodNumber(6)
                            .lectureNumber(6)
                            .lectureTitle("Docker Containerization & Kubernetes Orchestration")
                            .startTime("09:00 AM")
                            .endTime("10:00 AM")
                            .status("OPEN")
                            .instituteName("Delhi Technological University (DTU)")
                            .createdAt("2026-10-29 09:00")
                            .build();
                    classSessionRepository.save(openSess);
                }
            }
            
            if (crtSessionRepository.count() == 0) {
                // 1. Session 1: Quantitative Aptitude
                CrtTrainingSession s1 = new CrtTrainingSession();
                s1.setTopic("Quantitative Aptitude & Speed Math Masterclass");
                s1.setModuleType("Quantitative Ability");
                s1.setTrainerName("Prof. Alok Verma");
                s1.setTrainerOrganization("Placement Training Cell");
                s1.setScheduledDate("2026-10-12");
                s1.setTimeSlot("10:00 AM - 12:00 PM");
                s1.setStartTime("10:00 AM");
                s1.setEndTime("12:00 PM");
                s1.setVenue("Seminar Hall 1 / Online Hybrid");
                s1.setTargetBatch("2026");
                s1.setTargetBranch("ALL");
                s1.setAcademicYear("3rd Year");
                s1.setSemester("6");
                s1.setDescription("Permutations, Combinations, Probability, and high-frequency company aptitude problem patterns.");
                s1.setStatus("COMPLETED");
                s1.setCreatedBy("teacher@placeprep.com");
                s1.setCreatedAt("2026-10-10 09:00");
                s1.setUpdatedAt("2026-10-12 12:30");
                CrtTrainingSession savedS1 = crtSessionRepository.save(s1);

                // 2. Session 2: Coding & DSA
                CrtTrainingSession s2 = new CrtTrainingSession();
                s2.setTopic("Data Structures & Algorithms - Dynamic Programming & Trees");
                s2.setModuleType("Coding");
                s2.setTrainerName("Dr. Radhika Sen");
                s2.setTrainerOrganization("Ex-Amazon SDE / Placement Mentor");
                s2.setScheduledDate("2026-10-16");
                s2.setTimeSlot("02:00 PM - 05:00 PM");
                s2.setStartTime("02:00 PM");
                s2.setEndTime("05:00 PM");
                s2.setVenue("Computer Center Lab 4");
                s2.setTargetBatch("2026");
                s2.setTargetBranch("ALL");
                s2.setAcademicYear("3rd Year");
                s2.setSemester("6");
                s2.setDescription("Memoization, Tabulation, Knapsack variations, and Binary Tree traversals with live coding.");
                s2.setStatus("COMPLETED");
                s2.setCreatedBy("teacher@placeprep.com");
                s2.setCreatedAt("2026-10-14 10:00");
                s2.setUpdatedAt("2026-10-16 17:15");
                CrtTrainingSession savedS2 = crtSessionRepository.save(s2);

                // 3. Session 3: Soft Skills & Behavioral
                CrtTrainingSession s3 = new CrtTrainingSession();
                s3.setTopic("Mock HR & STAR Method Behavioral Coaching");
                s3.setModuleType("Soft Skills");
                s3.setTrainerName("Ms. Sunita Kapoor");
                s3.setTrainerOrganization("Corporate HR Consultant");
                s3.setScheduledDate("2026-10-19");
                s3.setTimeSlot("11:00 AM - 01:00 PM");
                s3.setStartTime("11:00 AM");
                s3.setEndTime("01:00 PM");
                s3.setVenue("Auditorium 2");
                s3.setTargetBatch("2026");
                s3.setTargetBranch("ALL");
                s3.setAcademicYear("3rd Year");
                s3.setSemester("6");
                s3.setDescription("Behavioral interview mastery: Situation, Task, Action, Result framing for corporate culture fit.");
                s3.setStatus("COMPLETED");
                s3.setCreatedBy("teacher@placeprep.com");
                s3.setCreatedAt("2026-10-17 11:00");
                s3.setUpdatedAt("2026-10-19 13:10");
                CrtTrainingSession savedS3 = crtSessionRepository.save(s3);

                // 4. Session 4: Technical Interview Prep
                CrtTrainingSession s4 = new CrtTrainingSession();
                s4.setTopic("SQL, Indexing & ACID Transactions Deep Dive");
                s4.setModuleType("Technical Interview Preparation");
                s4.setTrainerName("Prof. Tarun Gupta");
                s4.setTrainerOrganization("Database Architect");
                s4.setScheduledDate("2026-10-21");
                s4.setTimeSlot("03:00 PM - 05:00 PM");
                s4.setStartTime("03:00 PM");
                s4.setEndTime("05:00 PM");
                s4.setVenue("Lab 2");
                s4.setTargetBatch("2026");
                s4.setTargetBranch("ALL");
                s4.setAcademicYear("3rd Year");
                s4.setSemester("6");
                s4.setDescription("Query optimization, execution plans, B-Tree indexes, and distributed transaction isolation.");
                s4.setStatus("COMPLETED");
                s4.setCreatedBy("teacher@placeprep.com");
                s4.setCreatedAt("2026-10-18 14:00");
                s4.setUpdatedAt("2026-10-21 17:05");
                CrtTrainingSession savedS4 = crtSessionRepository.save(s4);

                // 5. Session 5: Upcoming / Scheduled Session
                CrtTrainingSession s5 = new CrtTrainingSession();
                s5.setTopic("Full-Stack System Design & Microservices Architecture");
                s5.setModuleType("Technical Interview Preparation");
                s5.setTrainerName("Er. Vikram Malhotra");
                s5.setTrainerOrganization("Principal Architect @ CloudCorp");
                s5.setScheduledDate("2026-10-25");
                s5.setTimeSlot("10:00 AM - 01:00 PM");
                s5.setStartTime("10:00 AM");
                s5.setEndTime("01:00 PM");
                s5.setVenue("Central Auditorium & MS Teams Hybrid");
                s5.setTargetBatch("2026");
                s5.setTargetBranch("ALL");
                s5.setAcademicYear("3rd Year");
                s5.setSemester("6");
                s5.setDescription("Load balancing, caching strategies (Redis), CDN, horizontal scaling, and CAP theorem trade-offs.");
                s5.setStatus("SCHEDULED");
                s5.setCreatedBy("teacher@placeprep.com");
                s5.setCreatedAt("2026-10-20 10:00");
                s5.setUpdatedAt("2026-10-20 10:00");
                crtSessionRepository.save(s5);

                // 6. Session 6: Cancelled Session (to verify exclusion from completed reports)
                CrtTrainingSession s6 = new CrtTrainingSession();
                s6.setTopic("Campus Coding Marathon (Round 1 Rescheduled)");
                s6.setModuleType("Coding");
                s6.setTrainerName("Internal TPO Team");
                s6.setTrainerOrganization("Placement Cell");
                s6.setScheduledDate("2026-10-14");
                s6.setTimeSlot("09:00 AM - 12:00 PM");
                s6.setStartTime("09:00 AM");
                s6.setEndTime("12:00 PM");
                s6.setVenue("Online Portal");
                s6.setTargetBatch("2026");
                s6.setTargetBranch("ALL");
                s6.setAcademicYear("3rd Year");
                s6.setSemester("6");
                s6.setDescription("Rescheduled due to college mid-term examination week collision.");
                s6.setStatus("CANCELLED");
                s6.setCreatedBy("teacher@placeprep.com");
                s6.setCreatedAt("2026-10-10 12:00");
                s6.setUpdatedAt("2026-10-13 18:00");
                crtSessionRepository.save(s6);

                // Seed Attendance for the 4 completed sessions:
                // [roll, name, email, S1, S2, S3, S4]
                String[][] crtStudentData = {
                    {"22CS0101", "Priyansh Jain", "priyansh.jain@example.edu", "PRESENT", "PRESENT", "PRESENT", "PRESENT"},
                    {"22CS0102", "Ananya Sharma", "ananya.sharma@example.edu", "PRESENT", "ABSENT", "PRESENT", "PRESENT"},
                    {"22CS0103", "Rohan Kulkarni", "rohan.kulkarni@example.edu", "ABSENT", "PRESENT", "ABSENT", "PRESENT"},
                    {"22CS0104", "Siddharth Nair", "siddharth.nair@example.edu", "PRESENT", "LATE", "PRESENT", "ABSENT"},
                    {"22CS0105", "Meera Venkat", "meera.venkat@example.edu", "ABSENT", "ABSENT", "ABSENT", "PRESENT"},
                    {"22CS0106", "Kabir Mehta", "kabir.mehta@example.edu", "PRESENT", "PRESENT", "LATE", "PRESENT"},
                    {"22CS0107", "Divya Reddy", "divya.reddy@example.edu", "PRESENT", "PRESENT", "PRESENT", "PRESENT"},
                    {"22CS0108", "Aarav Gupta", "aarav.gupta@example.edu", "PRESENT", "ABSENT", "ABSENT", "PRESENT"}
                };

                CrtTrainingSession[] completedSessions = {savedS1, savedS2, savedS3, savedS4};

                for (int cIdx = 0; cIdx < completedSessions.length; cIdx++) {
                    CrtTrainingSession cs = completedSessions[cIdx];
                    for (String[] stu : crtStudentData) {
                        CrtAttendanceRecord rec = new CrtAttendanceRecord();
                        rec.setCrtSessionId(cs.getId());
                        rec.setStudentId(stu[2]);
                        rec.setStudentRollNumber(stu[0]);
                        rec.setStudentName(stu[1]);
                        rec.setDepartment("CSE");
                        rec.setStatus(stu[3 + cIdx]);
                        rec.setRecordedBy("Dr. Neha Sharma");
                        rec.setRecordedAt(cs.getScheduledDate() + " 12:00");
                        if ("LATE".equalsIgnoreCase(stu[3 + cIdx])) {
                            rec.setRemarks("Arrived 15 minutes late after lab transit");
                        }
                        crtRecordRepository.save(rec);
                    }
                }
            }
        };
    }

    private void seedSubjectLectures(
            ClassAttendanceSessionRepository sessionRepo,
            ClassAttendanceRecordRepository recordRepo,
            String subjectCode,
            String subjectName,
            String facultyName,
            String facultyId,
            String[][] lectures, // [lectureNumber, title, date, start, end, status]
            String[] priyanshStatuses
    ) {
        String[] studentEmails = {
                "priyansh.jain@example.edu", "ananya.sharma@example.edu", "rohan.kulkarni@example.edu",
                "siddharth.nair@example.edu", "meera.venkat@example.edu", "kabir.mehta@example.edu",
                "divya.reddy@example.edu", "aarav.gupta@example.edu"
        };
        String[] studentRolls = {
                "22CS0101", "22CS0102", "22CS0103",
                "22CS0104", "22CS0105", "22CS0106",
                "22CS0107", "22CS0108"
        };
        String[] studentNames = {
                "Priyansh Jain", "Ananya Sharma", "Rohan Kulkarni",
                "Siddharth Nair", "Meera Venkat", "Kabir Mehta",
                "Divya Reddy", "Aarav Gupta"
        };

        for (int i = 0; i < lectures.length; i++) {
            String[] l = lectures[i];
            int lectureNum = Integer.parseInt(l[0]);
            String title = l[1];
            String date = l[2];
            String startTime = l[3];
            String endTime = l[4];
            String status = l[5];

            ClassAttendanceSession session = ClassAttendanceSession.builder()
                    .department("CSE")
                    .semester("6")
                    .section("A")
                    .subjectCode(subjectCode)
                    .subjectName(subjectName)
                    .facultyName(facultyName)
                    .facultyId(facultyId)
                    .sessionDate(date)
                    .periodNumber(lectureNum)
                    .lectureNumber(lectureNum)
                    .lectureTitle(title)
                    .startTime(startTime)
                    .endTime(endTime)
                    .status(status)
                    .instituteName("Delhi Technological University (DTU)")
                    .createdAt(date + " " + startTime)
                    .build();
            ClassAttendanceSession savedSession = sessionRepo.save(session);

            // If session is COMPLETED, seed records for all students
            if ("COMPLETED".equalsIgnoreCase(status)) {
                for (int s = 0; s < studentEmails.length; s++) {
                    String stuStatus = (s == 0) ? priyanshStatuses[i] : (s % 2 == 0 ? "PRESENT" : "ABSENT");
                    if (stuStatus == null) continue;

                    ClassAttendanceRecord rec = ClassAttendanceRecord.builder()
                            .sessionId(savedSession.getId())
                            .studentId(studentEmails[s])
                            .studentRollNumber(studentRolls[s])
                            .studentName(studentNames[s])
                            .subjectCode(subjectCode)
                            .status(stuStatus)
                            .latitude(28.7495)
                            .longitude(77.1180)
                            .distanceMeters(14.5 + (s * 3.2))
                            .gpsAccuracy(5.0)
                            .verificationMethod("100M_GEOFENCE_AND_FACIAL_BIOMETRIC")
                            .markedBy("STUDENT_GEOFENCE")
                            .remarks("Verified inside campus geofence")
                            .recordedAt(date + " " + startTime)
                            .build();
                    recordRepo.save(rec);
                }
            }
        }
    }

}
