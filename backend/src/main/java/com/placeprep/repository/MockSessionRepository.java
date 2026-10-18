package com.placeprep.repository;

import com.placeprep.model.MockSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MockSessionRepository extends JpaRepository<MockSession, Long> {
    List<MockSession> findByUserId(String userId);
}
