package com.placeprep.controller;

import com.placeprep.dto.hod.FacultyBulkImportResponseDto;
import com.placeprep.dto.hod.FacultyRegistrationDto;
import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import com.placeprep.service.HodFacultyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/hod/faculty")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasAnyRole('HOD', 'ADMIN')")
@RequiredArgsConstructor
public class HodFacultyController {

    private final HodFacultyService hodFacultyService;
    private final UserRepository userRepository;

    private User resolveCaller(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new AccessDeniedException("Authentication required.");
        }
        String principal = auth.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByRollNumber(principal))
                .orElseThrow(() -> new AccessDeniedException("User account not found for authenticated principal: " + principal));
    }

    /**
     * POST /api/hod/faculty/register
     * Register a new faculty member within the HOD's own department.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerFaculty(
            @RequestBody FacultyRegistrationDto dto,
            Authentication auth
    ) {
        try {
            User caller = resolveCaller(auth);
            FacultyRegistrationDto registered = hodFacultyService.registerFaculty(dto, caller);
            return ResponseEntity.status(HttpStatus.CREATED).body(registered);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Faculty registration error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Faculty registration error: " + e.getMessage()));
        }
    }

    /**
     * POST /api/hod/faculty/bulk-import
     * Bulk import multiple faculty members for the HOD's department.
     */
    @PostMapping("/bulk-import")
    public ResponseEntity<?> bulkImportFaculty(
            @RequestBody List<FacultyRegistrationDto> dtoList,
            Authentication auth
    ) {
        try {
            User caller = resolveCaller(auth);
            FacultyBulkImportResponseDto result = hodFacultyService.bulkImportFaculty(dtoList, caller);
            return ResponseEntity.ok(result);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Faculty bulk import error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Faculty bulk import error: " + e.getMessage()));
        }
    }

    /**
     * GET /api/hod/faculty
     * Lists all faculty strictly belonging to the caller's department.
     */
    @GetMapping
    public ResponseEntity<?> getDepartmentFaculty(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String designation,
            @RequestParam(required = false) String status,
            Authentication auth
    ) {
        try {
            User caller = resolveCaller(auth);
            List<FacultyRegistrationDto> list = hodFacultyService.getDepartmentFaculty(caller, search, designation, status);
            return ResponseEntity.ok(list);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error retrieving department faculty: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to retrieve faculty: " + e.getMessage()));
        }
    }

    /**
     * GET /api/hod/faculty/{id}
     * Retrieve single faculty details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFacultyById(
            @PathVariable Long id,
            Authentication auth
    ) {
        try {
            User caller = resolveCaller(auth);
            FacultyRegistrationDto dto = hodFacultyService.getFacultyById(id, caller);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/hod/faculty/{id}
     * Update permitted faculty member info.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFaculty(
            @PathVariable Long id,
            @RequestBody FacultyRegistrationDto updates,
            Authentication auth
    ) {
        try {
            User caller = resolveCaller(auth);
            FacultyRegistrationDto updated = hodFacultyService.updateFaculty(id, updates, caller);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * PATCH /api/hod/faculty/{id}/status
     * Toggle faculty account status.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateFacultyStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        try {
            User caller = resolveCaller(auth);
            String status = body != null ? body.get("status") : "ACTIVE";
            FacultyRegistrationDto updated = hodFacultyService.updateFacultyStatus(id, status, caller);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
