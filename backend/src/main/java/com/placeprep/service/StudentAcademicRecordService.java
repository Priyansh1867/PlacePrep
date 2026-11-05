package com.placeprep.service;

import com.placeprep.model.StudentAcademicRecord;
import com.placeprep.model.User;
import com.placeprep.repository.StudentAcademicRecordRepository;
import com.placeprep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StudentAcademicRecordService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private StudentAcademicRecordRepository recordRepository;

    @Autowired
    private UserRepository userRepository;

    public List<StudentAcademicRecord> findAllRecords() {
        return recordRepository.findAll();
    }

    public Optional<StudentAcademicRecord> findForStudent(String studentEmailOrId) {
        Optional<StudentAcademicRecord> byEmail = recordRepository.findByEmail(studentEmailOrId);
        if (byEmail.isPresent()) {
            return byEmail;
        }
        return recordRepository.findByStudentId(studentEmailOrId);
    }

    public StudentAcademicRecord saveRecord(StudentAcademicRecord record) {
        if (record.getEmail() == null || record.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("email is required");
        }
        if (record.getStudentId() == null || record.getStudentId().trim().isEmpty()) {
            record.setStudentId(record.getEmail());
        }
        return recordRepository.save(record);
    }

    @Transactional
    public Map<String, Object> syncRawRecords(List<Map<String, Object>> rawRecords) {
        if (rawRecords == null || rawRecords.isEmpty()) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("synced", 0);
            res.put("message", "No records provided");
            return res;
        }

        List<StudentAcademicRecord> parsedList = new ArrayList<>();
        for (Map<String, Object> map : rawRecords) {
            if (map == null) continue;
            String email = map.get("email") != null ? String.valueOf(map.get("email")).trim() : null;
            if (email == null || email.isEmpty()) continue;

            StudentAcademicRecord r = new StudentAcademicRecord();
            r.setEmail(email);

            Object sid = map.get("studentId");
            if (sid == null) sid = map.get("id");
            if (sid == null) sid = map.get("registrationNumber");
            if (sid == null) sid = map.get("rollNumber");
            r.setStudentId(sid != null ? String.valueOf(sid).trim() : email);

            Object name = map.get("name");
            if (name == null) name = map.get("fullName");
            r.setName(name != null ? String.valueOf(name).trim() : null);

            r.setBranch(map.get("branch") != null ? String.valueOf(map.get("branch")).trim() : null);
            r.setGraduationBatch(map.get("graduationBatch") != null ? String.valueOf(map.get("graduationBatch")).trim() : null);

            r.setTenthPercentage(toDouble(map.get("tenthPercentage")));
            r.setTwelfthPercentage(toDouble(map.get("twelfthPercentage")));
            r.setDiplomaPercentage(toDouble(map.get("diplomaPercentage")));
            r.setCgpa(toDouble(map.get("cgpa")));

            r.setSem1Sgpa(toDouble(map.get("sem1Sgpa")));
            r.setSem2Sgpa(toDouble(map.get("sem2Sgpa")));
            r.setSem3Sgpa(toDouble(map.get("sem3Sgpa")));
            r.setSem4Sgpa(toDouble(map.get("sem4Sgpa")));
            r.setSem5Sgpa(toDouble(map.get("sem5Sgpa")));
            r.setSem6Sgpa(toDouble(map.get("sem6Sgpa")));
            r.setSem7Sgpa(toDouble(map.get("sem7Sgpa")));
            r.setSem8Sgpa(toDouble(map.get("sem8Sgpa")));

            r.setActiveBacklogs(toInteger(map.get("activeBacklogs")));

            if (r.getCgpa() == null) {
                r.setCgpa(computeCgpaFromSemesters(r));
            }

            parsedList.add(r);
        }

        return syncRecords(parsedList);
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            String s = String.valueOf(val).trim();
            return s.isEmpty() ? null : Double.parseDouble(s);
        } catch (Exception e) {
            return null;
        }
    }

    private Integer toInteger(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).intValue();
        try {
            String s = String.valueOf(val).trim();
            return s.isEmpty() ? null : Integer.parseInt(s);
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public Map<String, Object> syncRecords(List<StudentAcademicRecord> records) {
        if (records == null || records.isEmpty()) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("synced", 0);
            res.put("message", "No records provided");
            return res;
        }

        int imported = 0;
        int updated = 0;

        for (StudentAcademicRecord record : records) {
            if (record.getEmail() == null || record.getEmail().trim().isEmpty()) {
                continue;
            }
            if (record.getStudentId() == null || record.getStudentId().trim().isEmpty()) {
                record.setStudentId(record.getEmail());
            }

            Optional<StudentAcademicRecord> existing = recordRepository.findByEmail(record.getEmail());
            if (existing.isEmpty() && record.getStudentId() != null) {
                existing = recordRepository.findByStudentId(record.getStudentId());
            }

            if (existing.isPresent()) {
                StudentAcademicRecord target = existing.get();
                merge(target, record);
                recordRepository.save(target);
                syncUserFromRecord(target);
                updated++;
            } else {
                record.setVerified(true);
                if (record.getVerifiedBy() == null || record.getVerifiedBy().trim().isEmpty()) {
                    record.setVerifiedBy("SYSTEM_SYNC");
                }
                if (record.getVerifiedAt() == null || record.getVerifiedAt().trim().isEmpty()) {
                    record.setVerifiedAt(LocalDateTime.now().format(TS));
                }
                recordRepository.save(record);
                syncUserFromRecord(record);
                imported++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("synced", imported + updated);
        result.put("imported", imported);
        result.put("updated", updated);
        result.put("message", String.format("Successfully synced %d records (imported %d, updated %d)",
                imported + updated, imported, updated));
        return result;
    }

    @Transactional
    public Map<String, Object> importCsv(InputStream inputStream, String verifiedBy) {
        List<Map<String, String>> errors = new ArrayList<>();
        int imported = 0;
        int updated = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("CSV file is empty");
            }
            String[] headers = splitCsvLine(headerLine);
            Map<String, Integer> index = headerIndex(headers);

            String line;
            int rowNum = 1;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.trim().isEmpty()) {
                    continue;
                }
                try {
                    String[] cols = splitCsvLine(line);
                    StudentAcademicRecord record = mapRow(cols, index);
                    record.setVerified(true);
                    record.setVerifiedBy(verifiedBy != null ? verifiedBy : "TPO");
                    record.setVerifiedAt(LocalDateTime.now().format(TS));

                    Optional<StudentAcademicRecord> existing = recordRepository.findByEmail(record.getEmail());
                    if (existing.isPresent()) {
                        merge(existing.get(), record);
                        recordRepository.save(existing.get());
                        syncUserFromRecord(existing.get());
                        updated++;
                    } else {
                        recordRepository.save(record);
                        syncUserFromRecord(record);
                        imported++;
                    }
                } catch (Exception e) {
                    Map<String, String> err = new HashMap<>();
                    err.put("row", String.valueOf(rowNum));
                    err.put("error", e.getMessage());
                    errors.add(err);
                }
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to read CSV: " + e.getMessage(), e);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("imported", imported);
        result.put("updated", updated);
        result.put("errors", errors);
        result.put("summary", String.format("Imported %d, updated %d, %d row errors", imported, updated, errors.size()));
        return result;
    }

    public void applyVerifiedAcademicsToUser(User user) {
        findForStudent(user.getEmail()).ifPresent(record -> {
            if (record.isVerified()) {
                copyToUser(user, record);
            }
        });
    }

    public void enrichApplicationFromVerifiedRecord(
            String studentId,
            String studentEmail,
            ApplicationAcademicSnapshot snapshot
    ) {
        Optional<StudentAcademicRecord> record = Optional.empty();
        if (studentEmail != null) {
            record = recordRepository.findByEmail(studentEmail);
        }
        if (!record.isPresent() && studentId != null) {
            record = recordRepository.findByStudentId(studentId);
        }
        if (record.isPresent() && record.get().isVerified()) {
            StudentAcademicRecord r = record.get();
            if (r.getCgpa() != null) {
                snapshot.cgpa = r.getCgpa();
            }
            if (r.getTenthPercentage() != null) {
                snapshot.tenth = r.getTenthPercentage();
            }
            Double twelfth = r.effectiveTwelfthOrDiploma();
            if (twelfth != null) {
                snapshot.twelfth = twelfth;
            }
            if (r.getActiveBacklogs() != null) {
                snapshot.backlogs = r.getActiveBacklogs();
            }
            if (r.getBranch() != null) {
                snapshot.branch = r.getBranch();
            }
            if (r.getGraduationBatch() != null) {
                snapshot.batch = r.getGraduationBatch();
            }
            snapshot.verified = true;
        }
    }

    public static class ApplicationAcademicSnapshot {
        public Double cgpa;
        public Double tenth;
        public Double twelfth;
        public Integer backlogs;
        public String branch;
        public String batch;
        public boolean verified;
    }

    private void syncUserFromRecord(StudentAcademicRecord record) {
        userRepository.findByEmail(record.getEmail()).ifPresent(user -> copyToUser(user, record));
    }

    private void copyToUser(User user, StudentAcademicRecord record) {
        if (record.getCgpa() != null) {
            user.setCgpa(record.getCgpa());
        }
        if (record.getTenthPercentage() != null) {
            user.setTenthPercentage(record.getTenthPercentage());
        }
        Double twelfth = record.effectiveTwelfthOrDiploma();
        if (twelfth != null) {
            user.setTwelfthPercentage(twelfth);
        }
        if (record.getActiveBacklogs() != null) {
            user.setActiveBacklogs(record.getActiveBacklogs());
        }
        if (record.getBranch() != null) {
            user.setBranch(record.getBranch());
        }
        if (record.getGraduationBatch() != null) {
            user.setGraduationBatch(record.getGraduationBatch());
        }
        userRepository.save(user);
    }

    private void merge(StudentAcademicRecord target, StudentAcademicRecord source) {
        target.setStudentId(source.getStudentId());
        target.setName(source.getName());
        target.setBranch(source.getBranch());
        target.setGraduationBatch(source.getGraduationBatch());
        target.setTenthPercentage(source.getTenthPercentage());
        target.setTwelfthPercentage(source.getTwelfthPercentage());
        target.setDiplomaPercentage(source.getDiplomaPercentage());
        target.setSem1Sgpa(source.getSem1Sgpa());
        target.setSem2Sgpa(source.getSem2Sgpa());
        target.setSem3Sgpa(source.getSem3Sgpa());
        target.setSem4Sgpa(source.getSem4Sgpa());
        target.setSem5Sgpa(source.getSem5Sgpa());
        target.setSem6Sgpa(source.getSem6Sgpa());
        target.setSem7Sgpa(source.getSem7Sgpa());
        target.setSem8Sgpa(source.getSem8Sgpa());
        target.setCgpa(source.getCgpa());
        target.setActiveBacklogs(source.getActiveBacklogs());
        target.setVerified(source.isVerified());
        target.setVerifiedAt(source.getVerifiedAt());
        target.setVerifiedBy(source.getVerifiedBy());
    }

    private StudentAcademicRecord mapRow(String[] cols, Map<String, Integer> index) {
        StudentAcademicRecord r = new StudentAcademicRecord();
        r.setEmail(require(cols, index, "email"));
        r.setStudentId(get(cols, index, "studentId", r.getEmail()));
        r.setName(get(cols, index, "name", null));
        r.setBranch(get(cols, index, "branch", null));
        r.setGraduationBatch(get(cols, index, "graduationBatch", null));
        r.setTenthPercentage(parseDouble(cols, index, "tenthPercentage"));
        r.setTwelfthPercentage(parseDouble(cols, index, "twelfthPercentage"));
        r.setDiplomaPercentage(parseDouble(cols, index, "diplomaPercentage"));
        r.setSem1Sgpa(parseDouble(cols, index, "sem1Sgpa"));
        r.setSem2Sgpa(parseDouble(cols, index, "sem2Sgpa"));
        r.setSem3Sgpa(parseDouble(cols, index, "sem3Sgpa"));
        r.setSem4Sgpa(parseDouble(cols, index, "sem4Sgpa"));
        r.setSem5Sgpa(parseDouble(cols, index, "sem5Sgpa"));
        r.setSem6Sgpa(parseDouble(cols, index, "sem6Sgpa"));
        r.setSem7Sgpa(parseDouble(cols, index, "sem7Sgpa"));
        r.setSem8Sgpa(parseDouble(cols, index, "sem8Sgpa"));
        r.setCgpa(parseDouble(cols, index, "cgpa"));
        r.setActiveBacklogs(parseInt(cols, index, "activeBacklogs"));
        if (r.getCgpa() == null) {
            r.setCgpa(computeCgpaFromSemesters(r));
        }
        return r;
    }

    private Double computeCgpaFromSemesters(StudentAcademicRecord r) {
        double sum = 0;
        int count = 0;
        Double[] sems = {
                r.getSem1Sgpa(), r.getSem2Sgpa(), r.getSem3Sgpa(), r.getSem4Sgpa(),
                r.getSem5Sgpa(), r.getSem6Sgpa(), r.getSem7Sgpa(), r.getSem8Sgpa()
        };
        for (Double s : sems) {
            if (s != null) {
                sum += s;
                count++;
            }
        }
        return count > 0 ? sum / count : null;
    }

    private Map<String, Integer> headerIndex(String[] headers) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            map.put(headers[i].trim().toLowerCase(), i);
        }
        return map;
    }

    private String require(String[] cols, Map<String, Integer> index, String key) {
        String val = get(cols, index, key, null);
        if (val == null || val.trim().isEmpty()) {
            throw new IllegalArgumentException("Missing required column: " + key);
        }
        return val.trim();
    }

    private String get(String[] cols, Map<String, Integer> index, String key, String defaultVal) {
        Integer i = index.get(key.toLowerCase());
        if (i == null || i >= cols.length) {
            return defaultVal;
        }
        String v = cols[i].trim();
        return v.isEmpty() ? defaultVal : v;
    }

    private Double parseDouble(String[] cols, Map<String, Integer> index, String key) {
        String v = get(cols, index, key, null);
        if (v == null) {
            return null;
        }
        return Double.parseDouble(v);
    }

    private Integer parseInt(String[] cols, Map<String, Integer> index, String key) {
        String v = get(cols, index, key, null);
        if (v == null) {
            return null;
        }
        return Integer.parseInt(v);
    }

    /** Simple CSV split (supports quoted fields). */
    private String[] splitCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        tokens.add(current.toString());
        return tokens.toArray(new String[0]);
    }
}
