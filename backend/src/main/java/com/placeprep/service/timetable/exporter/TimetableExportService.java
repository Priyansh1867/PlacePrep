package com.placeprep.service.timetable.exporter;

import com.placeprep.dto.timetable.*;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.User;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.timetable.TimetableDtoMapper;
import com.placeprep.service.timetable.TimetableViewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TimetableExportService {

    private final TimetableRepository timetableRepository;
    private final TimetablePeriodRepository periodRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetableSubjectRepository subjectRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableRoomRepository roomRepository;
    private final TimetableOverrideRepository overrideRepository;
    private final TimetableCalendarEventRepository calendarEventRepository;
    private final TimetableViewService timetableViewService;

    private final ExcelTimetableExporter excelExporter;
    private final PdfTimetableExporter pdfExporter;
    private final IcsTimetableExporter icsExporter;

    @Autowired
    public TimetableExportService(
            TimetableRepository timetableRepository,
            TimetablePeriodRepository periodRepository,
            TimetableSectionRepository sectionRepository,
            TimetableSlotRepository slotRepository,
            TimetableSubjectRepository subjectRepository,
            FacultyProfileRepository facultyProfileRepository,
            TimetableRoomRepository roomRepository,
            TimetableOverrideRepository overrideRepository,
            TimetableCalendarEventRepository calendarEventRepository,
            TimetableViewService timetableViewService,
            ExcelTimetableExporter excelExporter,
            PdfTimetableExporter pdfExporter,
            IcsTimetableExporter icsExporter
    ) {
        this.timetableRepository = timetableRepository;
        this.periodRepository = periodRepository;
        this.sectionRepository = sectionRepository;
        this.slotRepository = slotRepository;
        this.subjectRepository = subjectRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.roomRepository = roomRepository;
        this.overrideRepository = overrideRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.timetableViewService = timetableViewService;
        this.excelExporter = excelExporter;
        this.pdfExporter = pdfExporter;
        this.icsExporter = icsExporter;
    }

    public TimetableExportService(
            TimetableRepository timetableRepository,
            TimetablePeriodRepository periodRepository,
            TimetableSectionRepository sectionRepository,
            TimetableSlotRepository slotRepository,
            TimetableSubjectRepository subjectRepository,
            FacultyProfileRepository facultyProfileRepository,
            TimetableRoomRepository roomRepository,
            TimetableOverrideRepository overrideRepository,
            TimetableViewService timetableViewService,
            ExcelTimetableExporter excelExporter,
            PdfTimetableExporter pdfExporter,
            IcsTimetableExporter icsExporter
    ) {
        this(timetableRepository, periodRepository, sectionRepository, slotRepository,
                subjectRepository, facultyProfileRepository, roomRepository, overrideRepository,
                null, timetableViewService, excelExporter, pdfExporter, icsExporter);
    }

    @Transactional(readOnly = true)
    public byte[] exportManagement(Long timetableId, String format, String scope) throws Exception {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found with ID: " + timetableId));

        TimetableDto meta = TimetableDtoMapper.toDto(timetable);
        List<PeriodDto> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(timetableId).stream()
                .map(TimetableDtoMapper::toDto).toList();
        List<SectionDto> sections = sectionRepository.findByTimetableId(timetableId).stream()
                .map(TimetableDtoMapper::toDto).toList();

        List<TimetableSlot> entities = slotRepository.findByTimetableId(timetableId);
        List<SlotDto> slots = entities.stream().map(TimetableDtoMapper::toDto).collect(Collectors.toList());

        // Apply Scope Filter
        String scopeHeader = "Master Schedule";
        if (scope != null && !scope.isBlank() && !scope.equalsIgnoreCase("all")) {
            String lower = scope.toLowerCase().trim();
            if (lower.startsWith("section:")) {
                String sec = scope.substring(8).trim();
                slots = slots.stream().filter(s -> sec.equalsIgnoreCase(s.getSectionName())).toList();
                scopeHeader = "Section " + sec;
            } else if (lower.startsWith("group:")) {
                String grp = scope.substring(6).trim();
                slots = slots.stream().filter(s -> grp.equalsIgnoreCase(s.getLabGroupCode())).toList();
                scopeHeader = "Group " + grp;
            } else if (lower.startsWith("faculty:")) {
                Long facId = Long.parseLong(scope.substring(8).trim());
                FacultyProfile fp = facultyProfileRepository.findById(facId).orElse(null);
                String facName = fp != null ? fp.getFullName() : "Faculty " + facId;
                slots = slots.stream().filter(s -> s.getFacultyIds() != null && s.getFacultyIds().contains(facId)).toList();
                scopeHeader = "Faculty: " + facName;
            } else if (lower.startsWith("room:")) {
                Long roomId = Long.parseLong(scope.substring(5).trim());
                TimetableRoom room = roomRepository.findById(roomId).orElse(null);
                String roomCode = room != null ? room.getCode() : "Room " + roomId;
                slots = slots.stream().filter(s -> s.getRoomId() != null && s.getRoomId().equals(roomId)).toList();
                scopeHeader = "Room: " + roomCode;
            }
        }

        List<SubjectDto> subjects = subjectRepository.findByDepartmentCode(timetable.getDepartmentCode()).stream()
                .map(TimetableDtoMapper::toDto).toList();
        List<RoomDto> rooms = roomRepository.findAll().stream()
                .map(TimetableDtoMapper::toDto).toList();
        List<FacultyResolutionDto> facultyList = facultyProfileRepository.findAll().stream()
                .map(f -> FacultyResolutionDto.builder()
                        .resolvedShortCode(f.getShortCode())
                        .resolvedFullName(f.getFullName())
                        .rawNameOrCode(f.getShortCode())
                        .normalizedName(f.getFullName())
                        .status("RESOLVED")
                        .build())
                .toList();

        // Build raw import preview for embedding in PDF
        ImportPreviewDto rawPreview = ImportPreviewDto.builder()
                .timetableMeta(meta)
                .periods(periods)
                .sections(sections)
                .slots(slots)
                .subjects(subjects)
                .faculty(facultyList)
                .rooms(rooms)
                .build();

        if ("pdf".equalsIgnoreCase(format)) {
            return pdfExporter.generatePdf(meta, periods, slots, rawPreview, scopeHeader);
        } else {
            return excelExporter.generateWorkbook(meta, periods, sections, slots, subjects, facultyList, rooms);
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportUser(User user, String format) throws Exception {
        String role = (user != null && user.getRole() != null) ? user.getRole().toLowerCase() : "student";
        List<SlotDto> slots;
        List<PeriodDto> periods;
        String title;

        if ("student".equalsIgnoreCase(role)) {
            StudentTimetableViewDto sv = timetableViewService.getStudentView(user);
            slots = (sv.getSlots() != null) ? sv.getSlots() : Collections.emptyList();
            periods = (sv.getPeriods() != null) ? sv.getPeriods() : Collections.emptyList();
            title = "Student Schedule (" + (sv.getSectionName() != null ? sv.getSectionName() : "") +
                    (sv.getLabGroupCode() != null ? " " + sv.getLabGroupCode() : "") + ")";
        } else {
            TeacherTimetableViewDto tv = timetableViewService.getTeacherView(user);
            slots = (tv.getSlots() != null) ? tv.getSlots() : Collections.emptyList();
            periods = (tv.getPeriods() != null) ? tv.getPeriods() : Collections.emptyList();
            title = "Teaching Grid (" + (tv.getFacultyProfile() != null ? tv.getFacultyProfile().getFullName() : user.getName()) + ")";
        }

        List<Long> slotIds = slots.stream().map(SlotDto::getId).filter(Objects::nonNull).toList();
        List<TimetableOverride> cancelOverrides = Collections.emptyList();
        if (!slotIds.isEmpty()) {
            cancelOverrides = overrideRepository.findBySlotIdInAndStatus(slotIds, OverrideStatus.APPROVED).stream()
                    .filter(o -> o.getKind() == OverrideKind.CANCEL)
                    .toList();
        }

        if ("ics".equalsIgnoreCase(format)) {
            LocalDate startDate = LocalDate.now();
            LocalDate endDate = startDate.plusMonths(4);
            List<TimetableCalendarEvent> calEvents = calendarEventRepository.findOverlapping(startDate, endDate);
            String ics = icsExporter.generateIcs(title, periods, slots, startDate, endDate, cancelOverrides, calEvents);
            return ics.getBytes(StandardCharsets.UTF_8);
        } else {
            TimetableDto dummyMeta = TimetableDto.builder()
                    .academicSession("2026-27")
                    .departmentName(user != null && user.getBranch() != null ? user.getBranch() : "AI & DS")
                    .versionNo(1)
                    .status(TimetableStatus.PUBLISHED)
                    .build();
            return pdfExporter.generatePdf(dummyMeta, periods, slots, null, title);
        }
    }
}
