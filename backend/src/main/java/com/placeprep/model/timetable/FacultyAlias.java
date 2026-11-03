package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "faculty_alias",
        indexes = {
                @Index(name = "idx_faculty_alias_faculty_id", columnList = "faculty_id"),
                @Index(name = "idx_faculty_alias_normalized", columnList = "normalized_alias")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FacultyAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    @JsonIgnore
    private FacultyProfile faculty;

    @Column(nullable = false, length = 128)
    private String alias;

    @Column(name = "normalized_alias", nullable = false, length = 128)
    private String normalizedAlias;

    public FacultyAlias(FacultyProfile faculty, String alias, String normalizedAlias) {
        this.faculty = faculty;
        this.alias = alias;
        this.normalizedAlias = normalizedAlias;
    }
}

