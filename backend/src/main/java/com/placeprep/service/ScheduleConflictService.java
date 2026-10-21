package com.placeprep.service;

import com.placeprep.model.PlacementDrive;
import com.placeprep.model.StudentApplication;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.StudentApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ScheduleConflictService {

    @Autowired
    private StudentApplicationRepository applicationRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    public ScheduleConflictService() {
    }

    public ScheduleConflictService(StudentApplicationRepository applicationRepository,
                                  PlacementDriveRepository driveRepository) {
        this.applicationRepository = applicationRepository;
        this.driveRepository = driveRepository;
    }

    /**
     * Checks whether an interview slot clashing exists for a student on a specific date and time.
     */
    public Map<String, Object> checkStudentInterviewConflict(
            String studentId,
            String targetCompanyId,
            String targetDriveId,
            String targetRound,
            String targetDate,
            String targetStartTime,
            String targetEndTime
    ) {
        Map<String, Object> report = new HashMap<>();
        List<Map<String, Object>> detectedConflicts = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        if (studentId == null || targetDate == null) {
            report.put("hasConflict", false);
            report.put("conflicts", detectedConflicts);
            return report;
        }

        List<StudentApplication> apps = applicationRepository.findByStudentId(studentId);

        int targetStartMin = parseTimeToMinutes(targetStartTime, 9 * 60);
        int targetEndMin = parseTimeToMinutes(targetEndTime, targetStartMin + 60);

        for (StudentApplication app : apps) {
            // Skip the current application if it's the same drive
            if (targetDriveId != null && targetDriveId.equalsIgnoreCase(app.getDriveId())) {
                continue;
            }

            // Check if application has scheduled slot on the same date
            if (app.getScheduledDate() != null && app.getScheduledDate().equalsIgnoreCase(targetDate.trim())) {
                int existingStartMin = parseTimeToMinutes(app.getScheduledTime(), 10 * 60);
                int existingEndMin = parseTimeToMinutes(app.getScheduledEndTime(), existingStartMin + 60);

                // Overlap condition: max(start1, start2) < min(end1, end2)
                boolean directOverlap = Math.max(targetStartMin, existingStartMin) < Math.min(targetEndMin, existingEndMin);

                // Buffer clash: within 30 minutes
                boolean bufferClash = !directOverlap && Math.abs(targetStartMin - existingEndMin) < 30;

                if (directOverlap || bufferClash) {
                    Map<String, Object> conflict = new HashMap<>();
                    conflict.put("conflictingCompany", app.getCompanyName());
                    conflict.put("conflictingRole", app.getRole());
                    conflict.put("conflictingRound", app.getCurrentRound());
                    conflict.put("conflictingDate", app.getScheduledDate());
                    conflict.put("conflictingTime", (app.getScheduledTime() != null ? app.getScheduledTime() : "TBD")
                            + " - " + (app.getScheduledEndTime() != null ? app.getScheduledEndTime() : "TBD"));
                    conflict.put("venue", app.getVenue());
                    conflict.put("type", directOverlap ? "DIRECT_OVERLAP" : "TIGHT_BUFFER_WARNING");
                    conflict.put("severity", directOverlap ? "CRITICAL" : "MODERATE");
                    conflict.put("description", directOverlap
                            ? String.format("Direct time collision with %s %s (%s). You cannot attend both interviews simultaneously.",
                            app.getCompanyName(), app.getCurrentRound(), app.getScheduledTime())
                            : String.format("Insufficient travel/preparation buffer between %s and %s (less than 30 mins).",
                            app.getCompanyName(), targetCompanyId));

                    detectedConflicts.add(conflict);
                }
            }
        }

        boolean hasConflict = !detectedConflicts.isEmpty();
        report.put("hasConflict", hasConflict);
        report.put("conflictCount", detectedConflicts.size());
        report.put("conflicts", detectedConflicts);

        if (hasConflict) {
            recommendations.add("Request alternative interview slot via Placement Coordinator.");
            recommendations.add("Prioritize higher-tier company interview and submit slot postponement request.");
            recommendations.add("Notify company HR panel about overlapping campus drive round.");
        } else {
            recommendations.add("Schedule is clear with no detected conflicts.");
        }
        report.put("recommendations", recommendations);

        return report;
    }

    /**
     * Checks drive-level conflicts across upcoming placement drives on campus.
     */
    public List<Map<String, Object>> checkDriveLevelConflicts() {
        List<PlacementDrive> drives = driveRepository.findAll();
        List<Map<String, Object>> conflicts = new ArrayList<>();

        for (int i = 0; i < drives.size(); i++) {
            PlacementDrive d1 = drives.get(i);
            if (d1.getDriveDate() == null) continue;

            for (int j = i + 1; j < drives.size(); j++) {
                PlacementDrive d2 = drives.get(j);
                if (d2.getDriveDate() == null) continue;

                if (d1.getDriveDate().trim().equalsIgnoreCase(d2.getDriveDate().trim())) {
                    // Check if they share eligible batches
                    boolean sharesBatch = false;
                    for (String b : d1.getEligibleBatches()) {
                        if (d2.getEligibleBatches().contains(b)) {
                            sharesBatch = true;
                            break;
                        }
                    }

                    if (sharesBatch) {
                        Map<String, Object> clash = new HashMap<>();
                        clash.put("driveId1", d1.getDriveId());
                        clash.put("company1", d1.getCompanyName());
                        clash.put("role1", d1.getRole());
                        clash.put("driveId2", d2.getDriveId());
                        clash.put("company2", d2.getCompanyName());
                        clash.put("role2", d2.getRole());
                        clash.put("date", d1.getDriveDate());
                        clash.put("venue1", d1.getVenue() != null ? d1.getVenue() : "TBD");
                        clash.put("venue2", d2.getVenue() != null ? d2.getVenue() : "TBD");
                        clash.put("severity", "HIGH");
                        clash.put("message", String.format(
                                "Recruitment drive collision on %s between %s and %s for overlapping student batches. Venues and rounds need de-conflicting.",
                                d1.getDriveDate(), d1.getCompanyName(), d2.getCompanyName()));
                        conflicts.add(clash);
                    }
                }
            }
        }

        return conflicts;
    }

    private int parseTimeToMinutes(String timeStr, int defaultVal) {
        if (timeStr == null || timeStr.trim().isEmpty()) return defaultVal;
        try {
            String clean = timeStr.trim().toUpperCase();
            boolean isPm = clean.contains("PM");
            boolean isAm = clean.contains("AM");
            clean = clean.replace("AM", "").replace("PM", "").trim();

            String[] parts = clean.split(":");
            int hours = Integer.parseInt(parts[0].trim());
            int mins = parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 0;

            if (isPm && hours < 12) hours += 12;
            if (isAm && hours == 12) hours = 0;

            return hours * 60 + mins;
        } catch (Exception e) {
            return defaultVal;
        }
    }
}
