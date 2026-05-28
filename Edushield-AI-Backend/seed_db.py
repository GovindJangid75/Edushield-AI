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

def seed_database():
    print("Starting database seeding...")
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. Clear existing data
        print("Clearing existing data...")
        db.query(TeacherWorkload).delete()
        db.query(RiskPrediction).delete()
        db.query(Performance).delete()
        db.query(Teacher).delete()
        db.query(Student).delete()
        db.commit()

        # 2. Seed Teachers
        print("Seeding Teachers...")
        teachers_data = [
            {"id": "TCH-001", "name": "Sunita Sharma", "subject": "Mathematics", "classes": "8-A, 8-B, 9-A, 9-B"},
            {"id": "TCH-002", "name": "Rajesh Kumar", "subject": "Science", "classes": "7-A, 7-B, 8-A"},
            {"id": "TCH-003", "name": "Meenakshi Iyer", "subject": "English", "classes": "6-A, 6-B, 7-A, 7-B, 8-A"}
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
                hashed_password="hashed_dummy",
                is_active=True
            )
            db.add(teacher)
            db_teachers[td["id"]] = t_uuid
            
            # Add Workloads for burnout calculation
            for i in range(30):
                workload_date = date.today() - timedelta(days=i)
                wl = TeacherWorkload(
                    id=str(uuid.uuid4()),
                    teacher_id=t_uuid,
                    date=workload_date,
                    classes_taught=random.randint(3, 6),
                    assignments_corrected=random.randint(20, 80),
                    hours_worked=random.uniform(6.0, 10.0),
                    stress_level=random.choice(["low", "moderate", "high"]),
                    burnout_score=random.uniform(0.3, 0.9)
                )
                db.add(wl)

        # 3. Seed Students
        print("Seeding Students...")
        students_data = [
            {"id": "STU-001", "name": "Jyoti Ansari", "class_": "7", "section": "A"},
            {"id": "STU-002", "name": "Suman Mishra", "class_": "6", "section": "A"},
            {"id": "STU-003", "name": "Rekha Deshmukh", "class_": "10", "section": "B"}
        ]
        
        for sd in students_data:
            s_uuid = str(uuid.uuid4())
            student = Student(
                id=s_uuid,
                student_id=sd["id"],
                name=sd["name"],
                class_=sd["class_"],
                section=sd["section"],
                is_active=True
            )
            db.add(student)
            
            # Add Risk Predictions
            rp = RiskPrediction(
                id=str(uuid.uuid4()),
                student_id=s_uuid,
                prediction_date=date.today(),
                risk_level="high" if sd["id"] == "STU-001" else "moderate",
                risk_score=random.uniform(0.4, 0.9),
                confidence_score=random.uniform(0.7, 0.95),
                risk_category="dropout",
                contributing_factors=json.dumps({"attendance_drop": 0.8, "low_grades": 0.6})
            )
            db.add(rp)
            
            # Add Performance
            perf = Performance(
                id=str(uuid.uuid4()),
                student_id=s_uuid,
                subject="Mathematics",
                assessment_type="exam",
                assessment_name="Midterm",
                max_marks=100.0,
                obtained_marks=random.uniform(40.0, 95.0),
                assessment_date=date.today() - timedelta(days=15)
            )
            db.add(perf)

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
