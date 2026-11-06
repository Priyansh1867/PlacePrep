package com.placeprep.controller;

import com.placeprep.model.LiveSession;
import com.placeprep.service.LiveSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/live-sessions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LiveSessionController {

    @Autowired
    private LiveSessionService liveSessionService;

    @GetMapping
    public ResponseEntity<List<LiveSession>> getAllSessions(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String studentEmail
    ) {
        return ResponseEntity.ok(liveSessionService.getSessionsForRole(role, studentEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable String id) {
        LiveSession session = liveSessionService.getBySessionId(id);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Live session not found for id: " + id));
        }
        return ResponseEntity.ok(session);
    }

    @GetMapping("/preview-eligibility")
    public ResponseEntity<?> previewEligibility(@RequestParam String driveId) {
        try {
            Map<String, Object> preview = liveSessionService.previewEligibility(driveId);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRECTOR', 'ADMIN', 'TPO')")
    public ResponseEntity<?> createAndPublishSession(@RequestBody LiveSession session, Principal principal) {
        try {
            String actorName = principal != null ? principal.getName() : "Director (Dr. Vikramaditya Sen)";
            LiveSession created = liveSessionService.createAndPublish(session, actorName);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("session", created);
            response.put("message", String.format("Live session published successfully! Notifications sent to %d eligible students.",
                    created.getNotifiedCount()));
            response.put("eligibleCount", created.getEligibleStudentsCount());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error creating live session: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'ADMIN', 'TPO')")
    public ResponseEntity<?> updateSession(@PathVariable String id, @RequestBody LiveSession updates, Principal principal) {
        try {
            String actorName = principal != null ? principal.getName() : "Director";
            LiveSession updated = liveSessionService.updateSession(id, updates, actorName);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'ADMIN', 'TPO')")
    public ResponseEntity<?> rescheduleSession(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            Principal principal
    ) {
        try {
            String newDate = payload.get("newDate");
            String newStartTime = payload.get("newStartTime");
            String newEndTime = payload.get("newEndTime");
            String reason = payload.get("reason");

            if (newDate == null || newStartTime == null || newEndTime == null) {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "newDate, newStartTime, and newEndTime are required."));
            }

            String actorName = principal != null ? principal.getName() : "Director";
            LiveSession updated = liveSessionService.rescheduleSession(id, newDate, newStartTime, newEndTime, reason, actorName);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("session", updated);
            response.put("message", String.format("Session successfully rescheduled to %s (%s). Updated notifications dispatched to %d candidates.",
                    updated.getDate(), updated.getTime(), updated.getNotifiedCount()));

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'ADMIN', 'TPO')")
    public ResponseEntity<?> cancelSession(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            Principal principal
    ) {
        try {
            String reason = payload != null ? payload.get("reason") : "Recruiter unavailable";
            String actorName = principal != null ? principal.getName() : "Director";
            LiveSession updated = liveSessionService.cancelSession(id, reason, actorName);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("session", updated);
            response.put("message", "Live session cancelled. Cancellation alerts sent to eligible students.");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/rsvp")
    public ResponseEntity<?> rsvpSession(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String studentEmail = payload != null ? payload.get("email") : null;
            LiveSession updated = liveSessionService.rsvp(id, studentEmail);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
