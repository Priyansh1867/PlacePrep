package com.placeprep;

import com.placeprep.service.CodeExecutionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class CodeExecutionServiceTest {

    private CodeExecutionService service;

    @BeforeEach
    void setUp() {
        service = new CodeExecutionService();
        service.setJudge0Enabled(true);
        service.setJudge0ApiUrl("https://ce.judge0.com");
    }

    @Test
    void testExecuteCodeDisabledThrowsServiceUnavailable() {
        service.setJudge0Enabled(false);
        Map<String, Object> payload = Map.of(
                "language", "python",
                "code", "print('hello')"
        );
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.executeCode(payload));
        assertEquals(503, ex.getStatusCode().value());
    }

    @Test
    void testUnsupportedLanguageThrowsBadRequest() {
        Map<String, Object> payload = Map.of(
                "language", "ruby_unsupported",
                "code", "puts 'hello'"
        );
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.executeCode(payload));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void testEmptyCodeThrowsBadRequest() {
        Map<String, Object> payload = Map.of(
                "language", "python",
                "code", "   "
        );
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.executeCode(payload));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void testLivePythonExecution() {
        Map<String, Object> payload = Map.of(
                "language", "python",
                "code", "print('Hello PlacePrep Python')",
                "testCases", List.of(Map.of("hasExpectedOutput", false))
        );
        Map<String, Object> res = service.executeCode(payload);
        assertNotNull(res);
        assertTrue((Boolean) res.get("success"));
        assertTrue((Boolean) res.get("passed"));

        List<?> results = (List<?>) res.get("results");
        assertFalse(results.isEmpty());
        Map<?, ?> r1 = (Map<?, ?>) results.get(0);
        assertTrue(String.valueOf(r1.get("stdout")).contains("Hello PlacePrep Python"));
    }

    @Test
    void testLiveJavaExecutionWithClassNormalization() {
        String javaCode = """
                public class Solution {
                    public static void main(String[] args) {
                        System.out.println("PlacePrep Java Working");
                    }
                }
                """;
        Map<String, Object> payload = Map.of(
                "language", "java",
                "code", javaCode,
                "testCases", List.of(Map.of("hasExpectedOutput", false))
        );
        Map<String, Object> res = service.executeCode(payload);
        assertNotNull(res);
        assertTrue((Boolean) res.get("passed"));
        List<?> results = (List<?>) res.get("results");
        Map<?, ?> r1 = (Map<?, ?>) results.get(0);
        assertTrue(String.valueOf(r1.get("stdout")).contains("PlacePrep Java Working"));
    }

    @Test
    void testLiveCppExecution() {
        String cppCode = """
                #include <iostream>
                using namespace std;
                int main() {
                    cout << "PlacePrep C++ Working" << endl;
                    return 0;
                }
                """;
        Map<String, Object> payload = Map.of(
                "language", "cpp",
                "code", cppCode,
                "testCases", List.of(Map.of("hasExpectedOutput", false))
        );
        Map<String, Object> res = service.executeCode(payload);
        assertNotNull(res);
        assertTrue((Boolean) res.get("passed"));
        List<?> results = (List<?>) res.get("results");
        Map<?, ?> r1 = (Map<?, ?>) results.get(0);
        assertTrue(String.valueOf(r1.get("stdout")).contains("PlacePrep C++ Working"));
    }

    @Test
    void testLiveJavaScriptExecution() {
        String jsCode = "console.log('PlacePrep JS Working');";
        Map<String, Object> payload = Map.of(
                "language", "javascript",
                "code", jsCode,
                "testCases", List.of(Map.of("hasExpectedOutput", false))
        );
        Map<String, Object> res = service.executeCode(payload);
        assertNotNull(res);
        assertTrue((Boolean) res.get("passed"));
        List<?> results = (List<?>) res.get("results");
        Map<?, ?> r1 = (Map<?, ?>) results.get(0);
        assertTrue(String.valueOf(r1.get("stdout")).contains("PlacePrep JS Working"));
    }

    @Test
    void testLiveCompilationErrorHandling() {
        String badCpp = "int main() { missing_func(); }";
        Map<String, Object> payload = Map.of(
                "language", "cpp",
                "code", badCpp,
                "testCases", List.of(Map.of("hasExpectedOutput", false))
        );
        Map<String, Object> res = service.executeCode(payload);
        assertNotNull(res);
        assertFalse((Boolean) res.get("passed"));
        List<?> results = (List<?>) res.get("results");
        Map<?, ?> r1 = (Map<?, ?>) results.get(0);
        assertFalse((Boolean) r1.get("passed"));
        assertTrue(String.valueOf(r1.get("status")).contains("Compilation Error"));
    }

    @Test
    void testLiveTimeoutHandling() {
        String loopCode = "while True: pass";
        Map<String, Object> payload = Map.of(
                "language", "python",
                "code", loopCode,
                "testCases", List.of(Map.of("hasExpectedOutput", false))
        );
        Map<String, Object> res = service.executeCode(payload);
        assertNotNull(res);
        assertFalse((Boolean) res.get("passed"));
        List<?> results = (List<?>) res.get("results");
        Map<?, ?> r1 = (Map<?, ?>) results.get(0);
        assertFalse((Boolean) r1.get("passed"));
        assertTrue(String.valueOf(r1.get("status")).contains("Time Limit Exceeded"));
    }

    @Test
    void testRapidApiConfigurationWithFallback() {
        service.setJudge0ApiUrl("https://judge0-ce.p.rapidapi.com");
        service.setJudge0ApiKey("954935e55cmsh474bf15c32e3a6cp18d34bjsn9949f43625ed");
        service.setJudge0ApiHost("judge0-ce.p.rapidapi.com");

        Map<String, Object> payload = Map.of(
                "language", "python",
                "code", "print('RapidAPI Test with Fallback')",
                "testCases", List.of(Map.of("hasExpectedOutput", false))
        );
        Map<String, Object> res = service.executeCode(payload);
        assertNotNull(res);
        assertTrue((Boolean) res.get("passed"));
        List<?> results = (List<?>) res.get("results");
        Map<?, ?> r1 = (Map<?, ?>) results.get(0);
        assertTrue(String.valueOf(r1.get("stdout")).contains("RapidAPI Test with Fallback"));
    }
}
