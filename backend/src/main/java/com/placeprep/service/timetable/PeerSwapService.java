package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.OverrideDto;
import com.placeprep.dto.timetable.ProposePeerSwapRequestDto;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.FacultyProfileRepository;
import com.placeprep.repository.timetable.TimetableOverrideRepository;
import com.placeprep.repository.timetable.TimetableSlotRepository;
import com.placeprep.service.NotificationService;
import com.placeprep.service.timetable.clash.ClashService;
import com.placeprep.service.timetable.clash.ConflictSeverity;
import com.placeprep.service.timetable.clash.TimetableConflict;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class PeerSwapService {

    private final TimetableSlotRepository slotRepository;
    private final TimetableOverrideRepository overrideRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final ClashService clashService;
    private final NotificationService notificationService;
    private final DepartmentResolver departmentResolver;

    /**
     * Step 1: Faculty proposes peer swap
     */
    @Transactional
    public List<OverrideDto> proposePeerSwap(User user, ProposePeerSwapRequestDto req) {
        TimetableSlot slotA = slotRepository.findById(req.getMySlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot A not found with id: " + req.getMySlotId()));
        TimetableSlot slotB = slotRepository.findById(req.getPeerSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot B not found with id: " + req.getPeerSlotId()));

        FacultyProfile facultyA = slotA.getFacultyMembers() != null && !slotA.getFacultyMembers().isEmpty()
                ? slotA.getFacultyMembers().iterator().next() : null;
        FacultyProfile facultyB = slotB.getFacultyMembers() != null && !slotB.getFacultyMembers().isEmpty()
                ? slotB.getFacultyMembers().iterator().next() : null;

        if (facultyA == null || facultyB == null) {
            throw new IllegalArgumentException("Both slots must have assigned faculty members for a peer swap.");
        }
        if (facultyA.getId().equals(facultyB.getId())) {
            throw new IllegalArgumentException("Cannot peer swap with yourself. Use reschedule instead.");
        }

        // Verify currentUser is Faculty A or Teacher/HOD/Admin
        boolean isAuthorized = user.getRole().equalsIgnoreCase("ADMIN")
                || user.getRole().equalsIgnoreCase("MANAGEMENT")
                || user.getRole().equalsIgnoreCase("HOD")
                || (facultyA.getEmail() != null && facultyA.getEmail().equalsIgnoreCase(user.getEmail()));

        if (!isAuthorized) {
            throw new AccessDeniedException("You can only propose a swap for a lecture slot assigned to you.");
        }

        // Pre-validate candidate swap A with faculty B via Clash Service
        if (slotA.getTimetable() != null) {
            TimetableSlot candidateA = new TimetableSlot();
            candidateA.setDayOfWeek(slotA.getDayOfWeek());
            candidateA.setStartPeriod(slotA.getStartPeriod());
            candidateA.setSpan(slotA.getSpan());
            candidateA.setSection(slotA.getSection());
            candidateA.setLabGroup(slotA.getLabGroup());
            candidateA.setSubject(slotA.getSubject());
            candidateA.setRoom(slotA.getRoom());
            candidateA.setFaculty(Set.of(facultyB));
            List<TimetableConflict> conflicts = clashService.validateSlot(slotA.getTimetable().getId(), candidateA);
            if (conflicts.stream().anyMatch(c -> c.getSeverity() == ConflictSeverity.HARD)) {
                throw new IllegalArgumentException("Cannot propose swap: Faculty " + facultyB.getFullName() + " has a schedule conflict during this slot.");
            }
        }

        // Create Override 1: Slot A taught by Faculty B
        TimetableOverride ovA = new TimetableOverride();
        ovA.setSlot(slotA);
        ovA.setOnDate(req.getOnDate());
        ovA.setKind(OverrideKind.PEER_SWAP);
        ovA.setSubstituteFaculty(facultyB);
        ovA.setReason(req.getReason() != null ? req.getReason() : "Peer swap with " + facultyB.getFullName());
        ovA.setStatus(OverrideStatus.WAITING_PEER_ACCEPTANCE);
        ovA.setRequestedBy(user.getEmail() != null ? user.getEmail() : user.getName());
        TimetableOverride savedA = overrideRepository.save(ovA);

        // Create Override 2: Slot B taught by Faculty A
        TimetableOverride ovB = new TimetableOverride();
        ovB.setSlot(slotB);
        ovB.setOnDate(req.getOnDate());
        ovB.setKind(OverrideKind.PEER_SWAP);
        ovB.setSubstituteFaculty(facultyA);
        ovB.setReason(req.getReason() != null ? req.getReason() : "Peer swap with " + facultyA.getFullName());
        ovB.setStatus(OverrideStatus.WAITING_PEER_ACCEPTANCE);
        ovB.setRequestedBy(user.getEmail() != null ? user.getEmail() : user.getName());
        ovB.setPeerOverrideId(savedA.getId());
        TimetableOverride savedB = overrideRepository.save(ovB);

        savedA.setPeerOverrideId(savedB.getId());
        overrideRepository.save(savedA);

        log.info("Peer swap proposed: OvA #{} and OvB #{} between {} and {} for date {}",
                savedA.getId(), savedB.getId(), facultyA.getFullName(), facultyB.getFullName(), req.getOnDate());

        return List.of(TimetableDtoMapper.toDto(savedA), TimetableDtoMapper.toDto(savedB));
    }

    /**
     * Step 2a: Peer faculty accepts the proposal
     */
    @Transactional
    public List<OverrideDto> acceptPeerSwap(User user, Long overrideId) {
        TimetableOverride ov = overrideRepository.findById(overrideId)
                .orElseThrow(() -> new ResourceNotFoundException("Override not found with id: " + overrideId));

        if (ov.getKind() != OverrideKind.PEER_SWAP || ov.getPeerOverrideId() == null) {
            throw new IllegalArgumentException("Specified override is not a valid peer swap.");
        }
        if (ov.getStatus() != OverrideStatus.WAITING_PEER_ACCEPTANCE) {
            throw new IllegalStateException("Peer swap is not in WAITING_PEER_ACCEPTANCE state. Current: " + ov.getStatus());
        }

        TimetableOverride counterpart = overrideRepository.findById(ov.getPeerOverrideId())
                .orElseThrow(() -> new ResourceNotFoundException("Counterpart override not found: " + ov.getPeerOverrideId()));

        // Both move to PENDING (pending HOD approval)
        ov.setStatus(OverrideStatus.PENDING);
        counterpart.setStatus(OverrideStatus.PENDING);

        overrideRepository.save(ov);
        overrideRepository.save(counterpart);

        log.info("Peer swap #{} and #{} accepted by peer. Now pending HOD approval.", ov.getId(), counterpart.getId());
        return List.of(TimetableDtoMapper.toDto(ov), TimetableDtoMapper.toDto(counterpart));
    }

    /**
     * Step 2b: Peer faculty rejects the proposal
     */
    @Transactional
    public List<OverrideDto> rejectPeerSwap(User user, Long overrideId, String reason) {
        TimetableOverride ov = overrideRepository.findById(overrideId)
                .orElseThrow(() -> new ResourceNotFoundException("Override not found with id: " + overrideId));

        if (ov.getPeerOverrideId() != null) {
            overrideRepository.findById(ov.getPeerOverrideId()).ifPresent(counterpart -> {
                counterpart.setStatus(OverrideStatus.REJECTED);
                counterpart.setDecidedBy(user.getName() != null ? user.getName() : user.getEmail());
                counterpart.setDecidedAt(LocalDateTime.now());
                overrideRepository.save(counterpart);
            });
        }

        ov.setStatus(OverrideStatus.REJECTED);
        ov.setDecidedBy(user.getName() != null ? user.getName() : user.getEmail());
        ov.setDecidedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            ov.setReason((ov.getReason() != null ? ov.getReason() + " | Rejected: " : "Rejected: ") + reason);
        }
        overrideRepository.save(ov);

        log.info("Peer swap #{} rejected by peer {}", ov.getId(), user.getEmail());
        return List.of(TimetableDtoMapper.toDto(ov));
    }

    /**
     * Step 3: HOD approves both overrides atomically
     */
    @Transactional
    public List<OverrideDto> approvePeerSwapAtomically(User hodUser, Long overrideId) {
        TimetableOverride ov = overrideRepository.findById(overrideId)
                .orElseThrow(() -> new ResourceNotFoundException("Override not found with id: " + overrideId));

        if (ov.getKind() != OverrideKind.PEER_SWAP || ov.getPeerOverrideId() == null) {
            throw new IllegalArgumentException("Specified override is not a peer swap.");
        }

        TimetableOverride counterpart = overrideRepository.findById(ov.getPeerOverrideId())
                .orElseThrow(() -> new ResourceNotFoundException("Counterpart override not found: " + ov.getPeerOverrideId()));

        LocalDateTime now = LocalDateTime.now();
        String decidedBy = hodUser.getName() != null ? hodUser.getName() : hodUser.getEmail();

        ov.setStatus(OverrideStatus.APPROVED);
        ov.setDecidedBy(decidedBy);
        ov.setDecidedAt(now);

        counterpart.setStatus(OverrideStatus.APPROVED);
        counterpart.setDecidedBy(decidedBy);
        counterpart.setDecidedAt(now);

        overrideRepository.save(ov);
        overrideRepository.save(counterpart);

        log.info("Peer swap #{} and #{} atomically approved by HOD {}", ov.getId(), counterpart.getId(), decidedBy);
        return List.of(TimetableDtoMapper.toDto(ov), TimetableDtoMapper.toDto(counterpart));
    }
}
