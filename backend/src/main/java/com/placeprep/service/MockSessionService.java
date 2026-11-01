package com.placeprep.service;

import com.placeprep.model.MockSession;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.repository.MockSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MockSessionService {

    @Autowired
    private MockSessionRepository mockSessionRepository;

    public MockSessionService() {
    }

    public MockSessionService(MockSessionRepository mockSessionRepository) {
        this.mockSessionRepository = mockSessionRepository;
    }

    public List<MockSession> getByUserId(String userId) {
        return mockSessionRepository.findByUserId(userId);
    }

    public MockSession save(MockSession session) {
        if (session.getSessionId() == null || session.getSessionId().trim().isEmpty()) {
            session.setSessionId("MS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return mockSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getByUserIdDto(String userId) {
        return EntityResponseMapper.toDtoList(getByUserId(userId));
    }

    @Transactional
    public EntityResponseDto saveDto(MockSession session) {
        return EntityResponseMapper.toDto(save(session));
    }
}
