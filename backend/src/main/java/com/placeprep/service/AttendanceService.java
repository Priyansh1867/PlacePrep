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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AttendanceService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private ClassAttendanceSessionRepository classSessionRepo;

    @Autowired
    private ClassAttendanceRecordRepository classRecordRepo;

    @Autowired
    private CrtTrainingSessionRepository crtSessionRepo;

    @Autowired
    private CrtAttendanceRecordRepository crtRecordRepo;

    // --- CLASS ATTENDANCE ---

    public ClassAttendanceSession createClassSession(ClassAttendanceSession session) {
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(LocalDateTime.now().format(TS));
        }
        return classSessionRepo.save(session);
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
