package com.placeprep.repository;

import com.placeprep.model.LiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LiveSessionRepository extends JpaRepository<LiveSession, Long> {

    Optional<LiveSession> findBySessionId(String sessionId);

    List<LiveSession> findAllByOrderByDateDesc();

    List<LiveSession> findByStatusOrderByDateDesc(String status);

    List<LiveSession> findByDriveId(String driveId);
}
