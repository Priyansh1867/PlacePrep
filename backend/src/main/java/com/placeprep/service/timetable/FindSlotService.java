package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.CandidateSlotDto;
import com.placeprep.dto.timetable.FindSlotRequestDto;
import com.placeprep.dto.timetable.RoomDto;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FindSlotService {

    private final TimetableRepository timetableRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetableRoomRepository roomRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetablePeriodRepository periodRepository;

    private static final String[] DAY_NAMES = {
            "", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    };

    @Transactional(readOnly = true)
    public List<CandidateSlotDto> findCandidateSlots(FindSlotRequestDto req) {
        int duration = req.getDuration() > 0 ? req.getDuration() : 1;
        Long ttId = req.getTimetableId();

        // 1. Resolve Academic Session & Term
        String session = req.getAcademicSession() != null ? req.getAcademicSession() : "2026-27";
        Term term = req.getTerm() != null ? req.getTerm() : Term.ODD;

        if (ttId != null) {
            Optional<Timetable> ttOpt = timetableRepository.findById(ttId);
            if (ttOpt.isPresent()) {
                session = ttOpt.get().getAcademicSession();
                term = ttOpt.get().getTerm();
            }
        }

        // 2. Fetch all non-archived slots of the same session and term
        List<TimetableSlot> contextSlots = slotRepository.findByAcademicSessionAndTermNonArchived(session, term);

        // 3. Find rooms matching roomType or all rooms
        List<TimetableRoom> candidateRooms = new ArrayList<>(roomRepository.findAll());
        if (req.getPreferredRoomId() != null) {
            candidateRooms.sort((a, b) -> a.getId().equals(req.getPreferredRoomId()) ? -1 : (b.getId().equals(req.getPreferredRoomId()) ? 1 : 0));
        } else if (req.getRoomType() != null) {
            candidateRooms = candidateRooms.stream().filter(r -> r.getRoomType() == req.getRoomType()).toList();
        }

        // 4. Resolve break periods
        Set<Integer> breakPeriods = new HashSet<>();
        breakPeriods.add(5); // default Lunch break is Period 5
        if (ttId != null) {
            List<TimetablePeriod> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(ttId);
            for (TimetablePeriod p : periods) {
                if (Boolean.TRUE.equals(p.getIsBreak())) {
                    breakPeriods.add(p.getPeriodIndex());
                }
            }
        }

        // 5. Pre-compute faculty daily load
        Set<Long> targetFacultyIds = new HashSet<>(req.getFacultyIds() != null ? req.getFacultyIds() : Collections.emptyList());
        Map<Integer, Integer> facultyLoadPerDay = new HashMap<>();
        for (int d = 1; d <= 6; d++) facultyLoadPerDay.put(d, 0);

        for (TimetableSlot s : contextSlots) {
            if (s.getFacultyMembers() != null) {
                boolean containsFaculty = s.getFacultyMembers().stream().anyMatch(f -> targetFacultyIds.contains(f.getId()));
                if (containsFaculty && s.getDayOfWeek() != null && s.getDayOfWeek() >= 1 && s.getDayOfWeek() <= 6) {
                    int span = s.getSpan() != null ? s.getSpan() : 1;
                    facultyLoadPerDay.put(s.getDayOfWeek(), facultyLoadPerDay.get(s.getDayOfWeek()) + span);
                }
            }
        }

        // 6. Find rooms used by the subject previously (for bonus score)
        Set<Long> subjectPreviousRoomIds = new HashSet<>();
        if (req.getSubjectId() != null) {
            for (TimetableSlot s : contextSlots) {
                if (s.getSubject() != null && s.getSubject().getId().equals(req.getSubjectId()) && s.getRoom() != null) {
                    subjectPreviousRoomIds.add(s.getRoom().getId());
                }
            }
        }

        List<CandidateSlotDto> candidates = new ArrayList<>();

        // 7. Iterate combinations of Day (1..6), Start Period (1..8-duration+1), Room
        for (int day = 1; day <= 6; day++) {
            for (int startP = 1; startP <= (8 - duration + 1); startP++) {
                int endP = startP + duration - 1;

                // Check if any period in span is a break period
                boolean intersectsBreak = false;
                for (int p = startP; p <= endP; p++) {
                    if (breakPeriods.contains(p)) {
                        intersectsBreak = true;
                        break;
                    }
                }
                if (intersectsBreak) continue;

                // Check Faculty Clash
                boolean facultyClash = false;
                for (TimetableSlot s : contextSlots) {
                    if (s.getDayOfWeek() != null && s.getDayOfWeek() == day) {
                        int sStart = s.getStartPeriod() != null ? s.getStartPeriod() : 1;
                        int sEnd = sStart + (s.getSpan() != null ? s.getSpan() : 1) - 1;
                        if (periodsOverlap(startP, endP, sStart, sEnd)) {
                            if (s.getFacultyMembers() != null) {
                                boolean hasOverlap = s.getFacultyMembers().stream().anyMatch(f -> targetFacultyIds.contains(f.getId()));
                                if (hasOverlap) {
                                    facultyClash = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (facultyClash) continue;

                // Check Section Clash
                boolean sectionClash = false;
                if (req.getSectionId() != null) {
                    for (TimetableSlot s : contextSlots) {
                        if (s.getDayOfWeek() != null && s.getDayOfWeek() == day && s.getSection() != null && s.getSection().getId().equals(req.getSectionId())) {
                            int sStart = s.getStartPeriod() != null ? s.getStartPeriod() : 1;
                            int sEnd = sStart + (s.getSpan() != null ? s.getSpan() : 1) - 1;
                            if (periodsOverlap(startP, endP, sStart, sEnd)) {
                                // If candidate is whole-section: overlaps any slot in that section
                                if (req.getLabGroupId() == null) {
                                    sectionClash = true;
                                    break;
                                } else {
                                    // Group slot: clashes with whole section or same group slot
                                    if (s.getLabGroup() == null || s.getLabGroup().getId().equals(req.getLabGroupId())) {
                                        sectionClash = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (sectionClash) continue;

                // Test Rooms for this (day, startP..endP)
                for (TimetableRoom room : candidateRooms) {
                    boolean roomClash = false;
                    for (TimetableSlot s : contextSlots) {
                        if (s.getDayOfWeek() != null && s.getDayOfWeek() == day && s.getRoom() != null && s.getRoom().getId().equals(room.getId())) {
                            int sStart = s.getStartPeriod() != null ? s.getStartPeriod() : 1;
                            int sEnd = sStart + (s.getSpan() != null ? s.getSpan() : 1) - 1;
                            if (periodsOverlap(startP, endP, sStart, sEnd)) {
                                roomClash = true;
                                break;
                            }
                        }
                    }
                    if (roomClash) continue;

                    // Valid candidate found! Compute score
                    int score = 100;
                    List<String> reasons = new ArrayList<>();

                    // Heuristic 1: Avoid first and last periods
                    if (startP == 1) {
                        score -= 30;
                        reasons.add("Period 1 opening slot penalty (-30)");
                    } else if (endP >= 8) {
                        score -= 25;
                        reasons.add("Late period end penalty (-25)");
                    } else if (startP >= 2 && startP <= 4) {
                        score += 20;
                        reasons.add("Prime morning lecture slot (+20)");
                    }

                    // Heuristic 2: Keep faculty load balanced across the week
                    int dayLoad = facultyLoadPerDay.getOrDefault(day, 0);
                    int balanceBonus = Math.max(0, (6 - dayLoad) * 5);
                    score += balanceBonus;
                    reasons.add(String.format("Faculty load on %s is %d periods (+%d)", DAY_NAMES[day], dayLoad, balanceBonus));

                    // Heuristic 3: Prefer same room as subject's other slots
                    if (subjectPreviousRoomIds.contains(room.getId())) {
                        score += 25;
                        reasons.add(String.format("Reuses established venue %s for subject (+25)", room.getCode()));
                    }

                    // Heuristic 4: Preferred room match
                    if (req.getPreferredRoomId() != null && req.getPreferredRoomId().equals(room.getId())) {
                        score += 20;
                        reasons.add("Matches preferred room (+20)");
                    }

                    candidates.add(CandidateSlotDto.builder()
                            .dayOfWeek(day)
                            .dayName(DAY_NAMES[day])
                            .startPeriod(startP)
                            .endPeriod(endP)
                            .span(duration)
                            .room(RoomDto.builder()
                                    .id(room.getId())
                                    .code(room.getCode())
                                    .displayName(room.getDisplayName())
                                    .roomType(room.getRoomType())
                                    .building(room.getBuilding())
                                    .capacity(room.getCapacity())
                                    .build())
                            .score(score)
                            .scoreReasons(reasons)
                            .build());

                    // At most 2 candidate rooms per (day, period) to ensure diverse time slots
                    if (candidates.size() >= 50) break;
                }
            }
        }

        // Sort descending by score and pick top 10
        candidates.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));
        return candidates.stream().limit(10).toList();
    }

    private boolean periodsOverlap(int s1, int e1, int s2, int e2) {
        return Math.max(s1, s2) <= Math.min(e1, e2);
    }
}

