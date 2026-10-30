package com.placeprep;

import com.placeprep.tools.*;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiToolContractTest {
    private static final List<Class<?>> TOOL_CLASSES = List.of(
            CompanyTool.class, CompanyWriteTool.class,
            DriveTool.class, DriveWriteTool.class,
            QuestionTool.class, QuestionWriteTool.class,
            ExperienceTool.class, ExperienceWriteTool.class,
            InsightsTool.class, OpportunityTool.class,
            OpportunityWriteTool.class, ResumeAtsTool.class,
            UserTool.class, UserWriteTool.class,
            StudentApplicationTool.class, StaffApplicationTool.class,
            ApplicationWriteTool.class, StudentAttendanceTool.class,
            StaffAttendanceTool.class, AttendanceWriteTool.class,
            StudentEligibilityTool.class, StudentMockSessionTool.class,
            MockSessionWriteTool.class, StaffFeedbackTool.class,
            FeedbackWriteTool.class, NotificationWriteTool.class,
            SelectionWriteTool.class, CandidateWriteTool.class
    );

    @Test
    void everyAiToolIsAComponentWithAtLeastOneToolMethod() {
        assertEquals(28, TOOL_CLASSES.size());

        for (Class<?> toolClass : TOOL_CLASSES) {
            assertNotNull(toolClass.getAnnotation(Component.class), toolClass.getSimpleName());
            assertTrue(List.of(toolClass.getDeclaredMethods()).stream()
                            .anyMatch(method -> method.isAnnotationPresent(Tool.class)),
                    toolClass.getSimpleName());
        }
    }

    @Test
    void everyToolMethodHasADescription() {
        for (Class<?> toolClass : TOOL_CLASSES) {
            for (Method method : toolClass.getDeclaredMethods()) {
                Tool tool = method.getAnnotation(Tool.class);
                if (tool != null) {
                    assertFalse(tool.description().isBlank(), toolClass.getSimpleName() + "." + method.getName());
                }
            }
        }
    }
}
