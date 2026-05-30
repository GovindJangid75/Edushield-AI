import os
import sys
import uuid
import json
from datetime import datetime, timedelta, date
import random

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.teacher_workload import TeacherWorkload
from app.models.risk_predictions import RiskPrediction
from app.models.performance import Performance
from app.models.attendance import Attendance
from app.models.engagement_logs import EngagementLog
from app.models.homework_submissions import HomeworkSubmission
from app.models.interventions import Intervention
from app.models.alerts import Alert

from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Realistic Indian student names ──────────────────────────────────────
STUDENTS_DATA = [
    # Class 6
    {"id": "STU-001", "name": "Ananya Sharma", "class_": "6", "section": "A", "gender": "F"},
    {"id": "STU-002", "name": "Rohit Meena", "class_": "6", "section": "A", "gender": "M"},
    {"id": "STU-003", "name": "Priya Kumari", "class_": "6", "section": "B", "gender": "F"},
    {"id": "STU-004", "name": "Arjun Singh", "class_": "6", "section": "B", "gender": "M"},
    {"id": "STU-005", "name": "Kavita Yadav", "class_": "6", "section": "A", "gender": "F"},
    # Class 7
    {"id": "STU-006", "name": "Jyoti Ansari", "class_": "7", "section": "A", "gender": "F"},
    {"id": "STU-007", "name": "Amit Verma", "class_": "7", "section": "A", "gender": "M"},
    {"id": "STU-008", "name": "Sunita Devi", "class_": "7", "section": "B", "gender": "F"},
    {"id": "STU-009", "name": "Ravi Patel", "class_": "7", "section": "A", "gender": "M"},
    {"id": "STU-010", "name": "Meena Kumari", "class_": "7", "section": "B", "gender": "F"},
    {"id": "STU-011", "name": "Deepak Joshi", "class_": "7", "section": "A", "gender": "M"},
    # Class 8
    {"id": "STU-012", "name": "Pooja Gupta", "class_": "8", "section": "A", "gender": "F"},
    {"id": "STU-013", "name": "Suman Mishra", "class_": "8", "section": "A", "gender": "F"},
    {"id": "STU-014", "name": "Vikram Choudhary", "class_": "8", "section": "A", "gender": "M"},
    {"id": "STU-015", "name": "Neha Rajput", "class_": "8", "section": "B", "gender": "F"},
    {"id": "STU-016", "name": "Rajesh Kumar", "class_": "8", "section": "A", "gender": "M"},
    {"id": "STU-017", "name": "Anjali Prajapati", "class_": "8", "section": "B", "gender": "F"},
    {"id": "STU-018", "name": "Mohit Saini", "class_": "8", "section": "A", "gender": "M"},
    {"id": "STU-019", "name": "Lakshmi Devi", "class_": "8", "section": "B", "gender": "F"},
    {"id": "STU-020", "name": "Suresh Tanwar", "class_": "8", "section": "A", "gender": "M"},
    # Class 9
    {"id": "STU-021", "name": "Rekha Deshmukh", "class_": "9", "section": "A", "gender": "F"},
    {"id": "STU-022", "name": "Anil Sharma", "class_": "9", "section": "A", "gender": "M"},
    {"id": "STU-023", "name": "Geeta Kumari", "class_": "9", "section": "B", "gender": "F"},
    {"id": "STU-024", "name": "Prakash Meena", "class_": "9", "section": "A", "gender": "M"},
    {"id": "STU-025", "name": "Radha Yadav", "class_": "9", "section": "B", "gender": "F"},
    {"id": "STU-026", "name": "Dinesh Kumawat", "class_": "9", "section": "A", "gender": "M"},
    # Class 10
    {"id": "STU-027", "name": "Sapna Jain", "class_": "10", "section": "A", "gender": "F"},
    {"id": "STU-028", "name": "Manish Gurjar", "class_": "10", "section": "A", "gender": "M"},
    {"id": "STU-029", "name": "Nisha Kumari", "class_": "10", "section": "B", "gender": "F"},
    {"id": "STU-030", "name": "Karan Rathore", "class_": "10", "section": "A", "gender": "M"},
    {"id": "STU-031", "name": "Mamta Sharma", "class_": "10", "section": "B", "gender": "F"},
    {"id": "STU-032", "name": "Pankaj Soni", "class_": "10", "section": "A", "gender": "M"},
]

# Risk profiles — some students are deliberately at-risk for realistic triage
RISK_PROFILES = {
    # Critical risk students
    "STU-006": {"level": "critical", "score": 0.88, "attendance_base": 45, "marks_base": 32},
    "STU-014": {"level": "critical", "score": 0.82, "attendance_base": 50, "marks_base": 35},
    "STU-021": {"level": "critical", "score": 0.85, "attendance_base": 42, "marks_base": 30},
    "STU-028": {"level": "critical", "score": 0.80, "attendance_base": 48, "marks_base": 38},
    # High risk students
    "STU-003": {"level": "high", "score": 0.72, "attendance_base": 58, "marks_base": 42},
    "STU-010": {"level": "high", "score": 0.68, "attendance_base": 62, "marks_base": 45},
    "STU-017": {"level": "high", "score": 0.70, "attendance_base": 55, "marks_base": 40},
    "STU-025": {"level": "high", "score": 0.66, "attendance_base": 60, "marks_base": 48},
    "STU-031": {"level": "high", "score": 0.65, "attendance_base": 63, "marks_base": 46},
    # Moderate risk students
    "STU-002": {"level": "moderate", "score": 0.52, "attendance_base": 72, "marks_base": 55},
    "STU-009": {"level": "moderate", "score": 0.48, "attendance_base": 74, "marks_base": 58},
    "STU-016": {"level": "moderate", "score": 0.50, "attendance_base": 70, "marks_base": 52},
    "STU-023": {"level": "moderate", "score": 0.45, "attendance_base": 76, "marks_base": 56},
    "STU-029": {"level": "moderate", "score": 0.47, "attendance_base": 73, "marks_base": 54},
}

SUBJECTS = ["Mathematics", "Science", "English", "Hindi", "Social Science"]
ASSESSMENT_TYPES = ["exam", "quiz", "assignment", "unit_test"]


def seed_database():
    print("=" * 60)
    print("EduShield AI — Full Operational Data Seeding")
    print("=" * 60)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Clear existing data
        print("\n[1/7] Clearing existing data...")
        for model in [Alert, Intervention, RiskPrediction, Performance,
                      Attendance, EngagementLog, HomeworkSubmission,
                      TeacherWorkload, Teacher, Student]:
            db.query(model).delete()
        db.commit()

        # 2. Seed Teachers
        print("[2/7] Seeding teachers (3 teachers with 30-day workload)...")
        teachers_data = [
            {"id": "TCH-001", "name": "Sunita Sharma", "subject": "Mathematics", "classes": "8-A, 8-B, 9-A, 9-B"},
            {"id": "TCH-002", "name": "Rajesh Kumar", "subject": "Science", "classes": "7-A, 7-B, 8-A"},
            {"id": "TCH-003", "name": "Meenakshi Iyer", "subject": "English", "classes": "6-A, 6-B, 7-A, 7-B, 8-A"},
        ]

        db_teachers = {}
        for td in teachers_data:
            t_uuid = str(uuid.uuid4())
            teacher = Teacher(
                id=t_uuid,
                teacher_id=td["id"],
                name=td["name"],
                subject=td["subject"],
                classes_assigned=td["classes"],
                email=f"{td['name'].split()[0].lower()}@school.edu",
                hashed_password=pwd_context.hash("demo-pass-123"),
                is_active=True,
            )
            db.add(teacher)
            db_teachers[td["id"]] = t_uuid

            # Add 30 days of workload data
            for i in range(30):
                workload_date = date.today() - timedelta(days=i)
                if workload_date.weekday() >= 5:  # Skip weekends
                    continue
                wl = TeacherWorkload(
                    id=str(uuid.uuid4()),
                    teacher_id=t_uuid,
                    date=workload_date,
                    classes_taught=random.randint(3, 6),
                    assignments_corrected=random.randint(20, 80),
                    hours_worked=random.uniform(6.0, 10.0),
                    stress_level=random.choice(["low", "moderate", "high"]),
                    burnout_score=random.uniform(0.3, 0.9),
                )
                db.add(wl)

        db.commit()

        # 3. Seed Students
        print(f"[3/7] Seeding {len(STUDENTS_DATA)} students across classes 6-10...")
        student_uuids = {}
        for sd in STUDENTS_DATA:
            s_uuid = str(uuid.uuid4())
            student = Student(
                id=s_uuid,
                student_id=sd["id"],
                name=sd["name"],
                class_=sd["class_"],
                section=sd["section"],
                gender=sd["gender"],
                phone=f"+91 98765{random.randint(10000, 99999)}",
                enrollment_date=date(2025, 4, 1),
                is_active=True,
            )
            db.add(student)
            student_uuids[sd["id"]] = s_uuid

        db.commit()

        # 4. Seed Attendance (30 days per student)
        print("[4/7] Seeding 30 days of attendance records...")
        for sd in STUDENTS_DATA:
            s_uuid = student_uuids[sd["id"]]
            profile = RISK_PROFILES.get(sd["id"])
            att_rate = profile["attendance_base"] if profile else random.randint(80, 95)

            for i in range(30):
                att_date = date.today() - timedelta(days=i)
                if att_date.weekday() >= 5:
                    continue

                # Probability of being present based on profile
                is_present = random.randint(1, 100) <= att_rate
                status = "present" if is_present else random.choice(["absent", "absent", "late"])

                record = Attendance(
                    id=str(uuid.uuid4()),
                    student_id=s_uuid,
                    date=att_date,
                    status=status,
                    reason="Sick leave" if status == "absent" and random.random() < 0.3 else None,
                )
                db.add(record)

        db.commit()

        # 5. Seed Performance (3 assessments per student per subject)
        print("[5/7] Seeding assessment records...")
        for sd in STUDENTS_DATA:
            s_uuid = student_uuids[sd["id"]]
            profile = RISK_PROFILES.get(sd["id"])
            marks_base = profile["marks_base"] if profile else random.randint(65, 90)

            for subject in SUBJECTS:
                for j, a_type in enumerate(["unit_test", "midterm", "quiz"]):
                    max_marks = 100.0 if a_type == "midterm" else 50.0
                    obtained = min(max_marks, max(5, marks_base + random.randint(-15, 15)))
                    if max_marks == 50:
                        obtained = min(50, obtained * 0.5)

                    perf = Performance(
                        id=str(uuid.uuid4()),
                        student_id=s_uuid,
                        subject=subject,
                        assessment_type=a_type,
                        assessment_name=f"{subject} {a_type.replace('_', ' ').title()}",
                        max_marks=max_marks,
                        obtained_marks=round(obtained, 1),
                        assessment_date=date.today() - timedelta(days=15 * (j + 1)),
                    )
                    db.add(perf)

        db.commit()

        # 6. Seed Engagement Logs (20 days)
        print("[6/7] Seeding engagement and risk predictions...")
        for sd in STUDENTS_DATA:
            s_uuid = student_uuids[sd["id"]]
            profile = RISK_PROFILES.get(sd["id"])

            # Engagement logs
            for i in range(20):
                eng_date = date.today() - timedelta(days=i)
                if eng_date.weekday() >= 5:
                    continue

                base_participation = 0.3 if profile and profile["level"] == "critical" else \
                                     0.45 if profile and profile["level"] == "high" else \
                                     0.6 if profile and profile["level"] == "moderate" else 0.75

                log = EngagementLog(
                    id=str(uuid.uuid4()),
                    student_id=s_uuid,
                    date=eng_date,
                    participation_score=round(min(1.0, base_participation + random.uniform(-0.15, 0.15)), 3),
                    questions_asked=random.randint(0, 3) if not profile else random.randint(0, 1),
                    class_interaction_level=random.choice(["high", "medium", "low"]),
                    focus_level=random.choice(["high", "medium", "distracted"]),
                    mood_observed=random.choice(["happy", "neutral", "sad", "anxious"]),
                )
                db.add(log)

            # Risk predictions
            risk_level = profile["level"] if profile else "low"
            risk_score = profile["score"] if profile else random.uniform(0.05, 0.30)

            factors = {}
            if profile:
                factors = {
                    "attendance_decline": round(random.uniform(0.5, 0.9), 2),
                    "grade_regression": round(random.uniform(0.4, 0.8), 2),
                    "engagement_drop": round(random.uniform(0.3, 0.7), 2),
                }

            rp = RiskPrediction(
                id=str(uuid.uuid4()),
                student_id=s_uuid,
                prediction_date=date.today(),
                risk_level=risk_level,
                risk_score=round(risk_score, 3),
                confidence_score=round(random.uniform(0.75, 0.95), 3),
                risk_category="dropout" if risk_level in ["critical", "high"] else "engagement",
                contributing_factors=json.dumps(factors) if factors else None,
                is_active=True,
            )
            db.add(rp)

        db.commit()

        # 7. Seed Interventions for at-risk students
        print("[7/7] Seeding interventions and alerts...")
        intervention_types = [
            "Parent Communication", "Peer Buddy Assignment", "Counseling Referral",
            "Attendance Recovery Plan", "Personalized Revision Plan",
        ]

        at_risk_ids = [sid for sid in RISK_PROFILES.keys()]
        teacher_ids = list(db_teachers.values())

        for i, sid in enumerate(at_risk_ids[:8]):
            s_uuid = student_uuids[sid]
            profile = RISK_PROFILES[sid]

            status_choices = ["recommended", "planned", "in_progress"]
            interv = Intervention(
                id=str(uuid.uuid4()),
                student_id=s_uuid,
                intervention_type=random.choice(intervention_types),
                priority=profile["level"],
                status=random.choice(status_choices),
                recommended_by="ai_system",
                assigned_to=random.choice(teacher_ids),
                recommended_action=f"AI-recommended action for {sid} based on {profile['level']} risk indicators.",
                scheduled_date=date.today() - timedelta(days=random.randint(-5, 5)),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
            )
            db.add(interv)

        # Seed a few alerts
        for sid in at_risk_ids[:4]:
            s_uuid = student_uuids[sid]
            student = db.query(Student).filter(Student.id == s_uuid).first()
            profile = RISK_PROFILES[sid]

            alert = Alert(
                id=str(uuid.uuid4()),
                alert_type="student_risk",
                severity=profile["level"],
                entity_type="student",
                entity_id=s_uuid,
                title=f"{student.name} at {profile['level'].upper()} risk",
                message=f"Risk score {profile['score']:.0%}. Attendance at {profile['attendance_base']}%, marks averaging {profile['marks_base']}%.",
                is_read=False,
                is_resolved=False,
            )
            db.add(alert)

        db.commit()

        # Summary
        print("\n" + "=" * 60)
        print("DATABASE SEEDED SUCCESSFULLY")
        print("=" * 60)
        print(f"  Teachers:           {len(teachers_data)}")
        print(f"  Students:           {len(STUDENTS_DATA)}")
        print(f"  Attendance records: ~{len(STUDENTS_DATA) * 22}")
        print(f"  Assessments:        ~{len(STUDENTS_DATA) * len(SUBJECTS) * 3}")
        print(f"  Engagement logs:    ~{len(STUDENTS_DATA) * 15}")
        print(f"  Risk predictions:   {len(STUDENTS_DATA)}")
        print(f"  Interventions:      8")
        print(f"  Alerts:             4")
        print(f"\n  Critical risk:      {sum(1 for p in RISK_PROFILES.values() if p['level'] == 'critical')}")
        print(f"  High risk:          {sum(1 for p in RISK_PROFILES.values() if p['level'] == 'high')}")
        print(f"  Moderate risk:      {sum(1 for p in RISK_PROFILES.values() if p['level'] == 'moderate')}")
        print(f"  Low/Stable:         {len(STUDENTS_DATA) - len(RISK_PROFILES)}")
        print("=" * 60)
        print("\nLogin credentials:")
        print("  Teacher:  TCH-001 / demo-pass-123")
        print("  Admin:    RJ-JPR-2026 / demo-pass-123")

    except Exception as e:
        db.rollback()
        print(f"\nERROR seeding database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
