package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvailabilityMatrixService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableSlotRepository slotRepository;
    private final DepartmentResolver departmentResolver;

    private static final List<PeriodDto> DEFAULT_PERIOD_DTOS = List.of(
            PeriodDto.builder().periodIndex(1).startTime(LocalTime.of(8, 30)).endTime(LocalTime.of(9, 30)).isBreak(false).label("08:30-09:30").build(),
            PeriodDto.builder().periodIndex(2).startTime(LocalTime.of(9, 30)).endTime(LocalTime.of(10, 30)).isBreak(false).label("09:30-10:30").build(),
            PeriodDto.builder().periodIndex(3).startTime(LocalTime.of(10, 30)).endTime(LocalTime.of(11, 30)).isBreak(false).label("10:30-11:30").build(),
            PeriodDto.builder().periodIndex(4).startTime(LocalTime.of(11, 30)).endTime(LocalTime.of(12, 30)).isBreak(false).label("11:30-12:30").build(),
            PeriodDto.builder().periodIndex(5).startTime(LocalTime.of(12, 30)).endTime(LocalTime.of(13, 30)).isBreak(true).label("Lunch Break").build(),
            PeriodDto.builder().periodIndex(6).startTime(LocalTime.of(13, 30)).endTime(LocalTime.of(14, 30)).isBreak(false).label("13:30-14:30").build(),
            PeriodDto.builder().periodIndex(7).startTime(LocalTime.of(14, 30)).endTime(LocalTime.of(15, 30)).isBreak(false).label("14:30-15:30").build(),
            PeriodDto.builder().periodIndex(8).startTime(LocalTime.of(15, 30)).endTime(LocalTime.of(16, 30)).isBreak(false).label("15:30-16:30").build()
    );

    @Transactional(readOnly = true)
    public AvailabilityMatrixDto getAvailabilityMatrix(
            List<Long> facultyIds,
            String department,
            String session,
            Term term
    ) {
        String academicSession = (session != null && !session.isBlank()) ? session : "2026-27";
        Term targetTerm = (term != null) ? term : Term.ODD;

        // 1. Resolve Target Faculty
        List<FacultyProfile> targetFaculty;
        if (facultyIds != null && !facultyIds.isEmpty()) {
            targetFaculty = facultyProfileRepository.findAllById(facultyIds);
        } else if (department != null && !department.isBlank() && !department.equalsIgnoreCase("ALL")) {
            targetFaculty = facultyProfileRepository.findAll().stream()
                    .filter(f -> departmentResolver.matches(f.getDepartmentCode(), department))
                    .toList();
        } else {
            targetFaculty = facultyProfileRepository.findAll();
        }

        // 2. Fetch context slots for the session & term
        List<TimetableSlot> slots = slotRepository.findByAcademicSessionAndTermNonArchived(academicSession, targetTerm);

        // Map: facultyId -> dayOfWeek -> periodIndex -> TimetableSlot
        Map<Long, Map<Integer, Map<Integer, TimetableSlot>>> facultySchedule = new HashMap<>();
        for (FacultyProfile fp : targetFaculty) {
            facultySchedule.put(fp.getId(), new HashMap<>());
            for (int d = 1; d <= 6; d++) {
                facultySchedule.get(fp.getId()).put(d, new HashMap<>());
            }
        }

        for (TimetableSlot s : slots) {
            if (s.getFacultyMembers() != null && s.getDayOfWeek() != null && s.getDayOfWeek() >= 1 && s.getDayOfWeek() <= 6) {
                int day = s.getDayOfWeek();
                int start = s.getStartPeriod() != null ? s.getStartPeriod() : 1;
                int span = s.getSpan() != null ? s.getSpan() : 1;

                for (FacultyProfile fp : s.getFacultyMembers()) {
                    if (facultySchedule.containsKey(fp.getId())) {
                        for (int p = 0; p < span; p++) {
                            int periodIdx = start + p;
                            if (periodIdx <= 8) {
                                facultySchedule.get(fp.getId()).get(day).put(periodIdx, s);
                            }
                        }
                    }
                }
            }
        }

        // 3. Build Availability Cells
        List<AvailabilityCellDto> cells = new ArrayList<>();
        int totalFac = targetFaculty.size();

        for (int day = 1; day <= 6; day++) {
            for (PeriodDto period : DEFAULT_PERIOD_DTOS) {
                int pIdx = period.getPeriodIndex();
                boolean isBreak = Boolean.TRUE.equals(period.getIsBreak());

                List<FacultyProfileDto> freeFaculty = new ArrayList<>();
                List<BusyFacultyDto> busyFaculty = new ArrayList<>();

                if (isBreak) {
                    cells.add(AvailabilityCellDto.builder()
                            .dayOfWeek(day)
                            .periodIndex(pIdx)
                            .isBreak(true)
                            .totalFaculty(totalFac)
                            .freeCount(totalFac)
                            .busyCount(0)
                            .freeRatio(1.0)
                            .freeFaculty(Collections.emptyList())
                            .busyFaculty(Collections.emptyList())
                            .build());
                    continue;
                }

                for (FacultyProfile fp : targetFaculty) {
                    TimetableSlot busySlot = facultySchedule.get(fp.getId()).get(day).get(pIdx);
                    if (busySlot != null) {
                        busyFaculty.add(BusyFacultyDto.builder()
                                .facultyId(fp.getId())
                                .fullName(fp.getFullName())
                                .shortCode(fp.getShortCode())
                                .slotId(busySlot.getId())
                                .subjectName(busySlot.getSubject() != null ? busySlot.getSubject().getName() : "")
                                .subjectCode(busySlot.getSubject() != null ? busySlot.getSubject().getRtuCode() : "")
                                .sectionName(busySlot.getSection() != null ? busySlot.getSection().getName() : "")
                                .roomCode(busySlot.getRoom() != null ? busySlot.getRoom().getCode() : "")
                                .build());
                    } else {
                        freeFaculty.add(FacultyProfileDto.builder()
                                .id(fp.getId())
                                .fullName(fp.getFullName())
                                .shortCode(fp.getShortCode())
                                .departmentCode(fp.getDepartmentCode())
                                .email(fp.getEmail())
                                .build());
                    }
                }

                int freeCount = freeFaculty.size();
                int busyCount = busyFaculty.size();
                double ratio = totalFac > 0 ? (double) freeCount / totalFac : 1.0;

                cells.add(AvailabilityCellDto.builder()
                        .dayOfWeek(day)
                        .periodIndex(pIdx)
                        .isBreak(false)
                        .totalFaculty(totalFac)
                        .freeCount(freeCount)
                        .busyCount(busyCount)
                        .freeRatio(Math.round(ratio * 100.0) / 100.0)
                        .freeFaculty(freeFaculty)
                        .busyFaculty(busyFaculty)
                        .build());
            }
        }

        List<FacultyProfileDto> facultyDtos = targetFaculty.stream()
                .map(fp -> FacultyProfileDto.builder()
                        .id(fp.getId())
                        .fullName(fp.getFullName())
                        .shortCode(fp.getShortCode())
                        .departmentCode(fp.getDepartmentCode())
                        .email(fp.getEmail())
                        .build())
                .collect(Collectors.toList());

        return AvailabilityMatrixDto.builder()
                .periods(DEFAULT_PERIOD_DTOS)
                .facultyMembers(facultyDtos)
                .cells(cells)
                .academicSession(academicSession)
                .term(targetTerm.name())
                .build();
    }
}

