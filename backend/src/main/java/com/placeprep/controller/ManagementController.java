package com.placeprep.controller;

import com.placeprep.model.InstituteLocation;
import com.placeprep.model.LocationUpdateHistory;
import com.placeprep.service.InstituteLocationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/management")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ManagementController {

    @Autowired
    private InstituteLocationService locationService;

    /**
     * GET /api/management/institute/location
     * Returns current institute location.
     */
    @GetMapping("/institute/location")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<?> getCurrentLocation() {
        Optional<InstituteLocation> location = locationService.getCurrentLocation();
        if (location.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("exists", false);
            response.put("message", "No institute location configured yet.");
            response.put("geofenceRadiusMeters", 100);
            return ResponseEntity.ok(response);
        }
        Map<String, Object> response = new HashMap<>();
        InstituteLocation loc = location.get();
        response.put("exists", true);
        response.put("id", loc.getId());
        response.put("instituteName", loc.getInstituteName());
        response.put("instituteAddress", loc.getInstituteAddress());
        response.put("city", loc.getCity());
        response.put("state", loc.getState());
        response.put("latitude", loc.getLatitude());
        response.put("longitude", loc.getLongitude());
        response.put("geofenceRadiusMeters", 100); // Fixed at 100m
        response.put("locationStatus", loc.getLocationStatus());
        response.put("updatedAt", loc.getUpdatedAt() != null ? loc.getUpdatedAt().toString() : null);
        response.put("updatedBy", loc.getUpdatedByEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/management/institute/location
     * Sets or updates institute location.
     */
    @PutMapping("/institute/location")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<?> updateLocation(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String updatedByEmail = (String) request.getAttribute("currentUserEmail");
        if (updatedByEmail == null) {
            updatedByEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "management@placeprep.com";
        }
        Long updatedByUserId = null;
        Object userIdAttr = request.getAttribute("currentUserId");
        if (userIdAttr instanceof Long) {
            updatedByUserId = (Long) userIdAttr;
        } else if (userIdAttr instanceof Integer) {
            updatedByUserId = ((Integer) userIdAttr).longValue();
        }

        if (body.get("latitude") == null || body.get("longitude") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Latitude and longitude are required."));
        }

        double latitude;
        double longitude;
        try {
            latitude = Double.parseDouble(body.get("latitude").toString());
            longitude = Double.parseDouble(body.get("longitude").toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Latitude and longitude must be valid numbers."));
        }

        if (latitude < -90 || latitude > 90) {
            return ResponseEntity.badRequest().body(Map.of("error", "Latitude must be between -90 and 90."));
        }
        if (longitude < -180 || longitude > 180) {
            return ResponseEntity.badRequest().body(Map.of("error", "Longitude must be between -180 and 180."));
        }

        String instituteName = body.getOrDefault("instituteName", "").toString();
        String instituteAddress = body.getOrDefault("instituteAddress", "").toString();
        String city = body.getOrDefault("city", "").toString();
        String state = body.getOrDefault("state", "").toString();

        if (instituteName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Institute name is required."));
        }

        try {
            InstituteLocation saved = locationService.saveOrUpdateLocation(
                    instituteName, instituteAddress, city, state,
                    latitude, longitude, updatedByEmail, updatedByUserId
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Institute location updated successfully. The attendance geofence is now centered on the updated location.");
            response.put("id", saved.getId());
            response.put("instituteName", saved.getInstituteName());
            response.put("latitude", saved.getLatitude());
            response.put("longitude", saved.getLongitude());
            response.put("geofenceRadiusMeters", 100);
            response.put("updatedAt", saved.getUpdatedAt() != null ? saved.getUpdatedAt().toString() : null);
            response.put("updatedBy", updatedByEmail);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/management/institute/location/history
     * Returns location update history audit trail.
     */
    @GetMapping("/institute/location/history")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<?> getLocationHistory() {
        List<LocationUpdateHistory> history = locationService.getLocationHistory();
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/management/institute/geofence
     * Returns geofence radius settings (fixed at 100 meters).
     */
    @GetMapping("/institute/geofence")
    @PreAuthorize("hasAnyRole('MANAGEMENT', 'ADMIN')")
    public ResponseEntity<?> getGeofenceInfo() {
        Map<String, Object> response = new HashMap<>();
        Optional<InstituteLocation> location = locationService.getCurrentLocation();
        response.put("geofenceRadiusMeters", 100);
        response.put("radiusFixed", true);
        response.put("description", "The geofence radius is fixed at exactly 100 meters. Management cannot change this value.");
        if (location.isPresent()) {
            response.put("centerLatitude", location.get().getLatitude());
            response.put("centerLongitude", location.get().getLongitude());
            response.put("locationConfigured", true);
        } else {
            response.put("locationConfigured", false);
            response.put("message", "No institute location configured. Please set the institute location first.");
        }
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/management/attendance/verify-location
     * Calculates distance from institute using Haversine formula on backend.
     * Enforces strictly: distance <= 100 meters.
     */
    @PostMapping("/attendance/verify-location")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> verifyStudentLocation(@RequestBody Map<String, Object> body) {
        if (body.get("latitude") == null || body.get("longitude") == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Student latitude and longitude are required.",
                    "withinGeofence", false
            ));
        }

        double studentLat;
        double studentLon;
        try {
            studentLat = Double.parseDouble(body.get("latitude").toString());
            studentLon = Double.parseDouble(body.get("longitude").toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid coordinate format.",
                    "withinGeofence", false
            ));
        }

        Optional<InstituteLocation> locationOpt = locationService.getCurrentLocation();
        if (locationOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "withinGeofence", false,
                    "message", "Institute location not configured yet. Please contact management.",
                    "distanceMeters", -1
            ));
        }

        InstituteLocation institute = locationOpt.get();
        double distance = locationService.calculateDistance(
                studentLat, studentLon,
                institute.getLatitude(), institute.getLongitude()
        );
        boolean withinGeofence = distance <= 100.0; // Strict: <= 100 meters, no rounding before check

        Map<String, Object> response = new HashMap<>();
        response.put("withinGeofence", withinGeofence);
        response.put("distanceMeters", Math.round(distance * 10.0) / 10.0);
        response.put("geofenceRadiusMeters", 100);
        response.put("instituteLatitude", institute.getLatitude());
        response.put("instituteLongitude", institute.getLongitude());
        response.put("message", withinGeofence
                ? "Location verified: You are within the 100m institute campus boundary."
                : String.format("Location verification failed: You are %.1fm away. Maximum allowed distance is 100m.", distance)
        );
        return ResponseEntity.ok(response);
    }
}
