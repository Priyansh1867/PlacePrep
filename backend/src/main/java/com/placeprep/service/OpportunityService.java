package com.placeprep.service;

import com.placeprep.model.Hackathon;
import com.placeprep.model.Internship;
import com.placeprep.model.User;
import com.placeprep.dto.opportunity.OffCampusOpportunityDto;
import com.placeprep.repository.HackathonRepository;
import com.placeprep.repository.InternshipRepository;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OpportunityService {

    // Current final-year graduating batch for 2026 academic calendar
    public static final String FINAL_YEAR_BATCH = "2026";

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private UserRepository userRepository;

    // --- HACKATHONS ---

    public List<Hackathon> getAllHackathons() {
        return hackathonRepository.findAllByOrderByEventDateAsc();
    }

    public Hackathon createHackathon(Hackathon hackathon) {
        return hackathonRepository.save(hackathon);
    }

    public void deleteHackathon(Long id) {
        hackathonRepository.deleteById(id);
    }

    // --- INTERNSHIPS ---

    public List<Internship> getAllInternships(String batch) {
        List<Internship> all = internshipRepository.findAllByOrderByDeadlineAsc();
        if (batch == null || batch.trim().isEmpty()) {
            return all;
        }
        return all.stream()
                .filter(i -> i.getEligibleBatches() == null || i.getEligibleBatches().contains(batch))
                .toList();
    }

    public Internship createInternship(Internship internship) {
        return internshipRepository.save(internship);
    }

    public void deleteInternship(Long id) {
        internshipRepository.deleteById(id);
    }

    // --- OFF CAMPUS OPPORTUNITIES (STRICTLY GATED FOR FINAL YEAR STUDENTS) ---

    @Transactional(readOnly = true)
    public Map<String, Object> getOffCampusOpportunitiesForStudent(String studentEmailOrId) {
        Map<String, Object> response = new HashMap<>();

        String batch = null;
        if (studentEmailOrId != null && !studentEmailOrId.trim().isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(studentEmailOrId.trim().toLowerCase());
            if (userOpt.isPresent()) {
                batch = userOpt.get().getGraduationBatch();
            } else {
                try {
                    Long userId = Long.parseLong(studentEmailOrId.trim());
                    userOpt = userRepository.findById(userId);
                    if (userOpt.isPresent()) {
                        batch = userOpt.get().getGraduationBatch();
                    }
                } catch (NumberFormatException ignored) {}
            }
        }

        boolean isFinalYear = FINAL_YEAR_BATCH.equalsIgnoreCase(batch);
        response.put("studentIdentifier", studentEmailOrId);
        response.put("detectedBatch", batch);
        response.put("finalYearBatchRequirement", FINAL_YEAR_BATCH);
        response.put("isFinalYearEligible", isFinalYear);

        if (!isFinalYear) {
            response.put("status", "ACCESS_RESTRICTED");
            response.put("message", "Off-campus opportunities are exclusively unlocked for final-year students (Batch " + FINAL_YEAR_BATCH + "). Focus on CRT and campus drives!");
            response.put("opportunities", Collections.emptyList());
            return response;
        }

        List<OffCampusOpportunityDto> offCampusDrives = driveRepository.findAll().stream()
                .filter(d -> d.isOffCampus() || "OFF_CAMPUS".equalsIgnoreCase(d.getDriveType()))
                .map(OffCampusOpportunityDto::from)
                .toList();

        response.put("status", "ACCESS_GRANTED");
        response.put("message", "Off-campus drives unlocked for final-year students.");
        response.put("opportunities", offCampusDrives);
        return response;
    }
}
