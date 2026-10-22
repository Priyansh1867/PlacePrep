package com.placeprep.service;

public class JudgeProviderUnavailableException extends RuntimeException {
    public JudgeProviderUnavailableException(String message) {
        super(message);
    }

    public JudgeProviderUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
