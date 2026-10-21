package com.placeprep;

import com.placeprep.model.MockSession;
import com.placeprep.repository.MockSessionRepository;
import com.placeprep.service.MockSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class MockSessionServiceTest {

    private MockSessionRepository mockSessionRepository;
    private MockSessionService mockSessionService;

    @BeforeEach
    void setUp() {
        mockSessionRepository = mock(MockSessionRepository.class);
        mockSessionService = new MockSessionService(mockSessionRepository);
    }

    @Test
    void testSaveGeneratesSessionIdWhenMissing() {
        MockSession session = new MockSession();
        session.setUserId("2");
        session.setCompanyId("hcltech");
        session.setCompanyName("HCLTech");
        session.setRound("Technical Interview");
        session.setScore(85);
        session.setCorrectness(80);
        session.setClarity(90);
        session.setStructure(85);
        session.setQuestionsAnswered(3);
        session.setFeedbackSummary("Strong overall performance");

        when(mockSessionRepository.save(any(MockSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MockSession saved = mockSessionService.save(session);

        assertNotNull(saved.getSessionId());
        assertTrue(saved.getSessionId().startsWith("MS-"));
        assertEquals("2", saved.getUserId());
        assertEquals(85, saved.getScore());
        verify(mockSessionRepository, times(1)).save(session);
    }

    @Test
    void testSavePreservesExistingSessionId() {
        MockSession session = new MockSession();
        session.setSessionId("CUSTOM-SESSION-123");
        session.setUserId("2");
        session.setScore(90);

        when(mockSessionRepository.save(any(MockSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MockSession saved = mockSessionService.save(session);

        assertEquals("CUSTOM-SESSION-123", saved.getSessionId());
        verify(mockSessionRepository, times(1)).save(session);
    }

    @Test
    void testGetByUserIdReturnsFilteredSessions() {
        MockSession session1 = new MockSession(1L, "MS-001", "2", "hcltech", "HCLTech", "Technical", "2026-10-21", 85, 80, 90, 85, 3, "Good");
        MockSession session2 = new MockSession(2L, "MS-002", "2", "tcs", "TCS", "HR", "2026-10-21", 90, 90, 90, 90, 3, "Excellent");

        when(mockSessionRepository.findByUserId("2")).thenReturn(Arrays.asList(session1, session2));

        List<MockSession> sessions = mockSessionService.getByUserId("2");

        assertNotNull(sessions);
        assertEquals(2, sessions.size());
        assertEquals("HCLTech", sessions.get(0).getCompanyName());
        assertEquals("TCS", sessions.get(1).getCompanyName());
        verify(mockSessionRepository, times(1)).findByUserId("2");
    }
}
