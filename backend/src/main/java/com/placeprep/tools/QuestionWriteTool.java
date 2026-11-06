package com.placeprep.tools;

import com.placeprep.model.InterviewQuestion;
import com.placeprep.service.QuestionService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
public class QuestionWriteTool {
    private final QuestionService questionService;

    public QuestionWriteTool(QuestionService questionService) {
        this.questionService = questionService;
    }

    @Tool(description = "Create an interview practice question. Requires Faculty, TPO, or Administrator permission.")
    public Object createQuestion(
            @ToolParam(description = "Question problem statement or text") String question,
            @ToolParam(description = "Category, e.g. 'DSA', 'System Design', 'DBMS', 'HR'") String category,
            @ToolParam(description = "Difficulty: 'Easy', 'Medium', or 'Hard'") String difficulty,
            @ToolParam(description = "Associated company identifier, e.g. 'google', 'amazon'", required = false) String companyId,
            @ToolParam(description = "Interview round, e.g. 'Technical Round 1', 'Online Assessment'", required = false) String round,
            @ToolParam(description = "Intuition or approach explanation", required = false) String approach,
            @ToolParam(description = "Sample code or solution", required = false) String sampleCode,
            ToolContext context
    ) {
        if (!AiToolAuthorization.canManageQuestions(context)) {
            return AiToolAuthorization.accessDenied("create interview practice questions", "Faculty, TPO, or Administrator");
        }
        InterviewQuestion q = new InterviewQuestion();
        q.setQuestion(question);
        q.setCategory(category != null && !category.isBlank() ? category : "DSA");
        q.setDifficulty(difficulty != null && !difficulty.isBlank() ? difficulty : "Medium");
        q.setCompanyId(companyId != null && !companyId.isBlank() ? companyId.toLowerCase() : "general");
        q.setRound(round != null && !round.isBlank() ? round : "Technical");
        q.setApproach(approach);
        q.setSampleCode(sampleCode);
        return EntityResponseMapper.toJsonSafe(questionService.create(q));
    }

    public Object createQuestion(InterviewQuestion question, ToolContext context) {
        if (!AiToolAuthorization.canManageQuestions(context)) {
            return AiToolAuthorization.accessDenied("create interview practice questions", "Faculty, TPO, or Administrator");
        }
        return EntityResponseMapper.toJsonSafe(questionService.create(question));
    }
}
