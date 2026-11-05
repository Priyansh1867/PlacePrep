package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.placeprep.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "faculty_profile",
        indexes = {
                @Index(name = "idx_faculty_profile_user_id", columnList = "user_id"),
                @Index(name = "idx_faculty_profile_dept_code", columnList = "department_code, short_code"),
                @Index(name = "idx_faculty_profile_email", columnList = "email")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FacultyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "short_code", nullable = false, length = 32)
    private String shortCode; // e.g. "AB", "DS"

    @Column(name = "full_name", nullable = false, length = 128)
    private String fullName;

    @Column(name = "department_code", nullable = false, length = 32)
    private String departmentCode; // e.g. "AIDS"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 128)
    private String email;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FacultyAlias> aliases = new ArrayList<>();
}

