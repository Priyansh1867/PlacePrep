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
import com.placeprep.tools.TimetableTool;
import com.placeprep.tools.AcademicRecordTool;
import com.placeprep.tools.LiveSessionTool;
import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ToolContext;
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
    private final TimetableTool timetableTool;
    private final AcademicRecordTool academicRecordTool;
    private final LiveSessionTool liveSessionTool;
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
            CandidateWriteTool candidateWriteTool,
            TimetableTool timetableTool,
            AcademicRecordTool academicRecordTool,
            LiveSessionTool liveSessionTool
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
        this.timetableTool = timetableTool;
        this.academicRecordTool = academicRecordTool;
        this.liveSessionTool = liveSessionTool;
    }

    public Flux<String> chat(String message) {
        if (message == null || message.isBlank()) {
            return Flux.just("Please ask a question about your timetable, attendance, drives, applications, or technical interview preparation.");
        }

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Authentication is required for AI chat");
        }
        var user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user was not found"));

        String trimmed = message.trim();
        String lower = trimmed.toLowerCase();

        // 1. Friendly Interactive Greeting
        if (lower.matches("^(hi|hello|hey|greetings|good\\s+(morning|afternoon|evening)|who\\s+are\\s+you|what\\s+can\\s+you\\s+do)\\b.*")) {
            return Flux.just(getWelcomeGreeting(user));
        }

        // 2. Active Tools setup
        List<Object> tools = new ArrayList<>(List.of(
                companyTool, driveTool, questionTool, insightsTool,
                experienceTool, opportunityTool, resumeAtsTool, userTool,
                studentApplicationTool, studentAttendanceTool,
                studentEligibilityTool, studentMockSessionTool,
                timetableTool, academicRecordTool, liveSessionTool
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

        Map<String, Object> toolContextMap = Map.of(
                "userId", user.getId(),
                "userEmail", user.getEmail(),
                "role", user.getRole()
        );

        // 3. Prompt execution with resilient fallback on external model failure
        return chatClient.prompt()
                .user(message)
                .tools(tools.toArray())
                .toolContext(toolContextMap)
                .stream()
                .content()
                .onErrorResume(error -> {
                    // Fallback to internal tools and direct response if remote AI service is unreachable or rate-limited
                    return Flux.just(generateDirectResponse(message, user, toolContextMap));
                });
    }

    private String getWelcomeGreeting(User user) {
        String name = user.getName() != null ? user.getName() : "Student";
        return String.format(
                "Hello **%s**! 👋 I am **PlacePrep AI**, your campus placement, academic, timetable, and technical preparation assistant.\n\n"
                        + "Here is what you can ask me:\n\n"
                        + "- 📅 **My Schedule & Timetable**: *\"What is my schedule today?\"* or *\"Tell me about my timetable\"*\n"
                        + "- 📊 **My Attendance**: *\"What is my attendance percentage?\"* or *\"Do I have any attendance shortages?\"*\n"
                        + "- 💼 **Campus Drives & Eligibility**: *\"Show upcoming placement drives\"* or *\"Am I eligible for Google/Microsoft?\"*\n"
                        + "- 📝 **My Applications**: *\"Show my applications\"* or *\"What is my round status?\"*\n"
                        + "- 🎓 **Academic Records**: *\"What is my current CGPA and backlogs?\"*\n"
                        + "- 💻 **Technical & DSA Prep**: *\"Explain Dijkstra's algorithm with code\"* or *\"How to solve Two Sum?\"*\n"
                        + "- 🎯 **Behavioral & HR Prep**: *\"How should I answer 'Tell me about yourself'?\"*\n\n"
                        + "How can I help you right now?",
                name
        );
    }

    @SuppressWarnings("unchecked")
    private String generateDirectResponse(String message, User user, Map<String, Object> toolContextMap) {
        String lower = message.toLowerCase();
        ToolContext context = new ToolContext(toolContextMap);

        // Timetable / Schedule Queries
        if (lower.contains("schedule") || lower.contains("timetable") || lower.contains("class") || lower.contains("lecture") || lower.contains("period") || lower.contains("room")) {
            Object schedule = timetableTool.getTodaySchedule(context);
            if (schedule instanceof Map<?, ?> rawMap) {
                Map<String, Object> map = (Map<String, Object>) rawMap;
                StringBuilder sb = new StringBuilder();
                String day = String.valueOf(map.getOrDefault("day", "Today"));
                sb.append("### 📅 Your Schedule for ").append(day).append("\n\n");
                if (map.containsKey("message")) {
                    sb.append(map.get("message")).append("\n\n");
                }
                Object classesObj = map.get("classesToday");
                if (classesObj instanceof List<?> list && !list.isEmpty()) {
                    sb.append("| Period | Time | Subject | Room | Faculty | Status |\n");
                    sb.append("| :--- | :--- | :--- | :--- | :--- | :--- |\n");
                    for (Object item : list) {
                        if (item instanceof Map<?, ?> rawSlot) {
                            Map<String, Object> slot = (Map<String, Object>) rawSlot;
                            sb.append(String.format("| %s | %s | **%s** (%s) | %s | %s | %s |\n",
                                    slot.getOrDefault("period", "-"),
                                    slot.getOrDefault("time", "-"),
                                    slot.getOrDefault("subject", "Class"),
                                    slot.getOrDefault("subjectCode", ""),
                                    slot.getOrDefault("room", "TBA"),
                                    slot.getOrDefault("faculty", "Faculty"),
                                    slot.getOrDefault("status", "Active")
                            ));
                        }
                    }
                } else if (!Boolean.TRUE.equals(map.get("isWeekend"))) {
                    sb.append("No active scheduled classes recorded for today. You can view your full weekly timetable in the Institute Timetable portal.");
                }
                return sb.toString();
            }
            return "### 📅 Your Schedule\nPlease check the Timetable tab in the Institute Portal for your assigned section's live timetable.";
        }

        // Attendance Queries
        if (lower.contains("attend") || lower.contains("shortage") || lower.contains("absent") || lower.contains("present")) {
            Object attObj = studentAttendanceTool.getMyAttendance(context);
            if (attObj instanceof Map<?, ?> rawAtt) {
                Map<String, Object> att = (Map<String, Object>) rawAtt;
                double pct = att.get("overallPercentage") instanceof Number n ? n.doubleValue() : 0.0;
                int attended = att.get("attendedClasses") instanceof Number n ? n.intValue() : 0;
                int total = att.get("totalClasses") instanceof Number n ? n.intValue() : 0;
                boolean shortage = Boolean.TRUE.equals(att.get("shortageWarning"));

                StringBuilder sb = new StringBuilder();
                sb.append("### 📊 Attendance Summary\n\n");
                sb.append(String.format("- **Overall Attendance:** `%.1f%%` (%d of %d classes attended)\n", pct, attended, total));
                sb.append("- **Minimum Mandatory Attendance:** `75.0%`\n");
                if (shortage) {
                    sb.append("- ⚠️ **Status:** **ATTENDANCE SHORTAGE WARNING (<75%)**. Please attend upcoming classes regularly to maintain placement eligibility!\n");
                } else {
                    sb.append("- ✅ **Status:** **In Good Standing (Eligible)**\n");
                }

                Object breakdown = att.get("subjectBreakdown");
                if (breakdown instanceof List<?> subList && !subList.isEmpty()) {
                    sb.append("\n#### Subject Breakdown:\n");
                    sb.append("| Subject | Attended | Total | Percentage | Status |\n");
                    sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                    for (Object subItem : subList) {
                        if (subItem instanceof Map<?, ?> rawSub) {
                            Map<String, Object> sub = (Map<String, Object>) rawSub;
                            double subPct = sub.get("percentage") instanceof Number num ? num.doubleValue() : 0.0;
                            boolean subShortage = Boolean.TRUE.equals(sub.get("shortage"));
                            sb.append(String.format("| %s | %s | %s | %.1f%% | %s |\n",
                                    sub.get("subject"),
                                    sub.get("attended"),
                                    sub.get("total"),
                                    subPct,
                                    subShortage ? "⚠️ Low (<75%)" : "✅ Good"
                            ));
                        }
                    }
                }
                return sb.toString();
            }
            return "### 📊 Attendance\nYour attendance records are synchronized with the Daily Class Attendance system. Currently no attendance shortages have been flagged.";
        }

        // Academic Records / CGPA
        if (lower.contains("cgpa") || lower.contains("gpa") || lower.contains("backlog") || lower.contains("mark") || lower.contains("academic")) {
            Object recordObj = academicRecordTool.getMyAcademicRecord(context);
            if (recordObj instanceof Map<?, ?> rawRec) {
                Map<String, Object> rec = (Map<String, Object>) rawRec;
                StringBuilder sb = new StringBuilder();
                sb.append("### 🎓 Academic Performance Summary\n\n");
                sb.append(String.format("- **Name:** %s\n", rec.getOrDefault("name", user.getName())));
                sb.append(String.format("- **Branch:** %s\n", rec.getOrDefault("branch", user.getBranch() != null ? user.getBranch() : "Computer Science")));
                sb.append(String.format("- **Current CGPA:** **%s**\n", rec.getOrDefault("cgpa", "N/A")));
                sb.append(String.format("- **Active Backlogs:** **%s**\n", rec.getOrDefault("activeBacklogs", "0")));
                if (rec.containsKey("tenthPercentage") && rec.get("tenthPercentage") != null) {
                    sb.append(String.format("- **Class 10th:** %s%%\n", rec.get("tenthPercentage")));
                }
                if (rec.containsKey("twelfthPercentage") && rec.get("twelfthPercentage") != null) {
                    sb.append(String.format("- **Class 12th:** %s%%\n", rec.get("twelfthPercentage")));
                }
                return sb.toString();
            }
        }

        // Applications Queries
        if (lower.contains("application") || lower.contains("applied") || lower.contains("status") || lower.contains("shortlist")) {
            Object appsObj = studentApplicationTool.listMyApplications(context);
            if (appsObj instanceof List<?> appsList && !appsList.isEmpty()) {
                StringBuilder sb = new StringBuilder("### 📝 Your Placement Applications\n\n");
                sb.append("| Company | Role | Applied Date | Status | Current Round |\n");
                sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                for (Object appItem : appsList) {
                    if (appItem instanceof Map<?, ?> rawApp) {
                        Map<String, Object> app = (Map<String, Object>) rawApp;
                        sb.append(String.format("| **%s** | %s | %s | `%s` | %s |\n",
                                app.getOrDefault("companyName", "Company"),
                                app.getOrDefault("role", "SDE"),
                                app.getOrDefault("appliedDate", "Recent"),
                                app.getOrDefault("status", "IN_PROGRESS"),
                                app.getOrDefault("currentRound", "Round 1")
                        ));
                    }
                }
                return sb.toString();
            }
            return "### 📝 Applications\nYou have not submitted applications yet, or all records are currently up to date. Visit the Placement Drives portal to apply for open companies.";
        }

        // Drives / Opportunities Queries
        if (lower.contains("drive") || lower.contains("company") || lower.contains("placement") || lower.contains("internship") || lower.contains("hackathon") || lower.contains("job")) {
            Object drivesObj = driveTool.listDrives("");
            if (drivesObj instanceof List<?> drivesList && !drivesList.isEmpty()) {
                StringBuilder sb = new StringBuilder("### 💼 Upcoming Placement Drives\n\n");
                sb.append("| Company | Role | CTC / Package | Min CGPA | Status |\n");
                sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                for (Object driveItem : drivesList) {
                    if (driveItem instanceof Map<?, ?> rawDrive) {
                        Map<String, Object> drive = (Map<String, Object>) rawDrive;
                        sb.append(String.format("| **%s** | %s | %s | %s | `%s` |\n",
                                drive.getOrDefault("companyName", "Company"),
                                drive.getOrDefault("role", "Software Engineer"),
                                drive.getOrDefault("ctc", "Competitive"),
                                drive.getOrDefault("minCgpa", "7.0"),
                                drive.getOrDefault("status", "ACTIVE")
                        ));
                    }
                }
                sb.append("\nVisit the Placement Drives tab to review complete eligibility criteria and submit applications.");
                return sb.toString();
            }
        }

        // Technical / Coding / Tricky Interview Guidance
        return "### 💡 PlacePrep Placement & Technical Preparation\n\n"
                + "I can help you with this technical and interview topic! Here are the core pillars to ace technical and tricky interview rounds:\n\n"
                + "1. **Problem Understanding & Constraints:** Always clarify input bounds ($N \\le 10^5$, negative numbers, duplicate elements) before writing code.\n"
                + "2. **Optimal Approach:** Walk through the brute force ($O(N^2)$), then identify redundant computations using HashMaps, Sliding Windows, Two Pointers, or Dynamic Programming ($O(N)$ or $O(N \\log N)$).\n"
                + "3. **Edge Cases:** Empty input, single element, extreme values, duplicates, and boundary limits.\n"
                + "4. **Clear Communication:** In mock and live interviews, explain your thought process out loud before coding.\n\n"
                + "Feel free to ask me to write code, explain specific data structures (Trees, Graphs, DP), solve DSA questions, or review your resume!";
    }

    private boolean isStaffRole(String role) {
        return Set.of("TEACHER", "FACULTY", "HOD", "TPO", "MANAGEMENT", "ADMIN")
                .contains(role == null ? "" : role.toUpperCase());
    }

    private boolean isPlacementStaffRole(String role) {
        return Set.of("HOD", "TPO", "MANAGEMENT", "ADMIN")
                .contains(role == null ? "" : role.toUpperCase());
    }
}
