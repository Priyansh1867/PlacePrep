package com.placeprep.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class CodeExecutionService {

    private static final Logger log = LoggerFactory.getLogger(CodeExecutionService.class);
    private static final int MAX_POLLS = 50;
    private static final long POLL_INTERVAL_MS = 400L;

    @Value("${placeprep.judge0.enabled:false}")
    private boolean judge0Enabled;

    @Value("${placeprep.judge0.api-url:https://judge0-ce.p.rapidapi.com}")
    private String judge0ApiUrl;

    @Value("${placeprep.judge0.api-key:}")
    private String judge0ApiKey;

    @Value("${placeprep.judge0.api-host:judge0-ce.p.rapidapi.com}")
    private String judge0ApiHost;

    private final RestTemplate restTemplate;

    private static final Map<String, Integer> LANGUAGE_IDS = Map.of(
            "java", 62,
            "python", 71,
            "cpp", 54,
            "c", 50,
            "sql", 82,
            "javascript", 63,
            "js", 63
    );

    public CodeExecutionService() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public Map<String, Object> executeCode(Map<String, Object> payload) {
        if (!judge0Enabled) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Real code execution is not configured. Set PLACEPREP_JUDGE0_ENABLED=true and configure a Judge0 endpoint."
            );
        }

        String language = String.valueOf(payload.getOrDefault("language", "java")).toLowerCase(Locale.ROOT);
        Integer languageId = LANGUAGE_IDS.get(language);
        if (languageId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported language: " + language);
        }

        Object rawCode = payload.get("code");
        String code = rawCode == null ? "" : String.valueOf(rawCode);
        if (code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source code cannot be empty.");
        }

        List<Map<String, Object>> testCases = normalizeTestCases(payload.get("testCases"));
        List<Map<String, Object>> results = new ArrayList<>();
        int passedCount = 0;
        boolean hasExpectedOutputChecks = testCases.stream()
                .anyMatch(testCase -> Boolean.TRUE.equals(testCase.get("hasExpectedOutput")));

        for (int i = 0; i < testCases.size(); i++) {
            Map<String, Object> testCase = testCases.get(i);
            String stdin = String.valueOf(testCase.getOrDefault("input", ""));
            String expectedOutput = String.valueOf(testCase.getOrDefault("expectedOutput", ""));
            boolean hasExpectedOutput = Boolean.TRUE.equals(testCase.get("hasExpectedOutput"));
            Map<String, Object> result = executeOne(code, languageId, stdin, expectedOutput, hasExpectedOutput, i);
            results.add(result);
            if (Boolean.TRUE.equals(result.get("passed"))) {
                passedCount++;
            }
        }

        return Map.of(
                "success", true,
                "passed", passedCount == testCases.size(),
                "totalTestCases", testCases.size(),
                "passedTestCases", passedCount,
                "hasExpectedOutputChecks", hasExpectedOutputChecks,
                "results", results,
                "executionEngine", "Judge0 CE"
        );
    }

    private List<Map<String, Object>> normalizeTestCases(Object rawTestCases) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (rawTestCases instanceof List<?> cases) {
            for (Object rawCase : cases) {
                if (rawCase instanceof Map<?, ?> map) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("input", map.containsKey("input") ? map.get("input") : "");
                    item.put("expectedOutput", map.containsKey("expectedOutput") ? map.get("expectedOutput") : "");
                    item.put("hasExpectedOutput", Boolean.TRUE.equals(map.get("hasExpectedOutput")));
                    result.add(item);
                }
            }
        }
        if (result.isEmpty()) {
            result.add(Map.of("input", "", "expectedOutput", ""));
        }
        return result;
    }

    private Map<String, Object> executeOne(String code, int languageId, String stdin, String expectedOutput, boolean hasExpectedOutput, int index) {
        try {
            String baseUrl = judge0ApiUrl.replaceAll("/+$", "");
            URI submitUri = UriComponentsBuilder.fromUriString(baseUrl)
                    .path("/submissions")
                    .queryParam("base64_encoded", "false")
                    .queryParam("wait", "false")
                    .build()
                    .toUri();

            Map<String, Object> body = new HashMap<>();
            body.put("source_code", code);
            body.put("language_id", languageId);
            body.put("stdin", stdin);
            if (hasExpectedOutput) {
                body.put("expected_output", expectedOutput);
            }

            ResponseEntity<Map> created = restTemplate.postForEntity(
                    submitUri,
                    new HttpEntity<>(body, buildHeaders()),
                    Map.class
            );
            Map<?, ?> createdBody = created.getBody();
            Object tokenValue = createdBody == null ? null : createdBody.get("token");
            if (tokenValue == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 did not return a submission token.");
            }

            String token = String.valueOf(tokenValue);
            URI resultUri = UriComponentsBuilder.fromUriString(baseUrl)
                    .path("/submissions/{token}")
                    .queryParam("base64_encoded", "false")
                    .buildAndExpand(token)
                    .toUri();

            Map<?, ?> execution = null;
            for (int poll = 0; poll < MAX_POLLS; poll++) {
                Thread.sleep(POLL_INTERVAL_MS);
                ResponseEntity<Map> response = restTemplate.exchange(
                        resultUri,
                        org.springframework.http.HttpMethod.GET,
                        new HttpEntity<>(buildHeaders()),
                        Map.class
                );
                execution = response.getBody();
                Map<?, ?> status = execution == null ? null : (Map<?, ?>) execution.get("status");
                Object id = status == null ? null : status.get("id");
                if (id instanceof Number statusId && statusId.intValue() > 2) {
                    return toResult(execution, expectedOutput, hasExpectedOutput, index);
                }
            }
            throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "Timed out waiting for the code runner.");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Code execution was interrupted.");
        } catch (RestClientException e) {
            log.warn("Judge0 request failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not reach the configured Judge0 code runner.");
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (judge0ApiKey != null && !judge0ApiKey.isBlank()) {
            headers.set("X-RapidAPI-Key", judge0ApiKey);
            if (judge0ApiHost != null && !judge0ApiHost.isBlank()) {
                headers.set("X-RapidAPI-Host", judge0ApiHost);
            }
        }
        return headers;
    }

    private Map<String, Object> toResult(Map<?, ?> response, String expectedOutput, boolean hasExpectedOutput, int index) {
        if (response == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 returned an empty execution result.");
        }
        Map<?, ?> status = (Map<?, ?>) response.get("status");
        int statusId = status != null && status.get("id") instanceof Number n ? n.intValue() : 0;
        String description = status != null ? String.valueOf(status.containsKey("description") ? status.get("description") : "Unknown") : "Unknown";
        Object stdout = response.get("stdout");
        Object stderr = response.get("stderr");
        Object compileOutput = response.get("compile_output");
        Object message = response.get("message");

        Map<String, Object> result = new HashMap<>();
        result.put("testCaseIndex", index);
        result.put("passed", statusId == 3);
        result.put("status", description);
        result.put("stdout", stdout == null ? "" : stdout);
        result.put("expected", expectedOutput);
        result.put("checkedAgainstExpectedOutput", hasExpectedOutput);
        result.put("stderr", stderr != null ? stderr : (compileOutput != null ? compileOutput : message));
        result.put("time", response.get("time") == null ? "" : response.get("time") + "s");
        result.put("memory", response.get("memory") == null ? "" : response.get("memory") + " KB");
        return result;
    }
}
