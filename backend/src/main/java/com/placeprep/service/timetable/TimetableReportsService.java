package com.placeprep.service.timetable;

import com.placeprep.dto.timetable.FacultyWorkloadReportDto;
import com.placeprep.dto.timetable.RoomUtilisationReportDto;
import com.placeprep.dto.timetable.RoomUtilisationSummaryDto;
import com.placeprep.dto.timetable.SectionFreePeriodsReportDto;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimetableReportsService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final TimetableSlotRepository slotRepository;
    private final TimetableRoomRepository roomRepository;
    private final TimetableSectionRepository sectionRepository;
    private final TimetableRepository timetableRepository;
    private final DepartmentResolver departmentResolver;

    private static final int STANDARD_GRID_HOURS = 42; // 6 days * 7 lecture periods

    /**
     * Faculty Workload Report
     */
    @Transactional(readOnly = true)
    public List<FacultyWorkloadReportDto> getFacultyWorkload(String departmentFilter) {
        List<FacultyProfile> facultyList = facultyProfileRepository.findAll();
        if (departmentFilter != null && !departmentFilter.isBlank() && !departmentFilter.equalsIgnoreCase("ALL")) {
            facultyList = facultyList.stream()
                    .filter(f -> departmentResolver.matches(f.getDepartmentCode(), departmentFilter))
                    .toList();
        }

        // Only published timetable slots
        List<Timetable> publishedTimetables = timetableRepository.findByStatus(TimetableStatus.PUBLISHED);
        Set<Long> publishedTtIds = publishedTimetables.stream().map(Timetable::getId).collect(Collectors.toSet());
        List<TimetableSlot> allPublishedSlots = slotRepository.findAll().stream()
                .filter(s -> publishedTtIds.contains(s.getTimetable().getId()))
                .toList();

        List<FacultyWorkloadReportDto> result = new ArrayList<>();

        for (FacultyProfile fp : facultyList) {
            List<TimetableSlot> facultySlots = allPublishedSlots.stream()
                    .filter(s -> s.getFacultyMembers() != null && s.getFacultyMembers().contains(fp))
                    .toList();

            int theoryPeriods = 0;
            int labPeriods = 0;
            Map<Integer, Integer> perDayCounts = new HashMap<>();
            Map<Integer, Set<Integer>> perDayOccupiedPeriods = new HashMap<>();

            for (int d = 1; d <= 6; d++) {
                perDayCounts.put(d, 0);
                perDayOccupiedPeriods.put(d, new HashSet<>());
            }

            for (TimetableSlot s : facultySlots) {
                int span = s.getSpan() != null ? s.getSpan() : 1;
                if (s.getSlotKind() == SlotKind.LAB) {
                    labPeriods += span;
                } else {
                    theoryPeriods += span;
                }

                int dow = s.getDayOfWeek() != null ? s.getDayOfWeek() : 1;
                if (dow >= 1 && dow <= 6) {
                    perDayCounts.put(dow, perDayCounts.get(dow) + span);
                    int start = s.getStartPeriod() != null ? s.getStartPeriod() : 1;
                    for (int p = 0; p < span; p++) {
                        perDayOccupiedPeriods.get(dow).add(start + p);
                    }
                }
            }

            int totalPeriods = theoryPeriods + labPeriods;
            int perDayPeak = perDayCounts.values().stream().max(Integer::compareTo).orElse(0);

            // Compute max consecutive periods
            int maxConsecutive = 0;
            for (int d = 1; d <= 6; d++) {
                Set<Integer> periodsOnDay = perDayOccupiedPeriods.get(d);
                int consecutiveOnDay = calculateMaxConsecutive(periodsOnDay);
                if (consecutiveOnDay > maxConsecutive) {
                    maxConsecutive = consecutiveOnDay;
                }
            }

            result.add(FacultyWorkloadReportDto.builder()
                    .facultyId(fp.getId())
                    .fullName(fp.getFullName())
                    .shortCode(fp.getShortCode())
                    .departmentCode(fp.getDepartmentCode())
                    .theoryPeriods(theoryPeriods)
                    .labPeriods(labPeriods)
                    .totalPeriods(totalPeriods)
                    .perDayPeak(perDayPeak)
                    .maxConsecutivePeriods(maxConsecutive)
                    .perDayCounts(perDayCounts)
                    .build());
        }

        result.sort((a, b) -> Integer.compare(b.getTotalPeriods(), a.getTotalPeriods()));
        return result;
    }

    private int calculateMaxConsecutive(Set<Integer> periods) {
        if (periods == null || periods.isEmpty()) return 0;
        List<Integer> sorted = new ArrayList<>(periods);
        Collections.sort(sorted);

        int maxRun = 1;
        int currentRun = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i) == sorted.get(i - 1) + 1) {
                currentRun++;
                if (currentRun > maxRun) maxRun = currentRun;
            } else {
                currentRun = 1;
            }
        }
        return maxRun;
    }

    /**
     * Export Faculty Workload to XLSX
     */
    public byte[] exportFacultyWorkloadXlsx(List<FacultyWorkloadReportDto> reports) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Faculty Workload");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Header Row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Faculty ID", "Full Name", "Short Code", "Department",
                    "Theory Periods/Wk", "Lab Periods/Wk", "Total Weekly Periods",
                    "Peak Day Load", "Max Consecutive Periods"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 1;
            for (FacultyWorkloadReportDto rep : reports) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rep.getFacultyId());
                row.createCell(1).setCellValue(rep.getFullName() != null ? rep.getFullName() : "");
                row.createCell(2).setCellValue(rep.getShortCode() != null ? rep.getShortCode() : "");
                row.createCell(3).setCellValue(rep.getDepartmentCode() != null ? rep.getDepartmentCode() : "");
                row.createCell(4).setCellValue(rep.getTheoryPeriods());
                row.createCell(5).setCellValue(rep.getLabPeriods());
                row.createCell(6).setCellValue(rep.getTotalPeriods());
                row.createCell(7).setCellValue(rep.getPerDayPeak());
                row.createCell(8).setCellValue(rep.getMaxConsecutivePeriods());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(bos);
            return bos.toByteArray();
        }
    }

    /**
     * Room and Lab Utilisation Report
     */
    @Transactional(readOnly = true)
    public RoomUtilisationSummaryDto getRoomUtilisation(String departmentFilter) {
        List<TimetableRoom> rooms = roomRepository.findAll();

        List<Timetable> publishedTimetables = timetableRepository.findByStatus(TimetableStatus.PUBLISHED);
        Set<Long> publishedTtIds = publishedTimetables.stream().map(Timetable::getId).collect(Collectors.toSet());
        List<TimetableSlot> allPublishedSlots = slotRepository.findAll().stream()
                .filter(s -> publishedTtIds.contains(s.getTimetable().getId()))
                .toList();

        List<RoomUtilisationReportDto> reportList = new ArrayList<>();
        int idleCount = 0;
        double totalUtilizationSum = 0.0;

        for (TimetableRoom r : rooms) {
            int hoursUsed = allPublishedSlots.stream()
                    .filter(s -> s.getRoom() != null && s.getRoom().getId().equals(r.getId()))
                    .mapToInt(s -> s.getSpan() != null ? s.getSpan() : 1)
                    .sum();

            double utilPercent = Math.min(100.0, Math.round(((double) hoursUsed / STANDARD_GRID_HOURS) * 1000.0) / 10.0);
            boolean isIdle = (hoursUsed == 0);
            if (isIdle) idleCount++;
            totalUtilizationSum += utilPercent;

            reportList.add(RoomUtilisationReportDto.builder()
                    .roomId(r.getId())
                    .roomCode(r.getCode())
                    .displayName(r.getDisplayName())
                    .roomType(r.getRoomType())
                    .building(r.getBuilding())
                    .capacity(r.getCapacity())
                    .hoursUsed(hoursUsed)
                    .gridHours(STANDARD_GRID_HOURS)
                    .utilizationPercent(utilPercent)
                    .isIdle(isIdle)
                    .build());
        }

        reportList.sort((a, b) -> Double.compare(b.getUtilizationPercent(), a.getUtilizationPercent()));
        double avg = rooms.isEmpty() ? 0.0 : Math.round((totalUtilizationSum / rooms.size()) * 10.0) / 10.0;

        return RoomUtilisationSummaryDto.builder()
                .totalRooms(rooms.size())
                .idleRoomsCount(idleCount)
                .averageUtilizationPercent(avg)
                .rooms(reportList)
                .build();
    }

    /**
     * Sections' Free Periods Report
     */
    @Transactional(readOnly = true)
    public List<SectionFreePeriodsReportDto> getSectionFreePeriods(String departmentFilter) {
        List<Timetable> publishedTimetables = timetableRepository.findByStatus(TimetableStatus.PUBLISHED);
        if (departmentFilter != null && !departmentFilter.isBlank() && !departmentFilter.equalsIgnoreCase("ALL")) {
            publishedTimetables = publishedTimetables.stream()
                    .filter(t -> departmentResolver.matches(t.getDepartmentCode(), departmentFilter))
                    .toList();
        }

        List<SectionFreePeriodsReportDto> result = new ArrayList<>();

        for (Timetable tt : publishedTimetables) {
            List<TimetableSection> sections = sectionRepository.findByTimetableId(tt.getId());
            List<TimetableSlot> slots = slotRepository.findByTimetableId(tt.getId());

            for (TimetableSection sec : sections) {
                List<TimetableSlot> sectionSlots = slots.stream()
                        .filter(s -> s.getSection().getId().equals(sec.getId()))
                        .toList();

                Map<Integer, Set<Integer>> occupiedByDay = new HashMap<>();
                for (int d = 1; d <= 6; d++) occupiedByDay.put(d, new HashSet<>());

                for (TimetableSlot s : sectionSlots) {
                    int dow = s.getDayOfWeek() != null ? s.getDayOfWeek() : 1;
                    if (dow >= 1 && dow <= 6) {
                        int start = s.getStartPeriod() != null ? s.getStartPeriod() : 1;
                        int span = s.getSpan() != null ? s.getSpan() : 1;
                        for (int p = 0; p < span; p++) {
                            occupiedByDay.get(dow).add(start + p);
                        }
                    }
                }

                Map<Integer, List<Integer>> freePeriodsPerDay = new HashMap<>();
                int totalFree = 0;
                // Standard periods 1 to 8, excluding lunch break period 5
                for (int d = 1; d <= 6; d++) {
                    List<Integer> freeList = new ArrayList<>();
                    for (int p = 1; p <= 8; p++) {
                        if (p == 5) continue; // lunch break
                        if (!occupiedByDay.get(d).contains(p)) {
                            freeList.add(p);
                            totalFree++;
                        }
                    }
                    freePeriodsPerDay.put(d, freeList);
                }

                result.add(SectionFreePeriodsReportDto.builder()
                        .sectionId(sec.getId())
                        .sectionName(sec.getName())
                        .semester(tt.getSemester())
                        .departmentCode(tt.getDepartmentCode())
                        .timetableId(tt.getId())
                        .totalFreePeriods(totalFree)
                        .freePeriodsPerDay(freePeriodsPerDay)
                        .build());
            }
        }

        result.sort((a, b) -> Integer.compare(b.getTotalFreePeriods(), a.getTotalFreePeriods()));
        return result;
    }
}

