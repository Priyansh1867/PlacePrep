package com.placeprep;

import com.placeprep.exception.BadRequestException;
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

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class ResumeParserServiceTest {

    private ResumeParserService parserService;

    @BeforeEach
    void setUp() {
        parserService = new ResumeParserService();
    }

    private byte[] createSyntheticPdf(String text) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(doc, page)) {
                stream.beginText();
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                stream.newLineAtOffset(50, 700);
                stream.showText(text);
                stream.endText();
            }
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }

    private byte[] createSyntheticDocx(String text) throws IOException {
        try (XWPFDocument doc = new XWPFDocument()) {
            XWPFParagraph p = doc.createParagraph();
            p.createRun().setText(text);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.write(baos);
            return baos.toByteArray();
        }
    }

    @Test
    void testValidPdfParsing() throws IOException {
        byte[] pdfBytes = createSyntheticPdf("Priyansh Jain - Java Developer with Spring Boot and Docker");
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", pdfBytes
        );

        String text = parserService.extractText(file);
        assertNotNull(text);
        assertTrue(text.contains("Java Developer"));
        assertTrue(text.contains("Spring Boot"));
    }

    @Test
    void testValidDocxParsing() throws IOException {
        byte[] docxBytes = createSyntheticDocx("Experienced Frontend Developer skilled in React, TypeScript and REST APIs");
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docxBytes
        );

        String text = parserService.extractText(file);
        assertNotNull(text);
        assertTrue(text.contains("React"));
        assertTrue(text.contains("TypeScript"));
    }

    @Test
    void testEmptyFileThrowsBadRequest() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", new byte[0]
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> parserService.extractText(emptyFile));
        assertTrue(ex.getMessage().contains("empty") || ex.getMessage().contains("select"));
    }

    @Test
    void testNullFileThrowsBadRequest() {
        assertThrows(BadRequestException.class, () -> parserService.extractText(null));
    }

    @Test
    void testUnsupportedExtensionThrowsBadRequest() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.txt", "text/plain", "Sample text content".getBytes()
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> parserService.extractText(file));
        assertTrue(ex.getMessage().contains("Unsupported file type") || ex.getMessage().contains("PDF"));
    }

    @Test
    void testCorruptedPdfContentThrowsBadRequest() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "corrupt.pdf", "application/pdf", new byte[]{0x00, 0x01, 0x02, 0x03}
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> parserService.extractText(file));
        assertTrue(ex.getMessage().contains("PDF standard format") || ex.getMessage().contains("corrupt"));
    }

    @Test
    void testCorruptedDocxContentThrowsBadRequest() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "corrupt.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", new byte[]{0x00, 0x01, 0x02, 0x03}
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> parserService.extractText(file));
        assertTrue(ex.getMessage().contains("OpenXML") || ex.getMessage().contains("corrupt"));
    }
}
