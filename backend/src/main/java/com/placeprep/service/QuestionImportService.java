package com.placeprep.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.exception.BadRequestException;
import com.placeprep.model.InterviewQuestion;
import com.placeprep.repository.InterviewQuestionRepository;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class QuestionImportService {

    private static final Logger log = LoggerFactory.getLogger(QuestionImportService.class);
    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    @Autowired
    private InterviewQuestionRepository questionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> importQuestions(MultipartFile file) {
        validateFile(file);

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase(Locale.ROOT) : "";
        List<InterviewQuestion> parsedQuestions = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try {
            if (filename.endsWith(".json")) {
                parsedQuestions = parseJson(file);
            } else if (filename.endsWith(".csv")) {
                parsedQuestions = parseCsv(file, errors);
            } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                parsedQuestions = parseExcel(file, errors);
            } else {
                throw new BadRequestException("Unsupported file format. Please upload a JSON (.json), CSV (.csv), or Excel (.xlsx) file.");
            }
        } catch (BadRequestException bre) {
            throw bre;
        } catch (Exception e) {
            log.error("Failed to parse question file: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to parse uploaded question file: " + e.getMessage());
        }

        int successCount = 0;
        int errorCount = errors.size();

        for (int i = 0; i < parsedQuestions.size(); i++) {
            InterviewQuestion q = parsedQuestions.get(i);
            try {
                if (q.getQuestionId() == null || q.getQuestionId().trim().isEmpty()) {
                    q.setQuestionId("Q_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                }
                if (q.getCompanyId() == null || q.getCompanyId().trim().isEmpty()) {
                    q.setCompanyId("GENERAL");
                }
                if (q.getQuestion() == null || q.getQuestion().trim().isEmpty()) {
                    throw new IllegalArgumentException("Question description is empty.");
                }

                // Check if questionId already exists
                Optional<InterviewQuestion> existing = questionRepository.findByQuestionId(q.getQuestionId());
                if (existing.isPresent()) {
                    InterviewQuestion eq = existing.get();
                    eq.setCompanyId(q.getCompanyId());
                    eq.setRound(q.getRound());
                    eq.setCategory(q.getCategory());
                    eq.setDifficulty(q.getDifficulty());
                    eq.setQuestion(q.getQuestion());
                    eq.setApproach(q.getApproach());
                    eq.setSuggestedAnswer(q.getSuggestedAnswer());
                    eq.setSampleCode(q.getSampleCode());
                    eq.setFrequencyScore(q.getFrequencyScore());
                    eq.setRecencyRating(q.getRecencyRating());
                    eq.setTimesReported(q.getTimesReported());
                    eq.setLastReportedDate(q.getLastReportedDate());
                    eq.setVerifiedHistorical(q.isVerifiedHistorical());
                    if (q.getSkills() != null && !q.getSkills().isEmpty()) {
                        eq.setSkills(q.getSkills());
                    }
                    if (q.getFollowUps() != null && !q.getFollowUps().isEmpty()) {
                        eq.setFollowUps(q.getFollowUps());
                    }
                    questionRepository.save(eq);
                } else {
                    questionRepository.save(q);
                }
                successCount++;
            } catch (Exception e) {
                errorCount++;
                errors.add("Row/Item " + (i + 1) + " save failed: " + e.getMessage());
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalParsed", parsedQuestions.size());
        summary.put("successCount", successCount);
        summary.put("errorCount", errorCount);
        summary.put("errors", errors);
        return summary;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds 10MB limit.");
        }
    }

    private List<InterviewQuestion> parseJson(MultipartFile file) throws Exception {
        try {
            return objectMapper.readValue(file.getInputStream(), new TypeReference<List<InterviewQuestion>>() {});
        } catch (Exception e) {
            // Try single object
            InterviewQuestion single = objectMapper.readValue(file.getInputStream(), InterviewQuestion.class);
            return List.of(single);
        }
    }

    private List<InterviewQuestion> parseCsv(MultipartFile file, List<String> errors) {
        List<InterviewQuestion> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new BadRequestException("CSV file is empty.");
            }
            String[] headers = headerLine.split(",");
            Map<String, Integer> headerMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                headerMap.put(headers[i].trim().toLowerCase(Locale.ROOT), i);
            }

            String line;
            int rowNum = 1;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                String[] cols = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                try {
                    InterviewQuestion q = new InterviewQuestion();
                    q.setQuestionId(getCol(cols, headerMap, "questionid", "id", "question_id"));
                    q.setCompanyId(getCol(cols, headerMap, "companyid", "company", "company_id"));
                    q.setRound(getCol(cols, headerMap, "round"));
                    q.setCategory(getCol(cols, headerMap, "category", "topic"));
                    q.setDifficulty(getCol(cols, headerMap, "difficulty"));
                    q.setQuestion(getCol(cols, headerMap, "question", "title", "description"));
                    q.setApproach(getCol(cols, headerMap, "approach"));
                    q.setSuggestedAnswer(getCol(cols, headerMap, "suggestedanswer", "answer"));
                    q.setSampleCode(getCol(cols, headerMap, "samplecode", "code"));

                    String freqStr = getCol(cols, headerMap, "frequencyscore", "frequency");
                    if (freqStr != null && !freqStr.isEmpty()) {
                        q.setFrequencyScore(Integer.parseInt(freqStr.replaceAll("[^0-9]", "")));
                    }

                    q.setRecencyRating(getCol(cols, headerMap, "recencyrating", "recency"));

                    String skillsStr = getCol(cols, headerMap, "skills");
                    if (skillsStr != null && !skillsStr.isEmpty()) {
                        q.setSkills(Arrays.asList(skillsStr.split("[;|]")));
                    }

                    list.add(q);
                } catch (Exception e) {
                    errors.add("CSV Row " + rowNum + " parse error: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse CSV file: " + e.getMessage());
        }
        return list;
    }

    private List<InterviewQuestion> parseExcel(MultipartFile file, List<String> errors) {
        List<InterviewQuestion> list = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();
            if (!rowIterator.hasNext()) {
                throw new BadRequestException("Excel file is empty.");
            }

            Row headerRow = rowIterator.next();
            Map<String, Integer> headerMap = new HashMap<>();
            for (Cell cell : headerRow) {
                headerMap.put(cell.getStringCellValue().trim().toLowerCase(Locale.ROOT), cell.getColumnIndex());
            }

            int rowNum = 1;
            while (rowIterator.hasNext()) {
                rowNum++;
                Row row = rowIterator.next();
                try {
                    InterviewQuestion q = new InterviewQuestion();
                    q.setQuestionId(getCellVal(row, headerMap, "questionid", "id", "question_id"));
                    q.setCompanyId(getCellVal(row, headerMap, "companyid", "company", "company_id"));
                    q.setRound(getCellVal(row, headerMap, "round"));
                    q.setCategory(getCellVal(row, headerMap, "category", "topic"));
                    q.setDifficulty(getCellVal(row, headerMap, "difficulty"));
                    q.setQuestion(getCellVal(row, headerMap, "question", "title", "description"));
                    q.setApproach(getCellVal(row, headerMap, "approach"));
                    q.setSuggestedAnswer(getCellVal(row, headerMap, "suggestedanswer", "answer"));
                    q.setSampleCode(getCellVal(row, headerMap, "samplecode", "code"));

                    String freqStr = getCellVal(row, headerMap, "frequencyscore", "frequency");
                    if (freqStr != null && !freqStr.isEmpty()) {
                        try {
                            q.setFrequencyScore((int) Double.parseDouble(freqStr));
                        } catch (Exception ignored) {}
                    }

                    q.setRecencyRating(getCellVal(row, headerMap, "recencyrating", "recency"));

                    String skillsStr = getCellVal(row, headerMap, "skills");
                    if (skillsStr != null && !skillsStr.isEmpty()) {
                        q.setSkills(Arrays.asList(skillsStr.split("[;|]")));
                    }

                    list.add(q);
                } catch (Exception e) {
                    errors.add("Excel Row " + rowNum + " parse error: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse Excel file: " + e.getMessage());
        }
        return list;
    }

    private String getCol(String[] cols, Map<String, Integer> headerMap, String... keys) {
        for (String key : keys) {
            Integer idx = headerMap.get(key);
            if (idx != null && idx < cols.length) {
                String val = cols[idx].trim();
                if (val.startsWith("\"") && val.endsWith("\"")) {
                    val = val.substring(1, val.length() - 1);
                }
                return val;
            }
        }
        return "";
    }

    private String getCellVal(Row row, Map<String, Integer> headerMap, String... keys) {
        for (String key : keys) {
            Integer idx = headerMap.get(key);
            if (idx != null) {
                Cell cell = row.getCell(idx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                if (cell == null) return "";
                DataFormatter formatter = new DataFormatter();
                return formatter.formatCellValue(cell).trim();
            }
        }
        return "";
    }
}
