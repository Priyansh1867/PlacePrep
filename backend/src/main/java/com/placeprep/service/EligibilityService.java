package com.placeprep.service;

import com.placeprep.model.PlacementDrive;
import com.placeprep.model.User;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EligibilityService {

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentAcademicRecordService academicRecordService;

    public EligibilityService() {
    }

    public EligibilityService(PlacementDriveRepository driveRepository, UserRepository userRepository) {
        this.driveRepository = driveRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> evaluateEligibility(
            Double studentCgpa,
            Double studentTenth,
            Double studentTwelfth,
            Integer activeBacklogs,
            String studentBranch,
            String studentBatch,
            PlacementDrive drive
    ) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> checks = new ArrayList<>();
        List<String> failureReasons = new ArrayList<>();

        boolean overallEligible = true;

        // 1. CGPA Check
        Double minCgpa = drive.getMinCgpa() != null ? drive.getMinCgpa() : 6.0;
        boolean cgpaPassed = studentCgpa != null && studentCgpa >= minCgpa;
        if (!cgpaPassed) {
            overallEligible = false;
            failureReasons.add(String.format("CGPA %.2f is below the required cutoff of %.2f",
                    studentCgpa != null ? studentCgpa : 0.0, minCgpa));
        }
        Map<String, Object> cgpaCheck = new HashMap<>();
        cgpaCheck.put("criteria", "Undergraduate CGPA");
        cgpaCheck.put("studentValue", studentCgpa != null ? studentCgpa : 0.0);
        cgpaCheck.put("requiredValue", String.format(">= %.1f CGPA", minCgpa));
        cgpaCheck.put("passed", cgpaPassed);
        checks.add(cgpaCheck);

        // 2. 10th Percentage Check
        Double minTenth = drive.getMinTenthPercentage() != null ? drive.getMinTenthPercentage() : 60.0;
        boolean tenthPassed = studentTenth == null || studentTenth >= minTenth;
        if (!tenthPassed) {
            overallEligible = false;
            failureReasons.add(String.format("10th percentage %.1f%% is below the required %.1f%%",
                    studentTenth, minTenth));
        }
        Map<String, Object> tenthCheck = new HashMap<>();
        tenthCheck.put("criteria", "Class 10th Marks");
        tenthCheck.put("studentValue", studentTenth != null ? studentTenth + "%" : "Not Provided");
        tenthCheck.put("requiredValue", String.format(">= %.1f%%", minTenth));
        tenthCheck.put("passed", tenthPassed);
        checks.add(tenthCheck);

        // 3. 12th Percentage Check
        Double minTwelfth = drive.getMinTwelfthPercentage() != null ? drive.getMinTwelfthPercentage() : 60.0;
        boolean twelfthPassed = studentTwelfth == null || studentTwelfth >= minTwelfth;
        if (!twelfthPassed) {
            overallEligible = false;
            failureReasons.add(String.format("12th percentage %.1f%% is below the required %.1f%%",
                    studentTwelfth, minTwelfth));
        }
        Map<String, Object> twelfthCheck = new HashMap<>();
        twelfthCheck.put("criteria", "Class 12th / Diploma Marks");
        twelfthCheck.put("studentValue", studentTwelfth != null ? studentTwelfth + "%" : "Not Provided");
        twelfthCheck.put("requiredValue", String.format(">= %.1f%%", minTwelfth));
        twelfthCheck.put("passed", twelfthPassed);
        checks.add(twelfthCheck);

        // 4. Backlogs Check
        Integer maxBacklogs = drive.getMaxBacklogs() != null ? drive.getMaxBacklogs() : 0;
        int currentBacklogs = activeBacklogs != null ? activeBacklogs : 0;
        boolean backlogsPassed = currentBacklogs <= maxBacklogs;
        if (!backlogsPassed) {
            overallEligible = false;
            failureReasons.add(String.format("Active backlogs count (%d) exceeds permitted limit of %d",
                    currentBacklogs, maxBacklogs));
        }
        Map<String, Object> backlogsCheck = new HashMap<>();
        backlogsCheck.put("criteria", "Active Standing Backlogs");
        backlogsCheck.put("studentValue", currentBacklogs);
        backlogsCheck.put("requiredValue", String.format("Max %d backlog(s)", maxBacklogs));
        backlogsCheck.put("passed", backlogsPassed);
        checks.add(backlogsCheck);

        // 5. Eligible Batches Check
        List<String> batches = drive.getEligibleBatches();
        boolean batchPassed = batches == null || batches.isEmpty() ||
                (studentBatch != null && batches.contains(studentBatch.trim()));
        if (!batchPassed) {
            overallEligible = false;
            failureReasons.add(String.format("Graduation batch '%s' is not in eligible batches: %s",
                    studentBatch, batches));
        }
        Map<String, Object> batchCheck = new HashMap<>();
        batchCheck.put("criteria", "Graduation Batch");
        batchCheck.put("studentValue", studentBatch != null ? studentBatch : "Unspecified");
        batchCheck.put("requiredValue", batches != null && !batches.isEmpty() ? String.join(", ", batches) : "All Batches");
        batchCheck.put("passed", batchPassed);
        checks.add(batchCheck);

        // 6. Allowed Branches Check
        List<String> branches = drive.getAllowedBranches();
        boolean branchPassed = branches == null || branches.isEmpty();
        if (!branchPassed && studentBranch != null) {
            for (String allowed : branches) {
                if (studentBranch.toLowerCase().contains(allowed.toLowerCase()) ||
                    allowed.toLowerCase().contains(studentBranch.toLowerCase())) {
                    branchPassed = true;
                    break;
                }
            }
        }
        if (!branchPassed) {
            overallEligible = false;
            failureReasons.add(String.format("Branch '%s' is not listed in permitted streams: %s",
                    studentBranch, branches));
        }
        Map<String, Object> branchCheck = new HashMap<>();
        branchCheck.put("criteria", "Academic Stream / Branch");
        branchCheck.put("studentValue", studentBranch != null ? studentBranch : "Unspecified");
        branchCheck.put("requiredValue", branches != null && !branches.isEmpty() ? String.join(", ", branches) : "All Engineering Branches");
        branchCheck.put("passed", branchPassed);
        checks.add(branchCheck);

        response.put("isEligible", overallEligible);
        response.put("status", overallEligible ? "ELIGIBLE" : "INELIGIBLE");
        response.put("driveId", drive.getDriveId());
        response.put("companyName", drive.getCompanyName());
        response.put("role", drive.getRole());
        response.put("checks", checks);
        response.put("failureReasons", failureReasons);
        response.put("summary", overallEligible
                ? "Candidate satisfies all academic, batch, branch, and backlog criteria for this recruitment drive."
                : "Eligibility verification failed: " + String.join("; ", failureReasons));

        return response;
    }

    public Map<String, Object> checkDriveForStudent(String driveId, String studentEmailOrId) {
        PlacementDrive drive = null;
        List<PlacementDrive> all = driveRepository.findAll();
        for (PlacementDrive d : all) {
            if (d.getDriveId().equalsIgnoreCase(driveId)) {
                drive = d;
                break;
            }
        }
        if (drive == null) {
            throw new IllegalArgumentException("Placement Drive not found: " + driveId);
        }

        Optional<User> userOpt = userRepository.findByEmail(studentEmailOrId);

        Double cgpa = null;
        Double tenth = null;
        Double twelfth = null;
        Integer backlogs = null;
        String branch = null;
        String batch = null;

        Optional<com.placeprep.model.StudentAcademicRecord> verified =
                academicRecordService.findForStudent(studentEmailOrId);
        if (verified.isPresent() && verified.get().isVerified()) {
            com.placeprep.model.StudentAcademicRecord r = verified.get();
            cgpa = r.getCgpa();
            tenth = r.getTenthPercentage();
            twelfth = r.effectiveTwelfthOrDiploma();
            backlogs = r.getActiveBacklogs();
            branch = r.getBranch();
            batch = r.getGraduationBatch();
        } else if (userOpt.isPresent()) {
            User u = userOpt.get();
            cgpa = u.getCgpa();
            tenth = u.getTenthPercentage();
            twelfth = u.getTwelfthPercentage();
            backlogs = u.getActiveBacklogs();
            branch = u.getBranch();
            batch = u.getGraduationBatch();
        }

        if (cgpa == null) cgpa = 0.0;
        if (backlogs == null) backlogs = 0;

        return evaluateEligibility(cgpa, tenth, twelfth, backlogs, branch, batch, drive);
    }
}
