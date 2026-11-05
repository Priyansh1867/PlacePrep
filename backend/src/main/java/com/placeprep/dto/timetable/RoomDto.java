package com.placeprep.dto.timetable;

import com.placeprep.model.timetable.RoomType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDto {
    private Long id;
    private String code;
    private String displayName;
    private RoomType roomType;
    private Integer capacity;
    private String building;
    private List<String> aliases;

    public RoomDto(Long id, String code, String displayName, RoomType roomType, Integer capacity, List<String> aliases) {
        this.id = id;
        this.code = code;
        this.displayName = displayName;
        this.roomType = roomType;
        this.capacity = capacity;
        this.aliases = aliases;
    }
}

