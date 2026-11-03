# Timetable Integration API Reference

This document describes the external integration hook provided by the Timetable module for other subsystems (Attendance, Placement, Academic Records, Mobile App, etc.) to consume timetable data without touching internal timetable database tables or domain structures.

---

## 1. Get Today's Classes Hook

### Endpoint
`GET /api/timetable/me/today`

### Authentication & Authorization
- **Header**: `Authorization: Bearer <JWT>`
- **Roles**: `STUDENT`, `TEACHER`, `FACULTY`, `HOD`, `MANAGEMENT`, `ADMIN`
- Identity is derived strictly from the authenticated token principal (never from request parameters).

### Behavior
- Resolves the current user's profile and active section/lab group (for students) or assigned faculty profile (for teachers/faculty).
- Evaluates the current academic session, term, and day of week.
- Integrates all active, approved substitutions/overrides for today's date (`tt_override`).
- Integrates all active academic calendar events (`tt_calendar_event` - e.g., holidays, exams, no-classes).
- Returns the resolved list of slots with friendly fields for immediate display or attendance roster initialization.

---

## 2. Response Payload Schema

### Response Object (Student / Teacher View)

```json
{
  "unassigned": false,
  "needsLinking": false,
  "timetableId": 101,
  "academicSession": "2026-27",
  "term": "ODD",
  "departmentCode": "AI_DS",
  "year": 3,
  "semester": 5,
  "sectionName": "A",
  "labGroupCode": "A1",
  "eventNote": null,
  "calendarEvents": [],
  "slots": [
    {
      "slotId": 5021,
      "id": 5021,
      "dayOfWeek": 1,
      "startPeriodOrder": 1,
      "spanPeriods": 1,
      "periodNumber": 1,
      "time": "08:30 - 09:30",
      "customStart": "08:30:00",
      "customEnd": "09:30:00",
      "subject": "Deep Learning",
      "subjectCode": "CS501",
      "subjectName": "Deep Learning",
      "kind": "THEORY",
      "section": "A",
      "sectionName": "A",
      "labGroup": null,
      "labGroupCode": null,
      "room": "LH-101",
      "roomCode": "LH-101",
      "roomName": "Lecture Hall 101",
      "faculty": [
        {
          "id": 12,
          "facultyCode": "RS",
          "name": "Dr. Rohit Sharma",
          "email": "rohit@college.edu"
        }
      ],
      "eventNote": null,
      "override": null
    },
    {
      "slotId": 5022,
      "id": 5022,
      "dayOfWeek": 1,
      "startPeriodOrder": 2,
      "spanPeriods": 2,
      "periodNumber": 2,
      "time": "09:30 - 11:30",
      "customStart": null,
      "customEnd": null,
      "subject": "Deep Learning Lab",
      "subjectCode": "CS501P",
      "subjectName": "Deep Learning Lab",
      "kind": "LAB",
      "section": "A",
      "sectionName": "A",
      "labGroup": "A1",
      "labGroupCode": "A1",
      "room": "LAB-3",
      "roomCode": "LAB-3",
      "roomName": "AI & Systems Lab 3",
      "faculty": [
        {
          "id": 12,
          "facultyCode": "RS",
          "name": "Dr. Rohit Sharma",
          "email": "rohit@college.edu"
        }
      ],
      "eventNote": null,
      "override": null
    }
  ]
}
```

### Response on Holiday / Academic Event
When a calendar event (`HOLIDAY`, `EXAM`, or `NO_CLASSES`) is active for today:
```json
{
  "unassigned": false,
  "eventNote": "Holiday: Diwali Break",
  "calendarEvents": [
    {
      "id": 4,
      "title": "Diwali Break",
      "kind": "HOLIDAY",
      "scope": "WHOLE_INSTITUTE",
      "startDate": "2026-11-03",
      "endDate": "2026-11-05"
    }
  ],
  "slots": []
}
```

### Response for Unassigned Student
If a student has not been assigned to a section or lab group:
```json
{
  "unassigned": true,
  "message": "You are not currently assigned to any timetable section. Please contact your department coordinator."
}
```

### Response for Unlinked Faculty
If a teacher user account has not yet been linked to an official faculty profile:
```json
{
  "needsLinking": true,
  "message": "Your user account is not linked to an official faculty profile. A request has been notified to management.",
  "suggestions": [
    {
      "id": 15,
      "facultyCode": "AK",
      "name": "Dr. Amit Kumar",
      "departmentCode": "AI_DS"
    }
  ]
}
```

---

## 3. Integration Guidelines for Attendance & Placement Modules
1. **Never read `tt_timetable` or `tt_slot` directly**: Always query `/api/timetable/me/today`.
2. **Attendance Initialization**:
   - Use `slotId` as the unique reference for the class session.
   - Use `subject`, `section`, `labGroup`, and `time` to populate attendance registers.
   - If `eventNote` is populated or `slots` is empty, skip attendance generation for the day.
3. **Faculty Substitution Awareness**:
   - If a slot has an active override (substitution), the `faculty` array reflects the substitute teacher assigned for today's session, enabling them to mark attendance for that class.

