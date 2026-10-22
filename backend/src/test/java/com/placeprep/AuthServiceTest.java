package com.placeprep;

import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import com.placeprep.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userService = new UserService(userRepository);
    }

    @Test
    void testRegisterEnforcesStudentRoleAndDefaults() {
        User user = new User();
        user.setName("Jane Doe");
        user.setEmail("jane@example.com");
        user.setPassword("secret123");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        User saved = userService.register(user);

        assertNotNull(saved);
        assertEquals("jane@example.com", saved.getEmail());
        assertEquals("student", saved.getRole());
        assertNotNull(saved.getSavedCompanyIds());
        assertNotNull(saved.getSavedQuestionIds());
    }

    @Test
    void testLoginValidCredentials() {
        User existing = new User();
        existing.setId(5L);
        existing.setEmail("jane@example.com");
        existing.setPassword("secret123");
        existing.setName("Jane Doe");
        existing.setRole("student");

        when(userRepository.findByEmailAndPassword("jane@example.com", "secret123")).thenReturn(Optional.of(existing));

        User loggedIn = userService.login("jane@example.com", "secret123");

        assertNotNull(loggedIn);
        assertEquals("jane@example.com", loggedIn.getEmail());
    }

    @Test
    void testLoginInvalidPasswordFails() {
        when(userRepository.findByEmailAndPassword("jane@example.com", "wrongpassword")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                userService.login("jane@example.com", "wrongpassword"));
    }
}
