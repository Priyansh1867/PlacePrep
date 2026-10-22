package com.placeprep.controller;

import com.placeprep.dto.coding.CodingExecutionRequest;
import com.placeprep.dto.coding.CodingProgressDto;
import com.placeprep.dto.coding.CodingProblemDto;
import com.placeprep.dto.coding.CodingSubmissionDto;
import com.placeprep.dto.coding.CodingSubmissionPageDto;
import com.placeprep.service.CodingResourceNotFoundException;
import com.placeprep.service.CodingStudioService;
import com.placeprep.service.JudgeProviderUnavailableException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coding-studio")
public class CodingStudioController {

    private final CodingStudioService codingStudioService;

    public CodingStudioController(CodingStudioService codingStudioService) {
        this.codingStudioService = codingStudioService;
    }

    @GetMapping("/problems")
    public List<CodingProblemDto> getProblems(HttpServletRequest request) {
        return codingStudioService.getProblems(authenticatedStudentId(request));
    }

    @GetMapping("/problems/{problemId}")
    public CodingProblemDto getProblem(
            @PathVariable String problemId,
            HttpServletRequest request
    ) {
        return codingStudioService.getProblem(authenticatedStudentId(request), problemId);
    }

    @PostMapping("/run")
    public CodingSubmissionDto run(
            @Valid @RequestBody CodingExecutionRequest body,
            HttpServletRequest request
    ) {
        return codingStudioService.run(
                authenticatedStudentId(request), body.getProblemId(), body.getLanguage(), body.getSourceCode());
    }

    @PostMapping("/submit")
    public CodingSubmissionDto submit(
            @Valid @RequestBody CodingExecutionRequest body,
            HttpServletRequest request
    ) {
        return codingStudioService.submit(
                authenticatedStudentId(request), body.getProblemId(), body.getLanguage(), body.getSourceCode());
    }

    @GetMapping("/submissions")
    public CodingSubmissionPageDto getSubmissions(
            @RequestParam(required = false) String problemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request
    ) {
        return codingStudioService.getSubmissions(authenticatedStudentId(request), problemId, page, size);
    }

    @GetMapping("/submissions/{submissionId}")
    public CodingSubmissionDto getSubmission(
            @PathVariable Long submissionId,
            HttpServletRequest request
    ) {
        return codingStudioService.getSubmission(authenticatedStudentId(request), submissionId);
    }

    @GetMapping("/progress")
    public CodingProgressDto getProgress(HttpServletRequest request) {
        return codingStudioService.getProgress(authenticatedStudentId(request));
    }

    private Long authenticatedStudentId(HttpServletRequest request) {
        Object studentId = request.getAttribute("currentUserId");
        if (!(studentId instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A valid student session is required.");
        }
        return id;
    }
}

@RestControllerAdvice(assignableTypes = CodingStudioController.class)
class CodingStudioExceptionHandler {

    @ExceptionHandler(CodingResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(CodingResourceNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", exception.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> invalidRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
    }

    @ExceptionHandler(JudgeProviderUnavailableException.class)
    public ResponseEntity<Map<String, String>> providerUnavailable(JudgeProviderUnavailableException exception) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", exception.getMessage()));
    }
}
