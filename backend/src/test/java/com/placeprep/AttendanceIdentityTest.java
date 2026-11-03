package com.placeprep;

import com.placeprep.model.*;
import com.placeprep.repository.*;
import com.placeprep.service.AttendanceService;
import com.placeprep.config.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AttendanceIdentityTest {
    @Autowired AttendanceService service;
    @Autowired UserRepository users;
    @Autowired SubjectRepository subjects;
    @Autowired StudentSubjectEnrollmentRepository enrollments;
    @Autowired ClassAttendanceSessionRepository sessions;
    @Autowired ClassAttendanceRecordRepository records;
    @Autowired org.springframework.test.web.servlet.MockMvc mvc;
    @Autowired TokenService tokens;

    @Test
    @Transactional
    void emailScopedPagesFindAttendanceStoredByAuthenticatedUserId() {
        User user = new User();
        user.setName("Attendance Test");
        user.setEmail("attendance-identity@example.edu");
        user.setPassword("test-only");
        user.setRole("student");
        user.setStatus("ACTIVE");
        user.setBranch("CSE");
        user = users.save(user);

        Subject subject = new Subject();
        subject.setCode("IDENTITY-TEST-101");
        subject.setName("Identity Test Subject");
        subject.setDepartment("CSE");
        subject.setSemester("6");
        subjects.save(subject);

        StudentSubjectEnrollment enrollment = new StudentSubjectEnrollment();
        enrollment.setStudentEmail(user.getEmail());
        enrollment.setSubjectCode(subject.getCode());
        enrollments.save(enrollment);

        ClassAttendanceSession session = new ClassAttendanceSession();
        session.setSubjectCode(subject.getCode());
        session.setSubjectName(subject.getName());
        session.setDepartment("CSE");
        session.setSemester("6");
        session.setSessionDate("2026-11-01");
        session.setStatus("COMPLETED");
        session = sessions.save(session);

        ClassAttendanceRecord record = new ClassAttendanceRecord();
        record.setSessionId(session.getId());
        record.setStudentId(String.valueOf(user.getId()));
        record.setSubjectCode(subject.getCode());
        record.setStatus("PRESENT");
        records.save(record);

        var summary = service.getEnrolledSubjectsWithSummary(user.getEmail()).stream()
                .filter(row -> subject.getCode().equals(row.get("subjectCode")))
                .findFirst().orElseThrow();
        assertEquals(1, summary.get("totalApplicableLectures"));
        assertEquals(1, summary.get("lecturesAttended"));
        assertEquals(1, service.getStudentAttendanceHistory(user.getEmail()).size());
    }

    @Test
    @Transactional
    void studentAttendanceSummaryCannotBeReadWithoutItsOwner() throws Exception {
        User user = new User();
        user.setName("Private Student");
        user.setEmail("attendance-private@example.edu");
        user.setPassword("test-only");
        user.setRole("student");
        user.setStatus("ACTIVE");
        user = users.save(user);
        String token = tokens.generateToken(user.getId(), user.getEmail(), user.getRole());
        Subject ownSubject = new Subject();
        ownSubject.setCode("PRIVATE-ATTENDANCE-101");
        ownSubject.setName("Private Attendance Subject");
        ownSubject.setDepartment("CSE");
        ownSubject.setSemester("6");
        subjects.save(ownSubject);
        StudentSubjectEnrollment ownEnrollment = new StudentSubjectEnrollment();
        ownEnrollment.setStudentEmail(user.getEmail());
        ownEnrollment.setSubjectCode(ownSubject.getCode());
        enrollments.save(ownEnrollment);

        mvc.perform(get("/api/attendance/student/" + user.getId() + "/summary"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/attendance/student/999999/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/attendance/student/" + user.getId() + "/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mvc.perform(get("/api/student/attendance/subjects"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/student/attendance/subjects?studentEmail=other@example.edu")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subjectCode").value(ownSubject.getCode()));
        mvc.perform(get("/api/student/attendance/history"))
                .andExpect(status().isForbidden());
    }
}
