package com.placeprep;

import com.placeprep.model.User;
import com.placeprep.repository.UserRepository;
import com.placeprep.service.UserService;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceSecurityTest {
    private final UserRepository repository = mock(UserRepository.class);
    private final UserService service = new UserService(repository);

    @Test
    void wrongPasswordCannotLogInExistingAccount() {
        User admin = new User();
        admin.setEmail("admin@example.edu");
        admin.setPassword("correct");
        when(repository.findByEmail("admin@example.edu")).thenReturn(Optional.of(admin));
        assertThrows(IllegalArgumentException.class, () -> service.login("admin@example.edu", "wrong"));
        verify(repository, never()).save(any());
    }

    @Test
    void unknownEmailCannotCreateStaffAccount() {
        when(repository.findByEmail("tpo@example.edu")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.login("tpo@example.edu", "guess"));
        verify(repository, never()).save(any());
    }

    @Test
    void publicRegistrationCannotAssignAdminRole() {
        User user = new User();
        user.setEmail("new@example.edu");
        user.setPassword("sample-password");
        user.setRole("admin");
        when(repository.findByEmail("new@example.edu")).thenReturn(Optional.empty());
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        assertEquals("student", service.register(user).getRole());
        assertNotEquals("sample-password", user.getPassword());
        assertTrue(user.getPassword().startsWith("$2"));
    }

    @Test
    void legacyPlaintextPasswordIsRehashedAfterSuccessfulLogin() {
        User user = new User();
        user.setEmail("legacy@example.edu");
        user.setPassword("old-password");
        when(repository.findByEmail("legacy@example.edu")).thenReturn(Optional.of(user));
        assertSame(user, service.login("legacy@example.edu", "old-password"));
        assertTrue(user.getPassword().startsWith("$2"));
        verify(repository).save(user);
    }
}
