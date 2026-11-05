package com.placeprep.controller;

import com.placeprep.model.Hackathon;
import com.placeprep.model.Internship;
import com.placeprep.model.OffCampusJob;
import com.placeprep.service.OpportunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/opportunities")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class OpportunityController {

    @Autowired
    private OpportunityService opportunityService;

    // --- HACKATHONS ---

    @GetMapping("/hackathons")
    public ResponseEntity<List<Hackathon>> getHackathons() {
        return ResponseEntity.ok(opportunityService.getAllHackathons());
    }

    @PostMapping("/hackathons")
    public ResponseEntity<?> createHackathon(@RequestBody Hackathon hackathon) {
        try {
            Hackathon created = opportunityService.createHackathon(hackathon);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/hackathons/{id}")
    public ResponseEntity<?> updateHackathon(@PathVariable Long id, @RequestBody Hackathon updates) {
        try {
            Hackathon updated = opportunityService.updateHackathon(id, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/hackathons/{id}")
    public ResponseEntity<?> deleteHackathon(@PathVariable Long id) {
        try {
            opportunityService.deleteHackathon(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Hackathon deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // --- INTERNSHIPS ---

    @GetMapping("/internships")
    public ResponseEntity<List<Internship>> getInternships(@RequestParam(required = false) String batch) {
        return ResponseEntity.ok(opportunityService.getAllInternships(batch));
    }

    @PostMapping("/internships")
    public ResponseEntity<?> createInternship(@RequestBody Internship internship) {
        try {
            Internship created = opportunityService.createInternship(internship);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/internships/{id}")
    public ResponseEntity<?> updateInternship(@PathVariable Long id, @RequestBody Internship updates) {
        try {
            Internship updated = opportunityService.updateInternship(id, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/internships/{id}")
    public ResponseEntity<?> deleteInternship(@PathVariable Long id) {
        try {
            opportunityService.deleteInternship(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Internship deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // --- OFF-CAMPUS DRIVES & JOBS ---

    @GetMapping("/off-campus")
    public ResponseEntity<Map<String, Object>> getOffCampusOpportunities(
            @RequestParam(required = false) String studentEmailOrId
    ) {
        Map<String, Object> response = opportunityService.getOffCampusOpportunitiesForStudent(studentEmailOrId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/off-campus/jobs")
    public ResponseEntity<List<OffCampusJob>> getAllOffCampusJobs() {
        return ResponseEntity.ok(opportunityService.getAllOffCampusJobs());
    }

    @PostMapping("/off-campus")
    public ResponseEntity<?> createOffCampusJob(@RequestBody OffCampusJob job) {
        try {
            OffCampusJob created = opportunityService.createOffCampusJob(job);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/off-campus/{id}")
    public ResponseEntity<?> updateOffCampusJob(@PathVariable Long id, @RequestBody OffCampusJob updates) {
        try {
            OffCampusJob updated = opportunityService.updateOffCampusJob(id, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/off-campus/{id}")
    public ResponseEntity<?> deleteOffCampusJob(@PathVariable Long id) {
        try {
            opportunityService.deleteOffCampusJob(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Off-campus job deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
