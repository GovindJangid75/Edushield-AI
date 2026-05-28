# app/models/interventions.py
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text
from datetime import datetime
import uuid

from app.database import Base


class Intervention(Base):
    __tablename__ = "interventions"

    id                          = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id                  = Column(String(36), ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    risk_prediction_id          = Column(String(36), ForeignKey('risk_predictions.id'), nullable=True)
    intervention_type           = Column(String(100))
    priority                    = Column(String(20))   # critical, high, medium, low
    status                      = Column(String(50), default='recommended')  # recommended, planned, in_progress, completed, dismissed
    recommended_by              = Column(String(50), default='ai_system')    # ai_system, teacher, admin
    assigned_to                 = Column(String(36), ForeignKey('teachers.id'), nullable=True)
    recommended_action          = Column(Text)
    action_taken                = Column(Text)
    scheduled_date              = Column(Date)
    completed_date              = Column(Date)
    outcome                     = Column(String(50))   # successful, partially_successful, unsuccessful, ongoing
    outcome_notes               = Column(Text)
    ai_recommendation_reasoning = Column(Text)
    created_at                  = Column(DateTime, default=datetime.utcnow)
    updated_at                  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
