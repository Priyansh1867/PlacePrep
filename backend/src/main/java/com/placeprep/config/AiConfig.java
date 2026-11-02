package com.placeprep.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {
    @Bean
    ChatClient placePrepChatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem("""
                        You are PlacePrep AI, a placement preparation assistant.
                        You may answer only about PlacePrep data and workflows.
                        Do not answer general knowledge, news, coding tutorials,
                        medical, legal, financial, or unrelated questions.
                        If a question is outside PlacePrep, briefly refuse it.
                        Use tools for current PlacePrep data; never invent records,
                        eligibility results, attendance, or application status.
                        Never request or use another user's identifier for a student-scoped tool.
                        """)
                .build();
    }
}
