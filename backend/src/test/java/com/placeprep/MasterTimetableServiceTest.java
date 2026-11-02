package com.placeprep;

import com.placeprep.dto.MasterTimetableDto;
import com.placeprep.dto.TimetableStatsDto;
import com.placeprep.exception.BadRequestException;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.model.MasterTimetable;
import com.placeprep.model.TimetableVersion;
import com.placeprep.repository.MasterTimetableRepository;
import com.placeprep.repository.TimetableVersionRepository;
import com.placeprep.service.MasterTimetableService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MasterTimetableServiceTest {

    @Mock
    private MasterTimetableRepository timetableRepository;

    @Mock
    private TimetableVersionRepository versionRepository;

    @InjectMocks
    private MasterTimetableService timetableService;

    private MasterTimetable sampleTimetable;

    @BeforeEach
    void setUp() {
        sampleTimetable = new MasterTimetable();
        sampleTimetable.setId(1L);
        sampleTimetable.setTitle("Fall 2026 CSE Timetable");
        sampleTimetable.setAcademicSession("2026-2027");
        sampleTimetable.setDepartment("Computer Science & Engineering");
        sampleTimetable.setBranch("CSE");
        sampleTimetable.setSemester("Semester 5");
        sampleTimetable.setAcademicYear("3rd Year");
        sampleTimetable.setSection("Section A");
        sampleTimetable.setStatus("DRAFT");
        sampleTimetable.setVersion(1);
        sampleTimetable.setFileName("cse_timetable.pdf");
        sampleTimetable.setFileType("application/pdf");
        sampleTimetable.setFileSize(1024L);
        sampleTimetable.setFileBase64("JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgMiAwIFIKL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iag==");
        sampleTimetable.setUploadedBy("management@placeprep.com");
        sampleTimetable.setUploadedAt(LocalDateTime.now());
        sampleTimetable.setLastUpdated(LocalDateTime.now());
    }

    @Test
    void testGetStats() {
        when(timetableRepository.count()).thenReturn(10L);
        when(timetableRepository.countByStatus("PUBLISHED")).thenReturn(5L);
        when(timetableRepository.countByStatus("DRAFT")).thenReturn(3L);
        when(timetableRepository.countByStatus("ARCHIVED")).thenReturn(2L);
        when(timetableRepository.findTopByOrderByLastUpdatedDesc()).thenReturn(Optional.of(sampleTimetable));

        TimetableStatsDto stats = timetableService.getStats();
        assertEquals(10L, stats.getTotalTimetables());
        assertEquals(5L, stats.getPublishedTimetables());
        assertEquals(3L, stats.getDraftTimetables());
        assertEquals(2L, stats.getArchivedTimetables());
        assertNotNull(stats.getLastUpdated());
    }

    @Test
    void testCreateTimetable() {
        MasterTimetableDto dto = MasterTimetableDto.builder()
                .title("Spring 2027 IT Timetable")
                .academicSession("2026-2027")
                .department("Information Technology")
                .branch("IT")
                .semester("Semester 6")
                .academicYear("3rd Year")
                .section("Section B")
                .effectiveStartDate(LocalDate.of(2027, 1, 10))
                .build();

        MockMultipartFile file = new MockMultipartFile(
                "file", "it_schedule.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Dummy excel content".getBytes()
        );

        when(timetableRepository.save(any(MasterTimetable.class))).thenAnswer(invocation -> {
            MasterTimetable t = invocation.getArgument(0);
            t.setId(2L);
            return t;
        });

        MasterTimetableDto created = timetableService.createTimetable(dto, file, "admin@placeprep.com");
        assertNotNull(created);
        assertEquals("Spring 2027 IT Timetable", created.getTitle());
        assertEquals("it_schedule.xlsx", created.getFileName());
        assertEquals(1, created.getVersion());
        verify(versionRepository, times(1)).save(any(TimetableVersion.class));
    }

    @Test
    void testPublishTimetable() {
        when(timetableRepository.findById(1L)).thenReturn(Optional.of(sampleTimetable));
        when(timetableRepository.save(any(MasterTimetable.class))).thenAnswer(i -> i.getArgument(0));

        MasterTimetableDto published = timetableService.publishTimetable(1L, "admin@placeprep.com");
        assertEquals("PUBLISHED", published.getStatus());
        assertEquals("admin@placeprep.com", published.getLastUpdatedBy());
    }

    @Test
    void testUnpublishTimetable() {
        sampleTimetable.setStatus("PUBLISHED");
        when(timetableRepository.findById(1L)).thenReturn(Optional.of(sampleTimetable));
        when(timetableRepository.save(any(MasterTimetable.class))).thenAnswer(i -> i.getArgument(0));

        MasterTimetableDto draft = timetableService.unpublishTimetable(1L, "admin@placeprep.com");
        assertEquals("DRAFT", draft.getStatus());
    }

    @Test
    void testArchiveTimetable() {
        when(timetableRepository.findById(1L)).thenReturn(Optional.of(sampleTimetable));
        when(timetableRepository.save(any(MasterTimetable.class))).thenAnswer(i -> i.getArgument(0));

        MasterTimetableDto archived = timetableService.archiveTimetable(1L, "admin@placeprep.com");
        assertEquals("ARCHIVED", archived.getStatus());
    }

    @Test
    void testReplaceFileIncrementsVersion() {
        when(timetableRepository.findById(1L)).thenReturn(Optional.of(sampleTimetable));
        when(timetableRepository.save(any(MasterTimetable.class))).thenAnswer(i -> i.getArgument(0));

        MockMultipartFile newFile = new MockMultipartFile(
                "file", "cse_timetable_v2.pdf", "application/pdf",
                "Updated PDF bytes".getBytes()
        );

        MasterTimetableDto updated = timetableService.replaceFile(1L, newFile, "Lab room updated", "admin@placeprep.com");
        assertEquals(2, updated.getVersion());
        assertEquals("cse_timetable_v2.pdf", updated.getFileName());
        verify(versionRepository, times(1)).save(any(TimetableVersion.class));
    }

    @Test
    void testPublishIncompleteThrowsError() {
        sampleTimetable.setFileName(null);
        sampleTimetable.setFileBase64(null);
        sampleTimetable.setFilePath(null);
        when(timetableRepository.findById(1L)).thenReturn(Optional.of(sampleTimetable));

        assertThrows(BadRequestException.class, () -> timetableService.publishTimetable(1L, "admin@placeprep.com"));
    }

    @Test
    void testNotFoundThrowsException() {
        when(timetableRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> timetableService.getTimetableById(999L));
    }
}
