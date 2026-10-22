package com.placeprep;

import com.placeprep.service.Judge0Client;
import com.placeprep.service.JudgeProviderUnavailableException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class Judge0ClientTest {

    @Test
    void missingBaseUrlThrowsJudgeProviderUnavailableException() {
        RestClient.Builder builder = RestClient.builder();
        Judge0Client client = new Judge0Client(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "");

        JudgeProviderUnavailableException ex = assertThrows(
                JudgeProviderUnavailableException.class,
                () -> client.execute("public class Main {}", "1 2")
        );
        assertTrue(ex.getMessage().contains("JUDGE0_BASE_URL"));
    }

    @Test
    void insecureRemoteUrlThrowsJudgeProviderUnavailableException() {
        RestClient.Builder builder = RestClient.builder();
        Judge0Client client = new Judge0Client(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "http://api.judge0.com");

        JudgeProviderUnavailableException ex = assertThrows(
                JudgeProviderUnavailableException.class,
                () -> client.execute("public class Main {}", "1 2")
        );
        assertTrue(ex.getMessage().contains("must use HTTPS"));
    }

    @Test
    void localProviderWithApiKeyIsRejected() {
        RestClient.Builder builder = RestClient.builder();
        Judge0Client client = new Judge0Client(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "http://localhost:2358");
        ReflectionTestUtils.setField(client, "apiKey", "secret-key");

        JudgeProviderUnavailableException ex = assertThrows(
                JudgeProviderUnavailableException.class,
                () -> client.execute("public class Main {}", "1 2")
        );
        assertTrue(ex.getMessage().contains("must use HTTPS"));
    }

    @Test
    void successfulExecutionParsesAcceptedResponse() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        Judge0Client client = new Judge0Client(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "http://localhost:2358");
        ReflectionTestUtils.setField(client, "queueTimeoutMs", 5000L);

        server.expect(requestTo("http://localhost:2358/submissions?base64_encoded=false&wait=false"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("""
                        {"token": "test-token-123"}
                        """, MediaType.APPLICATION_JSON));

        server.expect(requestTo("http://localhost:2358/submissions/test-token-123?base64_encoded=false"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("""
                        {
                            "status": {"id": 3, "description": "Accepted"},
                            "stdout": "42\\n",
                            "stderr": null,
                            "compile_output": null,
                            "time": "0.015",
                            "memory": "1024"
                        }
                        """, MediaType.APPLICATION_JSON));

        Judge0Client.JudgeResult result = client.execute("public class Main {}", "1 2");

        assertNotNull(result);
        assertEquals(3, result.statusId());
        assertEquals("Accepted", result.status());
        assertEquals("42\n", result.stdout());
        assertEquals(15L, result.executionTimeMs());
        assertEquals(1024L, result.memoryKb());
        server.verify();
    }

    @Test
    void internalProviderErrorStatus13ThrowsUnavailableException() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        Judge0Client client = new Judge0Client(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "http://localhost:2358");
        ReflectionTestUtils.setField(client, "queueTimeoutMs", 5000L);

        server.expect(requestTo("http://localhost:2358/submissions?base64_encoded=false&wait=false"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("""
                        {"token": "test-token-456"}
                        """, MediaType.APPLICATION_JSON));

        server.expect(requestTo("http://localhost:2358/submissions/test-token-456?base64_encoded=false"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("""
                        {
                            "status": {"id": 13, "description": "Internal Error"}
                        }
                        """, MediaType.APPLICATION_JSON));

        JudgeProviderUnavailableException ex = assertThrows(
                JudgeProviderUnavailableException.class,
                () -> client.execute("public class Main {}", "1 2")
        );
        assertTrue(ex.getMessage().contains("could not evaluate"));
        server.verify();
    }

    @Test
    void providerReturnsNoTokenThrowsUnavailableException() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        Judge0Client client = new Judge0Client(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "http://localhost:2358");

        server.expect(requestTo("http://localhost:2358/submissions?base64_encoded=false&wait=false"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        JudgeProviderUnavailableException ex = assertThrows(
                JudgeProviderUnavailableException.class,
                () -> client.execute("public class Main {}", "1 2")
        );
        assertTrue(ex.getMessage().contains("returned no job token"));
        server.verify();
    }

    @Test
    void providerReturnsServerErrorThrowsUnavailableException() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        Judge0Client client = new Judge0Client(builder);
        ReflectionTestUtils.setField(client, "baseUrl", "http://localhost:2358");

        server.expect(requestTo("http://localhost:2358/submissions?base64_encoded=false&wait=false"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        JudgeProviderUnavailableException ex = assertThrows(
                JudgeProviderUnavailableException.class,
                () -> client.execute("public class Main {}", "1 2")
        );
        assertTrue(ex.getMessage().contains("unavailable"));
        server.verify();
    }
}
