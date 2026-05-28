# app/schemas/intervention.py
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class InterventionBase(BaseModel):
    student_id: UUID
    intervention_type: str
    priority: str
    recommended_action: str
    scheduled_date: Optional[date] = None

class InterventionCreate(InterventionBase):
    assigned_to: Optional[UUID] = None

class InterventionUpdate(BaseModel):
    status: Optional[str] = None
    action_taken: Optional[str] = None
    completed_date: Optional[date] = None
    outcome: Optional[str] = None
    outcome_notes: Optional[str] = None

class InterventionResponse(InterventionBase):
    id: UUID
    status: str
    recommended_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
