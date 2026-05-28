# app/api/teachers.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app.models.teacher import Teacher
from app.models.interventions import Intervention
from app.models.teacher_workload import TeacherWorkload
from app.schemas.teacher import TeacherCreate, TeacherResponse
from app.api.auth import get_current_user, get_password_hash
from app.ai_engine.teacher_burnout_analyzer import TeacherBurnoutAnalyzer

router = APIRouter()
burnout_analyzer = TeacherBurnoutAnalyzer()


@router.post("/", response_model=TeacherResponse)
def create_teacher(teacher: TeacherCreate, db: Session = Depends(get_db)):
    existing = db.query(Teacher).filter(Teacher.teacher_id == teacher.teacher_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Teacher ID already exists")
    db_teacher = Teacher(
        **teacher.dict(exclude={'password'}),
        hashed_password=get_password_hash(teacher.password)
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher


@router.get("/", response_model=List[TeacherResponse])
def list_teachers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Teacher).filter(Teacher.is_active == True).offset(skip).limit(limit).all()


@router.get("/{teacher_id}/dashboard")
def get_teacher_dashboard(
    teacher_id: str,
    db: Session = Depends(get_db),
    current_user: Teacher = Depends(get_current_user)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    pending_interventions = db.query(Intervention).filter(
        Intervention.assigned_to == teacher.id,
        Intervention.status.in_(['recommended', 'planned', 'in_progress'])
    ).all()
    seven_days_ago = datetime.now() - timedelta(days=7)
    recent_workload = db.query(TeacherWorkload).filter(
        TeacherWorkload.teacher_id == teacher.id,
        TeacherWorkload.date >= seven_days_ago.date()
    ).all()
    return {
        'teacher': teacher,
        'pending_interventions': len(pending_interventions),
        'interventions': pending_interventions[:5],
        'recent_workload': recent_workload,
        'today_date': datetime.now().date().isoformat()
    }


@router.get("/{teacher_id}/burnout-analysis")
def analyze_teacher_burnout(teacher_id: str, db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    workload = db.query(TeacherWorkload).filter(
        TeacherWorkload.teacher_id == teacher.id
    ).order_by(TeacherWorkload.date.desc()).limit(60).all()
    interventions = db.query(Intervention).filter(
        Intervention.assigned_to == teacher.id
    ).all()
    at_risk_count = db.query(Intervention).filter(
        Intervention.assigned_to == teacher.id,
        Intervention.status != 'completed'
    ).count()
    teacher_data = {
        'teacher_id': str(teacher.id),
        'name': teacher.name,
        'workload': [
            {
                'date': w.date,
                'classes_taught': w.classes_taught,
                'assignments_corrected': w.assignments_corrected,
                'interventions_handled': w.interventions_handled,
                'hours_worked': float(w.hours_worked) if w.hours_worked else 8.0,
                'stress_level': w.stress_level
            }
            for w in workload
        ],
        'interventions_handled': [
            {'status': i.status, 'outcome': i.outcome, 'completed_date': i.completed_date}
            for i in interventions
        ],
        'at_risk_students_count': at_risk_count
    }
    analysis = burnout_analyzer.analyze_burnout_risk(teacher_data)
    return {
        'teacher_id': str(teacher.id),
        'teacher_name': teacher.name,
        'burnout_analysis': analysis
    }


@router.post("/{teacher_id}/workload")
def log_daily_workload(
    teacher_id: str,
    classes_taught: int,
    assignments_corrected: int,
    hours_worked: float,
    stress_level: str,
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    today = datetime.now().date()
    existing = db.query(TeacherWorkload).filter(
        TeacherWorkload.teacher_id == teacher.id,
        TeacherWorkload.date == today
    ).first()
    if existing:
        existing.classes_taught = classes_taught
        existing.assignments_corrected = assignments_corrected
        existing.hours_worked = hours_worked
        existing.stress_level = stress_level
    else:
        workload = TeacherWorkload(
            id=str(uuid.uuid4()),
            teacher_id=teacher.id,
            date=today,
            classes_taught=classes_taught,
            assignments_corrected=assignments_corrected,
            hours_worked=hours_worked,
            stress_level=stress_level
        )
        db.add(workload)
    db.commit()
    return {"message": "Workload logged successfully", "date": today.isoformat()}
