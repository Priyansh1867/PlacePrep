package com.placeprep.tools;

import com.placeprep.model.InterviewQuestion;
import com.placeprep.service.QuestionService;
import com.placeprep.mapper.EntityResponseMapper;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class QuestionWriteTool {
    private final QuestionService questionService;

    public QuestionWriteTool(QuestionService questionService) {
        this.questionService = questionService;
    }

    @Tool(description = "Create an interview question. Requires ADMIN permission.")
    public Object createQuestion(InterviewQuestion question, ToolContext context) {
        AiToolAuthorization.requireAdmin(context);
        return EntityResponseMapper.toJsonSafe(questionService.create(question));
    }
}
