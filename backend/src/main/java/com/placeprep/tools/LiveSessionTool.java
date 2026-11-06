package com.placeprep.tools;

import com.placeprep.model.LiveSession;
import com.placeprep.repository.LiveSessionRepository;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LiveSessionTool {

    private final LiveSessionRepository liveSessionRepository;

    public LiveSessionTool(LiveSessionRepository liveSessionRepository) {
        this.liveSessionRepository = liveSessionRepository;
    }

    @Tool(description = "Get upcoming live placement webinars, company info sessions, mock interview masterclasses, and pre-placement talks.")
    public Object getUpcomingLiveSessions() {
        List<LiveSession> sessions = liveSessionRepository.findAll();
        return sessions != null ? sessions : List.of();
    }
}

