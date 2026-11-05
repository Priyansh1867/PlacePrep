package com.placeprep.service.timetable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.AuditLogService;
import com.placeprep.service.timetable.clash.ClashService;
import com.placeprep.service.timetable.clash.ConflictSeverity;
import com.placeprep.service.timetable.clash.TimetableConflict;
import com.placeprep.service.timetable.clash.TimetableHardConflictException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableManagementService {

    private final TimetableRepository timetableRepository;
    private final TimetablePeriodRepository periodRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableLabGroupRepository labGroupRepository;
    private final TimetableSubjectRepository subjectRepository;
    private final TimetableAssignmentRepository assignmentRepository;
    private final TimetableRoomRepository roomRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetableVersionRepository versionRepository;
    private final TimetableStudentGroupRepository studentGroupRepository;

    private final ClashService clashService;
    private final AuditLogService auditLogService;
    private final TimetablePublishListener publishListener;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Transactional(readOnly = true)
    public Page<TimetableDto> listTimetables(
            String session,
            Term term,
            String department,
            Integer year,
            Integer semester,
            TimetableStatus status,
            String search,
            Pageable pageable) {
        Specification<Timetable> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (session != null && !session.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("academicSession"), session.trim()));
            }
            if (term != null) {
                predicates.add(cb.equal(root.get("term"), term));
            }
            if (department != null && !department.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("departmentCode"), department.trim()));
            }
            if (year != null) {
                predicates.add(cb.equal(root.get("yearOfStudy"), year));
            }
            if (semester != null) {
                predicates.add(cb.equal(root.get("semester"), semester));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String likePattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), likePattern),
                        cb.like(cb.lower(root.get("departmentCode")), likePattern),
                        cb.like(cb.lower(root.get("departmentName")), likePattern)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return timetableRepository.findAll(spec, pageable).map(TimetableDtoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public TimetableDto getTimetableGrid(Long id) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

        TimetableDto dto = TimetableDtoMapper.toDto(t);

        List<PeriodDto> periods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(id).stream()
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toList());
        dto.setPeriods(periods);

        List<TimetableSection> sections = sectionRepository.findByTimetableIdOrderByNameAsc(id);
        List<SectionDto> sectionDtos = new ArrayList<>();
        for (TimetableSection sec : sections) {
            List<TimetableLabGroup> groups = labGroupRepository.findBySectionIdOrderByCodeAsc(sec.getId());
            sectionDtos.add(TimetableDtoMapper.toDto(sec, groups));
        }
        dto.setSections(sectionDtos);

        List<SlotDto> slots = slotRepository.findByTimetableId(id).stream()
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toList());
        dto.setSlots(slots);

        return dto;
    }

    @Transactional
    public TimetableDto createTimetable(TimetableDto dto, String createdBy) {
        // Enforce uniqueness among non-ARCHIVED rows: (academic_session, term,
        // department_code, semester)
        List<Timetable> conflicts = timetableRepository.findActiveConflicts(
                dto.getAcademicSession(), dto.getTerm(), dto.getDepartmentCode(), dto.getSemester());
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("An active or draft timetable already exists for "
                    + dto.getAcademicSession() + " " + dto.getTerm() + " " + dto.getDepartmentCode()
                    + " Semester " + dto.getSemester());
        }

        Timetable t = new Timetable();
        t.setAcademicSession(dto.getAcademicSession());
        t.setTerm(dto.getTerm());
        t.setDepartmentCode(dto.getDepartmentCode());
        t.setDepartmentName(dto.getDepartmentName() != null ? dto.getDepartmentName() : dto.getDepartmentCode());
        t.setYearOfStudy(dto.getYearOfStudy() != null ? dto.getYearOfStudy() : (dto.getSemester() + 1) / 2);
        t.setSemester(dto.getSemester());
        t.setTitle(dto.getTitle() != null ? dto.getTitle()
                : (dto.getDepartmentCode() + " Sem " + dto.getSemester() + " Timetable"));
        t.setStatus(TimetableStatus.DRAFT);
        t.setVersionNo(1);
        t.setSourceType(dto.getSourceType() != null ? dto.getSourceType() : TimetableSourceType.MANUAL);
        t.setEffectiveFrom(dto.getEffectiveFrom());
        t.setEffectiveTo(dto.getEffectiveTo());
        t.setCreatedBy(createdBy);

        Timetable saved = timetableRepository.save(t);
        if (auditLogService != null) {
            auditLogService.logAction(
                    "TIMETABLE_CREATED",
                    createdBy,
                    "MANAGEMENT",
                    "tt_timetable:" + saved.getId(),
                    "Created timetable " + saved.getTitle());
        }

        // Period grid setup
        if (dto.getPeriods() != null && !dto.getPeriods().isEmpty()) {
            for (PeriodDto pd : dto.getPeriods()) {
                TimetablePeriod period = new TimetablePeriod();
                period.setTimetable(saved);
                period.setPeriodIndex(pd.getPeriodIndex());
                period.setStartTime(pd.getStartTime());
                period.setEndTime(pd.getEndTime());
                period.setIsBreak(Boolean.TRUE.equals(pd.getIsBreak()));
                period.setLabel(pd.getLabel());
                periodRepository.save(period);
            }
        } else {
            createDefaultPeriodGrid(saved);
        }

        return getTimetableGrid(saved.getId());
    }

    private void createDefaultPeriodGrid(Timetable timetable) {
        LocalTime[][] defaultTimes = new LocalTime[][] {
                { LocalTime.of(8, 0), LocalTime.of(8, 50) },
                { LocalTime.of(8, 50), LocalTime.of(9, 40) },
                { LocalTime.of(9, 40), LocalTime.of(10, 30) },
                { LocalTime.of(10, 30), LocalTime.of(11, 20) },
                { LocalTime.of(11, 20), LocalTime.of(12, 10) }, // Period 5 (lunch / break)
                { LocalTime.of(12, 10), LocalTime.of(13, 0) },
                { LocalTime.of(13, 0), LocalTime.of(13, 50) },
                { LocalTime.of(13, 50), LocalTime.of(14, 40) },
                { LocalTime.of(14, 40), LocalTime.of(15, 30) }
        };

        for (int i = 0; i < defaultTimes.length; i++) {
            TimetablePeriod period = new TimetablePeriod();
            period.setTimetable(timetable);
            period.setPeriodIndex(i + 1);
            period.setStartTime(defaultTimes[i][0]);
            period.setEndTime(defaultTimes[i][1]);
            period.setIsBreak(i == 4);
            period.setLabel(i == 4 ? "Lunch Break" : "Period " + (i + 1));
            periodRepository.save(period);
        }
    }

    @Transactional
    public TimetableDto updateTimetable(Long id, TimetableDto dto, String updatedBy) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

        // Optimistic locking
        if (dto.getVersion() != null && t.getVersion() != null && !dto.getVersion().equals(t.getVersion())) {
            throw new StaleVersionException("STALE_VERSION: Timetable has been modified by another transaction");
        }

        if (dto.getTitle() != null)
            t.setTitle(dto.getTitle());
        if (dto.getEffectiveFrom() != null)
            t.setEffectiveFrom(dto.getEffectiveFrom());
        if (dto.getEffectiveTo() != null)
            t.setEffectiveTo(dto.getEffectiveTo());
        t.setUpdatedBy(updatedBy);

        // Update periods if provided
        if (dto.getPeriods() != null && !dto.getPeriods().isEmpty()) {
            periodRepository.deleteByTimetableId(id);
            for (PeriodDto pd : dto.getPeriods()) {
                TimetablePeriod period = new TimetablePeriod();
                period.setTimetable(t);
                period.setPeriodIndex(pd.getPeriodIndex());
                period.setStartTime(pd.getStartTime());
                period.setEndTime(pd.getEndTime());
                period.setIsBreak(Boolean.TRUE.equals(pd.getIsBreak()));
                period.setLabel(pd.getLabel());
                periodRepository.save(period);
            }
        }

        Timetable saved = timetableRepository.save(t);
        if (auditLogService != null) {
            auditLogService.logAction(
                    "TIMETABLE_UPDATED",
                    updatedBy,
                    "MANAGEMENT",
                    "tt_timetable:" + saved.getId(),
                    "Updated timetable " + saved.getTitle());
        }
        return getTimetableGrid(saved.getId());
    }

    @Transactional
    public void deleteTimetable(Long id) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

        if (t.getStatus() == TimetableStatus.PUBLISHED) {
            throw new IllegalStateException("A PUBLISHED timetable cannot be deleted. Archive it first.");
        }

        slotRepository.deleteByTimetableId(id);
        assignmentRepository.deleteByTimetableId(id);
        studentGroupRepository.deleteByTimetableId(id);

        List<TimetableSection> sections = sectionRepository.findByTimetableIdOrderByNameAsc(id);
        for (TimetableSection sec : sections) {
            labGroupRepository.deleteBySectionId(sec.getId());
        }
        sectionRepository.deleteByTimetableId(id);
        periodRepository.deleteByTimetableId(id);
        versionRepository.deleteByTimetableId(id);

        timetableRepository.delete(t);
    }

    @Transactional
    public TimetableDto cloneTimetable(Long id, String targetSession, Integer targetSemester, String createdBy) {
        Timetable source = timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

        String session = targetSession != null ? targetSession : source.getAcademicSession();
        Integer semester = targetSemester != null ? targetSemester : source.getSemester();

        List<Timetable> conflicts = timetableRepository.findActiveConflicts(
                session, source.getTerm(), source.getDepartmentCode(), semester);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("An active timetable already exists for " + session + " Sem " + semester);
        }

        Timetable clone = new Timetable();
        clone.setAcademicSession(session);
        clone.setTerm(source.getTerm());
        clone.setDepartmentCode(source.getDepartmentCode());
        clone.setDepartmentName(source.getDepartmentName());
        clone.setYearOfStudy((semester + 1) / 2);
        clone.setSemester(semester);
        clone.setTitle("Clone of " + source.getTitle());
        clone.setStatus(TimetableStatus.DRAFT);
        clone.setVersionNo(1);
        clone.setSourceType(source.getSourceType());
        clone.setCreatedBy(createdBy);

        Timetable savedClone = timetableRepository.save(clone);

        // Copy periods
        List<TimetablePeriod> sourcePeriods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(id);
        for (TimetablePeriod sp : sourcePeriods) {
            TimetablePeriod np = new TimetablePeriod();
            np.setTimetable(savedClone);
            np.setPeriodIndex(sp.getPeriodIndex());
            np.setStartTime(sp.getStartTime());
            np.setEndTime(sp.getEndTime());
            np.setIsBreak(sp.getIsBreak());
            np.setLabel(sp.getLabel());
            periodRepository.save(np);
        }

        // Copy sections & lab groups
        Map<Long, TimetableSection> sectionMap = new HashMap<>();
        Map<Long, TimetableLabGroup> labGroupMap = new HashMap<>();
        List<TimetableSection> sourceSections = sectionRepository.findByTimetableIdOrderByNameAsc(id);
        for (TimetableSection sec : sourceSections) {
            TimetableSection nsec = new TimetableSection();
            nsec.setTimetable(savedClone);
            nsec.setName(sec.getName());
            nsec.setHomeRoom(sec.getHomeRoom());
            nsec.setClassCoordinator(sec.getClassCoordinator());
            TimetableSection savedSec = sectionRepository.save(nsec);
            sectionMap.put(sec.getId(), savedSec);

            List<TimetableLabGroup> groups = labGroupRepository.findBySectionIdOrderByCodeAsc(sec.getId());
            for (TimetableLabGroup g : groups) {
                TimetableLabGroup ng = new TimetableLabGroup();
                ng.setSection(savedSec);
                ng.setCode(g.getCode());
                ng.setMentor(g.getMentor());
                TimetableLabGroup savedGroup = labGroupRepository.save(ng);
                labGroupMap.put(g.getId(), savedGroup);
            }
        }

        // Copy assignments
        List<TimetableAssignment> sourceAssignments = assignmentRepository.findByTimetableId(id);
        for (TimetableAssignment sa : sourceAssignments) {
            TimetableAssignment na = new TimetableAssignment();
            na.setTimetable(savedClone);
            na.setSection(sectionMap.get(sa.getSection().getId()));
            if (sa.getLabGroup() != null) {
                na.setLabGroup(labGroupMap.get(sa.getLabGroup().getId()));
            }
            na.setSubject(sa.getSubject());
            na.setFaculty(new HashSet<>(sa.getFaculty()));
            assignmentRepository.save(na);
        }

        // Copy slots
        List<TimetableSlot> sourceSlots = slotRepository.findByTimetableId(id);
        for (TimetableSlot ss : sourceSlots) {
            TimetableSlot ns = new TimetableSlot();
            ns.setTimetable(savedClone);
            ns.setSection(sectionMap.get(ss.getSection().getId()));
            if (ss.getLabGroup() != null) {
                ns.setLabGroup(labGroupMap.get(ss.getLabGroup().getId()));
            }
            ns.setDayOfWeek(ss.getDayOfWeek());
            ns.setStartPeriod(ss.getStartPeriod());
            ns.setSpan(ss.getSpan());
            ns.setSubject(ss.getSubject());
            ns.setRoom(ss.getRoom());
            ns.setSlotKind(ss.getSlotKind());
            ns.setCustomStart(ss.getCustomStart());
            ns.setCustomEnd(ss.getCustomEnd());
            ns.setNote(ss.getNote());
            ns.setSourceRef(ss.getSourceRef());
            ns.setFaculty(new HashSet<>(ss.getFaculty()));
            slotRepository.save(ns);
        }

        return getTimetableGrid(savedClone.getId());
    }

    @Transactional
    public TimetableDto reviseTimetable(Long id, String createdBy) {
        Timetable source = timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

        // Create new DRAFT copy with versionNo + 1
        Timetable draft = new Timetable();
        draft.setAcademicSession(source.getAcademicSession());
        draft.setTerm(source.getTerm());
        draft.setDepartmentCode(source.getDepartmentCode());
        draft.setDepartmentName(source.getDepartmentName());
        draft.setYearOfStudy(source.getYearOfStudy());
        draft.setSemester(source.getSemester());
        draft.setTitle(source.getTitle());
        draft.setStatus(TimetableStatus.DRAFT);
        draft.setVersionNo(source.getVersionNo() + 1);
        draft.setSourceType(source.getSourceType());
        draft.setEffectiveFrom(source.getEffectiveFrom());
        draft.setEffectiveTo(source.getEffectiveTo());
        draft.setCreatedBy(createdBy);

        Timetable savedDraft = timetableRepository.save(draft);

        // Copy periods, sections, groups, assignments, slots
        copyStructureAndSlots(source, savedDraft);

        return getTimetableGrid(savedDraft.getId());
    }

    private void copyStructureAndSlots(Timetable source, Timetable target) {
        // Periods
        List<TimetablePeriod> sourcePeriods = periodRepository.findByTimetableIdOrderByPeriodIndexAsc(source.getId());
        for (TimetablePeriod sp : sourcePeriods) {
            TimetablePeriod np = new TimetablePeriod();
            np.setTimetable(target);
            np.setPeriodIndex(sp.getPeriodIndex());
            np.setStartTime(sp.getStartTime());
            np.setEndTime(sp.getEndTime());
            np.setIsBreak(sp.getIsBreak());
            np.setLabel(sp.getLabel());
            periodRepository.save(np);
        }

        // Sections & Lab Groups
        Map<Long, TimetableSection> secMap = new HashMap<>();
        Map<Long, TimetableLabGroup> grpMap = new HashMap<>();
        for (TimetableSection sec : sectionRepository.findByTimetableIdOrderByNameAsc(source.getId())) {
            TimetableSection nsec = new TimetableSection();
            nsec.setTimetable(target);
            nsec.setName(sec.getName());
            nsec.setHomeRoom(sec.getHomeRoom());
            nsec.setClassCoordinator(sec.getClassCoordinator());
            TimetableSection savedSec = sectionRepository.save(nsec);
            secMap.put(sec.getId(), savedSec);

            for (TimetableLabGroup g : labGroupRepository.findBySectionIdOrderByCodeAsc(sec.getId())) {
                TimetableLabGroup ng = new TimetableLabGroup();
                ng.setSection(savedSec);
                ng.setCode(g.getCode());
                ng.setMentor(g.getMentor());
                TimetableLabGroup savedGrp = labGroupRepository.save(ng);
                grpMap.put(g.getId(), savedGrp);
            }
        }

        // Assignments
        for (TimetableAssignment sa : assignmentRepository.findByTimetableId(source.getId())) {
            TimetableAssignment na = new TimetableAssignment();
            na.setTimetable(target);
            na.setSection(secMap.get(sa.getSection().getId()));
            if (sa.getLabGroup() != null) {
                na.setLabGroup(grpMap.get(sa.getLabGroup().getId()));
            }
            na.setSubject(sa.getSubject());
            na.setFaculty(new HashSet<>(sa.getFaculty()));
            assignmentRepository.save(na);
        }

        // Slots
        for (TimetableSlot ss : slotRepository.findByTimetableId(source.getId())) {
            TimetableSlot ns = new TimetableSlot();
            ns.setTimetable(target);
            ns.setSection(secMap.get(ss.getSection().getId()));
            if (ss.getLabGroup() != null) {
                ns.setLabGroup(grpMap.get(ss.getLabGroup().getId()));
            }
            ns.setDayOfWeek(ss.getDayOfWeek());
            ns.setStartPeriod(ss.getStartPeriod());
            ns.setSpan(ss.getSpan());
            ns.setSubject(ss.getSubject());
            ns.setRoom(ss.getRoom());
            ns.setSlotKind(ss.getSlotKind());
            ns.setCustomStart(ss.getCustomStart());
            ns.setCustomEnd(ss.getCustomEnd());
            ns.setNote(ss.getNote());
            ns.setSourceRef(ss.getSourceRef());
            ns.setFaculty(new HashSet<>(ss.getFaculty()));
            slotRepository.save(ns);
        }

        // Versions
        List<TimetableVersion> sourceVersions = versionRepository.findByTimetableIdOrderByVersionNoDesc(source.getId());
        if (sourceVersions != null) {
            for (TimetableVersion sv : sourceVersions) {
                TimetableVersion nv = new TimetableVersion();
                nv.setTimetable(target);
                nv.setVersionNo(sv.getVersionNo());
                nv.setSnapshotJson(sv.getSnapshotJson());
                nv.setChangeSummary(sv.getChangeSummary());
                nv.setCreatedBy(sv.getCreatedBy());
                versionRepository.save(nv);
            }
        }

        // Student Groups
        List<TimetableStudentGroup> sourceStudentGroups = studentGroupRepository.findByTimetableId(source.getId());
        if (sourceStudentGroups != null) {
            for (TimetableStudentGroup ssg : sourceStudentGroups) {
                TimetableStudentGroup nsg = new TimetableStudentGroup();
                nsg.setTimetable(target);
                nsg.setUser(ssg.getUser());
                nsg.setRollNumber(ssg.getRollNumber());
                if (ssg.getSection() != null) {
                    nsg.setSection(secMap.get(ssg.getSection().getId()));
                }
                if (ssg.getLabGroup() != null) {
                    nsg.setLabGroup(grpMap.get(ssg.getLabGroup().getId()));
                }
                studentGroupRepository.save(nsg);
            }
        }
    }

    @Transactional
    public TimetableDto publishTimetable(Long id, String publishedBy) {
        Timetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

        // 1. Run clash engine and check for HARD conflicts
        List<TimetableConflict> conflicts = clashService.validateTimetable(id);
        List<TimetableConflict> hardConflicts = conflicts.stream()
                .filter(c -> c.getSeverity() == ConflictSeverity.HARD)
                .collect(Collectors.toList());

        if (!hardConflicts.isEmpty()) {
            throw new TimetableHardConflictException(hardConflicts);
        }

        // 2. Archive previously published timetable for the same scope
        Optional<Timetable> currentlyPublished = timetableRepository
                .findByAcademicSessionAndTermAndDepartmentCodeAndSemesterAndStatus(
                        timetable.getAcademicSession(), timetable.getTerm(),
                        timetable.getDepartmentCode(), timetable.getSemester(),
                        TimetableStatus.PUBLISHED);

        currentlyPublished.ifPresent(prev -> {
            if (!prev.getId().equals(timetable.getId())) {
                prev.setStatus(TimetableStatus.ARCHIVED);
                timetableRepository.save(prev);
                log.info("Archived previously published timetable ID {}", prev.getId());
            }
        });

        // 3. Mark this one PUBLISHED
        timetable.setStatus(TimetableStatus.PUBLISHED);
        timetable.setPublishedAt(LocalDateTime.now());
        timetable.setPublishedBy(publishedBy);
        Timetable saved = timetableRepository.save(timetable);

        // 4. Write snapshot to tt_version
        TimetableDto gridDto = getTimetableGrid(saved.getId());
        try {
            String snapshotJson = objectMapper.writeValueAsString(gridDto);
            TimetableVersion version = new TimetableVersion();
            version.setTimetable(saved);
            version.setVersionNo(saved.getVersionNo());
            version.setSnapshotJson(snapshotJson);
            version.setChangeSummary("Published version " + saved.getVersionNo());
            version.setCreatedBy(publishedBy);
            versionRepository.save(version);
        } catch (Exception e) {
            log.error("Failed to serialize timetable snapshot for versioning", e);
        }

        // 5. Write AuditLog
        if (auditLogService != null) {
            auditLogService.logAction(
                    "PUBLISH_TIMETABLE",
                    publishedBy,
                    "MANAGEMENT",
                    "tt_timetable:" + saved.getId(),
                    "Published timetable " + saved.getTitle() + " version " + saved.getVersionNo());
        }

        // 6. Call publish hook
        publishListener.onTimetablePublished(saved);
        if (publishListener instanceof PublishNotificationListener pnl) {
            gridDto.setCoverageReport(pnl.computeCoverageReport(saved));
        }

        return gridDto;

    }

    @Transactional
    public TimetableDto unpublishTimetable(Long id, String user) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

        t.setStatus(TimetableStatus.DRAFT);
        t.setPublishedAt(null);
        t.setPublishedBy(null);
        Timetable saved = timetableRepository.save(t);

        if (auditLogService != null) {
            auditLogService.logAction(
                    "UNPUBLISH_TIMETABLE",
                    user,
                    "MANAGEMENT",
                    "tt_timetable:" + saved.getId(),
                    "Unpublished timetable " + saved.getTitle());
        }

        return getTimetableGrid(saved.getId());
    }

    @Transactional
    public TimetableDto archiveTimetable(Long id, String user) {
        Timetable t = timetableRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

        t.setStatus(TimetableStatus.ARCHIVED);
        Timetable saved = timetableRepository.save(t);

        if (auditLogService != null) {
            auditLogService.logAction(
                    "ARCHIVE_TIMETABLE",
                    user,
                    "MANAGEMENT",
                    "tt_timetable:" + saved.getId(),
                    "Archived timetable " + saved.getTitle());
        }

        return getTimetableGrid(saved.getId());
    }

    @Transactional(readOnly = true)
    public List<TimetableVersionDto> getVersions(Long id) {
        return versionRepository.findByTimetableIdOrderByVersionNoDesc(id).stream()
                .map(TimetableDtoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TimetableVersionDto getVersionSnapshot(Long id, Integer versionNo) {
        TimetableVersion v = versionRepository.findByTimetableIdAndVersionNo(id, versionNo)
                .orElseThrow(
                        () -> new IllegalArgumentException("Version " + versionNo + " not found for timetable " + id));
        return TimetableDtoMapper.toDto(v);
    }

    @Transactional
    public TimetableDto restoreVersion(Long id, Integer versionNo, String user) {
        TimetableVersion v = versionRepository.findByTimetableIdAndVersionNo(id, versionNo)
                .orElseThrow(
                        () -> new IllegalArgumentException("Version " + versionNo + " not found for timetable " + id));

        if (v.getSnapshotJson() == null || v.getSnapshotJson().trim().isEmpty()) {
            throw new IllegalStateException("Version snapshot has no data to restore");
        }

        try {
            TimetableDto snapshot = objectMapper.readValue(v.getSnapshotJson(), TimetableDto.class);
            Timetable current = timetableRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Timetable not found with ID: " + id));

            // Create new DRAFT from snapshot
            Timetable restored = new Timetable();
            restored.setAcademicSession(snapshot.getAcademicSession());
            restored.setTerm(snapshot.getTerm());
            restored.setDepartmentCode(snapshot.getDepartmentCode());
            restored.setDepartmentName(snapshot.getDepartmentName());
            restored.setYearOfStudy(snapshot.getYearOfStudy());
            restored.setSemester(snapshot.getSemester());
            restored.setTitle("Restored from v" + versionNo + ": " + snapshot.getTitle());
            restored.setStatus(TimetableStatus.DRAFT);
            restored.setVersionNo(current.getVersionNo() + 1);
            restored.setSourceType(snapshot.getSourceType());
            restored.setCreatedBy(user);
            Timetable savedRestored = timetableRepository.save(restored);

            // Reconstruct periods
            if (snapshot.getPeriods() != null) {
                for (PeriodDto pd : snapshot.getPeriods()) {
                    TimetablePeriod p = new TimetablePeriod();
                    p.setTimetable(savedRestored);
                    p.setPeriodIndex(pd.getPeriodIndex());
                    p.setStartTime(pd.getStartTime());
                    p.setEndTime(pd.getEndTime());
                    p.setIsBreak(pd.getIsBreak());
                    p.setLabel(pd.getLabel());
                    periodRepository.save(p);
                }
            }

            // Reconstruct sections & groups
            Map<String, TimetableSection> secNameMap = new HashMap<>();
            Map<String, TimetableLabGroup> grpCodeMap = new HashMap<>();
            if (snapshot.getSections() != null) {
                for (SectionDto sd : snapshot.getSections()) {
                    TimetableSection sec = new TimetableSection();
                    sec.setTimetable(savedRestored);
                    sec.setName(sd.getName());
                    if (sd.getHomeRoomId() != null) {
                        sec.setHomeRoom(roomRepository.findById(sd.getHomeRoomId()).orElse(null));
                    }
                    if (sd.getClassCoordinatorId() != null) {
                        sec.setClassCoordinator(
                                facultyProfileRepository.findById(sd.getClassCoordinatorId()).orElse(null));
                    }
                    TimetableSection savedSec = sectionRepository.save(sec);
                    secNameMap.put(sec.getName(), savedSec);

                    if (sd.getLabGroups() != null) {
                        for (LabGroupDto lgd : sd.getLabGroups()) {
                            TimetableLabGroup lg = new TimetableLabGroup();
                            lg.setSection(savedSec);
                            lg.setCode(lgd.getCode());
                            if (lgd.getMentorId() != null) {
                                lg.setMentor(facultyProfileRepository.findById(lgd.getMentorId()).orElse(null));
                            }
                            TimetableLabGroup savedLg = labGroupRepository.save(lg);
                            grpCodeMap.put(savedSec.getName() + ":" + lg.getCode(), savedLg);
                        }
                    }
                }
            }

            // Reconstruct slots
            if (snapshot.getSlots() != null) {
                for (SlotDto sd : snapshot.getSlots()) {
                    TimetableSlot s = new TimetableSlot();
                    s.setTimetable(savedRestored);
                    TimetableSection sec = secNameMap.get(sd.getSectionName());
                    if (sec != null)
                        s.setSection(sec);
                    if (sd.getLabGroupCode() != null && sec != null) {
                        s.setLabGroup(grpCodeMap.get(sec.getName() + ":" + sd.getLabGroupCode()));
                    }
                    s.setDayOfWeek(sd.getDayOfWeek());
                    s.setStartPeriod(sd.getStartPeriod());
                    s.setSpan(sd.getSpan());
                    if (sd.getSubjectId() != null) {
                        s.setSubject(subjectRepository.findById(sd.getSubjectId()).orElse(null));
                    }
                    if (sd.getRoomId() != null) {
                        s.setRoom(roomRepository.findById(sd.getRoomId()).orElse(null));
                    }
                    s.setSlotKind(sd.getSlotKind());
                    s.setCustomStart(sd.getCustomStart());
                    s.setCustomEnd(sd.getCustomEnd());
                    s.setNote(sd.getNote());
                    s.setSourceRef(sd.getSourceRef());
                    if (sd.getFacultyIds() != null) {
                        Set<FacultyProfile> facultySet = new HashSet<>(
                                facultyProfileRepository.findAllById(sd.getFacultyIds()));
                        s.setFaculty(facultySet);
                    }
                    slotRepository.save(s);
                }
            }

            TimetableDto res = getTimetableGrid(savedRestored.getId());
            if (auditLogService != null) {
                auditLogService.logAction(
                        "TIMETABLE_RESTORED",
                        user,
                        "MANAGEMENT",
                        "tt_timetable:" + savedRestored.getId(),
                        "Restored timetable " + id + " to version " + versionNo);
            }
            return res;
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore version snapshot: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public TimetableDiffDto getDiff(Long id, Integer fromVersionNo, Integer toVersionNo) {
        TimetableVersion fromV = versionRepository.findByTimetableIdAndVersionNo(id, fromVersionNo)
                .orElseThrow(() -> new IllegalArgumentException("Version " + fromVersionNo + " not found"));
        TimetableVersion toV = versionRepository.findByTimetableIdAndVersionNo(id, toVersionNo)
                .orElseThrow(() -> new IllegalArgumentException("Version " + toVersionNo + " not found"));

        try {
            TimetableDto fromGrid = objectMapper.readValue(fromV.getSnapshotJson(), TimetableDto.class);
            TimetableDto toGrid = objectMapper.readValue(toV.getSnapshotJson(), TimetableDto.class);

            List<SlotDto> fromSlots = fromGrid.getSlots() != null ? fromGrid.getSlots() : Collections.emptyList();
            List<SlotDto> toSlots = toGrid.getSlots() != null ? toGrid.getSlots() : Collections.emptyList();

            List<SlotDto> added = new ArrayList<>();
            List<SlotDto> removed = new ArrayList<>();
            List<TimetableDiffDto.SlotChangeDto> modified = new ArrayList<>();

            Map<String, SlotDto> fromMap = fromSlots.stream()
                    .collect(Collectors.toMap(this::slotKey, s -> s, (s1, s2) -> s1));
            Map<String, SlotDto> toMap = toSlots.stream()
                    .collect(Collectors.toMap(this::slotKey, s -> s, (s1, s2) -> s1));

            for (Map.Entry<String, SlotDto> entry : toMap.entrySet()) {
                if (!fromMap.containsKey(entry.getKey())) {
                    added.add(entry.getValue());
                } else {
                    SlotDto before = fromMap.get(entry.getKey());
                    SlotDto after = entry.getValue();
                    String diffDesc = describeSlotDiff(before, after);
                    if (diffDesc != null) {
                        modified.add(TimetableDiffDto.SlotChangeDto.builder()
                                .before(before)
                                .after(after)
                                .changeDescription(diffDesc)
                                .build());
                    }
                }
            }

            for (Map.Entry<String, SlotDto> entry : fromMap.entrySet()) {
                if (!toMap.containsKey(entry.getKey())) {
                    removed.add(entry.getValue());
                }
            }

            return TimetableDiffDto.builder()
                    .fromVersion(fromVersionNo)
                    .toVersion(toVersionNo)
                    .addedSlots(added)
                    .removedSlots(removed)
                    .modifiedSlots(modified)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error computing timetable diff: " + e.getMessage(), e);
        }
    }

    private String slotKey(SlotDto s) {
        return (s.getSectionName() != null ? s.getSectionName() : "") + ":"
                + (s.getLabGroupCode() != null ? s.getLabGroupCode() : "ALL") + ":"
                + s.getDayOfWeek() + ":" + s.getStartPeriod();
    }

    private String describeSlotDiff(SlotDto before, SlotDto after) {
        List<String> changes = new ArrayList<>();
        if (!Objects.equals(before.getRoomCode(), after.getRoomCode())) {
            changes.add("Room changed from " + before.getRoomCode() + " to " + after.getRoomCode());
        }
        if (!Objects.equals(before.getSubjectCode(), after.getSubjectCode())) {
            changes.add("Subject changed from " + before.getSubjectCode() + " to " + after.getSubjectCode());
        }
        if (!Objects.equals(before.getFacultyNames(), after.getFacultyNames())) {
            changes.add("Faculty changed from " + before.getFacultyNames() + " to " + after.getFacultyNames());
        }
        if (!Objects.equals(before.getSpan(), after.getSpan())) {
            changes.add("Span changed from " + before.getSpan() + " to " + after.getSpan());
        }
        return changes.isEmpty() ? null : String.join(", ", changes);
    }

    @Transactional(readOnly = true)
    public TimetableStatsDto getDashboardStats() {
        List<Timetable> all = timetableRepository.findAll();
        long publishedCount = all.stream().filter(t -> t.getStatus() == TimetableStatus.PUBLISHED).count();
        long draftCount = all.stream().filter(t -> t.getStatus() == TimetableStatus.DRAFT).count();
        long archivedCount = all.stream().filter(t -> t.getStatus() == TimetableStatus.ARCHIVED).count();

        Map<String, Long> statusBreakdown = Map.of(
                "PUBLISHED", publishedCount,
                "DRAFT", draftCount,
                "ARCHIVED", archivedCount);

        // Sections without timetable: sections in DRAFT timetables or departments
        // missing published timetable
        long openClashes = 0;
        for (Timetable t : all) {
            if (t.getStatus() != TimetableStatus.ARCHIVED) {
                try {
                    openClashes += clashService.validateTimetable(t.getId()).size();
                } catch (Exception ignored) {
                }
            }
        }

        return TimetableStatsDto.builder()
                .totalTimetables(all.size())
                .activePublished(publishedCount)
                .draftCount(draftCount)
                .archivedCount(archivedCount)
                .sectionsWithoutTimetable(draftCount)
                .openClashes(openClashes)
                .pendingSubstitutions(0L)
                .statusBreakdown(statusBreakdown)
                .build();
    }
}
