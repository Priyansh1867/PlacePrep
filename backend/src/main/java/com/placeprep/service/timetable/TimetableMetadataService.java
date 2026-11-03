package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableMetadataService {

    private final TimetableRepository timetableRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableLabGroupRepository labGroupRepository;
    private final TimetableSubjectRepository subjectRepository;
    private final TimetableAssignmentRepository assignmentRepository;
    private final TimetableRoomRepository roomRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableSlotRepository slotRepository;

    // --- Sections ---

    @Transactional
    public SectionDto createSection(Long timetableId, SectionDto dto) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        TimetableSection section = new TimetableSection();
        section.setTimetable(timetable);
        section.setName(dto.getName());
        if (dto.getHomeRoomId() != null) {
            section.setHomeRoom(roomRepository.findById(dto.getHomeRoomId()).orElse(null));
        }
        if (dto.getClassCoordinatorId() != null) {
            section.setClassCoordinator(facultyProfileRepository.findById(dto.getClassCoordinatorId()).orElse(null));
        }

        TimetableSection saved = sectionRepository.save(section);
        return TimetableDtoMapper.toDto(saved, Collections.emptyList());
    }

    @Transactional
    public SectionDto updateSection(Long timetableId, Long sectionId, SectionDto dto) {
        TimetableSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found: " + sectionId));

        section.setName(dto.getName());
        if (dto.getHomeRoomId() != null) {
            section.setHomeRoom(roomRepository.findById(dto.getHomeRoomId()).orElse(null));
        }
        if (dto.getClassCoordinatorId() != null) {
            section.setClassCoordinator(facultyProfileRepository.findById(dto.getClassCoordinatorId()).orElse(null));
        }

        TimetableSection saved = sectionRepository.save(section);
        List<TimetableLabGroup> groups = labGroupRepository.findBySectionIdOrderByCodeAsc(sectionId);
        return TimetableDtoMapper.toDto(saved, groups);
    }

    @Transactional
    public void deleteSection(Long timetableId, Long sectionId) {
        List<TimetableSlot> referencing = slotRepository.findBySectionId(sectionId);
        if (!referencing.isEmpty()) {
            List<Long> slotIds = referencing.stream().map(TimetableSlot::getId).collect(Collectors.toList());
            throw new ReferencedEntityException("Cannot delete Section: referenced by " + slotIds.size() + " slot(s)", slotIds);
        }

        labGroupRepository.deleteBySectionId(sectionId);
        sectionRepository.deleteById(sectionId);
    }

    // --- Lab Groups ---

    @Transactional
    public LabGroupDto createLabGroup(Long sectionId, LabGroupDto dto) {
        TimetableSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Section not found: " + sectionId));

        TimetableLabGroup group = new TimetableLabGroup();
        group.setSection(section);
        group.setCode(dto.getCode());
        if (dto.getMentorId() != null) {
            group.setMentor(facultyProfileRepository.findById(dto.getMentorId()).orElse(null));
        }

        return TimetableDtoMapper.toDto(labGroupRepository.save(group));
    }

    @Transactional
    public LabGroupDto updateLabGroup(Long sectionId, Long groupId, LabGroupDto dto) {
        TimetableLabGroup group = labGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Lab group not found: " + groupId));

        group.setCode(dto.getCode());
        if (dto.getMentorId() != null) {
            group.setMentor(facultyProfileRepository.findById(dto.getMentorId()).orElse(null));
        }

        return TimetableDtoMapper.toDto(labGroupRepository.save(group));
    }

    @Transactional
    public void deleteLabGroup(Long sectionId, Long groupId) {
        List<TimetableSlot> referencing = slotRepository.findByLabGroupId(groupId);
        if (!referencing.isEmpty()) {
            List<Long> slotIds = referencing.stream().map(TimetableSlot::getId).collect(Collectors.toList());
            throw new ReferencedEntityException("Cannot delete Lab Group: referenced by " + slotIds.size() + " slot(s)", slotIds);
        }

        labGroupRepository.deleteById(groupId);
    }

    // --- Subjects ---

    @Transactional(readOnly = true)
    public List<SubjectDto> listSubjects(String departmentCode, Integer semester) {
        List<TimetableSubject> subjects;
        if (departmentCode != null && semester != null) {
            subjects = subjectRepository.findByDepartmentCodeAndSemester(departmentCode, semester);
        } else if (departmentCode != null) {
            subjects = subjectRepository.findByDepartmentCode(departmentCode);
        } else {
            subjects = subjectRepository.findAll();
        }
        return subjects.stream().map(TimetableDtoMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public SubjectDto createSubject(SubjectDto dto) {
        TimetableSubject sub = new TimetableSubject();
        sub.setDepartmentCode(dto.getDepartmentCode());
        sub.setRtuCode(dto.getRtuCode());
        sub.setName(dto.getName());
        sub.setShortCode(dto.getShortCode());
        sub.setKind(dto.getKind() != null ? dto.getKind() : SubjectKind.THEORY);
        sub.setSemester(dto.getSemester());

        return TimetableDtoMapper.toDto(subjectRepository.save(sub));
    }

    @Transactional
    public SubjectDto updateSubject(Long subjectId, SubjectDto dto) {
        TimetableSubject sub = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));

        if (dto.getDepartmentCode() != null) sub.setDepartmentCode(dto.getDepartmentCode());
        if (dto.getRtuCode() != null) sub.setRtuCode(dto.getRtuCode());
        if (dto.getName() != null) sub.setName(dto.getName());
        if (dto.getShortCode() != null) sub.setShortCode(dto.getShortCode());
        if (dto.getKind() != null) sub.setKind(dto.getKind());
        if (dto.getSemester() != null) sub.setSemester(dto.getSemester());

        return TimetableDtoMapper.toDto(subjectRepository.save(sub));
    }

    @Transactional
    public void deleteSubject(Long subjectId) {
        List<TimetableSlot> referencing = slotRepository.findBySubjectId(subjectId);
        if (!referencing.isEmpty()) {
            List<Long> slotIds = referencing.stream().map(TimetableSlot::getId).collect(Collectors.toList());
            throw new ReferencedEntityException("Cannot delete Subject: referenced by " + slotIds.size() + " slot(s)", slotIds);
        }

        subjectRepository.deleteById(subjectId);
    }

    // --- Assignments ---

    @Transactional(readOnly = true)
    public List<AssignmentDto> listAssignments(Long timetableId, Long sectionId) {
        List<TimetableAssignment> list = sectionId != null
                ? assignmentRepository.findByTimetableIdAndSectionId(timetableId, sectionId)
                : assignmentRepository.findByTimetableId(timetableId);
        return list.stream().map(TimetableDtoMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public AssignmentDto createAssignment(Long timetableId, AssignmentDto dto) {
        Timetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found: " + timetableId));

        TimetableAssignment assignment = new TimetableAssignment();
        assignment.setTimetable(timetable);
        if (dto.getSectionId() != null) {
            assignment.setSection(sectionRepository.findById(dto.getSectionId()).orElse(null));
        }
        if (dto.getLabGroupId() != null) {
            assignment.setLabGroup(labGroupRepository.findById(dto.getLabGroupId()).orElse(null));
        }
        if (dto.getSubjectId() != null) {
            assignment.setSubject(subjectRepository.findById(dto.getSubjectId()).orElse(null));
        }
        if (dto.getFacultyIds() != null && !dto.getFacultyIds().isEmpty()) {
            assignment.setFaculty(new HashSet<>(facultyProfileRepository.findAllById(dto.getFacultyIds())));
        }

        return TimetableDtoMapper.toDto(assignmentRepository.save(assignment));
    }

    @Transactional
    public AssignmentDto updateAssignment(Long timetableId, Long assignmentId, AssignmentDto dto) {
        TimetableAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));

        if (dto.getSectionId() != null) {
            assignment.setSection(sectionRepository.findById(dto.getSectionId()).orElse(null));
        }
        if (dto.getLabGroupId() != null) {
            assignment.setLabGroup(labGroupRepository.findById(dto.getLabGroupId()).orElse(null));
        } else {
            assignment.setLabGroup(null);
        }
        if (dto.getSubjectId() != null) {
            assignment.setSubject(subjectRepository.findById(dto.getSubjectId()).orElse(null));
        }
        if (dto.getFacultyIds() != null) {
            assignment.setFaculty(new HashSet<>(facultyProfileRepository.findAllById(dto.getFacultyIds())));
        }

        return TimetableDtoMapper.toDto(assignmentRepository.save(assignment));
    }

    @Transactional
    public void deleteAssignment(Long timetableId, Long assignmentId) {
        assignmentRepository.deleteById(assignmentId);
    }

    // --- Rooms ---

    @Transactional(readOnly = true)
    public List<RoomDto> listRooms() {
        return roomRepository.findAll().stream().map(TimetableDtoMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public RoomDto createRoom(RoomDto dto) {
        TimetableRoom room = new TimetableRoom();
        room.setCode(dto.getCode().toUpperCase().trim());
        room.setDisplayName(dto.getDisplayName() != null ? dto.getDisplayName() : dto.getCode());
        room.setRoomType(dto.getRoomType() != null ? dto.getRoomType() : RoomType.CLASSROOM);
        room.setCapacity(dto.getCapacity());

        return TimetableDtoMapper.toDto(roomRepository.save(room));
    }

    @Transactional
    public RoomDto updateRoom(Long roomId, RoomDto dto) {
        TimetableRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

        if (dto.getCode() != null) room.setCode(dto.getCode().toUpperCase().trim());
        if (dto.getDisplayName() != null) room.setDisplayName(dto.getDisplayName());
        if (dto.getRoomType() != null) room.setRoomType(dto.getRoomType());
        if (dto.getCapacity() != null) room.setCapacity(dto.getCapacity());

        return TimetableDtoMapper.toDto(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Long roomId) {
        List<TimetableSlot> referencing = slotRepository.findByRoomId(roomId);
        if (!referencing.isEmpty()) {
            List<Long> slotIds = referencing.stream().map(TimetableSlot::getId).collect(Collectors.toList());
            throw new ReferencedEntityException("Cannot delete Room: referenced by " + slotIds.size() + " slot(s)", slotIds);
        }

        roomRepository.deleteById(roomId);
    }

    // --- Faculty Profiles ---

    @Transactional(readOnly = true)
    public List<FacultyProfileDto> listFacultyProfiles(String departmentCode) {
        List<FacultyProfile> list = (departmentCode != null && !departmentCode.trim().isEmpty())
                ? facultyProfileRepository.findByDepartmentCodeAndActiveTrue(departmentCode.trim())
                : facultyProfileRepository.findAll();
        return list.stream().map(TimetableDtoMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public FacultyProfileDto createFacultyProfile(FacultyProfileDto dto) {
        FacultyProfile profile = new FacultyProfile();
        profile.setShortCode(dto.getShortCode().toUpperCase().trim());
        profile.setFullName(dto.getFullName());
        profile.setDepartmentCode(dto.getDepartmentCode() != null ? dto.getDepartmentCode() : "AIDS");
        profile.setEmail(dto.getEmail());
        profile.setActive(dto.getActive() != null ? dto.getActive() : true);

        return TimetableDtoMapper.toDto(facultyProfileRepository.save(profile));
    }

    @Transactional
    public FacultyProfileDto updateFacultyProfile(Long id, FacultyProfileDto dto) {
        FacultyProfile profile = facultyProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Faculty profile not found: " + id));

        if (dto.getShortCode() != null) profile.setShortCode(dto.getShortCode().toUpperCase().trim());
        if (dto.getFullName() != null) profile.setFullName(dto.getFullName());
        if (dto.getDepartmentCode() != null) profile.setDepartmentCode(dto.getDepartmentCode());
        if (dto.getEmail() != null) profile.setEmail(dto.getEmail());
        if (dto.getActive() != null) profile.setActive(dto.getActive());

        return TimetableDtoMapper.toDto(facultyProfileRepository.save(profile));
    }

    @Transactional
    public void deleteFacultyProfile(Long id) {
        List<TimetableSlot> referencing = slotRepository.findByFacultyId(id);
        if (!referencing.isEmpty()) {
            List<Long> slotIds = referencing.stream().map(TimetableSlot::getId).collect(Collectors.toList());
            throw new ReferencedEntityException("Cannot delete Faculty Profile: referenced by " + slotIds.size() + " slot(s)", slotIds);
        }

        facultyProfileRepository.deleteById(id);
    }
}

