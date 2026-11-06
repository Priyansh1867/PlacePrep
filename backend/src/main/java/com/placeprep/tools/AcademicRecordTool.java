package com.placeprep.tools;

import com.placeprep.model.StudentAcademicRecord;
import com.placeprep.model.User;
import com.placeprep.repository.StudentAcademicRecordRepository;
import com.placeprep.repository.UserRepository;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class AcademicRecordTool {

    private final StudentAcademicRecordRepository academicRecordRepository;
    private final UserRepository userRepository;

    public AcademicRecordTool(
            StudentAcademicRecordRepository academicRecordRepository,
            UserRepository userRepository
    ) {
        this.academicRecordRepository = academicRecordRepository;
        this.userRepository = userRepository;
    }

    @Tool(description = "Get the authenticated student's verified academic records, including CGPA, active backlogs, 10th and 12th percentages, graduation batch, branch, and semester SGPA marks.")
    public Object getMyAcademicRecord(ToolContext context) {
        String email = String.valueOf(context.getContext().get("userEmail"));
        Object userIdObj = context.getContext().get("userId");
        Long userId = null;
        if (userIdObj instanceof Number num) {
            userId = num.longValue();
        } else if (userIdObj instanceof String str && str.matches("\\d+")) {
            userId = Long.parseLong(str);
        }

        Optional<StudentAcademicRecord> recordOpt = Optional.empty();
        if (email != null && !email.isBlank()) {
            recordOpt = academicRecordRepository.findByEmail(email.trim());
        }
        if (recordOpt.isEmpty() && userId != null) {
            recordOpt = academicRecordRepository.findByStudentId(String.valueOf(userId));
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        } else if (email != null && !email.isBlank()) {
            user = userRepository.findByEmail(email.trim()).orElse(null);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        if (recordOpt.isPresent()) {
            StudentAcademicRecord record = recordOpt.get();
            result.put("name", record.getName() != null ? record.getName() : (user != null ? user.getName() : ""));
            result.put("email", record.getEmail());
            result.put("branch", record.getBranch() != null ? record.getBranch() : (user != null ? user.getBranch() : ""));
            result.put("graduationBatch", record.getGraduationBatch() != null ? record.getGraduationBatch() : (user != null ? user.getGraduationBatch() : ""));
            result.put("cgpa", record.getCgpa());
            result.put("activeBacklogs", record.getActiveBacklogs() != null ? record.getActiveBacklogs() : 0);
            result.put("tenthPercentage", record.getTenthPercentage());
            result.put("twelfthPercentage", record.getTwelfthPercentage());
            result.put("diplomaPercentage", record.getDiplomaPercentage());
            result.put("sem1Sgpa", record.getSem1Sgpa());
            result.put("sem2Sgpa", record.getSem2Sgpa());
            result.put("sem3Sgpa", record.getSem3Sgpa());
            result.put("sem4Sgpa", record.getSem4Sgpa());
            result.put("sem5Sgpa", record.getSem5Sgpa());
            result.put("sem6Sgpa", record.getSem6Sgpa());
            result.put("sem7Sgpa", record.getSem7Sgpa());
            result.put("sem8Sgpa", record.getSem8Sgpa());
            result.put("verified", record.isVerified());
        } else if (user != null) {
            result.put("name", user.getName());
            result.put("email", user.getEmail());
            result.put("branch", user.getBranch());
            result.put("graduationBatch", user.getGraduationBatch());
            result.put("rollNumber", user.getRollNumber());
            result.put("college", user.getCollege());
            result.put("status", "Basic profile exists; detailed semester grade transcript is pending ingestion.");
        } else {
            result.put("status", "No academic record found for user.");
        }
        return result;
    }
}
