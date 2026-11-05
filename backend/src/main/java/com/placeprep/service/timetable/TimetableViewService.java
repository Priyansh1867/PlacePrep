package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.*;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.Notification;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.NotificationService;
import com.placeprep.service.timetable.clash.ConflictCode;
import com.placeprep.service.timetable.clash.ConflictSeverity;
import com.placeprep.service.timetable.clash.TimetableConflict;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TimetableViewService {

    private final TimetableRepository timetableRepository;
    private final TimetablePeriodRepository periodRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableLabGroupRepository labGroupRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetableStudentGroupRepository studentGroupRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableRoomRepository roomRepository;
    private final TimetableOverrideRepository overrideRepository;
    private final TimetableCalendarEventRepository calendarEventRepository;
    private final DepartmentResolver departmentResolver;
    private final NotificationService notificationService;
    private final PublishNotificationListener publishNotificationListener;
    private final com.placeprep.repository.UserRepository userRepository;

    @Autowired
    public TimetableViewService(
            TimetableRepository timetableRepository,
            TimetablePeriodRepository periodRepository,
            TimetableSectionRepository sectionRepository,
            TimetableLabGroupRepository labGroupRepository,
            TimetableSlotRepository slotRepository,
            TimetableStudentGroupRepository studentGroupRepository,
            FacultyProfileRepository facultyProfileRepository,
            TimetableRoomRepository roomRepository,
            TimetableOverrideRepository overrideRepository,
            TimetableCalendarEventRepository calendarEventRepository,
            DepartmentResolver departmentResolver,
            NotificationService notificationService,
            PublishNotificationListener publishNotificationListener,
            com.placeprep.repository.UserRepository userRepository
    ) {
        this.timetableRepository = timetableRepository;
        this.periodRepository = periodRepository;
        this.sectionRepository = sectionRepository;
        this.labGroupRepository = labGroupRepository;
        this.slotRepository = slotRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.roomRepository = roomRepository;
        this.overrideRepository = overrideRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.departmentResolver = departmentResolver;
        this.notificationService = notificationService;
        this.publishNotificationListener = publishNotificationListener;
        this.userRepository = userRepository;
    }

    public TimetableViewService(
            TimetableRepository timetableRepository,
            TimetablePeriodRepository periodRepository,
            TimetableSectionRepository sectionRepository,
            TimetableLabGroupRepository labGroupRepository,
            TimetableSlotRepository slotRepository,
            TimetableStudentGroupRepository studentGroupRepository,
            FacultyProfileRepository facultyProfileRepository,
            TimetableRoomRepository roomRepository,
            TimetableOverrideRepository overrideRepository,
            DepartmentResolver departmentResolver,
            NotificationService notificationService,
            PublishNotificationListener publishNotificationListener,
            com.placeprep.repository.UserRepository userRepository
    ) {
        this(timetableRepository, periodRepository, sectionRepository, labGroupRepository,
                slotRepository, studentGroupRepository, facultyProfileRepository, roomRepository,
                overrideRepository, null, departmentResolver, notificationService,
                publishNotificationListener, userRepository);
    }

    public User resolveCurrentUser(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new AccessDeniedException("Authentication required.");
        }
        String principal = auth.getName();
        return userRepository.findByEmail(principal)
                .or(() -> userRepository.findByRollNumber(principal))
                .orElseThrow(() -> new AccessDeniedException("User account not found for authenticated principal."));
    }


    /**
     * STUDENT: GET /api/timetable/me
     * Returns whole-section slots plus the student's own lab group slots from published timetables.
     * If unassigned, returns 200 with unassigned=true and message.
     */
    @Transactional(readOnly = true)
    public StudentTimetableViewDto getStudentView(User user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required.");
        }

        // 1. Look up student assignment in published timetables
        List<TimetableStudentGroup> assignments = studentGroupRepository.findPublishedByUserId(user.getId());
        if (assignments.isEmpty() && user.getRollNumber() != null && !user.getRollNumber().isBlank()) {
            assignments = studentGroupRepository.findPublishedByRollNumber(user.getRollNumber().trim());
        }

        if (assignments.isEmpty()) {
            return StudentTimetableViewDto.builder()
                    .unassigned(true)
                    .message("You are not yet assigned to a section or timetable. Please contact your department coordinator.")
                    .slots(Collections.emptyList())
                    .periods(Collections.emptyList())
                    .build();
        }

        TimetableStudentGroup assignment = assignments.get(0);
        Timetable timetable = assignment.getTimetable();
        TimetableSection section = assignment.getSection();
        TimetableLabGroup labGroup = assignment.getLabGroup();

        // 2. Query published slots for this timetable
        List<TimetableSlot> allSlots = slotRepository.findPublishedSlotsByTimetableId(timetable.getId());

        // 3. Filter slots: whole-section + student's own lab group
        List<SlotDto> studentSlots = allSlots.stream()
                .filter(s -> s.getSection() != null && s.getSection().getId().equals(section.getId()))
                .filter(s -> {
                    // Whole-section slot
                    if (s.getLabGroup() == null) {
                        return true;
                    }
                    // Student's own lab group slot
                    return labGroup != null && s.getLabGroup().getId().equals(labGroup.getId());
                })
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toList());

        List<PeriodDto> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(timetable.getId()).stream()
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toList());

        String etag = String.format("\"tt-%d-v%d\"", timetable.getId(), timetable.getVersionNo());

        return StudentTimetableViewDto.builder()
                .unassigned(false)
                .timetableId(timetable.getId())
                .academicSession(timetable.getAcademicSession())
                .term(timetable.getTerm())
                .departmentCode(timetable.getDepartmentCode())
                .semester(timetable.getSemester())
                .sectionName(section.getName())
                .labGroupCode(labGroup != null ? labGroup.getCode() : null)
                .periods(periods)
                .slots(studentSlots)
                .etag(etag)
                .build();
    }

    /**
     * TEACHER/FACULTY: GET /api/timetable/me
     * Returns every published slot where linked faculty_profile is in tt_slot_faculty.
     * If no linked profile, returns needsLinking=true with suggestions and notifies management.
     */
    @Transactional
    public TeacherTimetableViewDto getTeacherView(User user) {
        if (user == null) {
            throw new AccessDeniedException("Authentication required.");
        }

        // 1. Look up linked faculty profile
        Optional<FacultyProfile> linkedProfile = facultyProfileRepository.findByUserId(user.getId());

        if (linkedProfile.isEmpty()) {
            // Find up to 3 suggestions: email match, then name match
            Set<FacultyProfile> suggestions = new LinkedHashSet<>();
            if (user.getEmail() != null) {
                facultyProfileRepository.findByEmailIgnoreCase(user.getEmail()).ifPresent(suggestions::add);
            }
            if (user.getName() != null) {
                suggestions.addAll(facultyProfileRepository.findByFullNameContainingIgnoreCase(user.getName()));
            }

            List<FacultyProfileDto> suggestedDtos = suggestions.stream()
                    .filter(fp -> fp.getUser() == null) // only unlinked
                    .limit(3)
                    .map(TimetableDtoMapper::toDto)
                    .collect(Collectors.toList());

            // Create notification for management
            Notification n = Notification.builder()
                    .title("Faculty Profile Linking Required")
                    .message(String.format("Faculty %s (%s) requested timetable access but has no linked faculty profile.",
                            user.getName(), user.getEmail()))
                    .type("TIMETABLE_LINK_REQUEST")
                    .targetRole("MANAGEMENT")
                    .senderName("Timetable System")
                    .build();
            try {
                notificationService.broadcast(n);
            } catch (Exception ex) {
                log.error("Failed to notify management of faculty linking request for {}: {}", user.getEmail(), ex.getMessage());
            }

            return TeacherTimetableViewDto.builder()
                    .needsLinking(true)
                    .message("Your user account is not yet linked to a faculty profile. A notification has been sent to management.")
                    .suggestedProfiles(suggestedDtos)
                    .slots(Collections.emptyList())
                    .periods(Collections.emptyList())
                    .build();
        }

        FacultyProfile fp = linkedProfile.get();

        // 2. Query published slots where this faculty is assigned across all years and semesters
        List<TimetableSlot> facultySlots = slotRepository.findPublishedSlotsByFacultyId(fp.getId());
        List<SlotDto> slotDtos = facultySlots.stream()
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toList());

        // Collect periods across active published timetables
        Set<Long> timetableIds = facultySlots.stream().map(s -> s.getTimetable().getId()).collect(Collectors.toSet());
        List<PeriodDto> periods = timetableIds.stream()
                .flatMap(id -> periodRepository.findByTimetableIdOrderByPeriodIndexAsc(id).stream())
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toMap(PeriodDto::getPeriodIndex, p -> p, (p1, p2) -> p1))
                .values().stream().sorted(Comparator.comparingInt(PeriodDto::getPeriodIndex))
                .toList();

        String etag = String.format("\"fac-%d-slots-%d\"", fp.getId(), slotDtos.size());

        return TeacherTimetableViewDto.builder()
                .needsLinking(false)
                .facultyProfile(TimetableDtoMapper.toDto(fp))
                .slots(slotDtos)
                .periods(periods)
                .etag(etag)
                .build();
    }

    /**
     * Today's view with approved substitutions/overrides applied for today.
     */
    @Transactional(readOnly = true)
    public Object getMeToday(User user) {
        LocalDate today = LocalDate.now();
        int dayOfWeek = today.getDayOfWeek().getValue(); // 1=Mon..7=Sun
        return getMeForDateRange(user, today, today, dayOfWeek);
    }

    /**
     * Week's view with approved substitutions/overrides applied for that week.
     */
    @Transactional(readOnly = true)
    public Object getMeWeek(User user, LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        LocalDate monday = targetDate.with(DayOfWeek.MONDAY);
        LocalDate saturday = monday.plusDays(5);
        return getMeForDateRange(user, monday, saturday, null);
    }

    private Object getMeForDateRange(User user, LocalDate startDate, LocalDate endDate, Integer singleDayOfWeek) {
        String role = user.getRole() != null ? user.getRole().toLowerCase() : "student";

        if ("student".equalsIgnoreCase(role)) {
            StudentTimetableViewDto base = getStudentView(user);
            if (base.isUnassigned()) return base;

            List<SlotDto> filtered = base.getSlots().stream()
                    .filter(s -> singleDayOfWeek == null || s.getDayOfWeek().equals(singleDayOfWeek))
                    .collect(Collectors.toList());

            applyOverridesToSlots(filtered, startDate, endDate);
            applyCalendarEvents(filtered, startDate, endDate, base.getDepartmentCode(), base.getSemester(), base.getSectionName(), base::setEventNote, base::setCalendarEvents);
            base.setSlots(filtered);
            return base;
        } else {
            TeacherTimetableViewDto base = getTeacherView(user);
            if (base.isNeedsLinking()) return base;

            List<SlotDto> filtered = base.getSlots().stream()
                    .filter(s -> singleDayOfWeek == null || s.getDayOfWeek().equals(singleDayOfWeek))
                    .collect(Collectors.toList());

            applyOverridesToSlots(filtered, startDate, endDate);
            String dept = base.getFacultyProfile() != null ? base.getFacultyProfile().getDepartmentCode() : user.getBranch();
            applyCalendarEvents(filtered, startDate, endDate, dept, null, null, base::setEventNote, base::setCalendarEvents);
            base.setSlots(filtered);
            return base;
        }
    }

    private void applyOverridesToSlots(List<SlotDto> slots, LocalDate startDate, LocalDate endDate) {
        if (slots.isEmpty()) return;
        List<Long> slotIds = slots.stream().map(SlotDto::getId).filter(Objects::nonNull).toList();
        if (slotIds.isEmpty()) return;

        List<TimetableOverride> overrides = overrideRepository.findBySlotIdInAndOnDateBetweenAndStatus(
                slotIds, startDate, endDate, OverrideStatus.APPROVED);

        Map<Long, TimetableOverride> overrideMap = overrides.stream()
                .collect(Collectors.toMap(o -> o.getSlot().getId(), o -> o, (o1, o2) -> o1));

        for (SlotDto slot : slots) {
            TimetableOverride ov = overrideMap.get(slot.getId());
            if (ov != null) {
                slot.setOverrideKind(ov.getKind());
                if (ov.getKind() == OverrideKind.CANCEL) {
                    slot.setIsCancelled(true);
                    slot.setOverrideNotice("Cancelled: " + (ov.getReason() != null ? ov.getReason() : "Class cancelled."));
                } else if (ov.getKind() == OverrideKind.SUBSTITUTE && ov.getSubstituteFaculty() != null) {
                    slot.setFacultyNames(List.of(ov.getSubstituteFaculty().getFullName()));
                    slot.setOverrideNotice("Substitute: " + ov.getSubstituteFaculty().getFullName());
                } else if (ov.getKind() == OverrideKind.ROOM_CHANGE && ov.getNewRoom() != null) {
                    slot.setRoomCode(ov.getNewRoom().getCode());
                    slot.setOverrideNotice("Room moved to: " + ov.getNewRoom().getCode());
                } else if (ov.getKind() == OverrideKind.RESCHEDULE) {
                    if (ov.getNewStart() != null) slot.setCustomStart(ov.getNewStart());
                    if (ov.getNewEnd() != null) slot.setCustomEnd(ov.getNewEnd());
                    slot.setOverrideNotice("Rescheduled on " + ov.getOnDate());
                }
            }
        }
    }

    private void applyCalendarEvents(
            List<SlotDto> slots,
            LocalDate startDate,
            LocalDate endDate,
            String dept,
            Integer year,
            String section,
            java.util.function.Consumer<String> noteConsumer,
            java.util.function.Consumer<List<CalendarEventDto>> eventsConsumer
    ) {
        if (calendarEventRepository == null || startDate == null || endDate == null) return;
        List<TimetableCalendarEvent> events = calendarEventRepository.findApplicableForDateRange(startDate, endDate, dept, year, section);
        if (events == null || events.isEmpty()) return;

        if (eventsConsumer != null) {
            eventsConsumer.accept(events.stream().map(e -> CalendarEventDto.builder()
                    .id(e.getId())
                    .startDate(e.getStartDate())
                    .endDate(e.getEndDate())
                    .kind(e.getKind())
                    .scope(e.getScope())
                    .departmentCode(e.getDepartmentCode())
                    .yearOfStudy(e.getYearOfStudy())
                    .sectionName(e.getSectionName())
                    .title(e.getTitle())
                    .description(e.getDescription())
                    .build()).toList());
        }

        for (TimetableCalendarEvent ev : events) {
            String note = (ev.getKind() == CalendarEventKind.HOLIDAY ? "Holiday: " : "") + ev.getTitle();
            if (noteConsumer != null) noteConsumer.accept(note);

            if (ev.getKind() == CalendarEventKind.HOLIDAY || ev.getKind() == CalendarEventKind.NO_CLASSES) {
                if (slots != null) {
                    for (SlotDto s : slots) {
                        s.setIsCancelled(true);
                        s.setOverrideNotice(note);
                        s.setEventNote(note);
                    }
                }
            } else if (slots != null) {
                for (SlotDto s : slots) {
                    if (s.getEventNote() == null || s.getEventNote().isBlank()) {
                        s.setEventNote(note);
                    }
                }
            }
        }
    }

    /**
     * HOD: GET /api/timetable/hod/overview
     * Returns weekly periods, per-day load, free periods for every faculty in the HOD's department,
     * plus sections and rooms in use.
     */
    @Transactional(readOnly = true)
    public HodOverviewDto getHodOverview(User user, String requestedDept) {
        String userRole = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";
        String targetDept;

        if ("HOD".equalsIgnoreCase(userRole)) {
            String hodDept = departmentResolver.resolveUserDepartmentOrThrow(user);
            if (requestedDept != null && !requestedDept.isBlank() && !departmentResolver.matches(requestedDept, hodDept)) {
                throw new AccessDeniedException(String.format("HOD of department '%s' cannot access overview for department '%s'.", hodDept, requestedDept));
            }
            targetDept = hodDept;
        } else if ("MANAGEMENT".equalsIgnoreCase(userRole) || "ADMIN".equalsIgnoreCase(userRole)) {
            targetDept = (requestedDept != null && !requestedDept.isBlank())
                    ? requestedDept.trim()
                    : departmentResolver.resolveUserDepartment(user).orElse("AI&DS");
        } else {
            throw new AccessDeniedException("Only HOD, MANAGEMENT, or ADMIN can view department overview.");
        }

        String canonicalDept = departmentResolver.canonicalize(targetDept).orElse(targetDept);

        // 1. Published timetables for department
        List<Timetable> publishedTimetables = timetableRepository.findByStatus(TimetableStatus.PUBLISHED).stream()
                .filter(t -> departmentResolver.matches(t.getDepartmentCode(), canonicalDept))
                .toList();

        List<TimetableDto> ttDtos = publishedTimetables.stream()
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toList());

        // 2. Active faculty members in this department
        List<FacultyProfile> facultyList = facultyProfileRepository.findByDepartmentCodeAndActiveTrue(canonicalDept);
        if (facultyList.isEmpty()) {
            facultyList = facultyProfileRepository.findAll().stream()
                    .filter(FacultyProfile::getActive)
                    .filter(fp -> departmentResolver.matches(fp.getDepartmentCode(), canonicalDept))
                    .toList();
        }

        List<FacultyLoadDto> facultyLoads = new ArrayList<>();
        Set<TimetableRoom> roomsInUse = new LinkedHashSet<>();
        List<SectionDto> sectionsInUse = new ArrayList<>();

        for (Timetable tt : publishedTimetables) {
            sectionsInUse.addAll(sectionRepository.findByTimetableIdOrderByNameAsc(tt.getId()).stream()
                    .map(s -> TimetableDtoMapper.toDto(s, labGroupRepository.findBySectionIdOrderByCodeAsc(s.getId())))
                    .toList());
        }

        for (FacultyProfile fp : facultyList) {
            List<TimetableSlot> slots = slotRepository.findPublishedSlotsByFacultyId(fp.getId());

            int totalWeeklyPeriods = 0;
            Map<Integer, Integer> perDayLoad = new HashMap<>();
            Map<Integer, List<Integer>> freePeriods = new HashMap<>();

            // Initialize days 1..6
            for (int d = 1; d <= 6; d++) {
                perDayLoad.put(d, 0);
                freePeriods.put(d, new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8)));
            }

            for (TimetableSlot s : slots) {
                totalWeeklyPeriods += s.getSpan();
                int day = s.getDayOfWeek();
                perDayLoad.put(day, perDayLoad.getOrDefault(day, 0) + s.getSpan());

                // Remove occupied periods
                List<Integer> free = freePeriods.get(day);
                if (free != null) {
                    for (int p = s.getStartPeriod(); p < s.getStartPeriod() + s.getSpan(); p++) {
                        free.remove(Integer.valueOf(p));
                    }
                }

                if (s.getRoom() != null) {
                    roomsInUse.add(s.getRoom());
                }
            }

            facultyLoads.add(FacultyLoadDto.builder()
                    .facultyId(fp.getId())
                    .fullName(fp.getFullName())
                    .shortCode(fp.getShortCode())
                    .totalWeeklyPeriods(totalWeeklyPeriods)
                    .perDayLoad(perDayLoad)
                    .freePeriodsPerDay(freePeriods)
                    .build());
        }

        List<RoomDto> roomDtos = roomsInUse.stream()
                .map(TimetableDtoMapper::toDto)
                .sorted(Comparator.comparing(RoomDto::getCode))
                .toList();

        String etag = String.format("\"hod-%s-fac-%d-sec-%d\"", canonicalDept, facultyLoads.size(), sectionsInUse.size());

        return HodOverviewDto.builder()
                .departmentCode(canonicalDept)
                .departmentName(publishedTimetables.isEmpty() ? canonicalDept : publishedTimetables.get(0).getDepartmentName())
                .facultyLoads(facultyLoads)
                .sections(sectionsInUse)
                .roomsInUse(roomDtos)
                .publishedTimetables(ttDtos)
                .etag(etag)
                .build();
    }

    /**
     * GET /api/timetable/faculty/{id}
     * Returns that faculty's weekly grid.
     * Allowed only when faculty belongs to HOD's department, or if requester is that faculty, or MANAGEMENT/ADMIN.
     */
    @Transactional(readOnly = true)
    public TeacherTimetableViewDto getFacultyGrid(User user, Long facultyId) {
        FacultyProfile fp = facultyProfileRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found with ID: " + facultyId));

        validateFacultyAccess(user, fp);

        List<TimetableSlot> slots = slotRepository.findPublishedSlotsByFacultyId(fp.getId());
        List<SlotDto> slotDtos = slots.stream().map(TimetableDtoMapper::toDto).toList();

        Set<Long> timetableIds = slots.stream().map(s -> s.getTimetable().getId()).collect(Collectors.toSet());
        List<PeriodDto> periods = timetableIds.stream()
                .flatMap(id -> periodRepository.findByTimetableIdOrderByPeriodIndexAsc(id).stream())
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toMap(PeriodDto::getPeriodIndex, p -> p, (p1, p2) -> p1))
                .values().stream().sorted(Comparator.comparingInt(PeriodDto::getPeriodIndex))
                .toList();

        String etag = String.format("\"fac-%d-slots-%d\"", fp.getId(), slotDtos.size());

        return TeacherTimetableViewDto.builder()
                .needsLinking(false)
                .facultyProfile(TimetableDtoMapper.toDto(fp))
                .slots(slotDtos)
                .periods(periods)
                .etag(etag)
                .build();
    }

    /**
     * GET /api/timetable/sections/{id}
     * Returns that section's weekly grid.
     * Allowed for assigned student, HOD of that department, or MANAGEMENT/ADMIN.
     */
    @Transactional(readOnly = true)
    public TimetableDto getSectionGrid(User user, Long sectionId) {
        TimetableSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + sectionId));

        Timetable tt = section.getTimetable();
        if (tt == null || tt.getStatus() != TimetableStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Section timetable is not published.");
        }

        validateSectionAccess(user, section);

        List<TimetableSlot> slots = slotRepository.findBySectionId(section.getId());
        List<SlotDto> slotDtos = slots.stream().map(TimetableDtoMapper::toDto).toList();
        List<PeriodDto> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(tt.getId()).stream()
                .map(TimetableDtoMapper::toDto).toList();

        TimetableDto dto = TimetableDtoMapper.toDto(tt);
        dto.setSections(List.of(TimetableDtoMapper.toDto(section, labGroupRepository.findBySectionIdOrderByCodeAsc(section.getId()))));
        dto.setSlots(slotDtos);
        dto.setPeriods(periods);
        return dto;
    }

    /**
     * GET /api/timetable/rooms/{id}
     * Returns that room's weekly grid across published timetables.
     */
    @Transactional(readOnly = true)
    public List<SlotDto> getRoomGrid(User user, Long roomId) {
        TimetableRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        String userRole = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";
        if ("STUDENT".equalsIgnoreCase(userRole)) {
            throw new AccessDeniedException("Students cannot view room grids.");
        }

        List<TimetableSlot> slots = slotRepository.findPublishedSlotsByRoomId(room.getId());
        return slots.stream().map(TimetableDtoMapper::toDto).toList();
    }

    /**
     * GET /api/timetable/rooms/free?day=&period=&roomType=
     * Returns free rooms for that day and period.
     */
    @Transactional(readOnly = true)
    public List<RoomDto> getFreeRooms(Integer day, Integer period, RoomType roomType) {
        if (day == null || period == null) {
            throw new IllegalArgumentException("Parameters 'day' and 'period' are required.");
        }

        List<TimetableRoom> allRooms = (roomType != null)
                ? roomRepository.findByRoomType(roomType)
                : roomRepository.findAll();

        List<TimetableSlot> occupiedSlots = slotRepository.findPublishedSlotsOccupyingPeriod(day, period);
        Set<Long> occupiedRoomIds = occupiedSlots.stream()
                .map(s -> s.getRoom() != null ? s.getRoom().getId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return allRooms.stream()
                .filter(r -> !occupiedRoomIds.contains(r.getId()))
                .map(TimetableDtoMapper::toDto)
                .sorted(Comparator.comparing(RoomDto::getCode))
                .toList();
    }

    /**
     * Overrides workflow: Request substitution/cancellation.
     */
    @Transactional
    public OverrideDto requestOverride(User user, CreateOverrideRequestDto request) {
        TimetableSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + request.getSlotId()));

        if (slot.getTimetable() == null || slot.getTimetable().getStatus() != TimetableStatus.PUBLISHED) {
            throw new IllegalStateException("Overrides can only be requested on PUBLISHED timetables.");
        }

        // Verify user is in slot.faculty
        boolean isTeaching = false;
        if (slot.getFaculty() != null) {
            for (FacultyProfile fp : slot.getFaculty()) {
                if (fp.getUser() != null && fp.getUser().getId().equals(user.getId())) {
                    isTeaching = true;
                    break;
                }
            }
        }

        String role = user.getRole() != null ? user.getRole().toUpperCase() : "";
        if (!isTeaching && !"MANAGEMENT".equals(role) && !"ADMIN".equals(role)) {
            throw new AccessDeniedException("You can only request substitutions for your own teaching slots.");
        }

        TimetableOverride ov = new TimetableOverride();
        ov.setSlot(slot);
        ov.setOnDate(request.getOnDate());
        ov.setKind(request.getKind());
        ov.setReason(request.getReason());
        ov.setStatus(OverrideStatus.PENDING);
        ov.setRequestedBy(user.getEmail());

        if (request.getSubstituteFacultyId() != null) {
            FacultyProfile sub = facultyProfileRepository.findById(request.getSubstituteFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Substitute faculty not found: " + request.getSubstituteFacultyId()));
            ov.setSubstituteFaculty(sub);
        }

        if (request.getNewRoomId() != null) {
            TimetableRoom room = roomRepository.findById(request.getNewRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("New room not found: " + request.getNewRoomId()));
            ov.setNewRoom(room);
        }

        if (request.getNewStart() != null) ov.setNewStart(request.getNewStart());
        if (request.getNewEnd() != null) ov.setNewEnd(request.getNewEnd());

        return TimetableDtoMapper.toDto(overrideRepository.save(ov));
    }

    /**
     * List overrides based on role.
     */
    @Transactional(readOnly = true)
    public List<OverrideDto> listOverrides(User user) {
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";

        if ("STUDENT".equalsIgnoreCase(role)) {
            throw new AccessDeniedException("Students cannot view administrative overrides.");
        }

        if ("TEACHER".equalsIgnoreCase(role) || "FACULTY".equalsIgnoreCase(role)) {
            return overrideRepository.findByRequestedBy(user.getEmail()).stream()
                    .map(TimetableDtoMapper::toDto)
                    .toList();
        }

        if ("HOD".equalsIgnoreCase(role)) {
            String dept = departmentResolver.resolveUserDepartmentOrThrow(user);
            return overrideRepository.findByDepartmentCode(dept).stream()
                    .map(TimetableDtoMapper::toDto)
                    .toList();
        }

        // MANAGEMENT / ADMIN
        return overrideRepository.findAll().stream()
                .map(TimetableDtoMapper::toDto)
                .toList();
    }

    /**
     * Approve override with clash validation.
     */
    @Transactional
    public OverrideDto approveOverride(User user, Long overrideId) {
        TimetableOverride ov = overrideRepository.findById(overrideId)
                .orElseThrow(() -> new ResourceNotFoundException("Override not found with ID: " + overrideId));

        validateOverrideDecisionAccess(user, ov);

        // Run clash engine for substitute and new room on that date
        validateOverrideClashes(ov);

        ov.setStatus(OverrideStatus.APPROVED);
        ov.setDecidedBy(user.getEmail());
        ov.setDecidedAt(LocalDateTime.now());
        TimetableOverride saved = overrideRepository.save(ov);

        // Notify affected users
        publishNotificationListener.notifyOverrideApproved(saved);

        return TimetableDtoMapper.toDto(saved);
    }

    /**
     * Reject override.
     */
    @Transactional
    public OverrideDto rejectOverride(User user, Long overrideId, String reason) {
        TimetableOverride ov = overrideRepository.findById(overrideId)
                .orElseThrow(() -> new ResourceNotFoundException("Override not found with ID: " + overrideId));

        validateOverrideDecisionAccess(user, ov);

        ov.setStatus(OverrideStatus.REJECTED);
        ov.setDecidedBy(user.getEmail());
        ov.setDecidedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            ov.setReason(ov.getReason() != null ? ov.getReason() + " [Rejected: " + reason + "]" : "Rejected: " + reason);
        }

        return TimetableDtoMapper.toDto(overrideRepository.save(ov));
    }

    private void validateOverrideClashes(TimetableOverride ov) {
        TimetableSlot slot = ov.getSlot();
        int day = ov.getOnDate().getDayOfWeek().getValue();
        int startP = slot.getStartPeriod();
        int endP = slot.getStartPeriod() + slot.getSpan() - 1;

        // 1. Substitute faculty clash check
        if (ov.getSubstituteFaculty() != null) {
            FacultyProfile sub = ov.getSubstituteFaculty();
            List<TimetableSlot> subSlots = slotRepository.findPublishedSlotsByFacultyId(sub.getId());
            for (TimetableSlot ss : subSlots) {
                if (ss.getDayOfWeek().equals(day)) {
                    int ssStart = ss.getStartPeriod();
                    int ssEnd = ss.getStartPeriod() + ss.getSpan() - 1;
                    if (Math.max(startP, ssStart) <= Math.min(endP, ssEnd)) {
                        throw new TimetableHardConflictException(List.of(TimetableConflict.builder()
                                .severity(ConflictSeverity.HARD)
                                .code(ConflictCode.FACULTY_CLASH)
                                .message(String.format("Substitute faculty '%s' is already booked on day %d period %d..%d.",
                                        sub.getFullName(), day, ssStart, ssEnd))
                                .slotIds(List.of(slot.getId(), ss.getId()))
                                .build()));
                    }
                }
            }
        }

        // 2. Room clash check
        if (ov.getNewRoom() != null) {
            TimetableRoom room = ov.getNewRoom();
            List<TimetableSlot> roomSlots = slotRepository.findPublishedSlotsByRoomId(room.getId());
            for (TimetableSlot rs : roomSlots) {
                if (rs.getDayOfWeek().equals(day)) {
                    int rsStart = rs.getStartPeriod();
                    int rsEnd = rs.getStartPeriod() + rs.getSpan() - 1;
                    if (Math.max(startP, rsStart) <= Math.min(endP, rsEnd)) {
                        throw new TimetableHardConflictException(List.of(TimetableConflict.builder()
                                .severity(ConflictSeverity.HARD)
                                .code(ConflictCode.ROOM_CLASH)
                                .message(String.format("New room '%s' is already booked on day %d period %d..%d.",
                                        room.getCode(), day, rsStart, rsEnd))
                                .slotIds(List.of(slot.getId(), rs.getId()))
                                .build()));
                    }
                }
            }
        }
    }

    private void validateFacultyAccess(User user, FacultyProfile targetFaculty) {
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";
        if ("STUDENT".equalsIgnoreCase(role)) {
            throw new AccessDeniedException("Students cannot view faculty timetable grids.");
        }
        if ("TEACHER".equalsIgnoreCase(role) || "FACULTY".equalsIgnoreCase(role)) {
            if (targetFaculty.getUser() == null || !targetFaculty.getUser().getId().equals(user.getId())) {
                throw new AccessDeniedException("Faculty members cannot view other faculty personal grids.");
            }
            return;
        }
        if ("HOD".equalsIgnoreCase(role)) {
            String hodDept = departmentResolver.resolveUserDepartmentOrThrow(user);
            if (!departmentResolver.matches(hodDept, targetFaculty.getDepartmentCode())) {
                throw new AccessDeniedException(String.format("HOD of department '%s' cannot access faculty of department '%s'.",
                        hodDept, targetFaculty.getDepartmentCode()));
            }
            return;
        }
        // MANAGEMENT / ADMIN
    }

    private void validateSectionAccess(User user, TimetableSection section) {
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";
        if ("STUDENT".equalsIgnoreCase(role)) {
            List<TimetableStudentGroup> sgs = studentGroupRepository.findPublishedByUserId(user.getId());
            if (sgs.isEmpty() && user.getRollNumber() != null) {
                sgs = studentGroupRepository.findPublishedByRollNumber(user.getRollNumber());
            }
            boolean belongs = sgs.stream().anyMatch(sg -> sg.getSection() != null && sg.getSection().getId().equals(section.getId()));
            if (!belongs) {
                throw new AccessDeniedException("Student of another section cannot view this section grid.");
            }
            return;
        }
        if ("TEACHER".equalsIgnoreCase(role) || "FACULTY".equalsIgnoreCase(role)) {
            throw new AccessDeniedException("Faculty cannot access whole section grids directly; use your personal grid.");
        }
        if ("HOD".equalsIgnoreCase(role)) {
            String hodDept = departmentResolver.resolveUserDepartmentOrThrow(user);
            if (!departmentResolver.matches(hodDept, section.getTimetable().getDepartmentCode())) {
                throw new AccessDeniedException("HOD cannot view sections of another department.");
            }
            return;
        }
        // MANAGEMENT / ADMIN
    }

    private void validateOverrideDecisionAccess(User user, TimetableOverride ov) {
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";
        if ("MANAGEMENT".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            return;
        }
        if ("HOD".equalsIgnoreCase(role)) {
            String hodDept = departmentResolver.resolveUserDepartmentOrThrow(user);
            String slotDept = ov.getSlot() != null && ov.getSlot().getTimetable() != null
                    ? ov.getSlot().getTimetable().getDepartmentCode()
                    : null;
            if (!departmentResolver.matches(hodDept, slotDept)) {
                throw new AccessDeniedException("HOD cannot approve or reject substitutions for other departments.");
            }
            return;
        }
        throw new AccessDeniedException("Only HOD, MANAGEMENT, or ADMIN can approve or reject substitutions.");
    }
}
