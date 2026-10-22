package com.placeprep.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.dto.coding.CodingProgressDto;
import com.placeprep.dto.coding.CodingProblemDto;
import com.placeprep.dto.coding.CodingSubmissionDto;
import com.placeprep.dto.coding.CodingSubmissionPageDto;
import com.placeprep.dto.coding.CodingTestResultDto;
import com.placeprep.model.CodingExample;
import com.placeprep.model.CodingSubmission;
import com.placeprep.model.CodingTestCase;
import com.placeprep.model.InterviewQuestion;
import com.placeprep.repository.CodingSubmissionRepository;
import com.placeprep.repository.InterviewQuestionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CodingStudioService {

    private static final String JAVA_LANGUAGE = "java";

    private final InterviewQuestionRepository questionRepository;
    private final CodingSubmissionRepository submissionRepository;
    private final Judge0Client judge0Client;
    private final ObjectMapper objectMapper;

    @Value("${placeprep.judge0.source-max-bytes:40000}")
    private int maxSourceBytes;

    public CodingStudioService(
            InterviewQuestionRepository questionRepository,
            CodingSubmissionRepository submissionRepository,
            Judge0Client judge0Client,
            ObjectMapper objectMapper
    ) {
        this.questionRepository = questionRepository;
        this.submissionRepository = submissionRepository;
        this.judge0Client = judge0Client;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<CodingProblemDto> getProblems(Long studentId) {
        Set<String> solvedProblemIds = getSolvedProblemIds(studentId);
        return questionRepository.findByCodingStatementIsNotNull().stream()
                .map(question -> toProblemDto(question, solvedProblemIds.contains(question.getQuestionId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CodingProblemDto getProblem(Long studentId, String problemId) {
        InterviewQuestion question = getCodingQuestion(problemId);
        return toProblemDto(question, getSolvedProblemIds(studentId).contains(problemId));
    }

    @Transactional
    public CodingSubmissionDto run(Long studentId, String problemId, String language, String sourceCode) {
        return execute(studentId, problemId, language, sourceCode, false);
    }

    @Transactional
    public CodingSubmissionDto submit(Long studentId, String problemId, String language, String sourceCode) {
        return execute(studentId, problemId, language, sourceCode, true);
    }

    @Transactional(readOnly = true)
    public CodingSubmissionPageDto getSubmissions(Long studentId, String problemId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Page<CodingSubmission> submissions = problemId == null || problemId.isBlank()
                ? submissionRepository.findByStudentIdOrderBySubmittedAtDesc(studentId, PageRequest.of(safePage, safeSize))
                : submissionRepository.findByStudentIdAndProblemIdOrderBySubmittedAtDesc(
                        studentId, problemId, PageRequest.of(safePage, safeSize));

        return new CodingSubmissionPageDto(
                submissions.getContent().stream().map(this::toSubmissionDto).toList(),
                submissions.getNumber(),
                submissions.getSize(),
                submissions.getTotalElements(),
                submissions.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public CodingSubmissionDto getSubmission(Long studentId, Long submissionId) {
        CodingSubmission submission = submissionRepository.findByIdAndStudentId(submissionId, studentId)
                .orElseThrow(() -> new CodingResourceNotFoundException("Submission not found."));
        return toSubmissionDto(submission);
    }

    @Transactional(readOnly = true)
    public CodingProgressDto getProgress(Long studentId) {
        List<CodingSubmission> attempts = submissionRepository.findByStudentIdAndSubmissionType(studentId, "SUBMIT");
        Set<String> solved = attempts.stream()
                .filter(submission -> "ACCEPTED".equals(submission.getVerdict()))
                .map(CodingSubmission::getProblemId)
                .collect(Collectors.toCollection(HashSet::new));
        long accepted = attempts.stream()
                .filter(submission -> "ACCEPTED".equals(submission.getVerdict()))
                .count();
        int accuracy = attempts.isEmpty() ? 0 : (int) Math.round(accepted * 100.0 / attempts.size());
        return new CodingProgressDto(solved.size(), attempts.size(), accepted, accuracy);
    }

    private CodingSubmissionDto execute(
            Long studentId,
            String problemId,
            String language,
            String sourceCode,
            boolean includeHiddenCases
    ) {
        InterviewQuestion problem = getCodingQuestion(problemId);
        validateExecution(language, sourceCode);

        List<CodingTestCase> testCases = new ArrayList<>(problem.getPublicTestCases());
        int publicCaseCount = testCases.size();
        if (includeHiddenCases) {
            testCases.addAll(problem.getHiddenTestCases());
        }
        if (testCases.isEmpty()) {
            throw new IllegalStateException("This problem has no configured test cases.");
        }

        List<CodingTestResultDto> publicResults = new ArrayList<>();
        String finalVerdict = "ACCEPTED";
        long totalExecutionTime = 0;
        long peakMemory = 0;
        boolean hasExecutionTime = false;
        boolean hasMemory = false;

        for (int index = 0; index < testCases.size(); index++) {
            CodingTestCase testCase = testCases.get(index);
            Judge0Client.JudgeResult execution = judge0Client.execute(sourceCode, testCase.getInput());
            String verdict = mapVerdict(execution);
            boolean passed = "ACCEPTED".equals(verdict)
                    && normalizeOutput(testCase.getExpectedOutput()).equals(normalizeOutput(execution.stdout()));

            if ("ACCEPTED".equals(verdict) && !passed) {
                verdict = "WRONG_ANSWER";
            }
            if (!"ACCEPTED".equals(verdict)) {
                finalVerdict = preferVerdict(finalVerdict, verdict);
            }
            if (execution.executionTimeMs() != null) {
                totalExecutionTime += execution.executionTimeMs();
                hasExecutionTime = true;
            }
            if (execution.memoryKb() != null) {
                peakMemory = Math.max(peakMemory, execution.memoryKb());
                hasMemory = true;
            }

            if (index < publicCaseCount) {
                String output = execution.stdout();
                if (output == null || output.isBlank()) {
                    output = execution.compileOutput() != null ? execution.compileOutput() : execution.stderr();
                }
                publicResults.add(new CodingTestResultDto(
                        index + 1,
                        false,
                        passed,
                        verdict,
                        testCase.getInput(),
                        testCase.getExpectedOutput(),
                        output,
                        execution.executionTimeMs(),
                        execution.memoryKb()
                ));
            }

            if ("COMPILATION_ERROR".equals(verdict)) {
                finalVerdict = verdict;
                break;
            }
        }

        CodingSubmission submission = new CodingSubmission();
        submission.setStudentId(studentId);
        submission.setProblemId(problemId);
        submission.setLanguage(JAVA_LANGUAGE);
        submission.setSourceCode(sourceCode);
        submission.setVerdict(finalVerdict);
        submission.setSubmissionType(includeHiddenCases ? "SUBMIT" : "RUN");
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setExecutionTimeMs(hasExecutionTime ? totalExecutionTime : null);
        submission.setMemoryKb(hasMemory ? peakMemory : null);
        submission.setTestResults(writeTestResults(publicResults));

        return toSubmissionDto(submissionRepository.save(submission));
    }

    private void validateExecution(String language, String sourceCode) {
        if (language == null || !JAVA_LANGUAGE.equals(language.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Only Java is currently enabled for code execution.");
        }
        if (sourceCode == null || sourceCode.isBlank()) {
            throw new IllegalArgumentException("Source code is required.");
        }
        if (sourceCode.getBytes(StandardCharsets.UTF_8).length > maxSourceBytes) {
            throw new IllegalArgumentException("Source code exceeds the configured size limit.");
        }
    }

    private InterviewQuestion getCodingQuestion(String questionId) {
        InterviewQuestion question = questionRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new CodingResourceNotFoundException("Problem not found."));
        if (question.getCodingStatement() == null || question.getCodingStatement().isBlank()) {
            throw new CodingResourceNotFoundException("Problem not found.");
        }
        return question;
    }

    private Set<String> getSolvedProblemIds(Long studentId) {
        return submissionRepository.findByStudentIdAndSubmissionType(studentId, "SUBMIT").stream()
                .filter(submission -> "ACCEPTED".equals(submission.getVerdict()))
                .map(CodingSubmission::getProblemId)
                .collect(Collectors.toSet());
    }

    private CodingProblemDto toProblemDto(InterviewQuestion question, boolean solved) {
        List<CodingProblemDto.Example> examples = question.getCodingExamples().stream()
                .map(example -> new CodingProblemDto.Example(
                        example.getInput(), example.getOutput(), example.getExplanation()))
                .toList();
        return new CodingProblemDto(
                question.getQuestionId(),
                titleFor(question),
                question.getCategory(),
                question.getDifficulty(),
                question.getCodingStatement(),
                question.getInputFormat(),
                question.getOutputFormat(),
                question.getCodingConstraints(),
                examples,
                question.getStarterCodeJava(),
                solved
        );
    }

    private String titleFor(InterviewQuestion question) {
        return switch (question.getQuestionId()) {
            case "hcl-tech-02" -> "Detect a Cycle in a Linked List";
            case "tcs-tech-01" -> "Reverse the Words in a Sentence";
            case "infy-tech-01" -> "Longest Substring Without Repeating Characters";
            default -> question.getQuestion();
        };
    }

    private String mapVerdict(Judge0Client.JudgeResult result) {
        return switch (result.statusId()) {
            case 3 -> "ACCEPTED";
            case 4 -> "WRONG_ANSWER";
            case 5 -> "TIME_LIMIT_EXCEEDED";
            case 6 -> "COMPILATION_ERROR";
            case 7, 8, 9, 10, 11, 12, 14 -> "RUNTIME_ERROR";
            default -> throw new JudgeProviderUnavailableException("The code execution provider returned an unsupported status.");
        };
    }

    private String preferVerdict(String current, String next) {
        if ("COMPILATION_ERROR".equals(next) || "TIME_LIMIT_EXCEEDED".equals(next)) {
            return next;
        }
        if ("RUNTIME_ERROR".equals(next) && !"TIME_LIMIT_EXCEEDED".equals(current)) {
            return next;
        }
        if ("WRONG_ANSWER".equals(next) && "ACCEPTED".equals(current)) {
            return next;
        }
        return current;
    }

    private String normalizeOutput(String output) {
        return output == null ? "" : output.replace("\r\n", "\n").strip();
    }

    private String writeTestResults(List<CodingTestResultDto> results) {
        try {
            return objectMapper.writeValueAsString(results);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to store coding test results.", exception);
        }
    }

    private CodingSubmissionDto toSubmissionDto(CodingSubmission submission) {
        try {
            List<CodingTestResultDto> results = submission.getTestResults() == null
                    ? List.of()
                    : objectMapper.readValue(
                            submission.getTestResults(),
                            new TypeReference<>() {
                            });
            return new CodingSubmissionDto(
                    submission.getId(),
                    submission.getProblemId(),
                    submission.getLanguage(),
                    submission.getSourceCode(),
                    submission.getVerdict(),
                    submission.getSubmissionType(),
                    submission.getSubmittedAt(),
                    submission.getExecutionTimeMs(),
                    submission.getMemoryKb(),
                    results
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to read saved coding test results.", exception);
        }
    }
}
