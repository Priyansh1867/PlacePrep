package com.placeprep.service;

import com.placeprep.tools.CompanyTool;
import com.placeprep.tools.DriveTool;
import com.placeprep.tools.ExperienceTool;
import com.placeprep.tools.InsightsTool;
import com.placeprep.tools.OpportunityTool;
import com.placeprep.tools.QuestionTool;
import com.placeprep.tools.ResumeAtsTool;
import com.placeprep.tools.UserTool;
import com.placeprep.tools.StudentApplicationTool;
import com.placeprep.tools.StudentAttendanceTool;
import com.placeprep.tools.StudentEligibilityTool;
import com.placeprep.tools.StudentMockSessionTool;
import com.placeprep.tools.StaffApplicationTool;
import com.placeprep.tools.StaffAttendanceTool;
import com.placeprep.tools.StaffFeedbackTool;
import com.placeprep.tools.CompanyWriteTool;
import com.placeprep.tools.DriveWriteTool;
import com.placeprep.tools.QuestionWriteTool;
import com.placeprep.tools.ExperienceWriteTool;
import com.placeprep.tools.OpportunityWriteTool;
import com.placeprep.tools.ApplicationWriteTool;
import com.placeprep.tools.MockSessionWriteTool;
import com.placeprep.tools.FeedbackWriteTool;
import com.placeprep.tools.AttendanceWriteTool;
import com.placeprep.tools.NotificationWriteTool;
import com.placeprep.tools.UserWriteTool;
import com.placeprep.tools.SelectionWriteTool;
import com.placeprep.tools.CandidateWriteTool;
import com.placeprep.repository.UserRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class AiChatService {
    private final ChatClient chatClient;
    private final CompanyTool companyTool;
    private final DriveTool driveTool;
    private final QuestionTool questionTool;
    private final InsightsTool insightsTool;
    private final ExperienceTool experienceTool;
    private final OpportunityTool opportunityTool;
    private final ResumeAtsTool resumeAtsTool;
    private final UserTool userTool;
    private final StudentApplicationTool studentApplicationTool;
    private final StudentAttendanceTool studentAttendanceTool;
    private final StudentEligibilityTool studentEligibilityTool;
    private final StudentMockSessionTool studentMockSessionTool;
    private final StaffApplicationTool staffApplicationTool;
    private final StaffAttendanceTool staffAttendanceTool;
    private final StaffFeedbackTool staffFeedbackTool;
    private final CompanyWriteTool companyWriteTool;
    private final DriveWriteTool driveWriteTool;
    private final QuestionWriteTool questionWriteTool;
    private final ExperienceWriteTool experienceWriteTool;
    private final OpportunityWriteTool opportunityWriteTool;
    private final ApplicationWriteTool applicationWriteTool;
    private final MockSessionWriteTool mockSessionWriteTool;
    private final FeedbackWriteTool feedbackWriteTool;
    private final AttendanceWriteTool attendanceWriteTool;
    private final NotificationWriteTool notificationWriteTool;
    private final UserWriteTool userWriteTool;
    private final SelectionWriteTool selectionWriteTool;
    private final CandidateWriteTool candidateWriteTool;
    private final UserRepository userRepository;

    public AiChatService(
            ChatClient chatClient,
            CompanyTool companyTool,
            DriveTool driveTool,
            QuestionTool questionTool,
            InsightsTool insightsTool,
            ExperienceTool experienceTool,
            OpportunityTool opportunityTool,
            ResumeAtsTool resumeAtsTool,
            UserTool userTool,
            UserRepository userRepository,
            StudentApplicationTool studentApplicationTool,
            StudentAttendanceTool studentAttendanceTool,
            StudentEligibilityTool studentEligibilityTool,
            StudentMockSessionTool studentMockSessionTool,
            StaffApplicationTool staffApplicationTool,
            StaffAttendanceTool staffAttendanceTool,
            StaffFeedbackTool staffFeedbackTool,
            CompanyWriteTool companyWriteTool,
            DriveWriteTool driveWriteTool,
            QuestionWriteTool questionWriteTool,
            ExperienceWriteTool experienceWriteTool,
            OpportunityWriteTool opportunityWriteTool,
            ApplicationWriteTool applicationWriteTool,
            MockSessionWriteTool mockSessionWriteTool,
            FeedbackWriteTool feedbackWriteTool,
            AttendanceWriteTool attendanceWriteTool,
            NotificationWriteTool notificationWriteTool,
            UserWriteTool userWriteTool,
            SelectionWriteTool selectionWriteTool,
            CandidateWriteTool candidateWriteTool
    ) {
        this.chatClient = chatClient;
        this.companyTool = companyTool;
        this.driveTool = driveTool;
        this.questionTool = questionTool;
        this.insightsTool = insightsTool;
        this.experienceTool = experienceTool;
        this.opportunityTool = opportunityTool;
        this.resumeAtsTool = resumeAtsTool;
        this.userTool = userTool;
        this.userRepository = userRepository;
        this.studentApplicationTool = studentApplicationTool;
        this.studentAttendanceTool = studentAttendanceTool;
        this.studentEligibilityTool = studentEligibilityTool;
        this.studentMockSessionTool = studentMockSessionTool;
        this.staffApplicationTool = staffApplicationTool;
        this.staffAttendanceTool = staffAttendanceTool;
        this.staffFeedbackTool = staffFeedbackTool;
        this.companyWriteTool = companyWriteTool;
        this.driveWriteTool = driveWriteTool;
        this.questionWriteTool = questionWriteTool;
        this.experienceWriteTool = experienceWriteTool;
        this.opportunityWriteTool = opportunityWriteTool;
        this.applicationWriteTool = applicationWriteTool;
        this.mockSessionWriteTool = mockSessionWriteTool;
        this.feedbackWriteTool = feedbackWriteTool;
        this.attendanceWriteTool = attendanceWriteTool;
        this.notificationWriteTool = notificationWriteTool;
        this.userWriteTool = userWriteTool;
        this.selectionWriteTool = selectionWriteTool;
        this.candidateWriteTool = candidateWriteTool;
    }

    public Flux<String> chat(String message) {
        if (message == null || message.isBlank()) {
            return Flux.just("Please ask a PlacePrep-related question.");
        }
        if (!isPlacePrepRequest(message)) {
            return Flux.just("I can only help with PlacePrep data and workflows such as placements, drives, applications, interviews, resumes, eligibility, and attendance.");
        }
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Authentication is required for AI chat");
        }
        var user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user was not found"));
        List<Object> tools = new ArrayList<>(List.of(
                companyTool, driveTool, questionTool, insightsTool,
                experienceTool, opportunityTool, resumeAtsTool, userTool,
                studentApplicationTool, studentAttendanceTool,
                studentEligibilityTool, studentMockSessionTool
        ));
        tools.add(applicationWriteTool);
        tools.add(mockSessionWriteTool);
        tools.add(experienceWriteTool);
        tools.add(feedbackWriteTool);
        tools.add(userWriteTool);
        if (isStaffRole(user.getRole())) {
            tools.add(staffApplicationTool);
            tools.add(staffAttendanceTool);
            tools.add(attendanceWriteTool);
        }
        if (isPlacementStaffRole(user.getRole())) {
            tools.add(staffFeedbackTool);
            tools.add(selectionWriteTool);
            tools.add(candidateWriteTool);
        }
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            tools.add(companyWriteTool);
            tools.add(driveWriteTool);
            tools.add(questionWriteTool);
            tools.add(opportunityWriteTool);
            tools.add(notificationWriteTool);
        }
        return chatClient.prompt()
                .user(message)
                .tools(tools.toArray())
                .toolContext(Map.of(
                        "userId", user.getId(),
                        "userEmail", user.getEmail(),
                        "role", user.getRole()
                ))
                .stream()
                .content();
    }

    private boolean isStaffRole(String role) {
        return Set.of("TEACHER", "FACULTY", "HOD", "TPO", "MANAGEMENT", "ADMIN")
                .contains(role == null ? "" : role.toUpperCase());
    }

    private boolean isPlacementStaffRole(String role) {
        return Set.of("HOD", "TPO", "MANAGEMENT", "ADMIN")
                .contains(role == null ? "" : role.toUpperCase());
    }

    private boolean isPlacePrepRequest(String message) {
        String normalized = message.toLowerCase();
        return Set.of(
                "placeprep", "placement", "drive", "company", "interview",
                "resume", "ats", "eligib", "attendance", "application",
                "internship", "hackathon", "question", "mock", "career",
                "recruit", "campus", "batch", "cgpa", "backlog", "feedback"
        ).stream().anyMatch(normalized::contains);
    }
}
