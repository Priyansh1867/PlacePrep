"""Emit additive PlacePrep test data SQL for an explicitly local MySQL database.

Set PLACEPREP_SEED_PASSWORD_HASH to a BCrypt hash before running. This file
contains no password or database credential. Existing rows are never updated.
"""

import json
import os
import sys
from datetime import date, timedelta


class Expr:
    def __init__(self, sql):
        self.sql = sql


def literal(value):
    if isinstance(value, Expr):
        return value.sql
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("\\", "\\\\").replace("'", "''") + "'"


statements = []


def add(table, row, identity):
    cols = ", ".join("`" + name + "`" for name in row)
    values = ", ".join(literal(value) for value in row.values())
    predicate = " AND ".join(
        "`" + name + "` = " + literal(value) for name, value in identity.items()
    )
    statements.append(
        f"INSERT INTO `{table}` ({cols}) SELECT {values} "
        f"WHERE NOT EXISTS (SELECT 1 FROM `{table}` WHERE {predicate});"
    )


def lookup(table, key, value):
    return Expr(f"(SELECT id FROM `{table}` WHERE `{key}` = {literal(value)} LIMIT 1)")


def student_email(number):
    return f"seed26.student{number:02d}@placeprep.test"


def student_id(number):
    return Expr(f"CAST({lookup('users', 'email', student_email(number)).sql} AS CHAR)")


def main():
    hashed_password = os.environ.get("PLACEPREP_SEED_PASSWORD_HASH", "")
    if not hashed_password.startswith(("$2a$", "$2b$", "$2y$")) or len(hashed_password) != 60:
        raise SystemExit("PLACEPREP_SEED_PASSWORD_HASH must contain a 60-character BCrypt hash")

    roles = ["admin", "tpo", "teacher", "hod", "management", "hr", "coordinator", "director"]
    for role in roles:
        email = f"seed26.{role}@placeprep.test"
        add("users", {
            "email": email, "name": f"Seed {role.title()}", "password": Expr("@seed_hash"),
            "role": role, "status": "ACTIVE", "onboarding_completed": True,
            "college": "PlacePrep Test Institute", "branch": "CSE", "graduation_batch": "2026",
        }, {"email": email})

    branches = ["CSE", "IT", "ECE"]
    for number in range(1, 25):
        email = student_email(number)
        branch = branches[(number - 1) % len(branches)]
        batch = "2026" if number <= 16 else "2027"
        cgpa = round(6.4 + (number % 8) * 0.38, 2)
        backlogs = 1 if number % 9 == 0 else 0
        add("users", {
            "email": email, "name": f"Seed Student {number:02d}", "password": Expr("@seed_hash"),
            "role": "student", "status": "ACTIVE", "onboarding_completed": True,
            "college": "PlacePrep Test Institute", "branch": branch,
            "graduation_batch": batch, "roll_number": f"SEED26/{branch}/{number:03d}",
            "cgpa": cgpa, "tenth_percentage": 70 + number % 20,
            "twelfth_percentage": 68 + number % 22, "active_backlogs": backlogs,
        }, {"email": email})
        add("student_academic_records", {
            "student_id": student_id(number), "email": email,
            "name": f"Seed Student {number:02d}", "branch": branch,
            "graduation_batch": batch, "cgpa": cgpa,
            "tenth_percentage": 70 + number % 20, "twelfth_percentage": 68 + number % 22,
            "active_backlogs": backlogs, "sem1sgpa": 7.1 + number % 3 * 0.3,
            "sem2sgpa": 7.2 + number % 3 * 0.3, "sem3sgpa": 7.3 + number % 3 * 0.3,
            "verified": number <= 20, "verified_at": "2026-11-01 10:00",
            "verified_by": "seed26.admin@placeprep.test",
        }, {"email": email})

    names = ["Acme Systems", "Northstar Labs", "ByteForge", "Helio Data", "CloudAxis", "Vertex Works"]
    for number, name in enumerate(names, 1):
        company_id = f"seed26-company-{number:02d}"
        add("companies", {
            "company_id": company_id, "name": name, "slug": company_id,
            "industry": ["Software", "Cloud", "Analytics"][number % 3],
            "headquarters": "Bengaluru", "ctc_range": f"{8 + number}-{12 + number} LPA",
            "drive_status": "Registrations Active", "experience_count": 4,
            "popularity_score": 60 + number * 5, "verified_upcoming_drive": True,
            "verified_historical_source": "Synthetic PlacePrep test data",
            "upcoming_drive_date": str(date(2026, 11, 12) + timedelta(days=number * 3)),
            "recruitment_process_json": json.dumps(["Aptitude", "Technical", "HR"]),
        }, {"company_id": company_id})
        company_fk = lookup("companies", "company_id", company_id)
        for batch in ("2026", "2027"):
            add("company_eligible_batches", {"company_id": company_fk, "batch": batch},
                {"company_id": company_fk, "batch": batch})
        for role_name in ("Software Engineer", "Data Analyst"):
            add("company_roles", {"company_id": company_fk, "role_name": role_name},
                {"company_id": company_fk, "role_name": role_name})
        for topic in ("Java", "SQL", "Problem Solving"):
            add("company_frequent_topics", {"company_id": company_fk, "topic": topic},
                {"company_id": company_fk, "topic": topic})

    rounds = ["Aptitude", "Technical Interview", "HR Interview"]
    for number in range(1, 13):
        company_number = (number - 1) % 6 + 1
        company_id = f"seed26-company-{company_number:02d}"
        drive_id = f"seed26-drive-{number:02d}"
        drive_date = date(2026, 11, 16) + timedelta(days=number * 3)
        add("placement_drives", {
            "drive_id": drive_id, "company_id": company_id,
            "company_name": names[company_number - 1], "role": "Software Engineer",
            "ctc": f"{9 + company_number} LPA", "drive_date": str(drive_date),
            "drive_time": "09:30", "deadline": str(drive_date - timedelta(days=5)),
            "status": "Verified Upcoming Drive", "verified_badge": True,
            "drive_type": "ON_CAMPUS", "is_off_campus": False,
            "venue": f"Placement Hall {number % 3 + 1}", "reporting_time": "09:00",
            "instructions": "Bring student ID and updated resume.",
            "min_cgpa": 6.5 if number % 4 else 7.5,
            "min_tenth_percentage": 60, "min_twelfth_percentage": 60,
            "max_backlogs": 0,
            "round_configs_json": json.dumps([{"name": label, "roundNumber": index}
                                              for index, label in enumerate(rounds, 1)]),
        }, {"drive_id": drive_id})
        drive_fk = lookup("placement_drives", "drive_id", drive_id)
        for table, column, values in (
            ("drive_eligible_batches", "batch", ["2026", "2027"]),
            ("drive_allowed_branches", "branch_name", branches),
            ("drive_locations", "location", ["Bengaluru", "Hyderabad"]),
            ("drive_rounds", "round_name", rounds),
        ):
            for value in values:
                add(table, {"drive_id": drive_fk, column: value},
                    {"drive_id": drive_fk, column: value})
        for index, label in enumerate(rounds, 1):
            add("drive_rounds_config", {
                "drive_id": drive_id, "round_number": index, "name": label,
                "type": "INTERVIEW" if index > 1 else "ASSESSMENT", "cutoff_score": 65,
            }, {"drive_id": drive_id, "round_number": index})

    for number in range(1, 61):
        company_number = (number - 1) % 6 + 1
        question_id = f"seed26-question-{number:03d}"
        company_id = f"seed26-company-{company_number:02d}"
        topic = ["Java", "SQL", "DSA", "System Design", "React"][number % 5]
        add("interview_questions", {
            "question_id": question_id, "company_id": company_id,
            "question": f"Test question {number:03d}: explain a practical {topic} trade-off.",
            "category": topic, "difficulty": ["Easy", "Medium", "Hard"][number % 3],
            "round": "Technical Interview", "approach": f"Describe requirements, then reason about {topic}.",
            "suggested_answer": f"State the constraints and compare two {topic} approaches.",
            "frequency_score": 2 + number % 7, "times_reported": 1 + number % 5,
            "verified_historical": False, "last_reported_date": "2026-10-30",
        }, {"question_id": question_id})
        question_fk = lookup("interview_questions", "question_id", question_id)
        for table, column, value in (
            ("interview_question_skills", "skill", topic),
            ("interview_question_follow_ups", "follow_up", f"How would you test {topic} in this case?"),
        ):
            add(table, {"question_id": question_fk, column: value},
                {"question_id": question_fk, column: value})

    for number in range(1, 49):
        student_number = (number - 1) % 24 + 1
        drive_number = ((student_number - 1 + (6 if number > 24 else 0)) % 12) + 1
        company_number = (drive_number - 1) % 6 + 1
        drive_id = f"seed26-drive-{drive_number:02d}"
        company_id = f"seed26-company-{company_number:02d}"
        application_id = f"SEED26-APP-{number:03d}"
        cgpa = round(6.4 + student_number % 8 * 0.38, 2)
        backlogs = 1 if student_number % 9 == 0 else 0
        eligible = cgpa >= (7.5 if drive_number % 4 == 0 else 6.5) and backlogs == 0
        stage = (["IN_PIPELINE", "SHORTLISTED", "OFFERED", "REJECTED"][number % 4]
                 if eligible else "INELIGIBLE_REJECTED")
        add("student_applications", {
            "application_id": application_id, "student_id": student_id(student_number),
            "student_email": student_email(student_number),
            "student_name": f"Seed Student {student_number:02d}",
            "college": "PlacePrep Test Institute", "branch": branches[(student_number - 1) % 3],
            "graduation_batch": "2026" if student_number <= 16 else "2027",
            "cgpa": cgpa,
            "tenth_percentage": 70 + student_number % 20,
            "twelfth_percentage": 68 + student_number % 22,
            "active_backlogs": backlogs,
            "drive_id": drive_id, "company_id": company_id,
            "company_name": names[company_number - 1], "role": "Software Engineer",
            "applied_at": "2026-11-03 09:00", "status": stage,
            "eligibility_status": "ELIGIBLE" if eligible else "INELIGIBLE",
            "eligibility_remarks": ("Meets seeded drive criteria." if eligible
                                    else "Does not meet seeded CGPA or backlog criteria."),
            "current_round": rounds[number % 3], "conflict_flagged": False,
        }, {"application_id": application_id})
        add("placement_applications", {
            "user_id": student_id(student_number), "company_id": company_id,
            "company_name": names[company_number - 1], "drive_id": drive_id,
            "role": "Software Engineer", "status": stage, "applied_date": "2026-11-03",
            "notes": f"Synthetic test application {application_id}",
        }, {"notes": f"Synthetic test application {application_id}"})
        add("selection_results", {
            "application_id": application_id, "student_id": student_id(student_number),
            "drive_id": drive_id, "pipeline_status": "REJECTED" if not eligible else stage,
            "current_round_number": 1 + number % 3,
            "promotion_history_json": json.dumps([{"round": 1, "result": "PASS"}]),
            "offer_ctc": "12 LPA" if stage == "OFFERED" else None,
            "offer_details": "Synthetic offer for testing" if stage == "OFFERED" else None,
            "rejection_feedback": "Does not meet drive eligibility criteria" if not eligible else None,
            "last_updated_at": "2026-11-03 09:30",
        }, {"application_id": application_id})
        if number <= 24:
            candidate_id = f"seed26-candidate-{number:03d}"
            add("candidates", {
                "candidate_id": candidate_id, "name": f"Seed Student {student_number:02d}",
                "email": student_email(student_number), "branch": branches[(student_number - 1) % 3],
                "college": "PlacePrep Test Institute", "graduation_batch": "2026" if student_number <= 16 else "2027",
                "company_id": company_id, "company_name": names[company_number - 1],
                "current_round": rounds[number % 3], "status": stage,
                "overall_score": 65 + number % 30, "technical_depth": 60 + number % 35,
                "communication": 62 + number % 30, "problem_solving": 64 + number % 30,
                "updated_at": "2026-11-03 09:30",
            }, {"candidate_id": candidate_id})
            add("candidate_evaluations", {
                "application_id": application_id, "drive_id": drive_id, "round_number": 1,
                "evaluator_id": "seed26.tpo@placeprep.test", "evaluator_name": "Seed Tpo",
                "technical_score": 65 + number % 30, "communication_score": 62 + number % 30,
                "problem_solving_score": 64 + number % 30,
                "verdict": "PASS" if number % 4 else "REVIEW",
                "comments": f"Synthetic evaluation for {application_id}",
                "submitted_at": "2026-11-03 09:30",
            }, {"application_id": application_id, "round_number": 1})

    for number in range(1, 25):
        company_number = (number - 1) % 6 + 1
        company_id = f"seed26-company-{company_number:02d}"
        experience_id = f"seed26-experience-{number:03d}"
        add("interview_experiences", {
            "experience_id": experience_id, "company_id": company_id,
            "company_name": names[company_number - 1], "student_name": f"Seed Student {number:02d}",
            "college": "PlacePrep Test Institute", "branch": branches[(number - 1) % 3],
            "batch": "2026" if number <= 16 else "2027", "role": "Software Engineer",
            "interview_date": "2026-10-20", "difficulty": ["Easy", "Medium", "Hard"][number % 3],
            "outcome": "Selected" if number % 3 == 0 else "Interviewed",
            "overall_rating": 3 + number % 3, "helpful_votes": number % 8,
            "is_anonymous": number % 5 == 0, "verified": False,
            "tips": f"Synthetic experience {number}; revise Java, SQL, and projects.",
        }, {"experience_id": experience_id})
        experience_fk = lookup("interview_experiences", "experience_id", experience_id)
        for table, column, value in (
            ("experience_rounds_faced", "round_faced", "Technical Interview"),
            ("experience_questions_encountered", "question_encountered", f"Explain project decision {number}."),
        ):
            add(table, {"experience_id": experience_fk, column: value},
                {"experience_id": experience_fk, column: value})
        session_id = f"seed26-mock-{number:03d}"
        add("mock_sessions", {
            "session_id": session_id, "user_id": student_id(number),
            "company_id": company_id, "company_name": names[company_number - 1],
            "date": "2026-11-02", "round": "Technical", "score": 55 + number % 40,
            "clarity": 5 + number % 5, "correctness": 5 + number % 5,
            "structure": 5 + number % 5, "questions_answered": 4 + number % 5,
            "feedback_summary": "Synthetic mock interview feedback; improve explanation depth.",
        }, {"session_id": session_id})
        feedback_id = f"seed26-feedback-{number:03d}"
        add("feedbacks", {
            "feedback_id": feedback_id, "user_id": student_id(number),
            "category": "PLATFORM", "message": f"Synthetic feedback entry {number}.",
            "rating": 3 + number % 3, "batch": "2026", "date": "2026-11-03",
        }, {"feedback_id": feedback_id})

    for number in range(1, 13):
        company_number = (number - 1) % 6 + 1
        drive_id = f"seed26-drive-{number:02d}"
        add("recruiter_feedbacks", {
            "drive_id": drive_id, "company_id": f"seed26-company-{company_number:02d}",
            "company_name": names[company_number - 1],
            "recruiter_name": f"Seed Recruiter {number}",
            "recruiter_email": "seed26.hr@placeprep.test",
            "technical_competency_rating": 3 + number % 3,
            "communication_rating": 3 + number % 3,
            "batch_preparedness_rating": 3 + number % 3,
            "overall_rating": 3 + number % 3,
            "hiring_remarks": f"Synthetic recruiter feedback for {drive_id}.",
            "suggestions_for_tpo": "Practice project explanations and mock interviews.",
            "submitted_at": "2026-11-03 10:00",
        }, {"drive_id": drive_id, "recruiter_name": f"Seed Recruiter {number}"})
        add("internships", {
            "company_name": names[company_number - 1], "role": f"Seed Internship {number:02d}",
            "stipend": "30000 INR/month", "duration": "6 months",
            "location": "Bengaluru", "deadline": "2026-12-10",
            "eligible_batches": "2026,2027", "eligible_branches": "CSE,IT,ECE",
            "skills_required": "Java,SQL,React", "ppo_opportunity": number % 2 == 0,
        }, {"role": f"Seed Internship {number:02d}"})
        add("notifications", {
            "title": f"Seed Notice {number:02d}",
            "message": f"Synthetic placement notice for {drive_id}.",
            "type": "DRIVE_ALERT", "target_role": "STUDENT",
            "target_batch": "2026" if number <= 8 else "2027",
            "sender_name": "Seed TPO", "link_url": "#drives",
            "created_at": "2026-11-03 10:00",
        }, {"title": f"Seed Notice {number:02d}"})
        add("audit_logs", {
            "action": "SEED_TEST_DATA", "details": f"Synthetic audit entry {number:02d}",
            "performed_by": "seed26.admin@placeprep.test", "performer_role": "ADMIN",
            "target_resource": drive_id, "timestamp": "2026-11-03 10:00",
        }, {"action": "SEED_TEST_DATA", "target_resource": drive_id})

    for number in range(1, 9):
        add("hackathons", {
            "title": f"Seed Hackathon {number:02d}", "organizer": "PlacePrep Test Institute",
            "description": "Synthetic challenge for local feature testing.",
            "registration_deadline": "2026-12-01", "event_date": "2026-12-15",
            "team_size": "2-4", "prize_pool": "Test prize",
            "tags": "AI, Web, Data", "mode": "ONLINE" if number % 2 else "OFFLINE",
        }, {"title": f"Seed Hackathon {number:02d}"})

    for number in range(1, 7):
        subject_code = f"SEED26-CS{number:03d}"
        add("subjects", {
            "code": subject_code, "name": f"Seed Subject {number}",
            "department": "CSE", "semester": "6", "credits": 4,
            "faculty_name": "Seed Teacher", "faculty_email": "seed26.teacher@placeprep.test",
            "min_attendance_percentage": 75,
        }, {"code": subject_code})
        session_date = str(date(2026, 10, 20) + timedelta(days=number))
        add("class_attendance_sessions", {
            "department": "CSE", "semester": "6", "section": "A",
            "subject_code": subject_code, "subject_name": f"Seed Subject {number}",
            "session_date": session_date, "period_number": number,
            "faculty_id": "seed26.teacher@placeprep.test", "faculty_name": "Seed Teacher",
            "status": "COMPLETED", "created_at": "2026-10-20 09:00",
        }, {"subject_code": subject_code, "session_date": session_date})
        session_fk = Expr(f"(SELECT id FROM class_attendance_sessions WHERE subject_code={literal(subject_code)} AND session_date={literal(session_date)} LIMIT 1)")
        for student_number in range(1, 25):
            email = student_email(student_number)
            add("class_attendance_records", {
                "session_id": session_fk, "student_id": student_id(student_number),
                "student_name": f"Seed Student {student_number:02d}",
                "student_roll_number": f"SEED26/{branches[(student_number - 1) % 3]}/{student_number:03d}",
                "status": "ABSENT" if student_number % 7 == 0 else "PRESENT",
                "subject_code": subject_code, "marked_by": "seed26.teacher@placeprep.test",
                "verification_method": "MANUAL", "recorded_at": "2026-10-20 09:30",
            }, {"session_id": session_fk, "student_id": student_id(student_number)})
            add("student_subject_enrollments", {
                "student_email": email, "subject_code": subject_code,
                "student_roll_number": f"SEED26/{branches[(student_number - 1) % 3]}/{student_number:03d}",
                "enrolled_at": "2026-10-01 09:00",
            }, {"student_email": email, "subject_code": subject_code})

    for number in range(1, 5):
        topic = f"Seed CRT Module {number}"
        scheduled = str(date(2026, 10, 15) + timedelta(days=number))
        add("crt_training_sessions", {
            "module_type": "APTITUDE", "topic": topic, "scheduled_date": scheduled,
            "status": "COMPLETED", "target_batch": "2026", "target_branch": "CSE",
            "trainer_name": "Seed Trainer", "venue": "Training Hall",
            "created_by": "seed26.teacher@placeprep.test", "created_at": "2026-10-10 09:00",
        }, {"topic": topic, "scheduled_date": scheduled})
        crt_fk = Expr(f"(SELECT id FROM crt_training_sessions WHERE topic={literal(topic)} AND scheduled_date={literal(scheduled)} LIMIT 1)")
        for student_number in range(1, 25):
            add("crt_attendance_records", {
                "crt_session_id": crt_fk, "student_id": student_id(student_number),
                "student_name": f"Seed Student {student_number:02d}",
                "student_roll_number": f"SEED26/{branches[(student_number - 1) % 3]}/{student_number:03d}",
                "department": "CSE", "status": "ABSENT" if student_number % 6 == 0 else "PRESENT",
                "assessment_score": 55 + student_number % 40,
                "recorded_by": "seed26.teacher@placeprep.test",
                "recorded_at": "2026-10-20 09:30",
            }, {"crt_session_id": crt_fk, "student_id": student_id(student_number)})

    add("institute_locations", {
        "institute_name": "PlacePrep Test Institute", "institute_address": "Test Campus, Bengaluru",
        "city": "Bengaluru", "state": "Karnataka", "latitude": 12.9716,
        "longitude": 77.5946, "geofence_radius_meters": 250,
        "location_status": "ACTIVE", "created_at": "2026-11-01 09:00",
        "updated_by_email": "seed26.management@placeprep.test",
        "updated_by_user_id": lookup("users", "email", "seed26.management@placeprep.test"),
    }, {"institute_name": "PlacePrep Test Institute"})
    add("location_update_history", {
        "institute_location_id": lookup("institute_locations", "institute_name", "PlacePrep Test Institute"),
        "new_latitude": 12.9716, "new_longitude": 77.5946,
        "previous_latitude": 12.9715, "previous_longitude": 77.5945,
        "updated_at": "2026-11-01 09:00", "updated_by_email": "seed26.management@placeprep.test",
        "updated_by_user_id": lookup("users", "email", "seed26.management@placeprep.test"),
        "change_reason": "Synthetic campus location for local testing",
    }, {"change_reason": "Synthetic campus location for local testing"})

    for number in range(1, 4):
        title = f"Seed Master Timetable {number}"
        add("master_timetables", {
            "title": title, "academic_session": "2026-2027", "department": "CSE",
            "branch": "CSE", "semester": "Semester 6", "academic_year": "3rd Year",
            "section": f"Section {chr(64 + number)}", "status": "PUBLISHED",
            "version": 1, "description": "Synthetic timetable for local testing.",
            "effective_start_date": "2026-11-01", "effective_end_date": "2027-04-30",
            "file_name": f"seed-timetable-{number}.csv", "file_type": "text/csv",
            "file_base64": Expr("TO_BASE64('day,period,subject\\nMonday,1,Java')"),
            "file_size": 31, "uploaded_at": "2026-11-01 09:00",
            "uploaded_by": "seed26.management@placeprep.test",
        }, {"title": title})
        timetable_fk = lookup("master_timetables", "title", title)
        add("timetable_versions", {
            "timetable_id": timetable_fk, "version_number": 1,
            "file_name": f"seed-timetable-{number}.csv", "file_type": "text/csv",
            "file_base64": Expr("TO_BASE64('day,period,subject\\nMonday,1,Java')"),
            "file_size": 31, "uploaded_at": "2026-11-01 09:00",
            "uploaded_by": "seed26.management@placeprep.test",
            "change_summary": "Initial synthetic version",
        }, {"timetable_id": timetable_fk, "version_number": 1})

    for number in range(1, 25):
        user_fk = lookup("users", "email", student_email(number))
        for table, column, value in (
            ("user_saved_company_ids", "company_id", f"seed26-company-{(number - 1) % 6 + 1:02d}"),
            ("user_saved_question_ids", "question_id", f"seed26-question-{number:03d}"),
            ("user_practiced_question_ids", "question_id", f"seed26-question-{number:03d}"),
            ("user_revision_question_ids", "question_id", f"seed26-question-{number + 24:03d}"),
        ):
            add(table, {"user_id": user_fk, column: value},
                {"user_id": user_fk, column: value})

    print("SET SESSION sql_mode='STRICT_ALL_TABLES';")
    print("SET @seed_hash = " + literal(hashed_password) + ";")
    print("START TRANSACTION;")
    for statement in statements:
        print(statement)
    print("COMMIT;")
    print(f"SELECT 'seed_statements', {len(statements)};")


if __name__ == "__main__":
    main()
