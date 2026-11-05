package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public final class TimetableDtoMapper {

    private TimetableDtoMapper() {}

    public static TimetableDto toDto(Timetable t) {
        if (t == null) return null;
        return TimetableDto.builder()
                .id(t.getId())
                .academicSession(t.getAcademicSession())
                .term(t.getTerm())
                .departmentCode(t.getDepartmentCode())
                .departmentName(t.getDepartmentName())
                .yearOfStudy(t.getYearOfStudy())
                .semester(t.getSemester())
                .title(t.getTitle())
                .status(t.getStatus())
                .versionNo(t.getVersionNo())
                .effectiveFrom(t.getEffectiveFrom())
                .effectiveTo(t.getEffectiveTo())
                .sourceType(t.getSourceType())
                .publishedAt(t.getPublishedAt())
                .publishedBy(t.getPublishedBy())
                .createdBy(t.getCreatedBy())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .updatedBy(t.getUpdatedBy())
                .version(t.getVersion())
                .build();
    }

    public static PeriodDto toDto(TimetablePeriod p) {
        if (p == null) return null;
        return PeriodDto.builder()
                .id(p.getId())
                .timetableId(p.getTimetable() != null ? p.getTimetable().getId() : null)
                .periodIndex(p.getPeriodIndex())
                .startTime(p.getStartTime())
                .endTime(p.getEndTime())
                .isBreak(p.getIsBreak())
                .label(p.getLabel())
                .build();
    }

    public static SectionDto toDto(TimetableSection s) {
        return toDto(s, Collections.emptyList());
    }

    public static SectionDto toDto(TimetableSection s, List<TimetableLabGroup> groups) {
        if (s == null) return null;
        List<LabGroupDto> groupDtos = groups != null
                ? groups.stream().map(TimetableDtoMapper::toDto).collect(Collectors.toList())
                : Collections.emptyList();

        return SectionDto.builder()
                .id(s.getId())
                .timetableId(s.getTimetable() != null ? s.getTimetable().getId() : null)
                .name(s.getName())
                .homeRoomId(s.getHomeRoom() != null ? s.getHomeRoom().getId() : null)
                .homeRoomCode(s.getHomeRoom() != null ? s.getHomeRoom().getCode() : null)
                .classCoordinatorId(s.getClassCoordinator() != null ? s.getClassCoordinator().getId() : null)
                .classCoordinatorName(s.getClassCoordinator() != null ? s.getClassCoordinator().getFullName() : null)
                .labGroups(groupDtos)
                .build();
    }

    public static LabGroupDto toDto(TimetableLabGroup g) {
        if (g == null) return null;
        return LabGroupDto.builder()
                .id(g.getId())
                .sectionId(g.getSection() != null ? g.getSection().getId() : null)
                .code(g.getCode())
                .mentorId(g.getMentor() != null ? g.getMentor().getId() : null)
                .mentorName(g.getMentor() != null ? g.getMentor().getFullName() : null)
                .build();
    }

    public static SubjectDto toDto(TimetableSubject s) {
        if (s == null) return null;
        return SubjectDto.builder()
                .id(s.getId())
                .departmentCode(s.getDepartmentCode())
                .rtuCode(s.getRtuCode())
                .name(s.getName())
                .shortCode(s.getShortCode())
                .kind(s.getKind())
                .semester(s.getSemester())
                .build();
    }

    public static RoomDto toDto(TimetableRoom r) {
        if (r == null) return null;
        return RoomDto.builder()
                .id(r.getId())
                .code(r.getCode())
                .displayName(r.getDisplayName())
                .roomType(r.getRoomType())
                .capacity(r.getCapacity())
                .build();
    }

    public static FacultyProfileDto toDto(FacultyProfile f) {
        if (f == null) return null;
        return FacultyProfileDto.builder()
                .id(f.getId())
                .shortCode(f.getShortCode())
                .fullName(f.getFullName())
                .departmentCode(f.getDepartmentCode())
                .userId(f.getUser() != null ? f.getUser().getId() : null)
                .email(f.getEmail())
                .active(f.getActive())
                .build();
    }

    public static SlotDto toDto(TimetableSlot s) {
        if (s == null) return null;
        List<Long> facIds = s.getFaculty() != null
                ? s.getFaculty().stream().map(FacultyProfile::getId).collect(Collectors.toList())
                : Collections.emptyList();
        List<String> facNames = s.getFaculty() != null
                ? s.getFaculty().stream().map(f -> f.getFullName() != null ? f.getFullName() : f.getShortCode()).collect(Collectors.toList())
                : Collections.emptyList();

        return SlotDto.builder()
                .id(s.getId())
                .timetableId(s.getTimetable() != null ? s.getTimetable().getId() : null)
                .sectionId(s.getSection() != null ? s.getSection().getId() : null)
                .sectionName(s.getSection() != null ? s.getSection().getName() : null)
                .labGroupId(s.getLabGroup() != null ? s.getLabGroup().getId() : null)
                .labGroupCode(s.getLabGroup() != null ? s.getLabGroup().getCode() : null)
                .dayOfWeek(s.getDayOfWeek())
                .startPeriod(s.getStartPeriod())
                .span(s.getSpan())
                .subjectId(s.getSubject() != null ? s.getSubject().getId() : null)
                .subjectName(s.getSubject() != null ? s.getSubject().getName() : null)
                .subjectCode(s.getSubject() != null ? s.getSubject().getShortCode() : null)
                .roomId(s.getRoom() != null ? s.getRoom().getId() : null)
                .roomCode(s.getRoom() != null ? s.getRoom().getCode() : null)
                .slotKind(s.getSlotKind())
                .customStart(s.getCustomStart())
                .customEnd(s.getCustomEnd())
                .note(s.getNote())
                .sourceRef(s.getSourceRef())
                .facultyIds(facIds)
                .facultyNames(facNames)
                .version(s.getVersion())
                .build();
    }

    public static AssignmentDto toDto(TimetableAssignment a) {
        if (a == null) return null;
        List<Long> facIds = a.getFaculty() != null
                ? a.getFaculty().stream().map(FacultyProfile::getId).collect(Collectors.toList())
                : Collections.emptyList();
        List<String> facNames = a.getFaculty() != null
                ? a.getFaculty().stream().map(f -> f.getFullName() != null ? f.getFullName() : f.getShortCode()).collect(Collectors.toList())
                : Collections.emptyList();

        return AssignmentDto.builder()
                .id(a.getId())
                .timetableId(a.getTimetable() != null ? a.getTimetable().getId() : null)
                .sectionId(a.getSection() != null ? a.getSection().getId() : null)
                .sectionName(a.getSection() != null ? a.getSection().getName() : null)
                .labGroupId(a.getLabGroup() != null ? a.getLabGroup().getId() : null)
                .labGroupCode(a.getLabGroup() != null ? a.getLabGroup().getCode() : null)
                .subjectId(a.getSubject() != null ? a.getSubject().getId() : null)
                .subjectName(a.getSubject() != null ? a.getSubject().getName() : null)
                .subjectCode(a.getSubject() != null ? a.getSubject().getShortCode() : null)
                .facultyIds(facIds)
                .facultyNames(facNames)
                .build();
    }

    public static TimetableVersionDto toDto(TimetableVersion v) {
        if (v == null) return null;
        return TimetableVersionDto.builder()
                .id(v.getId())
                .timetableId(v.getTimetable() != null ? v.getTimetable().getId() : null)
                .versionNo(v.getVersionNo())
                .snapshotJson(v.getSnapshotJson())
                .sourceFileName(v.getSourceFileName())
                .sourceFilePath(v.getSourceFilePath())
                .changeSummary(v.getChangeSummary())
                .createdBy(v.getCreatedBy())
                .createdAt(v.getCreatedAt())
                .build();
    }

    public static StudentGroupDto toDto(TimetableStudentGroup sg) {
        if (sg == null) return null;
        return StudentGroupDto.builder()
                .id(sg.getId())
                .userId(sg.getUser() != null ? sg.getUser().getId() : null)
                .rollNumber(sg.getRollNumber())
                .timetableId(sg.getTimetable() != null ? sg.getTimetable().getId() : null)
                .sectionId(sg.getSection() != null ? sg.getSection().getId() : null)
                .sectionName(sg.getSection() != null ? sg.getSection().getName() : null)
                .labGroupId(sg.getLabGroup() != null ? sg.getLabGroup().getId() : null)
                .labGroupCode(sg.getLabGroup() != null ? sg.getLabGroup().getCode() : null)
                .build();
    }

    public static OverrideDto toDto(TimetableOverride o) {
        if (o == null) return null;
        return OverrideDto.builder()
                .id(o.getId())
                .slotId(o.getSlot() != null ? o.getSlot().getId() : null)
                .onDate(o.getOnDate())
                .kind(o.getKind())
                .substituteFaculty(toDto(o.getSubstituteFaculty()))
                .newRoom(toDto(o.getNewRoom()))
                .newStart(o.getNewStart())
                .newEnd(o.getNewEnd())
                .reason(o.getReason())
                .status(o.getStatus())
                .requestedBy(o.getRequestedBy())
                .decidedBy(o.getDecidedBy())
                .decidedAt(o.getDecidedAt())
                .originalSlot(toDto(o.getSlot()))
                .peerOverrideId(o.getPeerOverrideId())
                .build();
    }
}


