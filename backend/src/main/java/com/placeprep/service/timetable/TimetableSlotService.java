package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.SlotBulkRequest;
import com.placeprep.dto.timetable.SlotDto;
import com.placeprep.dto.timetable.SlotMoveRequest;
import com.placeprep.dto.timetable.SlotSwapRequest;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.AuditLogService;
import com.placeprep.service.timetable.clash.ClashService;
import com.placeprep.service.timetable.clash.ConflictSeverity;
import com.placeprep.service.timetable.clash.TimetableConflict;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableSlotService {

    private final TimetableRepository timetableRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetablePeriodRepository periodRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableLabGroupRepository labGroupRepository;
    private final TimetableSubjectRepository subjectRepository;
    private final TimetableRoomRepository roomRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableAssignmentRepository assignmentRepository;
    private final ClashService clashService;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private AuditLogService auditLogService;

    @Transactional
    public SlotDto createSlot(Long timetableId, SlotDto dto) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        if (timetable.getStatus() != TimetableStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT timetables can be edited. Create a revision first.");
        }

        TimetableSlot slot = new TimetableSlot();
        slot.setTimetable(timetable);
        populateSlotFromDto(slot, dto);

        // Run clash engine
        List<TimetableConflict> conflicts = clashService.validateSlot(timetableId, slot);
        List<TimetableConflict> hardConflicts = conflicts.stream()
                .filter(c -> c.getSeverity() == ConflictSeverity.HARD)
                .collect(Collectors.toList());

        if (!hardConflicts.isEmpty()) {
            throw new TimetableHardConflictException(hardConflicts);
        }

        TimetableSlot saved = slotRepository.save(slot);
        if (auditLogService != null) {
            auditLogService.logAction("SLOT_CREATED", "MANAGEMENT", "MANAGEMENT", "Slot:" + saved.getId() + " Timetable:" + timetableId, "Created slot on Day " + saved.getDayOfWeek() + ", Period " + saved.getStartPeriod());
        }
        return TimetableDtoMapper.toDto(saved);
    }

    @Transactional
    public SlotDto updateSlot(Long timetableId, Long slotId, SlotDto dto) {
        TimetableSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found: " + slotId));

        if (slot.getTimetable() == null || !slot.getTimetable().getId().equals(timetableId)) {
            throw new IllegalArgumentException("Slot " + slotId + " does not belong to timetable " + timetableId);
        }

        if (slot.getTimetable().getStatus() != TimetableStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT timetables can be edited. Create a revision first.");
        }

        // Optimistic locking
        if (dto.getVersion() != null && slot.getVersion() != null && !dto.getVersion().equals(slot.getVersion())) {
            throw new StaleVersionException("STALE_VERSION: Slot has been modified by another transaction");
        }

        populateSlotFromDto(slot, dto);

        // Run clash engine
        List<TimetableConflict> conflicts = clashService.validateSlot(timetableId, slot);
        List<TimetableConflict> hardConflicts = conflicts.stream()
                .filter(c -> c.getSeverity() == ConflictSeverity.HARD)
                .collect(Collectors.toList());

        if (!hardConflicts.isEmpty()) {
            throw new TimetableHardConflictException(hardConflicts);
        }

        TimetableSlot saved = slotRepository.save(slot);
        if (auditLogService != null) {
            auditLogService.logAction("SLOT_UPDATED", "MANAGEMENT", "MANAGEMENT", "Slot:" + saved.getId() + " Timetable:" + timetableId, "Updated slot on Day " + saved.getDayOfWeek() + ", Period " + saved.getStartPeriod());
        }
        return TimetableDtoMapper.toDto(saved);
    }

    @Transactional
    public void deleteSlot(Long timetableId, Long slotId) {
        TimetableSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found: " + slotId));

        if (slot.getTimetable() == null || !slot.getTimetable().getId().equals(timetableId)) {
            throw new IllegalArgumentException("Slot " + slotId + " does not belong to timetable " + timetableId);
        }

        if (slot.getTimetable().getStatus() != TimetableStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT timetables can be edited.");
        }

        slotRepository.delete(slot);
        if (auditLogService != null) {
            auditLogService.logAction("SLOT_DELETED", "MANAGEMENT", "MANAGEMENT", "Slot:" + slotId + " Timetable:" + timetableId, "Deleted slot ID: " + slotId);
        }
    }

    @Transactional
    public List<SlotDto> bulkWriteSlots(Long timetableId, SlotBulkRequest request) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        if (timetable.getStatus() != TimetableStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT timetables can be edited.");
        }

        if (request.getTimetableVersion() != null && timetable.getVersion() != null
                && !request.getTimetableVersion().equals(timetable.getVersion())) {
            throw new StaleVersionException("STALE_VERSION: Timetable has been modified by another transaction");
        }

        List<TimetableSlot> preparedSlots = new ArrayList<>();
        for (SlotDto dto : request.getSlots()) {
            TimetableSlot slot = dto.getId() != null
                    ? slotRepository.findById(dto.getId()).orElse(new TimetableSlot())
                    : new TimetableSlot();
            slot.setTimetable(timetable);
            if (dto.getId() != null && dto.getVersion() != null && slot.getVersion() != null
                    && !dto.getVersion().equals(slot.getVersion())) {
                throw new StaleVersionException("STALE_VERSION: Slot " + dto.getId() + " has been modified");
            }
            populateSlotFromDto(slot, dto);
            preparedSlots.add(slot);
        }

        // Validate all prepared slots
        List<TimetablePeriod> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(timetableId);
        List<TimetableSlot> crossSlots = slotRepository.findActiveSlotsForSessionAndTerm(
                timetable.getAcademicSession(), timetable.getTerm()
        ).stream().filter(s -> !s.getTimetable().getId().equals(timetableId)).collect(Collectors.toList());
        List<TimetableAssignment> assignments = assignmentRepository.findByTimetableId(timetableId);

        List<TimetableConflict> conflicts = clashService.evaluateTimetable(preparedSlots, crossSlots, periods, assignments, Collections.emptyMap());
        List<TimetableConflict> hardConflicts = conflicts.stream()
                .filter(c -> c.getSeverity() == ConflictSeverity.HARD)
                .collect(Collectors.toList());

        if (!hardConflicts.isEmpty()) {
            throw new TimetableHardConflictException(hardConflicts);
        }

        List<TimetableSlot> saved = slotRepository.saveAll(preparedSlots);
        return saved.stream().map(TimetableDtoMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public SlotDto moveSlot(Long timetableId, Long slotId, SlotMoveRequest request) {
        TimetableSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found: " + slotId));

        if (slot.getTimetable() == null || !slot.getTimetable().getId().equals(timetableId)) {
            throw new IllegalArgumentException("Slot does not belong to timetable " + timetableId);
        }
        if (slot.getTimetable().getStatus() != TimetableStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT timetables can be edited.");
        }

        slot.setDayOfWeek(request.getDayOfWeek());
        slot.setStartPeriod(request.getStartPeriod());

        List<TimetableConflict> conflicts = clashService.validateSlot(timetableId, slot);
        List<TimetableConflict> hardConflicts = conflicts.stream()
                .filter(c -> c.getSeverity() == ConflictSeverity.HARD)
                .collect(Collectors.toList());

        if (!hardConflicts.isEmpty()) {
            throw new TimetableHardConflictException(hardConflicts);
        }

        TimetableSlot savedSlot = slotRepository.save(slot);
        if (auditLogService != null) {
            auditLogService.logAction("SLOT_MOVED", "MANAGEMENT", "MANAGEMENT", "Slot:" + slotId + " Timetable:" + timetableId, "Moved slot to Day " + request.getDayOfWeek() + ", Period " + request.getStartPeriod());
        }
        return TimetableDtoMapper.toDto(savedSlot);
    }

    @Transactional
    public List<SlotDto> swapSlots(Long timetableId, SlotSwapRequest request) {
        TimetableSlot slotA = slotRepository.findById(request.getSlotIdA())
                .orElseThrow(() -> new IllegalArgumentException("Slot A not found: " + request.getSlotIdA()));
        TimetableSlot slotB = slotRepository.findById(request.getSlotIdB())
                .orElseThrow(() -> new IllegalArgumentException("Slot B not found: " + request.getSlotIdB()));

        if (!slotA.getTimetable().getId().equals(timetableId) || !slotB.getTimetable().getId().equals(timetableId)) {
            throw new IllegalArgumentException("Slots must belong to the specified timetable");
        }
        if (slotA.getTimetable().getStatus() != TimetableStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT timetables can be edited.");
        }

        Integer dayA = slotA.getDayOfWeek();
        Integer startA = slotA.getStartPeriod();
        Integer spanA = slotA.getSpan();

        slotA.setDayOfWeek(slotB.getDayOfWeek());
        slotA.setStartPeriod(slotB.getStartPeriod());

        slotB.setDayOfWeek(dayA);
        slotB.setStartPeriod(startA);

        // Validate both
        List<TimetableConflict> conflictsA = clashService.validateSlot(timetableId, slotA);
        List<TimetableConflict> conflictsB = clashService.validateSlot(timetableId, slotB);

        List<TimetableConflict> hardConflicts = new ArrayList<>();
        hardConflicts.addAll(conflictsA.stream().filter(c -> c.getSeverity() == ConflictSeverity.HARD).collect(Collectors.toList()));
        hardConflicts.addAll(conflictsB.stream().filter(c -> c.getSeverity() == ConflictSeverity.HARD).collect(Collectors.toList()));

        if (!hardConflicts.isEmpty()) {
            throw new TimetableHardConflictException(hardConflicts);
        }

        TimetableSlot savedA = slotRepository.save(slotA);
        TimetableSlot savedB = slotRepository.save(slotB);
        if (auditLogService != null) {
            auditLogService.logAction("SLOT_SWAPPED", "MANAGEMENT", "MANAGEMENT", "Slot:" + slotA.getId() + "," + slotB.getId() + " Timetable:" + timetableId, "Swapped slots " + slotA.getId() + " and " + slotB.getId());
        }
        return List.of(TimetableDtoMapper.toDto(savedA), TimetableDtoMapper.toDto(savedB));
    }

    @Transactional(readOnly = true)
    public List<TimetableConflict> dryRunCandidateSlot(Long timetableId, SlotDto dto) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        TimetableSlot slot = new TimetableSlot();
        slot.setId(dto.getId());
        slot.setTimetable(timetable);
        populateSlotFromDto(slot, dto);

        return clashService.validateSlot(timetableId, slot);
    }

    @Transactional(readOnly = true)
    public List<TimetableConflict> validateTimetable(Long timetableId) {
        return clashService.validateTimetable(timetableId);
    }

    private void populateSlotFromDto(TimetableSlot slot, SlotDto dto) {
        if (dto.getSectionId() != null) {
            slot.setSection(sectionRepository.findById(dto.getSectionId()).orElse(null));
        }
        if (dto.getLabGroupId() != null) {
            slot.setLabGroup(labGroupRepository.findById(dto.getLabGroupId()).orElse(null));
        } else {
            slot.setLabGroup(null);
        }
        slot.setDayOfWeek(dto.getDayOfWeek());
        slot.setStartPeriod(dto.getStartPeriod());
        slot.setSpan(dto.getSpan() != null ? dto.getSpan() : 1);

        if (dto.getSubjectId() != null) {
            slot.setSubject(subjectRepository.findById(dto.getSubjectId()).orElse(null));
        }
        if (dto.getRoomId() != null) {
            slot.setRoom(roomRepository.findById(dto.getRoomId()).orElse(null));
        } else {
            slot.setRoom(null);
        }

        slot.setSlotKind(dto.getSlotKind() != null ? dto.getSlotKind() : SlotKind.THEORY);
        slot.setCustomStart(dto.getCustomStart());
        slot.setCustomEnd(dto.getCustomEnd());
        slot.setNote(dto.getNote());
        slot.setSourceRef(dto.getSourceRef());

        if (dto.getFacultyIds() != null && !dto.getFacultyIds().isEmpty()) {
            slot.setFaculty(new HashSet<>(facultyProfileRepository.findAllById(dto.getFacultyIds())));
        } else {
            slot.setFaculty(new HashSet<>());
        }
    }
}

