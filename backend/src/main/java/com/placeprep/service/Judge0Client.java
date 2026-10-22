package com.placeprep.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Component
public class Judge0Client {

    private final RestClient restClient;

    @Value("${placeprep.judge0.base-url:}")
    private String baseUrl;

    @Value("${placeprep.judge0.api-key:}")
    private String apiKey;

    @Value("${placeprep.judge0.api-key-header:X-Auth-Token}")
    private String apiKeyHeader;

    @Value("${placeprep.judge0.api-host:}")
    private String apiHost;

    @Value("${placeprep.judge0.language-java-id:62}")
    private int javaLanguageId;

    @Value("${placeprep.judge0.cpu-time-limit:2.0}")
    private double cpuTimeLimit;

    @Value("${placeprep.judge0.wall-time-limit:5.0}")
    private double wallTimeLimit;

    @Value("${placeprep.judge0.memory-limit-kb:128000}")
    private int memoryLimitKb;

    @Value("${placeprep.judge0.queue-timeout-ms:12000}")
    private long queueTimeoutMs;

    public Judge0Client(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public JudgeResult execute(String sourceCode, String input) {
        String providerBaseUrl = validatedBaseUrl();

        try {
            Map<String, Object> submission = new HashMap<>();
            submission.put("language_id", javaLanguageId);
            submission.put("source_code", sourceCode);
            submission.put("stdin", input);
            submission.put("cpu_time_limit", cpuTimeLimit);
            submission.put("wall_time_limit", wallTimeLimit);
            submission.put("memory_limit", memoryLimitKb);

            Map<?, ?> created = restClient.post()
                    .uri(URI.create(providerBaseUrl + "/submissions?base64_encoded=false&wait=false"))
                    .headers(headers -> addProviderHeaders(headers))
                    .body(submission)
                    .retrieve()
                    .body(Map.class);

            String token = created == null ? null : stringValue(created.get("token"));
            if (token == null || token.isBlank()) {
                throw new JudgeProviderUnavailableException("The code execution provider returned no job token.");
            }

            long deadline = System.nanoTime() + queueTimeoutMs * 1_000_000L;
            while (System.nanoTime() < deadline) {
                Map<?, ?> result = restClient.get()
                        .uri(URI.create(providerBaseUrl + "/submissions/" + token + "?base64_encoded=false"))
                        .headers(headers -> addProviderHeaders(headers))
                        .retrieve()
                        .body(Map.class);
                JudgeResult parsed = parseResult(result);
                if (parsed.statusId() > 2) {
                    if (parsed.statusId() == 13) {
                        throw new JudgeProviderUnavailableException("The code execution provider could not evaluate this run.");
                    }
                    return parsed;
                }
                Thread.sleep(250);
            }
            throw new JudgeProviderUnavailableException("The code execution provider did not finish processing in time.");
        } catch (RestClientException exception) {
            throw new JudgeProviderUnavailableException("The code execution provider is unavailable.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new JudgeProviderUnavailableException("The code execution request was interrupted.", exception);
        }
    }

    private String validatedBaseUrl() {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new JudgeProviderUnavailableException("Code execution is not configured. Set JUDGE0_BASE_URL.");
        }
        String normalized = baseUrl.trim().replaceAll("/+$", "");
        URI uri;
        try {
            uri = URI.create(normalized);
        } catch (IllegalArgumentException exception) {
            throw new JudgeProviderUnavailableException("JUDGE0_BASE_URL is not a valid HTTP(S) URL.", exception);
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();
        boolean localDevelopmentHost = "localhost".equalsIgnoreCase(host)
                || "127.0.0.1".equals(host)
                || "[::1]".equals(host);
        boolean secure = "https".equalsIgnoreCase(scheme);
        boolean localHttpWithoutCredentials = "http".equalsIgnoreCase(scheme)
                && localDevelopmentHost
                && (apiKey == null || apiKey.isBlank());
        if (host == null || uri.getRawQuery() != null || uri.getRawFragment() != null
                || (!secure && !localHttpWithoutCredentials)) {
            throw new JudgeProviderUnavailableException(
                    "JUDGE0_BASE_URL must use HTTPS; HTTP is allowed only for a local provider without an API key.");
        }
        return normalized;
    }

    private void addProviderHeaders(org.springframework.http.HttpHeaders headers) {
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set(apiKeyHeader, apiKey);
        }
        if (apiHost != null && !apiHost.isBlank()) {
            headers.set("X-RapidAPI-Host", apiHost);
        }
    }

    private JudgeResult parseResult(Map<?, ?> response) {
        if (response == null) {
            throw new JudgeProviderUnavailableException("The code execution provider returned an empty result.");
        }
        Object statusValue = response.get("status");
        Map<?, ?> status = statusValue instanceof Map<?, ?> map ? map : Map.of();
        int statusId = integerValue(status.get("id"));
        return new JudgeResult(
                statusId,
                stringValue(status.get("description")),
                stringValue(response.get("stdout")),
                stringValue(response.get("stderr")),
                stringValue(response.get("compile_output")),
                millisecondsValue(response.get("time")),
                longValue(response.get("memory"))
        );
    }

    private static String stringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private static int integerValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(stringValue(value));
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private static Long longValue(Object value) {
        if (value instanceof Number number) {
            return Math.round(number.doubleValue());
        }
        try {
            return value == null ? null : Math.round(Double.parseDouble(value.toString()));
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private static Long millisecondsValue(Object value) {
        if (value == null) {
            return null;
        }
        try {
            double seconds = Double.parseDouble(value.toString());
            return Math.round(seconds * 1000);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    public record JudgeResult(
            int statusId,
            String status,
            String stdout,
            String stderr,
            String compileOutput,
            Long executionTimeMs,
            Long memoryKb
    ) {
    }
}
