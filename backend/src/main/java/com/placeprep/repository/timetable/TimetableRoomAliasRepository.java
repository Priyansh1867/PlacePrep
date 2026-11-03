package com.placeprep.repository.timetable;

import com.placeprep.model.timetable.RoomAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableRoomAliasRepository extends JpaRepository<RoomAlias, Long> {

    Optional<RoomAlias> findByNormalizedAlias(String normalizedAlias);

    List<RoomAlias> findByRoomId(Long roomId);
}

