package com.placeprep.service;

import com.placeprep.dto.EntityResponseDto;
import com.placeprep.model.Hackathon;
import com.placeprep.model.Internship;
import com.placeprep.model.OffCampusJob;
import com.placeprep.model.PlacementDrive;
import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import com.placeprep.tools.AcademicRecordTool;
import com.placeprep.tools.AiToolAuthorization;
import com.placeprep.tools.ApplicationWriteTool;
import com.placeprep.tools.AttendanceWriteTool;
import com.placeprep.tools.CandidateWriteTool;
import com.placeprep.tools.CompanyTool;
import com.placeprep.tools.CompanyWriteTool;
import com.placeprep.tools.DriveTool;
import com.placeprep.tools.DriveWriteTool;
import com.placeprep.tools.ExperienceTool;
import com.placeprep.tools.ExperienceWriteTool;
import com.placeprep.tools.FeedbackWriteTool;
import com.placeprep.tools.InsightsTool;
import com.placeprep.tools.LiveSessionTool;
import com.placeprep.tools.MockSessionWriteTool;
import com.placeprep.tools.NotificationTool;
import com.placeprep.tools.NotificationWriteTool;
import com.placeprep.tools.OpportunityTool;
import com.placeprep.tools.OpportunityWriteTool;
import com.placeprep.tools.QuestionTool;
import com.placeprep.tools.QuestionWriteTool;
import com.placeprep.tools.ResumeAtsTool;
import com.placeprep.tools.SelectionWriteTool;
import com.placeprep.tools.StaffApplicationTool;
import com.placeprep.tools.StaffAttendanceTool;
import com.placeprep.tools.StaffFeedbackTool;
import com.placeprep.tools.StudentApplicationTool;
import com.placeprep.tools.StudentAttendanceTool;
import com.placeprep.tools.StudentEligibilityTool;
import com.placeprep.tools.StudentMockSessionTool;
import com.placeprep.tools.TimetableTool;
import com.placeprep.tools.UserTool;
import com.placeprep.tools.UserWriteTool;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
    private final NotificationTool notificationTool;
    private final UserRepository userRepository;

    public AiChatService(
            ChatClient chatClient,
            CompanyTool companyTool,
            DriveTool driveTool,
            QuestionTool questionTool,
            InsightsTool insightsTool,
            ExperienceTool experienceTool,
            OpportunityTool opportunityTool,
            NotificationTool notificationTool,
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
        this.notificationTool = notificationTool;
    }

    public Flux<String> chat(String message) {
        if (message == null || message.isBlank()) {
            return Flux.just("Please ask a question about your timetable, attendance, drives, hackathons, applications, or technical interview preparation.");
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
                experienceTool, opportunityTool, opportunityWriteTool, resumeAtsTool, userTool,
                studentApplicationTool, studentAttendanceTool,
                studentEligibilityTool, studentMockSessionTool,
                timetableTool, academicRecordTool, liveSessionTool, notificationTool,
                applicationWriteTool, mockSessionWriteTool,
                experienceWriteTool, feedbackWriteTool, userWriteTool,
                staffApplicationTool, staffAttendanceTool, staffFeedbackTool,
                attendanceWriteTool, selectionWriteTool, candidateWriteTool,
                companyWriteTool, driveWriteTool, questionWriteTool, notificationWriteTool
        ));

        String normalizedRole = AiToolAuthorization.normalizeRole(user.getRole());
        Map<String, Object> toolContextMap = Map.of(
                "userId", user.getId(),
                "userEmail", user.getEmail(),
                "role", normalizedRole
        );

        // 3. Prompt execution with resilient error handling & access control
        return chatClient.prompt()
                .user(message)
                .tools(tools.toArray())
                .toolContext(toolContextMap)
                .stream()
                .content()
                .onErrorResume(error -> {
                    String errMessage = error.getMessage() != null ? error.getMessage().toLowerCase() : "";
                    Throwable cause = error.getCause();
                    String causeMessage = cause != null && cause.getMessage() != null ? cause.getMessage().toLowerCase() : "";

                    if (error instanceof SecurityException || error instanceof AccessDeniedException
                            || (cause != null && (cause instanceof SecurityException || cause instanceof AccessDeniedException))
                            || errMessage.contains("access denied") || errMessage.contains("permission") || causeMessage.contains("access denied")) {
                        return Flux.just("🚫 **Access Denied**: You do not have permission to view or modify this confidential data. This information or action is restricted to authorized roles (e.g. Faculty, HOD, TPO, or Administrator).");
                    }

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
                        + "- 💼 **Campus Drives**: *\"What are the upcoming drives?\"* or *\"Am I eligible for Google/Microsoft?\"*\n"
                        + "- 🏆 **Hackathons & Competitions**: *\"Give me the list of hackathons\"*\n"
                        + "- 💼 **Internships**: *\"Show corporate internships\"*\n"
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

        // 1. Hackathons Query (Creation or Listing)
        if (lower.contains("hackathon")) {
            if (lower.contains("create") || lower.contains("add") || lower.contains("post") || lower.contains("new") || lower.contains("insert")) {
                if (!isOpportunityStaffRole(user.getRole())) {
                    return "🚫 **Access Denied**: You do not have permission to add hackathons. Creating hackathon listings is restricted to **TPO**, **Director**, or **Administrator** accounts.";
                }
                try {
                    String title = extractParam(message, "title", "name", "named", "called");
                    if (title == null || title.isBlank()) {
                        title = extractQuotedText(message);
                    }
                    if (title == null || title.isBlank()) {
                        title = "PlacePrep National Innovation Hackathon 2026";
                    }

                    String organizer = extractParam(message, "organizer", "by", "sponsor");
                    if (organizer == null || organizer.isBlank()) {
                        organizer = (user.getName() != null && !user.getName().isBlank()) ? user.getName() : "TPO Cell";
                    }

                    String prize = extractParam(message, "prize", "prizepool", "prize pool", "reward");
                    if (prize == null || prize.isBlank()) {
                        prize = "₹1,50,000";
                    }

                    String deadline = extractParam(message, "deadline", "registration deadline", "last date");
                    if (deadline == null || deadline.isBlank()) {
                        deadline = "30 Nov 2026";
                    }

                    String domains = extractParam(message, "domain", "domains", "tag", "tags", "tracks");
                    if (domains == null || domains.isBlank()) {
                        domains = "AI/ML, Web3, Cloud, Fintech";
                    }

                    Hackathon h = new Hackathon();
                    h.setTitle(title);
                    h.setOrganizer(organizer);
                    h.setDescription("Annual campus innovation hackathon focused on problem-solving, AI, and software engineering.");
                    h.setPrizePool(prize);
                    h.setRegistrationDeadline(deadline);
                    h.setEventDate("15 Dec 2026");
                    h.setTeamSize("2-4 Members");
                    h.setDomains(domains);
                    h.setRegistrationUrl("https://placeprep.com/hackathons/register");
                    opportunityWriteTool.createHackathon(h, context);
                    return String.format("✅ **Hackathon Created Successfully!**\n\n"
                            + "- **Title:** %s\n- **Organizer:** %s\n- **Prize Pool:** %s\n- **Deadline:** %s\n- **Domains:** %s\n- **Team Size:** %s\n\n"
                            + "The hackathon is now published and visible to students in the Opportunities & Hackathons Hub.",
                            h.getTitle(), h.getOrganizer(), h.getPrizePool(), h.getRegistrationDeadline(), h.getDomains(), h.getTeamSize());
                } catch (Exception ex) {
                    return "Could not create hackathon: " + ex.getMessage();
                }
            }
            Object hackObj = opportunityTool.listHackathons();
            List<Map<String, Object>> items = toListOfMaps(hackObj);
            if (!items.isEmpty()) {
                StringBuilder sb = new StringBuilder("### 🏆 Active Hackathons & Competitions\n\n");
                sb.append("| Hackathon | Organizer | Prize Pool | Deadline | Domains |\n");
                sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                for (Map<String, Object> h : items) {
                    sb.append(String.format("| **%s** | %s | %s | %s | %s |\n",
                            h.getOrDefault("title", "Hackathon"),
                            h.getOrDefault("organizer", "Organizer"),
                            h.getOrDefault("prizePool", "Exciting Prizes"),
                            h.getOrDefault("registrationDeadline", "Open"),
                            h.getOrDefault("domains", h.getOrDefault("tags", "AI/ML, Web, Cloud"))
                    ));
                }
                return sb.toString();
            }
            return "### 🏆 Active Hackathons\nThere are currently no active hackathons listed. Check back soon for upcoming coding events!";
        }

        // 2. Internships Query
        if (lower.contains("internship") || lower.contains("intern")) {
            Object internObj = opportunityTool.listInternships("");
            List<Map<String, Object>> items = toListOfMaps(internObj);
            if (!items.isEmpty()) {
                StringBuilder sb = new StringBuilder("### 💼 Corporate Internships\n\n");
                sb.append("| Company | Role | Stipend | Duration | Work Mode |\n");
                sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                for (Map<String, Object> in : items) {
                    sb.append(String.format("| **%s** | %s | %s | %s | %s |\n",
                            in.getOrDefault("companyName", "Company"),
                            in.getOrDefault("role", "Intern"),
                            in.getOrDefault("stipend", "Competitive"),
                            in.getOrDefault("duration", "8-12 Weeks"),
                            in.getOrDefault("workMode", "Hybrid")
                    ));
                }
                return sb.toString();
            }
            return "### 💼 Corporate Internships\nThere are currently no internship postings listed. Check back soon!";
        }

        // 3. Off-Campus Jobs Query
        if (lower.contains("off-campus") || lower.contains("offcampus")) {
            Object jobsObj = opportunityTool.listOffCampusOpportunities(user.getEmail());
            List<Map<String, Object>> items = toListOfMaps(jobsObj);
            if (!items.isEmpty()) {
                StringBuilder sb = new StringBuilder("### 🌐 Off-Campus Opportunities\n\n");
                sb.append("| Company | Role | Salary Range | Location | Mode |\n");
                sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                for (Map<String, Object> job : items) {
                    sb.append(String.format("| **%s** | %s | %s | %s | %s |\n",
                            job.getOrDefault("companyName", "Company"),
                            job.getOrDefault("role", "Software Engineer"),
                            job.getOrDefault("salaryRange", "Competitive"),
                            job.getOrDefault("location", "Pan-India"),
                            job.getOrDefault("workMode", "Hybrid")
                    ));
                }
                return sb.toString();
            }
            return "### 🌐 Off-Campus Opportunities\nNo off-campus job postings found at the moment.";
        }

        // 4. Placement Drives Query
        if (lower.contains("drive") || lower.contains("placement") || lower.contains("company") || lower.contains("companies") || lower.contains("upcoming")) {
            Object drivesObj = driveTool.listDrives("");
            List<Map<String, Object>> items = toListOfMaps(drivesObj);
            if (!items.isEmpty()) {
                StringBuilder sb = new StringBuilder("### 💼 Upcoming Placement Drives\n\n");
                sb.append("| Company | Role | CTC / Package | Min CGPA | Status |\n");
                sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                for (Map<String, Object> drive : items) {
                    sb.append(String.format("| **%s** | %s | %s | %s | `%s` |\n",
                            drive.getOrDefault("companyName", "Company"),
                            drive.getOrDefault("role", "Software Engineer"),
                            drive.getOrDefault("ctc", "Competitive"),
                            drive.getOrDefault("minCgpa", "7.0"),
                            drive.getOrDefault("status", "ACTIVE")
                    ));
                }
                return sb.toString();
            }
            return "### 💼 Upcoming Placement Drives\nThere are currently no active placement drives published in the database.";
        }

        // 5. Timetable / Schedule Queries
        if (lower.contains("schedule") || lower.contains("timetable") || lower.contains("class") || lower.contains("lecture") || lower.contains("period") || lower.contains("room")) {
            Object schedule = timetableTool.getTodaySchedule(context);
            if (schedule instanceof Map<?, ?> rawMap) {
                Map<String, Object> map = (Map<String, Object>) rawMap;
                StringBuilder sb = new StringBuilder();
                String day = String.valueOf(map.getOrDefault("day", "Today"));
                Object classesObj = map.get("classesToday");
                List<?> classesList = classesObj instanceof List<?> ? (List<?>) classesObj : List.of();

                if (!classesList.isEmpty()) {
                    sb.append("### 📅 Your Schedule for ").append(day).append("\n\n");
                    sb.append("| Period | Time | Subject | Room | Faculty | Status |\n");
                    sb.append("| :--- | :--- | :--- | :--- | :--- | :--- |\n");
                    for (Object item : classesList) {
                        Map<String, Object> slot = extractFields(item);
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
                    return sb.toString();
                }

                // If today has no classes, show weekly timetable directly
                Object weeklyScheduleObj = map.get("weeklySchedule");
                if (weeklyScheduleObj instanceof Map<?, ?> weeklyMap) {
                    sb.append("### 📅 Weekly Class Timetable (No classes scheduled for ").append(day).append(")\n\n");
                    String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
                    for (String d : days) {
                        Object dayClasses = weeklyMap.get(d);
                        if (dayClasses instanceof List<?> dList && !dList.isEmpty()) {
                            sb.append("#### ").append(d).append("\n");
                            sb.append("| Period | Time | Subject | Room | Faculty |\n");
                            sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                            for (Object slotItem : dList) {
                                Map<String, Object> s = extractFields(slotItem);
                                sb.append(String.format("| %s | %s | **%s** | %s | %s |\n",
                                        s.getOrDefault("period", "-"),
                                        s.getOrDefault("time", "-"),
                                        s.getOrDefault("subject", "Class"),
                                        s.getOrDefault("room", "TBA"),
                                        s.getOrDefault("faculty", "Faculty")
                                ));
                            }
                            sb.append("\n");
                        }
                    }
                    return sb.toString();
                }
            }
            return "### 📅 Timetable\nYour assigned department timetable is currently being finalized.";
        }

        // 6. Attendance Queries
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
                        Map<String, Object> sub = extractFields(subItem);
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
                return sb.toString();
            }
            return "### 📊 Attendance\nYour attendance records are synchronized. Currently no attendance shortages have been flagged.";
        }

        // 7. Academic Records / CGPA
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

        // 8. Applications Queries
        if (lower.contains("application") || lower.contains("applied") || lower.contains("status") || lower.contains("shortlist")) {
            Object appsObj = studentApplicationTool.listMyApplications(context);
            List<Map<String, Object>> items = toListOfMaps(appsObj);
            if (!items.isEmpty()) {
                StringBuilder sb = new StringBuilder("### 📝 Your Placement Applications\n\n");
                sb.append("| Company | Role | Applied Date | Status | Current Round |\n");
                sb.append("| :--- | :--- | :--- | :--- | :--- |\n");
                for (Map<String, Object> app : items) {
                    sb.append(String.format("| **%s** | %s | %s | `%s` | %s |\n",
                            app.getOrDefault("companyName", "Company"),
                            app.getOrDefault("role", "SDE"),
                            app.getOrDefault("appliedDate", "Recent"),
                            app.getOrDefault("status", "IN_PROGRESS"),
                            app.getOrDefault("currentRound", "Round 1")
                    ));
                }
                return sb.toString();
            }
            return "### 📝 Applications\nYou have 0 active submitted applications recorded at the moment.";
        }

        // 9. Technical / Coding / Tricky Interview Guidance
        return "### 💡 PlacePrep Placement & Technical Preparation\n\n"
                + "I can help you with this technical and interview topic! Here are the core pillars to ace technical and tricky interview rounds:\n\n"
                + "1. **Problem Understanding & Constraints:** Always clarify input bounds ($N \\le 10^5$, negative numbers, duplicate elements) before writing code.\n"
                + "2. **Optimal Approach:** Walk through the brute force ($O(N^2)$), then identify redundant computations using HashMaps, Sliding Windows, Two Pointers, or Dynamic Programming ($O(N)$ or $O(N \\log N)$).\n"
                + "3. **Edge Cases:** Empty input, single element, extreme values, duplicates, and boundary limits.\n"
                + "4. **Clear Communication:** In mock and live interviews, explain your thought process out loud before coding.\n\n"
                + "Feel free to ask me to write code, explain specific data structures (Trees, Graphs, DP), solve DSA questions, or review your resume!";
    }

    private List<Map<String, Object>> toListOfMaps(Object raw) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object item : list) {
                Map<String, Object> fields = extractFields(item);
                if (!fields.isEmpty()) {
                    result.add(fields);
                }
            }
        }
        return result;
    }

    private Map<String, Object> extractFields(Object item) {
        if (item == null) return Map.of();
        if (item instanceof Map<?, ?> m) {
            Map<String, Object> res = new LinkedHashMap<>();
            m.forEach((k, v) -> res.put(String.valueOf(k), v));
            return res;
        }
        if (item instanceof EntityResponseDto dto) {
            return dto.getFields() != null ? dto.getFields() : Map.of();
        }
        if (item instanceof PlacementDrive pd) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("companyName", pd.getCompanyName());
            map.put("role", pd.getRole());
            map.put("ctc", pd.getCtc() != null ? pd.getCtc() : "Competitive");
            map.put("minCgpa", pd.getMinCgpa() != null ? pd.getMinCgpa() : "7.0");
            map.put("status", pd.getStatus() != null ? pd.getStatus() : "ACTIVE");
            map.put("deadline", pd.getDeadline());
            map.put("venue", pd.getVenue());
            map.put("driveDate", pd.getDriveDate());
            return map;
        }
        if (item instanceof Hackathon h) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("title", h.getTitle());
            map.put("organizer", h.getOrganizer());
            map.put("prizePool", h.getPrizePool());
            map.put("registrationDeadline", h.getRegistrationDeadline());
            map.put("eventDate", h.getEventDate());
            map.put("domains", h.getDomains() != null ? h.getDomains() : h.getTags());
            map.put("registrationUrl", h.getRegistrationUrl());
            map.put("teamSize", h.getTeamSize());
            return map;
        }
        if (item instanceof Internship in) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("companyName", in.getCompanyName());
            map.put("role", in.getRole());
            map.put("stipend", in.getStipend());
            map.put("duration", in.getDuration());
            map.put("location", in.getLocation());
            map.put("workMode", in.getWorkMode());
            map.put("applicationUrl", in.getApplicationUrl());
            return map;
        }
        if (item instanceof OffCampusJob job) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("companyName", job.getCompanyName());
            map.put("role", job.getRole());
            map.put("salaryRange", job.getSalaryRange());
            map.put("location", job.getLocation());
            map.put("workMode", job.getWorkMode());
            map.put("applicationUrl", job.getApplicationUrl());
            return map;
        }
        return Map.of();
    }

    private boolean isStaffRole(String role) {
        String r = AiToolAuthorization.normalizeRole(role);
        return Set.of("TEACHER", "FACULTY", "HOD", "TPO", "MANAGEMENT", "ADMIN", "DIRECTOR")
                .contains(r);
    }

    private boolean isPlacementStaffRole(String role) {
        String r = AiToolAuthorization.normalizeRole(role);
        return Set.of("HOD", "TPO", "MANAGEMENT", "ADMIN", "DIRECTOR")
                .contains(r);
    }

    private boolean isOpportunityStaffRole(String role) {
        String r = AiToolAuthorization.normalizeRole(role);
        return Set.of("ADMIN", "DIRECTOR", "TPO")
                .contains(r);
    }

    private String extractQuotedText(String text) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("[\"']([^\"']+)[\"']").matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        return null;
    }

    private String extractParam(String text, String... keys) {
        for (String key : keys) {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(
                    "(?i)\\b" + java.util.regex.Pattern.quote(key) + "\\s*[:=]\\s*([\"']?)([^,\"';\\n]+)\\1"
            );
            java.util.regex.Matcher m = p.matcher(text);
            if (m.find()) {
                return m.group(2).trim();
            }
        }
        return null;
    }
}
