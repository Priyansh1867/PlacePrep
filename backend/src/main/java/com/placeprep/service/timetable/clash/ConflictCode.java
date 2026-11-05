package com.placeprep.service.timetable.clash;

public final class ConflictCode {
    private ConflictCode() {}

    // HARD conflicts (block save and publish)
    public static final String FACULTY_CLASH = "FACULTY_CLASH";
    public static final String ROOM_CLASH = "ROOM_CLASH";
    public static final String SECTION_CLASH = "SECTION_CLASH";
    public static final String OUT_OF_GRID = "OUT_OF_GRID";
    public static final String ON_BREAK = "ON_BREAK";
    public static final String GROUP_NOT_IN_SECTION = "GROUP_NOT_IN_SECTION";
    public static final String MISSING_SUBJECT = "MISSING_SUBJECT";
    public static final String MISSING_FACULTY = "MISSING_FACULTY";

    // SOFT conflicts (warnings, publish allowed)
    public static final String FACULTY_CONSECUTIVE_LIMIT = "FACULTY_CONSECUTIVE_LIMIT";
    public static final String FACULTY_DAILY_LIMIT = "FACULTY_DAILY_LIMIT";
    public static final String LAB_SPAN_TOO_SHORT = "LAB_SPAN_TOO_SHORT";
    public static final String SUBJECT_DAILY_DUPLICATE = "SUBJECT_DAILY_DUPLICATE";
    public static final String NO_ASSIGNMENT_ROW = "NO_ASSIGNMENT_ROW";
    public static final String ROOM_CAPACITY_EXCEEDED = "ROOM_CAPACITY_EXCEEDED";
    public static final String LONG_FREE_GAPS = "LONG_FREE_GAPS";
}

