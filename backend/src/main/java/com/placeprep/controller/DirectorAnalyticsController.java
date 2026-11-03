package com.placeprep.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller providing Director-level Placement Round Selection & Analytics Intelligence.
 * Secured strictly to DIRECTOR, ADMIN, and TPO roles.
 */
@RestController
@RequestMapping("/api/director")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DirectorAnalyticsController {

    @GetMapping("/placement-analytics")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'ADMIN', 'TPO')")
    public ResponseEntity<Map<String, Object>> getPlacementAnalytics(
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String status
    ) {
        List<Map<String, Object>> companies = buildCompanyAnalytics();
        List<Map<String, Object>> candidates = buildCandidateDetails();

        // Calculate aggregate summary
        int totalCompanies = companies.size();
        int totalRegistered = 0;
        int totalFinallySelected = 0;
        int totalRejected = 0;
        int totalInProcess = 0;

        for (Map<String, Object> c : companies) {
            totalRegistered += (int) c.get("totalRegistered");
            totalFinallySelected += (int) c.get("finalSelected");
            totalRejected += (int) c.get("rejected");
            totalInProcess += (int) c.get("inProcess");
        }

        double selRateVal = totalRegistered > 0 ? ((double) totalFinallySelected / totalRegistered) * 100.0 : 0.0;
        String overallSelectionRate = String.format("%.1f%%", selRateVal);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalCompanies", totalCompanies);
        summary.put("totalRegistered", totalRegistered);
        summary.put("totalFinallySelected", totalFinallySelected);
        summary.put("totalRejected", totalRejected);
        summary.put("totalInProcess", totalInProcess);
        summary.put("overallSelectionRate", overallSelectionRate);
        summary.put("isDemoData", true);

        // Filter companies if requested
        List<Map<String, Object>> returnedCompanies = companies;
        if (companyId != null && !companyId.isEmpty() && !"ALL".equalsIgnoreCase(companyId)) {
            returnedCompanies = new ArrayList<>();
            for (Map<String, Object> c : companies) {
                if (companyId.equalsIgnoreCase((String) c.get("id"))) {
                    returnedCompanies.add(c);
                }
            }
        }

        // Filter candidates if requested
        List<Map<String, Object>> returnedCandidates = new ArrayList<>();
        for (Map<String, Object> cand : candidates) {
            boolean matchesCompany = companyId == null || companyId.isEmpty() || "ALL".equalsIgnoreCase(companyId)
                    || companyId.equalsIgnoreCase((String) cand.get("companyId"));
            boolean matchesStatus = status == null || status.isEmpty() || "ALL".equalsIgnoreCase(status)
                    || status.equalsIgnoreCase((String) cand.get("status"));
            if (matchesCompany && matchesStatus) {
                returnedCandidates.add(cand);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        response.put("companies", returnedCompanies);
        response.put("candidates", returnedCandidates);

        return ResponseEntity.ok(response);
    }

    private List<Map<String, Object>> buildCompanyAnalytics() {
        List<Map<String, Object>> list = new ArrayList<>();

        // 1. TCS
        list.add(createCompany(
                "tcs", "Tata Consultancy Services", "Ninja & Digital SDE", "₹3.60 - ₹7.20 LPA", "2025", "2025-03-12", "Completed",
                220, 220, 34, 170, 16, 34,
                createRounds(new int[][]{
                        {1, 220, 165, 50, 5},
                        {2, 165, 95, 65, 5},
                        {3, 95, 60, 32, 3},
                        {4, 60, 42, 16, 2},
                        {5, 42, 36, 5, 1},
                        {6, 36, 34, 2, 0}
                })
        ));

        // 2. Infosys
        list.add(createCompany(
                "infosys", "Infosys", "Specialist Programmer & SE", "₹9.50 LPA", "2025", "2025-03-18", "Completed",
                180, 180, 22, 142, 16, 22,
                createRounds(new int[][]{
                        {1, 180, 130, 45, 5},
                        {2, 130, 70, 55, 5},
                        {3, 70, 42, 25, 3},
                        {4, 42, 28, 12, 2},
                        {5, 28, 24, 3, 1},
                        {6, 24, 22, 2, 0}
                })
        ));

        // 3. Wipro
        list.add(createCompany(
                "wipro", "Wipro", "Turbo & Elite Developer", "₹6.50 LPA", "2025", "2025-03-22", "In Progress",
                160, 160, 19, 123, 18, 19,
                createRounds(new int[][]{
                        {1, 160, 120, 35, 5},
                        {2, 120, 64, 50, 6},
                        {3, 64, 38, 22, 4},
                        {4, 38, 26, 10, 2},
                        {5, 26, 20, 5, 1},
                        {6, 20, 19, 1, 0}
                })
        ));

        // 4. Accenture
        list.add(createCompany(
                "accenture", "Accenture", "Advanced App Engineering Analyst", "₹4.50 - ₹6.50 LPA", "2025", "2025-03-25", "Completed",
                240, 240, 40, 183, 17, 40,
                createRounds(new int[][]{
                        {1, 240, 180, 55, 5},
                        {2, 180, 105, 70, 5},
                        {3, 105, 68, 33, 4},
                        {4, 68, 48, 18, 2},
                        {5, 48, 42, 5, 1},
                        {6, 42, 40, 2, 0}
                })
        ));

        // 5. Capgemini
        list.add(createCompany(
                "capgemini", "Capgemini", "Senior Analyst & Cloud Engineer", "₹7.50 LPA", "2025", "2025-04-02", "In Progress",
                150, 150, 18, 117, 15, 18,
                createRounds(new int[][]{
                        {1, 150, 110, 36, 4},
                        {2, 110, 60, 45, 5},
                        {3, 60, 36, 21, 3},
                        {4, 36, 24, 10, 2},
                        {5, 24, 20, 3, 1},
                        {6, 20, 18, 2, 0}
                })
        ));

        // 6. Cognizant
        list.add(createCompany(
                "cognizant", "Cognizant", "GenC Elevate & Next SDE", "₹6.75 LPA", "2025", "2025-04-08", "In Progress",
                175, 175, 24, 134, 17, 24,
                createRounds(new int[][]{
                        {1, 175, 125, 44, 6},
                        {2, 125, 72, 48, 5},
                        {3, 72, 44, 25, 3},
                        {4, 44, 30, 12, 2},
                        {5, 30, 25, 4, 1},
                        {6, 25, 24, 1, 0}
                })
        ));

        // 7. HCLTech
        list.add(createCompany(
                "hcltech", "HCLTech", "Software Engineer Graduate", "₹5.50 LPA", "2025", "2025-04-14", "In Progress",
                140, 140, 16, 108, 16, 16,
                createRounds(new int[][]{
                        {1, 140, 100, 35, 5},
                        {2, 100, 55, 40, 5},
                        {3, 55, 32, 20, 3},
                        {4, 32, 22, 8, 2},
                        {5, 22, 17, 4, 1},
                        {6, 17, 16, 1, 0}
                })
        ));

        // 8. Deloitte
        list.add(createCompany(
                "deloitte", "Deloitte", "Associate Solution Advisor", "₹8.50 LPA", "2025", "2025-04-20", "Active Evaluation",
                190, 190, 23, 150, 17, 23,
                createRounds(new int[][]{
                        {1, 190, 135, 50, 5},
                        {2, 135, 75, 54, 6},
                        {3, 75, 45, 27, 3},
                        {4, 45, 30, 13, 2},
                        {5, 30, 25, 4, 1},
                        {6, 25, 23, 2, 0}
                })
        ));

        return list;
    }

    private Map<String, Object> createCompany(
            String id, String name, String role, String ctc, String batch, String date, String status,
            int totalReg, int appeared, int selected, int rejected, int inProcess, int finalSelected,
            List<Map<String, Object>> rounds
    ) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", id);
        map.put("companyName", name);
        map.put("role", role);
        map.put("ctc", ctc);
        map.put("batch", batch);
        map.put("driveDate", date);
        map.put("status", status);
        map.put("totalRegistered", totalReg);
        map.put("appeared", appeared);
        map.put("selected", selected);
        map.put("rejected", rejected);
        map.put("inProcess", inProcess);
        map.put("finalSelected", finalSelected);
        map.put("rounds", rounds);
        return map;
    }

    private static final String[] ROUND_NAMES = new String[]{
            "",
            "Registration / Application",
            "Online Assessment",
            "Technical Interview – Round 1",
            "Technical Interview – Round 2",
            "HR Interview",
            "Final Selection"
    };

    private List<Map<String, Object>> createRounds(int[][] raw) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (int[] r : raw) {
            int roundNum = r[0];
            int appeared = r[1];
            int selectedNext = r[2];
            int rejected = r[3];
            int pending = r[4];

            double selRate = appeared > 0 ? Math.round(((double) selectedNext / appeared) * 1000.0) / 10.0 : 0.0;
            double rejRate = appeared > 0 ? Math.round(((double) rejected / appeared) * 1000.0) / 10.0 : 0.0;

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("roundNumber", roundNum);
            m.put("name", roundNum < ROUND_NAMES.length ? ROUND_NAMES[roundNum] : "Round " + roundNum);
            m.put("appeared", appeared);
            m.put("selectedNextRound", selectedNext);
            m.put("rejected", rejected);
            m.put("pending", pending);
            m.put("selectionRate", selRate);
            m.put("rejectionRate", rejRate);
            list.add(m);
        }
        return list;
    }

    private List<Map<String, Object>> buildCandidateDetails() {
        List<Map<String, Object>> list = new ArrayList<>();

        list.add(createCandidate("cand-tcs-001", "Aarav Sharma", "2025/CSE/042", "Computer Science and Engineering", "2025", "tcs", "Tata Consultancy Services", "Ninja & Digital SDE", "Final Selection", 92, 88, 95, "Selected", "Exceptional DSA coding & system design. Recommended for Digital profile offer."));
        list.add(createCandidate("cand-tcs-002", "Ananya Verma", "2025/IT/018", "Information Technology", "2025", "tcs", "Tata Consultancy Services", "Ninja & Digital SDE", "Final Selection", 85, 82, 90, "Selected", "Strong cloud architecture understanding, clear verbal articulation."));
        list.add(createCandidate("cand-tcs-003", "Rohan Gupta", "2025/ECE/077", "Electronics and Communication", "2025", "tcs", "Tata Consultancy Services", "Ninja & Digital SDE", "Technical Interview – Round 2", 78, 70, null, "In Process", "Cleared Tech 1 smoothly; Tech 2 interview panel feedback pending submission."));
        list.add(createCandidate("cand-tcs-004", "Priya Nair", "2025/CSE/104", "Computer Science and Engineering", "2025", "tcs", "Tata Consultancy Services", "Ninja & Digital SDE", "Online Assessment", 58, null, null, "Rejected", "Did not meet the mandatory 70% threshold in advanced coding module."));

        list.add(createCandidate("cand-inf-001", "Devansh Kulkarni", "2025/CSE/011", "Computer Science and Engineering", "2025", "infosys", "Infosys", "Specialist Programmer & SE", "Final Selection", 96, 94, 92, "Selected", "Ranked top 1% in InfyTQ coding challenge. Outstanding algorithms depth."));
        list.add(createCandidate("cand-inf-002", "Sneha Patel", "2025/IT/045", "Information Technology", "2025", "infosys", "Infosys", "Specialist Programmer & SE", "HR Interview", 88, 84, 80, "In Process", "Strong technical presentation; HR verification in progress."));
        list.add(createCandidate("cand-inf-003", "Aditya Deshmukh", "2025/EE/032", "Electrical and Electronics", "2025", "infosys", "Infosys", "Specialist Programmer & SE", "Technical Interview – Round 1", 80, 52, null, "Rejected", "Struggled with tree traversal algorithms and OOP design patterns."));

        list.add(createCandidate("cand-wip-001", "Kavita Sundaram", "2025/CSE/056", "Computer Science and Engineering", "2025", "wipro", "Wipro", "Turbo & Elite Developer", "Final Selection", 89, 86, 88, "Selected", "Selected for Elite Developer track with premium project deployment."));
        list.add(createCandidate("cand-wip-002", "Vikram Joshi", "2025/IT/029", "Information Technology", "2025", "wipro", "Wipro", "Turbo & Elite Developer", "Technical Interview – Round 2", 82, 79, null, "In Process", "Managerial tech evaluation underway. Demonstrated strong REST API experience."));
        list.add(createCandidate("cand-wip-003", "Meera Menon", "2025/ECE/014", "Electronics and Communication", "2025", "wipro", "Wipro", "Turbo & Elite Developer", "Online Assessment", 61, null, null, "Rejected", "Aptitude quantitative cutoff not attained."));

        list.add(createCandidate("cand-acc-001", "Rahul Singhania", "2025/CSE/007", "Computer Science and Engineering", "2025", "accenture", "Accenture", "Advanced App Engineering Analyst", "Final Selection", 94, 91, 90, "Selected", "Advanced App Engineering role confirmed. Strong full-stack expertise."));
        list.add(createCandidate("cand-acc-002", "Pooja Bhatnagar", "2025/IT/062", "Information Technology", "2025", "accenture", "Accenture", "Advanced App Engineering Analyst", "Final Selection", 88, 85, 89, "Selected", "Cleared with distinction in behavioral and agile methodology rounds."));
        list.add(createCandidate("cand-acc-003", "Harsh Vardhan", "2025/ME/040", "Mechanical Engineering", "2025", "accenture", "Accenture", "Advanced App Engineering Analyst", "Technical Interview – Round 1", 79, 72, null, "In Process", "Eligible non-CS candidate; evaluated well on analytical logic."));

        list.add(createCandidate("cand-del-001", "Shreya Mukherjee", "2025/CSE/003", "Computer Science and Engineering", "2025", "deloitte", "Deloitte", "Associate Solution Advisor", "Final Selection", 95, 92, 96, "Selected", "Highest composite score in campus drive. Exceptional presentation and case study analysis."));
        list.add(createCandidate("cand-del-002", "Varun Chopra", "2025/IT/051", "Information Technology", "2025", "deloitte", "Deloitte", "Associate Solution Advisor", "Final Selection", 89, 87, 91, "Selected", "Clear strategic thinker with enterprise tech architecture experience."));
        list.add(createCandidate("cand-del-003", "Simran Ahuja", "2025/ECE/034", "Electronics and Communication", "2025", "deloitte", "Deloitte", "Associate Solution Advisor", "HR Interview", 86, 83, 85, "In Process", "Final partner interview scheduled."));

        return list;
    }

    private Map<String, Object> createCandidate(
            String id, String name, String roll, String branch, String batch,
            String companyId, String companyName, String role, String currentRound,
            Integer assessment, Integer technical, Integer hr, String status, String remarks
    ) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", id);
        map.put("studentName", name);
        map.put("rollNumber", roll);
        map.put("branch", branch);
        map.put("batch", batch);
        map.put("companyId", companyId);
        map.put("companyName", companyName);
        map.put("role", role);
        map.put("currentRound", currentRound);

        Map<String, Object> scores = new LinkedHashMap<>();
        scores.put("assessment", assessment);
        scores.put("technical", technical);
        scores.put("hr", hr);
        map.put("scores", scores);

        map.put("status", status);
        map.put("remarks", remarks);
        return map;
    }
}

