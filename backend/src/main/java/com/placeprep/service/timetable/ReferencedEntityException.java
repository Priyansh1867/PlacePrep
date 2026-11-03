package com.placeprep.service.timetable;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@Getter
@ResponseStatus(HttpStatus.CONFLICT)
public class ReferencedEntityException extends RuntimeException {
    private final List<Long> referencingSlotIds;

    public ReferencedEntityException(String message, List<Long> referencingSlotIds) {
        super(message);
        this.referencingSlotIds = referencingSlotIds;
    }
}

