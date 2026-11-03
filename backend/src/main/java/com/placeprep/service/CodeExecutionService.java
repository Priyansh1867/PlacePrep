package com.placeprep.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class CodeExecutionService {

    private static final Logger log = LoggerFactory.getLogger(CodeExecutionService.class);
    private static final int MAX_POLLS = 50;
    private static final long POLL_INTERVAL_MS = 400L;
    private static final String PUBLIC_FALLBACK_URL = "https://ce.judge0.com";

    @Value("${placeprep.judge0.enabled:false}")
    private boolean judge0Enabled;

    @Value("${placeprep.judge0.api-url:https://judge0-ce.p.rapidapi.com}")
    private String judge0ApiUrl;

    @Value("${placeprep.judge0.api-key:}")
    private String judge0ApiKey;

    @Value("${placeprep.judge0.api-host:judge0-ce.p.rapidapi.com}")
    private String judge0ApiHost;

    private final RestTemplate restTemplate;

    private static final Map<String, Integer> LANGUAGE_IDS = Map.ofEntries(
            Map.entry("java", 62),
            Map.entry("python", 71),
            Map.entry("py", 71),
            Map.entry("python3", 71),
            Map.entry("cpp", 54),
            Map.entry("c++", 54),
            Map.entry("c", 50),
            Map.entry("javascript", 63),
            Map.entry("js", 63),
            Map.entry("node", 63),
            Map.entry("nodejs", 63),
            Map.entry("sql", 82),
            Map.entry("sqlite", 82)
    );

    public CodeExecutionService() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(8000);
        requestFactory.setReadTimeout(12000);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public CodeExecutionService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void setJudge0Enabled(boolean judge0Enabled) {
        this.judge0Enabled = judge0Enabled;
    }

    public void setJudge0ApiUrl(String judge0ApiUrl) {
        this.judge0ApiUrl = judge0ApiUrl;
    }

    public void setJudge0ApiKey(String judge0ApiKey) {
        this.judge0ApiKey = judge0ApiKey;
    }

    public void setJudge0ApiHost(String judge0ApiHost) {
        this.judge0ApiHost = judge0ApiHost;
    }

    public Map<String, Object> executeCode(Map<String, Object> payload) {
        if (!judge0Enabled) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Real code execution is not configured. Set PLACEPREP_JUDGE0_ENABLED=true and configure a Judge0 endpoint."
            );
        }

        String language = String.valueOf(payload.getOrDefault("language", "java")).toLowerCase(Locale.ROOT).trim();
        Integer languageId = LANGUAGE_IDS.get(language);
        if (languageId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported language: " + language);
        }

        Object rawCode = payload.get("code");
        String code = rawCode == null ? "" : String.valueOf(rawCode);
        if (code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source code cannot be empty.");
        }

        // Normalize Java code: ensure main class is public class Main
        if ("java".equalsIgnoreCase(language)) {
            code = normalizeJavaCode(code);
        }

        List<Map<String, Object>> testCases = normalizeTestCases(payload.get("testCases"));
        List<Map<String, Object>> results = new ArrayList<>();
        int passedCount = 0;
        boolean hasExpectedOutputChecks = testCases.stream()
                .anyMatch(testCase -> Boolean.TRUE.equals(testCase.get("hasExpectedOutput")));

        String activeEngine = "Judge0 CE";

        for (int i = 0; i < testCases.size(); i++) {
            Map<String, Object> testCase = testCases.get(i);
            String stdin = String.valueOf(testCase.getOrDefault("input", ""));
            String expectedOutput = String.valueOf(testCase.getOrDefault("expectedOutput", ""));
            boolean hasExpectedOutput = Boolean.TRUE.equals(testCase.get("hasExpectedOutput"));
            Map<String, Object> result = executeOne(code, languageId, stdin, expectedOutput, hasExpectedOutput, i);
            results.add(result);
            if (result.containsKey("engine")) {
                activeEngine = String.valueOf(result.get("engine"));
            }
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
                "executionEngine", activeEngine
        );
    }

    private String normalizeJavaCode(String code) {
        if (Pattern.compile("public\\s+class\\s+(?!Main\\b)\\w+").matcher(code).find()) {
            return code.replaceFirst("public\\s+class\\s+\\w+", "public class Main");
        }
        return code;
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
            result.add(Map.of("input", "", "expectedOutput", "", "hasExpectedOutput", false));
        }
        return result;
    }

    private Map<String, Object> executeOne(String code, int languageId, String stdin, String expectedOutput, boolean hasExpectedOutput, int index) {
        try {
            return submitAndPoll(judge0ApiUrl, judge0ApiKey, judge0ApiHost, code, languageId, stdin, expectedOutput, hasExpectedOutput, index, "Judge0 CE");
        } catch (HttpStatusCodeException statusEx) {
            log.warn("Judge0 primary endpoint ({}) returned HTTP {}: {}", judge0ApiUrl, statusEx.getStatusCode(), statusEx.getResponseBodyAsString());

            boolean isUnsubscribed = statusEx.getStatusCode() == HttpStatus.FORBIDDEN &&
                    statusEx.getResponseBodyAsString().toLowerCase(Locale.ROOT).contains("not subscribed");

            if (isUnsubscribed || statusEx.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                log.info("Primary RapidAPI Judge0 returned {}; attempting fallback to public Judge0 CE...", statusEx.getStatusCode());
                try {
                    return submitAndPoll(PUBLIC_FALLBACK_URL, null, null, code, languageId, stdin, expectedOutput, hasExpectedOutput, index, "Judge0 CE (Public Fallback)");
                } catch (Exception fallbackEx) {
                    log.error("Fallback Judge0 execution failed: {}", fallbackEx.getMessage());
                }
            }

            if (statusEx.getStatusCode() == HttpStatus.FORBIDDEN || statusEx.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 RapidAPI authentication failed: " + statusEx.getResponseBodyAsString());
            } else if (statusEx.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Judge0 rate limit exceeded. Please wait a moment and try again.");
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 code runner failed with HTTP " + statusEx.getStatusCode().value());
            }
        } catch (RestClientException e) {
            log.warn("Judge0 primary endpoint connection failed: {}. Attempting fallback...", e.getMessage());
            try {
                return submitAndPoll(PUBLIC_FALLBACK_URL, null, null, code, languageId, stdin, expectedOutput, hasExpectedOutput, index, "Judge0 CE (Public Fallback)");
            } catch (Exception fallbackEx) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not reach configured Judge0 code runner.");
            }
        }
    }

    private Map<String, Object> submitAndPoll(
            String apiUrl,
            String apiKey,
            String apiHost,
            String code,
            int languageId,
            String stdin,
            String expectedOutput,
            boolean hasExpectedOutput,
            int index,
            String engineName
    ) {
        String baseUrl = apiUrl.replaceAll("/+$", "");
        URI submitUri = UriComponentsBuilder.fromUriString(baseUrl)
                .path("/submissions")
                .queryParam("base64_encoded", "true")
                .queryParam("wait", "false")
                .build()
                .toUri();

        Map<String, Object> body = new HashMap<>();
        body.put("source_code", Base64.getEncoder().encodeToString(code.getBytes(StandardCharsets.UTF_8)));
        body.put("language_id", languageId);
        body.put("cpu_time_limit", 3.0);
        if (stdin != null && !stdin.isEmpty()) {
            body.put("stdin", Base64.getEncoder().encodeToString(stdin.getBytes(StandardCharsets.UTF_8)));
        }
        if (hasExpectedOutput && expectedOutput != null && !expectedOutput.isEmpty()) {
            body.put("expected_output", Base64.getEncoder().encodeToString(expectedOutput.getBytes(StandardCharsets.UTF_8)));
        }

        HttpHeaders headers = buildHeaders(apiKey, apiHost);
        ResponseEntity<Map> created = restTemplate.postForEntity(submitUri, new HttpEntity<>(body, headers), Map.class);
        Map<?, ?> createdBody = created.getBody();
        Object tokenValue = createdBody == null ? null : createdBody.get("token");
        if (tokenValue == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 did not return a submission token.");
        }

        String token = String.valueOf(tokenValue);
        URI resultUri = UriComponentsBuilder.fromUriString(baseUrl)
                .path("/submissions/{token}")
                .queryParam("base64_encoded", "true")
                .buildAndExpand(token)
                .toUri();

        for (int poll = 0; poll < MAX_POLLS; poll++) {
            try {
                Thread.sleep(POLL_INTERVAL_MS);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Code execution was interrupted.");
            }

            ResponseEntity<Map> response = restTemplate.exchange(
                    resultUri,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            );
            Map<?, ?> execution = response.getBody();
            if (execution == null) continue;

            Map<?, ?> status = (Map<?, ?>) execution.get("status");
            Object id = status == null ? null : status.get("id");
            if (id instanceof Number statusId && statusId.intValue() > 2) {
                Map<String, Object> res = toResult(execution, expectedOutput, hasExpectedOutput, index);
                res.put("engine", engineName);
                return res;
            }
        }
        throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT, "Timed out waiting for the code runner.");
    }

    private HttpHeaders buildHeaders(String apiKey, String apiHost) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set("X-RapidAPI-Key", apiKey);
            if (apiHost != null && !apiHost.isBlank()) {
                headers.set("X-RapidAPI-Host", apiHost);
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
        String description = (status != null && status.get("description") != null) ? String.valueOf(status.get("description")) : "Unknown";

        String stdout = decodeBase64(response.get("stdout"));
        String stderr = decodeBase64(response.get("stderr"));
        String compileOutput = decodeBase64(response.get("compile_output"));
        String message = decodeBase64(response.get("message"));

        String errDetail = !stderr.isBlank() ? stderr : (!compileOutput.isBlank() ? compileOutput : message);

        Map<String, Object> result = new HashMap<>();
        result.put("testCaseIndex", index);
        result.put("passed", statusId == 3);
        result.put("statusId", statusId);
        result.put("status", description);
        result.put("stdout", stdout);
        result.put("expected", expectedOutput);
        result.put("checkedAgainstExpectedOutput", hasExpectedOutput);
        result.put("stderr", errDetail);
        result.put("compileOutput", compileOutput);
        result.put("time", response.get("time") == null ? "" : response.get("time") + "s");
        result.put("memory", response.get("memory") == null ? "" : response.get("memory") + " KB");
        return result;
    }

    private String decodeBase64(Object val) {
        if (val == null) return "";
        String s = String.valueOf(val).trim();
        if (s.isEmpty()) return "";
        try {
            return new String(Base64.getDecoder().decode(s), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            return s;
        }
    }
}
