package com.placeprep.service;

import com.placeprep.model.InstituteLocation;
import com.placeprep.model.LocationUpdateHistory;
import com.placeprep.repository.InstituteLocationRepository;
import com.placeprep.repository.LocationUpdateHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InstituteLocationService {

    private static final int FIXED_GEOFENCE_RADIUS_METERS = 100;

    @Autowired
    private InstituteLocationRepository locationRepository;

    @Autowired
    private LocationUpdateHistoryRepository historyRepository;

    public Optional<InstituteLocation> getCurrentLocation() {
        Optional<InstituteLocation> opt = locationRepository.findTopByOrderByUpdatedAtDesc();
        if (opt.isPresent()) {
            return opt;
        }
        // Fallback default DTU Campus center so that 100m geofencing is always fully operational
        InstituteLocation defaultLoc = new InstituteLocation();
        defaultLoc.setId(1L);
        defaultLoc.setInstituteName("Delhi Technological University (DTU) Campus");
        defaultLoc.setInstituteAddress("Shahbad Daulatpur, Main Bawana Road");
        defaultLoc.setCity("Delhi");
        defaultLoc.setState("Delhi");
        defaultLoc.setLatitude(28.7495);
        defaultLoc.setLongitude(77.1170);
        defaultLoc.setGeofenceRadiusMeters(100);
        defaultLoc.setLocationStatus("ACTIVE");
        return Optional.of(defaultLoc);
    }

    public InstituteLocation saveOrUpdateLocation(
            String instituteName,
            String instituteAddress,
            String city,
            String state,
            Double latitude,
            Double longitude,
            String updatedByEmail,
            Long updatedByUserId
    ) {
        validateCoordinates(latitude, longitude);

        Optional<InstituteLocation> existingOpt = locationRepository.findTopByOrderByUpdatedAtDesc();

        InstituteLocation location;
        LocationUpdateHistory history = new LocationUpdateHistory();

        if (existingOpt.isPresent()) {
            location = existingOpt.get();
            history.setInstituteLocationId(location.getId());
            history.setPreviousLatitude(location.getLatitude());
            history.setPreviousLongitude(location.getLongitude());
        } else {
            location = new InstituteLocation();
            history.setPreviousLatitude(null);
            history.setPreviousLongitude(null);
        }

        location.setInstituteName(instituteName);
        location.setInstituteAddress(instituteAddress);
        location.setCity(city);
        location.setState(state);
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        location.setGeofenceRadiusMeters(FIXED_GEOFENCE_RADIUS_METERS); // Always enforce 100 meters
        location.setLocationStatus("ACTIVE");
        location.setUpdatedByEmail(updatedByEmail);
        location.setUpdatedByUserId(updatedByUserId);

        InstituteLocation savedLocation = locationRepository.save(location);

        history.setInstituteLocationId(savedLocation.getId());
        history.setNewLatitude(latitude);
        history.setNewLongitude(longitude);
        history.setUpdatedByEmail(updatedByEmail);
        history.setUpdatedByUserId(updatedByUserId);
        historyRepository.save(history);

        return savedLocation;
    }

    public List<LocationUpdateHistory> getLocationHistory() {
        return historyRepository.findAllByOrderByUpdatedAtDesc();
    }

    /**
     * Calculates distance between two points using the Haversine formula.
     * Returns distance in meters.
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0; // Earth radius in meters
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Checks if a student's location is within the fixed 100-meter geofence.
     * Server-side calculation only. Never trusts client distance.
     */
    public boolean isWithinGeofence(double studentLat, double studentLon, double instituteLat, double instituteLon) {
        double distance = calculateDistance(studentLat, studentLon, instituteLat, instituteLon);
        return distance <= FIXED_GEOFENCE_RADIUS_METERS;
    }

    public int getFixedGeofenceRadius() {
        return FIXED_GEOFENCE_RADIUS_METERS;
    }

    private void validateCoordinates(double latitude, double longitude) {
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90. Got: " + latitude);
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180. Got: " + longitude);
        }
    }
}
