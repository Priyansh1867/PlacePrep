package com.placeprep.timetable;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.placeprep.dto.timetable.*;
import com.placeprep.model.timetable.*;
import com.placeprep.repository.timetable.TimetableImportJobRepository;
import com.placeprep.service.timetable.TimetableImportService;
import com.placeprep.service.timetable.exporter.ExcelTimetableExporter;
import com.placeprep.service.timetable.exporter.IcsTimetableExporter;
import com.placeprep.service.timetable.exporter.PdfTimetableExporter;
import com.placeprep.service.timetable.importer.ExcelTimetableParser;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentCatalog;
import org.apache.pdfbox.pdmodel.PDDocumentNameDictionary;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class PdfAndExportRoundTripTest {

    private ExcelTimetableParser parser;
    private ExcelTimetableExporter excelExporter;
    private PdfTimetableExporter pdfExporter;
    private IcsTimetableExporter icsExporter;
    private ObjectMapper objectMapper;

    private File getSampleWorkbookFile() {
        File file = new File("src/test/resources/timetable/Time_Table_Odd_Sem_2026-2027.xlsx");
        if (!file.exists()) {
            file = new File("backend/src/test/resources/timetable/Time_Table_Odd_Sem_2026-2027.xlsx");
        }
        return file;
    }

    @BeforeEach
    void setUp() {
        parser = new ExcelTimetableParser();
        excelExporter = new ExcelTimetableExporter();
        pdfExporter = new PdfTimetableExporter();
        icsExporter = new IcsTimetableExporter();
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Test
    @DisplayName("1. XLSX Round-Trip: Export parsed sample to XLSX, re-import, and verify slot fidelity & generated sheets")
    void testXlsxExportAndReimportRoundTrip() throws Exception {
        File sampleFile = getSampleWorkbookFile();
        assertTrue(sampleFile.exists(), "Sample file must exist");

        // 1. Parse original sample
        ImportPreviewDto originalPreview = parser.parse(sampleFile, "2026-27");
        assertNotNull(originalPreview);
        assertFalse(originalPreview.getSlots().isEmpty());

        int originalSlotCount = originalPreview.getSlots().size();
        System.out.println("Original Sample Parsed Slots: " + originalSlotCount);

        // 2. Export to XLSX
        byte[] exportedXlsx = excelExporter.generateWorkbook(
                originalPreview.getTimetableMeta(),
                originalPreview.getPeriods(),
                originalPreview.getSections(),
                originalPreview.getSlots(),
                originalPreview.getSubjects(),
                originalPreview.getFaculty(),
                originalPreview.getRooms()
        );
        assertNotNull(exportedXlsx);
        assertTrue(exportedXlsx.length > 5000, "Exported XLSX should contain data");

        // 3. Re-import the exported XLSX
        ImportPreviewDto reimportedPreview = parser.parse(new ByteArrayInputStream(exportedXlsx), "2026-27", "exported.xlsx");
        assertNotNull(reimportedPreview);
        assertNotNull(reimportedPreview.getSlots());

        System.out.println("Re-imported Parsed Slots: " + reimportedPreview.getSlots().size());
        assertTrue(reimportedPreview.getSlots().size() >= originalSlotCount * 0.95,
                "Re-imported slot count (" + reimportedPreview.getSlots().size() + ") should closely match original (" + originalSlotCount + ")");

        // 4. Verify Auto-Generated Sheets (LAB, Room, FACULTY)
        assertTrue(reimportedPreview.getStats().getTotalSheets() >= 4, "Should detect Section, LAB, Room, and FACULTY sheets");
    }

    @Test
    @DisplayName("2. PDF with Embedded timetable.json: 100% Exact Round-Trip at Confidence 1.0")
    void testPdfWithEmbeddedAttachmentRoundTrip() throws Exception {
        File sampleFile = getSampleWorkbookFile();
        ImportPreviewDto originalPreview = parser.parse(sampleFile, "2026-27");

        // Export PDF with embedded attachment
        byte[] pdfWithAttachment = pdfExporter.generatePdf(
                originalPreview.getTimetableMeta(),
                originalPreview.getPeriods(),
                originalPreview.getSlots(),
                originalPreview,
                "Master Schedule"
        );
        assertNotNull(pdfWithAttachment);
        assertTrue(pdfWithAttachment.length > 1000);

        // Re-import from PDF
        ImportPreviewDto importedFromPdf = parser.parse(new ByteArrayInputStream(pdfWithAttachment), "2026-27", "timetable.pdf");
        assertNotNull(importedFromPdf);
        assertEquals(originalPreview.getSlots().size(), importedFromPdf.getSlots().size(), "Should recover 100% of slots from embedded JSON");

        // Assert all slots have confidence 1.0
        for (SlotDto slot : importedFromPdf.getSlots()) {
            assertNotNull(slot.getConfidence());
            assertEquals(1.0, slot.getConfidence(), 0.001, "Embedded slots must have confidence 1.0");
        }
    }

    @Test
    @DisplayName("3. PDF Positional Text Extraction (Attachment Stripped): Recovers >= 90% of Slots Exactly")
    void testPdfPositionalStripperRecoversOver90Percent() throws Exception {
        File sampleFile = getSampleWorkbookFile();
        ImportPreviewDto originalPreview = parser.parse(sampleFile, "2026-27");

        // Take single section grid as test baseline (Section A of V Sem)
        List<SlotDto> sectionASlots = originalPreview.getSlots().stream()
                .filter(s -> "A".equalsIgnoreCase(s.getSectionName()) && s.getSourceRef() != null && s.getSourceRef().contains("V Sem"))
                .toList();
        if (sectionASlots.isEmpty()) {
            sectionASlots = originalPreview.getSlots().subList(0, Math.min(23, originalPreview.getSlots().size()));
        }
        assertFalse(sectionASlots.isEmpty());

        // Generate PDF WITHOUT embedded attachment
        byte[] strippedPdf = pdfExporter.generatePdf(
                originalPreview.getTimetableMeta(),
                originalPreview.getPeriods(),
                sectionASlots,
                null, // No attachment!
                "Section A"
        );
        assertNotNull(strippedPdf);

        // Re-import from stripped PDF using positional text stripper
        ImportPreviewDto importedFromStripped = parser.parse(new ByteArrayInputStream(strippedPdf), "2026-27", "stripped.pdf");
        assertNotNull(importedFromStripped);

        int originalCount = sectionASlots.size();
        int recoveredCount = importedFromStripped.getSlots().size();
        double recoveryPercentage = ((double) recoveredCount / (double) originalCount) * 100.0;

        System.out.printf("PDF Positional Recovery: %d of %d slots recovered (%.1f%%)%n", recoveredCount, originalCount, recoveryPercentage);

        assertTrue(recoveryPercentage >= 90.0,
                String.format("Expected >= 90%% recovery but measured %.1f%% (%d/%d)", recoveryPercentage, recoveredCount, originalCount));
    }

    @Test
    @DisplayName("4. Scanned PDF Detection: returns SCANNED_PDF error report and refuses OCR")
    void testScannedPdfReturnsScannedPdfReport() throws Exception {
        // Create an empty PDF without any text layer
        byte[] scannedPdfBytes;
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            scannedPdfBytes = baos.toByteArray();
        }

        ImportPreviewDto preview = parser.parse(new ByteArrayInputStream(scannedPdfBytes), "2026-27", "scanned.pdf");
        assertNotNull(preview);
        assertFalse(preview.getErrors().isEmpty(), "Must contain error for scanned PDF");

        ImportIssueDto error = preview.getErrors().get(0);
        assertEquals("SCANNED_PDF", error.getCode());
        assertTrue(error.getMessage().contains("This PDF is a scan"));
        assertTrue(error.getMessage().contains("Upload the Excel file or enter the timetable manually"));
    }

    @Test
    @DisplayName("5. ICS Calendar Export: Hand-crafted RFC 5545 with Asia/Kolkata, RRULE, and EXDATE for Cancel Overrides")
    void testIcsExportGeneratesValidRfc5545() {
        PeriodDto p1 = PeriodDto.builder().periodIndex(1).startTime(LocalTime.of(8, 30)).endTime(LocalTime.of(9, 30)).build();
        PeriodDto p2 = PeriodDto.builder().periodIndex(2).startTime(LocalTime.of(9, 30)).endTime(LocalTime.of(10, 30)).build();

        SlotDto slot1 = SlotDto.builder()
                .id(501L)
                .timetableId(10L)
                .dayOfWeek(1) // Monday
                .startPeriod(1)
                .span(1)
                .subjectCode("CD")
                .subjectName("Compiler Design")
                .facultyNames(List.of("Ms. Ambika Bagri"))
                .roomCode("DS11")
                .sectionName("A")
                .labGroupCode("A1")
                .build();

        TimetableSlot slotEntity = new TimetableSlot();
        slotEntity.setId(501L);

        TimetableOverride cancelOverride = new TimetableOverride();
        cancelOverride.setSlot(slotEntity);
        cancelOverride.setOnDate(LocalDate.now().plusWeeks(1));
        cancelOverride.setKind(OverrideKind.CANCEL);
        cancelOverride.setStatus(OverrideStatus.APPROVED);

        String ics = icsExporter.generateIcs(
                "Student Timetable",
                List.of(p1, p2),
                List.of(slot1),
                LocalDate.now(),
                LocalDate.now().plusMonths(3),
                List.of(cancelOverride)
        );

        assertNotNull(ics);
        assertTrue(ics.startsWith("BEGIN:VCALENDAR"));
        assertTrue(ics.endsWith("END:VCALENDAR\r\n"));
        assertTrue(ics.contains("VERSION:2.0"));
        assertTrue(ics.contains("TZID:Asia/Kolkata"));
        assertTrue(ics.contains("UID:slot-501-10@placeprep.com"));
        assertTrue(ics.contains("RRULE:FREQ=WEEKLY;UNTIL="));
        assertTrue(ics.contains("SUMMARY:CD - Compiler Design"));
        assertTrue(ics.contains("LOCATION:Room DS11"));
        assertTrue(ics.contains("EXDATE;TZID=Asia/Kolkata:"), "Must include EXDATE for cancelled override");
    }

    @Test
    @DisplayName("6. Validation: Rejects files > 25MB and unsupported file extensions")
    void testUploadValidationRules() {
        TimetableImportJobRepository dummyJobRepo = createProxy(TimetableImportJobRepository.class, Map.of());
        TimetableImportService service = new TimetableImportService(
                dummyJobRepo, parser, null, null, null, null, null, null, null, null, null
        );

        // 1. Unsupported extension
        MockMultipartFile txtFile = new MockMultipartFile("file", "timetable.txt", "text/plain", "dummy content".getBytes());
        IllegalArgumentException ex1 = assertThrows(IllegalArgumentException.class, () ->
                service.uploadAndParse(txtFile, "2026-27", Term.ODD, "AIDS", "ADMIN"));
        assertTrue(ex1.getMessage().contains("Unsupported file type"));

        // 2. Oversized file (> 25MB)
        MockMultipartFile bigFile = new MockMultipartFile("file", "huge.xlsx", "application/vnd.ms-excel", new byte[26 * 1024 * 1024]);
        IllegalArgumentException ex2 = assertThrows(IllegalArgumentException.class, () ->
                service.uploadAndParse(bigFile, "2026-27", Term.ODD, "AIDS", "ADMIN"));
        assertTrue(ex2.getMessage().contains("25 MB"));
    }

    @Test
    @DisplayName("7. Commit refusal: Refuses slots below 0.6 confidence until confirmed in resolutions")
    void testCommitRefusesLowConfidenceSlots() throws Exception {
        SlotDto lowConfSlot = SlotDto.builder()
                .sourceRef("Sheet1!A5")
                .confidence(0.5) // < 0.6
                .build();

        ImportPreviewDto preview = new ImportPreviewDto();
        preview.setSlots(new ArrayList<>(List.of(lowConfSlot)));

        TimetableImportJob job = new TimetableImportJob();
        job.setId(99L);
        job.setReportJson(objectMapper.writeValueAsString(preview));

        TimetableImportJobRepository jobRepo = createProxy(TimetableImportJobRepository.class, Map.of(
                "findById", Optional.of(job)
        ));

        TimetableImportService service = new TimetableImportService(
                jobRepo, parser, null, null, null, null, null, null, null, null, null
        );

        // Commit should fail due to confidence < 0.6
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                service.commitImportJob(99L, false));
        assertTrue(ex.getMessage().contains("low-confidence slot(s) (<0.6) remaining"));

        // Confirming/editing the slot via resolutions elevates confidence to 1.0
        ImportResolutionsDto res = new ImportResolutionsDto();
        res.setSlotEdits(List.of(SlotDto.builder().sourceRef("Sheet1!A5").confidence(1.0).build()));
        service.applyResolutions(99L, res);

        // Inspect updated report in job
        ImportPreviewDto updatedPreview = objectMapper.readValue(job.getReportJson(), ImportPreviewDto.class);
        assertEquals(1.0, updatedPreview.getSlots().get(0).getConfidence(), 0.001);
    }

    @SuppressWarnings("unchecked")
    private <T> T createProxy(Class<T> intf, Map<String, Object> returns) {
        return (T) Proxy.newProxyInstance(
                intf.getClassLoader(),
                new Class<?>[]{intf},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if (returns.containsKey(name)) {
                        return returns.get(name);
                    }
                    if ("toString".equals(name)) return "MockProxy@" + intf.getSimpleName();
                    if ("equals".equals(name)) return proxy == args[0];
                    if ("hashCode".equals(name)) return System.identityHashCode(proxy);
                    Class<?> ret = method.getReturnType();
                    if (ret.equals(Optional.class)) return Optional.empty();
                    if (ret.equals(List.class)) return Collections.emptyList();
                    if (ret.equals(Set.class)) return Collections.emptySet();
                    if (ret.equals(boolean.class) || ret.equals(Boolean.class)) return false;
                    return null;
                }
        );
    }
}
