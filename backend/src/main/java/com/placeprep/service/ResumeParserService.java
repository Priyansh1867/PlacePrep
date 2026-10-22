package com.placeprep.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;

@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);
    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

    // Magic bytes for file formats
    private static final byte[] PDF_MAGIC = new byte[]{0x25, 0x50, 0x44, 0x46}; // %PDF
    private static final byte[] ZIP_MAGIC = new byte[]{0x50, 0x4B, 0x03, 0x04}; // PK.. for docx
    private static final byte[] OLE2_MAGIC = new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1}; // doc

    public enum DocumentType {
        PDF,
        DOCX,
        DOC
    }

    public static class ParseResult {
        private final String extractedText;
        private final DocumentType documentType;
        private final String fileName;
        private final long fileSize;

        public ParseResult(String extractedText, DocumentType documentType, String fileName, long fileSize) {
            this.extractedText = extractedText;
            this.documentType = documentType;
            this.fileName = fileName;
            this.fileSize = fileSize;
        }

        public String getExtractedText() {
            return extractedText;
        }

        public DocumentType getDocumentType() {
            return documentType;
        }

        public String getFileName() {
            return fileName;
        }

        public long getFileSize() {
            return fileSize;
        }
    }

    /**
     * Validates and extracts text from an uploaded resume file temporarily in-memory.
     * Original files are not stored on disk or database.
     */
    public ParseResult extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("The resume file is empty or missing. Please select a valid document.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("The file size (" + (file.getSize() / 1024 / 1024) + "MB) exceeds the 10MB maximum upload limit.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            originalFilename = "uploaded_resume";
        }
        String lowerFilename = originalFilename.toLowerCase();

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read uploaded resume file: " + e.getMessage());
        }

        if (bytes.length == 0) {
            throw new IllegalArgumentException("The resume file has zero bytes. Please upload a valid document.");
        }

        DocumentType docType;
        if (lowerFilename.endsWith(".pdf")) {
            validateMagicBytes(bytes, PDF_MAGIC, "PDF");
            docType = DocumentType.PDF;
        } else if (lowerFilename.endsWith(".docx")) {
            validateMagicBytes(bytes, ZIP_MAGIC, "DOCX");
            docType = DocumentType.DOCX;
        } else if (lowerFilename.endsWith(".doc")) {
            validateMagicBytes(bytes, OLE2_MAGIC, "DOC");
            docType = DocumentType.DOC;
        } else {
            throw new IllegalArgumentException("Unsupported file type. Only PDF (.pdf) and Word documents (.docx, .doc) are supported.");
        }

        log.info("Processing resume in-memory: filename={}, size={} bytes, format={}", 
                originalFilename, bytes.length, docType);

        String text;
        switch (docType) {
            case PDF:
                text = parsePdf(bytes);
                break;
            case DOCX:
                text = parseDocx(bytes);
                break;
            case DOC:
                text = parseDoc(bytes);
                break;
            default:
                throw new IllegalArgumentException("Unsupported document type: " + docType);
        }

        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("No readable text could be extracted from the document. Please ensure your resume is text-based and not a scanned image.");
        }

        return new ParseResult(text.trim(), docType, originalFilename, bytes.length);
    }

    private void validateMagicBytes(byte[] bytes, byte[] expectedMagic, String formatName) {
        if (bytes.length < expectedMagic.length) {
            throw new IllegalArgumentException("File is too small to be a valid " + formatName + " document.");
        }
        for (int i = 0; i < expectedMagic.length; i++) {
            if (bytes[i] != expectedMagic[i]) {
                throw new IllegalArgumentException("File content does not match the expected " + formatName + 
                        " format. The file may be corrupt or incorrectly renamed.");
            }
        }
    }

    private String parsePdf(byte[] bytes) {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            if (document.isEncrypted()) {
                throw new IllegalArgumentException("Encrypted or password-protected PDF files cannot be analyzed. Please upload an unprotected document.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("PDF parsing error: {}", e.getMessage());
            throw new IllegalArgumentException("Corrupted or invalid PDF document: " + e.getMessage());
        }
    }

    private String parseDocx(byte[] bytes) {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             XWPFDocument docx = new XWPFDocument(bais);
             XWPFWordExtractor extractor = new XWPFWordExtractor(docx)) {
            return extractor.getText();
        } catch (Exception e) {
            log.error("DOCX parsing error: {}", e.getMessage());
            throw new IllegalArgumentException("Corrupted or invalid Word (.docx) document: " + e.getMessage());
        }
    }

    private String parseDoc(byte[] bytes) {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             HWPFDocument doc = new HWPFDocument(bais);
             WordExtractor extractor = new WordExtractor(doc)) {
            return extractor.getText();
        } catch (Exception e) {
            log.error("DOC parsing error: {}", e.getMessage());
            throw new IllegalArgumentException("Corrupted or invalid legacy Word (.doc) document: " + e.getMessage());
        }
    }
}
