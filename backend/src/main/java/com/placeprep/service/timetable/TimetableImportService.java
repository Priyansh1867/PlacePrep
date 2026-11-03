package com.placeprep.service.timetable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import com.placeprep.service.timetable.importer.ExcelTimetableParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileOutputStream;
import com.placeprep.service.AuditLogService;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableImportService {

    private static final String UPLOAD_DIR = "backend/uploads/timetables";

    private final TimetableImportJobRepository importJobRepository;
    private final ExcelTimetableParser excelParser;

    private final TimetableRepository timetableRepository;
    private final TimetablePeriodRepository periodRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableLabGroupRepository labGroupRepository;
    private final TimetableSubjectRepository subjectRepository;
    private final TimetableRoomRepository roomRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetableAssignmentRepository assignmentRepository;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private AuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Transactional
    public ImportPreviewDto uploadAndParse(
            MultipartFile file,
            String academicSession,
            Term term,
            String departmentCode,
            String uploadedBy
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No file provided for timetable import");
        }
        if (file.getSize() > 25 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 25 MB limit.");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "timetable.xlsx";
        String lowerFilename = originalFilename.toLowerCase();
        if (!lowerFilename.endsWith(".xlsx") && !lowerFilename.endsWith(".xls") && !lowerFilename.endsWith(".pdf")) {
            throw new IllegalArgumentException("Unsupported file type. Only .xlsx, .xls and .pdf files are supported (max 25 MB).");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String savedFilename = System.currentTimeMillis() + "_" + originalFilename;
            Path targetFile = uploadPath.resolve(savedFilename);

            try (InputStream in = file.getInputStream(); FileOutputStream out = new FileOutputStream(targetFile.toFile())) {
                in.transferTo(out);
            }

            // Parse file
            ImportPreviewDto preview = excelParser.parse(targetFile.toFile(), academicSession);

            if (preview.getTimetableMeta() == null) {
                TimetableDto meta = new TimetableDto();
                meta.setAcademicSession(academicSession);
                meta.setTerm(term != null ? term : Term.ODD);
                meta.setDepartmentCode(departmentCode != null ? departmentCode : "AIDS");
                preview.setTimetableMeta(meta);
            } else {
                if (academicSession != null) preview.getTimetableMeta().setAcademicSession(academicSession);
                if (term != null) preview.getTimetableMeta().setTerm(term);
                if (departmentCode != null) preview.getTimetableMeta().setDepartmentCode(departmentCode);
            }

            // Create ImportJob record
            TimetableImportJob job = new TimetableImportJob();
            job.setFileName(savedFilename);
            job.setFileType(file.getContentType() != null ? file.getContentType() : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            job.setStatus(ImportJobStatus.PARSED);
            job.setCreatedBy(uploadedBy != null ? uploadedBy : "MANAGEMENT");
            job.setReportJson(objectMapper.writeValueAsString(preview));

            TimetableImportJob savedJob = importJobRepository.save(job);
            preview.setJobId(savedJob.getId());
            log.info("Timetable import job created with ID {} for file {}", savedJob.getId(), originalFilename);

            return preview;
        } catch (Exception ex) {
            log.error("Failed to process timetable import file", ex);
            throw new RuntimeException("Error processing timetable file: " + ex.getMessage(), ex);
        }
    }

    @Transactional(readOnly = true)
    public ImportPreviewDto getImportJobPreview(Long jobId) {
        TimetableImportJob job = importJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Import job not found: " + jobId));

        try {
            return objectMapper.readValue(job.getReportJson(), ImportPreviewDto.class);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to deserialize import job preview: " + ex.getMessage(), ex);
        }
    }

    @Transactional
    public ImportPreviewDto applyResolutions(Long jobId, ImportResolutionsDto resolutions) {
        TimetableImportJob job = importJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Import job not found: " + jobId));

        try {
            ImportPreviewDto preview = objectMapper.readValue(job.getReportJson(), ImportPreviewDto.class);

            // 1. Apply Faculty Resolutions
            if (resolutions.getFacultyResolutions() != null) {
                Map<String, FacultyResolutionDto> resMap = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
                for (FacultyResolutionDto r : resolutions.getFacultyResolutions()) {
                    if (r.getRawNameOrCode() != null && !r.getRawNameOrCode().isBlank()) {
                        resMap.put(r.getRawNameOrCode().trim(), r);
                    }
                }

                if (preview.getFaculty() != null) {
                    for (FacultyResolutionDto f : preview.getFaculty()) {
                        String key = f.getRawNameOrCode() != null ? f.getRawNameOrCode().trim() : "";
                        if (resMap.containsKey(key)) {
                            FacultyResolutionDto updated = resMap.get(key);
                            f.setResolvedShortCode(updated.getResolvedShortCode());
                            f.setResolvedFullName(updated.getResolvedFullName());
                            f.setStatus("RESOLVED");
                        }
                    }
                }

                // Update slot faculty names/codes
                if (preview.getSlots() != null) {
                    for (SlotDto slot : preview.getSlots()) {
                        if (slot.getFacultyNames() != null) {
                            List<String> updatedNames = new ArrayList<>();
                            for (String fac : slot.getFacultyNames()) {
                                String key = fac != null ? fac.trim() : "";
                                if (resMap.containsKey(key)) {
                                    updatedNames.add(resMap.get(key).getResolvedFullName());
                                } else {
                                    updatedNames.add(fac);
                                }
                            }
                            slot.setFacultyNames(updatedNames);
                        }
                    }
                }
            }

            // 2. Room Aliases
            if (resolutions.getRoomAliases() != null && !resolutions.getRoomAliases().isEmpty()) {
                Map<String, String> aliasMap = resolutions.getRoomAliases();
                for (SlotDto slot : preview.getSlots()) {
                    if (slot.getRoomCode() != null && aliasMap.containsKey(slot.getRoomCode())) {
                        slot.setRoomCode(aliasMap.get(slot.getRoomCode()));
                    }
                }
            }

            // 3. Period Overrides
            if (resolutions.getPeriodOverrides() != null && !resolutions.getPeriodOverrides().isEmpty()) {
                preview.setPeriods(resolutions.getPeriodOverrides());
            }

            // 4. Slot Removals & Edits
            if (resolutions.getSlotRemovals() != null && !resolutions.getSlotRemovals().isEmpty()) {
                Set<Long> removeIds = new HashSet<>(resolutions.getSlotRemovals());
                preview.setSlots(preview.getSlots().stream()
                        .filter(s -> s.getId() == null || !removeIds.contains(s.getId()))
                        .collect(Collectors.toList()));
            }

            if (resolutions.getSlotEdits() != null) {
                Map<String, SlotDto> edits = resolutions.getSlotEdits().stream()
                        .collect(Collectors.toMap(SlotDto::getSourceRef, s -> s, (a, b) -> b));
                for (int i = 0; i < preview.getSlots().size(); i++) {
                    SlotDto existing = preview.getSlots().get(i);
                    if (existing.getSourceRef() != null && edits.containsKey(existing.getSourceRef())) {
                        SlotDto edited = edits.get(existing.getSourceRef());
                        if (edited.getConfidence() == null || edited.getConfidence() < 0.6) {
                            edited.setConfidence(1.0); // Editing or confirming raises confidence
                        }
                        preview.getSlots().set(i, edited);
                    }
                }
            }

            // Re-evaluate unresolved faculty count
            long unresolvedCount = preview.getFaculty().stream()
                    .filter(f -> "UNRESOLVED".equalsIgnoreCase(f.getStatus()))
                    .count();

            if (preview.getStats() != null) {
                preview.getStats().setUnresolvedFaculty((int) unresolvedCount);
            }

            job.setReportJson(objectMapper.writeValueAsString(preview));
            importJobRepository.save(job);

            return preview;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to apply resolutions: " + ex.getMessage(), ex);
        }
    }

    @Transactional
    public void deleteImportJob(Long jobId) {
        TimetableImportJob job = importJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Import job not found: " + jobId));

        if (job.getFileName() != null) {
            try {
                Path filePath = Paths.get(UPLOAD_DIR, job.getFileName());
                Files.deleteIfExists(filePath);
            } catch (Exception ex) {
                log.warn("Failed to delete uploaded file for job {}: {}", jobId, ex.getMessage());
            }
        }

        importJobRepository.delete(job);
    }

    @Transactional
    public List<TimetableDto> commitImportJob(Long jobId, boolean replaceExisting) {
        TimetableImportJob job = importJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Import job not found: " + jobId));

        ImportPreviewDto preview;
        try {
            preview = objectMapper.readValue(job.getReportJson(), ImportPreviewDto.class);
        } catch (Exception ex) {
            throw new RuntimeException("Corrupt import job data: " + ex.getMessage(), ex);
        }

        // 1. Validation checks: zero errors and zero unresolved faculty
        if (preview.getErrors() != null && !preview.getErrors().isEmpty()) {
            throw new IllegalStateException("Cannot commit timetable: " + preview.getErrors().size() + " parsing errors remaining");
        }

        long unresolvedCount = preview.getFaculty() != null ? preview.getFaculty().stream()
                .filter(f -> "UNRESOLVED".equalsIgnoreCase(f.getStatus()))
                .count() : 0;
        if (unresolvedCount > 0) {
            throw new IllegalStateException("Cannot commit timetable: " + unresolvedCount + " unresolved faculty remaining");
        }

        // Low confidence slots refusal
        long lowConfidenceCount = preview.getSlots() != null ? preview.getSlots().stream()
                .filter(s -> s.getConfidence() != null && s.getConfidence() < 0.6)
                .count() : 0;
        if (lowConfidenceCount > 0) {
            throw new IllegalStateException("Cannot commit timetable: " + lowConfidenceCount + " low-confidence slot(s) (<0.6) remaining. Please edit or confirm them before commit.");
        }

        String academicSession = preview.getTimetableMeta() != null && preview.getTimetableMeta().getAcademicSession() != null
                ? preview.getTimetableMeta().getAcademicSession() : "2026-27";
        Term term = preview.getTimetableMeta() != null && preview.getTimetableMeta().getTerm() != null
                ? preview.getTimetableMeta().getTerm() : Term.ODD;
        String departmentCode = preview.getTimetableMeta() != null && preview.getTimetableMeta().getDepartmentCode() != null
                ? preview.getTimetableMeta().getDepartmentCode() : "AIDS";

        // Group slots and sections by semester
        Map<Integer, List<SlotDto>> slotsBySemester = new HashMap<>();
        Pattern semPattern = Pattern.compile("(?i)(?:sem\\s*([0-9ivx]+)|([0-9ivx]+)\\s*sem)");
        for (SlotDto slot : preview.getSlots()) {
            int sem = inferSemesterFromRef(slot.getSourceRef(), semPattern);
            slotsBySemester.computeIfAbsent(sem, k -> new ArrayList<>()).add(slot);
        }

        // If no slots had semester in sourceRef, fallback to sem 5
        if (slotsBySemester.isEmpty()) {
            slotsBySemester.put(5, preview.getSlots());
        }

        // Check for existing timetables across semesters
        List<String> conflicts = new ArrayList<>();
        for (Integer sem : slotsBySemester.keySet()) {
            List<Timetable> existing = timetableRepository.findActiveConflicts(academicSession, term, departmentCode, sem);
            if (!existing.isEmpty()) {
                conflicts.add(academicSession + " " + term + " " + departmentCode + " Sem " + sem + " (ID: " + existing.get(0).getId() + ")");
            }
        }

        if (!conflicts.isEmpty() && !replaceExisting) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Timetable already exists for: " + String.join(", ", conflicts) + ". Set replaceExisting=true to overwrite.");
        }

        // Persist rooms and faculty first
        Map<String, TimetableRoom> roomCache = ensureRooms(preview.getRooms());
        Map<String, FacultyProfile> facultyCache = ensureFaculty(preview.getFaculty(), departmentCode);
        Map<String, TimetableSubject> subjectCache = ensureSubjects(preview.getSubjects(), departmentCode);

        List<TimetableDto> committedTimetables = new ArrayList<>();

        for (Map.Entry<Integer, List<SlotDto>> entry : slotsBySemester.entrySet()) {
            int sem = entry.getKey();
            List<SlotDto> semSlots = entry.getValue();

            // Archive or replace existing if replaceExisting == true
            List<Timetable> existing = timetableRepository.findActiveConflicts(academicSession, term, departmentCode, sem);
            for (Timetable exTt : existing) {
                exTt.setStatus(TimetableStatus.ARCHIVED);
                timetableRepository.save(exTt);
            }

            // Create new DRAFT Timetable
            Timetable timetable = new Timetable();
            timetable.setAcademicSession(academicSession);
            timetable.setTerm(term);
            timetable.setDepartmentCode(departmentCode);
            timetable.setDepartmentName("Artificial Intelligence & Data Science");
            timetable.setYearOfStudy((sem + 1) / 2);
            timetable.setSemester(sem);
            timetable.setTitle(departmentCode + " Semester " + sem + " (" + academicSession + " " + term + ")");
            timetable.setStatus(TimetableStatus.DRAFT);
            timetable.setVersionNo(1);
            timetable.setSourceType(TimetableSourceType.EXCEL);
            timetable.setCreatedBy(job.getCreatedBy());

            Timetable savedTt = timetableRepository.save(timetable);

            // Save periods
            savePeriods(savedTt, preview.getPeriods());

            // Save sections and lab groups for this semester
            Map<String, TimetableSection> sectionMap = new HashMap<>();
            Map<String, TimetableLabGroup> labGroupMap = new HashMap<>();

            Set<String> semSecNames = semSlots.stream()
                    .map(SlotDto::getSectionName)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            for (String secName : semSecNames) {
                TimetableSection sec = new TimetableSection();
                sec.setTimetable(savedTt);
                sec.setName(secName);
                TimetableSection savedSec = sectionRepository.save(sec);
                sectionMap.put(secName, savedSec);

                // Lab groups for this section
                for (String grpCode : List.of(secName + "1", secName + "2")) {
                    TimetableLabGroup lg = new TimetableLabGroup();
                    lg.setSection(savedSec);
                    lg.setCode(grpCode);
                    TimetableLabGroup savedLg = labGroupRepository.save(lg);
                    labGroupMap.put(secName + ":" + grpCode, savedLg);
                }
            }

            // Save slots
            List<TimetableSlot> slotsToSave = new ArrayList<>();
            for (SlotDto sd : semSlots) {
                TimetableSlot s = new TimetableSlot();
                s.setTimetable(savedTt);
                s.setSection(sectionMap.get(sd.getSectionName()));
                if (sd.getLabGroupCode() != null) {
                    s.setLabGroup(labGroupMap.get(sd.getSectionName() + ":" + sd.getLabGroupCode()));
                }
                s.setDayOfWeek(sd.getDayOfWeek());
                s.setStartPeriod(sd.getStartPeriod());
                s.setSpan(sd.getSpan() != null ? sd.getSpan() : 1);

                if (sd.getSubjectCode() != null && subjectCache.containsKey(sd.getSubjectCode())) {
                    s.setSubject(subjectCache.get(sd.getSubjectCode()));
                } else if (sd.getSubjectName() != null && subjectCache.containsKey(sd.getSubjectName())) {
                    s.setSubject(subjectCache.get(sd.getSubjectName()));
                } else {
                    // Create minimal subject
                    TimetableSubject sub = new TimetableSubject();
                    sub.setDepartmentCode(departmentCode);
                    sub.setName(sd.getSubjectName() != null ? sd.getSubjectName() : "Unknown");
                    sub.setShortCode(sd.getSubjectCode() != null ? sd.getSubjectCode() : "SUB");
                    sub.setKind(sd.getSlotKind() == SlotKind.LAB ? SubjectKind.LAB : SubjectKind.THEORY);
                    sub.setSemester(sem);
                    sub.setRtuCode(sd.getSubjectCode() != null ? sd.getSubjectCode() : "SUB");
                    TimetableSubject savedSub = subjectRepository.save(sub);
                    subjectCache.put(sub.getShortCode(), savedSub);
                    s.setSubject(savedSub);
                }

                if (sd.getRoomCode() != null && roomCache.containsKey(sd.getRoomCode().toUpperCase())) {
                    s.setRoom(roomCache.get(sd.getRoomCode().toUpperCase()));
                }

                s.setSlotKind(sd.getSlotKind() != null ? sd.getSlotKind() : SlotKind.THEORY);
                s.setCustomStart(sd.getCustomStart());
                s.setCustomEnd(sd.getCustomEnd());
                s.setNote(sd.getNote());
                s.setSourceRef(sd.getSourceRef());

                if (sd.getFacultyNames() != null) {
                    Set<FacultyProfile> slotFac = new HashSet<>();
                    for (String fn : sd.getFacultyNames()) {
                        if (facultyCache.containsKey(fn.toLowerCase())) {
                            slotFac.add(facultyCache.get(fn.toLowerCase()));
                        }
                    }
                    s.setFaculty(slotFac);
                }

                slotsToSave.add(s);
            }
            slotRepository.saveAll(slotsToSave);

            committedTimetables.add(TimetableDtoMapper.toDto(savedTt));
        }

        job.setStatus(ImportJobStatus.COMMITTED);
        importJobRepository.save(job);
        if (auditLogService != null) {
            auditLogService.logAction(
                    "TIMETABLE_IMPORTED",
                    "MANAGEMENT",
                    "MANAGEMENT",
                    "ImportJob:" + jobId,
                    "Committed import job creating " + committedTimetables.size() + " timetables");
        }
        log.info("Committed import job {} creating {} timetables", jobId, committedTimetables.size());

        return committedTimetables;
    }

    private int inferSemesterFromRef(String ref, Pattern pattern) {
        if (ref == null) return 5;
        Matcher m = pattern.matcher(ref);
        if (m.find()) {
            String token = m.group(1) != null ? m.group(1) : m.group(2);
            token = token.trim().toUpperCase();
            if ("III".equals(token) || "3".equals(token)) return 3;
            if ("IV".equals(token) || "4".equals(token)) return 4;
            if ("V".equals(token) || "5".equals(token)) return 5;
            if ("VI".equals(token) || "6".equals(token)) return 6;
            if ("VII".equals(token) || "7".equals(token)) return 7;
            if ("VIII".equals(token) || "8".equals(token)) return 8;
        }
        return 5;
    }

    private Map<String, TimetableRoom> ensureRooms(List<RoomDto> roomDtos) {
        Map<String, TimetableRoom> map = new HashMap<>();
        for (TimetableRoom r : roomRepository.findAll()) {
            map.put(r.getCode().toUpperCase(), r);
        }
        if (roomDtos != null) {
            for (RoomDto rd : roomDtos) {
                if (rd.getCode() != null && !map.containsKey(rd.getCode().toUpperCase())) {
                    TimetableRoom r = new TimetableRoom();
                    r.setCode(rd.getCode().toUpperCase().trim());
                    r.setDisplayName(rd.getDisplayName() != null ? rd.getDisplayName() : rd.getCode());
                    r.setRoomType(rd.getRoomType() != null ? rd.getRoomType() : RoomType.CLASSROOM);
                    r.setCapacity(rd.getCapacity());
                    TimetableRoom saved = roomRepository.save(r);
                    map.put(saved.getCode().toUpperCase(), saved);
                }
            }
        }
        return map;
    }

    private Map<String, FacultyProfile> ensureFaculty(List<FacultyResolutionDto> facultyDtos, String dept) {
        Map<String, FacultyProfile> map = new HashMap<>();
        for (FacultyProfile f : facultyProfileRepository.findAll()) {
            if (f.getFullName() != null) map.put(f.getFullName().toLowerCase(), f);
            if (f.getShortCode() != null) map.put(f.getShortCode().toLowerCase(), f);
        }
        if (facultyDtos != null) {
            for (FacultyResolutionDto fd : facultyDtos) {
                String code = fd.getResolvedShortCode() != null ? fd.getResolvedShortCode() : fd.getRawNameOrCode();
                String name = fd.getResolvedFullName() != null ? fd.getResolvedFullName() : code;
                if (!map.containsKey(code.toLowerCase()) && !map.containsKey(name.toLowerCase())) {
                    FacultyProfile p = new FacultyProfile();
                    p.setShortCode(code.toUpperCase());
                    p.setFullName(name);
                    p.setDepartmentCode(dept);
                    p.setActive(true);
                    FacultyProfile saved = facultyProfileRepository.save(p);
                    map.put(saved.getShortCode().toLowerCase(), saved);
                    map.put(saved.getFullName().toLowerCase(), saved);
                    if (fd.getRawNameOrCode() != null) {
                        map.put(fd.getRawNameOrCode().toLowerCase(), saved);
                    }
                } else {
                    FacultyProfile existing = map.containsKey(code.toLowerCase()) ? map.get(code.toLowerCase()) : map.get(name.toLowerCase());
                    if (existing != null && fd.getRawNameOrCode() != null) {
                        map.put(fd.getRawNameOrCode().toLowerCase(), existing);
                    }
                }
            }
        }
        return map;
    }

    private Map<String, TimetableSubject> ensureSubjects(List<SubjectDto> subjectDtos, String dept) {
        Map<String, TimetableSubject> map = new HashMap<>();
        for (TimetableSubject s : subjectRepository.findAll()) {
            if (s.getShortCode() != null) map.put(s.getShortCode(), s);
            if (s.getName() != null) map.put(s.getName(), s);
        }
        if (subjectDtos != null) {
            for (SubjectDto sd : subjectDtos) {
                if (sd.getShortCode() != null && !map.containsKey(sd.getShortCode())) {
                    TimetableSubject s = new TimetableSubject();
                    s.setDepartmentCode(dept);
                    s.setName(sd.getName() != null ? sd.getName() : sd.getShortCode());
                    s.setShortCode(sd.getShortCode());
                    s.setKind(sd.getKind() != null ? sd.getKind() : SubjectKind.THEORY);
                    s.setSemester(sd.getSemester() != null ? sd.getSemester() : 5);
                    s.setRtuCode(sd.getRtuCode() != null ? sd.getRtuCode() : (sd.getShortCode() != null ? sd.getShortCode() : "N/A"));
                    TimetableSubject saved = subjectRepository.save(s);
                    map.put(saved.getShortCode(), saved);
                    map.put(saved.getName(), saved);
                }
            }
        }
        return map;
    }

    private void savePeriods(Timetable timetable, List<PeriodDto> periodDtos) {
        if (periodDtos != null && !periodDtos.isEmpty()) {
            List<TimetablePeriod> periodsToSave = new ArrayList<>();
            for (PeriodDto pd : periodDtos) {
                TimetablePeriod p = new TimetablePeriod();
                p.setTimetable(timetable);
                p.setPeriodIndex(pd.getPeriodIndex());
                p.setStartTime(pd.getStartTime());
                p.setEndTime(pd.getEndTime());
                p.setIsBreak(Boolean.TRUE.equals(pd.getIsBreak()));
                p.setLabel(pd.getLabel());
                periodsToSave.add(p);
            }
            periodRepository.saveAll(periodsToSave);
        }
    }
}

