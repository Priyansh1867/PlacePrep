package com.placeprep.config;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {

    private final Map<String, TokenData> tokenStore = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public static class TokenData {
        private final Long userId;
        private final String email;
        private final String role;
        private final long createdAt;

        public TokenData(Long userId, String email, String role) {
            this.userId = userId;
            this.email = email;
            this.role = role;
            this.createdAt = System.currentTimeMillis();
        }

        public Long getUserId() {
            return userId;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }

        public long getCreatedAt() {
            return createdAt;
        }
    }

    public String generateToken(Long userId, String email, String role) {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = "pp_" + Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        tokenStore.put(token, new TokenData(userId, email, role));
        return token;
    }

    public TokenData validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        return tokenStore.get(token.trim());
    }

    public void revokeToken(String token) {
        if (token != null) {
            tokenStore.remove(token.trim());
        }
    }
}
