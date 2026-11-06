package com.placeprep.tools;

import com.placeprep.model.MockSession;
import com.placeprep.service.MockSessionService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class MockSessionWriteTool {
    private final MockSessionService mockSessionService;

    public MockSessionWriteTool(MockSessionService mockSessionService) {
        this.mockSessionService = mockSessionService;
    }

    @Tool(description = "Record or save a practice mock interview session for the authenticated student.")
    public Object createMockSession(
            @ToolParam(description = "Target company or domain, e.g. 'Google', 'Amazon', 'General'", required = false) String companyName,
            @ToolParam(description = "Interview round, e.g. 'Technical DSA', 'HR Behavioral', 'System Design'", required = false) String round,
            @ToolParam(description = "Score achieved out of 100", required = false) Integer score,
            @ToolParam(description = "Performance feedback notes and evaluation summary", required = false) String feedbackSummary,
            @ToolParam(description = "Number of practice questions answered", required = false) Integer questionsAnswered,
            ToolContext context
    ) {
        MockSession session = new MockSession();
        session.setUserId(AiToolAuthorization.userId(context));
        session.setCompanyName(companyName != null && !companyName.isBlank() ? companyName : "General Tech");
        session.setCompanyId(companyName != null ? companyName.toLowerCase().replaceAll("[^a-z0-9]", "-") : "general");
        session.setRound(round != null && !round.isBlank() ? round : "Technical");
        session.setScore(score != null ? score : 85);
        session.setCorrectness(score != null ? score : 85);
        session.setClarity(score != null ? score : 85);
        session.setStructure(score != null ? score : 85);
        session.setQuestionsAnswered(questionsAnswered != null ? questionsAnswered : 3);
        session.setFeedbackSummary(feedbackSummary != null && !feedbackSummary.isBlank() ? feedbackSummary : "Strong performance with solid technical understanding.");
        session.setDate(LocalDate.now().toString());
        return EntityResponseMapper.toJsonSafe(mockSessionService.save(session));
    }

    public Object createMockSession(MockSession session, ToolContext context) {
        session.setUserId(AiToolAuthorization.userId(context));
        return EntityResponseMapper.toJsonSafe(mockSessionService.save(session));
    }
}
