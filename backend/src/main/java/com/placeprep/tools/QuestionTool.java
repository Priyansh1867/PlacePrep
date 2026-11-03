package com.placeprep.tools;

import com.placeprep.service.QuestionService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class QuestionTool {
    private final QuestionService questionService;

    public QuestionTool(QuestionService questionService) {
        this.questionService = questionService;
    }

    @Tool(description = "Find interview questions by optional company and interview round.")
    public Object searchQuestions(
            @ToolParam(description = "Company identifier, or blank for any company") String companyId,
            @ToolParam(description = "Interview round, or blank for any round") String round
    ) {
        if (companyId != null && !companyId.isBlank() && round != null && !round.isBlank()) {
            return questionService.getByCompanyIdAndRound(companyId, round);
        }
        if (companyId != null && !companyId.isBlank()) return questionService.getByCompanyId(companyId);
        if (round != null && !round.isBlank()) return questionService.getByRound(round);
        return questionService.getAll();
    }

    @Tool(description = "Get one interview question by identifier.")
    public Object getQuestion(@ToolParam(description = "Question identifier") String questionId) {
        return questionService.getByQuestionId(questionId);
    }
}
