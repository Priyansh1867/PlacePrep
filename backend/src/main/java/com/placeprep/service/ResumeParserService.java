package com.placeprep.service;

import com.placeprep.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
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
import java.util.Locale;

@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    // Magic bytes
    private static final byte[] PDF_MAGIC = new byte[]{0x25, 0x50, 0x44, 0x46}; // %PDF
    private static final byte[] ZIP_MAGIC = new byte[]{0x50, 0x4B, 0x03, 0x04}; // PK.. (DOCX)
    private static final byte[] OLE_MAGIC = new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0}; // OLE2 (DOC)

    /**
     * Extracts text from an uploaded resume file (PDF, DOCX, DOC) in-memory.
     * Guarantees no permanent persistence or credential logging.
     */
    public String extractText(MultipartFile file) {
        validateFile(file);

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "uploaded_document";
        String lowerName = originalName.toLowerCase(Locale.ROOT);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            log.error("Failed to read file bytes: {}", e.getMessage());
            throw new BadRequestException("Unable to read uploaded resume file. Please ensure the document is not corrupted.");
        }

        if (bytes == null || bytes.length == 0) {
            throw new BadRequestException("The uploaded file is empty. Please select a valid resume document.");
        }

        String extracted;
        if (lowerName.endsWith(".pdf")) {
            extracted = extractFromPdf(bytes, originalName);
        } else if (lowerName.endsWith(".docx")) {
            extracted = extractFromDocx(bytes, originalName);
        } else if (lowerName.endsWith(".doc")) {
            extracted = extractFromDoc(bytes, originalName);
        } else {
            throw new BadRequestException("Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx, .doc).");
        }

        if (extracted == null || extracted.trim().isEmpty()) {
            throw new BadRequestException("No readable text could be extracted from '" + originalName + 
                    "'. If this is a scanned image PDF, please provide a text-based resume.");
        }

        return extracted.trim();
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a resume file to upload.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds the 10MB limit. Please upload a smaller document.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new BadRequestException("Invalid filename. Please upload a valid document.");
        }

        String lower = filename.toLowerCase(Locale.ROOT);
        if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".doc")) {
            throw new BadRequestException("Unsupported file type: '" + filename + 
                    "'. Allowed formats are PDF (.pdf) and Microsoft Word (.docx, .doc).");
        }
    }

    private String extractFromPdf(byte[] bytes, String fileName) {
        if (!matchesMagic(bytes, PDF_MAGIC)) {
            throw new BadRequestException("File '" + fileName + "' has a .pdf extension but its content does not match the PDF standard format.");
        }

        try (PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(bytes))) {
            if (document.isEncrypted()) {
                throw new BadRequestException("PDF file '" + fileName + "' is password-protected or encrypted. Please provide an unlocked document.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        } catch (BadRequestException bre) {
            throw bre;
        } catch (Exception e) {
            log.warn("PDF parsing failed for {}: {}", fileName, e.getMessage());
            throw new BadRequestException("Could not parse PDF file '" + fileName + "'. The document may be corrupted or malformed: " + e.getMessage());
        }
    }

    private String extractFromDocx(byte[] bytes, String fileName) {
        if (!matchesMagic(bytes, ZIP_MAGIC)) {
            throw new BadRequestException("File '" + fileName + "' has a .docx extension but its content is not a valid OpenXML Word document.");
        }

        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes));
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        } catch (Exception e) {
            log.warn("DOCX parsing failed for {}: {}", fileName, e.getMessage());
            throw new BadRequestException("Could not parse Word DOCX file '" + fileName + "'. The document may be corrupted: " + e.getMessage());
        }
    }

    private String extractFromDoc(byte[] bytes, String fileName) {
        if (!matchesMagic(bytes, OLE_MAGIC)) {
            throw new BadRequestException("File '" + fileName + "' has a .doc extension but its content is not a valid Microsoft Compound Document.");
        }

        try (HWPFDocument doc = new HWPFDocument(new ByteArrayInputStream(bytes));
             WordExtractor extractor = new WordExtractor(doc)) {
            return extractor.getText();
        } catch (Exception e) {
            log.warn("DOC parsing failed for {}: {}", fileName, e.getMessage());
            throw new BadRequestException("Could not parse legacy Word DOC file '" + fileName + "'. The document may be corrupted: " + e.getMessage());
        }
    }

    private boolean matchesMagic(byte[] data, byte[] magic) {
        if (data == null || data.length < magic.length) {
            return false;
        }
        for (int i = 0; i < magic.length; i++) {
            if (data[i] != magic[i]) {
                return false;
            }
        }
        return true;
    }
}
