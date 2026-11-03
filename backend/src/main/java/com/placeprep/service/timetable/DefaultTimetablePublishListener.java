package com.placeprep.service.timetable;

import com.placeprep.model.timetable.Timetable;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DefaultTimetablePublishListener implements TimetablePublishListener {

    @Override
    public void onTimetablePublished(Timetable timetable) {
        log.info("Timetable published event received for ID {} (Session: {}, Term: {}, Dept: {}, Sem: {})",
                timetable.getId(),
                timetable.getAcademicSession(),
                timetable.getTerm(),
                timetable.getDepartmentCode(),
                timetable.getSemester());
    }
}
