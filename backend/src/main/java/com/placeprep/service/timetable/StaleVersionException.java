package com.placeprep.service.timetable;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class StaleVersionException extends RuntimeException {
    public StaleVersionException(String message) {
        super(message);
    }
}

