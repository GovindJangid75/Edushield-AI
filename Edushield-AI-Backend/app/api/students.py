# app/api/students.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid, datetime as dt

from app.database import get_db
from app.models.student import Student
from app.models.attendance import Attendance
from app.models.performance import Performance
from app.models.risk_predictions import RiskPrediction
from app.schemas.student import StudentCreate, StudentResponse
from app.ai_engine.dropout_detector import SilentDropoutDetector
from app.ai_engine.hidden_student_detector import HiddenStudentDetector
from app.ai_engine.risk_categorizer import RiskCategorizer
from app.ai_engine.intervention_recommender import InterventionRecommender
from app.ai_engine.explainable_ai import ExplainableAI

router = APIRouter()
dropout_detector = SilentDropoutDetector()
hidden_detector = HiddenStudentDetector()
risk_categorizer = RiskCategorizer()
intervention_recommender = InterventionRecommender()
explainable_ai = ExplainableAI()


def _build_student_data(student: Student, db: Session) -> dict:
    cutoff = (datetime.now() - timedelta(days=90)).date()
    attendance_records = db.query(Attendance).filter(
        Attendance.student_id == student.id,
        Attendance.date >= cutoff
    ).order_by(Attendance.date).all()
    performance_records = db.query(Performance).filter(
        Performance.student_id == student.id
    ).order_by(Performance.assessment_date).all()
    return {
        'student_id': str(student.id),
        'student_info': {'name': student.name, 'class': student.class_},
        'attendance': [
            {'date': r.date, 'status': r.status, 'reason': r.reason}
            for r in attendance_records
        ],
        'performance': [
            {
                'subject': r.subject,
                'assessment_type': r.assessment_type,
                'max_marks': float(r.max_marks) if r.max_marks else 0,
                'obtained_marks': float(r.obtained_marks) if r.obtained_marks else 0,
                'assessment_date': r.assessment_date,
            }
            for r in performance_records
        ],
        'homework': [], 'engagement': [], 'observations': [],
    }


def _find_student(student_id: str, db: Session) -> Student:
    student = db.query(Student).filter(
        (Student.id == student_id) | (Student.student_id == student_id)
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(Student.student_id == student.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    data = student.dict(by_alias=True)
    if 'class' in data:
        data['class_'] = data.pop('class')
    db_student = Student(id=str(uuid.uuid4()), **data)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.get("/at-risk/list")
def get_at_risk_students(risk_level: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(RiskPrediction, Student).join(
        Student, RiskPrediction.student_id == Student.id
    ).filter(RiskPrediction.is_active == True, RiskPrediction.risk_level != 'stable')
    if risk_level:
        query = query.filter(RiskPrediction.risk_level == risk_level)
    results = query.order_by(RiskPrediction.risk_score.desc()).all()
    return {
        'total': len(results),
        'students': [
            {
                'student_id': s.student_id, 'name': s.name, 'class': s.class_,
                'risk_level': r.risk_level,
                'risk_score': float(r.risk_score) if r.risk_score else 0,
                'prediction_date': r.prediction_date.isoformat(),
            }
            for r, s in results
        ]
    }


@router.get("/", response_model=List[StudentResponse])
def list_students(skip: int = 0, limit: int = 100, class_: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Student).filter(Student.is_active == True)
    if class_:
        query = query.filter(Student.class_ == class_)
    return query.offset(skip).limit(limit).all()


@router.get("/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = _find_student(student_id, db)
    attendance_records = db.query(Attendance).filter(
        Attendance.student_id == student.id
    ).order_by(Attendance.date.desc()).limit(30).all()
    performance_records = db.query(Performance).filter(
        Performance.student_id == student.id
    ).order_by(Performance.assessment_date.desc()).limit(20).all()
    latest_risk = db.query(RiskPrediction).filter(
        RiskPrediction.student_id == student.id, RiskPrediction.is_active == True
    ).order_by(RiskPrediction.created_at.desc()).first()
    return {
        'student': student,
        'attendance_records': attendance_records,
        'performance_records': performance_records,
        'latest_risk_assessment': {
            'risk_level': latest_risk.risk_level,
            'risk_score': float(latest_risk.risk_score) if latest_risk.risk_score else None,
            'prediction_date': latest_risk.prediction_date.isoformat(),
        } if latest_risk else None,
    }


@router.post("/{student_id}/assess-risk")
def assess_student_risk(student_id: str, db: Session = Depends(get_db)):
    student = _find_student(student_id, db)
    student_data = _build_student_data(student, db)
    dropout_risk = dropout_detector.predict_risk(student_data)
    hidden_patterns = hidden_detector.detect_hidden_patterns(student_data)
    triage = risk_categorizer.categorize_risk(dropout_risk, hidden_patterns)
    interventions = intervention_recommender.recommend_interventions(dropout_risk, hidden_patterns, triage)
    explanation = explainable_ai.generate_explanation(dropout_risk, hidden_patterns, student_data)
    db.query(RiskPrediction).filter(
        RiskPrediction.student_id == student.id, RiskPrediction.is_active == True
    ).update({'is_active': False})
    risk_record = RiskPrediction(
        id=str(uuid.uuid4()),
        student_id=student.id,
        prediction_date=datetime.now().date(),
        risk_level=triage.get('category', 'stable'),
        risk_score=dropout_risk.get('risk_score', 0),
        confidence_score=dropout_risk.get('confidence', 0),
        risk_category='dropout',
        contributing_factors=dropout_risk.get('factors', {}),
        reasoning=dropout_risk.get('reasoning', ''),
        prediction_horizon_days=30,
        model_version='1.0.0',
        is_active=True,
    )
    db.add(risk_record)
    db.commit()
    db.refresh(risk_record)
    return {
        'student_id': student.student_id,
        'student_name': student.name,
        'assessment_date': datetime.now().isoformat(),
        'dropout_risk': dropout_risk,
        'hidden_patterns': hidden_patterns,
        'triage': triage,
        'interventions': interventions,
        'explanation': explanation,
        'risk_record_id': str(risk_record.id),
    }


@router.post("/{student_id}/attendance")
def add_attendance(student_id: str, date: str, status: str, reason: Optional[str] = None, db: Session = Depends(get_db)):
    student = _find_student(student_id, db)
    parsed_date = dt.date.fromisoformat(date)
    existing = db.query(Attendance).filter(
        Attendance.student_id == student.id, Attendance.date == parsed_date
    ).first()
    if existing:
        existing.status = status
        existing.reason = reason
        db.commit()
        return {"message": "Attendance updated", "date": date}
    record = Attendance(id=str(uuid.uuid4()), student_id=student.id, date=parsed_date, status=status, reason=reason)
    db.add(record)
    db.commit()
    return {"message": "Attendance recorded", "date": date, "status": status}


@router.post("/{student_id}/performance")
def add_performance(
    student_id: str, subject: str, assessment_type: str, assessment_name: str,
    max_marks: float, obtained_marks: float, assessment_date: str,
    db: Session = Depends(get_db)
):
    student = _find_student(student_id, db)
    record = Performance(
        id=str(uuid.uuid4()), student_id=student.id, subject=subject,
        assessment_type=assessment_type, assessment_name=assessment_name,
        max_marks=max_marks, obtained_marks=obtained_marks,
        assessment_date=dt.date.fromisoformat(assessment_date)
    )
    db.add(record)
    db.commit()
    return {"message": "Performance record added", "percentage": round((obtained_marks / max_marks) * 100, 2) if max_marks else 0}
