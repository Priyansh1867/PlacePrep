package com.placeprep.service.timetable;

import com.placeprep.model.timetable.Timetable;

public interface TimetablePublishListener {
    /**
     * Invoked immediately after a timetable is successfully published.
     *
     * @param timetable The newly published timetable entity.
     */
    void onTimetablePublished(Timetable timetable);
}

