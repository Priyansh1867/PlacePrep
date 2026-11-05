package com.placeprep.service.timetable.importer;

import java.util.*;

/**
 * Fixture of confirmed faculty mappings for the department timetable.
 * Maps short codes, known name variants, and spellings to canonical full names and codes.
 */
public final class ConfirmedFacultyFixture {

    public record CanonicalFaculty(String shortCode, String fullName, List<String> aliases) {}

    private static final List<CanonicalFaculty> KNOWN_FACULTY = List.of(
            new CanonicalFaculty("AB", "Ms. Ambika Bagri", List.of("Ambika Bagari", "Ambika Bagri", "AB")),
            new CanonicalFaculty("RG", "Mr. Rahul Guha", List.of("Rahul Guha", "RG")),
            new CanonicalFaculty("VG", "Mr. Vaibhav Gandhi", List.of("Vaibhav Gandhi", "Vaibahv Gandhi", "VG")),
            new CanonicalFaculty("DB", "Ms. Deepika Bansal", List.of("Deepika Bansal", "DB")),
            new CanonicalFaculty("DBH", "Ms. Deepali Bhardwaj", List.of("Deepali Bhardwaj", "Deepali", "Deeplai", "DEEPLAI BHARDWAJ", "Dipali Ma'am", "Ms. Deepali", "Ms. Deeplai")),
            new CanonicalFaculty("JS", "Mr. Jaydip Singh", List.of("Jaydip Singh", "Jaydeep Singh", "JS")),
            new CanonicalFaculty("YP", "Ms. Yogita Punjabi", List.of("Yogita Punjabi", "YP")),
            new CanonicalFaculty("SV", "Ms. Swati Vijay", List.of("Swati Vijay", "SV")),
            new CanonicalFaculty("PD", "Mr. Pritam Das", List.of("Pritam Das", "PD")),
            new CanonicalFaculty("MV", "Dr. Manju Vyas", List.of("Manju Vyas", "MV")),
            new CanonicalFaculty("NK", "Ms. Neelkamal Chaudhary", List.of("Neelkamal Chaudhary", "NK")),
            new CanonicalFaculty("GL", "Dr. Geerija Lawania", List.of("Geerija Lawania", "Geeija", "Dr. Geeija", "Dr. Geerija", "GL")),
            new CanonicalFaculty("AS", "Ms. Anima Sharma", List.of("Anima Sharma", "AS")),
            new CanonicalFaculty("GK", "Dr. Gaurav Kumar", List.of("Gaurav Kumar", "GK")),
            new CanonicalFaculty("PS", "Mr. Pankaj Sharma", List.of("Pankaj Sharma", "PS")),
            new CanonicalFaculty("VB", "Ms. Vipra Bohra", List.of("Vipra Bohra", "VB")),
            new CanonicalFaculty("YK", "Dr. Yagvendra Kumavat", List.of("Yagvendra Kumavat", "YK")),
            new CanonicalFaculty("MS", "Ms. Madhur Sharma", List.of("Madhur Sharma", "MS"))
    );

    public static List<CanonicalFaculty> getKnownFaculty() {
        return KNOWN_FACULTY;
    }
}

