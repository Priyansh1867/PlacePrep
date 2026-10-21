package com.placeprep.dto.opportunity;

import com.placeprep.model.PlacementDrive;

import java.util.List;

public record OffCampusOpportunityDto(
        String driveId,
        String companyName,
        String role,
        String ctc,
        String deadline,
        String driveDate,
        String driveTime,
        List<String> locations,
        String venue,
        String registrationLink,
        String instructions,
        boolean verifiedBadge
) {
    public static OffCampusOpportunityDto from(PlacementDrive drive) {
        return new OffCampusOpportunityDto(
                drive.getDriveId(),
                drive.getCompanyName(),
                drive.getRole(),
                drive.getCtc(),
                drive.getDeadline(),
                drive.getDriveDate(),
                drive.getDriveTime(),
                List.copyOf(drive.getLocations()),
                drive.getVenue(),
                drive.getRegistrationLink(),
                drive.getInstructions(),
                drive.isVerifiedBadge()
        );
    }
}
