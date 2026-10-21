package com.placeprep;

import com.placeprep.config.TokenService;
import com.placeprep.dto.AuthRequest;
import com.placeprep.dto.AuthResponse;
import com.placeprep.dto.RegisterRequest;
import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import com.placeprep.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private TokenService tokenService;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        tokenService = new TokenService();
        userService = new UserService(userRepository, passwordEncoder, tokenService);
    }

    @Test
    void testRegisterHashesPasswordAndEnforcesStudentRole() {
        RegisterRequest req = new RegisterRequest(
                "Jane Doe",
                "jane@example.com",
                "secret123",
                "IIT Delhi",
                "Computer Science",
                "2028"
        );

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        AuthResponse response = userService.register(req);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("jane@example.com", response.getUser().getEmail());
        assertEquals("student", response.getUser().getRole()); // Role must be strictly student

        // Verify password was hashed and not stored in plaintext
        verify(userRepository).save(argThat(savedUser ->
                passwordEncoder.matches("secret123", savedUser.getPassword()) &&
                !savedUser.getPassword().equals("secret123")
        ));
    }

    @Test
    void testLoginValidCredentials() {
        User existing = new User();
        existing.setId(5L);
        existing.setEmail("jane@example.com");
        existing.setPassword(passwordEncoder.encode("secret123"));
        existing.setName("Jane Doe");
        existing.setRole("student");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));

        AuthResponse response = userService.login(new AuthRequest("jane@example.com", "secret123"));

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("jane@example.com", response.getUser().getEmail());
    }

    @Test
    void testLoginInvalidPasswordFails() {
        User existing = new User();
        existing.setId(5L);
        existing.setEmail("jane@example.com");
        existing.setPassword(passwordEncoder.encode("secret123"));

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));

        assertThrows(IllegalArgumentException.class, () ->
                userService.login(new AuthRequest("jane@example.com", "wrongpassword")));
    }
}
