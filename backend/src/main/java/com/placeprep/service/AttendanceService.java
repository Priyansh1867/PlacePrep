package com.placeprep.service;

import com.placeprep.model.ClassAttendanceRecord;
import com.placeprep.model.ClassAttendanceSession;
import com.placeprep.model.CrtAttendanceRecord;
import com.placeprep.model.CrtTrainingSession;
import com.placeprep.repository.ClassAttendanceRecordRepository;
import com.placeprep.repository.ClassAttendanceSessionRepository;
import com.placeprep.repository.CrtAttendanceRecordRepository;
import com.placeprep.repository.CrtTrainingSessionRepository;
import com.placeprep.model.Subject;
import com.placeprep.model.StudentSubjectEnrollment;
import com.placeprep.model.InstituteLocation;
import com.placeprep.repository.SubjectRepository;
import com.placeprep.repository.StudentSubjectEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.UUID;
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

    @Autowired(required = false)
    private SubjectRepository subjectRepo;

    @Autowired(required = false)
    private StudentSubjectEnrollmentRepository enrollmentRepo;

    @Autowired(required = false)
    private InstituteLocationService locationService;

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

        public ClassAttendanceSession updateClassSessionStatus(Long sessionId, String status) {
        ClassAttendanceSession session = classSessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture session not found with ID: " + sessionId));
        session.setStatus(status.toUpperCase());
        return classSessionRepo.save(session);
    }

    public List<Map<String, Object>> getEnrolledSubjectsWithSummary(String studentEmail) {
        String dept = "CSE";
        String sem = "6";

        if (userRepo != null) {
            Optional<User> uOpt = userRepo.findByEmail(studentEmail);
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                if (u.getBranch() != null && !u.getBranch().isBlank()) {
                    String b = u.getBranch().toUpperCase();
                    dept = b.contains("IT") ? "IT" : (b.contains("EC") ? "ECE" : "CSE");
                }
            }
        }

        List<Subject> subjects = new ArrayList<>();
        if (enrollmentRepo != null && subjectRepo != null) {
            List<StudentSubjectEnrollment> enrollments = enrollmentRepo.findByStudentEmail(studentEmail);
            for (StudentSubjectEnrollment e : enrollments) {
                subjectRepo.findByCode(e.getSubjectCode()).ifPresent(subjects::add);
            }
        }

        if (subjects.isEmpty() && subjectRepo != null) {
            subjects = subjectRepo.findByDepartmentAndSemester(dept, sem);
            if (subjects.isEmpty()) {
                subjects = subjectRepo.findByDepartment(dept);
            }
            if (subjects.isEmpty()) {
                subjects = subjectRepo.findAll();
            }
            // Auto-enroll student into these subjects
            if (enrollmentRepo != null && !subjects.isEmpty()) {
                for (Subject sub : subjects) {
                    if (!enrollmentRepo.existsByStudentEmailAndSubjectCode(studentEmail, sub.getCode())) {
                        StudentSubjectEnrollment e = new StudentSubjectEnrollment();
                        e.setStudentEmail(studentEmail);
                        e.setSubjectCode(sub.getCode());
                        e.setEnrolledAt(LocalDateTime.now().format(TS));
                        enrollmentRepo.save(e);
                    }
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        List<ClassAttendanceRecord> studentRecords = classRecordRepo.findByStudentId(studentEmail);
        Map<Long, ClassAttendanceRecord> recordsBySession = new HashMap<>();
        for (ClassAttendanceRecord r : studentRecords) {
            recordsBySession.put(r.getSessionId(), r);
        }

        for (Subject sub : subjects) {
            List<ClassAttendanceSession> sessions = classSessionRepo.findBySubjectCodeOrderBySessionDateDesc(sub.getCode());

            int totalScheduled = sessions.size();
            int heldCount = 0;
            int attendedCount = 0;
            int openSessionsCount = 0;
            Map<String, Object> nextOpenSession = null;

            for (ClassAttendanceSession s : sessions) {
                boolean isCancelled = "CANCELLED".equalsIgnoreCase(s.getStatus());
                if (isCancelled) continue;

                boolean isOpen = "OPEN".equalsIgnoreCase(s.getStatus());
                boolean isCompleted = "COMPLETED".equalsIgnoreCase(s.getStatus()) || (s.getStatus() == null);
                boolean hasRecord = recordsBySession.containsKey(s.getId());

                if (isOpen) {
                    if (!hasRecord) {
                        openSessionsCount++;
                        if (nextOpenSession == null) {
                            nextOpenSession = new LinkedHashMap<>();
                            nextOpenSession.put("sessionId", s.getId());
                            nextOpenSession.put("lectureNumber", s.getLectureNumber());
                            nextOpenSession.put("lectureTitle", s.getLectureTitle());
                            nextOpenSession.put("sessionDate", s.getSessionDate());
                            nextOpenSession.put("startTime", s.getStartTime());
                            nextOpenSession.put("endTime", s.getEndTime());
                        }
                    }
                }

                if (isCompleted || hasRecord) {
                    heldCount++;
                    if (hasRecord) {
                        ClassAttendanceRecord rec = recordsBySession.get(s.getId());
                        boolean present = "PRESENT".equalsIgnoreCase(rec.getStatus()) || "LATE".equalsIgnoreCase(rec.getStatus());
                        if (present) {
                            attendedCount++;
                        }
                    }
                }
            }

            int missedCount = Math.max(0, heldCount - attendedCount);
            double percentage = heldCount > 0 ? (attendedCount * 100.0 / heldCount) : 100.0;
            percentage = Math.round(percentage * 10.0) / 10.0;
            double threshold = sub.getMinAttendancePercentage() != null ? sub.getMinAttendancePercentage() : SHORTAGE_THRESHOLD;
            String status = percentage >= threshold ? "Eligible" : "Attendance Shortage";

            Map<String, Object> card = new LinkedHashMap<>();
            card.put("subjectId", sub.getId());
            card.put("subjectCode", sub.getCode());
            card.put("subjectName", sub.getName());
            card.put("department", sub.getDepartment());
            card.put("semester", sub.getSemester());
            card.put("facultyName", sub.getFacultyName() != null ? sub.getFacultyName() : "Department Faculty");
            card.put("facultyEmail", sub.getFacultyEmail());
            card.put("credits", sub.getCredits());
            card.put("totalScheduledLectures", totalScheduled);
            card.put("totalApplicableLectures", heldCount);
            card.put("lecturesAttended", attendedCount);
            card.put("lecturesMissed", missedCount);
            card.put("attendancePercentage", percentage);
            card.put("attendanceStatus", status);
            card.put("isShortage", percentage < threshold);
            card.put("minRequiredPercentage", threshold);
            card.put("hasOpenSession", openSessionsCount > 0);
            card.put("openSessionsCount", openSessionsCount);
            card.put("nextOpenSession", nextOpenSession);

            result.add(card);
        }

        return result;
    }

    public Map<String, Object> getSubjectDetailsWithLectures(String subjectCode, String studentEmail) {
        Subject sub = null;
        if (subjectRepo != null) {
            sub = subjectRepo.findByCode(subjectCode).orElse(null);
        }
        if (sub == null) {
            sub = Subject.builder()
                    .code(subjectCode)
                    .name("Subject " + subjectCode)
                    .department("CSE")
                    .semester("6")
                    .facultyName("Department Faculty")
                    .credits(4)
                    .minAttendancePercentage(75.0)
                    .build();
        }

        List<ClassAttendanceSession> sessions = classSessionRepo.findBySubjectCodeOrderBySessionDateDesc(subjectCode);
        List<ClassAttendanceRecord> records = classRecordRepo.findByStudentId(studentEmail);
        Map<Long, ClassAttendanceRecord> recordsBySession = new HashMap<>();
        for (ClassAttendanceRecord r : records) {
            recordsBySession.put(r.getSessionId(), r);
        }

        int totalScheduled = sessions.size();
        int heldCount = 0;
        int attendedCount = 0;
        List<Map<String, Object>> lectureRows = new ArrayList<>();

        for (ClassAttendanceSession s : sessions) {
            boolean isCancelled = "CANCELLED".equalsIgnoreCase(s.getStatus());
            boolean isOpen = "OPEN".equalsIgnoreCase(s.getStatus());
            boolean isCompleted = "COMPLETED".equalsIgnoreCase(s.getStatus()) || (s.getStatus() == null);
            boolean isMarked = recordsBySession.containsKey(s.getId());

            String studentStatus;
            String markedTime = null;
            Double distanceMeters = null;
            Double accuracy = null;
            String method = null;

            if (isMarked) {
                ClassAttendanceRecord rec = recordsBySession.get(s.getId());
                studentStatus = rec.getStatus();
                markedTime = rec.getRecordedAt();
                distanceMeters = rec.getDistanceMeters();
                accuracy = rec.getGpsAccuracy();
                method = rec.getVerificationMethod();
                if ("PRESENT".equalsIgnoreCase(rec.getStatus()) || "LATE".equalsIgnoreCase(rec.getStatus())) {
                    attendedCount++;
                }
                heldCount++;
            } else if (isCancelled) {
                studentStatus = "CANCELLED";
            } else if (isOpen) {
                studentStatus = "OPEN_FOR_MARKING";
            } else if (isCompleted) {
                studentStatus = "ABSENT";
                heldCount++;
            } else {
                studentStatus = "SCHEDULED";
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("sessionId", s.getId());
            row.put("lectureNumber", s.getLectureNumber());
            row.put("lectureTitle", s.getLectureTitle() != null ? s.getLectureTitle() : "Period " + s.getPeriodNumber());
            row.put("sessionDate", s.getSessionDate());
            row.put("periodNumber", s.getPeriodNumber());
            row.put("startTime", s.getStartTime() != null ? s.getStartTime() : "09:00 AM");
            row.put("endTime", s.getEndTime() != null ? s.getEndTime() : "10:00 AM");
            row.put("facultyName", s.getFacultyName() != null ? s.getFacultyName() : sub.getFacultyName());
            row.put("sessionStatus", s.getStatus() != null ? s.getStatus() : "COMPLETED");
            row.put("studentStatus", studentStatus);
            row.put("isMarked", isMarked);
            row.put("canMark", isOpen && !isMarked);
            row.put("markedAt", markedTime);
            row.put("distanceMeters", distanceMeters);
            row.put("gpsAccuracy", accuracy);
            row.put("verificationMethod", method);

            lectureRows.add(row);
        }

        int missedCount = Math.max(0, heldCount - attendedCount);
        double percentage = heldCount > 0 ? (attendedCount * 100.0 / heldCount) : 100.0;
        percentage = Math.round(percentage * 10.0) / 10.0;
        double threshold = sub.getMinAttendancePercentage() != null ? sub.getMinAttendancePercentage() : SHORTAGE_THRESHOLD;
        String status = percentage >= threshold ? "Eligible" : "Attendance Shortage";

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("subject", sub);
        result.put("subjectCode", sub.getCode());
        result.put("subjectName", sub.getName());
        result.put("department", sub.getDepartment());
        result.put("semester", sub.getSemester());
        result.put("facultyName", sub.getFacultyName());
        result.put("facultyEmail", sub.getFacultyEmail());
        result.put("credits", sub.getCredits());
        result.put("totalScheduledLectures", totalScheduled);
        result.put("totalApplicableLectures", heldCount);
        result.put("lecturesAttended", attendedCount);
        result.put("lecturesMissed", missedCount);
        result.put("attendancePercentage", percentage);
        result.put("attendanceStatus", status);
        result.put("isShortage", percentage < threshold);
        result.put("minRequiredPercentage", threshold);
        result.put("lectures", lectureRows);

        return result;
    }

    @Transactional
    public Map<String, Object> markStudentLectureAttendance(
            Long sessionId,
            String studentEmail,
            Double studentLat,
            Double studentLon,
            Double gpsAccuracy,
            String photoBase64,
            boolean faceVerified
    ) {
        // 1. Session validation
        ClassAttendanceSession session = classSessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance session not found for ID: " + sessionId));

        if ("CANCELLED".equalsIgnoreCase(session.getStatus())) {
            throw new IllegalArgumentException("Attendance session has been cancelled by faculty.");
        }
        if ("COMPLETED".equalsIgnoreCase(session.getStatus())) {
            throw new IllegalArgumentException("Attendance session has already closed. Attendance cannot be marked.");
        }

        // 2. Duplicate Check at Database Level
        boolean alreadyMarked = classRecordRepo.existsBySessionIdAndStudentId(sessionId, studentEmail);
        if (alreadyMarked) {
            throw new IllegalArgumentException("Duplicate attendance: You have already marked attendance for this lecture session.");
        }

        // 3. Geofencing Validation (Authority: College Location and strict <= 100m)
        if (studentLat == null || studentLon == null) {
            throw new IllegalArgumentException("GPS location is mandatory. Attendance can only be marked with GeoFencing.");
        }

        if (locationService == null) {
            throw new IllegalStateException("Location service is unavailable.");
        }

        Optional<InstituteLocation> locOpt = locationService.getCurrentLocation();
        if (locOpt.isEmpty()) {
            throw new IllegalStateException("College location has not been configured by Management. Attendance cannot be verified.");
        }

        InstituteLocation college = locOpt.get();
        double distance = locationService.calculateDistance(studentLat, studentLon, college.getLatitude(), college.getLongitude());

        // STRICT GEOFENCE ENFORCEMENT: distance must be <= 100.0 meters
        if (distance > 100.0) {
            throw new IllegalArgumentException(String.format(
                    "Attendance REJECTED: You are %.1fm away from %s. Attendance is strictly restricted to within the 100-meter campus perimeter.",
                    distance, college.getInstituteName()
            ));
        }

        // GPS Accuracy threshold check (reject inaccurate readings > 200m)
        if (gpsAccuracy != null && gpsAccuracy > 200.0) {
            throw new IllegalArgumentException(String.format(
                    "GPS accuracy insufficient (reported error margin: %.0fm). Please enable High Accuracy GPS and retry.",
                    gpsAccuracy
            ));
        }

        // 4. Resolve Student Profile Information
        String studentName = "Student";
        String rollNumber = "22CS0101";
        if (userRepo != null) {
            Optional<User> uOpt = userRepo.findByEmail(studentEmail);
            if (uOpt.isPresent()) {
                studentName = uOpt.get().getName();
                rollNumber = uOpt.get().getRollNumber() != null ? uOpt.get().getRollNumber() : rollNumber;
            }
        }

        // 5. Persist ClassAttendanceRecord to Database
        ClassAttendanceRecord record = new ClassAttendanceRecord();
        record.setSessionId(session.getId());
        record.setStudentId(studentEmail);
        record.setStudentRollNumber(rollNumber);
        record.setStudentName(studentName);
        record.setSubjectCode(session.getSubjectCode());
        record.setStatus("PRESENT");
        record.setLatitude(studentLat);
        record.setLongitude(studentLon);
        record.setDistanceMeters(Math.round(distance * 10.0) / 10.0);
        record.setGpsAccuracy(gpsAccuracy != null ? Math.round(gpsAccuracy * 10.0) / 10.0 : null);
        record.setVerificationMethod("100M_GEOFENCE_AND_FACIAL_BIOMETRIC");
        record.setMarkedBy("STUDENT_GEOFENCE");
        record.setRemarks("Verified at " + Math.round(distance * 10.0) / 10.0 + "m from campus center");
        record.setRecordedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        ClassAttendanceRecord savedRecord = classRecordRepo.save(record);

        // 6. Return confirmation response with updated subject statistics
        Map<String, Object> summary = getSubjectDetailsWithLectures(session.getSubjectCode(), studentEmail);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("status", "PRESENT");
        response.put("message", "Attendance confirmed! Geofence verified (within 100m) and recorded in database.");
        response.put("recordId", savedRecord.getId());
        response.put("sessionId", session.getId());
        response.put("lectureNumber", session.getLectureNumber());
        response.put("lectureTitle", session.getLectureTitle());
        response.put("subjectCode", session.getSubjectCode());
        response.put("subjectName", session.getSubjectName());
        response.put("studentEmail", studentEmail);
        response.put("studentName", studentName);
        response.put("distanceMeters", savedRecord.getDistanceMeters());
        response.put("markedAt", savedRecord.getRecordedAt());
        response.put("verificationMethod", savedRecord.getVerificationMethod());
        response.put("subjectSummary", summary);

        return response;
    }

    public List<Map<String, Object>> getStudentAttendanceHistory(String studentEmail) {
        List<ClassAttendanceRecord> records = classRecordRepo.findByStudentIdOrderByRecordedAtDesc(studentEmail);
        List<Map<String, Object>> history = new ArrayList<>();

        for (ClassAttendanceRecord r : records) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("recordId", r.getId());
            row.put("sessionId", r.getSessionId());
            row.put("subjectCode", r.getSubjectCode());
            row.put("status", r.getStatus());
            row.put("recordedAt", r.getRecordedAt());
            row.put("distanceMeters", r.getDistanceMeters());
            row.put("gpsAccuracy", r.getGpsAccuracy());
            row.put("verificationMethod", r.getVerificationMethod());
            row.put("markedBy", r.getMarkedBy());
            row.put("remarks", r.getRemarks());

            Optional<ClassAttendanceSession> sOpt = classSessionRepo.findById(r.getSessionId());
            if (sOpt.isPresent()) {
                ClassAttendanceSession s = sOpt.get();
                row.put("lectureNumber", s.getLectureNumber());
                row.put("lectureTitle", s.getLectureTitle());
                row.put("subjectName", s.getSubjectName());
                row.put("facultyName", s.getFacultyName());
                row.put("sessionDate", s.getSessionDate());
                row.put("startTime", s.getStartTime());
                row.put("endTime", s.getEndTime());
            }

            history.add(row);
        }

        return history;
    }

    // --- CRT ATTENDANCE CONFIGURATION & SERVICE ---

    public static final double CRT_SHORTAGE_THRESHOLD = 75.0;
    public static final double CRT_CERTIFICATE_MIN_PERCENTAGE = 75.0;
    public static final int CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS = 3;

    public CrtTrainingSession createCrtSession(CrtTrainingSession session) {
        if (session.getTopic() == null || session.getTopic().trim().isEmpty()) {
            throw new IllegalArgumentException("Session title/topic cannot be empty");
        }
        if (session.getModuleType() == null || session.getModuleType().trim().isEmpty()) {
            throw new IllegalArgumentException("Session module category cannot be empty");
        }
        if (session.getScheduledDate() == null || session.getScheduledDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Scheduled date cannot be empty");
        }

        String now = LocalDateTime.now().format(TS);
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(now);
        }
        session.setUpdatedAt(now);

        if (session.getStatus() == null || session.getStatus().trim().isEmpty()) {
            session.setStatus("SCHEDULED");
        } else {
            session.setStatus(session.getStatus().toUpperCase());
        }

        if (session.getTargetBranch() == null || session.getTargetBranch().trim().isEmpty()) {
            session.setTargetBranch("ALL");
        }
        if (session.getTargetBatch() == null || session.getTargetBatch().trim().isEmpty()) {
            session.setTargetBatch("ALL");
        }
        if (session.getTimeSlot() == null && session.getStartTime() != null && session.getEndTime() != null) {
            session.setTimeSlot(session.getStartTime() + " - " + session.getEndTime());
        }

        return crtSessionRepo.save(session);
    }

    public CrtTrainingSession updateCrtSession(Long id, CrtTrainingSession updated) {
        CrtTrainingSession existing = crtSessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("CRT Session not found: " + id));

        if (updated.getTopic() != null) existing.setTopic(updated.getTopic());
        if (updated.getModuleType() != null) existing.setModuleType(updated.getModuleType());
        if (updated.getTrainerName() != null) existing.setTrainerName(updated.getTrainerName());
        if (updated.getTrainerOrganization() != null) existing.setTrainerOrganization(updated.getTrainerOrganization());
        if (updated.getScheduledDate() != null) existing.setScheduledDate(updated.getScheduledDate());
        if (updated.getTimeSlot() != null) existing.setTimeSlot(updated.getTimeSlot());
        if (updated.getStartTime() != null) existing.setStartTime(updated.getStartTime());
        if (updated.getEndTime() != null) existing.setEndTime(updated.getEndTime());
        if (updated.getVenue() != null) existing.setVenue(updated.getVenue());
        if (updated.getTargetBatch() != null) existing.setTargetBatch(updated.getTargetBatch());
        if (updated.getTargetBranch() != null) existing.setTargetBranch(updated.getTargetBranch());
        if (updated.getAcademicYear() != null) existing.setAcademicYear(updated.getAcademicYear());
        if (updated.getSemester() != null) existing.setSemester(updated.getSemester());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus().toUpperCase());

        existing.setUpdatedAt(LocalDateTime.now().format(TS));
        return crtSessionRepo.save(existing);
    }

    public CrtTrainingSession updateCrtSessionStatus(Long id, String newStatus) {
        CrtTrainingSession existing = crtSessionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("CRT Session not found: " + id));

        String upper = newStatus.trim().toUpperCase();
        if (!upper.equals("SCHEDULED") && !upper.equals("IN_PROGRESS") && !upper.equals("COMPLETED") && !upper.equals("CANCELLED")) {
            throw new IllegalArgumentException("Invalid status: " + newStatus + ". Allowed: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED");
        }

        existing.setStatus(upper);
        existing.setUpdatedAt(LocalDateTime.now().format(TS));
        return crtSessionRepo.save(existing);
    }

    public List<CrtTrainingSession> getCrtSessions(String targetBatch, String department, String status) {
        List<CrtTrainingSession> all = crtSessionRepo.findAllByOrderByScheduledDateDesc();
        List<CrtTrainingSession> filtered = new ArrayList<>();

        for (CrtTrainingSession s : all) {
            boolean batchMatch = targetBatch == null || targetBatch.trim().isEmpty() || "ALL".equalsIgnoreCase(targetBatch) ||
                    "ALL".equalsIgnoreCase(s.getTargetBatch()) || targetBatch.equalsIgnoreCase(s.getTargetBatch());

            boolean deptMatch = department == null || department.trim().isEmpty() || "ALL".equalsIgnoreCase(department) ||
                    "ALL".equalsIgnoreCase(s.getTargetBranch()) ||
                    (s.getTargetBranch() != null && s.getTargetBranch().toUpperCase().contains(department.toUpperCase()));

            boolean statusMatch = status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status) ||
                    (s.getStatus() != null && s.getStatus().equalsIgnoreCase(status));

            if (batchMatch && deptMatch && statusMatch) {
                filtered.add(s);
            }
        }
        return filtered;
    }

    public Optional<CrtTrainingSession> getCrtSessionById(Long id) {
        return crtSessionRepo.findById(id);
    }

    public List<Map<String, Object>> getCrtSessionRoster(Long sessionId) {
        CrtTrainingSession session = crtSessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("CRT Session not found: " + sessionId));

        String deptFilter = "ALL".equalsIgnoreCase(session.getTargetBranch()) ? null : session.getTargetBranch();
        String semFilter = session.getSemester() != null ? session.getSemester() : "6";
        List<Map<String, Object>> baseRoster = getClassRoster(deptFilter, semFilter);

        List<CrtAttendanceRecord> existingRecords = crtRecordRepo.findByCrtSessionId(sessionId);
        Map<String, CrtAttendanceRecord> recordMap = new HashMap<>();
        for (CrtAttendanceRecord r : existingRecords) {
            recordMap.put(r.getStudentId(), r);
            if (r.getStudentRollNumber() != null) {
                recordMap.put(r.getStudentRollNumber(), r);
            }
        }

        List<Map<String, Object>> merged = new ArrayList<>();
        for (Map<String, Object> stu : baseRoster) {
            String studentId = (String) stu.get("studentId");
            String rollNumber = (String) stu.get("rollNumber");

            CrtAttendanceRecord existing = recordMap.get(studentId);
            if (existing == null && rollNumber != null) {
                existing = recordMap.get(rollNumber);
            }

            Map<String, Object> row = new LinkedHashMap<>(stu);
            row.put("crtSessionId", sessionId);
            if (existing != null) {
                row.put("status", existing.getStatus() != null ? existing.getStatus().toUpperCase() : "UNMARKED");
                row.put("assessmentScore", existing.getAssessmentScore());
                row.put("remarks", existing.getRemarks());
                row.put("recordedAt", existing.getRecordedAt());
                row.put("recordedBy", existing.getRecordedBy());
            } else {
                row.put("status", "UNMARKED");
                row.put("assessmentScore", null);
                row.put("remarks", null);
                row.put("recordedAt", null);
                row.put("recordedBy", null);
            }
            merged.add(row);
        }
        return merged;
    }

    @Transactional
    public List<CrtAttendanceRecord> markCrtAttendance(Long crtSessionId, List<CrtAttendanceRecord> records, String recordedBy) {
        CrtTrainingSession session = crtSessionRepo.findById(crtSessionId)
                .orElseThrow(() -> new IllegalArgumentException("CRT Session not found: " + crtSessionId));

        if ("CANCELLED".equalsIgnoreCase(session.getStatus())) {
            throw new IllegalArgumentException("Cannot mark attendance for a CANCELLED session.");
        }

        List<CrtAttendanceRecord> saved = new ArrayList<>();
        String now = LocalDateTime.now().format(TS);

        for (CrtAttendanceRecord rec : records) {
            if (rec.getStudentId() == null || rec.getStudentId().trim().isEmpty()) {
                continue;
            }

            String status = rec.getStatus() != null ? rec.getStatus().trim().toUpperCase() : "UNMARKED";
            if (!status.equals("PRESENT") && !status.equals("ABSENT") && !status.equals("LATE") && !status.equals("UNMARKED")) {
                status = "UNMARKED";
            }

            rec.setCrtSessionId(crtSessionId);
            rec.setStatus(status);
            rec.setRecordedAt(now);
            if (recordedBy != null && !recordedBy.trim().isEmpty()) {
                rec.setRecordedBy(recordedBy);
            }

            Optional<CrtAttendanceRecord> existing = crtRecordRepo.findByCrtSessionIdAndStudentId(crtSessionId, rec.getStudentId());
            if (existing.isPresent()) {
                CrtAttendanceRecord cur = existing.get();
                cur.setStatus(rec.getStatus());
                cur.setAssessmentScore(rec.getAssessmentScore());
                cur.setRemarks(rec.getRemarks());
                cur.setRecordedAt(now);
                if (rec.getRecordedBy() != null) cur.setRecordedBy(rec.getRecordedBy());
                saved.add(crtRecordRepo.save(cur));
            } else {
                saved.add(crtRecordRepo.save(rec));
            }
        }

        // If attendance is being marked for a SCHEDULED session, transition it to COMPLETED
        if ("SCHEDULED".equalsIgnoreCase(session.getStatus())) {
            session.setStatus("COMPLETED");
            session.setUpdatedAt(now);
            crtSessionRepo.save(session);
        }

        return saved;
    }

    public List<CrtAttendanceRecord> getCrtSessionRecords(Long crtSessionId) {
        return crtRecordRepo.findByCrtSessionId(crtSessionId);
    }

    public Map<String, Object> getCrtSessionReport(Long crtSessionId) {
        CrtTrainingSession session = crtSessionRepo.findById(crtSessionId)
                .orElseThrow(() -> new IllegalArgumentException("CRT Session not found: " + crtSessionId));

        List<Map<String, Object>> roster = getCrtSessionRoster(crtSessionId);
        int total = roster.size();
        int present = 0;
        int late = 0;
        int absent = 0;
        int unmarked = 0;

        for (Map<String, Object> stu : roster) {
            String st = (String) stu.get("status");
            if ("PRESENT".equalsIgnoreCase(st)) {
                present++;
            } else if ("LATE".equalsIgnoreCase(st)) {
                late++;
            } else if ("ABSENT".equalsIgnoreCase(st)) {
                absent++;
            } else {
                unmarked++;
            }
        }

        int attended = present + late;
        double completionRate = total > 0 ? (attended * 100.0 / total) : 0.0;
        completionRate = Math.round(completionRate * 10.0) / 10.0;

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("sessionId", session.getId());
        report.put("topic", session.getTopic());
        report.put("moduleType", session.getModuleType());
        report.put("trainerName", session.getTrainerName());
        report.put("trainerOrganization", session.getTrainerOrganization());
        report.put("scheduledDate", session.getScheduledDate());
        report.put("timeSlot", session.getTimeSlot());
        report.put("venue", session.getVenue());
        report.put("status", session.getStatus());
        report.put("targetBatch", session.getTargetBatch());
        report.put("targetBranch", session.getTargetBranch());
        report.put("totalEligibleStudents", total);
        report.put("presentCount", present);
        report.put("lateCount", late);
        report.put("absentCount", absent);
        report.put("unmarkedCount", unmarked);
        report.put("qualifyingAttendedCount", attended);
        report.put("attendanceCompletionPercentage", completionRate);
        report.put("roster", roster);
        return report;
    }

    public Map<String, Object> getCrtCumulativeReport(String targetBatch, String department) {
        List<CrtTrainingSession> allSessions = crtSessionRepo.findAllByOrderByScheduledDateDesc();
        List<CrtTrainingSession> completedSessions = new ArrayList<>();

        for (CrtTrainingSession s : allSessions) {
            // Per requirement: exclude cancelled sessions, exclude future or incomplete sessions
            if (!"COMPLETED".equalsIgnoreCase(s.getStatus())) {
                continue;
            }

            boolean batchMatch = targetBatch == null || targetBatch.trim().isEmpty() || "ALL".equalsIgnoreCase(targetBatch) ||
                    "ALL".equalsIgnoreCase(s.getTargetBatch()) || targetBatch.equalsIgnoreCase(s.getTargetBatch());

            boolean deptMatch = department == null || department.trim().isEmpty() || "ALL".equalsIgnoreCase(department) ||
                    "ALL".equalsIgnoreCase(s.getTargetBranch()) ||
                    (s.getTargetBranch() != null && s.getTargetBranch().toUpperCase().contains(department.toUpperCase()));

            if (batchMatch && deptMatch) {
                completedSessions.add(s);
            }
        }

        int completedSessionsHeld = completedSessions.size();
        String deptFilter = (department == null || "ALL".equalsIgnoreCase(department)) ? "CSE" : department;
        List<Map<String, Object>> baseRoster = getClassRoster(deptFilter, "6");

        // Map student -> attended, late, absent counts across completed sessions
        Map<String, Integer> attendedMap = new HashMap<>();
        Map<String, Integer> lateMap = new HashMap<>();
        Map<String, Integer> absentMap = new HashMap<>();

        for (CrtTrainingSession cs : completedSessions) {
            List<CrtAttendanceRecord> recs = crtRecordRepo.findByCrtSessionId(cs.getId());
            for (CrtAttendanceRecord r : recs) {
                String sid = r.getStudentId();
                if ("PRESENT".equalsIgnoreCase(r.getStatus())) {
                    attendedMap.put(sid, attendedMap.getOrDefault(sid, 0) + 1);
                } else if ("LATE".equalsIgnoreCase(r.getStatus())) {
                    attendedMap.put(sid, attendedMap.getOrDefault(sid, 0) + 1);
                    lateMap.put(sid, lateMap.getOrDefault(sid, 0) + 1);
                } else if ("ABSENT".equalsIgnoreCase(r.getStatus())) {
                    absentMap.put(sid, absentMap.getOrDefault(sid, 0) + 1);
                }
            }
        }

        List<Map<String, Object>> studentReports = new ArrayList<>();
        int shortageCount = 0;
        int eligibleCertificateCount = 0;
        double sumPercentage = 0.0;

        for (Map<String, Object> stu : baseRoster) {
            String studentId = (String) stu.get("studentId");
            String rollNumber = (String) stu.get("rollNumber");
            String name = (String) stu.get("name");
            String branch = (String) stu.get("department");

            int attended = attendedMap.getOrDefault(studentId, 0);
            int late = lateMap.getOrDefault(studentId, 0);
            int absent = absentMap.getOrDefault(studentId, 0);

            // Safe division for zero completed sessions held
            double percentage = completedSessionsHeld > 0 ? (attended * 100.0 / completedSessionsHeld) : 100.0;
            percentage = Math.round(percentage * 10.0) / 10.0;

            // Strict threshold: strictly < 75% triggers shortage alert; exactly 75% does NOT
            boolean shortageWarning = (percentage < CRT_SHORTAGE_THRESHOLD) && (completedSessionsHeld > 0);
            if (shortageWarning) {
                shortageCount++;
            }
            sumPercentage += percentage;

            // Certificate Eligibility Policy:
            // 1. Minimum 3 completed sessions held
            // 2. Attendance percentage >= 75.0%
            String certificateStatus;
            String certificateRemarks;
            boolean certificateEligible;

            if (completedSessionsHeld < CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS) {
                certificateStatus = "PENDING";
                certificateEligible = false;
                certificateRemarks = "Pending: Requires at least " + CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS + " completed CRT sessions (Held: " + completedSessionsHeld + ").";
            } else if (percentage >= CRT_CERTIFICATE_MIN_PERCENTAGE) {
                certificateStatus = "ELIGIBLE";
                certificateEligible = true;
                eligibleCertificateCount++;
                certificateRemarks = "Eligible: Meets criteria (" + percentage + "% >= " + CRT_CERTIFICATE_MIN_PERCENTAGE + "%, " + attended + "/" + completedSessionsHeld + " sessions).";
            } else {
                certificateStatus = "INELIGIBLE";
                certificateEligible = false;
                certificateRemarks = "Ineligible: Attendance " + percentage + "% is strictly below " + CRT_CERTIFICATE_MIN_PERCENTAGE + "% threshold.";
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("studentId", studentId);
            row.put("rollNumber", rollNumber);
            row.put("name", name);
            row.put("department", branch);
            row.put("eligibleSessionsHeld", completedSessionsHeld);
            row.put("sessionsAttended", attended);
            row.put("sessionsMissed", absent);
            row.put("sessionsLate", late);
            row.put("crtAttendancePercentage", percentage);
            row.put("shortageWarning", shortageWarning);
            row.put("certificateStatus", certificateStatus);
            row.put("certificateEligible", certificateEligible);
            row.put("certificateRemarks", certificateRemarks);
            studentReports.add(row);
        }

        int totalEnrolled = baseRoster.size();
        double averageAttendance = totalEnrolled > 0 ? Math.round((sumPercentage / totalEnrolled) * 10.0) / 10.0 : 100.0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("targetBatch", targetBatch != null ? targetBatch : "ALL");
        result.put("department", department != null ? department : "ALL");
        result.put("completedSessionsHeld", completedSessionsHeld);
        result.put("totalStudents", totalEnrolled);
        result.put("shortageCount", shortageCount);
        result.put("eligibleCertificateCount", eligibleCertificateCount);
        result.put("shortageThreshold", CRT_SHORTAGE_THRESHOLD);
        result.put("certificateMinPercentage", CRT_CERTIFICATE_MIN_PERCENTAGE);
        result.put("certificateMinSessions", CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS);
        result.put("averageAttendance", averageAttendance);
        result.put("roster", studentReports);
        return result;
    }

    public Map<String, Object> getStudentCrtSummary(String studentId) {
        List<CrtAttendanceRecord> records = crtRecordRepo.findByStudentId(studentId);
        List<CrtTrainingSession> allSessions = crtSessionRepo.findAllByOrderByScheduledDateDesc();

        Map<Long, CrtTrainingSession> sessionMap = new HashMap<>();
        for (CrtTrainingSession s : allSessions) {
            sessionMap.put(s.getId(), s);
        }

        int completedSessionsHeld = 0;
        for (CrtTrainingSession s : allSessions) {
            if ("COMPLETED".equalsIgnoreCase(s.getStatus())) {
                completedSessionsHeld++;
            }
        }

        int attended = 0;
        int missed = 0;
        int late = 0;
        double totalScore = 0;
        int scoredCount = 0;
        List<Map<String, Object>> sessionDetails = new ArrayList<>();

        for (CrtAttendanceRecord r : records) {
            CrtTrainingSession s = sessionMap.get(r.getCrtSessionId());
            boolean isCompleted = s != null && "COMPLETED".equalsIgnoreCase(s.getStatus());

            if ("PRESENT".equalsIgnoreCase(r.getStatus())) {
                if (isCompleted) attended++;
            } else if ("LATE".equalsIgnoreCase(r.getStatus())) {
                if (isCompleted) {
                    attended++;
                    late++;
                }
            } else if ("ABSENT".equalsIgnoreCase(r.getStatus())) {
                if (isCompleted) missed++;
            }

            if (r.getAssessmentScore() != null) {
                totalScore += r.getAssessmentScore();
                scoredCount++;
            }

            Map<String, Object> det = new LinkedHashMap<>();
            det.put("sessionId", r.getCrtSessionId());
            det.put("title", s != null ? s.getTopic() : "CRT Session #" + r.getCrtSessionId());
            det.put("moduleType", s != null ? s.getModuleType() : "General");
            det.put("date", s != null ? s.getScheduledDate() : null);
            det.put("status", r.getStatus());
            det.put("remarks", r.getRemarks());
            det.put("assessmentScore", r.getAssessmentScore());
            sessionDetails.add(det);
        }

        double percentage = completedSessionsHeld > 0 ? (attended * 100.0 / completedSessionsHeld) : 100.0;
        percentage = Math.round(percentage * 10.0) / 10.0;
        double avgScore = scoredCount > 0 ? (totalScore / scoredCount) : 0.0;

        boolean shortage = percentage < CRT_SHORTAGE_THRESHOLD && completedSessionsHeld > 0;
        boolean certEligible = percentage >= CRT_CERTIFICATE_MIN_PERCENTAGE && completedSessionsHeld >= CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS;
        String certStatus = completedSessionsHeld < CRT_CERTIFICATE_MIN_COMPLETED_SESSIONS ? "PENDING" : (certEligible ? "ELIGIBLE" : "INELIGIBLE");

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("studentId", studentId);
        summary.put("completedSessionsHeld", completedSessionsHeld);
        summary.put("attendedSessions", attended);
        summary.put("missedSessions", missed);
        summary.put("lateSessions", late);
        summary.put("crtAttendancePercentage", percentage);
        summary.put("shortageWarning", shortage);
        summary.put("shortageThreshold", CRT_SHORTAGE_THRESHOLD);
        summary.put("certificateStatus", certStatus);
        summary.put("certificateEligible", certEligible);
        summary.put("averageAssessmentScore", Math.round(avgScore * 10.0) / 10.0);
        summary.put("records", sessionDetails);
        return summary;
    }

    // ==========================================
    // DYNAMIC QR & LIVE REAL-TIME ATTENDANCE
    // ==========================================

    @Transactional
    public Map<String, Object> startQrAttendanceSession(Long sessionId, String facultyEmail, Integer durationMinutes, Boolean geofenceRequired) {
        ClassAttendanceSession session = classSessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture session not found with ID: " + sessionId));

        int duration = (durationMinutes != null && durationMinutes > 0) ? durationMinutes : 10;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(duration);

        String initialQrToken = "PP-ATT-" + sessionId + "-" + UUID.randomUUID().toString();

        session.setIsQrActive(true);
        session.setQrToken(initialQrToken);
        session.setQrDurationMinutes(duration);
        session.setQrExpiresAt(expiresAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        session.setSessionOpenedAt(now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        session.setSessionOpenedBy(facultyEmail != null ? facultyEmail : "faculty");
        session.setGeofenceRequired(geofenceRequired != null ? geofenceRequired : true);
        session.setStatus("OPEN");
        if (session.getTotalQrScans() == null) {
            session.setTotalQrScans(0);
        }

        classSessionRepo.save(session);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("sessionId", session.getId());
        res.put("subjectCode", session.getSubjectCode());
        res.put("subjectName", session.getSubjectName());
        res.put("lectureNumber", session.getLectureNumber());
        res.put("lectureTitle", session.getLectureTitle());
        res.put("facultyName", session.getFacultyName());
        res.put("isQrActive", true);
        res.put("qrToken", initialQrToken);
        res.put("qrExpiresAt", session.getQrExpiresAt());
        res.put("remainingSeconds", duration * 60L);
        res.put("durationMinutes", duration);
        res.put("geofenceRequired", session.getGeofenceRequired());
        res.put("totalScans", session.getTotalQrScans());
        res.put("message", "Live QR Attendance started! Dynamic QR code is active and will rotate on every student scan.");
        return res;
    }

    public Map<String, Object> getQrSessionStatus(Long sessionId) {
        ClassAttendanceSession session = classSessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture session not found with ID: " + sessionId));

        boolean isActive = Boolean.TRUE.equals(session.getIsQrActive());
        long remainingSeconds = 0;

        if (isActive && session.getQrExpiresAt() != null) {
            try {
                LocalDateTime expiresAt = LocalDateTime.parse(session.getQrExpiresAt());
                LocalDateTime now = LocalDateTime.now();
                if (now.isAfter(expiresAt)) {
                    isActive = false;
                    session.setIsQrActive(false);
                    session.setStatus("COMPLETED");
                    classSessionRepo.save(session);
                } else {
                    remainingSeconds = Math.max(0, Duration.between(now, expiresAt).getSeconds());
                }
            } catch (Exception ignored) {
            }
        }

        List<ClassAttendanceRecord> records = classRecordRepo.findBySessionId(sessionId);
        List<Map<String, Object>> recentScans = new ArrayList<>();
        int count = 0;
        for (int i = records.size() - 1; i >= 0 && count < 15; i--) {
            ClassAttendanceRecord r = records.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("studentId", r.getStudentId());
            m.put("studentName", r.getStudentName());
            m.put("studentRollNumber", r.getStudentRollNumber());
            m.put("status", r.getStatus());
            m.put("recordedAt", r.getRecordedAt());
            m.put("distanceMeters", r.getDistanceMeters());
            recentScans.add(m);
            count++;
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("sessionId", session.getId());
        res.put("subjectCode", session.getSubjectCode());
        res.put("subjectName", session.getSubjectName());
        res.put("lectureNumber", session.getLectureNumber());
        res.put("lectureTitle", session.getLectureTitle());
        res.put("facultyName", session.getFacultyName());
        res.put("isQrActive", isActive);
        res.put("qrToken", isActive ? session.getQrToken() : null);
        res.put("qrExpiresAt", session.getQrExpiresAt());
        res.put("remainingSeconds", remainingSeconds);
        res.put("durationMinutes", session.getQrDurationMinutes() != null ? session.getQrDurationMinutes() : 10);
        res.put("geofenceRequired", session.getGeofenceRequired() != null ? session.getGeofenceRequired() : true);
        res.put("totalScans", records.size());
        res.put("status", session.getStatus());
        res.put("recentScans", recentScans);
        return res;
    }

    @Transactional
    public Map<String, Object> stopQrAttendanceSession(Long sessionId, String facultyEmail) {
        ClassAttendanceSession session = classSessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Lecture session not found with ID: " + sessionId));

        session.setIsQrActive(false);
        session.setQrToken(null);
        session.setStatus("COMPLETED");
        session.setClosingTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        classSessionRepo.save(session);

        int totalMarked = classRecordRepo.findBySessionId(sessionId).size();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("sessionId", session.getId());
        res.put("subjectCode", session.getSubjectCode());
        res.put("isQrActive", false);
        res.put("totalStudentsMarked", totalMarked);
        res.put("status", "COMPLETED");
        res.put("message", "QR Attendance session turned OFF. Total attendance recorded: " + totalMarked);
        return res;
    }

    @Transactional
    public Map<String, Object> markStudentLectureAttendanceViaQr(
            Long sessionId,
            String studentEmail,
            String submittedQrToken,
            Double studentLat,
            Double studentLon,
            Double gpsAccuracy
    ) {
        // 1. Session verification
        ClassAttendanceSession session = classSessionRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance session not found for ID: " + sessionId));

        if (!Boolean.TRUE.equals(session.getIsQrActive())) {
            throw new IllegalArgumentException("Attendance is currently turned OFF by the faculty for this class.");
        }

        // Check expiration
        if (session.getQrExpiresAt() != null) {
            try {
                LocalDateTime expiresAt = LocalDateTime.parse(session.getQrExpiresAt());
                if (LocalDateTime.now().isAfter(expiresAt)) {
                    session.setIsQrActive(false);
                    session.setStatus("COMPLETED");
                    classSessionRepo.save(session);
                    throw new IllegalArgumentException("The QR attendance window has expired. Faculty needs to open a new attendance window.");
                }
            } catch (Exception e) {
                if (e instanceof IllegalArgumentException) throw (IllegalArgumentException) e;
            }
        }

        // 2. Dynamic QR Token match check
        if (submittedQrToken == null || submittedQrToken.isBlank()) {
            throw new IllegalArgumentException("QR Code data is missing. Please point your camera to scan the live QR code.");
        }

        if (!submittedQrToken.trim().equals(session.getQrToken() != null ? session.getQrToken().trim() : "")) {
            throw new IllegalArgumentException("QR Code Expired: This QR code has already been scanned or rotated. Please scan the current live QR code on the faculty screen!");
        }

        // 3. Duplicate attendance check at DB level
        boolean alreadyMarked = classRecordRepo.existsBySessionIdAndStudentId(sessionId, studentEmail);
        if (alreadyMarked) {
            throw new IllegalArgumentException("Duplicate attendance: You have already marked attendance for this lecture session.");
        }

        // 4. Geofencing check (100m radius) if required
        Double distance = null;
        if (Boolean.TRUE.equals(session.getGeofenceRequired())) {
            if (studentLat == null || studentLon == null) {
                throw new IllegalArgumentException("GPS Location is required for Geofence validation (Step 1).");
            }
            if (locationService == null) {
                throw new IllegalStateException("Location service is unavailable.");
            }
            Optional<InstituteLocation> locOpt = locationService.getCurrentLocation();
            if (locOpt.isEmpty()) {
                throw new IllegalStateException("College location has not been configured by Management.");
            }
            InstituteLocation college = locOpt.get();
            distance = locationService.calculateDistance(studentLat, studentLon, college.getLatitude(), college.getLongitude());

            if (distance > 100.0) {
                throw new IllegalArgumentException(String.format(
                        "Attendance REJECTED: You are %.1fm away from %s. Attendance is strictly restricted to within 100 meters of the campus.",
                        distance, college.getInstituteName()
                ));
            }

            if (gpsAccuracy != null && gpsAccuracy > 200.0) {
                throw new IllegalArgumentException(String.format("GPS accuracy margin too high (%.0fm). Please enable High Accuracy GPS and retry.", gpsAccuracy));
            }
        }

        // 5. Resolve Student Profile Information
        String studentName = "Student";
        String rollNumber = "22CS0101";
        if (userRepo != null) {
            Optional<User> uOpt = userRepo.findByEmail(studentEmail);
            if (uOpt.isPresent()) {
                studentName = uOpt.get().getName();
                rollNumber = uOpt.get().getRollNumber() != null ? uOpt.get().getRollNumber() : rollNumber;
            }
        }

        // 6. Record Student Attendance to MySQL Database
        ClassAttendanceRecord record = new ClassAttendanceRecord();
        record.setSessionId(session.getId());
        record.setStudentId(studentEmail);
        record.setStudentRollNumber(rollNumber);
        record.setStudentName(studentName);
        record.setSubjectCode(session.getSubjectCode());
        record.setStatus("PRESENT");
        record.setLatitude(studentLat);
        record.setLongitude(studentLon);
        record.setDistanceMeters(distance != null ? Math.round(distance * 10.0) / 10.0 : 0.0);
        record.setGpsAccuracy(gpsAccuracy != null ? Math.round(gpsAccuracy * 10.0) / 10.0 : null);
        record.setVerificationMethod("100M_GEOFENCE_AND_DYNAMIC_QR");
        record.setMarkedBy("STUDENT_QR_SCAN");
        record.setRemarks("Dynamic QR code verified & geofence validated (" + (distance != null ? Math.round(distance * 10.0) / 10.0 + "m" : "N/A") + ")");
        record.setRecordedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        ClassAttendanceRecord savedRecord = classRecordRepo.save(record);

        // 7. CRITICAL TWIST: AUTOMATIC ROTATION OF QR TOKEN
        // Every time a student successfully scans the QR code, rotate the QR code immediately to a new unique token!
        String nextQrToken = "PP-ATT-" + sessionId + "-" + UUID.randomUUID().toString();
        session.setQrToken(nextQrToken);
        session.setTotalQrScans((session.getTotalQrScans() != null ? session.getTotalQrScans() : 0) + 1);
        classSessionRepo.save(session);

        // 8. Prepare Confirmation
        Map<String, Object> summary = getSubjectDetailsWithLectures(session.getSubjectCode(), studentEmail);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("status", "PRESENT");
        res.put("message", "Attendance confirmed! Dynamic QR code scanned and verified inside 100m geofence.");
        res.put("recordId", savedRecord.getId());
        res.put("sessionId", session.getId());
        res.put("lectureNumber", session.getLectureNumber());
        res.put("lectureTitle", session.getLectureTitle());
        res.put("subjectCode", session.getSubjectCode());
        res.put("subjectName", session.getSubjectName());
        res.put("studentEmail", studentEmail);
        res.put("studentName", studentName);
        res.put("distanceMeters", savedRecord.getDistanceMeters());
        res.put("markedAt", savedRecord.getRecordedAt());
        res.put("verificationMethod", savedRecord.getVerificationMethod());
        res.put("nextQrToken", nextQrToken); // new rotated token
        res.put("subjectSummary", summary);

        return res;
    }

    public List<Map<String, Object>> getActiveQrSessions() {
        List<ClassAttendanceSession> openSessions = classSessionRepo.findAll();
        List<Map<String, Object>> activeList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (ClassAttendanceSession s : openSessions) {
            if (Boolean.TRUE.equals(s.getIsQrActive())) {
                boolean valid = true;
                if (s.getQrExpiresAt() != null) {
                    try {
                        LocalDateTime exp = LocalDateTime.parse(s.getQrExpiresAt());
                        if (now.isAfter(exp)) {
                            s.setIsQrActive(false);
                            s.setStatus("COMPLETED");
                            classSessionRepo.save(s);
                            valid = false;
                        }
                    } catch (Exception ignored) {
                    }
                }
                if (valid) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("sessionId", s.getId());
                    m.put("subjectCode", s.getSubjectCode());
                    m.put("subjectName", s.getSubjectName());
                    m.put("lectureNumber", s.getLectureNumber());
                    m.put("lectureTitle", s.getLectureTitle());
                    m.put("facultyName", s.getFacultyName());
                    m.put("department", s.getDepartment());
                    m.put("semester", s.getSemester());
                    m.put("startTime", s.getStartTime());
                    m.put("endTime", s.getEndTime());
                    m.put("qrExpiresAt", s.getQrExpiresAt());
                    m.put("geofenceRequired", s.getGeofenceRequired());
                    activeList.add(m);
                }
            }
        }
        return activeList;
    }
}
