# app/api/interventions.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.database import get_db
from app.models.interventions import Intervention
from app.models.student import Student
from app.schemas.intervention import InterventionCreate, InterventionUpdate, InterventionResponse
from app.services.alert_service import AlertService

router = APIRouter()
alert_service = AlertService()


@router.post("/", response_model=InterventionResponse)
def create_intervention(
    intervention: InterventionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    db_intervention = Intervention(
        id=str(uuid.uuid4()),
        **intervention.dict(),
        recommended_by='teacher',
        status='planned'
    )
    db.add(db_intervention)
    db.commit()
    db.refresh(db_intervention)
    if intervention.assigned_to:
        background_tasks.add_task(alert_service.create_intervention_alert, db_intervention, db)
    return db_intervention


@router.get("/", response_model=List[InterventionResponse])
def list_interventions(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Intervention)
    if status:
        query = query.filter(Intervention.status == status)
    if priority:
        query = query.filter(Intervention.priority == priority)
    return query.order_by(
        Intervention.created_at.desc()
    ).offset(skip).limit(limit).all()


@router.get("/student/{student_id}")
def get_student_interventions(student_id: str, db: Session = Depends(get_db)):
    interventions = db.query(Intervention).filter(
        Intervention.student_id == student_id
    ).order_by(Intervention.created_at.desc()).all()
    return {'student_id': student_id, 'total_interventions': len(interventions), 'interventions': interventions}


@router.get("/teacher/{teacher_id}/assigned")
def get_teacher_assigned_interventions(
    teacher_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Intervention).filter(Intervention.assigned_to == teacher_id)
    if status:
        query = query.filter(Intervention.status == status)
    interventions = query.order_by(Intervention.scheduled_date).all()
    grouped = {'recommended': [], 'planned': [], 'in_progress': [], 'completed': []}
    for intervention in interventions:
        if intervention.status in grouped:
            student = db.query(Student).filter(Student.id == intervention.student_id).first()
            grouped[intervention.status].append({'intervention': intervention, 'student': student})
    return {'teacher_id': teacher_id, 'total_assigned': len(interventions), 'grouped_by_status': grouped}


@router.get("/{intervention_id}", response_model=InterventionResponse)
def get_intervention(intervention_id: str, db: Session = Depends(get_db)):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
    return intervention


@router.patch("/{intervention_id}", response_model=InterventionResponse)
def update_intervention(
    intervention_id: str,
    update_data: InterventionUpdate,
    db: Session = Depends(get_db)
):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(intervention, field, value)
    intervention.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(intervention)
    return intervention


@router.post("/{intervention_id}/complete")
def mark_intervention_complete(
    intervention_id: str,
    outcome: str,
    outcome_notes: str,
    db: Session = Depends(get_db)
):
    intervention = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
    intervention.status = 'completed'
    intervention.completed_date = datetime.now().date()
    intervention.outcome = outcome
    intervention.outcome_notes = outcome_notes
    intervention.updated_at = datetime.utcnow()
    db.commit()
    return {'message': 'Intervention marked as completed', 'intervention_id': str(intervention.id), 'outcome': outcome}
