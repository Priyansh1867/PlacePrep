package com.placeprep.config;

import com.placeprep.model.Candidate;
import com.placeprep.model.CodingExample;
import com.placeprep.model.CodingTestCase;
import com.placeprep.model.Company;
import com.placeprep.model.InterviewQuestion;
import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.model.User;
import com.placeprep.repository.CandidateRepository;
import com.placeprep.repository.CompanyRepository;
import com.placeprep.repository.InterviewQuestionRepository;
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
            CandidateRepository candidateRepository,
            InterviewQuestionRepository interviewQuestionRepository
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

            seedCodingProblems(interviewQuestionRepository);
        };
    }

    private void seedCodingProblems(InterviewQuestionRepository repository) {
        InterviewQuestion cycle = repository.findByQuestionId("hcl-tech-02").orElseGet(InterviewQuestion::new);
        cycle.setQuestionId("hcl-tech-02");
        cycle.setCompanyId("hcltech");
        cycle.setRound("technical");
        cycle.setCategory("Linked Lists");
        cycle.setDifficulty("Medium");
        cycle.setQuestion("How do you detect and remove a loop in a Singly Linked List? Explain Floyd's Cycle Detection algorithm.");
        cycle.setApproach("Use two pointers: slow (1 step) and fast (2 steps). When they meet, a cycle exists.");
        cycle.setSampleCode("""
                boolean hasCycle(ListNode head) {
                    if (head == null || head.next == null) return false;
                    ListNode slow = head, fast = head;
                    while (fast != null && fast.next != null) {
                        slow = slow.next;
                        fast = fast.next.next;
                        if (slow == fast) return true;
                    }
                    return false;
                }
                """);
        cycle.setCodingStatement("Given a list of node values and the zero-based index where the last node links back (or -1 if it does not link back), build the singly linked list and determine whether it contains a cycle.");
        cycle.setInputFormat("The first line contains n. The second line contains n integer node values. The last line contains pos, the zero-based index connected by the final node, or -1 if the list ends normally.");
        cycle.setOutputFormat("Print true if the list contains a cycle; otherwise print false.");
        cycle.setCodingConstraints(List.of("0 <= n <= 100000", "-1 <= pos < n", "Node values are signed 32-bit integers."));
        cycle.setCodingExamples(List.of(
                new CodingExample("4\n3 2 0 -4\n1", "true", "The final node links back to the node at index 1."),
                new CodingExample("3\n1 2 3\n-1", "false", "The final node does not link back.")
        ));
        cycle.setPublicTestCases(List.of(
                new CodingTestCase("4\n3 2 0 -4\n1\n", "true"),
                new CodingTestCase("3\n1 2 3\n-1\n", "false")
        ));
        cycle.setHiddenTestCases(List.of(
                new CodingTestCase("0\n\n-1\n", "false"),
                new CodingTestCase("1\n5\n0\n", "true"),
                new CodingTestCase("5\n1 2 3 4 5\n4\n", "true")
        ));
        cycle.setStarterCodeJava("""
                import java.util.*;

                public class Main {
                    static class ListNode {
                        int value;
                        ListNode next;
                        ListNode(int value) { this.value = value; }
                    }

                    static boolean hasCycle(ListNode head) {
                        // Use slow and fast pointers to detect a cycle.
                        return false;
                    }

                    public static void main(String[] args) {
                        Scanner scanner = new Scanner(System.in);
                        int n = scanner.nextInt();
                        ListNode[] nodes = new ListNode[n];
                        for (int i = 0; i < n; i++) nodes[i] = new ListNode(scanner.nextInt());
                        int pos = scanner.nextInt();
                        for (int i = 0; i + 1 < n; i++) nodes[i].next = nodes[i + 1];
                        if (n > 0 && pos >= 0) nodes[n - 1].next = nodes[pos];
                        System.out.println(hasCycle(n == 0 ? null : nodes[0]));
                    }
                }
                """);
        repository.save(cycle);

        InterviewQuestion reverseWords = repository.findByQuestionId("tcs-tech-01").orElseGet(InterviewQuestion::new);
        reverseWords.setQuestionId("tcs-tech-01");
        reverseWords.setCompanyId("tcs");
        reverseWords.setRound("technical");
        reverseWords.setCategory("Strings");
        reverseWords.setDifficulty("Easy");
        reverseWords.setQuestion("How do you reverse a string without using built-in reverse functions? How would you reverse words in a sentence?");
        reverseWords.setApproach("Split the sentence into words and write them from last to first.");
        reverseWords.setSampleCode("""
                public static String reverseWords(String s) {
                    String[] words = s.trim().split("\\\\s+");
                    StringBuilder result = new StringBuilder();
                    for (int i = words.length - 1; i >= 0; i--) {
                        if (words[i].isEmpty()) continue;
                        if (result.length() > 0) result.append(' ');
                        result.append(words[i]);
                    }
                    return result.toString();
                }
                """);
        reverseWords.setCodingStatement("Given a sentence, return its words in reverse order. Treat one or more spaces as separators and return words separated by a single space.");
        reverseWords.setInputFormat("One line containing the sentence.");
        reverseWords.setOutputFormat("Print the words in reverse order, separated by one space.");
        reverseWords.setCodingConstraints(List.of("0 <= sentence length <= 100000", "A word contains no whitespace."));
        reverseWords.setCodingExamples(List.of(
                new CodingExample("the sky is blue", "blue is sky the", "The words are written from right to left."),
                new CodingExample("hello", "hello", "A sentence with one word stays unchanged.")
        ));
        reverseWords.setPublicTestCases(List.of(
                new CodingTestCase("the sky is blue\n", "blue is sky the"),
                new CodingTestCase("hello\n", "hello")
        ));
        reverseWords.setHiddenTestCases(List.of(
                new CodingTestCase("a good   example\n", "example good a"),
                new CodingTestCase("  practice makes perfect  \n", "perfect makes practice")
        ));
        reverseWords.setStarterCodeJava("""
                import java.io.*;
                import java.util.*;

                public class Main {
                    static String reverseWords(String sentence) {
                        String trimmed = sentence.trim();
                        if (trimmed.isEmpty()) return "";
                        String[] words = trimmed.split("\\\\s+");
                        Collections.reverse(Arrays.asList(words));
                        return String.join(" ", words);
                    }

                    public static void main(String[] args) throws Exception {
                        String sentence = new BufferedReader(new InputStreamReader(System.in)).readLine();
                        System.out.println(reverseWords(sentence == null ? "" : sentence));
                    }
                }
                """);
        repository.save(reverseWords);

        InterviewQuestion longestSubstring = repository.findByQuestionId("infy-tech-01").orElseGet(InterviewQuestion::new);
        longestSubstring.setQuestionId("infy-tech-01");
        longestSubstring.setCompanyId("infosys");
        longestSubstring.setRound("technical");
        longestSubstring.setCategory("Sliding Window");
        longestSubstring.setDifficulty("Medium");
        longestSubstring.setQuestion("How do you find the longest substring without repeating characters in an optimal way?");
        longestSubstring.setApproach("Use a sliding window and store the last seen index for each character.");
        longestSubstring.setSampleCode("""
                public int lengthOfLongestSubstring(String s) {
                    Map<Character, Integer> lastSeen = new HashMap<>();
                    int left = 0, best = 0;
                    for (int right = 0; right < s.length(); right++) {
                        char current = s.charAt(right);
                        if (lastSeen.containsKey(current) && lastSeen.get(current) >= left) {
                            left = lastSeen.get(current) + 1;
                        }
                        lastSeen.put(current, right);
                        best = Math.max(best, right - left + 1);
                    }
                    return best;
                }
                """);
        longestSubstring.setCodingStatement("Given a string, return the length of its longest substring that contains no repeated characters.");
        longestSubstring.setInputFormat("One line containing the input string.");
        longestSubstring.setOutputFormat("Print one integer: the maximum length.");
        longestSubstring.setCodingConstraints(List.of("0 <= string length <= 100000", "The input may contain letters, digits, symbols, and spaces."));
        longestSubstring.setCodingExamples(List.of(
                new CodingExample("abcabcbb", "3", "The longest substring without repeats is abc."),
                new CodingExample("bbbbb", "1", "Every substring longer than one repeats b.")
        ));
        longestSubstring.setPublicTestCases(List.of(
                new CodingTestCase("abcabcbb\n", "3"),
                new CodingTestCase("bbbbb\n", "1")
        ));
        longestSubstring.setHiddenTestCases(List.of(
                new CodingTestCase("pwwkew\n", "3"),
                new CodingTestCase("\n", "0"),
                new CodingTestCase("dvdf\n", "3")
        ));
        longestSubstring.setStarterCodeJava("""
                import java.io.*;
                import java.util.*;

                public class Main {
                    static int lengthOfLongestSubstring(String value) {
                        Map<Character, Integer> lastSeen = new HashMap<>();
                        int left = 0, best = 0;
                        for (int right = 0; right < value.length(); right++) {
                            char current = value.charAt(right);
                            if (lastSeen.containsKey(current) && lastSeen.get(current) >= left) {
                                left = lastSeen.get(current) + 1;
                            }
                            lastSeen.put(current, right);
                            best = Math.max(best, right - left + 1);
                        }
                        return best;
                    }

                    public static void main(String[] args) throws Exception {
                        String value = new BufferedReader(new InputStreamReader(System.in)).readLine();
                        System.out.println(lengthOfLongestSubstring(value == null ? "" : value));
                    }
                }
                """);
        repository.save(longestSubstring);
    }
}
