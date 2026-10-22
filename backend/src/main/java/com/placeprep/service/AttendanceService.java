package com.placeprep.service;

import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.CrtAttendanceRecord;
import com.placeprep.model.CrtTrainingSession;
import com.placeprep.repository.ClassAttendanceRecordRepository;
import com.placeprep.repository.ClassAttendanceSessionRepository;
import com.placeprep.repository.CrtAttendanceRecordRepository;
import com.placeprep.repository.CrtTrainingSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.placeprep.model.StudentAcademicRecord;
import com.placeprep.model.User;
import com.placeprep.repository.StudentAcademicRecordRepository;
import com.placeprep.repository.UserRepository;

@Service
public class AttendanceService {

    public static final double SHORTAGE_THRESHOLD = 75.0;
    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private ClassAttendanceSessionRepository classSessionRepo;

    @Autowired
    private ClassAttendanceRecordRepository classRecordRepo;

    @Autowired
    private CrtTrainingSessionRepository crtSessionRepo;

    @Autowired
    private CrtAttendanceRecordRepository crtRecordRepo;

    @Autowired(required = false)
    private StudentAcademicRecordRepository studentAcademicRecordRepo;

    @Autowired(required = false)
    private UserRepository userRepo;

    // --- CLASS ATTENDANCE ---

    public ClassAttendanceSession createClassSession(ClassAttendanceSession session) {
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(LocalDateTime.now().format(TS));
        }
        return classSessionRepo.save(session);
    }

    public ClassAttendanceSession findOrCreateClassSession(ClassAttendanceSession session) {
        if (session.getDepartment() != null && session.getSemester() != null
                && session.getSubjectCode() != null && session.getSessionDate() != null) {
            Optional<ClassAttendanceSession> existing = classSessionRepo
                    .findFirstByDepartmentAndSemesterAndSubjectCodeAndSessionDate(
                            session.getDepartment(),
                            session.getSemester(),
                            session.getSubjectCode(),
                            session.getSessionDate()
                    );
            if (existing.isPresent()) {
                ClassAttendanceSession cur = existing.get();
                if (session.getFacultyName() != null && !session.getFacultyName().isEmpty()) {
                    cur.setFacultyName(session.getFacultyName());
                }
                if (session.getFacultyId() != null && !session.getFacultyId().isEmpty()) {
                    cur.setFacultyId(session.getFacultyId());
                }
                if (session.getSubjectName() != null && !session.getSubjectName().isEmpty()) {
                    cur.setSubjectName(session.getSubjectName());
                }
                if (session.getPeriodNumber() != null) {
                    cur.setPeriodNumber(session.getPeriodNumber());
                }
                return classSessionRepo.save(cur);
            }
        }
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(LocalDateTime.now().format(TS));
        }
        return classSessionRepo.save(session);
    }

    public List<ClassAttendanceRecord> getSessionRecords(Long sessionId) {
        return classRecordRepo.findBySessionId(sessionId);
    }

    public List<ClassAttendanceSession> getClassSessions(String department, String semester) {
        if (department != null && semester != null) {
            return classSessionRepo.findByDepartmentAndSemesterOrderBySessionDateDesc(department, semester);
        }
        return classSessionRepo.findAll();
    }

    @Transactional
    public List<ClassAttendanceRecord> markClassAttendance(Long sessionId, List<ClassAttendanceRecord> records) {
        ClassAttendanceSession session = classSessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        List<ClassAttendanceRecord> saved = new ArrayList<>();
        String now = LocalDateTime.now().format(TS);

        for (ClassAttendanceRecord rec : records) {
            rec.setSessionId(sessionId);
            rec.setRecordedAt(now);
            Optional<ClassAttendanceRecord> existing = classRecordRepo.findBySessionIdAndStudentId(sessionId, rec.getStudentId());
            if (existing.isPresent()) {
                ClassAttendanceRecord cur = existing.get();
                cur.setStatus(rec.getStatus());
                cur.setRemarks(rec.getRemarks());
                cur.setRecordedAt(now);
                saved.add(classRecordRepo.save(cur));
            } else {
                saved.add(classRecordRepo.save(rec));
            }
        }
        return saved;
    }

    public Map<String, Object> getClassAttendanceReport(String department, String semester, String subjectCode, String targetDate) {
        List<ClassAttendanceSession> sessions = classSessionRepo
                .findByDepartmentAndSemesterAndSubjectCodeOrderBySessionDateDesc(department, semester, subjectCode);

        int classesHeld = sessions.size();
        List<Map<String, Object>> roster = getClassRoster(department, semester);

        Long targetSessionId = null;
        if (targetDate != null && !targetDate.trim().isEmpty()) {
            for (ClassAttendanceSession s : sessions) {
                if (targetDate.equals(s.getSessionDate())) {
                    targetSessionId = s.getId();
                    break;
                }
            }
        } else if (!sessions.isEmpty()) {
            targetSessionId = sessions.get(0).getId();
        }

        Map<String, String> targetStatuses = new HashMap<>();
        if (targetSessionId != null) {
            List<ClassAttendanceRecord> targetRecs = classRecordRepo.findBySessionId(targetSessionId);
            for (ClassAttendanceRecord tr : targetRecs) {
                targetStatuses.put(tr.getStudentId(), tr.getStatus());
            }
        }

        Map<String, Integer> attendedMap = new HashMap<>();
        for (ClassAttendanceSession s : sessions) {
            List<ClassAttendanceRecord> recs = classRecordRepo.findBySessionId(s.getId());
            for (ClassAttendanceRecord r : recs) {
                boolean attended = "PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus());
                if (attended) {
                    attendedMap.put(r.getStudentId(), attendedMap.getOrDefault(r.getStudentId(), 0) + 1);
                }
            }
        }

        List<Map<String, Object>> reportRows = new ArrayList<>();
        int shortageCount = 0;
        int totalEnrolled = roster.size();
        double sumPercentage = 0.0;

        for (Map<String, Object> stu : roster) {
            String studentId = (String) stu.get("studentId");
            String rollNumber = (String) stu.get("rollNumber");
            String name = (String) stu.get("name");

            int attended = attendedMap.getOrDefault(studentId, 0);
            double percentage = classesHeld > 0 ? (attended * 100.0 / classesHeld) : 100.0;
            percentage = Math.round(percentage * 10.0) / 10.0;

            boolean shortageWarning = (percentage < SHORTAGE_THRESHOLD) && (classesHeld > 0);
            if (shortageWarning) {
                shortageCount++;
            }
            sumPercentage += percentage;

            String currentStatus = targetStatuses.getOrDefault(studentId, "UNMARKED");

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("studentId", studentId);
            row.put("rollNumber", rollNumber);
            row.put("name", name);
            row.put("classesAttended", attended);
            row.put("classesHeld", classesHeld);
            row.put("attendancePercentage", percentage);
            row.put("currentStatus", currentStatus);
            row.put("shortageWarning", shortageWarning);
            reportRows.add(row);
        }

        double averageAttendance = totalEnrolled > 0 ? Math.round((sumPercentage / totalEnrolled) * 10.0) / 10.0 : 100.0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("department", department);
        result.put("semester", semester);
        result.put("subjectCode", subjectCode);
        result.put("targetDate", targetDate);
        result.put("classesHeld", classesHeld);
        result.put("totalStudents", totalEnrolled);
        result.put("shortageCount", shortageCount);
        result.put("shortageThreshold", SHORTAGE_THRESHOLD);
        result.put("averageAttendance", averageAttendance);
        result.put("roster", reportRows);
        return result;
    }

    public List<Map<String, Object>> getClassRoster(String department, String semester) {
        List<Map<String, Object>> list = new ArrayList<>();

        if (studentAcademicRecordRepo != null) {
            try {
                List<StudentAcademicRecord> all = studentAcademicRecordRepo.findAll();
                for (StudentAcademicRecord s : all) {
                    boolean matchBranch = department == null || department.trim().isEmpty() ||
                            (s.getBranch() != null && (s.getBranch().toLowerCase().contains(department.toLowerCase()) || department.toLowerCase().contains(s.getBranch().toLowerCase())));
                    if (matchBranch) {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("studentId", s.getEmail() != null ? s.getEmail() : s.getStudentId());
                        map.put("rollNumber", s.getStudentId());
                        map.put("name", s.getName());
                        map.put("email", s.getEmail());
                        map.put("department", s.getBranch());
                        map.put("semester", semester != null ? semester : "6");
                        list.add(map);
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (list.isEmpty() && userRepo != null) {
            try {
                List<User> users = userRepo.findAll();
                for (User u : users) {
                    if ("student".equalsIgnoreCase(u.getRole())) {
                        boolean matchBranch = department == null || department.trim().isEmpty() ||
                                (u.getBranch() != null && (u.getBranch().toLowerCase().contains(department.toLowerCase()) || department.toLowerCase().contains(u.getBranch().toLowerCase())));
                        if (matchBranch) {
                            Map<String, Object> map = new LinkedHashMap<>();
                            map.put("studentId", u.getEmail());
                            map.put("rollNumber", u.getRollNumber() != null ? u.getRollNumber() : "22CS" + String.format("%04d", u.getId()));
                            map.put("name", u.getName());
                            map.put("email", u.getEmail());
                            map.put("department", u.getBranch());
                            map.put("semester", semester != null ? semester : "6");
                            list.add(map);
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (list.isEmpty()) {
            list = getDefaultClassRoster(department, semester);
        }
        return list;
    }

    private List<Map<String, Object>> getDefaultClassRoster(String department, String semester) {
        String deptCode = (department != null && department.toUpperCase().contains("IT")) ? "IT" :
                          (department != null && department.toUpperCase().contains("EC")) ? "EC" : "CS";
        String[][] students = {
            {"22" + deptCode + "0101", "Priyansh Jain", "priyansh.jain@example.edu"},
            {"22" + deptCode + "0102", "Ananya Sharma", "ananya.sharma@example.edu"},
            {"22" + deptCode + "0103", "Rohan Kulkarni", "rohan.kulkarni@example.edu"},
            {"22" + deptCode + "0104", "Siddharth Nair", "siddharth.nair@example.edu"},
            {"22" + deptCode + "0105", "Meera Venkat", "meera.venkat@example.edu"},
            {"22" + deptCode + "0106", "Kabir Mehta", "kabir.mehta@example.edu"},
            {"22" + deptCode + "0107", "Divya Reddy", "divya.reddy@example.edu"},
            {"22" + deptCode + "0108", "Aarav Gupta", "aarav.gupta@example.edu"},
            {"22" + deptCode + "0109", "Ishita Verma", "ishita.verma@example.edu"},
            {"22" + deptCode + "0110", "Tanmay Deshmukh", "tanmay.deshmukh@example.edu"},
            {"22" + deptCode + "0111", "Sneha Iyer", "sneha.iyer@example.edu"},
            {"22" + deptCode + "0112", "Aditya Rawat", "aditya.rawat@example.edu"}
        };

        List<Map<String, Object>> roster = new ArrayList<>();
        for (String[] s : students) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("studentId", s[2]);
            map.put("rollNumber", s[0]);
            map.put("name", s[1]);
            map.put("email", s[2]);
            map.put("department", department != null ? department : "CSE");
            map.put("semester", semester != null ? semester : "6");
            roster.add(map);
        }
        return roster;
    }

    public Map<String, Object> getStudentAttendanceSummary(String studentId) {
        List<ClassAttendanceRecord> records = classRecordRepo.findByStudentId(studentId);

        int totalSessions = records.size();
        int attendedSessions = 0;

        Map<String, int[]> subjectMap = new HashMap<>(); // [attended, total]

        for (ClassAttendanceRecord rec : records) {
            boolean present = "PRESENT".equalsIgnoreCase(rec.getStatus()) || "LATE".equalsIgnoreCase(rec.getStatus());
            if (present) {
                attendedSessions++;
            }

            Optional<ClassAttendanceSession> sOpt = classSessionRepo.findById(rec.getSessionId());
            String subject = sOpt.map(ClassAttendanceSession::getSubjectName).orElse("General");

            subjectMap.putIfAbsent(subject, new int[]{0, 0});
            if (present) {
                subjectMap.get(subject)[0]++;
            }
            subjectMap.get(subject)[1]++;
        }

        double overallPercentage = totalSessions > 0 ? (attendedSessions * 100.0 / totalSessions) : 100.0;
        boolean shortageWarning = overallPercentage < 75.0;

        List<Map<String, Object>> subjectBreakdown = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : subjectMap.entrySet()) {
            Map<String, Object> sub = new HashMap<>();
            sub.put("subject", entry.getKey());
            sub.put("attended", entry.getValue()[0]);
            sub.put("total", entry.getValue()[1]);
            double pct = entry.getValue()[1] > 0 ? (entry.getValue()[0] * 100.0 / entry.getValue()[1]) : 100.0;
            sub.put("percentage", Math.round(pct * 10.0) / 10.0);
            sub.put("shortage", pct < 75.0);
            subjectBreakdown.add(sub);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("studentId", studentId);
        summary.put("totalClasses", totalSessions);
        summary.put("attendedClasses", attendedSessions);
        summary.put("overallPercentage", Math.round(overallPercentage * 10.0) / 10.0);
        summary.put("shortageWarning", shortageWarning);
        summary.put("minimumRequiredPercentage", 75.0);
        summary.put("subjectBreakdown", subjectBreakdown);
        return summary;
    }

    // --- CRT ATTENDANCE ---

    public CrtTrainingSession createCrtSession(CrtTrainingSession session) {
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(LocalDateTime.now().format(TS));
        }
        return crtSessionRepo.save(session);
    }

    public List<CrtTrainingSession> getCrtSessions(String targetBatch) {
        if (targetBatch != null && !targetBatch.trim().isEmpty()) {
            return crtSessionRepo.findByTargetBatchOrderByScheduledDateDesc(targetBatch);
        }
        return crtSessionRepo.findAllByOrderByScheduledDateDesc();
    }

    @Transactional
    public List<CrtAttendanceRecord> markCrtAttendance(Long crtSessionId, List<CrtAttendanceRecord> records) {
        CrtTrainingSession session = crtSessionRepo.findById(crtSessionId)
                .orElseThrow(() -> new IllegalArgumentException("CRT Session not found: " + crtSessionId));

        List<CrtAttendanceRecord> saved = new ArrayList<>();
        String now = LocalDateTime.now().format(TS);

        for (CrtAttendanceRecord rec : records) {
            rec.setCrtSessionId(crtSessionId);
            rec.setRecordedAt(now);
            Optional<CrtAttendanceRecord> existing = crtRecordRepo.findByCrtSessionIdAndStudentId(crtSessionId, rec.getStudentId());
            if (existing.isPresent()) {
                CrtAttendanceRecord cur = existing.get();
                cur.setStatus(rec.getStatus());
                cur.setAssessmentScore(rec.getAssessmentScore());
                cur.setRemarks(rec.getRemarks());
                cur.setRecordedAt(now);
                saved.add(crtRecordRepo.save(cur));
            } else {
                saved.add(crtRecordRepo.save(rec));
            }
        }
        return saved;
    }

    public Map<String, Object> getStudentCrtSummary(String studentId) {
        List<CrtAttendanceRecord> records = crtRecordRepo.findByStudentId(studentId);
        int total = records.size();
        int attended = 0;
        double totalScore = 0;
        int scoredCount = 0;

        for (CrtAttendanceRecord r : records) {
            if ("ATTENDED".equalsIgnoreCase(r.getStatus())) {
                attended++;
            }
            if (r.getAssessmentScore() != null) {
                totalScore += r.getAssessmentScore();
                scoredCount++;
            }
        }

        double rate = total > 0 ? (attended * 100.0 / total) : 0.0;
        double avgScore = scoredCount > 0 ? (totalScore / scoredCount) : 0.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("studentId", studentId);
        summary.put("totalCrtSessions", total);
        summary.put("attendedCrtSessions", attended);
        summary.put("crtParticipationPercentage", Math.round(rate * 10.0) / 10.0);
        summary.put("averageAssessmentScore", Math.round(avgScore * 10.0) / 10.0);
        summary.put("eligibleForPlacementDrives", rate >= 75.0);
        summary.put("records", records);
        return summary;
    }
}
