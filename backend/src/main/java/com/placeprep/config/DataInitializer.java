package com.placeprep.config;

import com.placeprep.model.Company;
import com.placeprep.model.Hackathon;
import com.placeprep.model.Internship;
import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.model.User;
import com.placeprep.repository.CompanyRepository;
import com.placeprep.repository.HackathonRepository;
import com.placeprep.repository.InternshipRepository;
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
            HackathonRepository hackathonRepository,
            InternshipRepository internshipRepository
    ) {
        return args -> {
            // Seed Users (including ineligible 2028 batch student & eligible 2026 final-year student)
            if (userRepository.count() == 0) {
                User demoUser = new User();
                demoUser.setName("Priyansh Jain");
                demoUser.setEmail("priyansh.jain@example.edu");
                demoUser.setPassword("password123");
                demoUser.setCollege("Delhi Technological University (DTU)");
                demoUser.setBranch("Computer Science and Engineering");
                demoUser.setGraduationBatch("2028");
                demoUser.setRole("student");
                demoUser.setOnboardingCompleted(true);
                userRepository.save(demoUser);

                User finalYearUser = new User();
                finalYearUser.setName("Aarav Sharma");
                finalYearUser.setEmail("finalyear.student@placeprep.edu");
                finalYearUser.setPassword("password123");
                finalYearUser.setCollege("Delhi Technological University (DTU)");
                finalYearUser.setBranch("Computer Science and Engineering");
                finalYearUser.setGraduationBatch("2026");
                finalYearUser.setRole("student");
                finalYearUser.setOnboardingCompleted(true);
                userRepository.save(finalYearUser);

                User defaultDemo = new User();
                defaultDemo.setName("Demo Student");
                defaultDemo.setEmail("demo@placeprep.com");
                defaultDemo.setPassword("password123");
                defaultDemo.setCollege("Delhi Technological University (DTU)");
                defaultDemo.setBranch("Information Technology");
                defaultDemo.setGraduationBatch("2028");
                defaultDemo.setRole("student");
                defaultDemo.setOnboardingCompleted(true);
                userRepository.save(defaultDemo);
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
                // On-Campus Drives
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

                // Off-Campus Placement Drives (Exclusively gated for Batch 2026 final-year students)
                PlacementDrive amznOff = new PlacementDrive();
                amznOff.setDriveId("off-amzn-sde-2026");
                amznOff.setCompanyId("amazon");
                amznOff.setCompanyName("Amazon Web Services (AWS)");
                amznOff.setRole("Software Development Engineer (Off-Campus)");
                amznOff.setCtc("₹18.0 - ₹24.0 LPA");
                amznOff.setDriveDate("2026-12-10");
                amznOff.setDriveTime("10:00 AM");
                amznOff.setDeadline("2026-11-20");
                amznOff.setStatus("Active Off-Campus Drive");
                amznOff.setVerifiedBadge(true);
                amznOff.setDriveType("OFF_CAMPUS");
                amznOff.setOffCampus(true);
                amznOff.setRegistrationLink("https://www.amazon.jobs/en/teams/university-tech");
                amznOff.setVenue("Virtual Online Assessment & Amazon Chime Panel");
                amznOff.setReportingTime("09:30 AM");
                amznOff.setInstructions("Final-year graduating students only. Candidate must apply on Amazon Jobs with campus roll number. Internal employee referral can be requested via LinkedIn alumni before 2026-11-15.");
                amznOff.setMinCgpa(7.0);
                amznOff.setMinTenthPercentage(65.0);
                amznOff.setMinTwelfthPercentage(65.0);
                amznOff.setMaxBacklogs(0);
                amznOff.setEligibleBatches(Arrays.asList("2026"));
                amznOff.setLocations(Arrays.asList("Bengaluru", "Hyderabad", "Remote Eligible"));
                amznOff.setAllowedBranches(Arrays.asList("CSE", "IT", "ECE", "EEE", "MCA"));
                amznOff.setRounds(Arrays.asList("Online Cognitive & Coding Assessment", "Technical Interview Round 1 (DSA)", "Technical Interview Round 2 (System & OOP)", "Bar Raiser & Leadership Principles"));
                driveRepository.save(amznOff);

                PlacementDrive googOff = new PlacementDrive();
                googOff.setDriveId("off-goog-swe-2026");
                googOff.setCompanyId("google");
                googOff.setCompanyName("Google India");
                googOff.setRole("Software Engineer - University Graduate (Off-Campus)");
                googOff.setCtc("₹28.0 - ₹35.0 LPA");
                googOff.setDriveDate("2026-12-20");
                googOff.setDriveTime("11:00 AM");
                googOff.setDeadline("2026-11-28");
                googOff.setStatus("Active Off-Campus Drive");
                googOff.setVerifiedBadge(true);
                googOff.setDriveType("OFF_CAMPUS");
                googOff.setOffCampus(true);
                googOff.setRegistrationLink("https://careers.google.com/jobs/results/university-grad");
                googOff.setVenue("Google Meet Virtual Assessment Suite");
                googOff.setReportingTime("10:30 AM");
                googOff.setInstructions("Strictly for 2026 graduating batch. Clean coding skills in C++, Java, or Python required. Employee referral link can be attached during application if available from DTU alumni network.");
                googOff.setMinCgpa(7.5);
                googOff.setMinTenthPercentage(70.0);
                googOff.setMinTwelfthPercentage(70.0);
                googOff.setMaxBacklogs(0);
                googOff.setEligibleBatches(Arrays.asList("2026"));
                googOff.setLocations(Arrays.asList("Bengaluru", "Hyderabad", "Gurugram"));
                googOff.setAllowedBranches(Arrays.asList("Computer Science", "Information Technology", "Mathematics & Computing"));
                googOff.setRounds(Arrays.asList("Google Online Challenge (Coding)", "Technical Phone Screen", "Virtual Onsite Coding Round 1", "Virtual Onsite Coding Round 2", "Googliness & Leadership Round"));
                driveRepository.save(googOff);

                PlacementDrive infyOff = new PlacementDrive();
                infyOff.setDriveId("off-infy-sp-2026");
                infyOff.setCompanyId("infosys");
                infyOff.setCompanyName("Infosys Limited");
                infyOff.setRole("Specialist Programmer (Off-Campus National Drive)");
                infyOff.setCtc("₹9.50 LPA");
                infyOff.setDriveDate("2026-12-02");
                infyOff.setDriveTime("09:00 AM");
                infyOff.setDeadline("2026-11-18");
                infyOff.setStatus("Active Off-Campus Drive");
                infyOff.setVerifiedBadge(true);
                infyOff.setDriveType("OFF_CAMPUS");
                infyOff.setOffCampus(true);
                infyOff.setRegistrationLink("https://career.infosys.com/jobdesc?jobReferenceCode=INFYS-SP-2026");
                infyOff.setVenue("Infosys Assessment Platform & Webex Interview");
                infyOff.setReportingTime("08:30 AM");
                infyOff.setInstructions("National off-campus drive open to final-year students (Batch 2026). Requires advanced competitive programming knowledge and dynamic programming proficiency.");
                infyOff.setMinCgpa(6.5);
                infyOff.setMinTenthPercentage(60.0);
                infyOff.setMinTwelfthPercentage(60.0);
                infyOff.setMaxBacklogs(0);
                infyOff.setEligibleBatches(Arrays.asList("2026"));
                infyOff.setLocations(Arrays.asList("Bengaluru", "Pune", "Hyderabad", "Chennai"));
                infyOff.setAllowedBranches(Arrays.asList("All Engineering Branches"));
                infyOff.setRounds(Arrays.asList("HackWithInfy / National Coding Qualifier", "Technical Interview (DSA & Design)", "HR & Documentation Verification"));
                driveRepository.save(infyOff);
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

            // Seed Hackathons (Development Sample Records)
            if (hackathonRepository.count() == 0) {
                Hackathon h1 = Hackathon.builder()
                        .title("Smart India Hackathon (SIH 2026)")
                        .organizer("Ministry of Education & AICTE")
                        .description("World's biggest open innovation model for engineering students to solve pressing national challenges presented by ministries, departments, and industries.")
                        .registrationDeadline("2026-11-20")
                        .eventDate("2026-12-15 to 2026-12-17")
                        .teamSize("6 Members (Min 1 Female)")
                        .prizePool("₹1,00,000 per problem statement + Mentorship")
                        .registrationUrl("https://www.sih.gov.in")
                        .tags("Smart Automation, Clean Tech, Healthcare, AI/ML")
                        .mode("HYBRID")
                        .bannerUrl("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80")
                        .build();
                hackathonRepository.save(h1);

                Hackathon h2 = Hackathon.builder()
                        .title("Google Solution Challenge 2027")
                        .organizer("Google Developer Student Clubs (GDSC)")
                        .description("Build an impactful solution for one or more of the United Nations 17 Sustainable Development Goals using Google Cloud, Firebase, Flutter, Android, or TensorFlow.")
                        .registrationDeadline("2026-11-30")
                        .eventDate("2027-01-10 to 2027-03-31")
                        .teamSize("1-4 Members")
                        .prizePool("Top 3: $3,000/member + Google Mentorship")
                        .registrationUrl("https://developers.google.com/community/gdsc-solution-challenge")
                        .tags("Cloud, AI/ML, Flutter, Sustainability, Mobile")
                        .mode("ONLINE")
                        .bannerUrl("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80")
                        .build();
                hackathonRepository.save(h2);

                Hackathon h3 = Hackathon.builder()
                        .title("HackDTU 7.0 - Northern Flagship Collegiate Hackathon")
                        .organizer("Delhi Technological University (DTU)")
                        .description("36-hour non-stop collegiate hackathon bringing together over 500 passionate developers across India to build frontier technology projects.")
                        .registrationDeadline("2026-11-12")
                        .eventDate("2026-11-28 to 2026-11-29")
                        .teamSize("2-4 Members")
                        .prizePool("₹2,50,000 Cash Pool + Cloud Credits")
                        .registrationUrl("https://hackdtu.in")
                        .tags("Web3, FinTech, Cybersecurity, System Design")
                        .mode("OFFLINE")
                        .bannerUrl("https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80")
                        .build();
                hackathonRepository.save(h3);

                Hackathon h4 = Hackathon.builder()
                        .title("Microsoft Imagine Cup 2027")
                        .organizer("Microsoft Corporation")
                        .description("Global student developer competition empowering the next generation of founders to leverage Microsoft Azure AI and build transformative startup solutions.")
                        .registrationDeadline("2026-12-15")
                        .eventDate("2027-02-01 to 2027-05-15")
                        .teamSize("1-4 Members")
                        .prizePool("$100,000 USD + Mentorship with Microsoft Leadership")
                        .registrationUrl("https://imaginecup.microsoft.com")
                        .tags("Azure AI, Generative AI, Cloud Computing, Startups")
                        .mode("ONLINE")
                        .bannerUrl("https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80")
                        .build();
                hackathonRepository.save(h4);
            }

            // Seed Internships (Development Sample Records)
            if (internshipRepository.count() == 0) {
                Internship i1 = Internship.builder()
                        .companyName("Amazon")
                        .role("Software Development Engineer (SDE) Intern")
                        .stipend("₹1,10,000 / month")
                        .duration("6 Months (Jan - June 2027)")
                        .location("Bengaluru, Karnataka (Hybrid)")
                        .deadline("2026-11-15")
                        .eligibleBatches("2026, 2027")
                        .eligibleBranches("CSE, IT, ECE, Mathematics & Computing")
                        .skillsRequired("Java / C++, Data Structures & Algorithms, Distributed Systems basics, OOP")
                        .applicationUrl("https://www.amazon.jobs/en/jobs/internship-sde")
                        .ppoOpportunity(true)
                        .build();
                internshipRepository.save(i1);

                Internship i2 = Internship.builder()
                        .companyName("Adobe Systems")
                        .role("Product Technology Intern (R&D)")
                        .stipend("₹1,00,000 / month")
                        .duration("2 Months (May - July 2027)")
                        .location("Noida, Uttar Pradesh (In-Office)")
                        .deadline("2026-11-25")
                        .eligibleBatches("2027, 2028")
                        .eligibleBranches("CSE, IT, Software Engineering")
                        .skillsRequired("C++, Computer Graphics, Algorithms, System Programming")
                        .applicationUrl("https://careers.adobe.com/us/en/university-internships")
                        .ppoOpportunity(true)
                        .build();
                internshipRepository.save(i2);

                Internship i3 = Internship.builder()
                        .companyName("Razorpay")
                        .role("Frontend Engineering Intern")
                        .stipend("₹45,000 / month")
                        .duration("6 Months (Immediate Start)")
                        .location("Remote (India-Wide)")
                        .deadline("2026-11-08")
                        .eligibleBatches("2026, 2027, 2028")
                        .eligibleBranches("All Engineering Branches")
                        .skillsRequired("React, TypeScript, Tailwind CSS, REST APIs, Web Performance")
                        .applicationUrl("https://razorpay.com/jobs/frontend-intern")
                        .ppoOpportunity(true)
                        .build();
                internshipRepository.save(i3);

                Internship i4 = Internship.builder()
                        .companyName("Deloitte USI")
                        .role("Analyst Intern - Cloud & Data Engineering")
                        .stipend("₹35,000 / month")
                        .duration("3 Months (Summer 2027)")
                        .location("Hyderabad, Telangana (Hybrid)")
                        .deadline("2026-12-01")
                        .eligibleBatches("2027, 2028")
                        .eligibleBranches("CSE, IT, ECE, Mechanical, Civil, Electrical")
                        .skillsRequired("SQL, Python, Cloud Fundamentals (AWS/Azure), PowerBI basics")
                        .applicationUrl("https://www2.deloitte.com/ui/en/careers/students.html")
                        .ppoOpportunity(false)
                        .build();
                internshipRepository.save(i4);

                Internship i5 = Internship.builder()
                        .companyName("Swiggy")
                        .role("Backend Engineering Intern")
                        .stipend("₹65,000 / month")
                        .duration("6 Months (Jan - June 2027)")
                        .location("Bengaluru, Karnataka (Remote / Hybrid)")
                        .deadline("2026-11-18")
                        .eligibleBatches("2026, 2027")
                        .eligibleBranches("CSE, IT")
                        .skillsRequired("Golang / Java, Spring Boot, PostgreSQL, Redis, Microservices")
                        .applicationUrl("https://careers.swiggy.com/internships")
                        .ppoOpportunity(true)
                        .build();
                internshipRepository.save(i5);
            }
        };
    }
}
