package com.placeprep;

import com.placeprep.dto.ResumeAtsResponse;
import com.placeprep.service.ResumeAtsService;
import com.placeprep.service.ResumeParserService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

public class ResumeAtsServiceTest {

    private ResumeParserService parserService;
    private ResumeAtsService atsService;

    @BeforeEach
    public void setUp() {
        parserService = new ResumeParserService();
        atsService = new ResumeAtsService();
        ReflectionTestUtils.setField(atsService, "resumeParserService", parserService);
    }

    private byte[] createTestPdf(String content) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                cs.showText(content);
                cs.endText();
            }
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }

    private byte[] createTestDocx(String content) throws IOException {
        try (XWPFDocument docx = new XWPFDocument()) {
            XWPFParagraph p = docx.createParagraph();
            p.createRun().setText(content);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            docx.write(baos);
            return baos.toByteArray();
        }
    }

    @Test
    public void testGenerateSampleResumeFiles() throws Exception {
        byte[] pdf = createTestPdf("Priyansh Jain - Software Engineer Resume. Technical Skills: Java, Spring Boot, Microservices, REST APIs, SQL, Hibernate, Git, Docker, Kubernetes. Experience: Developed enterprise backend services with Java, Spring Boot and PostgreSQL. Projects: Built distributed campus recruitment portal with RESTful Web Services and CI/CD pipelines. Education: B.Tech Computer Science and Engineering, DTU. Strong foundation in Data Structures and Algorithms.");
        java.nio.file.Files.write(java.nio.file.Paths.get("sample_resume.pdf"), pdf);
        try {
            java.nio.file.Files.write(java.nio.file.Paths.get("../sample_resume.pdf"), pdf);
        } catch (Exception ignored) {}
    }

    @Test
    public void testValidPdfParsingAndKeywordMatching() throws Exception {
        byte[] pdfBytes = createTestPdf("Experienced Java developer specializing in Spring Boot and REST APIs with PostgreSQL.");
        MockMultipartFile file = new MockMultipartFile(
                "file", "priyansh_resume.pdf", "application/pdf", pdfBytes
        );

        String jd = "Looking for a software engineer skilled in Java, Spring Boot, REST APIs, and Docker containerization.";
        ResumeAtsResponse response = atsService.analyze(file, "HCLTech", "Software Engineer", jd);

        assertNotNull(response);
        assertEquals("HCLTech", response.getCompany());
        assertEquals("Software Engineer", response.getRole());
        assertTrue(response.getMatchScore() > 0);
        assertTrue(response.getMatchedKeywords().contains("Java"));
        assertTrue(response.getMatchedKeywords().contains("Spring Boot"));
        assertTrue(response.getMatchedKeywords().contains("REST APIs") || response.getMatchedKeywords().contains("REST API"));
        assertTrue(response.getMissingKeywords().contains("Docker"));
    }

    @Test
    public void testValidWordDocxParsing() throws Exception {
        byte[] docxBytes = createTestDocx("Full Stack Developer with proficiency in Java, Spring Boot, REST APIs, Docker, SQL, and cloud-native backend development.");
        MockMultipartFile file = new MockMultipartFile(
                "file", "priyansh_resume.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docxBytes
        );

        String jd = "We require Java, Spring Boot, REST APIs, and Docker for cloud-native backend development.";
        ResumeAtsResponse response = atsService.analyze(file, "TCS", "Digital Engineer", jd);

        assertNotNull(response);
        assertEquals("TCS", response.getCompany());
        assertTrue(response.getMatchScore() >= 75);
        assertEquals("APPROVED", response.getApprovalStatus());
        assertTrue(response.getMatchedKeywords().contains("Java"));
        assertTrue(response.getMatchedKeywords().contains("Docker"));
    }

    @Test
    public void testEmptyFileRejection() {
        MockMultipartFile file = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            atsService.analyze(file, "Google", "SWE", "Java Spring Boot developer required");
        });
        assertTrue(ex.getMessage().contains("empty") || ex.getMessage().contains("zero bytes"));
    }

    @Test
    public void testUnsupportedFileTypeRejection() {
        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", new byte[]{1, 2, 3, 4, 5});
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            atsService.analyze(file, "Google", "SWE", "Java Spring Boot developer required");
        });
        assertTrue(ex.getMessage().contains("Unsupported file type"));
    }

    @Test
    public void testMalformedPdfRejection() {
        // PDF extension but invalid header bytes
        MockMultipartFile file = new MockMultipartFile("file", "fake.pdf", "application/pdf", "this is not a pdf".getBytes(StandardCharsets.UTF_8));
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            atsService.analyze(file, "Google", "SWE", "Java Spring Boot developer required");
        });
        assertTrue(ex.getMessage().contains("does not match the expected PDF format") || ex.getMessage().contains("Corrupted"));
    }

    @Test
    public void testEmptyJobDescriptionRejection() throws Exception {
        byte[] pdfBytes = createTestPdf("Java developer");
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", pdfBytes);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            atsService.analyze(file, "Google", "SWE", "");
        });
        assertTrue(ex.getMessage().contains("Job Description is required"));
    }

    @Test
    public void testTooShortJobDescriptionRejection() throws Exception {
        byte[] pdfBytes = createTestPdf("Java developer");
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", pdfBytes);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            atsService.analyze(file, "Google", "SWE", "Short text");
        });
        assertTrue(ex.getMessage().contains("too short"));
    }

    @Test
    public void testScoreAndApprovalThresholdBoundaries() throws Exception {
        // Scenario 1: Needs Revision (< 75%)
        byte[] pdfBytesLow = createTestPdf("Basic Python and Git skills.");
        MockMultipartFile fileLow = new MockMultipartFile("file", "resume.pdf", "application/pdf", pdfBytesLow);
        String jd = "Looking for Java, Spring Boot, Microservices, Docker, Kubernetes, Kafka, and Redis.";
        ResumeAtsResponse resLow = atsService.analyze(fileLow, "Google", "SWE", jd);

        assertTrue(resLow.getMatchScore() < 75);
        assertEquals("NEEDS_REVISION", resLow.getApprovalStatus());
        assertFalse(resLow.getRecommendations().isEmpty());

        // Scenario 2: Approved (>= 75%)
        byte[] pdfBytesHigh = createTestPdf("Experienced with Java, Spring Boot, Microservices, Docker, Kubernetes, and Kafka.");
        MockMultipartFile fileHigh = new MockMultipartFile("file", "resume.pdf", "application/pdf", pdfBytesHigh);
        ResumeAtsResponse resHigh = atsService.analyze(fileHigh, "Google", "SWE", jd);

        assertTrue(resHigh.getMatchScore() >= 75);
        assertEquals("APPROVED", resHigh.getApprovalStatus());
    }
}
