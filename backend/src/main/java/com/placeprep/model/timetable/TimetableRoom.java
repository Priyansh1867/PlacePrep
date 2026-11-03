package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "tt_room",
        indexes = {
                @Index(name = "idx_tt_room_code", columnList = "code", unique = true),
                @Index(name = "idx_tt_room_type", columnList = "room_type")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TimetableRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String code; // normalized, uppercase, no spaces e.g. "DF04"

    @Column(name = "display_name", nullable = false, length = 128)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 16)
    private RoomType roomType = RoomType.CLASSROOM;

    private Integer capacity;

    @Column(length = 64)
    private String building;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomAlias> aliases = new ArrayList<>();
}

