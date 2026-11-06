package com.placeprep.tools;

import com.placeprep.model.Hackathon;
import com.placeprep.model.Internship;
import com.placeprep.service.OpportunityService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class OpportunityWriteTool {
    private final OpportunityService opportunityService;

    public OpportunityWriteTool(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @Tool(description = "Create a new hackathon listing with title, organizer, prizePool, eventDate, registrationDeadline, domains, and registrationUrl. Requires ADMIN, DIRECTOR, or TPO role.")
    public Object createHackathon(
            @ToolParam(description = "Title or name of the hackathon") String title,
            @ToolParam(description = "Organizer, sponsor, company, or hosting body", required = false) String organizer,
            @ToolParam(description = "Prize pool or rewards, e.g. '₹2,00,000'", required = false) String prizePool,
            @ToolParam(description = "Registration deadline, e.g. '30 Nov 2026'", required = false) String registrationDeadline,
            @ToolParam(description = "Event date or duration, e.g. '15 Dec 2026'", required = false) String eventDate,
            @ToolParam(description = "Team size guidelines, e.g. '2-4 Members'", required = false) String teamSize,
            @ToolParam(description = "Technology domains, themes, or tracks, e.g. 'AI/ML, Web3, Cloud'", required = false) String domains,
            @ToolParam(description = "Registration link URL", required = false) String registrationUrl,
            ToolContext context
    ) {
        if (!AiToolAuthorization.canManageOpportunities(context)) {
            return AiToolAuthorization.accessDenied("create hackathon listings", "ADMIN, DIRECTOR, or TPO");
        }
        Hackathon h = new Hackathon();
        h.setTitle(title != null && !title.isBlank() ? title : "Campus Innovation Hackathon 2026");
        h.setOrganizer(organizer != null && !organizer.isBlank() ? organizer : "TPO Cell");
        h.setDescription("Campus innovation hackathon focused on problem-solving, AI, and software engineering.");
        h.setPrizePool(prizePool != null && !prizePool.isBlank() ? prizePool : "₹1,50,000");
        h.setRegistrationDeadline(registrationDeadline != null && !registrationDeadline.isBlank() ? registrationDeadline : "30 Nov 2026");
        h.setEventDate(eventDate != null && !eventDate.isBlank() ? eventDate : "15 Dec 2026");
        h.setTeamSize(teamSize != null && !teamSize.isBlank() ? teamSize : "2-4 Members");
        h.setDomains(domains != null && !domains.isBlank() ? domains : "AI/ML, Web3, Cloud, Fintech");
        h.setRegistrationUrl(registrationUrl != null && !registrationUrl.isBlank() ? registrationUrl : "https://placeprep.com/hackathons/register");
        h.setPublished(true);
        h.setStatus("Active");
        return opportunityService.createHackathon(h);
    }

    @Tool(description = "Create a new corporate internship listing with companyName, role, stipend, duration, location, workMode, and applicationUrl. Requires ADMIN, DIRECTOR, or TPO role.")
    public Object createInternship(
            @ToolParam(description = "Company offering the internship") String companyName,
            @ToolParam(description = "Role title, e.g. 'Software Engineer Intern'") String role,
            @ToolParam(description = "Stipend amount, e.g. '₹40,000/month'", required = false) String stipend,
            @ToolParam(description = "Duration, e.g. '6 Months' or 'Summer 2026'", required = false) String duration,
            @ToolParam(description = "Location, e.g. 'Bangalore' or 'Remote'", required = false) String location,
            @ToolParam(description = "Work mode: 'REMOTE', 'HYBRID', or 'ON_SITE'", required = false) String workMode,
            @ToolParam(description = "Application link or URL", required = false) String applicationUrl,
            ToolContext context
    ) {
        if (!AiToolAuthorization.canManageOpportunities(context)) {
            return AiToolAuthorization.accessDenied("create internship listings", "ADMIN, DIRECTOR, or TPO");
        }
        Internship in = new Internship();
        in.setCompanyName(companyName != null && !companyName.isBlank() ? companyName : "Partner Company");
        in.setRole(role != null && !role.isBlank() ? role : "Graduate Intern");
        in.setStipend(stipend != null && !stipend.isBlank() ? stipend : "Competitive");
        in.setDuration(duration != null && !duration.isBlank() ? duration : "8-12 Weeks");
        in.setLocation(location != null && !location.isBlank() ? location : "Pan-India");
        in.setWorkMode(workMode != null && !workMode.isBlank() ? workMode : "HYBRID");
        in.setApplicationUrl(applicationUrl != null && !applicationUrl.isBlank() ? applicationUrl : "https://placeprep.com/internships/apply");
        in.setPublished(true);
        return opportunityService.createInternship(in);
    }

    public Object createHackathon(Hackathon hackathon, ToolContext context) {
        if (!AiToolAuthorization.canManageOpportunities(context)) {
            return AiToolAuthorization.accessDenied("create hackathon listings", "ADMIN, DIRECTOR, or TPO");
        }
        return opportunityService.createHackathon(hackathon);
    }

    public Object createInternship(Internship internship, ToolContext context) {
        if (!AiToolAuthorization.canManageOpportunities(context)) {
            return AiToolAuthorization.accessDenied("create internship listings", "ADMIN, DIRECTOR, or TPO");
        }
        return opportunityService.createInternship(internship);
    }
}
