package com.placeprep.service;

import com.placeprep.model.Hackathon;
import com.placeprep.model.Internship;
import com.placeprep.model.OffCampusJob;
import com.placeprep.model.User;
import com.placeprep.repository.HackathonRepository;
import com.placeprep.repository.InternshipRepository;
import com.placeprep.repository.OffCampusJobRepository;
import com.placeprep.repository.PlacementDriveRepository;
import com.placeprep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    private OffCampusJobRepository offCampusJobRepository;

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

    public Hackathon updateHackathon(Long id, Hackathon updates) {
        Hackathon existing = hackathonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hackathon not found with id: " + id));
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getOrganizer() != null) existing.setOrganizer(updates.getOrganizer());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getProblemStatement() != null) existing.setProblemStatement(updates.getProblemStatement());
        if (updates.getRegistrationStartDate() != null) existing.setRegistrationStartDate(updates.getRegistrationStartDate());
        if (updates.getRegistrationDeadline() != null) existing.setRegistrationDeadline(updates.getRegistrationDeadline());
        if (updates.getEventDate() != null) existing.setEventDate(updates.getEventDate());
        if (updates.getTeamSize() != null) existing.setTeamSize(updates.getTeamSize());
        if (updates.getParticipationRules() != null) existing.setParticipationRules(updates.getParticipationRules());
        if (updates.getEligibilityCriteria() != null) existing.setEligibilityCriteria(updates.getEligibilityCriteria());
        if (updates.getPrizePool() != null) existing.setPrizePool(updates.getPrizePool());
        if (updates.getRewards() != null) existing.setRewards(updates.getRewards());
        if (updates.getRegistrationUrl() != null) existing.setRegistrationUrl(updates.getRegistrationUrl());
        if (updates.getTags() != null) existing.setTags(updates.getTags());
        if (updates.getDomains() != null) existing.setDomains(updates.getDomains());
        if (updates.getMode() != null) existing.setMode(updates.getMode());
        if (updates.getFormat() != null) existing.setFormat(updates.getFormat());
        if (updates.getBannerUrl() != null) existing.setBannerUrl(updates.getBannerUrl());
        if (updates.getLogo() != null) existing.setLogo(updates.getLogo());
        if (updates.getSource() != null) existing.setSource(updates.getSource());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        existing.setPublished(updates.isPublished());
        return hackathonRepository.save(existing);
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

    public Internship updateInternship(Long id, Internship updates) {
        Internship existing = internshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found with id: " + id));
        if (updates.getCompanyName() != null) existing.setCompanyName(updates.getCompanyName());
        if (updates.getCompanyLogo() != null) existing.setCompanyLogo(updates.getCompanyLogo());
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getRole() != null) existing.setRole(updates.getRole());
        if (updates.getDomain() != null) existing.setDomain(updates.getDomain());
        if (updates.getStipend() != null) existing.setStipend(updates.getStipend());
        if (updates.getDuration() != null) existing.setDuration(updates.getDuration());
        if (updates.getLocation() != null) existing.setLocation(updates.getLocation());
        if (updates.getWorkMode() != null) existing.setWorkMode(updates.getWorkMode());
        if (updates.getDeadline() != null) existing.setDeadline(updates.getDeadline());
        if (updates.getPostedDate() != null) existing.setPostedDate(updates.getPostedDate());
        if (updates.getEligibleBatches() != null) existing.setEligibleBatches(updates.getEligibleBatches());
        if (updates.getEligibleBranches() != null) existing.setEligibleBranches(updates.getEligibleBranches());
        if (updates.getQualifications() != null) existing.setQualifications(updates.getQualifications());
        if (updates.getSkillsRequired() != null) existing.setSkillsRequired(updates.getSkillsRequired());
        if (updates.getExperienceRequired() != null) existing.setExperienceRequired(updates.getExperienceRequired());
        if (updates.getApplicationUrl() != null) existing.setApplicationUrl(updates.getApplicationUrl());
        if (updates.getSource() != null) existing.setSource(updates.getSource());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        existing.setPpoOpportunity(updates.isPpoOpportunity());
        existing.setPublished(updates.isPublished());
        return internshipRepository.save(existing);
    }

    public void deleteInternship(Long id) {
        internshipRepository.deleteById(id);
    }

    // --- OFF CAMPUS JOBS ---

    public List<OffCampusJob> getAllOffCampusJobs() {
        return offCampusJobRepository.findAllByOrderByApplicationDeadlineAsc();
    }

    public OffCampusJob createOffCampusJob(OffCampusJob job) {
        return offCampusJobRepository.save(job);
    }

    public OffCampusJob updateOffCampusJob(Long id, OffCampusJob updates) {
        OffCampusJob existing = offCampusJobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OffCampusJob not found with id: " + id));
        if (updates.getCompanyName() != null) existing.setCompanyName(updates.getCompanyName());
        if (updates.getCompanyLogo() != null) existing.setCompanyLogo(updates.getCompanyLogo());
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getRole() != null) existing.setRole(updates.getRole());
        if (updates.getDomain() != null) existing.setDomain(updates.getDomain());
        if (updates.getCtc() != null) existing.setCtc(updates.getCtc());
        if (updates.getSalaryRange() != null) existing.setSalaryRange(updates.getSalaryRange());
        if (updates.getLocation() != null) existing.setLocation(updates.getLocation());
        if (updates.getWorkMode() != null) existing.setWorkMode(updates.getWorkMode());
        if (updates.getEligibleBatches() != null) existing.setEligibleBatches(updates.getEligibleBatches());
        if (updates.getEligibleBranches() != null) existing.setEligibleBranches(updates.getEligibleBranches());
        if (updates.getQualifications() != null) existing.setQualifications(updates.getQualifications());
        if (updates.getSkillsRequired() != null) existing.setSkillsRequired(updates.getSkillsRequired());
        if (updates.getMinExperience() != null) existing.setMinExperience(updates.getMinExperience());
        if (updates.getMaxExperience() != null) existing.setMaxExperience(updates.getMaxExperience());
        if (updates.getExperienceLevel() != null) existing.setExperienceLevel(updates.getExperienceLevel());
        if (updates.getApplicationDeadline() != null) existing.setApplicationDeadline(updates.getApplicationDeadline());
        if (updates.getPostedDate() != null) existing.setPostedDate(updates.getPostedDate());
        if (updates.getApplicationUrl() != null) existing.setApplicationUrl(updates.getApplicationUrl());
        if (updates.getSource() != null) existing.setSource(updates.getSource());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        existing.setPublished(updates.isPublished());
        return offCampusJobRepository.save(existing);
    }

    public void deleteOffCampusJob(Long id) {
        offCampusJobRepository.deleteById(id);
    }

    // --- OFF CAMPUS OPPORTUNITIES WITH BATCH ACCESS METADATA ---

    public Map<String, Object> getOffCampusOpportunitiesForStudent(String studentEmailOrId) {
        Map<String, Object> response = new HashMap<>();

        String batch = null;
        if (studentEmailOrId != null && !studentEmailOrId.trim().isEmpty()) {
            Optional<User> userOpt = userRepository.findByEmail(studentEmailOrId.trim().toLowerCase());
            if (userOpt.isPresent()) {
                batch = userOpt.get().getGraduationBatch();
            }
        }

        boolean isFinalYear = FINAL_YEAR_BATCH.equalsIgnoreCase(batch);
        response.put("studentIdentifier", studentEmailOrId);
        response.put("detectedBatch", batch);
        response.put("finalYearBatchRequirement", FINAL_YEAR_BATCH);
        response.put("isFinalYearEligible", isFinalYear);

        List<OffCampusJob> jobs = offCampusJobRepository.findAllByOrderByApplicationDeadlineAsc();

        response.put("status", "ACCESS_GRANTED");
        response.put("message", isFinalYear ? "Off-campus verified drives unlocked." : "Viewing off-campus drives in advisory mode.");
        response.put("opportunities", jobs);
        return response;
    }
}
