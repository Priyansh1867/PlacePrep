package com.placeprep.service;

import com.placeprep.dto.MasterTimetableDto;
import com.placeprep.dto.TimetableStatsDto;
import com.placeprep.exception.BadRequestException;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.MasterTimetable;
import com.placeprep.model.TimetableVersion;
import com.placeprep.repository.MasterTimetableRepository;
import com.placeprep.repository.TimetableVersionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class MasterTimetableService {

    private static final Logger log = LoggerFactory.getLogger(MasterTimetableService.class);
    private static final String UPLOAD_DIR = "uploads/timetables";

    @Autowired
    private MasterTimetableRepository timetableRepository;

    @Autowired
    private TimetableVersionRepository versionRepository;

    public MasterTimetableService() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            log.warn("Could not create local upload directory: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public TimetableStatsDto getStats() {
        long total = timetableRepository.count();
        long published = timetableRepository.countByStatus("PUBLISHED");
        long draft = timetableRepository.countByStatus("DRAFT");
        long archived = timetableRepository.countByStatus("ARCHIVED");
        LocalDateTime lastUpdated = timetableRepository.findTopByOrderByLastUpdatedDesc()
                .map(MasterTimetable::getLastUpdated)
                .orElse(LocalDateTime.now());

        return TimetableStatsDto.builder()
                .totalTimetables(total)
                .publishedTimetables(published)
                .draftTimetables(draft)
                .archivedTimetables(archived)
                .lastUpdated(lastUpdated)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<MasterTimetableDto> getAllTimetables(
            String search,
            String academicSession,
            String branch,
            String semester,
            String year,
            String section,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Page<MasterTimetable> pageResult = timetableRepository.findWithFilters(
                search != null ? search.trim() : null,
                academicSession != null ? academicSession.trim() : null,
                branch != null ? branch.trim() : null,
                semester != null ? semester.trim() : null,
                year != null ? year.trim() : null,
                section != null ? section.trim() : null,
                status != null ? status.trim() : null,
                pageable
        );

        return pageResult.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public MasterTimetableDto getTimetableById(Long id) {
        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));
        return toDtoWithVersions(timetable);
    }

    public MasterTimetableDto createTimetable(MasterTimetableDto dto, MultipartFile file, String uploaderEmail) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Timetable title is required.");
        }
        if (dto.getAcademicSession() == null || dto.getAcademicSession().trim().isEmpty()) {
            throw new BadRequestException("Academic session is required.");
        }
        if (dto.getDepartment() == null || dto.getDepartment().trim().isEmpty()) {
            throw new BadRequestException("Department is required.");
        }
        if (dto.getSemester() == null || dto.getSemester().trim().isEmpty()) {
            throw new BadRequestException("Semester is required.");
        }
        if (dto.getAcademicYear() == null || dto.getAcademicYear().trim().isEmpty()) {
            throw new BadRequestException("Academic year is required.");
        }
        if (dto.getSection() == null || dto.getSection().trim().isEmpty()) {
            dto.setSection("All Sections");
        }

        MasterTimetable timetable = new MasterTimetable();
        timetable.setTitle(dto.getTitle().trim());
        timetable.setAcademicSession(dto.getAcademicSession().trim());
        timetable.setDepartment(dto.getDepartment().trim());
        timetable.setBranch(dto.getBranch() != null ? dto.getBranch().trim() : inferBranch(dto.getDepartment()));
        timetable.setSemester(dto.getSemester().trim());
        timetable.setAcademicYear(dto.getAcademicYear().trim());
        timetable.setSection(dto.getSection().trim());
        timetable.setEffectiveStartDate(dto.getEffectiveStartDate());
        timetable.setEffectiveEndDate(dto.getEffectiveEndDate());
        timetable.setDescription(dto.getDescription());
        timetable.setStatus(dto.getStatus() != null && !dto.getStatus().isBlank() ? dto.getStatus().toUpperCase() : "DRAFT");
        timetable.setVersion(1);
        timetable.setUploadedBy(uploaderEmail != null ? uploaderEmail : "management@placeprep.com");
        timetable.setUploadedAt(LocalDateTime.now());
        timetable.setLastUpdated(LocalDateTime.now());
        timetable.setLastUpdatedBy(uploaderEmail != null ? uploaderEmail : "management@placeprep.com");

        if (file != null && !file.isEmpty()) {
            validateFileType(file);
            saveFileToEntity(timetable, file);
        }

        MasterTimetable saved = timetableRepository.save(timetable);

        // Create Version 1 snapshot
        if (file != null && !file.isEmpty()) {
            TimetableVersion version = new TimetableVersion();
            version.setTimetable(saved);
            version.setVersionNumber(1);
            version.setFileName(saved.getFileName());
            version.setFileType(saved.getFileType());
            version.setFileSize(saved.getFileSize());
            version.setFilePath(saved.getFilePath());
            version.setFileBase64(saved.getFileBase64());
            version.setChangeSummary("Initial upload of timetable document");
            version.setUploadedBy(saved.getUploadedBy());
            version.setUploadedAt(saved.getUploadedAt());
            versionRepository.save(version);
        }

        return toDto(saved);
    }

    public MasterTimetableDto updateMetadata(Long id, MasterTimetableDto dto, String updaterEmail) {
        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) timetable.setTitle(dto.getTitle().trim());
        if (dto.getAcademicSession() != null && !dto.getAcademicSession().isBlank()) timetable.setAcademicSession(dto.getAcademicSession().trim());
        if (dto.getDepartment() != null && !dto.getDepartment().isBlank()) timetable.setDepartment(dto.getDepartment().trim());
        if (dto.getBranch() != null && !dto.getBranch().isBlank()) timetable.setBranch(dto.getBranch().trim());
        if (dto.getSemester() != null && !dto.getSemester().isBlank()) timetable.setSemester(dto.getSemester().trim());
        if (dto.getAcademicYear() != null && !dto.getAcademicYear().isBlank()) timetable.setAcademicYear(dto.getAcademicYear().trim());
        if (dto.getSection() != null && !dto.getSection().isBlank()) timetable.setSection(dto.getSection().trim());
        if (dto.getEffectiveStartDate() != null) timetable.setEffectiveStartDate(dto.getEffectiveStartDate());
        if (dto.getEffectiveEndDate() != null) timetable.setEffectiveEndDate(dto.getEffectiveEndDate());
        if (dto.getDescription() != null) timetable.setDescription(dto.getDescription());

        timetable.setLastUpdated(LocalDateTime.now());
        timetable.setLastUpdatedBy(updaterEmail != null ? updaterEmail : "management@placeprep.com");

        MasterTimetable saved = timetableRepository.save(timetable);
        return toDto(saved);
    }

    public MasterTimetableDto replaceFile(Long id, MultipartFile file, String changeSummary, String updaterEmail) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid timetable file to replace the current document.");
        }
        validateFileType(file);

        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));

        int newVersionNumber = (timetable.getVersion() != null ? timetable.getVersion() : 1) + 1;
        timetable.setVersion(newVersionNumber);

        saveFileToEntity(timetable, file);
        timetable.setLastUpdated(LocalDateTime.now());
        timetable.setLastUpdatedBy(updaterEmail != null ? updaterEmail : "management@placeprep.com");

        MasterTimetable saved = timetableRepository.save(timetable);

        // Record version history
        TimetableVersion version = new TimetableVersion();
        version.setTimetable(saved);
        version.setVersionNumber(newVersionNumber);
        version.setFileName(saved.getFileName());
        version.setFileType(saved.getFileType());
        version.setFileSize(saved.getFileSize());
        version.setFilePath(saved.getFilePath());
        version.setFileBase64(saved.getFileBase64());
        version.setChangeSummary(changeSummary != null && !changeSummary.isBlank() ? changeSummary : "Replaced timetable document (v" + newVersionNumber + ")");
        version.setUploadedBy(updaterEmail != null ? updaterEmail : "management@placeprep.com");
        version.setUploadedAt(LocalDateTime.now());
        versionRepository.save(version);

        return toDtoWithVersions(saved);
    }

    public MasterTimetableDto publishTimetable(Long id, String updaterEmail) {
        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));

        if (timetable.getFileName() == null || (timetable.getFileBase64() == null && timetable.getFilePath() == null)) {
            throw new BadRequestException("Cannot publish an incomplete timetable record without an uploaded document.");
        }

        timetable.setStatus("PUBLISHED");
        timetable.setLastUpdated(LocalDateTime.now());
        timetable.setLastUpdatedBy(updaterEmail != null ? updaterEmail : "management@placeprep.com");
        return toDto(timetableRepository.save(timetable));
    }

    public MasterTimetableDto unpublishTimetable(Long id, String updaterEmail) {
        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));

        timetable.setStatus("DRAFT");
        timetable.setLastUpdated(LocalDateTime.now());
        timetable.setLastUpdatedBy(updaterEmail != null ? updaterEmail : "management@placeprep.com");
        return toDto(timetableRepository.save(timetable));
    }

    public MasterTimetableDto archiveTimetable(Long id, String updaterEmail) {
        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));

        timetable.setStatus("ARCHIVED");
        timetable.setLastUpdated(LocalDateTime.now());
        timetable.setLastUpdatedBy(updaterEmail != null ? updaterEmail : "management@placeprep.com");
        return toDto(timetableRepository.save(timetable));
    }

    public void deleteTimetable(Long id) {
        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));

        // Delete physical file if exists
        if (timetable.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(timetable.getFilePath()));
            } catch (IOException e) {
                log.warn("Could not delete physical file {}: {}", timetable.getFilePath(), e.getMessage());
            }
        }

        timetableRepository.delete(timetable);
    }

    @Transactional(readOnly = true)
    public List<MasterTimetableDto.TimetableVersionDto> getVersionHistory(Long timetableId) {
        if (!timetableRepository.existsById(timetableId)) {
            throw new ResourceNotFoundException("Master Timetable not found with ID: " + timetableId);
        }
        List<TimetableVersion> versions = versionRepository.findByTimetableIdOrderByVersionNumberDesc(timetableId);
        return versions.stream().map(v -> MasterTimetableDto.TimetableVersionDto.builder()
                .id(v.getId())
                .versionNumber(v.getVersionNumber())
                .fileName(v.getFileName())
                .fileType(v.getFileType())
                .fileSize(v.getFileSize())
                .changeSummary(v.getChangeSummary())
                .uploadedBy(v.getUploadedBy())
                .uploadedAt(v.getUploadedAt())
                .build()).collect(Collectors.toList());
    }

    public MasterTimetableDto restoreVersion(Long timetableId, Long versionId, String updaterEmail) {
        MasterTimetable timetable = timetableRepository.findById(timetableId)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + timetableId));

        TimetableVersion targetVersion = versionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Version not found with ID: " + versionId));

        if (!targetVersion.getTimetable().getId().equals(timetableId)) {
            throw new BadRequestException("Target version does not belong to this timetable.");
        }

        int newVersionNumber = (timetable.getVersion() != null ? timetable.getVersion() : 1) + 1;
        timetable.setVersion(newVersionNumber);
        timetable.setFileName(targetVersion.getFileName());
        timetable.setFileType(targetVersion.getFileType());
        timetable.setFileSize(targetVersion.getFileSize());
        timetable.setFilePath(targetVersion.getFilePath());
        timetable.setFileBase64(targetVersion.getFileBase64());
        timetable.setLastUpdated(LocalDateTime.now());
        timetable.setLastUpdatedBy(updaterEmail != null ? updaterEmail : "management@placeprep.com");

        MasterTimetable saved = timetableRepository.save(timetable);

        // Record this restore as a new version node
        TimetableVersion newVersionRecord = new TimetableVersion();
        newVersionRecord.setTimetable(saved);
        newVersionRecord.setVersionNumber(newVersionNumber);
        newVersionRecord.setFileName(saved.getFileName());
        newVersionRecord.setFileType(saved.getFileType());
        newVersionRecord.setFileSize(saved.getFileSize());
        newVersionRecord.setFilePath(saved.getFilePath());
        newVersionRecord.setFileBase64(saved.getFileBase64());
        newVersionRecord.setChangeSummary("Restored from historical Version " + targetVersion.getVersionNumber());
        newVersionRecord.setUploadedBy(updaterEmail != null ? updaterEmail : "management@placeprep.com");
        newVersionRecord.setUploadedAt(LocalDateTime.now());
        versionRepository.save(newVersionRecord);

        return toDtoWithVersions(saved);
    }

    @Transactional(readOnly = true)
    public byte[] getFileBytes(Long id) {
        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));

        if (timetable.getFileBase64() != null && !timetable.getFileBase64().isBlank()) {
            return Base64.getDecoder().decode(timetable.getFileBase64());
        }

        if (timetable.getFilePath() != null) {
            try {
                Path path = Paths.get(timetable.getFilePath());
                if (Files.exists(path)) {
                    return Files.readAllBytes(path);
                }
            } catch (IOException e) {
                log.error("Failed to read file from disk {}: {}", timetable.getFilePath(), e.getMessage());
            }
        }

        throw new ResourceNotFoundException("Timetable document file content is not available.");
    }

    @Transactional(readOnly = true)
    public byte[] getVersionFileBytes(Long versionId) {
        TimetableVersion version = versionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable Version not found with ID: " + versionId));

        if (version.getFileBase64() != null && !version.getFileBase64().isBlank()) {
            return Base64.getDecoder().decode(version.getFileBase64());
        }

        if (version.getFilePath() != null) {
            try {
                Path path = Paths.get(version.getFilePath());
                if (Files.exists(path)) {
                    return Files.readAllBytes(path);
                }
            } catch (IOException e) {
                log.error("Failed to read version file {}: {}", version.getFilePath(), e.getMessage());
            }
        }

        throw new ResourceNotFoundException("Version file content is not available.");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> parseTabularDataForPreview(Long id) {
        MasterTimetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master Timetable not found with ID: " + id));

        byte[] bytes = getFileBytes(id);
        String fileName = timetable.getFileName() != null ? timetable.getFileName().toLowerCase() : "";

        Map<String, Object> response = new HashMap<>();
        response.put("timetableId", id);
        response.put("title", timetable.getTitle());
        response.put("fileName", timetable.getFileName());

        List<List<String>> rows = new ArrayList<>();

        if (fileName.endsWith(".csv") || "text/csv".equalsIgnoreCase(timetable.getFileType())) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(bytes), StandardCharsets.UTF_8))) {
                String line;
                int count = 0;
                while ((line = reader.readLine()) != null && count < 100) {
                    String[] cells = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                    List<String> row = Arrays.stream(cells)
                            .map(c -> c.trim().replaceAll("^\"|\"$", ""))
                            .collect(Collectors.toList());
                    rows.add(row);
                    count++;
                }
            } catch (Exception e) {
                log.warn("Error parsing CSV for preview: {}", e.getMessage());
            }
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || (timetable.getFileType() != null && timetable.getFileType().contains("spreadsheet"))) {
            try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
                Sheet sheet = workbook.getSheetAt(0);
                response.put("sheetName", sheet.getSheetName());
                int count = 0;
                for (Row r : sheet) {
                    if (count >= 100) break;
                    List<String> row = new ArrayList<>();
                    for (int cn = 0; cn < r.getLastCellNum(); cn++) {
                        Cell c = r.getCell(cn, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                        DataFormatter formatter = new DataFormatter();
                        row.add(formatter.formatCellValue(c));
                    }
                    rows.add(row);
                    count++;
                }
            } catch (Exception e) {
                log.warn("Error parsing Excel for preview: {}", e.getMessage());
            }
        }

        response.put("rows", rows);
        response.put("rowCount", rows.size());
        response.put("isTabular", !rows.isEmpty());
        return response;
    }

    @Transactional(readOnly = true)
    public MasterTimetableDto getStudentActiveTimetable(String branch, String semester, String section) {
        List<MasterTimetable> activeList = timetableRepository.findActiveForStudent(
                branch != null ? branch.trim() : null,
                semester != null ? semester.trim() : null
        );

        if (activeList.isEmpty()) {
            // Fallback to any latest published timetable
            List<MasterTimetable> published = timetableRepository.findByStatusOrderByLastUpdatedDesc("PUBLISHED");
            if (published.isEmpty()) {
                return null;
            }
            return toDto(published.get(0));
        }

        // Check if section matches
        if (section != null && !section.isBlank()) {
            Optional<MasterTimetable> sectionMatch = activeList.stream()
                    .filter(t -> t.getSection() != null && (t.getSection().equalsIgnoreCase(section) || t.getSection().equalsIgnoreCase("All Sections")))
                    .findFirst();
            if (sectionMatch.isPresent()) {
                return toDto(sectionMatch.get());
            }
        }

        return toDto(activeList.get(0));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void validateFileType(MultipartFile file) {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        boolean valid = name.endsWith(".pdf") ||
                name.endsWith(".xlsx") ||
                name.endsWith(".xls") ||
                name.endsWith(".csv") ||
                name.endsWith(".png") ||
                name.endsWith(".jpg") ||
                name.endsWith(".jpeg") ||
                name.endsWith(".webp");

        if (!valid) {
            throw new BadRequestException("Unsupported file format. Supported formats: PDF, Excel (.xlsx, .xls), CSV, Images (PNG, JPG, WEBP).");
        }

        // Limit 25 MB
        if (file.getSize() > 25 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 25 MB limit.");
        }
    }

    private void saveFileToEntity(MasterTimetable entity, MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "timetable.pdf";
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
            String safeStorageName = "timetable_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;

            Path storagePath = Paths.get(UPLOAD_DIR, safeStorageName);
            Files.write(storagePath, bytes);

            entity.setFileName(originalName);
            entity.setFileType(file.getContentType() != null ? file.getContentType() : inferContentType(originalName));
            entity.setFileSize(file.getSize());
            entity.setFilePath(storagePath.toString());
            entity.setFileBase64(Base64.getEncoder().encodeToString(bytes));
        } catch (IOException e) {
            throw new RuntimeException("Failed to save timetable document: " + e.getMessage(), e);
        }
    }

    private String inferBranch(String department) {
        if (department == null) return "CSE";
        String lower = department.toLowerCase();
        if (lower.contains("computer") || lower.contains("cse")) return "CSE";
        if (lower.contains("information") || lower.contains("it")) return "IT";
        if (lower.contains("electronics") || lower.contains("ece")) return "ECE";
        if (lower.contains("mechanical") || lower.contains("mech")) return "MECH";
        if (lower.contains("civil")) return "CIVIL";
        return department;
    }

    private String inferContentType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
        if (lower.endsWith(".csv")) return "text/csv";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    public MasterTimetableDto toDto(MasterTimetable entity) {
        return MasterTimetableDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .academicSession(entity.getAcademicSession())
                .department(entity.getDepartment())
                .branch(entity.getBranch())
                .semester(entity.getSemester())
                .academicYear(entity.getAcademicYear())
                .section(entity.getSection())
                .effectiveStartDate(entity.getEffectiveStartDate())
                .effectiveEndDate(entity.getEffectiveEndDate())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .fileName(entity.getFileName())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .version(entity.getVersion())
                .uploadedBy(entity.getUploadedBy())
                .uploadedAt(entity.getUploadedAt())
                .lastUpdated(entity.getLastUpdated())
                .lastUpdatedBy(entity.getLastUpdatedBy())
                .versionsCount(entity.getVersions() != null ? entity.getVersions().size() : 0)
                .build();
    }

    public MasterTimetableDto toDtoWithVersions(MasterTimetable entity) {
        MasterTimetableDto dto = toDto(entity);
        if (entity.getVersions() != null) {
            dto.setVersions(entity.getVersions().stream().map(v -> MasterTimetableDto.TimetableVersionDto.builder()
                    .id(v.getId())
                    .versionNumber(v.getVersionNumber())
                    .fileName(v.getFileName())
                    .fileType(v.getFileType())
                    .fileSize(v.getFileSize())
                    .changeSummary(v.getChangeSummary())
                    .uploadedBy(v.getUploadedBy())
                    .uploadedAt(v.getUploadedAt())
                    .build()).collect(Collectors.toList()));
            dto.setVersionsCount(entity.getVersions().size());
        }
        return dto;
    }
}
