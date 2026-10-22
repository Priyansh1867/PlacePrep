package com.placeprep.config;

import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.Company;
import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.model.User;
import com.placeprep.repository.ClassAttendanceRecordRepository;
import com.placeprep.repository.ClassAttendanceSessionRepository;
import com.placeprep.repository.CompanyRepository;
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
            ClassAttendanceRecordRepository classRecordRepository
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
        };
    }
}
