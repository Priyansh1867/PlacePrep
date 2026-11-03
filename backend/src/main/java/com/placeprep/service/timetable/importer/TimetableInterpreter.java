package com.placeprep.service.timetable.importer;

import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
public class TimetableInterpreter {

    private static final Pattern TITLE_PATTERN = Pattern.compile("([I|V|X]+)\\s+YEAR\\s+B\\.?Tech\\s+([I|V|X]+)\\s+Semester(?:\\s+([0-9]{4}-[0-9]{2,4}))?", Pattern.CASE_INSENSITIVE);
    private static final Pattern SECTION_HEADER_PATTERN = Pattern.compile("(?:Time-Table\\s+)?Section:\\s*([A-Za-z0-9]+)(?:\\s*\\(([^)]+)\\))?(?:\\s*(?:Venue:?|VENUE:?)\\s*(.*))?", Pattern.CASE_INSENSITIVE);
    private static final Pattern TIME_RANGE_PATTERN = Pattern.compile("(\\d{1,2}):(\\d{2})\\s*-\\s*(\\d{1,2}):(\\d{2})");
    private static final Pattern TIME_HINT_PATTERN = Pattern.compile("(?i)\\(\\s*(\\d{1,2})[:.](\\d{2})\\s*[-–—]\\s*(\\d{1,2})[:.](\\d{2})\\s*\\)");
    private static final Pattern BATCH_TAG_PATTERN = Pattern.compile("(?i)(?<=^|[\\s\\-(/])(?:[IVX]+)?([A-Z])([12])(?=$|[\\s\\-)/])");
    private static final Pattern ROOM_TOKEN_PATTERN = Pattern.compile("(?i)^(DF[Oo0]4|DF-?04|DS-?11|DS-?8|DS[135]|DT-?0?7|DT[13579]|DF-?0?5|DF[15]|BG-?16)$");


    private final Map<String, ConfirmedFacultyFixture.CanonicalFaculty> facultyByCode = new LinkedHashMap<>();
    private final Map<String, ConfirmedFacultyFixture.CanonicalFaculty> facultyByName = new LinkedHashMap<>();

    public TimetableInterpreter() {
        initFacultyRegistry();
    }

    private void initFacultyRegistry() {
        for (ConfirmedFacultyFixture.CanonicalFaculty cf : ConfirmedFacultyFixture.getKnownFaculty()) {
            facultyByCode.put(cf.shortCode().toUpperCase(), cf);
            for (String alias : cf.aliases()) {
                facultyByName.put(normalizeForMatch(alias), cf);
            }
            facultyByName.put(normalizeForMatch(cf.fullName()), cf);
        }
    }

    public ImportPreviewDto interpret(List<CellGrid> grids, String userTargetSession) {
        String targetSession = (userTargetSession != null && !userTargetSession.isBlank()) ? userTargetSession.trim() : "2026-27";

        ImportPreviewDto preview = new ImportPreviewDto();
        if (grids == null || grids.isEmpty()) {
            preview.getErrors().add(new ImportIssueDto("", "A1", "EMPTY_WORKBOOK", "Workbook contains no sheets or readable cells.", "ERROR"));
            preview.setStats(new ImportStatsDto(0, 0, 0, 0, 0, 0, 0, 0, 1, 0));
            return preview;
        }

        for (CellGrid g : grids) {
            if (g.getEmbeddedPreview() != null) {
                ImportPreviewDto ep = g.getEmbeddedPreview();
                if (ep.getSlots() != null) {
                    ep.getSlots().forEach(s -> s.setConfidence(1.0));
                }
                return ep;
            }
            if ("SCANNED_PDF".equals(g.getSheetName())) {
                preview.getErrors().add(new ImportIssueDto("", "A1", "SCANNED_PDF", "This PDF is a scan. Upload the Excel file or enter the timetable manually.", "ERROR"));
                preview.setStats(new ImportStatsDto(1, 0, 0, 0, 0, 0, 0, 0, 1, 0));
                return preview;
            }
        }

        List<CellGrid> sectionGrids = grids.stream().filter(g -> g.getKind() == SheetKind.SECTION_GRID).toList();
        List<CellGrid> labGrids = grids.stream().filter(g -> g.getKind() == SheetKind.LAB_GRID).toList();
        List<CellGrid> facultyGrids = grids.stream().filter(g -> g.getKind() == SheetKind.FACULTY_GRID).toList();
        List<CellGrid> roomGrids = grids.stream().filter(g -> g.getKind() == SheetKind.ROOM_GRID).toList();

        if (sectionGrids.isEmpty()) {
            preview.getErrors().add(new ImportIssueDto("", "A1", "NO_SECTION_SHEETS", "No section timetable grid sheets found in workbook.", "ERROR"));
            preview.setStats(new ImportStatsDto(grids.size(), 0, 0, 0, 0, 0, 0, 0, 1, 0));
            return preview;
        }

        // Global registries
        Map<String, RoomDto> roomRegistry = new LinkedHashMap<>();
        Map<String, SubjectDto> subjectRegistry = new LinkedHashMap<>();
        Map<String, FacultyResolutionDto> facultyRegistry = new LinkedHashMap<>();
        List<SectionDto> allSections = new ArrayList<>();
        List<LabGroupDto> allLabGroups = new ArrayList<>();
        List<PeriodDto> allPeriods = new ArrayList<>();
        List<SlotDto> allSlots = new ArrayList<>();
        Map<String, Integer> slotCountsPerSection = new LinkedHashMap<>();

        // 1. Process Section Grids
        for (CellGrid grid : sectionGrids) {
            parseSectionGridSheet(grid, targetSession, preview, roomRegistry, subjectRegistry, facultyRegistry,
                    allSections, allLabGroups, allPeriods, allSlots, slotCountsPerSection);
        }

        // 2. Cross-check phase (Rule 9)
        if (labGrids.isEmpty()) {
            preview.getWarnings().add(new ImportIssueDto("", "", "GROUP_ORDER_ASSUMED",
                    "No LAB room sheet found in workbook; row 1 = group 1 and row 2 = group 2 order was assumed.", "WARNING"));
        } else {
            performLabCrossCheck(labGrids.get(0), allSlots, preview);
        }

        // 3. Clash detection phase (Rule 10)
        detectClashes(allSlots, preview);

        // Deduplicate & sort periods
        List<PeriodDto> distinctPeriods = allPeriods.stream()
                .collect(Collectors.toMap(PeriodDto::getPeriodIndex, p -> p, (p1, p2) -> p1))
                .values().stream().sorted(Comparator.comparingInt(PeriodDto::getPeriodIndex)).toList();

        // Sort everything deterministically
        allSections.sort(Comparator.comparing(SectionDto::getName));
        allLabGroups.sort(Comparator.comparing(LabGroupDto::getCode));
        allSlots.sort(Comparator.comparingInt(SlotDto::getDayOfWeek)
                .thenComparingInt(SlotDto::getStartPeriod)
                .thenComparing(s -> s.getSectionName() != null ? s.getSectionName() : "")
                .thenComparing(s -> s.getLabGroupCode() != null ? s.getLabGroupCode() : ""));

        preview.getWarnings().sort(Comparator.comparing(ImportIssueDto::getSheetName).thenComparing(ImportIssueDto::getCellRef));
        preview.getErrors().sort(Comparator.comparing(ImportIssueDto::getSheetName).thenComparing(ImportIssueDto::getCellRef));
        preview.getClashes().sort(Comparator.comparing(ClashReportDto::getDay).thenComparing(c -> c.getPeriodIndex() != null ? c.getPeriodIndex() : 0));

        // Assemble stats
        ImportStatsDto stats = ImportStatsDto.builder()
                .totalSheets(grids.size())
                .totalSections(allSections.size())
                .totalLabGroups(allLabGroups.size())
                .totalSubjects(subjectRegistry.size())
                .totalRooms(roomRegistry.size())
                .totalFaculty(facultyRegistry.size())
                .totalSlots(allSlots.size())
                .totalWarnings(preview.getWarnings().size())
                .totalErrors(preview.getErrors().size())
                .totalClashes(preview.getClashes().size())
                .build();

        preview.setPeriods(distinctPeriods);
        preview.setSections(allSections);
        preview.setLabGroups(allLabGroups);
        preview.setSubjects(new ArrayList<>(subjectRegistry.values()));
        preview.setFaculty(new ArrayList<>(facultyRegistry.values()));
        preview.setRooms(new ArrayList<>(roomRegistry.values()));
        preview.setSlots(allSlots);
        preview.setStats(stats);
        preview.setSlotCountsPerSection(slotCountsPerSection);

        // Overall timetable metadata from the first section sheet
        if (!sectionGrids.isEmpty()) {
            TimetableDto meta = extractTimetableMeta(sectionGrids.get(0), targetSession);
            preview.setTimetableMeta(meta);
        }

        return preview;
    }

    private void parseSectionGridSheet(
            CellGrid grid,
            String targetSession,
            ImportPreviewDto preview,
            Map<String, RoomDto> roomRegistry,
            Map<String, SubjectDto> subjectRegistry,
            Map<String, FacultyResolutionDto> facultyRegistry,
            List<SectionDto> allSections,
            List<LabGroupDto> allLabGroups,
            List<PeriodDto> allPeriods,
            List<SlotDto> allSlots,
            Map<String, Integer> slotCountsPerSection
    ) {
        String sheetName = grid.getSheetName();

        // 1. Title, Session, Semester, Year of study
        TimetableDto meta = extractTimetableMeta(grid, targetSession);
        if (meta.getAcademicSession() != null && !meta.getAcademicSession().equalsIgnoreCase(targetSession)) {
            preview.getWarnings().add(new ImportIssueDto(
                    sheetName, "A3", "SESSION_MISMATCH",
                    String.format("Sheet title session '%s' differs from target session '%s'. Using target session.", meta.getAcademicSession(), targetSession),
                    "WARNING"
            ));
        }

        // 2. Discover section blocks
        List<CellData> sectionHeaders = grid.findCellsMatching(Pattern.compile("Time-Table\\s+Section:|Section:\\s*[A-Za-z0-9]+", Pattern.CASE_INSENSITIVE));

        for (CellData headerCell : sectionHeaders) {
            parseSingleSectionBlock(grid, headerCell, meta, preview, roomRegistry, subjectRegistry, facultyRegistry,
                    allSections, allLabGroups, allPeriods, allSlots, slotCountsPerSection);
        }
    }

    private void parseSingleSectionBlock(
            CellGrid grid,
            CellData headerCell,
            TimetableDto meta,
            ImportPreviewDto preview,
            Map<String, RoomDto> roomRegistry,
            Map<String, SubjectDto> subjectRegistry,
            Map<String, FacultyResolutionDto> facultyRegistry,
            List<SectionDto> allSections,
            List<LabGroupDto> allLabGroups,
            List<PeriodDto> allPeriods,
            List<SlotDto> allSlots,
            Map<String, Integer> slotCountsPerSection
    ) {
        String sheetName = grid.getSheetName();
        String headerText = headerCell.getText().trim();

        // Extract section name, lab groups, and venue
        String sectionName = "";
        String labGroupCodes = "";
        String venueText = "";

        Matcher secMatcher = SECTION_HEADER_PATTERN.matcher(headerText);
        if (secMatcher.find()) {
            sectionName = secMatcher.group(1).trim().toUpperCase();
            labGroupCodes = secMatcher.group(2).trim();
            venueText = secMatcher.group(3) != null ? secMatcher.group(3).trim() : "";
        } else {
            // Fallback parsing for variations like: "Time-Table Section: B (B1+B2) DT5/DT3/DFO4"
            Pattern fallback = Pattern.compile("Section:\\s*([A-Za-z0-9]+)\\s*\\(([^)]+)\\)\\s*(.*)", Pattern.CASE_INSENSITIVE);
            Matcher fm = fallback.matcher(headerText);
            if (fm.find()) {
                sectionName = fm.group(1).trim().toUpperCase();
                labGroupCodes = fm.group(2).trim();
                venueText = fm.group(3).trim();
            }
        }

        if (sectionName.isEmpty()) {
            return;
        }

        // Determine home room from venue
        String homeRoomCode = null;
        boolean multiVenue = false;
        if (!venueText.isEmpty()) {
            venueText = venueText.replace("Venue:", "").replace("VENUE:", "").trim();
            if (venueText.contains("/")) {
                multiVenue = true;
                preview.getWarnings().add(new ImportIssueDto(
                        sheetName, headerCell.getCellRef(), "MULTIPLE_HOME_ROOMS_NO_INHERITANCE",
                        String.format("Section %s venue lists multiple rooms '%s'; room will not be inherited automatically.", sectionName, venueText),
                        "WARNING"
                ));
            } else {
                homeRoomCode = normalizeRoomCode(venueText);
                roomRegistry.putIfAbsent(homeRoomCode, new RoomDto(null, homeRoomCode, homeRoomCode, RoomType.CLASSROOM, null, List.of()));
            }
        }

        // Create Section and Lab Groups
        SectionDto sectionDto = SectionDto.builder()
                .name(sectionName)
                .homeRoomCode(homeRoomCode)
                .labGroups(new ArrayList<>())
                .build();
        allSections.add(sectionDto);

        List<String> groupNames = parseLabGroupNames(labGroupCodes, sectionName);
        List<LabGroupDto> currentGroups = new ArrayList<>();
        for (String gCode : groupNames) {
            LabGroupDto lg = LabGroupDto.builder().code(gCode).build();
            sectionDto.getLabGroups().add(lg);
            allLabGroups.add(lg);
            currentGroups.add(lg);
        }

        // Find "PERIOD DAY" row below header
        int headerRow = headerCell.getRow();
        int originCol = headerCell.getCol();
        int periodDayRow = -1;

        for (int r = headerRow + 1; r <= headerRow + 3; r++) {
            CellData cd = grid.getCell(r, originCol);
            if (cd != null && cd.getText() != null && cd.getText().toUpperCase().contains("PERIOD")) {
                periodDayRow = r;
                break;
            }
        }

        if (periodDayRow == -1) {
            return; // Could not locate period row
        }

        // Parse Periods (columns right of originCol)
        Map<Integer, Integer> colToPeriodIndex = new LinkedHashMap<>();
        int pIndex = 1;
        int col = originCol + 1;

        while (col <= grid.getMaxCol()) {
            CellData pCell = grid.getCell(periodDayRow, col);
            if (pCell == null || pCell.getText() == null || pCell.getText().isBlank()) {
                break;
            }
            String pText = pCell.getText().trim();
            Matcher timeMatcher = TIME_RANGE_PATTERN.matcher(pText);
            if (timeMatcher.find()) {
                LocalTime start = LocalTime.of(Integer.parseInt(timeMatcher.group(1)), Integer.parseInt(timeMatcher.group(2)));
                LocalTime end = LocalTime.of(Integer.parseInt(timeMatcher.group(3)), Integer.parseInt(timeMatcher.group(4)));
                PeriodDto periodDto = PeriodDto.builder()
                        .periodIndex(pIndex)
                        .startTime(start)
                        .endTime(end)
                        .isBreak(false) // will be evaluated below
                        .label("Period " + pIndex)
                        .build();
                allPeriods.add(periodDto);
                colToPeriodIndex.put(col, pIndex);
                pIndex++;
                col += pCell.getColSpan();
            } else if (pText.toUpperCase().contains("PERIOD") || pText.toUpperCase().matches("^P?\\d+$") || pText.toUpperCase().matches("^[IVXLCDM]+$")) {
                LocalTime start = LocalTime.of(7 + pIndex, 30);
                LocalTime end = start.plusHours(1);
                PeriodDto periodDto = PeriodDto.builder()
                        .periodIndex(pIndex)
                        .startTime(start)
                        .endTime(end)
                        .isBreak(false)
                        .label("Period " + pIndex)
                        .build();
                allPeriods.add(periodDto);
                colToPeriodIndex.put(col, pIndex);
                pIndex++;
                col += pCell.getColSpan();
            } else {
                break;
            }
        }

        // Days rows
        int currentRow = periodDayRow + 1;
        int sectionSlotCount = 0;

        while (currentRow <= grid.getMaxRow()) {
            CellData dayCell = grid.getCell(currentRow, originCol);
            if (dayCell == null || dayCell.getText() == null || dayCell.getText().isBlank()) {
                break;
            }
            String dayText = dayCell.getText().trim().toUpperCase();
            int dayOfWeek = parseDayOfWeek(dayText);
            if (dayOfWeek == 0) {
                // Not a day cell (maybe legend has started)
                break;
            }

            int dayRowSpan = dayCell.getRowSpan();
            int row0 = currentRow;
            int row1 = (dayRowSpan >= 2) ? currentRow + 1 : currentRow;

            // Read slots across periods
            for (Map.Entry<Integer, Integer> entry : colToPeriodIndex.entrySet()) {
                int c = entry.getKey();
                int period = entry.getValue();

                // Check row 0
                CellData cell0 = grid.getCell(row0, c);
                // Check row 1
                CellData cell1 = (row1 > row0) ? grid.getCell(row1, c) : null;

                if (cell0 != null && cell0.getText() != null && !cell0.getText().isBlank()) {
                    boolean spansBothRows = (cell0.getRowSpan() >= 2);
                    String text = cell0.getText().trim();
                    boolean hasExplicitBatchTag = containsExplicitBatchTag(text);

                    if (spansBothRows && !hasExplicitBatchTag) {
                        // Whole-section class (theory)
                        SlotDto slot = parseSlotCell(cell0, sheetName, sectionName, null, dayOfWeek, period, cell0.getColSpan(),
                                homeRoomCode, multiVenue, subjectRegistry, facultyRegistry, roomRegistry, preview, meta);
                        allSlots.add(slot);
                        sectionSlotCount++;
                    } else {
                        // Group 1 slot
                        String gCode = currentGroups.size() > 0 ? currentGroups.get(0).getCode() : null;
                        if (hasExplicitBatchTag) {
                            gCode = extractBatchTagGroup(text, gCode);
                        }
                        SlotDto slot = parseSlotCell(cell0, sheetName, sectionName, gCode, dayOfWeek, period, cell0.getColSpan(),
                                homeRoomCode, multiVenue, subjectRegistry, facultyRegistry, roomRegistry, preview, meta);
                        allSlots.add(slot);
                        sectionSlotCount++;
                    }
                }

                // Check row 1 for parallel lab group (if not covered by row0 span)
                if (cell1 != null && cell1.getText() != null && !cell1.getText().isBlank() && cell1 != cell0) {
                    String gCode = currentGroups.size() > 1 ? currentGroups.get(1).getCode() : (currentGroups.size() > 0 ? currentGroups.get(0).getCode() : null);
                    String text = cell1.getText().trim();
                    if (containsExplicitBatchTag(text)) {
                        gCode = extractBatchTagGroup(text, gCode);
                    }
                    SlotDto slot = parseSlotCell(cell1, sheetName, sectionName, gCode, dayOfWeek, period, cell1.getColSpan(),
                            homeRoomCode, multiVenue, subjectRegistry, facultyRegistry, roomRegistry, preview, meta);
                        allSlots.add(slot);
                        sectionSlotCount++;
                }
            }

            currentRow += Math.max(1, dayRowSpan);
        }

        // Parse Legend below this section block
        parseLegendRows(grid, currentRow, originCol, sectionDto, preview, facultyRegistry, subjectRegistry);

        slotCountsPerSection.put(sectionName, sectionSlotCount);
    }

    SlotDto parseSlotCell(
            CellData cell,
            String sheetName,
            String sectionName,
            String groupCode,
            int dayOfWeek,
            int startPeriod,
            int span,
            String inheritedHomeRoom,
            boolean multiVenue,
            Map<String, SubjectDto> subjectRegistry,
            Map<String, FacultyResolutionDto> facultyRegistry,
            Map<String, RoomDto> roomRegistry,
            ImportPreviewDto preview,
            TimetableDto meta
    ) {
        String rawText = cell.getText().trim();
        String cellRef = cell.getCellRef();

        // 1. Time hint
        LocalTime customStart = null;
        LocalTime customEnd = null;
        Matcher thm = TIME_HINT_PATTERN.matcher(rawText);
        if (thm.find()) {
            int h1 = Integer.parseInt(thm.group(1));
            int m1 = Integer.parseInt(thm.group(2));
            int h2 = Integer.parseInt(thm.group(3));
            int m2 = Integer.parseInt(thm.group(4));
            if (h1 < 8) h1 += 12;
            if (h2 < 8) h2 += 12;
            customStart = LocalTime.of(h1, m1);
            customEnd = LocalTime.of(h2, m2);
            rawText = rawText.replace(thm.group(0), "").trim();
        }


        // Normalize text
        String normalized = rawText.replace("–", "-").replace("—", "-").replaceAll("\\s+", " ").trim();

        double slotConfidence = (cell != null) ? cell.getConfidence() : 1.0;
        if (slotConfidence < 0.6) {
            preview.getWarnings().add(new ImportIssueDto(
                    sheetName, cellRef, "AMBIGUOUS_GROUP",
                    String.format("Slot '%s' has ambiguous lab group alignment (confidence %.2f < 0.6). Please confirm in resolutions.", normalized, slotConfidence),
                    "WARNING"
            ));
        }

        // 2. Special cases
        if (normalized.toUpperCase().contains("MENTOR-MENTEE MEETING") || normalized.toUpperCase().contains("MENTOR MENTEE")) {
            Matcher m = Pattern.compile("\\(([A-Za-z0-9]+)\\)").matcher(normalized);
            String g = groupCode;
            if (m.find()) {
                g = m.group(1).trim().toUpperCase();
            }
            return SlotDto.builder()
                    .sectionName(sectionName)
                    .labGroupCode(g)
                    .dayOfWeek(dayOfWeek)
                    .startPeriod(startPeriod)
                    .span(span)
                    .subjectName("Mentor-Mentee Meeting")
                    .subjectCode("MENTOR_MEETING")
                    .slotKind(SlotKind.MENTOR_MEETING)
                    .customStart(customStart)
                    .customEnd(customEnd)
                    .sourceRef(sheetName + "!" + cellRef)
                    .confidence(slotConfidence)
                    .build();
        }

        // 3. Grammar token parsing
        String[] tokens = normalized.split("-");
        List<String> cleanedTokens = new ArrayList<>();
        for (String t : tokens) {
            String ct = t.trim();
            if (!ct.isEmpty()) cleanedTokens.add(ct);
        }

        String subjectToken = "";
        String batchToken = "";
        String roomToken = "";
        String facultyToken = "";
        List<String> unknownTokens = new ArrayList<>();

        // Longest matching subject or first token
        if (!cleanedTokens.isEmpty()) {
            subjectToken = cleanedTokens.get(0);
        }

        for (int i = 1; i < cleanedTokens.size(); i++) {
            String token = cleanedTokens.get(i);
            Matcher rm = ROOM_TOKEN_PATTERN.matcher(token);
            Matcher bm = BATCH_TAG_PATTERN.matcher(token);

            if (rm.matches()) {
                roomToken = normalizeRoomCode(token);
            } else if (bm.matches() && token.length() <= 5 && !isFacultyCode(token)) {
                batchToken = token;
            } else if (isFacultyToken(token)) {
                facultyToken = token;
            } else {
                unknownTokens.add(token);
            }
        }

        if (!batchToken.isEmpty()) {
            Matcher bm = BATCH_TAG_PATTERN.matcher(batchToken);
            if (bm.find()) {
                groupCode = bm.group(1).toUpperCase() + bm.group(2);
            }
        }

        // Room inheritance

        String finalRoom = null;
        if (!roomToken.isEmpty()) {
            finalRoom = roomToken;
            roomRegistry.putIfAbsent(finalRoom, new RoomDto(null, finalRoom, finalRoom, RoomType.CLASSROOM, null, List.of()));
        } else if (!multiVenue && inheritedHomeRoom != null) {
            finalRoom = inheritedHomeRoom;
        }

        // Slot Kind
        SlotKind kind = SlotKind.THEORY;
        String upperSub = subjectToken.toUpperCase();
        if (upperSub.contains("LAB") || upperSub.contains("PRACTICAL")) {
            kind = SlotKind.LAB;
        } else if (upperSub.contains("FOUNDATION")) {
            kind = SlotKind.FOUNDATION;
        } else if (upperSub.contains("SEMINAR")) {
            kind = SlotKind.SEMINAR;
        } else if (upperSub.contains("TRAINING")) {
            kind = SlotKind.TRAINING;
        }

        // Register subject
        subjectRegistry.putIfAbsent(subjectToken, SubjectDto.builder()
                .name(subjectToken)
                .shortCode(subjectToken)
                .kind(kind == SlotKind.LAB ? SubjectKind.LAB : SubjectKind.THEORY)
                .semester(meta.getSemester())
                .departmentCode(meta.getDepartmentCode())
                .build());

        // Faculty resolution
        List<String> resolvedFacultyNames = new ArrayList<>();
        if (!facultyToken.isEmpty()) {
            FacultyResolutionDto fr = resolveFaculty(facultyToken);
            facultyRegistry.putIfAbsent(fr.getNormalizedName(), fr);
            resolvedFacultyNames.add(fr.getResolvedFullName() != null ? fr.getResolvedFullName() : fr.getRawNameOrCode());
        }

        // Unknown tokens warning
        String note = null;
        if (!unknownTokens.isEmpty()) {
            note = String.join(", ", unknownTokens);
            preview.getWarnings().add(new ImportIssueDto(
                    sheetName, cellRef, "UNRESOLVED_TOKEN",
                    String.format("Cell '%s' contains unrecognized token(s): %s", normalized, note),
                    "WARNING"
            ));
        }

        return SlotDto.builder()
                .sectionName(sectionName)
                .labGroupCode(groupCode)
                .dayOfWeek(dayOfWeek)
                .startPeriod(startPeriod)
                .span(span)
                .subjectName(subjectToken)
                .subjectCode(subjectToken)
                .roomCode(finalRoom)
                .slotKind(kind)
                .customStart(customStart)
                .customEnd(customEnd)
                .facultyNames(resolvedFacultyNames)
                .sourceRef(sheetName + "!" + cellRef)
                .note(note)
                .confidence(slotConfidence)
                .build();
    }

    private void parseLegendRows(
            CellGrid grid,
            int startRow,
            int originCol,
            SectionDto sectionDto,
            ImportPreviewDto preview,
            Map<String, FacultyResolutionDto> facultyRegistry,
            Map<String, SubjectDto> subjectRegistry
    ) {
        String sheetName = grid.getSheetName();
        for (int r = startRow; r <= Math.min(startRow + 25, grid.getMaxRow()); r++) {
            CellData c0 = grid.getCell(r, originCol);
            CellData c4 = grid.getCell(r, originCol + 4);

            String t0 = (c0 != null && c0.getText() != null) ? c0.getText().trim() : "";
            String t4 = (c4 != null && c4.getText() != null) ? c4.getText().trim() : "";

            // Check CLASS COORDINATOR
            for (String text : List.of(t0, t4)) {
                if (text.toUpperCase().contains("CLASS COORDINATOR")) {
                    String coord = text.replaceFirst("(?i)CLASS\\s+COORDINATOR\\s*-?\\s*", "").trim();
                    FacultyResolutionDto fr = resolveFaculty(coord);
                    sectionDto.setClassCoordinatorName(fr.getResolvedFullName() != null ? fr.getResolvedFullName() : fr.getRawNameOrCode());
                    facultyRegistry.putIfAbsent(fr.getNormalizedName(), fr);
                }
                if (text.toUpperCase().contains("MENTOR")) {
                    // Extract mentors for lab groups
                    Pattern mp = Pattern.compile("(?i)MENTOR\\s+([A-Za-z0-9]+)\\s*-?\\s*([A-Za-z\\s.]+?)(?=\\s+MENTOR|$)");
                    Matcher mm = mp.matcher(text);
                    while (mm.find()) {
                        String gCode = mm.group(1).trim().toUpperCase();
                        String fName = mm.group(2).trim();
                        FacultyResolutionDto fr = resolveFaculty(fName);
                        facultyRegistry.putIfAbsent(fr.getNormalizedName(), fr);
                        for (LabGroupDto lg : sectionDto.getLabGroups()) {
                            if (gCode.endsWith(lg.getCode()) || lg.getCode().equalsIgnoreCase(gCode)) {
                                lg.setMentorName(fr.getResolvedFullName() != null ? fr.getResolvedFullName() : fr.getRawNameOrCode());
                            }
                        }
                    }
                }
            }

            // Check missing faculty name "NF"
            for (int c = originCol; c < originCol + 8; c++) {
                CellData cell = grid.getCell(r, c);
                if (cell != null && cell.getText() != null && cell.getText().trim().equalsIgnoreCase("NF")) {
                    preview.getWarnings().add(new ImportIssueDto(
                            sheetName, cell.getCellRef(), "FACULTY_NAME_MISSING",
                            "Legend entry has faculty designated as 'NF' (Not Filled/Missing).", "WARNING"
                    ));
                }
            }
        }
    }

    private void performLabCrossCheck(CellGrid labGrid, List<SlotDto> allSlots, ImportPreviewDto preview) {
        // Find all lab slots from section sheets
        List<SlotDto> labSlots = allSlots.stream()
                .filter(s -> s.getSlotKind() == SlotKind.LAB && s.getRoomCode() != null)
                .toList();

        for (SlotDto slot : labSlots) {
            String room = slot.getRoomCode();
            String normRoom = normalizeRoomCode(room);

            // Search lab sheet for room
            List<CellData> roomMatches = labGrid.findCellsContaining(normRoom);
            if (roomMatches.isEmpty()) {
                // Also check without D prefix or with hyphen (DS-11)
                roomMatches = labGrid.findCellsContaining(normRoom.replace("DS", "DS-").replace("DF", "DF-"));
            }

            if (roomMatches.isEmpty()) {
                preview.getWarnings().add(new ImportIssueDto(
                        labGrid.getSheetName(), "", "CROSS_CHECK_ROOM_NOT_FOUND",
                        String.format("Lab slot in section %s room %s was not found in the LAB room sheet.", slot.getSectionName(), room),
                        "WARNING"
                ));
            }
        }
    }

    private void detectClashes(List<SlotDto> slots, ImportPreviewDto preview) {
        // Group slots by Day and Period Range
        for (int i = 0; i < slots.size(); i++) {
            SlotDto s1 = slots.get(i);
            int s1Start = s1.getStartPeriod();
            int s1End = s1.getStartPeriod() + s1.getSpan() - 1;

            for (int j = i + 1; j < slots.size(); j++) {
                SlotDto s2 = slots.get(j);
                if (!s1.getDayOfWeek().equals(s2.getDayOfWeek())) continue;

                int s2Start = s2.getStartPeriod();
                int s2End = s2.getStartPeriod() + s2.getSpan() - 1;

                boolean timeOverlaps = Math.max(s1Start, s2Start) <= Math.min(s1End, s2End);
                if (!timeOverlaps) continue;

                // 1. Double booked faculty
                if (s1.getFacultyNames() != null && s2.getFacultyNames() != null) {
                    for (String f1 : s1.getFacultyNames()) {
                        for (String f2 : s2.getFacultyNames()) {
                            if (f1.equalsIgnoreCase(f2)) {
                                preview.getClashes().add(ClashReportDto.builder()
                                        .clashType("CLASH_FACULTY_DOUBLE_BOOKED")
                                        .day(getDayName(s1.getDayOfWeek()))
                                        .periodIndex(s1Start)
                                        .periodRange(s1Start + ".." + Math.max(s1End, s2End))
                                        .message(String.format("Faculty '%s' is double-booked on %s period %d between %s and %s.",
                                                f1, getDayName(s1.getDayOfWeek()), s1Start, s1.getSourceRef(), s2.getSourceRef()))
                                        .slotSourceRefs(List.of(s1.getSourceRef(), s2.getSourceRef()))
                                        .build());
                            }
                        }
                    }
                }

                // 2. Double booked room
                if (s1.getRoomCode() != null && s2.getRoomCode() != null &&
                        s1.getRoomCode().equalsIgnoreCase(s2.getRoomCode())) {
                    preview.getClashes().add(ClashReportDto.builder()
                            .clashType("CLASH_ROOM_DOUBLE_BOOKED")
                            .day(getDayName(s1.getDayOfWeek()))
                            .periodIndex(s1Start)
                            .periodRange(s1Start + ".." + Math.max(s1End, s2End))
                            .message(String.format("Room '%s' is double-booked on %s period %d between %s and %s.",
                                    s1.getRoomCode(), getDayName(s1.getDayOfWeek()), s1Start, s1.getSourceRef(), s2.getSourceRef()))
                            .slotSourceRefs(List.of(s1.getSourceRef(), s2.getSourceRef()))
                            .build());
                }

                // 3. Double booked lab group
                if (s1.getSectionName() != null && s2.getSectionName() != null &&
                        s1.getSectionName().equalsIgnoreCase(s2.getSectionName())) {
                    if (s1.getLabGroupCode() != null && s2.getLabGroupCode() != null &&
                            s1.getLabGroupCode().equalsIgnoreCase(s2.getLabGroupCode())) {
                        preview.getClashes().add(ClashReportDto.builder()
                                .clashType("CLASH_GROUP_DOUBLE_BOOKED")
                                .day(getDayName(s1.getDayOfWeek()))
                                .periodIndex(s1Start)
                                .periodRange(s1Start + ".." + Math.max(s1End, s2End))
                                .message(String.format("Lab group '%s' in section %s is double-booked on %s period %d between %s and %s.",
                                        s1.getLabGroupCode(), s1.getSectionName(), getDayName(s1.getDayOfWeek()), s1Start, s1.getSourceRef(), s2.getSourceRef()))
                                .slotSourceRefs(List.of(s1.getSourceRef(), s2.getSourceRef()))
                                .build());
                    } else if (s1.getLabGroupCode() == null || s2.getLabGroupCode() == null) {
                        // 4. Whole section class overlapping with a lab
                        preview.getClashes().add(ClashReportDto.builder()
                                .clashType("CLASH_SECTION_OVERLAP")
                                .day(getDayName(s1.getDayOfWeek()))
                                .periodIndex(s1Start)
                                .periodRange(s1Start + ".." + Math.max(s1End, s2End))
                                .message(String.format("Whole-section class overlaps with group slot in section %s on %s period %d between %s and %s.",
                                        s1.getSectionName(), getDayName(s1.getDayOfWeek()), s1Start, s1.getSourceRef(), s2.getSourceRef()))
                                .slotSourceRefs(List.of(s1.getSourceRef(), s2.getSourceRef()))
                                .build());
                    }
                }
            }
        }
    }

    private TimetableDto extractTimetableMeta(CellGrid grid, String targetSession) {
        String academicSession = targetSession;
        int semester = 5;
        int yearOfStudy = 3;

        List<CellData> titleCells = grid.findCellsMatching(TITLE_PATTERN);
        if (!titleCells.isEmpty()) {
            Matcher m = TITLE_PATTERN.matcher(titleCells.get(0).getText());
            if (m.find()) {
                yearOfStudy = parseRoman(m.group(1));
                semester = parseRoman(m.group(2));
                if (m.group(3) != null) {
                    academicSession = m.group(3).trim();
                }
            }
        }

        Term term = (semester % 2 != 0) ? Term.ODD : Term.EVEN;

        return TimetableDto.builder()
                .title("Department of Artificial Intelligence & Data Science Semester " + semester + " Timetable")
                .academicSession(academicSession)
                .term(term)
                .departmentCode("AI&DS")
                .departmentName("Department of Artificial Intelligence & Data Science")
                .yearOfStudy(yearOfStudy)
                .semester(semester)
                .status(TimetableStatus.DRAFT)
                .sourceType(TimetableSourceType.EXCEL)
                .build();
    }

    private FacultyResolutionDto resolveFaculty(String rawToken) {
        String trimmed = rawToken.trim();
        String upper = trimmed.toUpperCase();

        // 1. Direct short code check
        if (facultyByCode.containsKey(upper)) {
            ConfirmedFacultyFixture.CanonicalFaculty cf = facultyByCode.get(upper);
            return FacultyResolutionDto.builder()
                    .rawNameOrCode(trimmed)
                    .normalizedName(cf.fullName())
                    .resolvedShortCode(cf.shortCode())
                    .resolvedFullName(cf.fullName())
                    .status("RESOLVED")
                    .build();
        }

        // 2. Direct name/alias match
        String norm = normalizeForMatch(trimmed);
        if (facultyByName.containsKey(norm)) {
            ConfirmedFacultyFixture.CanonicalFaculty cf = facultyByName.get(norm);
            return FacultyResolutionDto.builder()
                    .rawNameOrCode(trimmed)
                    .normalizedName(cf.fullName())
                    .resolvedShortCode(cf.shortCode())
                    .resolvedFullName(cf.fullName())
                    .status("RESOLVED")
                    .build();
        }

        // 3. Fuzzy match (Levenshtein distance <= 2)
        List<ConfirmedFacultyFixture.CanonicalFaculty> candidates = new ArrayList<>();
        for (ConfirmedFacultyFixture.CanonicalFaculty cf : ConfirmedFacultyFixture.getKnownFaculty()) {
            for (String alias : cf.aliases()) {
                if (levenshteinDistance(norm, normalizeForMatch(alias)) <= 2) {
                    candidates.add(cf);
                    break;
                }
            }
        }

        if (candidates.size() == 1) {
            ConfirmedFacultyFixture.CanonicalFaculty match = candidates.get(0);
            return FacultyResolutionDto.builder()
                    .rawNameOrCode(trimmed)
                    .normalizedName(match.fullName())
                    .resolvedShortCode(match.shortCode())
                    .resolvedFullName(match.fullName())
                    .status("RESOLVED")
                    .build();
        } else if (candidates.size() > 1) {
            return FacultyResolutionDto.builder()
                    .rawNameOrCode(trimmed)
                    .normalizedName(trimmed)
                    .status("AMBIGUOUS")
                    .candidates(candidates.stream().map(ConfirmedFacultyFixture.CanonicalFaculty::fullName).toList())
                    .build();
        }

        // Unresolved
        return FacultyResolutionDto.builder()
                .rawNameOrCode(trimmed)
                .normalizedName(trimmed)
                .status("UNRESOLVED")
                .build();
    }

    private boolean isFacultyToken(String token) {
        String upper = token.trim().toUpperCase();
        if (facultyByCode.containsKey(upper)) return true;
        String norm = normalizeForMatch(token);
        if (facultyByName.containsKey(norm)) return true;
        if (token.toLowerCase().contains("dr.") || token.toLowerCase().contains("ms.") ||
            token.toLowerCase().contains("mr.") || token.toLowerCase().contains("prof.")) {
            return true;
        }
        return false;
    }

    private boolean isFacultyCode(String token) {
        return facultyByCode.containsKey(token.trim().toUpperCase());
    }

    private String normalizeForMatch(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replace("dr.", "")
                .replace("ms.", "")
                .replace("mr.", "")
                .replace("prof.", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }

    private int levenshteinDistance(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = (a.charAt(i - 1) == b.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
            }
        }
        return dp[a.length()][b.length()];
    }

    private String normalizeRoomCode(String room) {
        if (room == null) return "";
        String clean = room.toUpperCase().replace("-", "").replaceAll("\\s+", "").trim();
        // Replace letter 'O' with '0' if like DFO4 -> DF04
        if (clean.equals("DFO4") || clean.equals("DF-04")) return "DF04";
        if (clean.equals("DT07") || clean.equals("DT-07")) return "DT7";
        if (clean.equals("DF-05") || clean.equals("DF05")) return "DF5";
        if (clean.equals("DS-11")) return "DS11";
        if (clean.equals("DS-8")) return "DS8";
        if (clean.equals("BG-16") || clean.equals("BG16")) return "BG16";
        return clean;
    }

    private String maskRoomTokens(String text) {
        if (text == null) return "";
        return text.replaceAll("(?i)\\b(D[STF]-?[0-9]{1,2}|BG-?[0-9]{1,2})\\b", "");
    }

    private boolean containsExplicitBatchTag(String text) {
        return BATCH_TAG_PATTERN.matcher(maskRoomTokens(text)).find();
    }

    private String extractBatchTagGroup(String text, String fallback) {
        Matcher m = BATCH_TAG_PATTERN.matcher(maskRoomTokens(text));
        if (m.find()) {
            return m.group(1).toUpperCase() + m.group(2);
        }
        return fallback;
    }


    private List<String> parseLabGroupNames(String labGroupsText, String sectionName) {
        List<String> list = new ArrayList<>();
        if (labGroupsText == null || labGroupsText.isBlank()) {
            list.add(sectionName + "1");
            list.add(sectionName + "2");
            return list;
        }
        String[] parts = labGroupsText.split("\\+");
        for (String p : parts) {
            String g = p.trim().toUpperCase();
            if (!g.isEmpty()) list.add(g);
        }
        if (list.isEmpty()) {
            list.add(sectionName + "1");
            list.add(sectionName + "2");
        }
        return list;
    }

    private int parseDayOfWeek(String text) {
        String upper = text.toUpperCase();
        if (upper.startsWith("MON")) return 1;
        if (upper.startsWith("TUE")) return 2;
        if (upper.startsWith("WED")) return 3;
        if (upper.startsWith("THU")) return 4;
        if (upper.startsWith("FRI")) return 5;
        if (upper.startsWith("SAT")) return 6;
        return 0;
    }

    private String getDayName(int day) {
        return switch (day) {
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            case 4 -> "Thursday";
            case 5 -> "Friday";
            case 6 -> "Saturday";
            default -> "Unknown";
        };
    }

    private int parseRoman(String roman) {
        if (roman == null) return 1;
        return switch (roman.toUpperCase().trim()) {
            case "I" -> 1;
            case "II" -> 2;
            case "III" -> 3;
            case "IV" -> 4;
            case "V" -> 5;
            case "VI" -> 6;
            case "VII" -> 7;
            case "VIII" -> 8;
            default -> {
                try {
                    yield Integer.parseInt(roman.trim());
                } catch (Exception e) {
                    yield 1;
                }
            }
        };
    }
}
