package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.RoomType;
import com.placeprep.model.timetable.TimetableRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableRoomRepository extends JpaRepository<TimetableRoom, Long> {

    Optional<TimetableRoom> findByCode(String code);

    List<TimetableRoom> findByRoomType(RoomType roomType);
}

