package com.placeprep.model.timetable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "tt_room_alias",
        indexes = {
                @Index(name = "idx_tt_room_alias_room_id", columnList = "room_id"),
                @Index(name = "idx_tt_room_alias_normalized", columnList = "normalized_alias")
        }
)
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RoomAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnore
    private TimetableRoom room;

    @Column(nullable = false, length = 64)
    private String alias;

    @Column(name = "normalized_alias", nullable = false, length = 64)
    private String normalizedAlias;

    public RoomAlias(TimetableRoom room, String alias, String normalizedAlias) {
        this.room = room;
        this.alias = alias;
        this.normalizedAlias = normalizedAlias;
    }
}

