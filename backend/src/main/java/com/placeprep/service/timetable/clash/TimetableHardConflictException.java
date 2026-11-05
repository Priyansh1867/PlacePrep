package com.placeprep.service.timetable.clash;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@Getter
@ResponseStatus(HttpStatus.CONFLICT)
public class TimetableHardConflictException extends RuntimeException {
    private final List<TimetableConflict> conflicts;

    public TimetableHardConflictException(List<TimetableConflict> conflicts) {
        super("Hard conflicts detected: operation cannot proceed");
        this.conflicts = conflicts;
    }
}

