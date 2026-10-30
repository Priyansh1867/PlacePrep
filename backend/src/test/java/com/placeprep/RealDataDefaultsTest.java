package com.placeprep;

import com.placeprep.controller.StudentAttendanceController;
import com.placeprep.repository.UserRepository;
import com.placeprep.repository.InstituteLocationRepository;
import com.placeprep.service.UserService;
import com.placeprep.service.AttendanceService;
import com.placeprep.service.InstituteLocationService;
import java.lang.reflect.Proxy;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RealDataDefaultsTest {
    @Test
    void unknownProfileCannotCreateAnAccount() {
        AtomicInteger writes = new AtomicInteger();
        UserRepository repository = (UserRepository) Proxy.newProxyInstance(UserRepository.class.getClassLoader(), new Class<?>[]{UserRepository.class}, (proxy, method, arguments) -> {
            if (method.getName().equals("findByEmail")) return Optional.empty();
            if (method.getName().equals("save")) writes.incrementAndGet();
            return null;
        });
        UserService service = new UserService(repository);
        assertThrows(IllegalArgumentException.class, () -> service.getUserFullProfile("unregistered@example.edu"));
        assertThrows(IllegalArgumentException.class, () -> service.saveUserFullProfile("unregistered@example.edu", "{}", Map.of()));
        assertEquals(0, writes.get());
    }
    @Test
    void emptyAttendanceDoesNotManufactureStudents() {
        assertTrue(new AttendanceService().getClassRoster("CSE", "6").isEmpty());
    }
    @Test
    void missingInstituteLocationRemainsUnconfigured() throws Exception {
        InstituteLocationRepository repository = (InstituteLocationRepository) Proxy.newProxyInstance(InstituteLocationRepository.class.getClassLoader(), new Class<?>[]{InstituteLocationRepository.class}, (proxy, method, arguments) -> Optional.empty());
        InstituteLocationService service = new InstituteLocationService();
        var field = InstituteLocationService.class.getDeclaredField("locationRepository");
        field.setAccessible(true);
        field.set(service, repository);
        assertTrue(service.getCurrentLocation().isEmpty());
    }
    @Test
    void imageDoesNotBecomeAFabricatedBiometricMatch() {
        var response = new StudentAttendanceController().verifyStudentFace(Map.of("photo", "data:image/png;base64,not-a-biometric-match"), null);
        assertEquals(501, response.getStatusCode().value());
        assertEquals(false, ((Map<?,?>)response.getBody()).get("verified"));
    }
}
